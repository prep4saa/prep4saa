output "queue_url" {
  description = "Main SQS queue URL (used by server.js to send messages)."
  value       = aws_sqs_queue.main.url
}

output "queue_arn" {
  description = "Main SQS queue ARN (used by Lambda Event Source Mapping)."
  value       = aws_sqs_queue.main.arn
}

output "dlq_url" {
  description = "DLQ URL."
  value       = aws_sqs_queue.dlq.url
}

output "dlq_arn" {
  description = "DLQ ARN."
  value       = aws_sqs_queue.dlq.arn
}

output "topic_arn" {
  description = "SNS topic ARN (used by notify Lambda env var)."
  value       = aws_sns_topic.alert.arn
}
