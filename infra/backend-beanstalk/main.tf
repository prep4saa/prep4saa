# ===================================================================
# aws4saa Spring Boot 백엔드 — Elastic Beanstalk (Docker, 단일 인스턴스)
#
# 기존 infra 패턴을 따름:
#  - 공유 리소스(VPC / 서브넷 / RDS 보안그룹)는 태그로 data 조회
#  - 컨테이너 이미지는 ECR 의 aws4saa-backend (GitHub Actions 가 푸시)
# ===================================================================

data "aws_caller_identity" "current" {}

# -------------------------------------------------------------------
# RDS 접속정보 — rds 모듈이 Secrets Manager 에 저장한 시크릿에서 읽어온다.
# 시크릿 JSON: { username, password, engine, host, port, dbname }
# -------------------------------------------------------------------
data "aws_secretsmanager_secret" "db" {
  name = var.db_secret_name
}

data "aws_secretsmanager_secret_version" "db" {
  secret_id = data.aws_secretsmanager_secret.db.id
}

# AI 제공자 API 키 — app-secrets 모듈이 만든 시크릿에서 읽어온다.
# 시크릿 JSON: { anthropic_api_key, gemini_api_key }
data "aws_secretsmanager_secret" "ai_api_keys" {
  name = var.ai_api_keys_secret_name
}

data "aws_secretsmanager_secret_version" "ai_api_keys" {
  secret_id = data.aws_secretsmanager_secret.ai_api_keys.id
}

locals {
  db      = jsondecode(data.aws_secretsmanager_secret_version.db.secret_string)
  ai_keys = jsondecode(data.aws_secretsmanager_secret_version.ai_api_keys.secret_string)
}

# -------------------------------------------------------------------
# 기존 공유 인프라 조회 (태그 기반 — backend-ec2 모듈과 동일 패턴)
# -------------------------------------------------------------------
data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = [var.vpc_name]
  }
}

# 단일 인스턴스가 인터넷(ECR pull, Cognito JWKS)에 닿아야 하므로 퍼블릭 서브넷 사용.
# 같은 VPC 안이라 프라이빗 RDS 에는 내부망으로 접속됨.
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

# RDS 보안그룹 — 여기에 "Beanstalk → RDS:5432" 인바운드 규칙을 추가한다.
data "aws_security_group" "rds" {
  filter {
    name   = "tag:Name"
    values = ["${var.vpc_name}-rds-sg"]
  }
}

# -------------------------------------------------------------------
# Beanstalk EC2 인스턴스용 보안그룹
# - 인바운드: HTTP 80 (Beanstalk 의 nginx 프록시가 80 → 컨테이너 8080 으로 포워딩)
# - 아웃바운드: 전체 허용 (ECR, Cognito, RDS)
# -------------------------------------------------------------------
resource "aws_security_group" "beanstalk" {
  name        = "${var.app_name}-eb-sg"
  description = "Security group for aws4saa-backend Elastic Beanstalk instance"
  vpc_id      = data.aws_vpc.main.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
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
    Name = "${var.app_name}-eb-sg"
  }
}

# Beanstalk SG → RDS:5432 허용 (backend-ec2 모듈의 rds_from_backend 와 동일 패턴)
resource "aws_security_group_rule" "rds_from_beanstalk" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = data.aws_security_group.rds.id
  source_security_group_id = aws_security_group.beanstalk.id
  description              = "PostgreSQL from aws4saa-backend Beanstalk"
}

# -------------------------------------------------------------------
# IAM: Beanstalk 서비스 역할 (환경 관리/헬스 모니터링용)
# -------------------------------------------------------------------
resource "aws_iam_role" "service" {
  name = "${var.app_name}-eb-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "elasticbeanstalk.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = { Name = "${var.app_name}-eb-service-role" }
}

resource "aws_iam_role_policy_attachment" "service_health" {
  role       = aws_iam_role.service.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role_policy_attachment" "service_updates" {
  role       = aws_iam_role.service.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy"
}

# -------------------------------------------------------------------
# IAM: EC2 인스턴스 프로파일
# - AWSElasticBeanstalkWebTier   : Beanstalk 기본 동작
# - AmazonEC2ContainerRegistryReadOnly : ECR 에서 이미지 pull (필수!)
# - AmazonSSMManagedInstanceCore : SSM 세션 매니저로 셸 접속 (SSH 키 불필요)
# -------------------------------------------------------------------
resource "aws_iam_role" "instance" {
  name = "${var.app_name}-eb-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = { Name = "${var.app_name}-eb-instance-role" }
}

