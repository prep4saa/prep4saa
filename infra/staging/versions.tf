# =====================================================
# Terraform 및 Provider 버전 고정
# - 협업/재현성을 위해 버전을 명시 (실무 표준)
# =====================================================
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.56"
    }
  }
}

# CloudFront용 ACM 인증서는 us-east-1 리전에 있어야 함 (AWS 제약)
provider "aws" {
  region = "us-east-1"
}
