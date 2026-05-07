# =====================================================
# IAM 스택 입력 변수
# =====================================================

variable "github_owner" {
  description = "GitHub 사용자명 또는 organization 이름"
  type        = string
  default     = "choijai"
}

variable "github_repo" {
  description = "GitHub 저장소 이름"
  type        = string
  default     = "prep4saa"
}

variable "production_bucket_name" {
  description = "운영 환경 S3 버킷명 (도메인과 동일)"
  type        = string
  default     = "prep4saa.com"
}

variable "staging_bucket_name" {
  description = "스테이징 환경 S3 버킷명 (도메인과 동일)"
  type        = string
  default     = "staging.prep4saa.com"
}

variable "production_cloudfront_id" {
  description = "운영 CloudFront 배포 ID"
  type        = string
  default     = "E5O4C7TLOVEG7"
}

variable "staging_cloudfront_id" {
  description = "스테이징 CloudFront 배포 ID (terraform apply 후 infra/staging의 출력값으로 채워야 함)"
  type        = string
  default     = "" # ← infra/staging의 output 값으로 채우거나 -var로 주입
}

variable "tags" {
  description = "공통 태그"
  type        = map(string)
  default = {
    Project   = "prep4saa"
    ManagedBy = "terraform"
    Stack     = "iam"
  }
}
