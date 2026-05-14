// Cognito 클라이언트 (Phase 4-1)
// -----------------------------------------------------------------
// Firebase Auth 의 signUp/signIn/signOut 등과 동일한 인터페이스를 제공해서
// 기존 코드의 import 만 바꾸면 동작하도록 설계.
//
// amazon-cognito-identity-js 가 토큰을 자동으로 localStorage 에 저장한다.
// API 호출 시엔 getAccessToken() 으로 Bearer 토큰을 가져와 Authorization 헤더에 첨부한다.

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
  ISignUpResult,
} from "amazon-cognito-identity-js";

// === Pool 설정 (env 에서 주입) ===
const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || "",
});

// === 회원가입 ===
export function signUp(email: string, password: string): Promise<ISignUpResult> {
  return new Promise((resolve, reject) => {
    const attributes = [new CognitoUserAttribute({ Name: "email", Value: email })];

    userPool.signUp(email, password, attributes, [], (err, result) => {
      if (err) return reject(err);
      if (!result) return reject(new Error("No signup result"));
      resolve(result);
    });
  });
}

// === 가입 확인 (verification code 입력) ===
export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// === verification code 재발송 ===
export function resendConfirmationCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    cognitoUser.resendConfirmationCode((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// === 로그인 ===
// Cognito 가 USER_MIGRATION 트리거를 통해 Firebase 사용자도 자동 처리해줌
export function signIn(
  email: string,
  password: string
): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
      newPasswordRequired: () => {
        reject(new Error("New password required. Please reset your password."));
      },
    });
  });
}

// === 로그아웃 ===
export function signOut(): void {
  const user = userPool.getCurrentUser();
  if (user) user.signOut();
}

// === 현재 로그인된 사용자 (없으면 null) ===
export function getCurrentUser(): CognitoUser | null {
  return userPool.getCurrentUser();
}

// === 현재 세션 (자동 refresh 포함) ===
export function getCurrentSession(): Promise<CognitoUserSession | null> {
  return new Promise((resolve, reject) => {
    const user = userPool.getCurrentUser();
    if (!user) return resolve(null);

    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) return reject(err);
      resolve(session);
    });
  });
}

// === Access Token (API 호출 시 Bearer 토큰) ===
// - 자동 refresh 됨 (refresh token 유효한 동안)
// - 만료된 token 이면 null 반환
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await getCurrentSession();
    if (!session || !session.isValid()) return null;
    return session.getAccessToken().getJwtToken();
  } catch (err) {
    console.warn("Failed to get access token:", err);
    return null;
  }
}

// === 비번 재설정 시작 ===
export function forgotPassword(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    cognitoUser.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

// === 비번 재설정 완료 (code + 새 비번) ===
export function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

// === 사용자 이메일 추출 (현재 세션) ===
export async function getCurrentUserEmail(): Promise<string | null> {
  const session = await getCurrentSession();
  if (!session) return null;
  // ID token payload 의 email claim
  const payload = session.getIdToken().payload;
  return (payload?.email as string) || null;
}
