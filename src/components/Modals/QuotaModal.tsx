import { useLocale } from "../../LocaleContext";
import type { UserStatus } from "../../utils/userStatus";

interface QuotaModalProps {
  open: boolean;
  userStatus: UserStatus;
  onClose: () => void;
  /** guest 에서 "로그인" 버튼을 눌렀을 때 동작 (상태 전환 & 카운터 리셋) */
  onLoginAsLoggedIn: () => void;
  /** "프리미엄 업그레이드" 버튼을 눌렀을 때 결제 페이지 이동 */
  onCheckout: () => void | Promise<void>;
}

export default function QuotaModal({
  open, userStatus, onClose, onLoginAsLoggedIn, onCheckout,
}: QuotaModalProps) {
  const { t } = useLocale();

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
          padding: "32px", maxWidth: "500px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ color: "#fff", marginBottom: "16px", fontSize: "20px" }}>
          {t("labelQuotaFull") || "Quota Limited"}
        </h2>

        <div style={{ marginBottom: "24px", color: "#D1D5DB", lineHeight: "1.6", fontSize: "14px" }}>
          {userStatus === "guest" && (
            <>
              <p> <strong>Guest (비로그인):</strong> 하루 2회 무료</p>
              <p style={{ marginTop: "12px" }}>
                로그인하면 하루 <strong>2회 무료</strong>를 이용할 수 있으며, 결제 후에는 <strong>하루 20개 문제</strong>를 생성할 수 있습니다.
              </p>
              <div style={{ marginTop: "16px", padding: "12px", background: "rgba(255,153,0,0.15)", borderRadius: "6px", border: "1px solid rgba(255,153,0,0.3)" }}>
                <p style={{ margin: "0 0 8px 0", color: "#e0e7ff", fontWeight: "bold" }}> {t("premiumPlan")}</p>
                <p style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#FF9900", fontWeight: "bold" }}>{t("premiumPrice")}</p>
                <p style={{ margin: "0", fontSize: "12px" }}>
                  {t("premiumUnlimited")}<br />
                  {t("premiumAllDifficulty")}<br />
                  {t("premiumAdFree")}<br />
                  {t("premiumCancelAnytime")}
                </p>
              </div>
            </>
          )}
          {userStatus === "loggedIn" && (
            <>
              <p> <strong>로그인:</strong> 2회 무료 이용 완료</p>
              <p style={{ marginTop: "12px" }}>
                결제하시면 <strong>하루 20개 문제</strong>를 생성하실 수 있습니다!
              </p>
              <div style={{ marginTop: "16px", padding: "12px", background: "rgba(255,153,0,0.15)", borderRadius: "6px", border: "1px solid rgba(255,153,0,0.3)" }}>
                <p style={{ margin: "0 0 8px 0", color: "#e0e7ff", fontWeight: "bold" }}> {t("premiumPlan")}</p>
                <p style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#FF9900", fontWeight: "bold" }}>{t("premiumPrice")}</p>
                <p style={{ margin: "0", fontSize: "12px" }}>
                  {t("premiumUnlimited")}<br />
                  {t("premiumAllDifficulty")}<br />
                  {t("premiumAdFree")}<br />
                  {t("premiumCancelAnytime")}
                </p>
              </div>
            </>
          )}
          {userStatus === "paid" && (
            <>
              <p> <strong>Premium (결제):</strong> 하루 20개 문제 이용 중</p>
              <p style={{ marginTop: "12px" }}>내일 자정에 카운트가 초기화됩니다.</p>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          {userStatus === "guest" && (
            <>
              <button
                onClick={onLoginAsLoggedIn}
                style={{
                  flex: 1, padding: "12px", background: "#FF9900", color: "#0F1629",
                  border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
                }}
              >
                로그인
              </button>
              <button
                onClick={() => { void onCheckout(); }}
                style={{
                  flex: 1, padding: "12px", background: "#FF9900", color: "#0F1629",
                  border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
                }}
              >
                프리미엄 업그레이드
              </button>
            </>
          )}
          {userStatus === "loggedIn" && (
            <button
              onClick={() => { void onCheckout(); }}
              style={{
                flex: 1, padding: "12px", background: "#FF9900", color: "#0F1629",
                border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
              }}
            >
              프리미엄 업그레이드
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)", color: "#D1D5DB",
              border: "1px solid #2A344A", borderRadius: "6px", cursor: "pointer"
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
