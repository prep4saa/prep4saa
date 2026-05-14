variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "us-east-1"
}

variable "function_name" {
  description = "Lambda function name."
  type        = string
  default     = "trade-api-daily-count"
}

variable "lambda_role_name" {
  description = "Existing Lambda IAM role to use (created via CLI earlier)."
  type        = string
  default     = "trade-api-lambda-role"
}

variable "code_path" {
  description = "Lambda source code directory (relative to module)."
  type        = string
  default     = "../../trade-api"
}

variable "dynamodb_table_name" {
  description = "DynamoDB table for daily count."
  type        = string
  default     = "user-daily-count"
}
