output "function_name" {
  description = "Lambda function name."
  value       = aws_lambda_function.notify.function_name
}

output "function_arn" {
  description = "Lambda function ARN."
  value       = aws_lambda_function.notify.arn
}

output "event_source_uuid" {
  description = "SQS Event Source Mapping UUID."
  value       = aws_lambda_event_source_mapping.sqs_to_lambda.uuid
}
