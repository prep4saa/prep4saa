-- 퀴즈 풀이 결과 (Firestore quizResults 서브컬렉션 → 별도 테이블)
-- - users 와 외래키 ON DELETE CASCADE: 사용자 삭제 시 자동 정리
-- - expires_at: Firestore 의 24h TTL 을 흉내 (별도 cron 으로 삭제)

CREATE TABLE quiz_results (
  id                 SERIAL PRIMARY KEY,
  user_id            INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id         VARCHAR(255),
  question_id        VARCHAR(255),
  difficulty         VARCHAR(20) CHECK (difficulty IN ( 'medium')),
  full_problem       JSONB,
  user_answer        TEXT,
  is_correct         BOOLEAN,
  time_spent_seconds INT DEFAULT 0,
  created_at         TIMESTAMP DEFAULT NOW(),
  expires_at         TIMESTAMP
);

-- 사용자별 조회 (가장 흔한 패턴)
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);

-- 사용자별 최신순 조회 (페이징)
CREATE INDEX idx_quiz_results_user_created
  ON quiz_results(user_id, created_at DESC);

-- 만료 예정 row 만 필터 (PARTIAL INDEX, 디스크 절약)
CREATE INDEX idx_quiz_results_expires
  ON quiz_results(expires_at)
  WHERE expires_at IS NOT NULL;
