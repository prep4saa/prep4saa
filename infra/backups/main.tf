# =====================================================
# 배포 롤백용 S3 백업 버킷 (production / staging)
# - 배포 직전에 현재 S3 내용물을 timestamp prefix 하위로 sync
# - 헬스체크 실패 시 백업에서 복원 (자동 롤백)
# - 7일 후 자동 삭제 (lifecycle)
# - 외부 공개 X (오직 GitHub Actions IAM Role만 접근)
# =====================================================

locals {
  production_backup_bucket = "${var.production_bucket_name}-backups"
  staging_backup_bucket    = "${var.staging_bucket_name}-backups"
}

# -----------------------------------------------------
# Production 백업 버킷
# -----------------------------------------------------
resource "aws_s3_bucket" "production_backup" {
  bucket = local.production_backup_bucket
  tags   = merge(var.tags, { Environment = "production" })
}

# 외부 접근 완전 차단 (백업은 절대 public 노출 금지)
resource "aws_s3_bucket_public_access_block" "production_backup" {
  bucket = aws_s3_bucket.production_backup.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle: 7일 후 자동 삭제 (무한 누적 방지 + 비용 절감)
resource "aws_s3_bucket_lifecycle_configuration" "production_backup" {
  bucket = aws_s3_bucket.production_backup.id

  rule {
    id     = "auto-expire-old-backups"
    status = "Enabled"

    filter {} # 모든 객체에 적용

    expiration {
      days = var.backup_retention_days
    }
  }
}

# -----------------------------------------------------
# Staging 백업 버킷 (구성은 production과 동일)
# -----------------------------------------------------
resource "aws_s3_bucket" "staging_backup" {
  bucket = local.staging_backup_bucket
  tags   = merge(var.tags, { Environment = "staging" })
}

resource "aws_s3_bucket_public_access_block" "staging_backup" {
  bucket = aws_s3_bucket.staging_backup.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "staging_backup" {
  bucket = aws_s3_bucket.staging_backup.id

  rule {
    id     = "auto-expire-old-backups"
    status = "Enabled"

    filter {}

    expiration {
      days = var.backup_retention_days
    }
  }
}
