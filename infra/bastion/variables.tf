variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "us-east-1"
}

# VPC 이름 (data source 조회 키)
variable "vpc_name" {
  description = "Name of the VPC to look up subnets and security groups."
  type        = string
  default     = "saa-app-vpc"
}

# Bastion EC2 식별자
variable "instance_name" {
  description = "Bastion EC2 instance name."
  type        = string
  default     = "saa-bastion"
}

# 인스턴스 타입
# - t3.micro: 프리티어 12개월 무료 (750h/월)
variable "instance_type" {
  description = "EC2 instance type."
  type        = string
  default     = "t3.micro"
}
