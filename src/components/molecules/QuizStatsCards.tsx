import { useLocale } from "../../LocaleContext";

interface QuizStats {
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
}

interface QuizStatsCardsProps {
  stats: QuizStats | null;
}

/**
 * 현황 탭 상단의 2칸 통계 카드 (총 문제 수 + 정답률).
 */
export default function QuizStatsCards({ stats }: QuizStatsCardsProps) {
  const { t } = useLocale();
  const accuracyColor =
    stats && stats.accuracy >= 70 ? "#10b981"
    : stats && stats.accuracy >= 50 ? "#f59e0b"
    : "#ef4444";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      {/* Total Problems */}
      <div style={{
        background: "#1A253D",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "1px solid #2A344A"
      }}>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "#e2e8f0", marginBottom: "8px" }}>
          {stats?.totalAttempts ?? 0}
        </div>
        <div style={{ fontSize: "11px", color: "#64748b" }}>
          {t("totalProblems")}
        </div>
      </div>

      {/* Correct Rate */}
      <div style={{
        background: "#1A253D",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "1px solid #2A344A"
      }}>
        <div style={{ fontSize: "24px", fontWeight: 700, color: accuracyColor, marginBottom: "8px" }}>
          {stats?.accuracy ?? 0}%
        </div>
        <div style={{ fontSize: "11px", color: "#64748b" }}>
          {t("correctRate")} ({stats?.correctCount ?? 0}/{stats?.totalAttempts ?? 0})
        </div>
      </div>
    </div>
  );
}
