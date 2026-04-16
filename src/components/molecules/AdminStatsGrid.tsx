interface AdminStatsGridProps {
  todayVisitors: number;
  totalVisitors: number;
  paidUsers: number;
  freeUsers: number;
}

/**
 * 관리자 패널 상단의 2x2 통계 카드 그리드.
 * 오늘 방문자 / 전체 방문자 / 유료 사용자 / 2회 무료 사용자.
 */
export default function AdminStatsGrid({
  todayVisitors, totalVisitors, paidUsers, freeUsers,
}: AdminStatsGridProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      {/* 오늘 방문자 */}
      <div style={{
        background: "rgba(255,153,0,0.1)",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "1px solid rgba(255,153,0,0.3)"
      }}>
        <div style={{ fontSize: "11px", color: "#D1D5DB", marginBottom: "8px", fontWeight: 600 }}>
          오늘 방문자
        </div>
        <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--accent)" }}>
          {todayVisitors}
        </div>
      </div>

      {/* 전체 방문자 */}
      <div style={{
        background: "rgba(168,85,247,0.1)",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "1px solid rgba(168,85,247,0.3)"
      }}>
        <div style={{ fontSize: "11px", color: "#D1D5DB", marginBottom: "8px", fontWeight: 600 }}>
          전체 방문자
        </div>
        <div style={{ fontSize: "32px", fontWeight: 700, color: "#c4b5fd" }}>
          {totalVisitors}
        </div>
      </div>

      {/* 유료 사용자 */}
      <div style={{
        background: "rgba(34,197,94,0.1)",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "1px solid rgba(34,197,94,0.3)"
      }}>
        <div style={{ fontSize: "11px", color: "#D1D5DB", marginBottom: "8px", fontWeight: 600 }}>
          유료 사용자
        </div>
        <div style={{ fontSize: "32px", fontWeight: 700, color: "#4ade80" }}>
          {paidUsers}
        </div>
      </div>

      {/* 2회 무료 사용자 */}
      <div style={{
        background: "rgba(249,115,22,0.1)",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "1px solid rgba(249,115,22,0.3)"
      }}>
        <div style={{ fontSize: "11px", color: "#D1D5DB", marginBottom: "8px", fontWeight: 600 }}>
          2회 무료 사용자
        </div>
        <div style={{ fontSize: "32px", fontWeight: 700, color: "#fb923c" }}>
          {freeUsers}
        </div>
      </div>
    </div>
  );
}
