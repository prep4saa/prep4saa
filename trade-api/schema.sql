CREATE TABLE quiz_results (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  question_id VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20),
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_user_id ON quiz_results(user_id);
CREATE INDEX idx_user_created ON quiz_results(user_id, created_at DESC);