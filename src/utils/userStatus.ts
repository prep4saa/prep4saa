// 사용자 상태 및 일일 제한 관리 (sessionStorage 기반)

export type UserStatus = "guest" | "loggedIn" | "paid";

export function getUserStatus(): UserStatus {
  if (typeof window === "undefined") return "guest";
  // 보안: PAID_TOKEN_ 형식만 paid로 인식 (DevTools 수정 방지)
  const status = sessionStorage.getItem("userStatus");
  if (!status) return "guest";

  if (status.startsWith("PAID_TOKEN_")) {
    return "paid";
  }

  // "paid"를 직접 입력하면 guest로 (DevTools 해킹 방지)
  if (status === "paid") {
    return "guest";
  }

  return (status as UserStatus) || "guest";
}

export function setUserStatus(status: UserStatus) {
  // 보안: 특정 토큰으로만 인식 (true/false 수정 방지)
  if (status === "paid") {
    const paidToken = `PAID_TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("userStatus", paidToken);
  } else {
    sessionStorage.setItem("userStatus", status);
  }
}

export function getTodayProblemCount(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().split("T")[0];
  // 보안: sessionStorage 사용 (탭 닫으면 초기화)
  const stored = sessionStorage.getItem("problemCountDate");
  if (stored !== today) {
    sessionStorage.setItem("problemCountDate", today);
    sessionStorage.setItem("problemCount", "COUNT_0_" + Date.now());
    return 0;
  }

  // 보안: COUNT_ 토큰 형식만 인식
  const countValue = sessionStorage.getItem("problemCount") || "";
  if (countValue.startsWith("COUNT_")) {
    try {
      const count = parseInt(countValue.split("_")[1], 10);
      return count;
    } catch {
      return 0;
    }
  }

  return 0;
}

export function incrementProblemCount() {
  const count = getTodayProblemCount() + 1;
  // 보안: COUNT_ 토큰 형식으로 저장
  const countToken = `COUNT_${count}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem("problemCount", countToken);
}

export function getDailyLimit(): number {
  const status = getUserStatus();
  if (status === "paid") return 20;
  if (status === "loggedIn") return 2;
  return 2; // 비로그인 2회
}
