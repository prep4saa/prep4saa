import { useLocale } from "../../LocaleContext";

interface AdminStatsGridProps {
  todayVisitors: number;
  totalVisitors: number;
  paidUsers: number;
  freeUsers: number;
}

export default function AdminStatsGrid({
  todayVisitors, totalVisitors, paidUsers, freeUsers,
}: AdminStatsGridProps) {
  const { t } = useLocale();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      <div style={{
        background: "rgba(255,153,0,0.1)",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "1px solid rgba(255,153,0,0.3)"
      }}>
        <div style={{ fontSize: "11px", color: "#D1D5DB", marginBottom: "8px", fontWeight: 600 }}>
          {t("adminTodayVisitors")}
        </div>
        <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--accent)" }}>
          {todayVisitors}
        </div>
      </div>

      <div style={{
        background: "rgba(168,85,247,0.1)",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "1px solid rgba(168,85,247,0.3)"
      }}>
        <div style={{ fontSize: "11px", color: "#D1D5DB", marginBottom: "8px", fontWeight: 600 }}>
          {t("adminTotalVisitors")}
        </div>
        <div style={{ fontSize: "32px", fontWeight: 700, color: "#c4b5fd" }}>
          {totalVisitors}
        </div>
      </div>

      <div style={{
        background: "rgba(34,197,94,0.1)",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "1px solid rgba(34,197,94,0.3)"
      }}>
        <div style={{ fontSize: "11px", color: "#D1D5DB", marginBottom: "8px", fontWeight: 600 }}>
          {t("adminPaidUsers")}
        </div>
        <div style={{ fontSize: "32px", fontWeight: 700, color: "#4ade80" }}>
          {paidUsers}
        </div>
      </div>

      <div style={{
        background: "rgba(249,115,22,0.1)",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "1px solid rgba(249,115,22,0.3)"
      }}>
        <div style={{ fontSize: "11px", color: "#D1D5DB", marginBottom: "8px", fontWeight: 600 }}>
          {t("adminFreeUsers")}
        </div>
        <div style={{ fontSize: "32px", fontWeight: 700, color: "#fb923c" }}>
          {freeUsers}
        </div>
      </div>
    </div>
  );
}
