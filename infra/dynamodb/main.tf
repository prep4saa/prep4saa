# -------------------------------------------------------------------
# DynamoDB 테이블 - 사용자별 일일 사용 횟수
# - PK: userId (사용자 식별)
# - SK: date   (날짜별 이력 + GSI 활용)
# - GSI: date-index → 특정 날짜에 활성 사용자 조회 가능
# - TTL: ttl 속성으로 자정 자동 삭제 (cron job 불필요)
# - 빌링: PAY_PER_REQUEST (호출 만큼만 과금, 학습/저트래픽 적합)
# -------------------------------------------------------------------
resource "aws_dynamodb_table" "user_daily_count" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "userId"
  range_key = "date"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  # GSI: 날짜 기준 전체 사용자 조회 (관리자용 통계)
  global_secondary_index {
    name            = "date-index"
    hash_key        = "date"
    projection_type = "ALL"
  }

  # TTL: 자정 자동 삭제
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name = var.table_name
  }
}
