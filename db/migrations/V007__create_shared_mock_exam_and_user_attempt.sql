-- 공유 모의시험 + 사용자별 풀이 (ai 5단계)
--
-- 설계:
--  - shared_mock_exams       : 하루 1세트, locale 별로 공유 (모든 사용자가 같은 50문제)
--  - user_mock_exam_attempts : 사용자별 풀이 답안/결과만 분리 저장
--
-- 누적 방지 (lifecycle):
--  - 자바 Scheduler 가 매일 UTC 01:00 에 exam_date < (today - 2 days) 인 행을 DELETE
--  - PostgreSQL native partitioning 대신 단순 DELETE — 데이터양 적어 충분
--
-- 자정 생성:
--  - 자바 Scheduler 가 매일 UTC 00:05 에 ko/en/ja 50개씩 생성 → shared_mock_exams INSERT
--  - 사용자는 시험 시작 시 shared_mock_exams 에서 가져옴 (AI 호출 0회)

-- =============================================================================
-- shared_mock_exams : (locale, exam_date) 1행 = 50문제 공유
-- =============================================================================
CREATE TABLE shared_mock_exams (
    locale       VARCHAR(10) NOT NULL CHECK (locale IN ('ko', 'en', 'ja')),
    exam_date    DATE NOT NULL,
    problems     JSONB NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (locale, exam_date)
);

CREATE INDEX idx_shared_mock_exams_date ON shared_mock_exams(exam_date);

-- =============================================================================
-- user_mock_exam_attempts : 사용자별 풀이 답안 + 결과
-- =============================================================================
CREATE TABLE user_mock_exam_attempts (
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    locale       VARCHAR(10) NOT NULL CHECK (locale IN ('ko', 'en', 'ja')),
    exam_date    DATE NOT NULL,
    answers      JSONB,            -- ['A','B','C',...] 50개 (진행 중에는 부분)
    results      JSONB,            -- { correct, wrong, correctRate, ... } — 완료 시점 저장
    started_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,        -- 완료 전엔 NULL
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, locale, exam_date)
);

CREATE INDEX idx_user_mock_exam_attempts_date ON user_mock_exam_attempts(exam_date);

-- updated_at 자동 갱신
CREATE TRIGGER trg_user_mock_exam_attempts_updated_at
BEFORE UPDATE ON user_mock_exam_attempts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
