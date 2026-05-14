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

data "aws_security_group" "redis" {
    filter {
        name = "tag:Name"
        values = ["${var.vpc_name}-redis-sg"]
    }
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.cluster_id}-subnet-group"
  subnet_ids = data.aws_subnets.private_data.ids

  tags = {
    Name = "${var.cluster_id}-subnet-group"
  }
}

resource "aws_elasticache_parameter_group" "main" {
  name   = "${var.cluster_id}-params"
  family = "redis7"

  tags = {
    Name = "${var.cluster_id}-params"
  }
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = var.cluster_id
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.node_type
  num_cache_nodes      = 1
  parameter_group_name = aws_elasticache_parameter_group.main.name
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [data.aws_security_group.redis.id]

  tags = {
    Name = var.cluster_id
  }
}

