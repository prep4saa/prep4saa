output "api_id" {
  description = "REST API ID."
  value       = aws_api_gateway_rest_api.trade_api.id
}

output "invoke_url" {
  description = "Stage invoke URL (use with curl/fetch)."
  value       = aws_api_gateway_stage.main.invoke_url
}

output "endpoint_get" {
  description = "GET /count/{userId} full URL pattern."
  value       = "${aws_api_gateway_stage.main.invoke_url}/count/{userId}"
}

output "endpoint_post" {
  description = "POST /count/{userId} full URL pattern."
  value       = "${aws_api_gateway_stage.main.invoke_url}/count/{userId}"
}
