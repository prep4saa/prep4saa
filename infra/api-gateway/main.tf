# -------------------------------------------------------------------
# 통합할 Lambda 정보 조회
# -------------------------------------------------------------------
data "aws_lambda_function" "trade_api" {
  function_name = var.lambda_function_name
}

# 현재 AWS 계정 ID 자동 조회 (ARN 구성에 사용)
data "aws_caller_identity" "current" {}

# -------------------------------------------------------------------
# REST API 본체
# -------------------------------------------------------------------
resource "aws_api_gateway_rest_api" "trade_api" {
  name        = var.api_name
  description = "Daily count API for SAA-C03 quiz app"

  endpoint_configuration {
    types = ["EDGE"]
  }
}

# -------------------------------------------------------------------
# /count 리소스 (root 아래)
# -------------------------------------------------------------------
resource "aws_api_gateway_resource" "count" {
  rest_api_id = aws_api_gateway_rest_api.trade_api.id
  parent_id   = aws_api_gateway_rest_api.trade_api.root_resource_id
  path_part   = "count"
}

# -------------------------------------------------------------------
# /count/{userId} 동적 리소스
# -------------------------------------------------------------------
resource "aws_api_gateway_resource" "user_id" {
  rest_api_id = aws_api_gateway_rest_api.trade_api.id
  parent_id   = aws_api_gateway_resource.count.id
  path_part   = "{userId}"
}

# -------------------------------------------------------------------
# GET 메서드 + Lambda 통합
# -------------------------------------------------------------------
resource "aws_api_gateway_method" "get_count" {
  rest_api_id   = aws_api_gateway_rest_api.trade_api.id
  resource_id   = aws_api_gateway_resource.user_id.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_count" {
  rest_api_id             = aws_api_gateway_rest_api.trade_api.id
  resource_id             = aws_api_gateway_resource.user_id.id
  http_method             = aws_api_gateway_method.get_count.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = data.aws_lambda_function.trade_api.invoke_arn
}

# -------------------------------------------------------------------
# POST 메서드 + Lambda 통합
# -------------------------------------------------------------------
resource "aws_api_gateway_method" "post_count" {
  rest_api_id   = aws_api_gateway_rest_api.trade_api.id
  resource_id   = aws_api_gateway_resource.user_id.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_count" {
  rest_api_id             = aws_api_gateway_rest_api.trade_api.id
  resource_id             = aws_api_gateway_resource.user_id.id
  http_method             = aws_api_gateway_method.post_count.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = data.aws_lambda_function.trade_api.invoke_arn
}

# -------------------------------------------------------------------
# Lambda 호출 권한 - API Gateway 만 호출 가능
# - source_arn 으로 이 API 의 요청만 허용 (다른 API X)
# -------------------------------------------------------------------
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = data.aws_lambda_function.trade_api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.trade_api.id}/*/*/count/*"
}

# -------------------------------------------------------------------
# Stage 배포
# - triggers: 메서드/통합 변경 시 자동 재배포
# -------------------------------------------------------------------
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.trade_api.id

  triggers = {
    redeploy = sha1(jsonencode([
      aws_api_gateway_resource.count.id,
      aws_api_gateway_resource.user_id.id,
      aws_api_gateway_method.get_count.id,
      aws_api_gateway_method.post_count.id,
      aws_api_gateway_integration.get_count.id,
      aws_api_gateway_integration.post_count.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "main" {
  rest_api_id   = aws_api_gateway_rest_api.trade_api.id
  deployment_id = aws_api_gateway_deployment.main.id
  stage_name    = var.stage_name
}
