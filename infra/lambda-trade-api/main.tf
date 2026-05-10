# -------------------------------------------------------------------
# 기존 IAM Role 조회 (다른 모듈/Lambda 들과 공유)
# -------------------------------------------------------------------
data "aws_iam_role" "lambda" {
  name = var.lambda_role_name
}

# -------------------------------------------------------------------
# Lambda 코드 자동 zip
# - trade-api/ 폴더 (notify, db-init 폴더 제외하기 위해 source_file 사용)
# -------------------------------------------------------------------
data "archive_file" "lambda" {
  type        = "zip"
  output_path = "${path.module}/lambda.zip"

  # trade-api 폴더 전체를 zip 하면 notify/, db-init/ 까지 포함됨
  # → 메인 시나리오 1 코드만 포함하도록 source_dir 사용 후 excludes
  source_dir = var.code_path
  excludes = [
    "notify",
    "db-init",
    "package-lock.json",
    "lambda.zip",
    "notify-lambda.zip",
    "db-init-lambda.zip",
    "response.json",
    "test-event.json",
    "item.json",
    "schema.sql",
    "trust-policy.json",
    "sqs-sns-policy.json",
    "apigateway-policy.json",
    "budget.json",
    "budget-notifications.json",
    "budgets-policy.json",
  ]
}

# -------------------------------------------------------------------
# Lambda 함수 - 시나리오 1: DynamoDB 일일 카운트
# -------------------------------------------------------------------
resource "aws_lambda_function" "trade_api" {
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
      DYNAMODB_TABLE = var.dynamodb_table_name
    }
  }

  tags = {
    Name = var.function_name
  }
}
