// UserMigration Lambda Trigger
// -----------------------------------------------------------------
// 호출 시점:
//   기존 Firebase 사용자가 Cognito 로그인 시도 → Cognito 가
//   "이 사용자 모르는데?" 하고 이 Lambda 호출
//
// 흐름:
//   1) Firebase Auth REST API 로 (email, password) 검증
//   2) 성공 시 event.response 에 사용자 속성 채워서 반환
//   3) Cognito 가 자동으로 사용자 생성 + 같은 비번으로 가입
//   4) 이후엔 사용자가 Cognito 에서 직접 로그인됨 (Firebase 호출 없음)
//
// 결과:
//   사용자는 비번 재설정 불필요, 마이그레이션 무중단

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

exports.handler = async (event) => {
  const { triggerSource, userName, request } = event;

  console.log("UserMigration trigger:", triggerSource, "user:", userName);

  // UserMigration_Authentication: 일반 로그인 시도
  // UserMigration_ForgotPassword: 비번 재설정 시도 → 검증 없이 통과
  if (triggerSource === "UserMigration_Authentication") {
    const email = userName;
    const password = request.password;

    if (!FIREBASE_API_KEY) {
      console.error("FIREBASE_API_KEY not set; refusing migration");
      throw new Error("Authentication service unavailable");
    }

    // Firebase Auth REST API 로 비번 검증
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
    const fbRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    if (!fbRes.ok) {
      const errBody = await fbRes.text();
      console.warn("Firebase auth failed:", errBody);
      throw new Error("Bad credentials");
    }

    const fbData = await fbRes.json();
    console.log("Firebase auth OK for", email, "uid:", fbData.localId);

    // Cognito 가 사용자 생성하도록 응답 채우기
    event.response.userAttributes = {
      email: email,
      email_verified: "true", // Firebase 에서 이미 verified
    };
    event.response.finalUserStatus = "CONFIRMED";
    event.response.messageAction = "SUPPRESS"; // welcome 이메일 발송 X

    return event;
  }

  if (triggerSource === "UserMigration_ForgotPassword") {
    // 비번 잊은 사용자 → Cognito 가 reset link 발송하도록 통과
    event.response.userAttributes = {
      email: userName,
      email_verified: "true",
    };
    event.response.finalUserStatus = "RESET_REQUIRED";
    event.response.messageAction = "SUPPRESS";
    return event;
  }

  throw new Error(`Unsupported trigger source: ${triggerSource}`);
};
