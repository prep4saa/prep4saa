output "user_migration_lambda_arn" {
  description = "UserMigration Lambda ARN (pass to cognito module)."
  value       = aws_lambda_function.user_migration.arn
}

output "post_confirmation_lambda_arn" {
  description = "PostConfirmation Lambda ARN (pass to cognito module)."
  value       = aws_lambda_function.post_confirmation.arn
}

output "user_migration_function_name" {
  description = "UserMigration Lambda function name."
  value       = aws_lambda_function.user_migration.function_name
}

output "post_confirmation_function_name" {
  description = "PostConfirmation Lambda function name."
  value       = aws_lambda_function.post_confirmation.function_name
}
