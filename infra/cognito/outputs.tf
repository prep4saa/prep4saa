output "user_pool_id" {
  description = "Cognito User Pool ID."
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  description = "Cognito User Pool ARN (for IAM policies)."
  value       = aws_cognito_user_pool.main.arn
}

output "user_pool_client_id" {
  description = "Cognito App Client ID (used by frontend)."
  value       = aws_cognito_user_pool_client.web.id
}

# JWT 검증 시 사용할 issuer URL
# - 백엔드 미들웨어에서 토큰 검증할 때 이 URL 로 공개키 받음
output "issuer" {
  description = "JWT issuer URL (used by backend JWT verifier)."
  value       = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
}

output "jwks_uri" {
  description = "JWKS endpoint for JWT public key retrieval."
  value       = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}/.well-known/jwks.json"
}
