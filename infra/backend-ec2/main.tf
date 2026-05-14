# -------------------------------------------------------------------
# Existing VPC + public subnet lookup
# -------------------------------------------------------------------
data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = [var.vpc_name]
  }
}

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

# Reuse existing data-tier security groups to grant ingress to backend
data "aws_security_group" "rds" {
  filter {
    name   = "tag:Name"
    values = ["${var.vpc_name}-rds-sg"]
  }
}

data "aws_security_group" "redis" {
  filter {
    name   = "tag:Name"
    values = ["${var.vpc_name}-redis-sg"]
  }
}

# -------------------------------------------------------------------
# Latest Amazon Linux 2023 AMI
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
# Backend security group
# - Inbound: app_port from anywhere (Express server)
# - Inbound (optional): SSH from operator IP
# - Outbound: all (npm install, Cognito, S3, RDS, Redis)
# -------------------------------------------------------------------
resource "aws_security_group" "backend" {
  name        = "${var.instance_name}-sg"
  description = "Security group for Express backend EC2"
  vpc_id      = data.aws_vpc.main.id

  ingress {
    description = "Express API"
    from_port   = var.app_port
    to_port     = var.app_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP for future ALB / Let's Encrypt http-01 challenge
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS for future TLS termination
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  dynamic "ingress" {
    for_each = var.allow_ssh_cidr == "" ? [] : [1]
    content {
      description = "SSH"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [var.allow_ssh_cidr]
    }
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.instance_name}-sg"
  }
}

# Allow backend SG → RDS:5432
resource "aws_security_group_rule" "rds_from_backend" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = data.aws_security_group.rds.id
  source_security_group_id = aws_security_group.backend.id
  description              = "PostgreSQL from backend EC2"
}

# Allow backend SG → Redis:6379
resource "aws_security_group_rule" "redis_from_backend" {
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  security_group_id        = data.aws_security_group.redis.id
  source_security_group_id = aws_security_group.backend.id
  description              = "Redis from backend EC2"
}

# -------------------------------------------------------------------
# IAM role: SSM (Session Manager) + S3 read (for static assets)
# -------------------------------------------------------------------
resource "aws_iam_role" "backend" {
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

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.backend.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "s3_read" {
  role       = aws_iam_role.backend.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}

resource "aws_iam_instance_profile" "backend" {
  name = "${var.instance_name}-profile"
  role = aws_iam_role.backend.name
}

# -------------------------------------------------------------------
# Elastic IP — keeps the same public IP across stop/start
# -------------------------------------------------------------------
resource "aws_eip" "backend" {
  domain = "vpc"

  tags = {
    Name = "${var.instance_name}-eip"
  }
}

resource "aws_eip_association" "backend" {
  instance_id   = aws_instance.backend.id
  allocation_id = aws_eip.backend.id
}

# -------------------------------------------------------------------
# EC2 instance
# - Public subnet (auto-assign public IP, then replaced by EIP)
# - Session Manager enabled (no SSH key required)
# - user_data installs Node.js 22, git, nginx, pm2
# -------------------------------------------------------------------
resource "aws_instance" "backend" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  subnet_id              = data.aws_subnets.public.ids[0]
  vpc_security_group_ids = [aws_security_group.backend.id]
  iam_instance_profile   = aws_iam_instance_profile.backend.name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  user_data = <<-EOF
    #!/bin/bash
    set -eux
    dnf update -y
    dnf install -y git nginx amazon-ssm-agent
    systemctl enable amazon-ssm-agent
    systemctl start amazon-ssm-agent

    # Node.js 22 from NodeSource
    curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
    dnf install -y nodejs

    # PM2 (process manager — auto-restart on crash, run on boot)
    npm install -g pm2

    # Create app user + dir
    useradd -m -s /bin/bash ec2-app || true
    mkdir -p /opt/app
    chown ec2-app:ec2-app /opt/app

    # PM2 systemd service for ec2-app user
    sudo -u ec2-app bash -c 'pm2 startup systemd -u ec2-app --hp /home/ec2-app' || true
    env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-app --hp /home/ec2-app
    systemctl enable pm2-ec2-app
  EOF

  user_data_replace_on_change = true

  tags = {
    Name = var.instance_name
  }
}
