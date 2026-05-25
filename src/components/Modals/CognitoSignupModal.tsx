// Cognito 회원가입 모달
// -----------------------------------------------------------------
// 디자인은 기존 renderLoginModal 의 톤 그대로 유지 (#0F1629, FF9900)
// 3단계 흐름:
//   1) signup: email + password → Cognito SignUp → 코드 발송
//   2) confirm: 6자리 코드 입력 → confirmSignUp → 자동 로그인
//   3) success: onSuccess(email) callback 호출 → 부모가 state 업데이트

import React, { useState } from "react";
import { signUp, confirmSignUp, signIn, resendConfirmationCode } from "../../auth/cognito";
import { useLocale } from "../../LocaleContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

type Step = "signup" | "confirm";

export function CognitoSignupModal({ isOpen, onClose, onSuccess }: Props) {
  const { t } = useLocale();
  const [step, setStep] = useState<Step>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const reset = () => {
    setStep("signup");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setCode("");
    setError(null);
    setInfo(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password || !passwordConfirm) {
      setError(t("cognitoErrAllFieldsRequired"));
      return;
    }
    if (password !== passwordConfirm) {
      setError(t("cognitoErrPwMismatch"));
      return;
    }
    if (password.length < 12) {
      setError(t("cognitoErrPwTooShortSignup"));
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      setInfo(t("cognitoInfoSignupCodeSent").replace("{email}", email));
      setStep("confirm");
    } catch (err: unknown) {
      const e = err as Error;
      setError(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!code) {
      setError(t("cognitoErrCodeRequired"));
      return;
    }

    setLoading(true);
    try {
      await confirmSignUp(email, code);
      // 자동 로그인까지
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

  const handleResend = async () => {
    setError(null);
    try {
      await resendConfirmationCode(email);
      setInfo(t("cognitoInfoCodeResent").replace("{email}", email));
    } catch (err: unknown) {
      const e = err as Error;
      setError(`❌ ${e.message}`);
    }
  };

  return (
    <div
      className="cognito-modal-overlay"
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
          .cognito-modal-overlay{top:4rem!important;}
          .cognito-modal-box{padding:24px 20px!important;max-height:calc(100vh - 4rem - 32px);overflow-y:auto;}
        }
      `}</style>
      <div
        className="cognito-modal-box"
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
          {step === "signup" ? t("cognitoSignupTitle") : t("cognitoEmailVerifyTitle")}
        </h2>
        <p
          style={{
            color: "#D1D5DB",
            fontSize: "13px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          {step === "signup"
            ? t("cognitoSignupDesc")
            : t("cognitoEmailVerifyDesc").replace("{email}", email)}
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

        {step === "signup" ? (
          <form onSubmit={handleSignUp}>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            <input
              type="password"
              placeholder={t("cognitoSignupPwPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            <input
              type="password"
              placeholder={t("cognitoSignupPwConfirmPlaceholder")}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "16px",
                background: "rgba(255,255,255,0.05)",
                border:
                  passwordConfirm.length > 0 && passwordConfirm !== password
                    ? "1px solid rgba(220,38,38,0.5)"
                    : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            {passwordConfirm.length > 0 && passwordConfirm !== password && (
              <div
                style={{
                  color: "#fca5a5",
                  fontSize: "12px",
                  marginTop: "-12px",
                  marginBottom: "12px",
                }}
              >
                {t("cognitoPwMismatchHint")}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
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
              }}
            >
              {loading ? t("cognitoProcessing") : t("cognitoSignupBtn")}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirm}>
            <input
              type="text"
              placeholder={t("cognitoCodePlaceholder")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "20px",
                textAlign: "center",
                letterSpacing: "8px",
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
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
                marginBottom: "8px",
              }}
            >
              {loading ? t("cognitoConfirming") : t("cognitoVerifyAndLogin")}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
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
              {t("cognitoResendCode")}
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
          {t("cancelBtn")}
        </button>
      </div>
    </div>
  );
}
