# =====================================================
# 백업 버킷 입력 변수
# =====================================================

variable "production_bucket_name" {
  description = "운영 S3 버킷명 (백업 버킷 이름은 이 값 + '-backups')"
  type        = string
  default     = "prep4saa.com"
}

variable "staging_bucket_name" {
  description = "스테이징 S3 버킷명 (백업 버킷 이름은 이 값 + '-backups')"
  type        = string
  default     = "staging.prep4saa.com"
}

variable "backup_retention_days" {
  description = "백업 보관 기간 (일). 7일 후 자동 삭제 → S3 비용 최소화"
  type        = number
  default     = 7
}

variable "tags" {
  description = "공통 태그"
  type        = map(string)
  default = {
    Project   = "prep4saa"
    ManagedBy = "terraform"
    Stack     = "backups"
    Purpose   = "deployment-rollback"
  }
}
