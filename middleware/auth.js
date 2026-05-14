// Cognito JWT 검증 미들웨어
// -----------------------------------------------------------------
// 사용:
//   const { requireAuth, requireAdmin } = require('./middleware/auth');
//   app.post('/api/profile', requireAuth, handler);
//   app.post('/api/admin/stats', requireAuth, requireAdmin, handler);
//
// 동작:
//   1) Authorization: Bearer <JWT> 헤더에서 토큰 추출
//   2) Cognito 공개키로 서명 검증 + expiry 확인
//   3) JWT payload 의 sub 로 PostgreSQL users 테이블 조회
//   4) req.user 에 user row 부착
//   5) requireAdmin: req.user.role === 'admin' 만 통과

const { CognitoJwtVerifier } = require("aws-jwt-verify");
const { Pool } = require("pg");

// === Feature Flag ===
// USE_COGNITO_AUTH=true 일 때만 검증 활성화
// 마이그레이션 기간 동안 Firebase 와 병행 운영 가능
const USE_COGNITO_AUTH = process.env.USE_COGNITO_AUTH === "true";

// === JWT Verifier (lazy init: 환경변수 빠진 환경에서도 server 시작은 되도록) ===
let verifier = null;
function getVerifier() {
  if (!USE_COGNITO_AUTH) return null;
  if (verifier) return verifier;

  if (!process.env.COGNITO_USER_POOL_ID || !process.env.COGNITO_CLIENT_ID) {
    throw new Error("COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID must be set");
  }

  verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "access", // access token 만 허용 (id token 은 거절)
    clientId: process.env.COGNITO_CLIENT_ID,
  });

  return verifier;
}

// === PostgreSQL pool (서버 lifecycle 동안 1개 유지) ===
let pgPool = null;
function getPgPool() {
  if (pgPool) return pgPool;

  pgPool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
    max: 10,
  });

  return pgPool;
}

// -------------------------------------------------------------------
// requireAuth
// - JWT 검증 + req.user 부착
// -------------------------------------------------------------------
async function requireAuth(req, res, next) {
  // Feature flag 비활성화 시 통과 (Firebase 기존 흐름 유지용)
  if (!USE_COGNITO_AUTH) return next();

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: { message: "Missing access token" } });
  }

  try {
    // 1) JWT 서명 + expiry 검증
    const payload = await getVerifier().verify(token);

    // 2) PostgreSQL 에서 user row 조회 (cognito_sub 매핑)
    const pool = getPgPool();
    const result = await pool.query(
      `SELECT id, cognito_sub, email, role, is_premium
       FROM users
       WHERE cognito_sub = $1`,
      [payload.sub]
    );

    if (!result.rows[0]) {
      // PostConfirmation Lambda 가 아직 실행 안 됐거나 실패한 경우
      return res.status(403).json({
        error: { message: "User not provisioned in DB. Try logging out and in again." },
      });
    }

    req.user = result.rows[0];
    req.cognitoSub = payload.sub;
    next();
  } catch (err) {
    console.warn("JWT verify failed:", err.message);
    return res.status(401).json({ error: { message: "Invalid or expired token" } });
  }
}

// -------------------------------------------------------------------
// requireAdmin
// - requireAuth 다음에 사용 (req.user 가 채워져 있어야 함)
// -------------------------------------------------------------------
function requireAdmin(req, res, next) {
  if (!USE_COGNITO_AUTH) return next();

  if (!req.user) {
    return res.status(401).json({ error: { message: "Not authenticated" } });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: { message: "Admin access required" } });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, USE_COGNITO_AUTH };
