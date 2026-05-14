# -------------------------------------------------------------------
# 기존 인프라 조회
# -------------------------------------------------------------------
data "aws_caller_identity" "current" {}

data "aws_iam_role" "lambda" {
  name = var.lambda_role_name
}

data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = [var.vpc_name]
  }
}

data "aws_subnets" "private_app" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
  filter {
    name   = "tag:Tier"
    values = ["private-app"]
  }
}

data "aws_security_group" "lambda" {
  filter {
    name   = "tag:Name"
    values = ["${var.vpc_name}-lambda-sg"]
  }
}

# DB 자격증명 (PostConfirmation Lambda 가 환경변수로 받음)
data "aws_secretsmanager_secret_version" "db" {
  secret_id = "saa-quiz-db-credentials"
}

locals {
  db_creds = jsondecode(data.aws_secretsmanager_secret_version.db.secret_string)
}

# -------------------------------------------------------------------
# UserMigration Lambda (VPC 밖)
# - Firebase API 호출하므로 인터넷 필요
# - Private 서브넷 안 두면 NAT Gateway 불필요 → 비용 절약
# -------------------------------------------------------------------
data "archive_file" "user_migration" {
  type        = "zip"
  source_dir  = var.user_migration_code_path
  output_path = "${path.module}/user-migration.zip"
  excludes    = ["package-lock.json"]
}

resource "aws_lambda_function" "user_migration" {
  function_name = var.user_migration_function_name
  role          = data.aws_iam_role.lambda.arn
  runtime       = "nodejs22.x"
  handler       = "index.handler"
  timeout       = 10
  memory_size   = 128

  filename         = data.archive_file.user_migration.output_path
  source_code_hash = data.archive_file.user_migration.output_base64sha256

  environment {
    variables = {
      FIREBASE_API_KEY = var.firebase_api_key
    }
  }

  tags = {
    Name = var.user_migration_function_name
  }
}

# Cognito 가 UserMigration Lambda 호출할 수 있게 권한 부여
resource "aws_lambda_permission" "user_migration_cognito" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user_migration.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = "arn:aws:cognito-idp:${var.aws_region}:${data.aws_caller_identity.current.account_id}:userpool/${var.cognito_user_pool_id}"
}

# -------------------------------------------------------------------
# PostConfirmation Lambda (VPC 안)
# - RDS PostgreSQL 접근 필요
# - DB 자격증명은 Secrets Manager 에서 환경변수로 자동 주입
# -------------------------------------------------------------------
data "archive_file" "post_confirmation" {
  type        = "zip"
  source_dir  = var.post_confirmation_code_path
  output_path = "${path.module}/post-confirmation.zip"
  excludes    = ["package-lock.json"]
}

resource "aws_lambda_function" "post_confirmation" {
  function_name = var.post_confirmation_function_name
  role          = data.aws_iam_role.lambda.arn
  runtime       = "nodejs22.x"
  handler       = "index.handler"
  timeout       = 30
  memory_size   = 256

  filename         = data.archive_file.post_confirmation.output_path
  source_code_hash = data.archive_file.post_confirmation.output_base64sha256

  environment {
    variables = {
      DB_HOST     = local.db_creds.host
      DB_PORT     = tostring(local.db_creds.port)
      DB_USER     = local.db_creds.username
      DB_PASSWORD = local.db_creds.password
      DB_NAME     = local.db_creds.dbname
    }
  }

  vpc_config {
    subnet_ids         = data.aws_subnets.private_app.ids
    security_group_ids = [data.aws_security_group.lambda.id]
  }

  tags = {
    Name = var.post_confirmation_function_name
  }
}

# Cognito 가 PostConfirmation Lambda 호출할 수 있게 권한 부여
resource "aws_lambda_permission" "post_confirmation_cognito" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_confirmation.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = "arn:aws:cognito-idp:${var.aws_region}:${data.aws_caller_identity.current.account_id}:userpool/${var.cognito_user_pool_id}"
}
