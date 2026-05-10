// 공용 PostgreSQL 풀
// - server lifecycle 동안 1개 풀 유지 (재사용)
// - middleware/auth.js 도 같은 풀 사용

const { Pool } = require("pg");

let pool = null;

function getPool() {
  if (pool) return pool;

  pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:
      process.env.DB_SSL === "false"
        ? false
        : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

  pool.on("error", (err) => {
    console.error("Unexpected pg pool error:", err);
  });

  return pool;
}

async function query(text, params) {
  return getPool().query(text, params);
}

module.exports = { getPool, query };
