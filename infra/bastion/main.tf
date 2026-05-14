# -------------------------------------------------------------------
# 기존 VPC 인프라 조회
# -------------------------------------------------------------------
data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = [var.vpc_name]
  }
}

# Bastion 은 Public 서브넷에 배치
# - SSM 엔드포인트로 outbound 통신 위해 IGW 경로 필요
# - inbound 는 보안그룹으로 막혀있음 (SSH 포트 안 열림)
data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
  filter {
    name   = "tag:Tier"
    values = ["public"]
  }
}

data "aws_security_group" "bastion" {
  filter {
    name   = "tag:Name"
    values = ["${var.vpc_name}-bastion-sg"]
  }
}

# -------------------------------------------------------------------
# 최신 Amazon Linux 2023 AMI 자동 조회
# -------------------------------------------------------------------
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

# -------------------------------------------------------------------
# Bastion 용 IAM Role
# - EC2 가 SSM 서비스에 접근할 수 있게 함 (Session Manager 작동)
# -------------------------------------------------------------------
resource "aws_iam_role" "bastion" {
  name = "${var.instance_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Name = "${var.instance_name}-role"
  }
}

# AWS 관리형 정책: Session Manager 작동에 필요한 모든 권한
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.bastion.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# EC2 에 IAM Role 부착하려면 Instance Profile 필요
resource "aws_iam_instance_profile" "bastion" {
  name = "${var.instance_name}-profile"
  role = aws_iam_role.bastion.name
}

# -------------------------------------------------------------------
# Bastion EC2 인스턴스
# - SSH 키 페어 없음 (Session Manager 로 접속)
# - Public 서브넷이지만 22번 포트 안 열려있음
# - PostgreSQL CLI 사전 설치
# -------------------------------------------------------------------
resource "aws_instance" "bastion" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type

  # 첫 번째 public subnet 사용
  subnet_id              = data.aws_subnets.public.ids[0]
  vpc_security_group_ids = [data.aws_security_group.bastion.id]

  iam_instance_profile = aws_iam_instance_profile.bastion.name

  # IMDSv2 hop limit 2 (SSM Agent 가 IAM 자격증명 조회 위해)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  # 부팅 시 SSM Agent + PostgreSQL 클라이언트 설치
  user_data = <<-EOF
    #!/bin/bash
    dnf install -y amazon-ssm-agent postgresql15
    systemctl enable amazon-ssm-agent
    systemctl start amazon-ssm-agent
  EOF

  # user_data 변경 시 인스턴스 재생성
  user_data_replace_on_change = true

  tags = {
    Name = var.instance_name
  }
}
