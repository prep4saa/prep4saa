variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "ai_api_keys_secret_name" {
  description = "AI 제공자 API 키를 담을 Secrets Manager 시크릿 이름"
  type        = string
  default     = "saa-ai-api-keys"
}
