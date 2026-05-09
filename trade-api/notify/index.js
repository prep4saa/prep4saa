const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const sns = new SNSClient({ region: "us-east-1" });
const TOPIC_ARN = process.env.SNS_TOPIC_ARN;

exports.handler = async (event) => {
  for (const record of event.Records) {
    const body = JSON.parse(record.body);

    await sns.send(new PublishCommand({
      TopicArn: TOPIC_ARN,
      Subject: `[SAA-C03] ❌ 문제 생성 오류 발생`,
      Message: [
        `오류 유형: AI API 실패 (Gemini + Claude 모두 실패)`,
        `사용자: ${body.userId}`,
        `오류 메시지: ${body.errorMessage}`,
        `발생 시각: ${body.occurredAt}`,
      ].join("\n"),
    }));

    console.log(`✅ 오류 알림 발송 완료: ${body.userId}`);
  }
};
