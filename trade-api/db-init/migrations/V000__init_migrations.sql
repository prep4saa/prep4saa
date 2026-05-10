-- 마이그레이션 추적 테이블 (Flyway 컨벤션)
-- - 어떤 V파일이 적용됐는지, 언제, 누가, 체크섬은?
-- - 같은 V파일 두 번 실행 방지

CREATE TABLE IF NOT EXISTS schema_migrations (
  version       VARCHAR(50) PRIMARY KEY,    -- 'V001'
  description   VARCHAR(255) NOT NULL,
  checksum      VARCHAR(64),                 -- SHA256 of file
  applied_at    TIMESTAMP DEFAULT NOW(),
  applied_by    VARCHAR(100)                 -- Lambda ARN 또는 사용자
);
