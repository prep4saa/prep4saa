variable "aws_region" {
    description = "aws region"
    default = "us-east-1"
    type = string
}

variable "vpc_name" {
    description = "vpc nmame"
    default = "saa-app-vpc"
    type = string
}

variable "cluster_id" {
    description = "cluster id"
    default = "saa-quiz-cache"
    type = string
}

variable "node_type" {
    description = "node type"
    default = "cache.t4g.micro"
    type = string
}