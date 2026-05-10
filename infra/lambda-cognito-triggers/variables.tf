variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "us-east-1"
}

variable "vpc_name" {
  description = "VPC name (for PostConfirmation Lambda VPC config)."
  type        = string
  default     = "saa-app-vpc"
}

variable "lambda_role_name" {
  description = "Existing Lambda IAM role to reuse."
  type        = string
  default     = "trade-api-lambda-role"
}

# UserMigration: VPC 밖 (Firebase API 호출 위해 인터넷 필요)
variable "user_migration_function_name" {
  description = "UserMigration Lambda function name."
  type        = string
  default     = "saa-cognito-user-migration"
}

variable "user_migration_code_path" {
  description = "Path to user-migration source folder."
  type        = string
  default     = "../../trade-api/cognito-triggers/user-migration"
}

# PostConfirmation: VPC 안 (RDS 접근 위해)
variable "post_confirmation_function_name" {
  description = "PostConfirmation Lambda function name."
  type        = string
  default     = "saa-cognito-post-confirmation"
}

variable "post_confirmation_code_path" {
  description = "Path to post-confirmation source folder."
  type        = string
  default     = "../../trade-api/cognito-triggers/post-confirmation"
}

# Firebase API Key (UserMigration 이 비번 검증 시 사용)
# - 학습은 default 빈 값, terraform apply 시 -var 또는 .tfvars 로 주입
# - 운영은 Secrets Manager 에서 read (이번 학습은 단순화)
variable "firebase_api_key" {
  description = "Firebase Web API Key (for UserMigration)."
  type        = string
  default     = ""
  sensitive   = true
}

# Cognito User Pool ID (Lambda Permission 의 source_arn 구성)
variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID (for invoke permission)."
  type        = string
}
