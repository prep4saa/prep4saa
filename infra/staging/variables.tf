# =====================================================
# 입력 변수 (terraform apply -var "..." 또는 .tfvars 파일로 주입)
# =====================================================

variable "domain_name" {
  description = "루트 도메인 (apex). Route 53 호스팅 영역이 이미 존재해야 함"
  type        = string
  default     = "prep4saa.com"
}

variable "subdomain" {
  description = "스테이징 서브도메인 prefix (예: staging → staging.prep4saa.com)"
  type        = string
  default     = "staging"
}

variable "tags" {
  description = "모든 리소스에 공통으로 붙일 태그 (비용 추적/관리용)"
  type        = map(string)
  default = {
    Project     = "prep4saa"
    Environment = "staging"
    ManagedBy   = "terraform"
  }
}
