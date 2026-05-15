variable "github_owner" {
  description = "GitHub user or organization name."
  type        = string
  default     = "prep4saa"
}

variable "github_repo" {
  description = "GitHub repository name."
  type        = string
  default     = "prep4saa"
}

variable "aws_region" {
  description = "AWS region used by the IAM stack and GitHub Actions variables."
  type        = string
  default     = "us-east-1"
}

variable "production_bucket_name" {
  description = "Production S3 bucket name."
  type        = string
  default     = "prep4saa.com"
}

variable "staging_bucket_name" {
  description = "Staging S3 bucket name."
  type        = string
  default     = "staging.prep4saa.com"
}

variable "production_cloudfront_id" {
  description = "Production CloudFront distribution ID."
  type        = string
  default     = "E5O4C7TLOVEG7"
}

variable "staging_cloudfront_id" {
  description = "Staging CloudFront distribution ID."
  type        = string
  default     = ""
}

variable "production_site_url" {
  description = "Production site URL exposed in the GitHub production environment."
  type        = string
  default     = "https://prep4saa.com"
}

variable "staging_site_url" {
  description = "Staging site URL exposed in the GitHub staging environment."
  type        = string
  default     = "https://staging.prep4saa.com"
}

variable "manage_github_actions_variables" {
  description = "Whether this stack should manage GitHub Actions environment variables."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common tags."
  type        = map(string)
  default = {
    Project   = "prep4saa"
    ManagedBy = "terraform"
    Stack     = "iam"
  }
}
