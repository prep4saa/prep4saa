# -------------------------------------------------------------------
# Cognito User Pool
# - 사용자 디렉토리 + 인증 서비스
# - 대기업 표준 password policy
# - 이메일 verification 자동 발송
# - Lambda triggers 자리만 마련 (Phase 2-2 에서 ARN 주입)
# -------------------------------------------------------------------
resource "aws_cognito_user_pool" "main" {
  name = var.user_pool_name

  # 사용자명 = 이메일 (별도 username X)
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # === 대기업 표준 password policy ===
  # - 최소 12자 (NIST 권장)
  # - 대/소/숫자/특수문자 모두 필수
  password_policy {
    minimum_length                   = 12
    require_uppercase                = true
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 1
  }

  # 사용자 직접 가입 허용 (관리자만 X)
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  # 비번 분실 시 verified email 로 복구
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # 가입 시 verification 이메일 자동 발송
  # - 학습: Cognito 기본 이메일 서비스 (50통/일 무료)
  # - 운영: SES 연동 권장 (대량 발송 + 사용자 정의 도메인)
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Verify your email for SAA-C03 quiz app"
    email_message        = "Your verification code is {####}"
  }

  # 이메일 변경 시 재인증 필수 (계정 탈취 방어)
  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }

  # MFA - 학습은 OFF, 운영은 OPTIONAL or ON
  mfa_configuration = "OFF"

  # email schema (User Pool 의 사용자 속성 정의)
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 5
      max_length = 255
    }
  }

  # Lambda Triggers - 처음엔 비어있음, lambda 모듈 만든 후 주입
  # dynamic 으로 두 lambda ARN 모두 null 일 때 lambda_config 자체가 안 만들어지게
  dynamic "lambda_config" {
    for_each = (
      var.user_migration_lambda_arn != null ||
      var.post_confirmation_lambda_arn != null
    ) ? [1] : []

    content {
      user_migration    = var.user_migration_lambda_arn
      post_confirmation = var.post_confirmation_lambda_arn
    }
  }

  # 학습용은 OFF, 운영은 ACTIVE (User Pool 삭제 차단)
  deletion_protection = "INACTIVE"

  tags = {
    Name = var.user_pool_name
  }
}

# -------------------------------------------------------------------
# User Pool Client (앱 클라이언트)
# - SPA 용 (브라우저 React 앱): client secret 없음
# - Native 모바일 앱이라면 secret 사용 가능
# -------------------------------------------------------------------
resource "aws_cognito_user_pool_client" "web" {
  name         = var.user_pool_client_name
  user_pool_id = aws_cognito_user_pool.main.id

  # SPA 는 client secret 보관 불가 → 없이 동작
  generate_secret = false

  # === 인증 흐름 ===
  # - USER_PASSWORD_AUTH: email + password 로그인 (가장 흔함)
  # - USER_SRP_AUTH: Secure Remote Password (보안 ↑, 비번 절대 서버로 안 감)
  # - REFRESH_TOKEN_AUTH: refresh token 으로 access token 갱신
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  # === 토큰 유효기간 ===
  # 짧은 access token + 긴 refresh token → 보안 + UX 균형
  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # === 보안 ===
  # 가입 안 된 이메일에 대해 "user not exist" 메시지 노출 X
  # → 공격자가 가입된 이메일 목록 알아내는 것 차단
  prevent_user_existence_errors = "ENABLED"

  # 토큰 revocation (logout 시 토큰 즉시 무효화)
  enable_token_revocation = true

  # === OAuth 설정 (소셜 로그인 / Hosted UI 위해) ===
  callback_urls                        = var.callback_urls
  logout_urls                          = var.logout_urls
  supported_identity_providers         = ["COGNITO"]
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true
}
