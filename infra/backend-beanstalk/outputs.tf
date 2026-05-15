output "environment_url" {
  description = "Beanstalk 환경 직접 URL (HTTP) — 디버깅/직접 테스트용. 프런트엔드는 https_api_url 사용."
  value       = "http://${aws_elastic_beanstalk_environment.env.cname}"
}

output "https_api_url" {
  description = "HTTPS API URL (CloudFront) — 프런트엔드의 VITE_JAVA_BACKEND_URL 에 설정할 값"
  value       = "https://${aws_cloudfront_distribution.api.domain_name}"
}

output "environment_name" {
  description = "Beanstalk 환경 이름"
  value       = aws_elastic_beanstalk_environment.env.name
}

output "beanstalk_security_group_id" {
  description = "Beanstalk 인스턴스 보안그룹 ID"
  value       = aws_security_group.beanstalk.id
}

output "solution_stack" {
  description = "사용된 Beanstalk 솔루션 스택"
  value       = var.solution_stack_name
}
