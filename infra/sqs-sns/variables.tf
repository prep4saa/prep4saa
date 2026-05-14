variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "us-east-1"
}

variable "queue_name" {
  description = "Main SQS queue name."
  type        = string
  default     = "problem-generation-queue"
}

variable "dlq_name" {
  description = "Dead Letter Queue name."
  type        = string
  default     = "problem-generation-dlq"
}

variable "topic_name" {
  description = "SNS topic name."
  type        = string
  default     = "problem-generation-alert"
}

variable "alert_email" {
  description = "Email subscription endpoint."
  type        = string
  default     = "imjaichoipro@gmail.com"
}

variable "max_receive_count" {
  description = "Max retries before sending to DLQ."
  type        = number
  default     = 3
}

variable "lambda_role_name" {
  description = "Existing Lambda IAM role to attach SQS/SNS policy to."
  type        = string
  default     = "trade-api-lambda-role"
}
