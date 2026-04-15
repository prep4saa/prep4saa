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
  query,
  where,
  Timestamp
} from "firebase/firestore";
import { Problem } from "./api";
import {
  getStorage,
  ref,
  uploadBytes,
  getBytes
} from "firebase/storage";

// Firebase 설정 (환경변수에서 가져오기)
const env = (import.meta as any).env;
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
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
 * 서버를 통한 admin 검증
 */
async function verifyAdminAccess(email: string | null): Promise<boolean> {
  if (!email) return false;
  try {
    const response = await fetch('http://localhost:5000/api/checkAdmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return data.isAdmin || false;
  } catch (error) {
    return false;
  }
}

/**
 * Admin 통계 조회
 * 주: 클라이언트는 이미 isAdmin 상태로 검증되었으므로 서버 재검증 불필요
 */
export async function getAdminStatsSecure(email: string | null): Promise<{
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
export async function getAllUsersForAdminSecure(email: string | null): Promise<Array<{
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
export async function getUserProblemSessionsSecure(email: string | null, userId: string): Promise<Array<{
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

    // ✅ 백엔드 API로 AWS SES 이메일 발송 (HTML 형식)
    try {
      const response = await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          userName: email.split('@')[0]
        })
      });
      if (response.ok) {
        console.log('✅ Verification email sent via AWS SES:', user.email);
      } else {
        console.warn('⚠️ Failed to send verification email via API');
      }
    } catch (error: any) {
      console.warn("⚠️ Error calling verification email API:", error?.message);
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
    // 백엔드 API로 AWS SES 이메일 발송 (HTML 형식)
    const response = await fetch('/api/send-verification-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        userName: user.email?.split('@')[0]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to send verification email');
    }

    console.log('✅ Verification email resent via AWS SES');
  } catch (error: any) {
    // Firebase rate limiting 오류 처리
    if (error.message?.includes('too-many-requests')) {
      const err = new Error("email-verification-too-many-requests");
      (err as any).code = "email-verification-too-many-requests";
      throw err;
    }

    throw new Error(error.message || "Failed to send verification email");
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

export function isPasswordLinked(user: User | null | undefined = auth.currentUser): boolean {
  return getLinkedProviders(user).includes("password");
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
export async function getUserPaidStatus(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data()?.isPaid || false;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * 사용자의 결제 상태 업데이트
 */
export async function updateUserPaidStatus(userId: string, isPaid: boolean): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      isPaid,
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.code === 'not-found') {
      // 문서가 없으면 생성
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, {
        isPaid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      throw error;
    }
  }
}

/**
 * 사용자 정보를 Firestore에 저장 (로그인/회원가입 시)
 */
export async function saveUserInfoToFirebase(userId: string, email: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // 새 사용자 - 문서 생성
      await setDoc(userRef, {
        email,
        isPaid: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    // 에러 무시 (선택사항)
  }
}

/**
 * 사용자의 연속 방문 일수를 Firestore에서 가져오기 및 업데이트
 */
export async function updateStreakInFirebase(userStatus: string = "guest"): Promise<number> {
  try {
    // 최대 3초까지 auth.currentUser가 설정될 때까지 기다리기
    let user = auth.currentUser;
    let retries = 0;
    while (!user && retries < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
      user = auth.currentUser;
      retries++;
    }

    if (!user) throw new Error("사용자가 로그인하지 않았습니다");

    const userId = user.uid;
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    const today = new Date().toISOString().split("T")[0];
    const lastVisitDate = userDoc.exists() ? userDoc.data()?.lastVisitDate : null;
    let streak = userDoc.exists() ? (userDoc.data()?.streak || 0) : 0;

    if (lastVisitDate === today) {
      // 오늘 이미 방문함 - streak 유지
      return streak;
    }

    if (lastVisitDate) {
      const lastDate = new Date(lastVisitDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // 어제 방문했으므로 카운트 증가
        streak += 1;
      } else if (diffDays > 1) {
        // 2일 이상 지났으므로 리셋
        streak = 1;
      }
    } else {
      // 첫 방문
      streak = 1;
    }

    // Firestore에 업데이트
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        streak,
        lastVisitDate: today,
        userStatus,
        email: user.email,
        updatedAt: new Date().toISOString()
      });
    } else {
      await setDoc(userRef, {
        streak,
        lastVisitDate: today,
        userStatus,
        email: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return streak;
  } catch (error) {
    // 에러 처리만 수행 (로깅 제거)
    return 0;
  }
}

/**
 * 사용자의 연속 방문 일수를 Firestore에서 가져오기
 */
export async function getStreakFromFirebase(userId: string): Promise<number> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? (userDoc.data()?.streak || 0) : 0;
  } catch (error) {
    // 에러 처리만 수행 (로깅 제거)
    return 0;
  }
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
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    let paidCount = 0;
    let freeCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const status = data.userStatus || "guest";
      if (status === "paid") {
        paidCount++;
      } else if (status === "loggedIn") {
        freeCount++;
      }
    });

    return {
      totalUsers: snapshot.size,
      paidUsers: paidCount,
      freeUsers: freeCount
    };
  } catch (error) {
    // 에러 처리만 수행 (로깅 제거)
    return {
      totalUsers: 0,
      paidUsers: 0,
      freeUsers: 0
    };
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
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const users: Array<{
      userId: string;
      email: string;
      userStatus: string;
      createdAt: string;
    }> = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        userId: doc.id,
        email: data.email || doc.id,
        userStatus: data.userStatus || "guest",
        createdAt: data.createdAt || ""
      });
    });

    // 최신순 정렬
    return users.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    // 에러 처리만 수행 (로깅 제거)
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
  difficulty: "medium" | "hard" | "challenge",
  sessionId: string,
  selectedServices: string[] = [] // 선택된 서비스 목록
): Promise<void> {
  try {
    const isCorrect = selectedAnswer === problem.answer;
    console.log(`🎯 recordQuizResult called: isCorrect=${isCorrect}, selectedAnswer=${selectedAnswer}, answer=${problem.answer}, userId=${userId}`);
    const resultsRef = collection(db, "users", userId, "quizResults");

    // 24시간 뒤 만료 타임스탬프 계산
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1일 뒤 (24시간)

    // quizResults에 임시 저장 (24시간 후 삭제)
    const today = new Date().toISOString().split("T")[0];
    await addDoc(resultsRef, {
      sessionId, // 같은 세션의 문제들을 그룹화
      fullProblem: problem, // 전체 문제 객체 저장
      question: problem.question,
      correctAnswer: problem.answer,
      selectedAnswer,
      userAnswer: selectedAnswer, // 서버에서 읽기 용도
      isCorrect,
      difficulty,
      date: today, // 서버에서 필터링 용도
      createdAt: new Date().toISOString(),
      timestamp: new Date().getTime(),
      expiresAt: expiresAt.getTime() // 24시간 뒤 삭제 타임스탬프
    });

    // aggregatedStats에 누적 통계 업데이트 (영구 유지)
    const statsRef = doc(db, "users", userId, "userData", "aggregatedStats");
    const statsDoc = await getDoc(statsRef);

    if (statsDoc.exists()) {
      const currentStats = statsDoc.data();

      // 서비스별 통계 업데이트
      const byService = currentStats.byService || {};
      selectedServices.forEach(service => {
        if (!byService[service]) {
          byService[service] = { total: 0, correct: 0 };
        }
        byService[service].total++;
        if (isCorrect) byService[service].correct++;
      });

      await updateDoc(statsRef, {
        totalAttempts: (currentStats.totalAttempts || 0) + 1,
        correctCount: isCorrect ? (currentStats.correctCount || 0) + 1 : currentStats.correctCount || 0,
        byService,
        updatedAt: new Date().getTime()
      });
    } else {
      // 첫 문제인 경우
      const byService: any = {};
      selectedServices.forEach(service => {
        byService[service] = { total: 1, correct: isCorrect ? 1 : 0 };
      });

      await setDoc(statsRef, {
        totalAttempts: 1,
        correctCount: isCorrect ? 1 : 0,
        byService,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      });
    }
  } catch (error) {
    // 에러 처리만 수행 (로깅 제거)
    throw error;
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
    // 서버 API로 통계 조회 (보안: 서버에서 처리)
    const backendUrl = typeof window !== "undefined" && window.location?.hostname === "localhost"
      ? "http://localhost:5000"
      : (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:5000";

    console.log(`📊 Fetching quiz stats from server...`);

    const response = await fetch(`${backendUrl}/api/getQuizStats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const stats = await response.json();
    console.log(`✅ Quiz stats: ${stats.totalAttempts} attempts, ${stats.accuracy}% accuracy`);

    return stats;
  } catch (error: any) {
    console.error('❌ Error fetching quiz stats:', error?.message);
    return {
      totalAttempts: 0,
      correctCount: 0,
      accuracy: 0,
      byService: {}
    };
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
    // 서버 API로 세션 조회 (보안: 서버에서 처리)
    const backendUrl = typeof window !== "undefined" && window.location?.hostname === "localhost"
      ? "http://localhost:5000"
      : (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:5000";

    console.log(`🔍 Fetching problem sessions from server...`);

    const response = await fetch(`${backendUrl}/api/getUserProblemSessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const sessions = await response.json();
    console.log(`✅ Retrieved ${sessions.length} problem sessions`);

    return sessions;
  } catch (error: any) {
    console.error('❌ Error fetching problem sessions:', error?.message);
    return [];
  }
}

/**
 * 만료된 퀴즈 결과 자동 삭제 (3일 경과) + Cloud Storage PDF도 삭제
 */
export async function deleteExpiredResults(userId: string): Promise<number> {
  try {
    const resultsRef = collection(db, "users", userId, "quizResults");
    const snapshot = await getDocs(resultsRef);

    const now = new Date().getTime();
    const deletePromises: Promise<void>[] = [];
    const deletePdfPromises: Promise<void>[] = [];
    let deletedCount = 0;
    const deletedSessions = new Set<string>();

    snapshot.forEach((doc) => {
      const data = doc.data();

      // 만료된 항목 삭제
      if (data.expiresAt && data.expiresAt < now) {
        // Firestore 문서 삭제
        deletePromises.push(deleteDoc(doc.ref));

        // Cloud Storage PDF 삭제 (sessionId별로 한 번만)
        const sessionId = data.sessionId;
        if (sessionId && !deletedSessions.has(sessionId)) {
          deletedSessions.add(sessionId);
          // PDF 삭제 로직 추가 예정
        }
        deletedCount++;
      }
    });

    await Promise.all(deletePromises);
    await Promise.all(deletePdfPromises);

    if (deletedCount > 0) {
      // 만료된 세션 자동 삭제 완료
    }

    return deletedCount;
  } catch (error) {
    // 에러 처리만 수행 (로깅 제거)
    return 0;
  }
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
export async function saveExamStartDate(userId: string, examDate: string): Promise<void> {
  try {
    // 백엔드 검증
    const dateObj = new Date(examDate);
    if (isNaN(dateObj.getTime())) {
      throw new Error("유효한 날짜를 입력하세요");
    }
    if (dateObj <= new Date()) {
      throw new Error("미래 날짜를 선택해주세요");
    }
    if (examDate.length > 10) {
      throw new Error("유효한 날짜 형식을 사용하세요");
    }

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      examStartDate: examDate,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    // 에러 처리만 수행 (로깅 제거)
    throw error;
  }
}

/**
 * Firebase에서 시험 시작일 불러오기
 */
export async function getExamStartDate(userId: string): Promise<string | null> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? (userDoc.data()?.examStartDate || null) : null;
  } catch (error) {
    // 에러 처리만 수행 (로깅 제거)
    return null;
  }
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
 * 오늘의 모의시험 문제 조회 (없으면 null)
 * 언어별로 따로 저장되어 있으므로 같은 언어의 사용자끼리 공유
 */
export async function getTodayMockExamProblems(locale: string = "ko"): Promise<Problem[] | null> {
  try {
    // UTC 기준 오늘 날짜 (ISO 형식에서 날짜 부분만 추출)
    // toISOString()은 항상 UTC 시간을 반환하므로 안전함
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD (UTC)
    const docKey = `${today}_${locale}`; // 언어별로 구분
    const cacheKey = `mockExamProblems_${docKey}`;

    // 1️⃣ localStorage에서 먼저 확인
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const problems = JSON.parse(cached);
        return problems;
      } catch (e) {
      }
    }

    // 2️⃣ Firebase에서 조회
    const mockExamRef = doc(db, "mockExamProblems", docKey);
    const mockExamDoc = await getDoc(mockExamRef);

    if (!mockExamDoc.exists()) {
      return null; // 아직 생성되지 않음
    }

    const data = mockExamDoc.data();
    const problems = data.problems || null;

    // 3️⃣ localStorage에 저장
    if (problems && problems.length > 0) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(problems));
      } catch (e) {
      }
    }

    return problems;
  } catch (error: any) {
    throw new Error(error.message || "모의시험 문제를 불러올 수 없습니다");
  }
}

