# -------------------------------------------------------------------
# 테라폼 버전 및 프로바이더 설정
# - 테라폼 최소 버전: 1.6.0
# - GitHub 프로바이더: integrations/github (6.x 버전)
# -------------------------------------------------------------------
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    github = {
      source  = "integrations/github"
      version = ">= 6.0.0, < 7.0.0"
    }
  }
}

# GitHub 프로바이더 설정 - 소유자(owner)는 변수에서 주입
provider "github" {
  owner = var.github_owner
}
