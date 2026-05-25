import { useState, useEffect } from "react";
import { useLocale } from "../../LocaleContext";
import { getCurrentUser, saveExamStartDate } from "../../firebase";

interface ExamDateModalProps {
  open: boolean;
  onClose: () => void;
  /** 저장 완료 후 부모에게 새로 저장된 날짜를 알림 (D-day 갱신용) */
  onSaved?: (date: string) => void;
}

export default function ExamDateModal({ open, onClose, onSaved }: ExamDateModalProps) {
  const { t } = useLocale();
  const [date, setDate] = useState<string>(() =>
    localStorage.getItem("examStartDate") || new Date().toISOString().split("T")[0]
  );
  const [resultText, setResultText] = useState<string>("");

  // 모달이 열릴 때마다 현재 저장된 값으로 초기화
  useEffect(() => {
    if (!open) return;
    const saved = localStorage.getItem("examStartDate") || new Date().toISOString().split("T")[0];
    setDate(saved);
    setResultText(t("examSelectDate"));
  }, [open, t]);

  if (!open) return null;

  const recomputeResult = (value: string) => {
    const examDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    const diff = examDate.getTime() - today.getTime();
    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (daysLeft > 0) return t("examDaysRemaining").replace("{n}", daysLeft.toString());
    if (daysLeft === 0) return t("examToday");
    return t("examDatePassed");
  };

  const handleSave = async () => {
    localStorage.setItem("examStartDate", date);
    const user = getCurrentUser();
    if (user) {
      try {
        await saveExamStartDate(user.uid, date);
      } catch {
        /* ignore */
      }
    }
    onSaved?.(date);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1001
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
          padding: "32px", maxWidth: "450px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ color: "#fff", marginBottom: "24px", fontSize: "20px", textAlign: "center" }}>
          {t("examStartDateSetting")}
        </h2>
        <div style={{ marginBottom: "24px" }}>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setResultText(recomputeResult(e.target.value));
            }}
            style={{
              width: "100%", padding: "10px", background: "rgba(255,255,255,0.05)",
              border: "1px solid #2A344A", borderRadius: "6px",
              color: "#D1D5DB", fontSize: "14px", boxSizing: "border-box"
            }}
          />
          <div
            style={{
              marginTop: "16px", padding: "12px", background: "rgba(255,153,0,0.1)",
              border: "1px solid rgba(255,153,0,0.3)", borderRadius: "6px",
              fontSize: "14px", color: "var(--accent)", textAlign: "center", fontWeight: 600
            }}
          >
            {resultText || t("examSelectDate")}
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1, padding: "12px", background: "#FF9900", color: "#0F1629",
              border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
            }}
          >
            {t("examSetCompleteBtn")}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)", color: "#D1D5DB",
              border: "1px solid #2A344A", borderRadius: "6px", cursor: "pointer"
            }}
          >
            {t("cancelBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