resource "aws_iam_role_policy_attachment" "instance_webtier" {
  role       = aws_iam_role.instance.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy_attachment" "instance_ecr" {
  role       = aws_iam_role.instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "instance_ssm" {
  role       = aws_iam_role.instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "instance" {
  name = "${var.app_name}-eb-instance-profile"
  role = aws_iam_role.instance.name
}

# -------------------------------------------------------------------
# 애플리케이션 소스 번들 (Dockerrun.aws.json 을 zip 으로)
# - Dockerrun.aws.json 이 ECR 이미지를 가리킴 (app/ 폴더 참조)
# -------------------------------------------------------------------
data "archive_file" "source" {
  type        = "zip"
  source_file = "${path.module}/app/Dockerrun.aws.json"
  output_path = "${path.module}/build/source-bundle.zip"
}

resource "aws_s3_bucket" "versions" {
  bucket        = "${var.app_name}-eb-versions-${data.aws_caller_identity.current.account_id}"
  force_destroy = true

  tags = { Name = "${var.app_name}-eb-versions" }
}

resource "aws_s3_object" "source" {
  bucket = aws_s3_bucket.versions.id
  key    = "source-bundle-${data.archive_file.source.output_md5}.zip"
  source = data.archive_file.source.output_path
  etag   = data.archive_file.source.output_md5
}

# -------------------------------------------------------------------
# Elastic Beanstalk 애플리케이션 + 버전 + 환경
# -------------------------------------------------------------------
resource "aws_elastic_beanstalk_application" "app" {
  name        = var.app_name
  description = "aws4saa Spring Boot backend (Strangler Fig migration target)"
}

resource "aws_elastic_beanstalk_application_version" "v" {
  name        = "v-${data.archive_file.source.output_md5}"
  application = aws_elastic_beanstalk_application.app.name
  description = "Docker image: ${var.ecr_image}"
  bucket      = aws_s3_bucket.versions.id
  key         = aws_s3_object.source.key
}

resource "aws_elastic_beanstalk_environment" "env" {
  name                = "${var.app_name}-env"
  application         = aws_elastic_beanstalk_application.app.name
  solution_stack_name = var.solution_stack_name
  version_label       = aws_elastic_beanstalk_application_version.v.name
  tier                = "WebServer"

  # --- 단일 인스턴스 (로드밸런서 없음 — 비용 절약) ---
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = aws_iam_role.service.arn
  }

  # --- 네트워킹: RDS 와 같은 VPC, 퍼블릭 서브넷, 퍼블릭 IP 할당 ---
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = data.aws_vpc.main.id
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", data.aws_subnets.public.ids)
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "AssociatePublicIpAddress"
    value     = "true"
  }

  # --- 인스턴스 설정 ---
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.instance.name
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.beanstalk.id
  }
  setting {
    namespace = "aws:ec2:instances"
    name      = "InstanceTypes"
    value     = var.instance_type
  }

  # --- 향상된 헬스 리포팅 ---
  setting {
    namespace = "aws:elasticbeanstalk:healthreporting:system"
    name      = "SystemType"
    value     = "enhanced"
  }

  # --- 애플리케이션 환경변수 (컨테이너에 주입) ---
  # DB 접속정보는 Secrets Manager 시크릿에서 읽은 값 사용
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_HOST"
    value     = local.db.host
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_PORT"
    value     = tostring(local.db.port)
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_NAME"
    value     = local.db.dbname
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_USER"
    value     = local.db.username
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_PASSWORD"
    value     = local.db.password
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "CORS_ALLOWED_ORIGINS"
    value     = var.cors_allowed_origins
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "COGNITO_REGION"
    value     = var.cognito_region
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "COGNITO_USER_POOL_ID"
    value     = var.cognito_user_pool_id
  }

  # --- AI 제공자 API 키 (Secrets Manager 에서 읽어 주입) ---
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ANTHROPIC_API_KEY"
    value     = local.ai_keys.anthropic_api_key
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "GEMINI_API_KEY"
    value     = local.ai_keys.gemini_api_key
  }

  # 배포 버전(version_label)은 GitHub Actions(CI)가 관리한다.
  # Terraform 은 인프라(인스턴스/VPC/환경변수/보안)만 소유하고,
  # "지금 어떤 이미지 버전이 떠 있나"는 건드리지 않는다.
  lifecycle {
    ignore_changes = [version_label]
  }

  tags = {
    Name = "${var.app_name}-env"
  }
}

# -------------------------------------------------------------------
# CloudFront — HTTPS 종단점
#
# 운영 프런트(https://www.prep4saa.com)가 http Beanstalk 을 직접 호출하면
# 브라우저가 mixed-content 로 차단한다. CloudFront 를 앞에 두어 HTTPS 를 입힌다.
#  - 기본 *.cloudfront.net 도메인이 HTTPS 인증서를 무료 제공 (도메인/ACM 불필요)
#  - API 이므로 캐싱 비활성화, 모든 메서드/헤더 전달
# -------------------------------------------------------------------
data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_viewer_no_host" {
  name = "Managed-AllViewerExceptHostHeader"
}

resource "aws_cloudfront_distribution" "api" {
  enabled = true
  comment = "${var.app_name} HTTPS endpoint (in front of Beanstalk)"

  origin {
    domain_name = aws_elastic_beanstalk_environment.env.cname
    origin_id   = "beanstalk"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "beanstalk"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]

    cache_policy_id          = data.aws_cloudfront_cache_policy.disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_no_host.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  price_class = "PriceClass_100"

  tags = {
    Name = "${var.app_name}-cf"
  }
}
