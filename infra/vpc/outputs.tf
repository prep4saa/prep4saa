# 다른 모듈에서 참조할 VPC 정보 출력

# VPC ID - RDS, ElastiCache 보안그룹 생성 시 필요
output "vpc_id" {
  description = "ID of the VPC."
  value       = aws_vpc.main.id
}

# VPC CIDR - 보안그룹 규칙 작성 시 참조
output "vpc_cidr_block" {
  description = "CIDR block of the VPC."
  value       = aws_vpc.main.cidr_block
}

# Public 서브넷 ID 목록 - ALB 등 인터넷 노출 리소스 배치 시 사용
output "public_subnet_ids" {
  description = "IDs of public subnets (for ALB, NAT, etc)."
  value       = aws_subnet.public[*].id
}

# Private App 서브넷 ID 목록 - Lambda, ECS 배치 시 사용
output "private_app_subnet_ids" {
  description = "IDs of private app subnets (for Lambda, ECS, EC2)."
  value       = aws_subnet.private_app[*].id
}

# Private Data 서브넷 ID 목록 - RDS Subnet Group, ElastiCache Subnet Group 생성 시 사용
output "private_data_subnet_ids" {
  description = "IDs of private data subnets (for RDS, ElastiCache)."
  value       = aws_subnet.private_data[*].id
}

# Lambda 보안그룹 ID - Lambda 함수에 부착
output "lambda_security_group_id" {
  description = "Security group ID for Lambda functions."
  value       = aws_security_group.lambda.id
}

# RDS 보안그룹 ID - RDS 인스턴스에 부착
output "rds_security_group_id" {
  description = "Security group ID for RDS PostgreSQL."
  value       = aws_security_group.rds.id
}

# Redis 보안그룹 ID - ElastiCache 클러스터에 부착
output "redis_security_group_id" {
  description = "Security group ID for ElastiCache Redis."
  value       = aws_security_group.redis.id
}

# Bastion 보안그룹 ID - Bastion EC2 에 부착
output "bastion_security_group_id" {
  description = "Security group ID for Bastion EC2."
  value       = aws_security_group.bastion.id
}
