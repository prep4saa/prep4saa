variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_name" {
  description = "Tag-name of the existing VPC"
  type        = string
  default     = "saa-app-vpc"
}

variable "name" {
  description = "Name prefix for ALB resources"
  type        = string
  default     = "saa-alb"
}

variable "backend_instance_name" {
  description = "Name tag of the EC2 instance the ALB forwards to"
  type        = string
  default     = "saa-backend"
}

variable "backend_port" {
  description = "Port the Express server listens on"
  type        = number
  default     = 5000
}

variable "domain_name" {
  description = "Domain served by the ALB (HTTPS). Must be in the Route 53 hosted zone."
  type        = string
  default     = "api.prep4saa.com"
}

variable "route53_zone_name" {
  description = "Route 53 hosted zone the domain belongs to"
  type        = string
  default     = "prep4saa.com"
}

variable "health_check_path" {
  description = "HTTP path the ALB pings to decide instance health. Add a GET /health route to server.js for a clean 200."
  type        = string
  default     = "/health"
}
