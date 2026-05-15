output "alb_dns_name" {
  description = "ALB DNS name (Route 53 alias target)"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "https_url" {
  description = "Public HTTPS endpoint served by the ALB"
  value       = "https://${var.domain_name}"
}

output "target_group_arn" {
  description = "Backend target group ARN"
  value       = aws_lb_target_group.backend.arn
}

output "certificate_arn" {
  description = "ACM certificate ARN"
  value       = aws_acm_certificate.main.arn
}
