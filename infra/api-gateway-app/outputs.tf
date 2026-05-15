output "rest_api_id" {
  description = "REST API ID"
  value       = aws_api_gateway_rest_api.main.id
}

output "stage_invoke_urls" {
  description = "Invoke URL per stage — frontend points VITE_BACKEND_URL here"
  value = {
    for s in var.stages :
    s => aws_api_gateway_stage.stage[s].invoke_url
  }
}

output "access_log_groups" {
  description = "CloudWatch log group per stage"
  value = {
    for s in var.stages :
    s => aws_cloudwatch_log_group.stage[s].name
  }
}
