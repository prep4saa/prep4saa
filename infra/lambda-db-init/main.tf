data "aws_vpc" "main" {
    filter {
        name ="tag:Name"
        values = [var.vpc_name]
    }
}

data "aws_subnets" "private_app" {
    filter {
        name = "vpc-id"
        values = [data.aws_vpc.main.id]
    }
    filter {
        name = "tag:Tier"
        values =["private-app"]
    }
}
data "aws_security_group" "lambda" {
    filter {
        name = "tag:Name"
        values = ["${var.vpc_name}-lambda-sg"]
    }

}
data "aws_secretsmanager_secret_version" "db" {
    secret_id = "saa-quiz-db-credentials"

}
data "aws_elasticache_cluster" "main" {
    cluster_id = "saa-quiz-cache"
}

data "aws_iam_role" "lambda"{
    name = var.lambda_role_name
}

data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = var.code_path                        # 어떤 폴더를?
  output_path = "${path.module}/lambda.zip"          # 어디에 zip?
  excludes    = ["package-lock.json"]                # 제외할 파일 (선택)
}

# Secrets Manager 의 secret_string 을 한 번만 파싱해서 재사용
locals {
  db_creds = jsondecode(data.aws_secretsmanager_secret_version.db.secret_string)
}

# -------------------------------------------------------------------
# Lambda 함수 본체
# - 코드: archive_file 로 자동 zip
# - 환경변수: Secrets Manager + ElastiCache 자동 주입
# - VPC: Private App Subnet (RDS, Redis 통신 위해)
# -------------------------------------------------------------------
resource "aws_lambda_function" "db_init" {
  function_name = var.function_name
  role          = data.aws_iam_role.lambda.arn
  runtime       = "nodejs22.x"
  handler       = "index.handler"
  timeout       = 60
  memory_size   = 256

  # archive_file 이 만든 zip 사용
  # source_code_hash 로 코드 변경 시 자동 재배포
  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256

  environment {
    variables = {
      DB_HOST     = local.db_creds.host
      DB_PORT     = tostring(local.db_creds.port)
      DB_USER     = local.db_creds.username
      DB_PASSWORD = local.db_creds.password
      DB_NAME     = local.db_creds.dbname
      REDIS_HOST  = data.aws_elasticache_cluster.main.cache_nodes[0].address
      REDIS_PORT  = tostring(data.aws_elasticache_cluster.main.cache_nodes[0].port)
    }
  }

  vpc_config {
    subnet_ids         = data.aws_subnets.private_app.ids
    security_group_ids = [data.aws_security_group.lambda.id]
  }

  tags = {
    Name = var.function_name
  }
}
