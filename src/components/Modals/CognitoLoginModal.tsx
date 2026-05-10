// Cognito 로그인 모달
// -----------------------------------------------------------------
// 디자인은 기존 renderLoginModal 톤 유지
// 로그인만 (가입은 CognitoSignupModal 에서)
// 비번 잊은 경우: forgotPassword 흐름 추가

import React, { useState } from "react";
import {
  signIn,
  forgotPassword,
  confirmForgotPassword,
} from "../../auth/cognito";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  onSwitchToSignup: () => void;
}

type Step = "login" | "forgot-request" | "forgot-confirm";

export function CognitoLoginModal({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToSignup,
}: Props) {
  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const reset = () => {
    setStep("login");
    setEmail("");
    setPassword("");
    setCode("");
    setNewPassword("");
    setError(null);
    setInfo(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력하세요.");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      onSuccess(email);
      reset();
    } catch (err: unknown) {
      const e = err as Error;
      setError(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email) {
      setError("이메일을 입력하세요.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setInfo(`📧 비밀번호 재설정 코드가 ${email} 로 발송됐습니다.`);
      setStep("forgot-confirm");
    } catch (err: unknown) {
      const e = err as Error;
      setError(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!code || !newPassword) {
      setError("코드와 새 비밀번호를 입력하세요.");
      return;
    }
    if (newPassword.length < 12) {
      setError("비밀번호는 12자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      await confirmForgotPassword(email, code, newPassword);
      // 자동 로그인
      await signIn(email, newPassword);
      onSuccess(email);
      reset();
    } catch (err: unknown) {
      const e = err as Error;
      setError(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const primaryBtn: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    background: "#FF9900",
    color: "#0F1629",
    border: "none",
    borderRadius: "8px",
    cursor: loading ? "not-allowed" : "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    opacity: loading ? 0.6 : 1,
    marginBottom: "12px",
  };

  return (
    <div
      className="cognito-login-modal-overlay"
      style={{
        position: "fixed",
        top: "5rem",
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        zIndex: 1001,
        padding: "16px",
        overflowY: "auto",
      }}
    >
      <style>{`
        @media(max-width:480px){
          .cognito-login-modal-overlay{top:4rem!important;}
          .cognito-login-modal-box{padding:24px 20px!important;max-height:calc(100vh - 4rem - 32px);overflow-y:auto;}
        }
      `}</style>
      <div
        className="cognito-login-modal-box"
        style={{
          background: "#0F1629",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "48px 40px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <h2
          style={{
            color: "#fff",
            marginBottom: "12px",
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {step === "login"
            ? "🔐 로그인"
            : step === "forgot-request"
            ? "🔑 비밀번호 재설정"
            : "✉️ 새 비밀번호 설정"}
        </h2>
        <p
          style={{
            color: "#D1D5DB",
            fontSize: "13px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          {step === "login"
            ? "이메일과 비밀번호로 로그인하세요"
            : step === "forgot-request"
            ? "이메일로 재설정 코드를 받으세요"
            : `${email} 로 받은 코드를 입력하세요`}
        </p>

        {error && (
          <div
            style={{
              background: "rgba(220,38,38,0.15)",
              border: "1px solid rgba(220,38,38,0.4)",
              color: "#fca5a5",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "16px",
              whiteSpace: "pre-line",
            }}
          >
            {error}
          </div>
        )}
        {info && (
          <div
            style={{
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.4)",
              color: "#86efac",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {info}
          </div>
        )}

        {step === "login" && (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={primaryBtn}>
              {loading ? "로그인 중..." : "로그인"}
            </button>

            {/* 비밀번호 잊음 + 회원가입 전환 링크 */}
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              <button
                type="button"
                onClick={() => {
                  setStep("forgot-request");
                  setError(null);
                  setInfo(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#FF9900",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "13px",
                  marginRight: "12px",
                }}
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <span style={{ color: "#D1D5DB", fontSize: "13px" }}>
                계정이 없으신가요?{" "}
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onSwitchToSignup();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#FF9900",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "13px",
                  }}
                >
                  회원가입
                </button>
              </span>
            </div>
          </form>
        )}

        {step === "forgot-request" && (
          <form onSubmit={handleForgotRequest}>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={primaryBtn}>
              {loading ? "발송 중..." : "재설정 코드 받기"}
            </button>
            <button
              type="button"
              onClick={() => setStep("login")}
              style={{
                width: "100%",
                padding: "10px",
                background: "transparent",
                color: "#D1D5DB",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              ← 로그인으로 돌아가기
            </button>
          </form>
        )}

        {step === "forgot-confirm" && (
          <form onSubmit={handleForgotConfirm}>
            <input
              type="text"
              placeholder="6자리 인증 코드"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              style={{
                ...inputStyle,
                textAlign: "center",
                letterSpacing: "8px",
                fontSize: "20px",
              }}
            />
            <input
              type="password"
              placeholder="새 비밀번호 (12자 이상, 대/소/숫자/특수)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={primaryBtn}>
              {loading ? "변경 중..." : "비밀번호 변경 + 로그인"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={handleClose}
          style={{
            width: "100%",
            padding: "12px",
            background: "transparent",
            color: "#D1D5DB",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            marginTop: "8px",
          }}
        >
          취소
        </button>
      </div>
    </div>
  );
}
