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

variable "instance_name" {
  description = "EC2 instance Name tag"
  type        = string
  default     = "saa-backend"
}

variable "instance_type" {
  description = "EC2 instance type (t3.micro: Free Tier eligible for first 12 months)"
  type        = string
  default     = "t3.micro"
}

variable "app_port" {
  description = "Port the Express server listens on"
  type        = number
  default     = 5000
}

variable "allow_ssh_cidr" {
  description = "Set to your IP to allow SSH (leave empty to disable SSH and use Session Manager only)"
  type        = string
  default     = ""
}
