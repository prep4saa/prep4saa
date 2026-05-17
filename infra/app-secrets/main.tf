# ===================================================================
# 애플리케이션 시크릿 — AI 제공자 API 키
#
# 이 모듈은 시크릿 "컨테이너"만 생성한다. 실제 키 값은 Terraform 에
# 넣지 않고(state 에 평문으로 남으므로), apply 후 AWS 콘솔에서 직접 채운다.
#
# 시크릿 값 형식(JSON):
#   { "anthropic_api_key": "sk-ant-...", "gemini_api_key": "AIza..." }
#
# 이 키들은 현재 EC2 의 평문 .env 에 있던 것 — Secrets Manager 로 옮겨
# 암호화 보관 + 접근 제어 + 감사 로그를 적용한다.
# ===================================================================
resource "aws_secretsmanager_secret" "ai_api_keys" {
  name        = var.ai_api_keys_secret_name
  description = "AI provider API keys (Anthropic, Gemini) for aws4saa backend"

  # 삭제 시 즉시 제거 (복구 대기창 없음 — 개인 프로젝트 기준)
  recovery_window_in_days = 0

  tags = {
    Name = var.ai_api_keys_secret_name
  }
}
