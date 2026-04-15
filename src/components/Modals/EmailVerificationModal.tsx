import { useLocale } from "../../LocaleContext";

interface EmailVerificationModalProps {
  open: boolean;
  email: string;
  message: string | null;
  resending: boolean;
  onResendClick: () => void | Promise<void>;
  onClose: () => void;
}

export default function EmailVerificationModal({
  open, email, message, resending, onResendClick, onClose,
}: EmailVerificationModalProps) {
  const { t } = useLocale();

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 99999,
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        backgroundColor: "#1e293b",
        borderRadius: "12px",
        padding: "40px",
        maxWidth: "500px",
        width: "90%",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}>
        {/* Close Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "24px",
              padding: "0",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <h2 style={{ color: "#fff", margin: "0 0 12px 0", fontSize: "24px", textAlign: "center" }}>
          {t("emailVerificationCheckEmail")}
        </h2>

        <div style={{
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "24px",
        }}>
          <p style={{ color: "#93c5fd", margin: "0", fontSize: "14px", lineHeight: "1.6" }}>
            {t("emailVerificationCheckEmailDesc").replace("{email}", email)}
          </p>
        </div>

        {/* Message */}
        {message && (
          <p style={{ color: "#cbd5e1", fontSize: "14px", margin: "0 0 24px 0", lineHeight: "1.6", textAlign: "center" }}>
            {message}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexDirection: "column" }}>
          <button
            onClick={() => { void onResendClick(); }}
            disabled={resending}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: resending ? "#6b7280" : "#6366f1",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "14px",
              cursor: resending ? "not-allowed" : "pointer",
              fontWeight: "600",
              transition: "background-color 0.2s",
              opacity: resending ? 0.7 : 1,
            }}
          >
            {resending ? t("emailVerificationResending") : t("emailVerificationResendBtn")}
          </button>

          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "6px",
              color: "#cbd5e1",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: "500",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "transparent";
            }}
          >
            {t("cancelBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
