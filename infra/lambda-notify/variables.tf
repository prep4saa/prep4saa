variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "us-east-1"
}

variable "function_name" {
  description = "Lambda function name."
  type        = string
  default     = "problem-notify"
}

variable "lambda_role_name" {
  description = "Existing Lambda IAM role."
  type        = string
  default     = "trade-api-lambda-role"
}

variable "code_path" {
  description = "Lambda source code directory (notify folder)."
  type        = string
  default     = "../../trade-api/notify"
}

variable "sqs_queue_name" {
  description = "SQS queue to consume from."
  type        = string
  default     = "problem-generation-queue"
}

variable "sns_topic_name" {
  description = "SNS topic to publish to."
  type        = string
  default     = "problem-generation-alert"
}
