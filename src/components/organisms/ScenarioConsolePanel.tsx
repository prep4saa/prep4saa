import { useLocale } from "../../LocaleContext";

const UI_COPY = {
  ko: {
    title: "SEC 시나리오 콘솔",
    ready: "시나리오 문제를 선택하고 AWS CLI 명령어를 입력해 보세요.",
    selectScenario: "왼쪽 목록에서 문제를 선택하면 콘솔이 시작됩니다.",
    inputHint: "현재 스텝만 채점됩니다.",
    stepLabel: "스텝",
    hintLabel: "힌트",
    answerLabel: "정답",
    runBtn: "실행",
    emptyState: "현재 이 패널은 안내용으로 표시됩니다.",
  },
  en: {
    title: "SEC Scenario Console",
    ready: "Choose a scenario and enter the AWS CLI command.",
    selectScenario: "Pick a problem from the list on the left to start the console.",
    inputHint: "Only the current step is graded.",
    stepLabel: "Step",
    hintLabel: "Hint",
    answerLabel: "Answer",
    runBtn: "Run",
    emptyState: "This panel is currently shown as a guide view.",
  },
  ja: {
    title: "SEC シナリオコンソール",
    ready: "シナリオを選んで、AWS CLI コマンドを入力してください。",
    selectScenario: "左の一覧から問題を選ぶとコンソールが始まります。",
    inputHint: "現在のステップだけが採点されます。",
    stepLabel: "ステップ",
    hintLabel: "ヒント",
    answerLabel: "答え",
    runBtn: "実行",
    emptyState: "このパネルは現在、案内用の表示です。",
  },
} as const;

function ScenarioConsolePanel() {
  const { locale } = useLocale();
  const copy = UI_COPY[locale];

  return (
    <div
      style={{
        display: "grid",
        gap: "12px",
        padding: "16px",
        border: "1px solid #30363d",
        borderRadius: "10px",
        background: "#0d1117",
        color: "#e6edf3",
      }}
    >
      <div style={{ display: "grid", gap: "4px" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#f0f6fc" }}>{copy.title}</div>
        <div style={{ fontSize: "13px", color: "#8b949e" }}>{copy.ready}</div>
        <div style={{ fontSize: "13px", color: "#8b949e" }}>{copy.selectScenario}</div>
      </div>

      <div
        style={{
          display: "grid",
          gap: "8px",
          padding: "12px",
          border: "1px solid #30363d",
          borderRadius: "8px",
          background: "#161b22",
        }}
      >
        <div style={{ fontSize: "12px", color: "#58a6ff", fontWeight: 700 }}>
          {copy.stepLabel} 1
        </div>
        <div style={{ fontSize: "13px", color: "#c9d1d9" }}>
          {copy.hintLabel}: {copy.inputHint}
        </div>
        <div style={{ fontSize: "13px", color: "#c9d1d9" }}>
          {copy.answerLabel}: {copy.runBtn}
        </div>
      </div>

      <div
        style={{
          padding: "12px",
          borderRadius: "8px",
          background: "rgba(56,139,253,0.08)",
          border: "1px solid rgba(56,139,253,0.25)",
          color: "#d0ebff",
          fontSize: "13px",
          lineHeight: 1.7,
        }}
      >
        {copy.emptyState}
      </div>
    </div>
  );
}

export { ScenarioConsolePanel };
