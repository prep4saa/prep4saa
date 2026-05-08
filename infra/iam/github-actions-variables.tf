locals {
  github_actions_deploy_variables = {
    production = {
      AWS_ROLE_ARN               = aws_iam_role.production.arn
      AWS_REGION                 = var.aws_region
      S3_BUCKET                  = var.production_bucket_name
      CLOUDFRONT_DISTRIBUTION_ID = var.production_cloudfront_id
      SITE_URL                   = var.production_site_url
    }

    staging = {
      AWS_ROLE_ARN               = aws_iam_role.staging.arn
      AWS_REGION                 = var.aws_region
      S3_BUCKET                  = var.staging_bucket_name
      CLOUDFRONT_DISTRIBUTION_ID = var.staging_cloudfront_id
      SITE_URL                   = var.staging_site_url
    }
  }

  github_actions_environment_variables = merge([
    for environment_name, variables in local.github_actions_deploy_variables : {
      for variable_name, variable_value in variables :
      "${environment_name}/${variable_name}" => {
        environment_name = environment_name
        variable_name    = variable_name
        value            = variable_value
      }
    }
  ]...)
}

resource "github_actions_environment_variable" "deploy" {
  for_each = var.manage_github_actions_variables ? local.github_actions_environment_variables : {}

  repository    = var.github_repo
  environment   = each.value.environment_name
  variable_name = each.value.variable_name
  value         = each.value.value
}
