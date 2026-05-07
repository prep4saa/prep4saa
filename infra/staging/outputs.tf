# =====================================================
# 출력값 (terraform apply 후 콘솔에 표시됨)
# → 이 값들을 GitHub Environments 'staging'에 등록
# =====================================================

output "cloudfront_distribution_id" {
  description = "GitHub Environment 'staging' → vars.CLOUDFRONT_DISTRIBUTION_ID 에 등록"
  value       = aws_cloudfront_distribution.staging.id
}

output "s3_bucket_name" {
  description = "GitHub Environment 'staging' → vars.S3_BUCKET 에 등록"
  value       = aws_s3_bucket.staging.id
}

output "site_url" {
  description = "GitHub Environment 'staging' → vars.SITE_URL 에 등록"
  value       = "https://${local.staging_fqdn}"
}

output "certificate_arn" {
  description = "발급된 와일드카드 ACM 인증서 ARN (참고용)"
  value       = aws_acm_certificate.wildcard.arn
}

output "cloudfront_domain_name" {
  description = "CloudFront 자체 도메인 (xxx.cloudfront.net) — 디버깅용"
  value       = aws_cloudfront_distribution.staging.domain_name
}
