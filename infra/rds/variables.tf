variable "aws_region" {
    description = "deployment of region"
    default = "us-east-1"
    type = string
  
}

variable "vpc_name" {
    description = "Name of VPC Made by VPC module"
    default = "saa-app-vpc"
    type = string
  
}

variable "db_identifier" {
    description = "RDS Instance Identifier"
    default = "saa-quiz-db"
    type = string
  
}

variable "db_name" {
    description = "Name of Database"
    default = "quizdb"
    type = string
  
}

variable "db_username" {
    description = "Name of Database User"
    default = "postgres"
    type = string
  
}

variable "db_instance_class" {
    description = "Database Instance Class"
    default = "db.t3.micro"
    type = string
  
}


variable "db_allocated_storage" {
    description = "GigaByte of Storage"
    default = "20"
    type = number
  
}