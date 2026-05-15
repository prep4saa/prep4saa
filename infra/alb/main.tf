# ===================================================================
# Application Load Balancer — design-only module
# -------------------------------------------------------------------
# Fronts the Express backend EC2 instance with:
#   - multi-AZ public ALB
#   - HTTP(80) -> HTTPS(443) redirect
#   - ACM certificate (DNS-validated via Route 53)
#   - target group health checks
#
# NOTE: applying this incurs a fixed ~$17/month charge (ALB has no
#       stop state). Intended to be applied only for demos, then
#       `terraform destroy`. See README.md.
# ===================================================================

# -------------------------------------------------------------------
# Existing VPC + public subnets (ALB must span >= 2 AZ)
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

# Existing backend EC2 instance to register as the ALB target
data "aws_instance" "backend" {
  filter {
    name   = "tag:Name"
    values = [var.backend_instance_name]
  }
  filter {
    name   = "instance-state-name"
    values = ["running", "stopped"]
  }
}

data "aws_route53_zone" "main" {
  name         = var.route53_zone_name
  private_zone = false
}

# -------------------------------------------------------------------
# ALB security group
# - inbound 80/443 from internet
# - outbound to the backend instance port
# -------------------------------------------------------------------
resource "aws_security_group" "alb" {
  name        = "${var.name}-sg"
  description = "Security group for the public Application Load Balancer"
  vpc_id      = data.aws_vpc.main.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name}-sg"
  }
}

# Allow the ALB SG to reach the backend instance on its app port.
# (Attach this rule's SG to the backend instead of opening 0.0.0.0/0.)
resource "aws_security_group_rule" "backend_from_alb" {
  type                     = "ingress"
  from_port                = var.backend_port
  to_port                  = var.backend_port
  protocol                 = "tcp"
  security_group_id        = tolist(data.aws_instance.backend.vpc_security_group_ids)[0]
  source_security_group_id = aws_security_group.alb.id
  description              = "App traffic from ALB"
}

# -------------------------------------------------------------------
# ACM certificate (DNS-validated)
# -------------------------------------------------------------------
resource "aws_acm_certificate" "main" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.name}-cert"
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# -------------------------------------------------------------------
# Application Load Balancer
# -------------------------------------------------------------------
resource "aws_lb" "main" {
  name               = var.name
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.public.ids

  tags = {
    Name = var.name
  }
}

# -------------------------------------------------------------------
# Target group — backend EC2 on its app port
# -------------------------------------------------------------------
resource "aws_lb_target_group" "backend" {
  name        = "${var.name}-tg"
  port        = var.backend_port
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.main.id
  target_type = "instance"

  health_check {
    enabled             = true
    path                = var.health_check_path
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = {
    Name = "${var.name}-tg"
  }
}

resource "aws_lb_target_group_attachment" "backend" {
  target_group_arn = aws_lb_target_group.backend.arn
  target_id        = data.aws_instance.backend.id
  port             = var.backend_port
}

# -------------------------------------------------------------------
# Listeners
# - 80  -> redirect to 443
# - 443 -> forward to target group (TLS terminated here)
# -------------------------------------------------------------------
resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.main.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# -------------------------------------------------------------------
# Route 53 alias — domain -> ALB
# -------------------------------------------------------------------
resource "aws_route53_record" "alb_alias" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}
