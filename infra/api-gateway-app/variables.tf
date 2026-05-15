variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "api_name" {
  description = "REST API name"
  type        = string
  default     = "prep4saa-api"
}

variable "backend_base_url" {
  description = "Origin the API Gateway proxies to (Express on EC2 / Caddy)"
  type        = string
  default     = "https://api.prep4saa.com"
}

variable "stages" {
  description = "Stage names to create (versioning / environment separation)"
  type        = list(string)
  default     = ["dev", "staging", "prod"]
}

variable "throttle_rate_limit" {
  description = "Steady-state requests per second per stage"
  type        = number
  default     = 50
}

variable "throttle_burst_limit" {
  description = "Burst capacity (max concurrent requests) per stage"
  type        = number
  default     = 100
}

variable "enable_caching" {
  description = "Enable API Gateway stage cache. WARNING: fixed hourly cost (~$14+/mo for 0.5GB). Prefer ElastiCache in server.js. Leave false."
  type        = bool
  default     = false
}

variable "cache_size_gb" {
  description = "API Gateway cache cluster size in GB (only if enable_caching = true)"
  type        = string
  default     = "0.5"
}

variable "log_retention_days" {
  description = "CloudWatch retention for API Gateway access logs"
  type        = number
  default     = 14
}

variable "cors_allow_origin" {
  description = "Origin allowed by the CORS preflight response"
  type        = string
  default     = "https://prep4saa.com"
}
