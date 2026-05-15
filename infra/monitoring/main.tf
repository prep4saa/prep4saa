# ===================================================================
# CloudWatch 알람 — RDS / 백엔드 EC2 / Beanstalk 환경 / 월 비용
#
# 모든 알람은 하나의 SNS 토픽 → 이메일로 알림.
# 알람 발생(ALARM) 시와 정상 복귀(OK) 시 모두 통지.
# ===================================================================

# -------------------------------------------------------------------
# 알림 채널: SNS 토픽 + 이메일 구독
# (apply 후 확인 메일이 오며, 메일의 링크를 눌러야 구독이 활성화됨)
# -------------------------------------------------------------------
resource "aws_sns_topic" "alarms" {
  name = "saa-infra-alarms"

  tags = {
    Name = "saa-infra-alarms"
  }
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# -------------------------------------------------------------------
# 백엔드 EC2(server.js) 인스턴스 조회 (태그 기반)
# -------------------------------------------------------------------
data "aws_instance" "backend" {
  filter {
    name   = "tag:Name"
    values = [var.ec2_name_tag]
  }
  filter {
    name   = "instance-state-name"
    values = ["running"]
  }
}

# -------------------------------------------------------------------
# RDS 알람 (saa-quiz-db)
# -------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "rds-${var.rds_instance_id}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = var.rds_cpu_threshold
  alarm_description   = "RDS ${var.rds_instance_id} CPU 사용률이 ${var.rds_cpu_threshold}% 를 초과"
  dimensions          = { DBInstanceIdentifier = var.rds_instance_id }
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  tags                = { Name = "rds-${var.rds_instance_id}-high-cpu" }
}

resource "aws_cloudwatch_metric_alarm" "rds_storage" {
  alarm_name          = "rds-${var.rds_instance_id}-low-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = var.rds_free_storage_bytes
  alarm_description   = "RDS ${var.rds_instance_id} 여유 스토리지 부족"
  dimensions          = { DBInstanceIdentifier = var.rds_instance_id }
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  tags                = { Name = "rds-${var.rds_instance_id}-low-storage" }
}

resource "aws_cloudwatch_metric_alarm" "rds_connections" {
  alarm_name          = "rds-${var.rds_instance_id}-high-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = var.rds_connections_threshold
  alarm_description   = "RDS ${var.rds_instance_id} 동시 커넥션 수가 ${var.rds_connections_threshold} 초과"
  dimensions          = { DBInstanceIdentifier = var.rds_instance_id }
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  tags                = { Name = "rds-${var.rds_instance_id}-high-connections" }
}

# -------------------------------------------------------------------
# 백엔드 EC2 알람 (server.js)
# -------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "ec2_cpu" {
  alarm_name          = "ec2-${var.ec2_name_tag}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = var.ec2_cpu_threshold
  alarm_description   = "백엔드 EC2(${var.ec2_name_tag}) CPU 사용률이 ${var.ec2_cpu_threshold}% 초과"
  dimensions          = { InstanceId = data.aws_instance.backend.id }
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  tags                = { Name = "ec2-${var.ec2_name_tag}-high-cpu" }
}

resource "aws_cloudwatch_metric_alarm" "ec2_status" {
  alarm_name          = "ec2-${var.ec2_name_tag}-status-check-failed"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "백엔드 EC2(${var.ec2_name_tag}) 상태 체크 실패"
  dimensions          = { InstanceId = data.aws_instance.backend.id }
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  tags                = { Name = "ec2-${var.ec2_name_tag}-status-check-failed" }
}

# -------------------------------------------------------------------
# Beanstalk 환경 헬스 알람
# EnvironmentHealth 값: 0=OK, 1=Info, 5=Warning, 10=Degraded, 15=Severe,
#                       20=Unknown, 25=Suspended  → 10 이상이면 문제
# -------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "beanstalk_health" {
  alarm_name          = "beanstalk-${var.beanstalk_env_name}-unhealthy"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "EnvironmentHealth"
  namespace           = "AWS/ElasticBeanstalk"
  period              = 60
  statistic           = "Maximum"
  threshold           = 10
  alarm_description   = "Beanstalk 환경 ${var.beanstalk_env_name} 헬스가 Degraded 이상"
  dimensions          = { EnvironmentName = var.beanstalk_env_name }
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  tags                = { Name = "beanstalk-${var.beanstalk_env_name}-unhealthy" }
}

# -------------------------------------------------------------------
# 비용(Billing) 알람
# AWS/Billing 지표는 us-east-1 에만 존재한다.
# 계정 결제 설정에서 "Receive Billing Alerts" 가 켜져 있어야 지표가 채워진다.
# -------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "monthly_cost" {
  alarm_name          = "billing-monthly-estimated-charges"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = 21600 # 6시간
  statistic           = "Maximum"
  threshold           = var.monthly_cost_threshold_usd
  alarm_description   = "월 예상 비용이 $${var.monthly_cost_threshold_usd} 를 초과"
  dimensions          = { Currency = "USD" }
  alarm_actions       = [aws_sns_topic.alarms.arn]
  tags                = { Name = "billing-monthly-estimated-charges" }
}
