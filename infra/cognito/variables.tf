variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "us-east-1"
}

# User Pool 이름 (한 번 정하면 변경 시 재생성됨)
variable "user_pool_name" {
  description = "Cognito User Pool name."
  type        = string
  default     = "saa-user-pool"
}

# 앱 클라이언트 이름 (웹 앱이 사용할 client)
variable "user_pool_client_name" {
  description = "Cognito User Pool Client name (web SPA)."
  type        = string
  default     = "saa-web-client"
}

# OAuth callback / logout URL (소셜 로그인 등 미래 대비)
# - 학습은 localhost, 운영은 https://app.example.com
variable "callback_urls" {
  description = "Allowed OAuth callback URLs."
  type        = list(string)
  default     = ["http://localhost:3000/callback"]
}

variable "logout_urls" {
  description = "Allowed OAuth logout URLs."
  type        = list(string)
  default     = ["http://localhost:3000/"]
}

# Lambda Triggers - Phase 2-2 에서 lambda 모듈 만든 후 -var 로 주입
# - 처음 apply 시엔 null (lambda 가 아직 없으니)
# - lambda 만든 후 다시 apply: var 주입 → User Pool 에 trigger 등록
variable "user_migration_lambda_arn" {
  description = "ARN of UserMigration Lambda. Set null until lambda exists."
  type        = string
  default     = null
}

variable "post_confirmation_lambda_arn" {
  description = "ARN of PostConfirmation Lambda. Set null until lambda exists."
  type        = string
  default     = null
}
