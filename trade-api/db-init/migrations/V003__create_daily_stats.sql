-- 일일 문제 생성 카운터
-- - PK 가 (user_id, date) 복합키 → 자연스러운 UPSERT 가능
-- - DynamoDB user-daily-count 와 중복되어 보이지만, 영속성 + 분석용
-- - DynamoDB: 빠른 카운터 (TTL 자동 삭제)
-- - PostgreSQL: 영구 보관 + 통계 분석

CREATE TABLE daily_stats (
  user_id           INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  problem_count     INT DEFAULT 0,
  last_generated_at TIMESTAMP,

  PRIMARY KEY (user_id, date)
);

-- 날짜별 전체 사용자 통계 (admin 화면)
CREATE INDEX idx_daily_stats_date ON daily_stats(date);
