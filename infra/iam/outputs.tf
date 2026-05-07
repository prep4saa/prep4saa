# =====================================================
# 출력값 — GitHub Environments에 등록할 ARN들
# =====================================================

output "production_role_arn" {
  description = "GitHub Environment 'production' → vars.AWS_ROLE_ARN 에 등록"
  value       = aws_iam_role.production.arn
}

output "staging_role_arn" {
  description = "GitHub Environment 'staging' → vars.AWS_ROLE_ARN 에 등록"
  value       = aws_iam_role.staging.arn
}

output "oidc_provider_arn" {
  description = "GitHub OIDC Provider ARN (참고용)"
  value       = aws_iam_openid_connect_provider.github.arn
}