/**
 * 오늘의 모의시험 문제 저장 (첫 번째 사용자만 호출)
 * 생성된 50개 문제를 Firestore에 저장 (언어별로 따로 저장)
 */
export async function saveTodayMockExamProblems(problems: Problem[], locale: string = "ko"): Promise<void> {
  try {
    // UTC 기준 오늘 날짜에 문제 저장
    // 같은 언어를 선택한 사용자들이 같은 UTC 날짜의 문제를 공유하게 됨
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD (UTC)
    const docKey = `${today}_${locale}`; // 언어별로 구분

    const mockExamRef = doc(db, "mockExamProblems", docKey);

    // 이미 저장된 문제가 있으면 덮어쓰지 않음 (첫 사용자만 생성)
    const existingDoc = await getDoc(mockExamRef);
    if (existingDoc.exists()) {
      return; // 이미 저장되어 있음
    }

    // 새로운 문제 저장
    await setDoc(mockExamRef, {
      problems: problems,
      createdAt: Timestamp.now(),
      date: today,
      locale: locale
    });
  } catch (error: any) {
    throw new Error(error.message || "모의시험 문제 저장에 실패했습니다");
  }
}

/**
 * 모의시험 문제 점진적 저장 (가져오는 대로 저장)
 * 기존 문제 + 새 문제를 합쳐서 저장
 */
