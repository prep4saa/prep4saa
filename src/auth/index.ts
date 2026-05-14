// 인증 라우터 (Feature Flag 기반 분기)
// -----------------------------------------------------------------
// VITE_USE_COGNITO_AUTH=true → Cognito
// VITE_USE_COGNITO_AUTH=false → Firebase (기존)
//
// 컴포넌트는 import { signIn } from '@/auth' 처럼 사용.
// 마이그레이션 완료 후 이 파일과 firebase.ts 만 정리하면 됨.

import * as cognito from "./cognito";
import * as firebase from "../firebase";

const USE_COGNITO = import.meta.env.VITE_USE_COGNITO_AUTH === "true";

// === 회원가입 ===
export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<{ provider: "cognito" | "firebase"; needsConfirmation?: boolean }> {
  if (USE_COGNITO) {
    const result = await cognito.signUp(email, password);
    return {
      provider: "cognito",
      needsConfirmation: !result.userConfirmed,
    };
  } else {
    await firebase.signUp(email, password, displayName || "");
    return { provider: "firebase", needsConfirmation: false };
  }
}

// === 로그인 ===
export async function signIn(email: string, password: string): Promise<void> {
  if (USE_COGNITO) {
    await cognito.signIn(email, password);
  } else {
    await firebase.signIn(email, password);
  }
}

// === 로그아웃 ===
export async function signOut(): Promise<void> {
  if (USE_COGNITO) {
    cognito.signOut();
  } else {
    await firebase.signOut();
  }
}

// === 가입 확인 코드 입력 (Cognito 전용) ===
export async function confirmSignUp(email: string, code: string): Promise<void> {
  if (USE_COGNITO) {
    await cognito.confirmSignUp(email, code);
  } else {
    throw new Error("confirmSignUp is only used with Cognito");
  }
}

export async function resendConfirmationCode(email: string): Promise<void> {
  if (USE_COGNITO) {
    await cognito.resendConfirmationCode(email);
  } else {
    await firebase.resendEmailVerification();
  }
}

// === 현재 세션 확인 (로그인 상태 체크) ===
export async function isAuthenticated(): Promise<boolean> {
  if (USE_COGNITO) {
    const session = await cognito.getCurrentSession();
    return !!session && session.isValid();
  } else {
    return !!firebase.getCurrentUser();
  }
}

// === 현재 사용자 이메일 ===
export async function getCurrentUserEmail(): Promise<string | null> {
  if (USE_COGNITO) {
    return cognito.getCurrentUserEmail();
  } else {
    return firebase.getCurrentUser()?.email || null;
  }
}

// === 비번 재설정 ===
export async function forgotPassword(email: string): Promise<void> {
  if (USE_COGNITO) {
    await cognito.forgotPassword(email);
  } else {
    throw new Error("Use Firebase password reset link in current setup");
  }
}

export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  if (USE_COGNITO) {
    await cognito.confirmForgotPassword(email, code, newPassword);
  } else {
    throw new Error("Use Firebase password reset link in current setup");
  }
}

// === Provider 정보 (디버깅) ===
export const AUTH_PROVIDER: "cognito" | "firebase" = USE_COGNITO
  ? "cognito"
  : "firebase";
