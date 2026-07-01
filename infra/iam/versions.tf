# =====================================================
# Terraform 및 Provider 버전 고정
# - IAM은 글로벌 리소스지만 provider는 리전 지정 필수
# =====================================================
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.52"
    }
  }
}

provider "aws" {
  region = "us-east-1" # IAM은 글로벌이지만 provider 동작용
}
