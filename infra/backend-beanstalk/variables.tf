variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_name" {
  description = "Tag-name of the existing VPC (shared with RDS, EC2, etc.)"
  type        = string
  default     = "saa-app-vpc"
}

variable "app_name" {
  description = "Elastic Beanstalk application name (also used as resource name prefix)"
  type        = string
  default     = "aws4saa-backend"
}

variable "instance_type" {
  description = "EC2 instance type. Spring Boot(JVM) 는 메모리를 꽤 쓰므로 t3.small(2GB) 권장. t3.micro(1GB)도 가능하나 부하 시 OOM 위험."
  type        = string
  default     = "t3.small"
}

variable "solution_stack_name" {
  description = "Beanstalk 솔루션 스택 이름. 콘솔의 'Docker running on 64bit Amazon Linux 2023' v4.12.3 에 해당. 새 플랫폼 버전이 나오면 이 값만 갱신."
  type        = string
  default     = "64bit Amazon Linux 2023 v4.12.3 running Docker"
}

# --- Container image (GitHub Actions 가 ECR 에 푸시한 이미지) ---
variable "ecr_image" {
  description = "ECR image URI(태그 포함) — Beanstalk 이 실행할 컨테이너 이미지"
  type        = string
  default     = "973294444983.dkr.ecr.us-east-1.amazonaws.com/aws4saa-backend:latest"
}

# --- DB 접속정보는 rds 모듈이 만든 Secrets Manager 시크릿에서 읽어온다 ---
# (별도로 비밀번호를 tfvars 에 넣을 필요 없음 — 단일 진실 공급원)
variable "db_secret_name" {
  description = "Secrets Manager 시크릿 이름. rds 모듈이 '<db_identifier>-credentials' 형식으로 생성함."
  type        = string
  default     = "saa-quiz-db-credentials"
}

# --- 그 외 애플리케이션 환경변수 ---
variable "cors_allowed_origins" {
  description = "자바 백엔드가 허용할 프런트엔드 오리진(쉼표 구분)"
  type        = string
  default     = "https://www.prep4saa.com,https://prep4saa.com"
}

variable "cognito_region" {
  description = "Cognito User Pool 리전"
  type        = string
  default     = "us-east-1"
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID (JWT issuer)"
  type        = string
  default     = "us-east-1_7KtKlj968"
}
