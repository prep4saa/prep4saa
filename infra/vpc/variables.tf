# 배포 리전
variable "aws_region" {
  description = "AWS region to deploy VPC."
  type        = string
  default     = "us-east-1"
}

# VPC 이름 (모든 리소스 태그에 사용)
variable "vpc_name" {
  description = "Name prefix for VPC and all related resources."
  type        = string
  default     = "saa-app-vpc"
}

# VPC 전체 CIDR
# - /16 = 65,536 IP 사용 가능
variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

# 멀티 AZ 구성을 위한 가용영역 목록
# - 2개 AZ 사용 (Multi-AZ 고가용성 + RDS 요구사항)
variable "availability_zones" {
  description = "Availability zones to spread subnets across."
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}
