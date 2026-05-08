output "protected_branches" {
  description = "Branches protected by Terraform."
  value       = sort(tolist(local.protected_branches))
}

output "required_status_check_contexts" {
  description = "Required GitHub status checks for protected branches."
  value       = var.required_status_check_contexts
}

output "managed_environments" {
  description = "GitHub deployment environments managed by Terraform."
  value       = sort(keys(github_repository_environment.deploy))
}

output "managed_collaborators" {
  description = "Repository collaborators managed by Terraform."
  value       = var.repository_collaborators
}
