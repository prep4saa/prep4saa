import { useEffect, useState } from "react";
import { useLocale } from "../../LocaleContext";
import { createPost, getCurrentUser } from "../../firebase";

interface PostFormModalProps {
  open: boolean;
  onClose: () => void;
  userEmail: string | null;
  /** 게시글 등록 성공 후 부모가 목록을 갱신할 수 있도록 호출됨 */
  onSubmitted: () => void | Promise<void>;
}

interface PostFormData {
  title: string;
  content: string;
  password: string;
  isPublic: boolean;
}

const INITIAL_FORM: PostFormData = { title: "", content: "", password: "", isPublic: true };

export default function PostFormModal({ open, onClose, userEmail, onSubmitted }: PostFormModalProps) {
  const { t, locale } = useLocale();
  const [form, setForm] = useState<PostFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  // 모달이 열릴 때마다 폼 초기화
  useEffect(() => {
    if (open) setForm(INITIAL_FORM);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert(locale === "en" ? "Please fill in all fields" : locale === "ja" ? "すべてのフィールドに入力してください" : "모든 항목을 입력하세요");
      return;
    }
    if (!form.isPublic && !form.password.trim()) {
      alert(t("postsPasswordRequired"));
      return;
    }
    setLoading(true);
    try {
      const user = getCurrentUser();
      await createPost(
        form.title,
        form.content,
        userEmail?.split("@")[0] || "Guest",
        user?.uid || "guest",
        form.isPublic,
        form.password || undefined
      );
      setForm(INITIAL_FORM);
      onClose();
      await onSubmitted();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#0b0f1e",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "500px",
        width: "90%",
        maxHeight: "80vh",
        overflowY: "auto"
      }}>
        <h3 style={{ fontSize: "16px", color: "#e2e8f0", marginBottom: "16px" }}>
          {t("postsWrite")}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Title */}
          <input
            type="text"
            placeholder={t("postsTitle")}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={100}
            style={{
              padding: "10px",
              background: "#2A344A",
              border: "1px solid #2A344A",
              borderRadius: "6px",
              color: "#D1D5DB",
              fontSize: "13px"
            }}
          />
          {/* Author Name (표시 전용) */}
          <input
            type="text"
            placeholder={userEmail?.split("@")[0] || t("postsAuthor")}
            value={userEmail?.split("@")[0] || ""}
            disabled={true}
            maxLength={50}
            style={{
              padding: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid #2A344A",
              borderRadius: "6px",
              color: "#D1D5DB",
              fontSize: "13px",
              cursor: "not-allowed"
            }}
          />
          {/* Content */}
          <textarea
            placeholder={t("postsContent")}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value.slice(0, 800) })}
            maxLength={800}
            style={{
              padding: "10px",
              background: "#2A344A",
              border: "1px solid #2A344A",
              borderRadius: "6px",
              color: "#D1D5DB",
              fontSize: "13px",
              minHeight: "150px",
              fontFamily: "inherit",
              resize: "vertical"
            }}
          />
          <div style={{ fontSize: "11px", color: "#64748b", textAlign: "right" }}>
            {form.content.length}/800
          </div>
          {/* Public/Private Toggle */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setForm({ ...form, isPublic: true, password: "" })}
              style={{
                flex: 1,
                padding: "8px",
                background: form.isPublic ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)",
                border: form.isPublic ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: form.isPublic ? "#10b981" : "#D1D5DB",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              {t("postsPublic")}
            </button>
            <button
              onClick={() => setForm({ ...form, isPublic: false })}
              style={{
                flex: 1,
                padding: "8px",
                background: !form.isPublic ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)",
                border: !form.isPublic ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: !form.isPublic ? "#ef4444" : "#D1D5DB",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              {t("postsSecret")}
            </button>
          </div>
          {/* Password (if private) */}
          {!form.isPublic && (
            <input
              type="password"
              placeholder={t("postsPassword")}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value.slice(0, 20) })}
              maxLength={20}
              autoComplete="new-password"
              style={{
                padding: "10px",
                background: "#2A344A",
                border: "1px solid #2A344A",
                borderRadius: "6px",
                color: "#D1D5DB",
                fontSize: "13px"
              }}
            />
          )}
          {/* Buttons */}
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button
              onClick={() => { void handleSubmit(); }}
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px",
                background: loading ? "rgba(255,153,0,0.1)" : "rgba(255,153,0,0.2)",
                border: "1px solid rgba(255,153,0,0.4)",
                borderRadius: "6px",
                color: "#a78bfa",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: 600
              }}
            >
              {loading ? t("postsSubmitting") : t("postsSubmit")}
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid #2A344A",
                borderRadius: "6px",
                color: "#D1D5DB",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              {t("postsCancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
