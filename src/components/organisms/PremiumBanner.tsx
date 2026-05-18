import { useLocale } from "../../LocaleContext";
import type { UserStatus } from "../../utils/userStatus";

interface PremiumBannerProps {
  userStatus: UserStatus;
  userEmail: string | null;
  onLoginClick: () => void;
  onUpgradeClick: () => void;
}

/**
 * 프리미엄 업그레이드 배너.
 * paid 사용자에게는 노출되지 않음.
 * 비로그인 상태에서 업그레이드 버튼을 누르면 로그인 모달로 유도.
 */
export default function PremiumBanner({
  userStatus,
  userEmail: _userEmail,
  onLoginClick,
  onUpgradeClick,
}: PremiumBannerProps) {
  const { t } = useLocale();

  if (userStatus === "paid") return null;

  // guest 면 로그인 모달, 로그인 상태면 결제 핸들러 호출.
  const handleClick = userStatus === "guest" ? onLoginClick : onUpgradeClick;

  return (
    <div style={{
      marginTop: "16px", padding: "14px",
      background: "linear-gradient(135deg, rgba(255,153,0,0.2) 0%, rgba(255,153,0,0.15) 100%)",
      border: "1px solid rgba(255,153,0,0.3)", borderRadius: "8px", textAlign: "center"
    }}>
      <div style={{ color: "#e0e7ff", fontSize: "12px", marginBottom: "8px" }}>
        <strong>{t("premiumTitle")}</strong>
      </div>
      <div style={{ color: "#D1D5DB", fontSize: "13px", fontWeight: "bold", marginBottom: "10px" }}>
        {t("premiumFeature1")} - <span style={{ color: "#FF9900" }}>{t("premiumPrice")}</span>
      </div>
      <div style={{ color: "#D1D5DB", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
        {t("mockExamPremiumDaily")}
      </div>
      <button
        onClick={handleClick}
        style={{
          width: "100%", padding: "10px",
          background: "#FF9900", color: "#0F1629",
          border: "none", borderRadius: "6px",
          cursor: "pointer", fontSize: "12px", fontWeight: "bold"
        }}
      >
        {t("premiumUpgradeBtn")}
      </button>
    </div>
  );
}
