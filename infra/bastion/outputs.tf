# Bastion EC2 ID - Session Manager 접속 시 필요
output "bastion_instance_id" {
  description = "Bastion EC2 instance ID. Use for Session Manager port forwarding."
  value       = aws_instance.bastion.id
}

# 퍼블릭 IP (직접 접속에는 안 쓰지만 확인용)
output "bastion_public_ip" {
  description = "Bastion public IP (for reference only - SSH not enabled)."
  value       = aws_instance.bastion.public_ip
}
