// Cognito 인증 흐름 테스트 페이지
// -----------------------------------------------------------------
// 접근: http://localhost:3000/#cognito-test
// 시나리오:
//   1) 회원가입 → 이메일로 6자리 코드 수신
//   2) 코드 입력해서 가입 확인 (confirmSignUp)
//   3) 로그인 → access token 발급
//   4) Bearer 토큰으로 백엔드 API 호출 테스트
//
// 이 페이지는 web-app.tsx 와 완전히 독립이라 기존 코드에 영향 없음.

import React, { useState, useEffect } from "react";
import {
  signUp,
  confirmSignUp,
  resendConfirmationCode,
  signIn,
  signOut,
  getCurrentSession,
  getAccessToken,
  getCurrentUserEmail,
} from "../auth/cognito";

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "-apple-system, sans-serif",
    maxWidth: 700,
    margin: "40px auto",
    padding: 24,
    background: "#1a1a1a",
    color: "#e8e8e8",
    borderRadius: 8,
    minHeight: "100vh",
  },
  section: {
    background: "#252525",
    padding: 16,
    borderRadius: 6,
    marginBottom: 16,
  },
  input: {
    width: "100%",
    padding: 10,
    margin: "4px 0 12px",
    background: "#0f0f0f",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 4,
    boxSizing: "border-box",
  },
  button: {
    background: "#ff9900",
    color: "#000",
    border: "none",
    padding: "10px 20px",
    borderRadius: 4,
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: 8,
  },
  log: {
    background: "#0f0f0f",
    padding: 12,
    borderRadius: 4,
    fontFamily: "Consolas, monospace",
    fontSize: 12,
    whiteSpace: "pre-wrap",
    maxHeight: 200,
    overflow: "auto",
    border: "1px solid #333",
  },
  status: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    fontWeight: "bold",
  },
};

export function CognitoTestPage() {
  const [email, setEmail] = useState("imjaichoipro@gmail.com");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [sessionInfo, setSessionInfo] = useState<string>("Not logged in");
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const log = (msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${ts}] ${msg}`, ...prev].slice(0, 30));
  };

  // 세션 상태 확인
  const refreshSession = async () => {
    try {
      const session = await getCurrentSession();
      const userEmail = await getCurrentUserEmail();
      const token = await getAccessToken();
      setAccessToken(token);

      if (session && session.isValid()) {
        setSessionInfo(`✅ Logged in as ${userEmail}`);
      } else {
        setSessionInfo("Not logged in");
      }
    } catch (err) {
      setSessionInfo("Not logged in");
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  // 1. 회원가입
  const handleSignUp = async () => {
    if (!email || !password) return alert("email + password required");
    try {
      const result = await signUp(email, password);
      log(`✅ SignUp success. userConfirmed=${result.userConfirmed}, sub=${result.userSub}`);
      log(`📧 verification code 가 ${email} 로 발송됐습니다`);
    } catch (err: unknown) {
      const e = err as Error;
      log(`❌ SignUp failed: ${e.message}`);
    }
  };

  // 2. verification code 확인
  const handleConfirmCode = async () => {
    if (!email || !code) return alert("email + code required");
    try {
      await confirmSignUp(email, code);
      log(`✅ Confirmed: ${email}`);
    } catch (err: unknown) {
      const e = err as Error;
      log(`❌ Confirm failed: ${e.message}`);
    }
  };

  // 3. 코드 재발송
  const handleResend = async () => {
    if (!email) return alert("email required");
    try {
      await resendConfirmationCode(email);
      log(`📧 Code resent to ${email}`);
    } catch (err: unknown) {
      const e = err as Error;
      log(`❌ Resend failed: ${e.message}`);
    }
  };

  // 4. 로그인
  const handleSignIn = async () => {
    if (!email || !password) return alert("email + password required");
    try {
      const session = await signIn(email, password);
      log(`✅ SignIn success. expires in: ${session.getAccessToken().getExpiration()}`);
      await refreshSession();
    } catch (err: unknown) {
      const e = err as Error;
      log(`❌ SignIn failed: ${e.message}`);
    }
  };

  // 5. 로그아웃
  const handleSignOut = async () => {
    signOut();
    log(`👋 Signed out`);
    await refreshSession();
  };

  // 6. 백엔드 API 테스트 (Bearer 토큰)
  const handleApiTest = async () => {
    const token = await getAccessToken();
    if (!token) {
      log(`❌ No access token. Sign in first.`);
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/checkAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      log(`📡 API response (${res.status}): ${JSON.stringify(data)}`);
    } catch (err: unknown) {
      const e = err as Error;
      log(`❌ API call failed: ${e.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={{ color: "#ff9900" }}>🧪 Cognito Test Page</h1>
      <p style={{ color: "#888", fontSize: 13 }}>
        URL: <code>http://localhost:3000/#cognito-test</code>
      </p>

      {/* 세션 상태 */}
      <div
        style={{
          ...styles.status,
          background: accessToken ? "#1a3a1a" : "#3a1a1a",
        }}
      >
        {sessionInfo}
      </div>

      {/* 1. 가입 */}
      <div style={styles.section}>
        <h3>1️⃣ 회원가입</h3>
        <input
          style={styles.input}
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="password (12자 이상, 대/소/숫자/특수문자)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button style={styles.button} onClick={handleSignUp}>
          Sign Up
        </button>
      </div>

      {/* 2. 코드 확인 */}
      <div style={styles.section}>
        <h3>2️⃣ 가입 확인 코드 입력</h3>
        <input
          style={styles.input}
          placeholder="6-digit code from email"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button style={styles.button} onClick={handleConfirmCode}>
          Confirm
        </button>
        <button
          style={{ ...styles.button, background: "#444", color: "#fff" }}
          onClick={handleResend}
        >
          Resend Code
        </button>
      </div>

      {/* 3. 로그인 */}
      <div style={styles.section}>
        <h3>3️⃣ 로그인 / 로그아웃</h3>
        <button style={styles.button} onClick={handleSignIn}>
          Sign In
        </button>
        <button
          style={{ ...styles.button, background: "#444", color: "#fff" }}
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>

      {/* 4. 토큰 + API */}
      <div style={styles.section}>
        <h3>4️⃣ 토큰 + 백엔드 API 호출</h3>
        {accessToken && (
          <div
            style={{
              ...styles.log,
              maxHeight: 80,
              marginBottom: 12,
              wordBreak: "break-all",
            }}
          >
            <strong>Access Token:</strong>
            <br />
            {accessToken.substring(0, 80)}...
          </div>
        )}
        <button style={styles.button} onClick={handleApiTest}>
          Test /api/checkAdmin
        </button>
      </div>

      {/* 로그 */}
      <div style={styles.section}>
        <h3>📋 Log</h3>
        <div style={styles.log}>
          {logs.length === 0 ? "(no logs yet)" : logs.join("\n")}
        </div>
      </div>
    </div>
  );
}
