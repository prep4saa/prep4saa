# =============================================================================
# PDF 다운로드용 S3 버킷
#
# 자바 백엔드(Beanstalk)가 quiz_results / mock_exams 에서 PDF 를 생성해
# 이 버킷에 PutObject → presigned URL 발급해서 프런트로 반환한다.
#
# - public access 완전 차단 (presigned URL 만 접근 가능)
# - lifecycle: N 일 후 자동 삭제 (사용자가 다운로드 받을 시간만 주고 정리)
# - 버킷 정책 X (Beanstalk EC2 instance role 에 IAM 권한 첨부로 처리)
# =============================================================================

resource "aws_s3_bucket" "pdf" {
  bucket        = var.bucket_name
  force_destroy = true

  tags = {
    Name    = var.bucket_name
    Purpose = "saa-pdf-exports"
  }
}

# Public access 완전 차단
resource "aws_s3_bucket_public_access_block" "pdf" {
  bucket = aws_s3_bucket.pdf.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle: expiration_days 일 후 자동 삭제 (스토리지 비용 0 유지)
resource "aws_s3_bucket_lifecycle_configuration" "pdf" {
  bucket = aws_s3_bucket.pdf.id

  rule {
    id     = "expire-old-pdfs"
    status = "Enabled"

    filter {}

    expiration {
      days = var.expiration_days
    }

    # 미완료 multipart upload 도 1일 후 정리
    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

# Server-side encryption (S3 관리 KMS — 추가 비용 없음)
resource "aws_s3_bucket_server_side_encryption_configuration" "pdf" {
  bucket = aws_s3_bucket.pdf.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# =============================================================================
# Beanstalk EC2 instance role 에 이 버킷 접근 권한 첨부
# - 다른 모듈(backend-beanstalk)에서 만든 role 을 데이터 소스로 가져옴
# - PutObject (자바가 PDF 업로드) + GetObject (presigned URL 발급에 필요)
# - 다른 버킷 접근 차단을 위해 Resource 를 이 버킷으로 한정
# =============================================================================

data "aws_iam_role" "beanstalk_instance" {
  name = var.beanstalk_instance_role_name
}

data "aws_iam_policy_document" "pdf_rw" {
  statement {
    sid    = "PdfBucketObjectAccess"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject"
    ]
    resources = ["${aws_s3_bucket.pdf.arn}/*"]
  }

  statement {
    sid       = "PdfBucketList"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.pdf.arn]
  }
}

resource "aws_iam_policy" "pdf_rw" {
  name        = "${var.bucket_name}-rw"
  description = "PutObject/GetObject on ${var.bucket_name} (PDF exports)"
  policy      = data.aws_iam_policy_document.pdf_rw.json
}

resource "aws_iam_role_policy_attachment" "instance_pdf" {
  role       = data.aws_iam_role.beanstalk_instance.name
  policy_arn = aws_iam_policy.pdf_rw.arn
}
