const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const db = DynamoDBDocumentClient.from(client);
const TABLE = "user-daily-count";
const DAILY_LIMIT = { guest: 2, loggedIn: 2, premium: 20 };

function getTodayMidnightTTL() {
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return Math.floor(midnight.getTime() / 1000);
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10); // "2026-05-09"
}

exports.handler = async (event) => {
  const method = event.httpMethod;
  const userId = event.pathParameters?.userId;

  if (!userId) {
    return { statusCode: 400, body: JSON.stringify({ message: "userId required" }) };
  }

  const today = getTodayDate();

  // GET /count/{userId} - 오늘 사용 횟수 조회
  // PK: userId, SK: today 로 정확히 오늘 레코드만 조회
  if (method === "GET") {
    const result = await db.send(
      new GetCommand({ TableName: TABLE, Key: { userId, date: today } })
    );

    const count = result.Item?.count || 0;

    return {
      statusCode: 200,
      body: JSON.stringify({ userId, count, date: today }),
    };
  }

  // POST /count/{userId} - 카운트 증가
  if (method === "POST") {
    const body = JSON.parse(event.body || "{}");
    const userType = body.userType || "guest";
    const limit = DAILY_LIMIT[userType];

    // PK + SK 로 오늘 레코드 조회
    const result = await db.send(
      new GetCommand({ TableName: TABLE, Key: { userId, date: today } })
    );

    const currentCount = result.Item?.count || 0;

    if (currentCount >= limit) {
      return {
        statusCode: 429,
        body: JSON.stringify({ message: "Daily limit reached", count: currentCount, limit }),
      };
    }

    // PK + SK 로 오늘 레코드 업데이트 (없으면 새로 생성)
    await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { userId, date: today },
        UpdateExpression: "SET #count = :count, #ttl = :ttl",
        ExpressionAttributeNames: {
          "#count": "count",
          "#ttl": "ttl",
        },
        ExpressionAttributeValues: {
          ":count": currentCount + 1,
          ":ttl": getTodayMidnightTTL(),
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ userId, count: currentCount + 1, limit }),
    };
  }

  return { statusCode: 400, body: JSON.stringify({ message: "Bad request" }) };
};
