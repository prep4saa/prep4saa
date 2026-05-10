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
  userId: string,
  pdfBlob: Blob,
  sessionDate: string,
  sessionTime: string
): Promise<string> {
  try {
    const fileName = `${sessionDate.replace(/\//g, '-')}_${sessionTime.replace(/:/g, '-')}.pdf`;
    const filePath = `users/${userId}/pdfs/${fileName}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, pdfBlob);
    return filePath;
  } catch (error) {
    // 에러 처리만 수행 (로깅 제거)
    throw error;
  }
}

/**
 * 시험 시작일을 Firebase에 저장
 */
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
  title: string,
  content: string,
  authorName: string,
  authorId: string,
  isPublic: boolean,
  password?: string
): Promise<string> {
  try {
    // 입력값 검증
    if (!title.trim() || title.length > 100) {
      throw new Error("제목은 1자 이상 100자 이하여야 합니다");
    }
    if (!content.trim() || content.length > 800) {
      throw new Error("내용은 1자 이상 800자 이하여야 합니다");
    }
    if (!authorName.trim() || authorName.length > 50) {
      throw new Error("작성자 이름은 1자 이상 50자 이하여야 합니다");
    }

    let passwordHash = "";
    if (!isPublic && password) {
      if (password.length < 4 || password.length > 20) {
        throw new Error("비밀번호는 4자 이상 20자 이하여야 합니다");
      }
      passwordHash = await hashPassword(password);
    }

    const postsCollection = collection(db, "posts");
    const docRef = await addDoc(postsCollection, {
      title: title.trim(),
      content: content.trim(),
      authorName: authorName.trim(),
      authorId,
      isPublic,
      passwordHash,
      createdAt: new Date().toISOString(),
      views: 0
    });

    return docRef.id;
  } catch (error: any) {
    throw new Error(`게시글 작성 실패: ${error.message}`);
  }
}

/**
 * 게시글 목록 조회 (페이지네이션)
 */
export async function getPosts(
  page: number = 1,
  pageSize: number = 20,
  searchQuery: string = "",
  filterAuthorId: string = "",
  currentUserId: string = ""
): Promise<{ posts: PostItem[]; totalCount: number }> {
  try {
    const postsCollection = collection(db, "posts");
    const snapshot = await getDocs(postsCollection);

    let allPosts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as any));

    // 필터링: 비공개 글은 작성자만 볼 수 있음
    allPosts = allPosts.filter(p => {
      if (p.isPublic) return true;
      // 비공개 글: 현재 사용자만 볼 수 있음
      return currentUserId === p.authorId;
    });

    // 필터링: 제목 검색
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allPosts = allPosts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.authorName.toLowerCase().includes(query)
      );
    }

    // 필터링: 내가 쓴 글
    if (filterAuthorId) {
      allPosts = allPosts.filter(p => p.authorId === filterAuthorId);
    }

    // 최신순 정렬
    allPosts.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const totalCount = allPosts.length;

    // 페이지네이션
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedPosts = allPosts.slice(start, end);

    // 공개글은 content 표시, 비공개는 본인이나 관리자만 content 표시
    const posts: PostItem[] = paginatedPosts.map(p => ({
      id: p.id,
      title: p.title,
      content: p.content,
      authorName: p.authorName,
      authorId: p.authorId,
      isPublic: p.isPublic,
      hasPassword: p.passwordHash !== "",
      createdAt: p.createdAt,
      views: p.views || 0
    }));

    return { posts, totalCount };
  } catch (error: any) {
    return { posts: [], totalCount: 0 };
  }
}

/**
 * 게시글 상세 조회 (비공개 글은 관리자 또는 작성자만 조회 가능)
 */
export async function getPostById(postId: string, currentUserId: string = ""): Promise<PostItem | null> {
  try {
    const postRef = doc(db, "posts", postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      return null;
    }

    const data = postDoc.data();

    // 비공개 글 권한 검사: 작성자만 조회 가능
    if (!data.isPublic && currentUserId !== data.authorId) {
      throw new Error("접근 권한이 없습니다");
    }

    // 조회수 증가
    await updateDoc(postRef, {
      views: (data.views || 0) + 1
    });

    return {
      id: postDoc.id,
      title: data.title,
      content: data.content,
      authorName: data.authorName,
      authorId: data.authorId,
      isPublic: data.isPublic,
      hasPassword: data.passwordHash !== "",
      createdAt: data.createdAt,
      views: (data.views || 0) + 1
    };
  } catch (error: any) {
    throw new Error(error.message || "게시글을 불러올 수 없습니다");
  }
}

/**
 * 게시글 삭제
 */
export async function deletePost(
  postId: string,
  authorId: string
): Promise<void> {
  try {
    const postRef = doc(db, "posts", postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      throw new Error("게시글을 찾을 수 없습니다");
    }

    const data = postDoc.data();

    // 작성자만 삭제 가능
    if (data.authorId !== authorId) {
      throw new Error("본인이 작성한 글만 삭제할 수 있습니다");
    }

    await deleteDoc(postRef);
  } catch (error: any) {
    throw new Error(error.message || "게시글 삭제에 실패했습니다");
  }
}

// ===== 모의시험 문제 공유 함수 =====

/**
 * 🚫 "7년" 자동 치환 (캐시된 문제도 정화)
 * 매 호출마다 다른 값으로 랜덤 치환
 */
function sanitizeRetention<T>(obj: T): T {
  const ko = ['1년', '2년', '5년', '10년', '6개월', '90일'];
  const en = ['1 year', '2 years', '5 years', '10 years', '6 months', '90 days'];
  const ja = ['1年', '2年', '5年', '10年', '6ヶ月', '90日'];
  const pickKo = () => ko[Math.floor(Math.random() * ko.length)];
  const pickEn = () => en[Math.floor(Math.random() * en.length)];
  const pickJa = () => ja[Math.floor(Math.random() * ja.length)];
  const sanitize = (s: string) =>
    s
      .replace(/7\s*년/g, pickKo)
      .replace(/\b7[\s-]?years?\b/gi, pickEn)
      .replace(/seven\s+years?/gi, pickEn)
      .replace(/7\s*年/g, pickJa);
  const walk = (v: any): any => {
    if (typeof v === 'string') return sanitize(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      const out: any = {};
      for (const k of Object.keys(v)) out[k] = walk(v[k]);
      return out;
    }
    return v;
  };
  return walk(obj);
}

/**
 * 오늘의 모의시험 문제 조회 (없으면 null)
 * 언어별로 따로 저장되어 있으므로 같은 언어의 사용자끼리 공유
 */
export async function getTodayMockExamProblems(locale: string = "ko"): Promise<Problem[] | null> {
  try {
    const userEmail = auth.currentUser?.email;
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


/**
 * 오늘의 모의시험 문제 저장 (첫 번째 사용자만 호출)
 * 생성된 50개 문제를 Firestore에 저장 (언어별로 따로 저장)
 */
export async function saveTodayMockExamProblems(problems: Problem[], locale: string = "ko"): Promise<void> {
  try {
    const userEmail = auth.currentUser?.email;
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
    const userEmail = auth.currentUser?.email;
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
    const backendUrl = typeof window !== "undefined" && window.location?.hostname === "localhost"
      ? "http://localhost:5000"
      : import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";


    const response = await fetch(`${backendUrl}/api/getProblemCountToday`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        userStatus
      })
    });

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
  try {
    if (!userId) return;

    const today = new Date().toISOString().split("T")[0];
    const dailyStatsRef = doc(db, "users", userId, "dailyStats", today);
    const dailyStats = await getDoc(dailyStatsRef);

    if (dailyStats.exists()) {
      // 기존 기록 업데이트
      const newCount = (dailyStats.data()?.problemCount || 0) + 1;
      await updateDoc(dailyStatsRef, {
        problemCount: newCount,
        lastGeneratedAt: new Date().toISOString()
      });
    } else {
      // 새 기록 생성
      await setDoc(dailyStatsRef, {
        date: today,
        problemCount: 1,
        createdAt: new Date().toISOString(),
        lastGeneratedAt: new Date().toISOString()
      });
    }

    // 문제를 quizResults에 저장 (현황 탭 PDF 다운로드용)
    if (problem) {
      const timestamp = Date.now();
      const sessionId = `${today}_session`;
      const quizResultRef = doc(db, "users", userId, "quizResults", `${timestamp}_${Math.random()}`);

      await setDoc(quizResultRef, {
        sessionId: sessionId,
        timestamp: timestamp,
        date: today,
        difficulty: "medium", // 기본값
        fullProblem: problem,
        userAnswer: null,
        isCorrect: null,
        timeSpent: 0,
        expiresAt: new Date().getTime() + 24 * 60 * 60 * 1000 // 1일(24시간) 뒤 삭제
      });
    }

  } catch (error: any) {
    console.error(`❌ Error recording problem generation:`, error?.message || error);
  }
}

// ===== 유저별 모의시험 날짜 기록 =====

/**
 * 유저가 오늘 모의시험을 봤는지 Firebase에서 확인 (UTC 기준)
 * localStorage 대신 Firestore를 source of truth로 사용
 */
export async function getUserMockExamDate(userId: string): Promise<string | null> {
  try {
    if (!userId) return null;
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return null;
    return userDoc.data()?.lastMockExamDate ?? null;
  } catch {
    return null;
  }
}

/**
 * 유저의 모의시험 날짜를 Firebase에 저장 (UTC 기준 오늘 날짜)
 */
export async function recordMockExamDate(userId: string): Promise<void> {
  try {
    if (!userId) return;
    const today = new Date().toISOString().split("T")[0];
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { lastMockExamDate: today }, { merge: true });
  } catch (error: any) {
    // Error saving mock exam date
  }
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
  locale: string,
  problems: any[]
): Promise<{ uploaded: number }> {
  try {
    const { api } = await import("./auth/apiClient");
    const res = await api.post("/api/uploadPastExams", { locale, problems });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error: any) {
    console.error("uploadCurrentMockExamToPastExams error:", error?.message);
    return { uploaded: 0 };
  }
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
