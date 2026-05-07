# =====================================================
# GitHub Actions OIDC Provider
# - GitHub Actions가 발급한 JWT 토큰을 AWS가 신뢰하도록 등록
# - 한 AWS 계정에 1개만 만들면 됨 (모든 repo가 공유)
# =====================================================

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  # AWS STS가 토큰의 audience(aud) 클레임으로 확인하는 값
  client_id_list = ["sts.amazonaws.com"]

  # GitHub OIDC 인증서 thumbprint (GitHub 공식 발표값)
  # 2023년 6월부터 AWS는 자체 검증하지만, 리소스 생성 시 필수 필드
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  ]

  tags = var.tags
}
