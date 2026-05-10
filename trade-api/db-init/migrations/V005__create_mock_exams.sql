-- 모의시험 (Mock Exams) - 사용자별 오늘의 모의시험 진행 상태
-- - PK: user_id + locale + exam_date (하루에 하나)
-- - problems JSONB: 50문제 배열
-- - 진행 중에 점진적 update (updateMockExamProblemsProgressively)
-- - 종료 시 results 컬럼에 점수/정답률 저장

CREATE TABLE mock_exams (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  locale      VARCHAR(10) NOT NULL CHECK (locale IN ('ko', 'en', 'ja')),
  exam_date   DATE NOT NULL,
  problems    JSONB NOT NULL DEFAULT '[]'::jsonb,
  answers     JSONB DEFAULT '[]'::jsonb,
  results     JSONB,
  started_at  TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT NOW(),

  -- 같은 유저가 같은 날 한 번 (locale 별)
  UNIQUE (user_id, locale, exam_date)
);

CREATE INDEX idx_mock_exams_user ON mock_exams(user_id, exam_date DESC);

-- updated_at 자동 갱신
CREATE TRIGGER trg_mock_exams_updated_at
BEFORE UPDATE ON mock_exams
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
