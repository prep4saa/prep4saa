output "function_name" {
  description = "Lambda function name."
  value       = aws_lambda_function.trade_api.function_name
}

output "function_arn" {
  description = "Lambda function ARN (for API Gateway integration)."
  value       = aws_lambda_function.trade_api.arn
}

output "invoke_arn" {
  description = "Lambda invoke ARN (used by API Gateway)."
  value       = aws_lambda_function.trade_api.invoke_arn
}
