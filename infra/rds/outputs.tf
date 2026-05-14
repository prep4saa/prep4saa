output "db_endpoint" {
    description = "host:port 한번에"
    value = aws_db_instance.main.endpoint
}

output "db_address" {
    description = "host만"
    value = aws_db_instance.main.address
}

output "db_port" {
    description = "port만"
    value = aws_db_instance.main.port
}

output "db_name" {
    description = "DB 이름"
    value = aws_db_instance.main.db_name
}

output "db_secret_arn" {
    description = "Secrets Manager ARN"
    value = aws_secretsmanager_secret.db.arn
}

output "db_secret_name" {
    description = "Secret 이름"
    value = aws_secretsmanager_secret.db.name
}