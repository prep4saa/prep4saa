# -------------------------------------------------------------------
# 기존 리소스 조회
# -------------------------------------------------------------------
data "aws_iam_role" "lambda" {
  name = var.lambda_role_name
}

# SQS 큐 조회 (sqs-sns 모듈에서 만든 것)
data "aws_sqs_queue" "main" {
  name = var.sqs_queue_name
}

# SNS 토픽 조회 (ARN 환경변수 주입용)
data "aws_sns_topic" "alert" {
  name = var.sns_topic_name
}

# -------------------------------------------------------------------
# Lambda 코드 자동 zip
# -------------------------------------------------------------------
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = var.code_path
  output_path = "${path.module}/notify-lambda.zip"
  excludes    = ["package-lock.json"]
}

# -------------------------------------------------------------------
# Lambda 함수 - SQS 메시지 받아 SNS 로 알림 발송
# -------------------------------------------------------------------
resource "aws_lambda_function" "notify" {
  function_name = var.function_name
  role          = data.aws_iam_role.lambda.arn
  runtime       = "nodejs22.x"
  handler       = "index.handler"
  timeout       = 10
  memory_size   = 128

  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256

  environment {
    variables = {
      SNS_TOPIC_ARN = data.aws_sns_topic.alert.arn
    }
  }

  tags = {
    Name = var.function_name
  }
}

# -------------------------------------------------------------------
# SQS → Lambda 트리거
# - SQS 큐에 메시지 도착 시 자동으로 Lambda 호출
# - batch_size: 1 → 메시지 1개씩 처리 (디버깅 쉬움)
# -------------------------------------------------------------------
resource "aws_lambda_event_source_mapping" "sqs_to_lambda" {
  event_source_arn = data.aws_sqs_queue.main.arn
  function_name    = aws_lambda_function.notify.arn
  batch_size       = 1
  enabled          = true
}
