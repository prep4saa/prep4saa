variable "aws_region" {
    description = "aws_region"
    default = "us-east-1"
    type = string
}

variable "vpc_name" {
    default = "saa-app-vpc"
    type = string

}

variable "function_name" {
    default = "saa-db-init"
    type = string
  
}

variable "lambda_role_name" {
    default = "trade-api-lambda-role"
    type = string
}

variable "code_path" {
    default = "../../trade-api/db-init"
    type = string
  
}