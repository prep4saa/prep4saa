# =====================================================
# Staging 환경 인프라 구성
# 생성 리소스:
#   1) ACM 와일드카드 인증서 (*.prep4saa.com)
#   2) Route 53 인증서 검증 레코드
#   3) S3 버킷 (staging.prep4saa.com)
#   4) CloudFront 배포
#   5) Route 53 A 레코드 (서브도메인 → CloudFront)
# =====================================================

locals {
  # 최종 스테이징 FQDN: staging.prep4saa.com
  staging_fqdn = "${var.subdomain}.${var.domain_name}"
}

# -----------------------------------------------------
# 0) 기존 Route 53 호스팅 영역 조회 (data source)
#    → 새로 만들지 않고 기존 prep4saa.com 영역 재사용
# -----------------------------------------------------
data "aws_route53_zone" "primary" {
  name         = var.domain_name
  private_zone = false
}

# -----------------------------------------------------
# 1) ACM 와일드카드 인증서 (*.prep4saa.com)
#    - us-east-1 리전 필수 (CloudFront 요구사항)
#    - DNS 검증 방식
# -----------------------------------------------------
resource "aws_acm_certificate" "wildcard" {
  domain_name       = "*.${var.domain_name}"
  validation_method = "DNS"

  tags = var.tags

  # 새 인증서 먼저 만들고 기존 거 제거 (다운타임 방지)
  lifecycle {
    create_before_destroy = true
  }
}

# -----------------------------------------------------
# 2) Route 53에 검증용 CNAME 레코드 자동 생성
#    → ACM이 이 레코드를 보고 "도메인 소유 확인" 처리
# -----------------------------------------------------
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.wildcard.domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = data.aws_route53_zone.primary.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

# 인증서 검증 완료 대기 (이게 끝나야 CloudFront에 붙일 수 있음)
resource "aws_acm_certificate_validation" "wildcard" {
  certificate_arn         = aws_acm_certificate.wildcard.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# -----------------------------------------------------
# 3) S3 버킷 (staging.prep4saa.com)
#    - 이름은 도메인과 동일하게 (관례)
# -----------------------------------------------------
resource "aws_s3_bucket" "staging" {
  bucket = local.staging_fqdn
  tags   = var.tags
}

# 정적 웹사이트 호스팅 활성화 + SPA 라우팅을 위해 404→index.html
resource "aws_s3_bucket_website_configuration" "staging" {
  bucket = aws_s3_bucket.staging.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html" # SPA: 모든 404를 index.html로 (React Router 등)
  }
}

# Public Access Block 해제 (CloudFront → S3 정책으로 접근 허용)
resource "aws_s3_bucket_public_access_block" "staging" {
  bucket = aws_s3_bucket.staging.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# 버킷 정책: 누구나 GetObject 허용 (정적 사이트라 OK)
resource "aws_s3_bucket_policy" "staging_public_read" {
  bucket = aws_s3_bucket.staging.id

  # public access block이 먼저 풀려야 정책 적용 가능
  depends_on = [aws_s3_bucket_public_access_block.staging]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.staging.arn}/*"
    }]
  })
}

# -----------------------------------------------------
# 4) CloudFront 배포 (CDN)
# -----------------------------------------------------
resource "aws_cloudfront_distribution" "staging" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [local.staging_fqdn]
  price_class         = "PriceClass_100" # 북미+유럽만 (가장 저렴, 한국은 us-east-1 직통)
  comment             = "Staging - ${local.staging_fqdn}"

  # S3 정적 호스팅 엔드포인트를 origin으로 사용 (REST API endpoint 아님)
  origin {
    domain_name = aws_s3_bucket_website_configuration.staging.website_endpoint
    origin_id   = "S3-${local.staging_fqdn}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # S3 웹사이트 호스팅은 HTTPS 미지원
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${local.staging_fqdn}"
    viewer_protocol_policy = "redirect-to-https" # http 접속 시 https로 자동 리다이렉트
    compress               = true                # gzip/brotli 자동 압축

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600  # 1시간 (워크플로우에서 invalidation 처리)
    max_ttl     = 86400 # 1일
  }

  # SPA 라우팅: 403/404는 index.html로 (클라이언트 라우터가 처리)
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # 위에서 발급+검증한 와일드카드 인증서 사용
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.wildcard.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = var.tags
}

# -----------------------------------------------------
# 5) Route 53 A 레코드 (alias)
#    staging.prep4saa.com → CloudFront 배포
# -----------------------------------------------------
resource "aws_route53_record" "staging" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = local.staging_fqdn
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.staging.domain_name
    zone_id                = aws_cloudfront_distribution.staging.hosted_zone_id
    evaluate_target_health = false
  }
}
