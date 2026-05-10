# -------------------------------------------------------------------
# Lambda 용 보안그룹
# - 아웃바운드: 모두 허용 (RDS, Redis, 외부 API 호출)
# - 인바운드: 없음 (Lambda 는 외부에서 직접 접근하지 않음)
# -------------------------------------------------------------------
resource "aws_security_group" "lambda" {
  name        = "${var.vpc_name}-lambda-sg"
  description = "Security group for Lambda functions in private app subnets"
  vpc_id      = aws_vpc.main.id

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.vpc_name}-lambda-sg"
  }
}

# -------------------------------------------------------------------
# Bastion EC2 보안그룹
# - 아웃바운드: 모두 허용 (SSM, RDS 통신)
# - 인바운드: 없음 (Session Manager는 EC2에서 outbound로 연결됨)
# -------------------------------------------------------------------
resource "aws_security_group" "bastion" {
  name        = "${var.vpc_name}-bastion-sg"
  description = "Security group for Bastion EC2 (Session Manager)"
  vpc_id      = aws_vpc.main.id

  egress {
    description = "All outbound (SSM endpoints, RDS, etc)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.vpc_name}-bastion-sg"
  }
}

# -------------------------------------------------------------------
# RDS PostgreSQL 보안그룹
# - 인바운드: Lambda SG, Bastion SG 만 5432 허용
# - 외부 IP에서는 절대 접근 불가
# -------------------------------------------------------------------
resource "aws_security_group" "rds" {
  name        = "${var.vpc_name}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from Lambda"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  ingress {
    description     = "PostgreSQL from Bastion"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  tags = {
    Name = "${var.vpc_name}-rds-sg"
  }
}

# -------------------------------------------------------------------
# ElastiCache Redis 보안그룹
# - 인바운드: Lambda SG에서만 6379 포트 허용
# -------------------------------------------------------------------
resource "aws_security_group" "redis" {
  name        = "${var.vpc_name}-redis-sg"
  description = "Security group for ElastiCache Redis"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Redis from Lambda"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  tags = {
    Name = "${var.vpc_name}-redis-sg"
  }
}
