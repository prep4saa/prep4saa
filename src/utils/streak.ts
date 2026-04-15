// 연속 방문 일수 + D-Day 카운트다운 (localStorage 기반)

/**
 * 연속 방문 일수 계산 및 업데이트
 */
export function updateStreak(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().split("T")[0];
  const lastVisitDate = localStorage.getItem("lastVisitDate");
  let streak = parseInt(localStorage.getItem("streak") || "0");

  if (lastVisitDate === today) {
    return streak;
  }

  if (lastVisitDate) {
    const lastDate = new Date(lastVisitDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  localStorage.setItem("lastVisitDate", today);
  localStorage.setItem("streak", streak.toString());
  return streak;
}

export function getExamDday(): string {
  if (typeof window === "undefined") return "-";
  const examDate = localStorage.getItem("examStartDate");
  if (!examDate) return "-";

  const exam = new Date(examDate);
  const now = new Date();

  exam.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diff = exam.getTime() - now.getTime();
  const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) return "D-Day";
  return `D-${daysLeft}`;
}
