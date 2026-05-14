output "instance_id" {
  description = "EC2 instance ID (use for Session Manager)"
  value       = aws_instance.backend.id
}

output "public_ip" {
  description = "Elastic IP (stable across stop/start)"
  value       = aws_eip.backend.public_ip
}

output "public_dns" {
  description = "Public DNS of the instance"
  value       = aws_instance.backend.public_dns
}

output "backend_url" {
  description = "Express backend base URL — set this as VITE_BACKEND_URL"
  value       = "http://${aws_eip.backend.public_ip}:${var.app_port}"
}

output "security_group_id" {
  description = "Backend security group ID"
  value       = aws_security_group.backend.id
}

output "session_manager_command" {
  description = "Shell into the instance via SSM"
  value       = "aws ssm start-session --target ${aws_instance.backend.id} --region ${var.aws_region}"
}