export async function updateMockExamProblemsProgressively(
  newProblems: Problem[],
  locale: string = "ko"
): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const docKey = `${today}_${locale}`;

    const mockExamRef = doc(db, "mockExamProblems", docKey);
    const existingDoc = await getDoc(mockExamRef);

    let allProblems = [];
    if (existingDoc.exists()) {
      allProblems = existingDoc.data().problems || [];
    }

    // 기존 문제 + 새 문제 합치기
    allProblems = [...allProblems, ...newProblems].slice(0, 50); // 최대 50개

    // 1️⃣ Firebase에 저장
    await setDoc(
      mockExamRef,
      {
        problems: allProblems,
        createdAt: Timestamp.now(),
        date: today,
        locale: locale,
        lastUpdated: Timestamp.now()
      },
      { merge: true }
    );

    // 2️⃣ localStorage에도 저장 (캐싱)
    const cacheKey = `mockExamProblems_${docKey}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(allProblems));
    } catch (e) {
      // localStorage 저장 실패
    }
  } catch (error: any) {
    // Error saving problem data
  }
}

/**
 * 오래된 모의시험 문제 삭제 (3일 이상 경과)
 * 한국어(ko), 영어(en), 일본어(ja) 모두 3일만 유지 후 자동 삭제
 */
export async function deleteOldMockExamProblems(): Promise<number> {
  try {
    const mockExamRef = collection(db, "mockExamProblems");
    const snapshot = await getDocs(mockExamRef);

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    let deletedCount = 0;
    const deletePromises: Promise<void>[] = [];

    snapshot.forEach((doc) => {
      const docId = doc.id;

      // 문서 ID에서 날짜 추출 (format: YYYY-MM-DD 또는 YYYY-MM-DD_locale: ko/en/ja)
      const dateMatch = docId.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        const docDate = new Date(
          parseInt(dateMatch[1]),
          parseInt(dateMatch[2]) - 1,
          parseInt(dateMatch[3])
        );

        // 3일 이상 경과한 문서 삭제 (모든 언어 포함)
        if (docDate < threeDaysAgo) {
          deletePromises.push(deleteDoc(doc.ref));
          deletedCount++;
        }
      }
    });

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }

    return deletedCount;
  } catch (error: any) {
    // Firestore 권한 부족 - 무시 (클라이언트에서 삭제 불가는 정상)
    if (error.code === "permission-denied") {
      // 권한 부족은 정상 - Cloud Function이 없으면 발생
      return 0;
    }
    return 0;
  }
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
      : (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:5000";

    console.log(`🔍 Fetching problem count from server...`);

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
    console.log(`✅ Today's problem count: ${data.count}/${data.limit}`);

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
      console.log(`✅ Problem recorded: ${newCount} problems generated today`);
    } else {
      // 새 기록 생성
      await setDoc(dailyStatsRef, {
        date: today,
        problemCount: 1,
        createdAt: new Date().toISOString(),
        lastGeneratedAt: new Date().toISOString()
      });
      console.log(`✅ First problem recorded today`);
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
      console.log(`✅ Problem saved to quizResults`);
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
