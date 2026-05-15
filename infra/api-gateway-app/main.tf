# ===================================================================
# API Gateway (REST v1) — design-only module
# -------------------------------------------------------------------
# Sits in front of the Express backend as an HTTP proxy and adds:
#   - Throttling   (per-stage rate + burst limits)
#   - CORS         (OPTIONS preflight via MOCK integration)
#   - Logging      (CloudWatch access logs per stage)
#   - Stages       (dev / staging / prod = versioning + env separation)
#   - Caching      (optional — OFF by default, fixed hourly cost)
#
# No Lambda: uses HTTP_PROXY integration so the existing long-running
# Express server is reused as-is.
#
# NOTE: not applied. Applying changes the public API URL — a production
#       cutover. See README.md. Request pricing is ~$0 at low traffic;
#       only enable_caching adds a fixed monthly cost.
# ===================================================================

# -------------------------------------------------------------------
# REST API
# -------------------------------------------------------------------
resource "aws_api_gateway_rest_api" "main" {
  name        = var.api_name
  description = "Public API for prep4saa — HTTP proxy to the Express backend"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# -------------------------------------------------------------------
# {proxy+} catch-all resource — forwards every path to the backend
# -------------------------------------------------------------------
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "{proxy+}"
}

# ANY method on the proxy — every verb passes through
resource "aws_api_gateway_method" "proxy_any" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_integration" "proxy_any" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.proxy.id
  http_method             = aws_api_gateway_method.proxy_any.http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "${var.backend_base_url}/{proxy}"

  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}

# -------------------------------------------------------------------
# CORS preflight — OPTIONS handled by API Gateway (MOCK), no backend hit
# -------------------------------------------------------------------
resource "aws_api_gateway_method" "proxy_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({ statusCode = 200 })
  }
}

resource "aws_api_gateway_method_response" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  status_code = aws_api_gateway_method_response.proxy_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.cors_allow_origin}'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  }
}

# -------------------------------------------------------------------
# CloudWatch role — API Gateway needs this to write logs (account-wide)
# -------------------------------------------------------------------
resource "aws_iam_role" "apigw_cloudwatch" {
  name = "${var.api_name}-cloudwatch-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "apigateway.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "apigw_cloudwatch" {
  role       = aws_iam_role.apigw_cloudwatch.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_api_gateway_account" "main" {
  cloudwatch_role_arn = aws_iam_role.apigw_cloudwatch.arn
}

# -------------------------------------------------------------------
# Deployment — redeployed when the API config changes
# -------------------------------------------------------------------
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeploy = sha1(jsonencode([
      aws_api_gateway_resource.proxy.id,
      aws_api_gateway_method.proxy_any.id,
      aws_api_gateway_integration.proxy_any.id,
      aws_api_gateway_method.proxy_options.id,
      aws_api_gateway_integration.proxy_options.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# -------------------------------------------------------------------
# Per-stage access log groups
# -------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "stage" {
  for_each = toset(var.stages)

  name              = "/aws/apigateway/${var.api_name}/${each.value}"
  retention_in_days = var.log_retention_days
}

# -------------------------------------------------------------------
# Stages — dev / staging / prod
# Each gets its own cache, throttle, and access logging.
# -------------------------------------------------------------------
resource "aws_api_gateway_stage" "stage" {
  for_each = toset(var.stages)

  rest_api_id   = aws_api_gateway_rest_api.main.id
  deployment_id = aws_api_gateway_deployment.main.id
  stage_name    = each.value

  cache_cluster_enabled = var.enable_caching
  cache_cluster_size    = var.enable_caching ? var.cache_size_gb : null

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.stage[each.value].arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      httpMethod     = "$context.httpMethod"
      path           = "$context.path"
      status         = "$context.status"
      responseLength = "$context.responseLength"
      latencyMs      = "$context.responseLatency"
    })
  }

  depends_on = [aws_api_gateway_account.main]
}

# -------------------------------------------------------------------
# Method settings — throttling (+ optional caching) for all routes
# -------------------------------------------------------------------
resource "aws_api_gateway_method_settings" "stage" {
  for_each = toset(var.stages)

  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_stage.stage[each.value].stage_name
  method_path = "*/*" # all methods, all resources

  settings {
    throttling_rate_limit  = var.throttle_rate_limit
    throttling_burst_limit = var.throttle_burst_limit
    metrics_enabled        = true
    logging_level          = "INFO"

    caching_enabled      = var.enable_caching
    cache_ttl_in_seconds = var.enable_caching ? 300 : 0
  }
}
