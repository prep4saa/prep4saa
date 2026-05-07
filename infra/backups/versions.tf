# =====================================================
# Terraform 및 Provider 버전 고정 (백업 버킷 스택)
# =====================================================
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.44"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
