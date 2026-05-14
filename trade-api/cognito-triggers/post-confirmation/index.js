// PostConfirmation Lambda Trigger
// -----------------------------------------------------------------
// 호출 시점:
//   사용자가 가입 verification 을 마치면 Cognito 가 호출
//   (또는 UserMigration 으로 자동 가입된 경우도)
//
// 흐름:
//   1) Cognito event 에서 sub (user ID) + email 추출
//   2) PostgreSQL users 테이블에 INSERT (이미 있으면 update)
//
// 결과:
//   Cognito 와 PostgreSQL users 테이블이 항상 동기화 상태
//   백엔드는 cognito_sub 로 user 조회 가능

const { Client } = require("pg");

exports.handler = async (event) => {
  const { sub } = event.request.userAttributes;
  const email = event.request.userAttributes.email;

  console.log("PostConfirmation for:", email, "sub:", sub);

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    // ON CONFLICT: 이미 같은 email 로 row 존재 시
    //   - cognito_sub 갱신 (UserMigration 으로 들어온 경우 등)
    //   - last_login_at NOW()
    await client.query(
      `INSERT INTO users (cognito_sub, email, last_login_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (email) DO UPDATE
       SET cognito_sub = EXCLUDED.cognito_sub,
           last_login_at = NOW()`,
      [sub, email]
    );

    console.log(`✅ User synced to PostgreSQL: ${email}`);
  } catch (err) {
    // PostConfirmation 실패는 사용자 가입 자체를 실패시키지 않음
    // (Cognito 는 이미 confirm 됐으므로 throw 하지 않음)
    console.error("Failed to sync user to PostgreSQL:", err.message);
    // 운영에선 SNS 알림 / DLQ 발송 권장
  } finally {
    await client.end();
  }

  return event;
};
