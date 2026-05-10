const { Client } = require("pg");
const Redis = require("ioredis");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Redis 연결 (lazy: 컨테이너 재사용 시 한 번만 연결)
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
  connectTimeout: 5000,
  maxRetriesPerRequest: 2,
});

const CACHE_TTL_SECONDS = 1800; // 30분
const MIGRATIONS_DIR = path.join(__dirname, "migrations");

// migrations/ 폴더의 V*.sql 파일을 정렬된 메타데이터 배열로 반환
// - Flyway 컨벤션: V<번호>__<설명>.sql
function loadMigrations() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => /^V\d+__.+\.sql$/.test(f))
    .sort();

  return files.map(filename => {
    const filepath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filepath, "utf8");
    const version = filename.match(/^(V\d+)__/)[1];
    const description = filename.match(/__(.+)\.sql$/)[1];
    const checksum = crypto.createHash("sha256").update(sql).digest("hex");

    return { version, description, filename, sql, checksum };
  });
}

exports.handler = async (event) => {
  const action = event.action || "init";

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("✅ DB 연결 성공");

  try {
    if (action === "init") {
      await client.query(`
        CREATE TABLE IF NOT EXISTS quiz_results (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          question_id VARCHAR(255) NOT NULL,
          difficulty VARCHAR(20),
          is_correct BOOLEAN NOT NULL,
          time_spent_seconds INT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_id ON quiz_results(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_created ON quiz_results(user_id, created_at DESC);`);

      return { statusCode: 200, body: JSON.stringify({ message: "테이블 생성 완료" }) };
    }

    if (action === "seed") {
      const users = ["imjaichoipro@gmail.com", "test1@example.com", "test2@example.com"];
      const difficulties = ["easy", "medium", "hard"];

      for (let i = 0; i < 100; i++) {
        await client.query(
          `INSERT INTO quiz_results (user_id, question_id, difficulty, is_correct, time_spent_seconds)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            users[i % users.length],
            `Q-${i}`,
            difficulties[i % 3],
            Math.random() > 0.3,
            Math.floor(Math.random() * 60) + 30,
          ]
        );
      }

      const cacheKeys = users.map(u => `stats:${u}`);
      if (cacheKeys.length > 0) {
        await redis.del(...cacheKeys);
        console.log(`🗑️ 캐시 무효화: ${cacheKeys.length}개`);
      }

      return { statusCode: 200, body: JSON.stringify({ message: "샘플 데이터 100건 삽입 완료" }) };
    }

    if (action === "query") {
      const userId = event.userId || "imjaichoipro@gmail.com";
      const cacheKey = `stats:${userId}`;
      const start = Date.now();

      const cached = await redis.get(cacheKey);
      if (cached) {
        const elapsed = Date.now() - start;
        console.log(`⚡ CACHE HIT for ${userId} (${elapsed}ms)`);
        return {
          statusCode: 200,
          body: JSON.stringify({
            ...JSON.parse(cached),
            _cached: true,
            _elapsedMs: elapsed,
          }),
        };
      }

      console.log(`🐢 CACHE MISS for ${userId} - querying DB`);
      const result = await client.query(
        `SELECT
           COUNT(*) AS total,
           COUNT(CASE WHEN is_correct THEN 1 END) AS correct,
           ROUND(100.0 * COUNT(CASE WHEN is_correct THEN 1 END) / COUNT(*), 2) AS accuracy
         FROM quiz_results
         WHERE user_id = $1`,
        [userId]
      );

      const stats = result.rows[0];
      await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(stats));

      const elapsed = Date.now() - start;
      console.log(`✅ DB 조회 + 캐시 저장 완료 (${elapsed}ms)`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          ...stats,
          _cached: false,
          _elapsedMs: elapsed,
        }),
      };
    }

    if (action === "record") {
      const { userId, questionId, difficulty, isCorrect, timeSpent } = event;
      if (!userId || !questionId) {
        return { statusCode: 400, body: JSON.stringify({ message: "userId, questionId required" }) };
      }

      await client.query(
        `INSERT INTO quiz_results (user_id, question_id, difficulty, is_correct, time_spent_seconds)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, questionId, difficulty || "medium", isCorrect ?? false, timeSpent || 0]
      );

      const cacheKey = `stats:${userId}`;
      await redis.del(cacheKey);
      console.log(`🗑️ 캐시 무효화: ${cacheKey}`);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "풀이 기록 저장 + 캐시 무효화 완료", userId }),
      };
    }

    if (action === "clear-cache") {
      const keys = await redis.keys("stats:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `캐시 삭제 완료`, cleared: keys.length, keys }),
      };
    }

    if (action === "list") {
      const userId = event.userId;
      const limit = event.limit || 10;

      const sql = userId
        ? `SELECT * FROM quiz_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`
        : `SELECT * FROM quiz_results ORDER BY created_at DESC LIMIT $1`;

      const params = userId ? [userId, limit] : [limit];
      const result = await client.query(sql, params);

      return { statusCode: 200, body: JSON.stringify(result.rows) };
    }

    if (action === "sql") {
      const { sql, params = [] } = event;
      if (!sql) {
        return { statusCode: 400, body: JSON.stringify({ message: "sql required" }) };
      }
      const result = await client.query(sql, params);
      return {
        statusCode: 200,
        body: JSON.stringify({ rowCount: result.rowCount, rows: result.rows }),
      };
    }

    if (action === "migrate") {
      // 1. schema_migrations 테이블 보장 (없으면 만듦)
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version     VARCHAR(50) PRIMARY KEY,
          description VARCHAR(255) NOT NULL,
          checksum    VARCHAR(64),
          applied_at  TIMESTAMP DEFAULT NOW(),
          applied_by  VARCHAR(100)
        );
      `);

      // 2. 디스크의 V*.sql 파일 로드
      const allMigrations = loadMigrations();

      // 3. 이미 적용된 버전 조회
      const { rows: applied } = await client.query(
        `SELECT version, checksum FROM schema_migrations`
      );
      const appliedMap = new Map(applied.map(r => [r.version, r.checksum]));

      // 4. 체크섬 검증 - 이미 적용된 SQL 이 변경됐으면 위험 → 중단
      for (const m of allMigrations) {
        const prevChecksum = appliedMap.get(m.version);
        if (prevChecksum && prevChecksum !== m.checksum) {
          return {
            statusCode: 500,
            body: JSON.stringify({
              message: "❌ Checksum mismatch — applied migration was modified",
              version: m.version,
              expected: prevChecksum,
              actual: m.checksum,
            }),
          };
        }
      }

      // 5. 미적용 마이그레이션만 트랜잭션으로 실행
      const pending = allMigrations.filter(m => !appliedMap.has(m.version));
      const executed = [];

      if (pending.length === 0) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "✅ 적용할 마이그레이션 없음",
            applied: applied.length,
          }),
        };
      }

      await client.query("BEGIN");
      try {
        for (const m of pending) {
          console.log(`▶ Applying ${m.version} - ${m.description}`);
          await client.query(m.sql);
          await client.query(
            `INSERT INTO schema_migrations (version, description, checksum, applied_by)
             VALUES ($1, $2, $3, $4)`,
            [m.version, m.description, m.checksum, "saa-db-init-lambda"]
          );
          executed.push(m.version);
        }
        await client.query("COMMIT");
        console.log(`✅ ${executed.length}개 마이그레이션 적용 완료`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ 마이그레이션 실패, ROLLBACK:", err.message);
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: "Migration failed, rolled back",
            executed,
            error: err.message,
          }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "✅ 마이그레이션 완료",
          executed,
          total_applied: applied.length + executed.length,
        }),
      };
    }

    return { statusCode: 400, body: JSON.stringify({ message: "Invalid action" }) };
  } finally {
    await client.end();
  }
};
