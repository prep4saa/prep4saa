output "bucket_name" {
  description = "PDF S3 버킷 이름 (자바 application.yaml 의 PDF_BUCKET 환경변수)"
  value       = aws_s3_bucket.pdf.id
}

output "bucket_arn" {
  description = "PDF S3 버킷 ARN"
  value       = aws_s3_bucket.pdf.arn
}
