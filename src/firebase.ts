import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  sendEmailVerification,
  reload
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  Timestamp,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { Problem } from "./api";
import {
  getStorage,
  ref,
  uploadBytes
} from "firebase/storage";

// Firebase 설정 (환경변수에서 개별 값만 정적 참조 - 전체 env destructure 금지)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 불필요한 Firebase 서비스 비활성화 (Realtime Database, Analytics, Messaging 등)
// Firestore, Auth, Storage만 사용
if (typeof window !== 'undefined') {
  // 브라우저 환경에서만 실행
  // Analytics, Messaging 등의 자동 초기화를 방지
}

// Admin functions are verified on server.js via /api/admin/* endpoints

/**
 * Admin 통계 조회
 * 주: 클라이언트는 이미 isAdmin 상태로 검증되었으므로 서버 재검증 불필요
 */
export async function getAdminStatsSecure(_email: string | null): Promise<{
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
}> {
  try {
    return await getAdminStats();
  } catch (error) {
    return {
      totalUsers: 0,
      paidUsers: 0,
      freeUsers: 0
    };
  }
}

/**
 * 모든 사용자 목록 조회
 * 주: 클라이언트는 이미 isAdmin 상태로 검증되었으므로 서버 재검증 불필요
 */
export async function getAllUsersForAdminSecure(_email: string | null): Promise<Array<{
  userId: string;
  email: string;
  userStatus: string;
  createdAt: string;
}>> {
  try {
    return await getAllUsersForAdmin();
  } catch (error) {
    return [];
  }
}

/**
 * 특정 사용자의 문제 세션 조회
 * 주: 클라이언트는 이미 isAdmin 상태로 검증되었으므로 서버 재검증 불필요
 */
export async function getUserProblemSessionsSecure(_email: string | null, userId: string): Promise<Array<{
  date: string;
  time: string;
  problemCount: number;
  difficulty: string;
  problems: any[];
  sessionTimestamp: number;
}>> {
  try {
    return await getUserProblemSessions(userId);
  } catch (error) {
    return [];
  }
}

// 로컬 저장소에 세션 유지
setPersistence(auth, browserLocalPersistence);

// ===== 인증 함수 =====

/**
 * 이메일/비밀번호로 회원가입
 */
