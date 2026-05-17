output "ai_api_keys_secret_name" {
  description = "AI API 키 시크릿 이름 — backend-beanstalk 모듈이 이 값을 읽어 환경변수로 주입"
  value       = aws_secretsmanager_secret.ai_api_keys.name
}

output "ai_api_keys_secret_arn" {
  description = "AI API 키 시크릿 ARN"
  value       = aws_secretsmanager_secret.ai_api_keys.arn
}
