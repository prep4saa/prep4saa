# 테라폼으로 보호 중인 브랜치 목록 (정렬된 문자열 리스트)
output "protected_branches" {
  description = "Branches protected by Terraform."
  value       = sort(tolist(local.protected_branches))
}

# 보호 브랜치 머지 전 필수 통과 체크 목록
output "required_status_check_contexts" {
  description = "Required GitHub status checks for protected branches."
  value       = var.required_status_check_contexts
}

# 테라폼으로 관리 중인 GitHub 배포 환경 이름 목록 (production, staging 등)
output "managed_environments" {
  description = "GitHub deployment environments managed by Terraform."
  value       = sort(keys(github_repository_environment.deploy))
}

# 테라폼으로 관리 중인 협업자 및 권한 목록
output "managed_collaborators" {
  description = "Repository collaborators managed by Terraform."
  value       = var.repository_collaborators
}
