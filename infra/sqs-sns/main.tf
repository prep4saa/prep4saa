# -------------------------------------------------------------------
# DLQ (Dead Letter Queue)
# - Lambda 가 max_receive_count 회 실패한 메시지를 보관
# - 영구 실패 메시지 격리 → 메인 큐 오염 방지
# -------------------------------------------------------------------
resource "aws_sqs_queue" "dlq" {
  name = var.dlq_name

  tags = {
    Name = var.dlq_name
  }
}

# -------------------------------------------------------------------
# 메인 SQS 큐
# - RedrivePolicy 로 DLQ 연결
# - Lambda 가 3 번 실패하면 DLQ 로 이동
# -------------------------------------------------------------------
resource "aws_sqs_queue" "main" {
  name = var.queue_name

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = var.max_receive_count
  })

  tags = {
    Name = var.queue_name
  }
}

# -------------------------------------------------------------------
# SNS 토픽
# - 구독자에게 fan-out 알림 (이메일, SMS, Lambda 등)
# -------------------------------------------------------------------
resource "aws_sns_topic" "alert" {
  name = var.topic_name

  tags = {
    Name = var.topic_name
  }
}

# 이메일 구독
# - apply 후 이메일로 confirm 링크 옴 → 클릭해야 활성화
resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alert.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# -------------------------------------------------------------------
# 최소 권한 IAM 정책 - Lambda 가 SQS/SNS 사용 위해 필요
# - SQS: ReceiveMessage, DeleteMessage, GetQueueAttributes (읽기/삭제만)
# - SNS: Publish (발행만, 토픽 생성 X)
# - Resource 도 정확한 ARN 으로 제한 (와일드카드 X)
# -------------------------------------------------------------------
data "aws_iam_role" "lambda" {
  name = var.lambda_role_name
}

resource "aws_iam_policy" "lambda_sqs_sns" {
  name        = "lambda-sqs-sns-min-policy"
  description = "Least-privilege policy for Lambda to consume SQS and publish SNS"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
        ]
        Resource = aws_sqs_queue.main.arn
      },
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = aws_sns_topic.alert.arn
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_sqs_sns" {
  role       = data.aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.lambda_sqs_sns.arn
}
