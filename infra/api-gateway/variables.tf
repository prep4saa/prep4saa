variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "us-east-1"
}

variable "api_name" {
  description = "REST API name."
  type        = string
  default     = "trade-api"
}

variable "lambda_function_name" {
  description = "Lambda function to integrate with."
  type        = string
  default     = "trade-api-daily-count"
}

variable "stage_name" {
  description = "Deployment stage (dev/staging/prod)."
  type        = string
  default     = "prod"
}
