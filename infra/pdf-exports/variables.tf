variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "PDF 다운로드용 S3 버킷 이름 (전역 유일해야 함)"
  type        = string
  default     = "saa-pdf-exports"
}

variable "beanstalk_instance_role_name" {
  description = "Beanstalk EC2 instance role 이름 (이 role 에 S3 권한 첨부)"
  type        = string
  default     = "aws4saa-backend-eb-instance-role"
}

variable "expiration_days" {
  description = "PDF 객체 자동 삭제 일수 (24h 이상 잡아두면 사용자가 다운 받을 시간 충분)"
  type        = number
  default     = 1
}
