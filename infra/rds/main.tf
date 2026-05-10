
data "aws_vpc" "main" {
    filter {
      name = "tag:Name"
      values = [var.vpc_name]
    }
}

data "aws_subnets" "private_data" {
    filter {
        name = "vpc-id"
        values = [data.aws_vpc.main.id]

    }
    filter {
        name = "tag:Tier"
        values = ["private-data"]
    }
}

data "aws_security_group" "rds"{
    filter {
        name = "tag:Name"
        values = ["${var.vpc_name}-rds-sg"]
    }
}

resource "random_password" "db_password" {
    length = 16
    special = true
    override_special = "!#$%&*()-_=+[]{}<>:?"
  
}
resource "aws_secretsmanager_secret" "db" {
    name = "${var.db_identifier}-credentials"
    description = "RDS PostgreSQL credentials for ${var.db_identifier}"
    recovery_window_in_days = 0

    tags = {
        Name = "${var.db_identifier}-credentials"
    }

}

resource "aws_secretsmanager_secret_version" "db" {
    secret_id = aws_secretsmanager_secret.db.id

    secret_string =  jsonencode({
        username = var.db_username
        password = random_password.db_password.result
        engine = "postgres"
        host = aws_db_instance.main.address
        port = aws_db_instance.main.port
        dbname = var.db_name
    })

}

resource "aws_db_subnet_group" "main" {
  name = "${var.db_identifier}-subnet-group"
  subnet_ids = data.aws_subnets.private_data.ids 

  tags = {
    Name = "${var.db_identifier}-subnet-group"
  }
}

resource "aws_db_instance" "main" {
    identifier = var.db_identifier
    engine = "postgres"
    engine_version = "16.3"
    instance_class = var.db_instance_class

    allocated_storage = var.db_allocated_storage
    storage_type = "gp3"
    storage_encrypted = true

    db_name = var.db_name
    username = var.db_username
    password = random_password.db_password.result


    vpc_security_group_ids = [data.aws_security_group.rds.id]
    db_subnet_group_name = aws_db_subnet_group.main.name
    publicly_accessible = false
    multi_az = false

    backup_retention_period = 0
    skip_final_snapshot =  true
    deletion_protection = false

    tags ={
        Name = var.db_identifier
    }
  
}