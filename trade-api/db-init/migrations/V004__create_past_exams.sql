-- 기출문제 (Past Exams)
-- - 모의시험을 마친 후 누적되는 공개 문제 풀
-- - locale 별로 분리 (한국어/영어/일본어)
-- - order_num 으로 페이지네이션 (1, 2, 3, ... 순서)
-- - problem_data JSONB: 문제/선택지/정답/해설 모두 포함

CREATE TABLE past_exams (
  id           SERIAL PRIMARY KEY,
  locale       VARCHAR(10) NOT NULL CHECK (locale IN ('ko', 'en', 'ja')),
  order_num    INT NOT NULL,
  problem_data JSONB NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW(),

  UNIQUE (locale, order_num)
);

-- 페이지네이션 인덱스: locale 별로 order_num 정렬 조회
CREATE INDEX idx_past_exams_locale_order
  ON past_exams (locale, order_num);
