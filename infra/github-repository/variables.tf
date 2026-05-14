# GitHub 조직 또는 계정 이름
variable "github_owner" {
  description = "GitHub repository owner or organization."
  type        = string
  default     = "choijai"
}

# 관리 대상 GitHub 리포지터리 이름
variable "github_repository" {
  description = "GitHub repository name."
  type        = string
  default     = "prep4saa"
}

# 보호 브랜치 머지 전에 반드시 통과해야 할 GitHub Actions 체크 목록
# (Actions job 이름과 정확히 일치해야 함)
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

# 머지 전 필요한 PR 승인자 수 (최소 1명)
variable "required_approving_review_count" {
  description = "Number of approving PR reviews required before merging protected branches."
  type        = number
  default     = 1

  validation {
    condition     = var.required_approving_review_count >= 1
    error_message = "required_approving_review_count must be at least 1."
  }
}

# 테라폼으로 관리할 리포지터리 협업자 목록
# key: GitHub 사용자명, value: 권한 (pull / triage / push / maintain / admin)
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

# production 환경 배포를 승인할 수 있는 GitHub 사용자명 목록
variable "production_environment_reviewers" {
  description = "GitHub usernames allowed to approve production deployments."
  type        = set(string)
  default     = ["choijai"]
}

# staging 환경 배포를 승인할 수 있는 GitHub 사용자명 목록
variable "staging_environment_reviewers" {
  description = "GitHub usernames allowed to approve staging deployments."
  type        = set(string)
  default     = []
}

# production 환경 배포를 승인할 수 있는 GitHub 팀 슬러그 목록
variable "production_environment_reviewer_teams" {
  description = "GitHub platform-team allowed to approve production deployments."
  type        = set(string)
  default     = []
}

# staging 환경 배포를 승인할 수 있는 GitHub 팀 슬러그 목록
variable "staging_environment_reviewer_teams" {
  description = "GitHub release-managers to approve staging deployments."
  type        = set(string)
  default     = []
}

# PR 리뷰 없이 머지할 수 있는 팀 슬러그 목록 (브랜치 보호 우회)
variable "merge_bypass_teams" {
  description = "GitHub security-team to bypass merge requests."
  type        = set(string)
  default     = []
}

# production 환경 - 승인 후 실제 배포 시작까지 대기 시간 (분)
variable "production_wait_timer_minutes" {
  description = "Required wait time before production deployments start after approval."
  type        = number
  default     = 0
}

# staging 환경 - 승인 후 실제 배포 시작까지 대기 시간 (분)
variable "staging_wait_timer_minutes" {
  description = "Required wait time before staging deployments start after approval."
  type        = number
  default     = 0
}
