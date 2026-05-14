-- 사용자 메인 테이블
-- - cognito_sub: Cognito User Pool 의 user ID 와 1:1 매핑
-- - role: 'user' 또는 'admin' (이전에 환경변수로 관리하던 admin 판단을 DB로 이동)

CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  cognito_sub     VARCHAR(255) UNIQUE NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  display_name    VARCHAR(255),
  exam_start_date DATE,
  is_premium      BOOLEAN DEFAULT FALSE,
  premium_until   TIMESTAMP,
  streak          INT DEFAULT 0,
  role            VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  last_login_at   TIMESTAMP
);

-- email 검색 자주 사용
CREATE INDEX idx_users_email ON users(email);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- admin 계정 시드 (마이그레이션 시점에 admin이 존재해야 안전)
INSERT INTO users (cognito_sub, email, role)
VALUES ('PENDING_MIGRATION', 'imjaichoipro@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';