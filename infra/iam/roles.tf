# =====================================================
# 환경별 IAM Role (Production / Staging 분리)
# - 각 Role은 자기 환경의 GitHub Environment 컨텍스트에서만 사용 가능
# - 즉 staging Role은 production 배포 시 절대 못 씀 (보안)
# =====================================================

# -----------------------------------------------------
# 1) Production Role
#    - main 브랜치 + production 환경에서만 assume 가능
# -----------------------------------------------------
data "aws_iam_policy_document" "production_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    # OIDC 토큰의 audience 검증 (sts.amazonaws.com 고정)
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # OIDC 토큰의 subject 검증 — 핵심 보안 게이트
    # repo:choijai/prep4saa:environment:production 만 허용
    # → feature 브랜치, fork된 repo, 다른 환경에서는 절대 assume 불가
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${var.github_owner}/${var.github_repo}:environment:production"
      ]
    }
  }
}

resource "aws_iam_role" "production" {
  name        = "github-actions-prep4saa-production"
  description = "Role assumed by GitHub Actions for production deployments"

  assume_role_policy   = data.aws_iam_policy_document.production_trust.json
  max_session_duration = 3600 # 1시간 (최소값, 보안 위해 짧게)

  tags = merge(var.tags, { Environment = "production" })
}

# 정책 부착 (policies.tf에서 정의)
resource "aws_iam_role_policy_attachment" "production_deploy" {
  role       = aws_iam_role.production.name
  policy_arn = aws_iam_policy.production_deploy.arn
}

# -----------------------------------------------------
# 2) Staging Role
#    - staging 브랜치 + staging 환경에서만 assume 가능
# -----------------------------------------------------
data "aws_iam_policy_document" "staging_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${var.github_owner}/${var.github_repo}:environment:staging"
      ]
    }
  }
}

resource "aws_iam_role" "staging" {
  name        = "github-actions-prep4saa-staging"
  description = "Role assumed by GitHub Actions for staging deployments"

  assume_role_policy   = data.aws_iam_policy_document.staging_trust.json
  max_session_duration = 3600

  tags = merge(var.tags, { Environment = "staging" })
}

resource "aws_iam_role_policy_attachment" "staging_deploy" {
  role       = aws_iam_role.staging.name
  policy_arn = aws_iam_policy.staging_deploy.arn
}
