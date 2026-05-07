# =====================================================
# 환경별 최소권한 IAM 정책
# - Production Role: 운영 버킷 + 운영 CloudFront만 접근
# - Staging Role: 스테이징 버킷 + 스테이징 CloudFront만 접근
# - 한 Role이 다른 환경 리소스 건드리지 못함 (영역 분리)
# =====================================================

# -----------------------------------------------------
# Production 배포 정책
# -----------------------------------------------------
data "aws_iam_policy_document" "production_deploy" {
  # S3 버킷 자체 작업 (목록 조회용)
  statement {
    sid    = "S3BucketLevel"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation"
    ]
    resources = ["arn:aws:s3:::${var.production_bucket_name}"]
  }

  # S3 객체 작업 (실제 파일 업/다운/삭제)
  statement {
    sid    = "S3ObjectLevel"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject"
    ]
    resources = ["arn:aws:s3:::${var.production_bucket_name}/*"]
  }

  # CloudFront 캐시 무효화 (운영 배포만)
  statement {
    sid    = "CloudFrontInvalidation"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
      "cloudfront:ListInvalidations"
    ]
    resources = [
      "arn:aws:cloudfront::*:distribution/${var.production_cloudfront_id}"
    ]
  }
}

resource "aws_iam_policy" "production_deploy" {
  name        = "prep4saa-production-deploy"
  description = "Least-privilege deploy permissions for production S3 + CloudFront"
  policy      = data.aws_iam_policy_document.production_deploy.json

  tags = merge(var.tags, { Environment = "production" })
}

# -----------------------------------------------------
# Staging 배포 정책
# -----------------------------------------------------
data "aws_iam_policy_document" "staging_deploy" {
  statement {
    sid    = "S3BucketLevel"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation"
    ]
    resources = ["arn:aws:s3:::${var.staging_bucket_name}"]
  }

  statement {
    sid    = "S3ObjectLevel"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject"
    ]
    resources = ["arn:aws:s3:::${var.staging_bucket_name}/*"]
  }

  # staging_cloudfront_id가 비어있으면 모든 distribution 허용 (임시)
  # → infra/staging apply 후 실제 ID 넣어서 재apply 권장
  statement {
    sid    = "CloudFrontInvalidation"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
      "cloudfront:ListInvalidations"
    ]
    resources = var.staging_cloudfront_id != "" ? [
      "arn:aws:cloudfront::*:distribution/${var.staging_cloudfront_id}"
      ] : [
      "*" # ⚠️ 임시: staging CloudFront ID 알게 되면 var로 주입 후 재apply
    ]
  }
}

resource "aws_iam_policy" "staging_deploy" {
  name        = "prep4saa-staging-deploy"
  description = "Least-privilege deploy permissions for staging S3 + CloudFront"
  policy      = data.aws_iam_policy_document.staging_deploy.json

  tags = merge(var.tags, { Environment = "staging" })
}
