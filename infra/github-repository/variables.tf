variable "github_owner" {
  description = "GitHub repository owner or organization."
  type        = string
  default     = "choijai"
}

variable "github_repository" {
  description = "GitHub repository name."
  type        = string
  default     = "prep4saa"
}

variable "required_status_check_contexts" {
  description = "GitHub check names that must pass before merging protected branches. These must match GitHub Actions job names exactly."
  type        = list(string)
  default = [
    "Validate (lint + build)",
    "Trivy Vulnerability Scan",
    "Bundle Size Diff",
    "Lighthouse Performance",
  ]
}

variable "required_approving_review_count" {
  description = "Number of approving PR reviews required before merging protected branches."
  type        = number
  default     = 1

  validation {
    condition     = var.required_approving_review_count >= 1
    error_message = "required_approving_review_count must be at least 1."
  }
}

variable "repository_collaborators" {
  description = "Repository collaborators managed by Terraform. Permission values: pull, triage, push, maintain, admin."
  type        = map(string)
  default     = {}

  validation {
    condition = alltrue([
      for permission in values(var.repository_collaborators) :
      contains(["pull", "triage", "push", "maintain", "admin"], permission)
    ])
    error_message = "Each repository collaborator permission must be one of: pull, triage, push, maintain, admin."
  }
}

variable "production_environment_reviewers" {
  description = "GitHub usernames allowed to approve production deployments."
  type        = set(string)
  default     = ["choijai"]
}

variable "staging_environment_reviewers" {
  description = "GitHub usernames allowed to approve staging deployments."
  type        = set(string)
  default     = []
}

variable "production_environment_reviewer_teams" {
  description = "GitHub platform-team allowed to approve production deployments."
  type        = set(string)
  default     = []
}

variable "staging_environment_reviewer_teams" {
  description = "GitHub release-managers to approve staging deployments."
  type        = set(string)
  default     = []
}

variable "merge_bypass_teams" {
  description = "GitHub security-team to bypass merge requests."
  type        = set(string)
  default     = []
}

variable "production_wait_timer_minutes" {
  description = "Required wait time before production deployments start after approval."
  type        = number
  default     = 0
}

variable "staging_wait_timer_minutes" {
  description = "Required wait time before staging deployments start after approval."
  type        = number
  default     = 0
}
