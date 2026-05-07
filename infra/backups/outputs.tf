# =====================================================
# 출력값 (참고용 — 워크플로우는 vars.S3_BUCKET 기반으로 자동 유추)
# =====================================================

output "production_backup_bucket" {
  description = "Production 백업 버킷명"
  value       = aws_s3_bucket.production_backup.id
}

output "staging_backup_bucket" {
  description = "Staging 백업 버킷명"
  value       = aws_s3_bucket.staging_backup.id
}