export async function signUp(email: string, password: string, displayName: string = ""): Promise<User> {
  try {
    // 백엔드 검증
    if (!email || email.length > 254) {
      throw new Error("유효한 이메일을 입력하세요");
    }
    if (password.length < 6 || password.length > 128) {
      throw new Error("비밀번호는 6자 이상 128자 이하여야 합니다");
    }
    if (displayName.length > 100) {
      throw new Error("이름은 100자 이하여야 합니다");
    }

    const signInMethods = await getSignInMethodsSafely(email);
    // Google 전용 계정인 경우에만 링크 시도 (새 이메일은 바로 가입)
    if (signInMethods.includes("google.com") && !signInMethods.includes("password")) {
      return await signInWithGoogleAndLinkPassword(email, password);
    }

    if (signInMethods.includes("password")) {
      const err = new Error("email-already-in-use");
      (err as any).code = "auth/email-already-in-use";
      throw err;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Firebase 기본 이메일 인증 메일 발송 (AWS SES 고객 지원 응답 대기 중 임시 전환)
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/?emailVerified=true`
      });
    } catch (error: any) {
      // 이메일 발송 실패해도 계정은 생성됨
    }

    return user;
  } catch (error: any) {
    if (error?.code === "auth/email-already-in-use") {
      // 이미 가입된 이메일인 경우 - 인증 메일 재발송 모달 표시
      // oob 코드를 요청하려고 시도 (다시 인증 링크 보내기용)
      try {
        const methods = await getSignInMethodsSafely(email);
        // Google 전용 계정인 경우
        if (methods.includes("google.com") && !methods.includes("password")) {
          throw new Error("이 이메일은 현재 Google 로그인으로만 연결되어 있습니다. Google로 로그인한 뒤 비밀번호를 연결해주세요.");
        }
      } catch (methodCheckError: any) {
        // 메서드 확인 실패 시 무시하고 계속 진행
      }

      // 이메일/비밀번호로도 가입된 경우 - 인증 메일 재발송 가능
      // 오류 코드를 유지해서 web-app에서 감지하도록
      const err = new Error("email-already-in-use");
      (err as any).code = "auth/email-already-in-use";
      throw err;
    }
    throw new Error(getErrorMessage(error.code));
  }
}

/**
 * 이메일/비밀번호로 로그인
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    // 백엔드 검증
    if (!email || email.length > 254) {
      throw new Error("유효한 이메일을 입력하세요");
    }
    if (password.length < 6 || password.length > 128) {
      throw new Error("비밀번호는 6자 이상 128자 이하여야 합니다");
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    const code = error?.code || "";

    if (
      code === "auth/user-not-found" ||
      code === "auth/wrong-password" ||
      code === "auth/invalid-login-credentials"
    ) {
      const methods = await getSignInMethodsSafely(email);
      if (methods.includes("google.com") && !methods.includes("password")) {
        throw new Error("이 계정은 현재 Google 로그인으로만 연결되어 있습니다. 아래 'Google로 계속'을 사용한 뒤 계정 메뉴에서 비밀번호를 연결해주세요.");
      }
    }

    throw new Error(getErrorMessage(code || error?.message || ""));
  }
}

/**
 * 로그아웃
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error("로그아웃에 실패했습니다");
  }
}

/**
 * 현재 로그인 사용자 가져오기
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * 사용자 정보 새로고침 (이메일 검증 상태 확인용)
 */
export async function refreshUserData(): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await reload(user);
  }
}

/**
 * 이메일 검증 링크 재발송
 */
export async function resendEmailVerification(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not found. Please try again.");
  }

  try {
    // ✅ Firebase 기본 이메일 인증 메일 재발송 (AWS SES 고객 지원 응답 대기 중 임시 전환)
    await sendEmailVerification(user, {
      url: `${window.location.origin}/?emailVerified=true`
    });
  } catch (error: any) {
    // Firebase rate limiting 오류 처리
    if (error?.code === 'auth/too-many-requests' || error?.message?.includes('too-many-requests')) {
      const err = new Error("email-verification-too-many-requests");
      (err as any).code = "email-verification-too-many-requests";
      throw err;
    }

    throw new Error(error?.message || "Failed to send verification email");
  }
}

/**
 * 인증 상태 감시
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Google로 로그인/회원가입
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error: any) {
    const code = error?.code || "unknown";
    throw new Error(`${code}: ${getErrorMessage(code)}`);
  }
}

async function signInWithGoogleAndLinkPassword(email: string, password: string): Promise<User> {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  if (!user.email || user.email.toLowerCase() !== email.toLowerCase()) {
    await firebaseSignOut(auth);
    throw new Error("같은 이메일의 Google 계정을 선택해주세요.");
  }

  if (!isPasswordLinked(user)) {
    const credential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(user, credential);
  }

  return user;
}

function getLinkedProviders(user: User | null | undefined): string[] {
  if (!user) return [];
  return user.providerData
    .map((provider) => provider?.providerId)
    .filter((providerId): providerId is string => Boolean(providerId));
}

async function getSignInMethodsSafely(email: string): Promise<string[]> {
  try {
    return await fetchSignInMethodsForEmail(auth, email);
  } catch {
    return [];
  }
}

export function isPasswordLinked(_user: User | null | undefined = auth.currentUser): boolean {
  // Cognito 사용자는 항상 password 인증 가능
  return true;
}

export async function linkEmailPasswordToCurrentUser(password: string): Promise<void> {
  const user = auth.currentUser;
  const email = user?.email;

  if (!user || !email) {
    throw new Error("로그인된 사용자를 찾을 수 없습니다. 먼저 로그인해주세요.");
  }

  if (password.length < 6 || password.length > 128) {
    throw new Error("비밀번호는 6자 이상 128자 이하여야 합니다.");
  }

  if (isPasswordLinked(user)) {
    return;
  }

  try {
    const credential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(user, credential);
  } catch (error: any) {
    if (error?.code === "auth/provider-already-linked") {
      return;
    }
    throw new Error(getErrorMessage(error.code));
  }
}

/**
 * Firebase 에러 메시지 한글화
 */
function getLocale(): string {
  try {
    const saved = localStorage.getItem('locale') || localStorage.getItem('landingPageLocale');
    if (saved && ['ko', 'en', 'ja'].includes(saved)) return saved;
    const lang = navigator.language.substring(0, 2);
    if (lang === 'ja') return 'ja';
    if (lang === 'ko') return 'ko';
    return 'en';
  } catch { return 'ko'; }
}

function getErrorMessage(errorCode: string): string {
  const locale = getLocale();

  const errors: Record<string, Record<string, string>> = {
    "auth/email-already-in-use": {
      ko: "이미 가입된 이메일입니다",
      en: "This email is already registered",
      ja: "このメールアドレスはすでに登録されています",
    },
    "auth/invalid-email": {
      ko: "유효하지 않은 이메일입니다",
      en: "Invalid email address",
      ja: "無効なメールアドレスです",
    },
    "auth/weak-password": {
      ko: "비밀번호는 6자 이상이어야 합니다",
      en: "Password must be at least 6 characters",
      ja: "パスワードは6文字以上にしてください",
    },
    "auth/user-not-found": {
      ko: "등록되지 않은 이메일입니다",
      en: "No account found with this email",
      ja: "このメールアドレスは登録されていません",
    },
    "auth/wrong-password": {
      ko: "비밀번호가 잘못되었습니다",
      en: "Incorrect password",
      ja: "パスワードが間違っています",
    },
    "auth/invalid-login-credentials": {
      ko: "이메일 또는 비밀번호가 잘못되었습니다",
      en: "Incorrect email or password",
      ja: "メールアドレスまたはパスワードが間違っています",
    },
    "auth/too-many-requests": {
      ko: "너무 많은 시도가 있었습니다. 나중에 다시 시도해주세요",
      en: "Too many attempts. Please try again later",
      ja: "試行回数が多すぎます。しばらくしてから再試行してください",
    },
    "auth/popup-closed-by-user": {
      ko: "Google 로그인 창이 닫혔습니다. 다시 시도해주세요",
      en: "Google sign-in window was closed. Please try again",
      ja: "Googleログイン画面が閉じられました。もう一度お試しください",
    },
    "auth/popup-blocked": {
      ko: "브라우저가 팝업을 차단했습니다. 팝업을 허용해주세요",
      en: "Popup was blocked by your browser. Please allow popups",
      ja: "ブラウザにポップアップがブロックされました。許可してください",
    },
    "auth/network-request-failed": {
      ko: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요",
      en: "Network error. Please check your internet connection",
      ja: "ネットワークエラーが発生しました。接続を確認してください",
    },
  };

  const fallback: Record<string, string> = {
    ko: "인증에 실패했습니다. 다시 시도해주세요",
    en: "Authentication failed. Please try again",
    ja: "認証に失敗しました。もう一度お試しください",
  };

  return errors[errorCode]?.[locale] || fallback[locale];
}

// ===== Firestore 함수 =====

/**
 * 사용자의 결제 상태 조회
 */
export async function getUserPaidStatus(_userId: string): Promise<boolean> {
  // TODO Phase 7: PostgreSQL users.is_premium 조회
  return false;
}

/**
 * 구독이 이미 취소된 상태인지 확인.
 * Lemon Squeezy 의 subscription.status 가 'cancelled' / 'expired' / 'unpaid'
 * 중 하나거나, subscriptionCancelledAt 필드가 존재하면 취소된 것으로 간주.
 */
export async function isSubscriptionCancelled(_userId: string): Promise<boolean> {
  // TODO Phase 7: LemonSqueezy webhook + PostgreSQL 변환 후 구현
  return false;
}

/**
 * 사용자의 결제 상태 업데이트
 */
export async function updateUserPaidStatus(_userId: string, _isPaid: boolean): Promise<void> {
  // TODO Phase 7: LemonSqueezy webhook 으로 자동 처리됨
}

/**
 * 사용자 정보를 Firestore에 저장 (로그인/회원가입 시)
 */
export async function saveUserInfoToFirebase(_userId: string, _email: string): Promise<void> {
  // Cognito PostConfirmation Lambda 가 PostgreSQL users 테이블에 자동 INSERT
}

/**
 * 사용자의 연속 방문 일수를 Firestore에서 가져오기 및 업데이트
 */
export async function updateStreakInFirebase(_userStatus: string = "guest"): Promise<number> {
  // TODO: PostgreSQL users.streak 컬럼 업데이트 (Phase 7)
  return 0;
}

/**
 * 사용자의 연속 방문 일수를 Firestore에서 가져오기
 */
export async function getStreakFromFirebase(_userId: string): Promise<number> {
  // TODO: PostgreSQL users.streak 조회 (Phase 7)
  return 0;
}

/**
 * 관리자 통계: 사용자 상태별 집계
 */
export async function getAdminStats(): Promise<{
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
}> {
  try {
    const { api } = await import("./auth/apiClient");
    const res = await api.post("/api/admin/stats", {});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      totalUsers: data.totalUsers || 0,
      paidUsers: data.paidUsers || 0,
      freeUsers: data.freeUsers || 0,
    };
  } catch {
    return { totalUsers: 0, paidUsers: 0, freeUsers: 0 };
  }
}

/**
 * 모든 사용자 목록 조회 (관리자용)
 */
export async function getAllUsersForAdmin(): Promise<Array<{
  userId: string;
  email: string;
  userStatus: string;
  createdAt: string;
}>> {
  try {
    const { api } = await import("./auth/apiClient");
    const res = await api.post("/api/admin/users", {});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // PostgreSQL row → frontend 기대 형식으로 매핑
    type Row = {
      id: number;
      cognito_sub: string;
      email: string;
      is_premium: boolean;
      role: string;
      created_at: string;
    };
    const rows: Row[] = Array.isArray(data?.users) ? data.users : [];
    return rows.map((r) => ({
      userId: r.cognito_sub || String(r.id),
      email: r.email,
      userStatus: r.role === "admin" ? "admin" : r.is_premium ? "paid" : "loggedIn",
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

// ===== 퀴즈 통계 함수 =====

/**
 * 퀴즈 결과 저장 (전체 문제 객체 포함)
 */
export async function recordQuizResult(
  userId: string,
  problem: any,
  selectedAnswer: string,
  difficulty: string,
  sessionId: string,
  selectedServices: string[]
): Promise<{ success: boolean; isCorrect: boolean }> {
  try {
    const { api } = await import("./auth/apiClient");
    const res = await api.post("/api/recordQuizResult", {
      userId, problem, selectedAnswer, difficulty, sessionId, selectedServices,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error: any) {
    console.error("recordQuizResult error:", error?.message);
    return { success: false, isCorrect: selectedAnswer === problem?.answer };
  }
}

/**
 * 사용자의 퀴즈 통계 조회
 */
export async function getUserQuizStats(userId: string): Promise<{
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
  byService: { [service: string]: { total: number; correct: number; accuracy: number } };
}> {
  try {
    // apiClient: USE_COGNITO_AUTH=true 면 자동으로 Bearer JWT 첨부
    const { api } = await import("./auth/apiClient");
    const response = await api.post("/api/getQuizStats", { userId });
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    return await response.json();
  } catch (error: any) {
    console.error("❌ Error fetching quiz stats:", error?.message);
    return { totalAttempts: 0, correctCount: 0, accuracy: 0, byService: {} };
  }
}

/**
 * 사용자의 생성 세션별 문제 목록 조회 (서버 API 사용)
 */
export async function getUserProblemSessions(userId: string): Promise<Array<{
  date: string;
  time: string;
  problemCount: number;
  difficulty: string;
  problems: any[];
  sessionTimestamp: number;
}>> {
  try {
    const { api } = await import("./auth/apiClient");
    const response = await api.post("/api/getUserProblemSessions", { userId });
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    return await response.json();
  } catch (error: any) {
    console.error("❌ Error fetching problem sessions:", error?.message);
    return [];
  }
}

/**
 * 만료된 퀴즈 결과 자동 삭제 (3일 경과) + Cloud Storage PDF도 삭제
 */
export async function deleteExpiredResults(_userId: string): Promise<number> {
  // PostgreSQL 의 expires_at 인덱스 + cron job 으로 자동 처리 예정
  return 0;
}

/**
 * PDF 파일을 Cloud Storage에 업로드
 */
export async function uploadPDFToStorage(
  ..._args: any[]
): Promise<string | null> {
  // TODO Phase 7: S3 로 변환 (Firebase Storage 제거)
  return null;
}


export async function saveExamStartDate(_userId: string, examDate: string): Promise<void> {
  // 임시: localStorage 만 사용 (Phase 7 에서 PostgreSQL users.exam_start_date 로 이전)
  if (typeof window !== "undefined") {
    localStorage.setItem("examStartDate", examDate);
  }
}

/**
 * Firebase에서 시험 시작일 불러오기
 */
export async function getExamStartDate(_userId: string): Promise<string | null> {
  if (typeof window !== "undefined") {
    return localStorage.getItem("examStartDate");
  }
  return null;
}

// ===== 게시글 함수 =====

/**
 * 게시글 타입
 */
export interface PostItem {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  isPublic: boolean;
  hasPassword: boolean;
  createdAt: string;
  views: number;
}

/**
 * SHA-256 해시 함수
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 게시글 작성
 */
export async function createPost(
  ..._args: any[]
): Promise<{ id: string }> {
  // TODO Phase 7: PostgreSQL posts 테이블 변환
  console.warn("createPost: not implemented (Firebase removed)");
  return { id: "" };
}


export async function getPosts(
  ..._args: any[]
): Promise<any[]> {
  // TODO Phase 7: PostgreSQL posts 테이블 변환
  return [];
}


export async function getPostById(
  ..._args: any[]
): Promise<any | null> {
  // TODO Phase 7
  return null;
}


export async function deletePost(
  ..._args: any[]
): Promise<{ success: boolean }> {
  // TODO Phase 7
  return { success: false };
}


export async function getTodayMockExamProblems(locale: string = "ko"): Promise<Problem[] | null> {
  try {
    const userEmail = await resolveCurrentEmail();
    if (!userEmail) return null;
    const { api } = await import("./auth/apiClient");
    const res = await api.post("/api/getTodayMockExam", { userId: userEmail, locale });
    if (!res.ok) return null;
    const data = await res.json();
    return data.problems || null;
  } catch (error: any) {
    console.error("getTodayMockExamProblems error:", error?.message);
    return null;
  }
}


// Cognito 사용자도 잡기 위한 email fallback. Firebase auth.currentUser 가 null 인 경우(=Cognito 인증)
// Cognito 세션에서 email claim 을 가져온다. 둘 다 없으면 null.
async function resolveCurrentEmail(): Promise<string | null> {
  const fbEmail = auth.currentUser?.email;
  if (fbEmail) return fbEmail;
  try {
    const { getCurrentUserEmail } = await import("./auth/cognito");
    return await getCurrentUserEmail();
  } catch {
    return null;
  }
}

/**
 * 오늘의 모의시험 문제 저장 (첫 번째 사용자만 호출)
 * 생성된 50개 문제를 Firestore에 저장 (언어별로 따로 저장)
 */
export async function saveTodayMockExamProblems(problems: Problem[], locale: string = "ko"): Promise<void> {
  try {
    const userEmail = await resolveCurrentEmail();
    if (!userEmail) return;
    const { api } = await import("./auth/apiClient");
    await api.post("/api/saveMockExamProblems", { userId: userEmail, locale, problems });
  } catch (error: any) {
    console.error("saveTodayMockExamProblems error:", error?.message);
  }
}


/**
 * 모의시험 문제 점진적 저장 (가져오는 대로 저장)
 * 기존 문제 + 새 문제를 합쳐서 저장
 */
export async function updateMockExamProblemsProgressively(
  problems: Problem[],
  locale: string = "ko"
): Promise<void> {
  try {
    const userEmail = await resolveCurrentEmail();
    if (!userEmail) return;
    const { api } = await import("./auth/apiClient");
    await api.post("/api/saveMockExamProblems", { userId: userEmail, locale, problems });
  } catch (error: any) {
    console.error("updateMockExamProblemsProgressively error:", error?.message);
  }
}


/**
 * 오래된 모의시험 문제 삭제 (3일 이상 경과)
 * 한국어(ko), 영어(en), 일본어(ja) 모두 3일만 유지 후 자동 삭제
 */
export async function deleteOldMockExamProblems(): Promise<number> {
  // PostgreSQL: 모의시험은 user_id + exam_date 로 자동 관리
  return 0;
}

/**
 * ⚠️ 보안: 문제 생성 가능 여부 확인 (Firebase 서버 검증)
 * sessionStorage 우회 방지
 */
export async function canGenerateProblemToday(
  userId: string,
  userStatus: "guest" | "loggedIn" | "paid"
): Promise<{ canGenerate: boolean; count: number; limit: number }> {
  try {
    if (!userId) {
      return { canGenerate: false, count: 0, limit: 0 };
    }

    // 서버 API로 개수 조회 (보안: 서버에서 처리)
    // daily-count 슬라이스: server.js → 자바(2026-05). apiFetch 가 MIGRATED_TO_JAVA 로 자동 라우팅.
    const { api } = await import("./auth/apiClient");
    const response = await api.post("/api/getProblemCountToday", { userId, userStatus });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    return {
      canGenerate: data.canGenerate,
      count: data.count,
      limit: data.limit
    };
  } catch (error: any) {
    console.error('❌ Error checking daily limit:', error?.message);
    // Fallback: 허용하되 제한은 둔다
    const limit = userStatus === "paid" ? 20 : 2;
    return { canGenerate: true, count: 0, limit };
  }
}

/**
 * ⚠️ 보안: 문제 생성 기록 저장 (Firebase 서버에만 저장)
 * 클라이언트에서 수정 불가능
 */
export async function recordProblemGeneration(userId: string, problem?: Problem): Promise<void> {
  // 통합된 backend endpoint 사용 (PostgreSQL + DynamoDB API Gateway)
  try {
    if (!userId) return;
    const { api } = await import("./auth/apiClient");
    await api.post("/api/recordProblemGeneration", { userId, problem });
  } catch (error: any) {
    console.error("recordProblemGeneration error:", error?.message);
  }
}

// ===== 유저별 모의시험 날짜 기록 =====

/**
 * 유저가 오늘 모의시험을 봤는지 Firebase에서 확인 (UTC 기준)
 * localStorage 대신 Firestore를 source of truth로 사용
 */
export async function getUserMockExamDate(_userId: string): Promise<string | null> {
  // PostgreSQL mock_exams 의 exam_date 가 곧 마지막 모의시험 날짜
  // 임시 localStorage 사용 (Phase 7 에서 backend API 추가)
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lastMockExamDate");
}

export async function recordMockExamDate(_userId: string): Promise<void> {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem("lastMockExamDate", today);
}

// ═══════════════════════════════════════════════════════════
// 📝 기출문제 (Past Exams) 관련 함수
// ═══════════════════════════════════════════════════════════

type PastExamLocale = "ko" | "en" | "ja";
type PastExamDoc = Problem & {
  id: string;
  order: number;
  questionHash: string;
  sourceMockDate: string;
  locale: PastExamLocale;
};

/**
 * SHA-256 해시 생성 (질문 텍스트 중복 제거용)
 */
async function sha256(text: string): Promise<string> {
  const buffer = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * 기출문제 최대 개수 (이 수를 초과하면 랜덤으로 오래된 문제 삭제)
 */
const PAST_EXAM_MAX = 800;

/**
 * 관리자: 오늘의 모의시험을 기출문제 컬렉션에 업로드
 *
 * 동작:
 * 1. 질문 텍스트 해시로 중복 제거
 * 2. 현재 개수 + 신규 개수가 PAST_EXAM_MAX(800) 초과 시,
 *    초과분만큼 기존 문제 중 **랜덤으로 삭제**하여 800 유지
 * 3. 삭제된 슬롯(order 번호)을 재활용하여 신규 문제 삽입
 *    → order는 항상 1~800 범위 내 유지, 페이지네이션 일관성 보장
 */
export async function uploadCurrentMockExamToPastExams(
  locale: string
): Promise<{ added: number; skipped: number; deleted: number; totalCount: number }> {
  // backend 가 PostgreSQL mock_exams 에서 오늘 문제 읽고 past_exams 에 INSERT
  // - userId 는 Cognito 또는 Firebase 어느 쪽이든 (backend 가 자동 매핑)
  const { getCurrentUserEmail } = await import("./auth/cognito");
  let userEmail: string | null = await getCurrentUserEmail();
  if (!userEmail && auth.currentUser) {
    userEmail = auth.currentUser.email;
  }
  if (!userEmail) {
    throw new Error("Not logged in");
  }

  const { api } = await import("./auth/apiClient");
  const res = await api.post("/api/uploadMockToPastExams", { userId: userEmail, locale });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  return await res.json();
}


/**
 * 기출문제 페이지 단위 조회 (order BETWEEN start AND end)
 * 페이지 점프 시에도 비용은 동일 (10 reads).
 */
export async function fetchPastExamPage(
  locale: PastExamLocale,
  page: number,
  pageSize: number = 10
): Promise<{ problems: PastExamDoc[] }> {
  try {
    const { api } = await import("./auth/apiClient");
    const res = await api.post("/api/getPastExamPage", { locale, page, pageSize });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error: any) {
    console.error("fetchPastExamPage error:", error?.message);
    return { problems: [] };
  }
}


/**
 * 기출문제 총 개수 (meta 문서에서 1번의 read로 조회)
 */
export async function getPastExamTotalCount(locale: PastExamLocale): Promise<number> {
  try {
    const { api } = await import("./auth/apiClient");
    const res = await api.post("/api/getPastExamTotalCount", { locale });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.total || 0;
  } catch (error: any) {
    console.error("getPastExamTotalCount error:", error?.message);
    return 0;
  }
}
