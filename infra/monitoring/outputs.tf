output "sns_topic_arn" {
  description = "알람 알림 SNS 토픽 ARN"
  value       = aws_sns_topic.alarms.arn
}

output "alarm_names" {
  description = "생성된 CloudWatch 알람 목록"
  value = [
    aws_cloudwatch_metric_alarm.rds_cpu.alarm_name,
    aws_cloudwatch_metric_alarm.rds_storage.alarm_name,
    aws_cloudwatch_metric_alarm.rds_connections.alarm_name,
    aws_cloudwatch_metric_alarm.ec2_cpu.alarm_name,
    aws_cloudwatch_metric_alarm.ec2_status.alarm_name,
    aws_cloudwatch_metric_alarm.beanstalk_health.alarm_name,
    aws_cloudwatch_metric_alarm.monthly_cost.alarm_name,
  ]
}
