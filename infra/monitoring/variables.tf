variable "aws_region" {
  description = "AWS region. 비용(Billing) 지표는 us-east-1 에만 존재하므로 us-east-1 권장."
  type        = string
  default     = "us-east-1"
}

variable "alarm_email" {
  description = "알람 알림을 받을 이메일 주소 (SNS 구독 — 최초 1회 확인 메일의 링크를 눌러야 활성화됨)"
  type        = string
  default     = "imjaichoipro@gmail.com"
}

variable "rds_instance_id" {
  description = "감시할 RDS 인스턴스 식별자"
  type        = string
  default     = "saa-quiz-db"
}

variable "beanstalk_env_name" {
  description = "감시할 Elastic Beanstalk 환경 이름"
  type        = string
  default     = "aws4saa-backend-env"
}

variable "ec2_name_tag" {
  description = "감시할 백엔드 EC2(server.js)의 Name 태그"
  type        = string
  default     = "saa-backend"
}

# --- 알람 임계값 (필요 시 조정) ---
variable "rds_cpu_threshold" {
  description = "RDS CPU 사용률 알람 임계값(%)"
  type        = number
  default     = 80
}

variable "rds_free_storage_bytes" {
  description = "RDS 여유 스토리지 알람 임계값(바이트). 기본 2GB."
  type        = number
  default     = 2147483648
}

variable "rds_connections_threshold" {
  description = "RDS 동시 커넥션 알람 임계값"
  type        = number
  default     = 50
}

variable "ec2_cpu_threshold" {
  description = "백엔드 EC2 CPU 사용률 알람 임계값(%)"
  type        = number
  default     = 80
}

variable "monthly_cost_threshold_usd" {
  description = "월 예상 비용 알람 임계값(USD)"
  type        = number
  default     = 50
}
