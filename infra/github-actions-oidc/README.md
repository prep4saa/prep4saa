# GitHub Actions OIDC for Frontend Deploy

This Terraform stack prepares the AWS side of `.github/workflows/deploy.yml`.

It creates:

- IAM OIDC provider for `https://token.actions.githubusercontent.com`
- One GitHub Actions deploy IAM role per environment
- Least-privilege S3 and CloudFront deploy policy
- Rollback backup bucket named `<S3_BUCKET>-backups`
- Optional GitHub Environment Variables for `deploy.yml`

It intentionally does not create or replace the production website bucket or CloudFront distribution. Those already exist and can be imported or managed in a later Terraform stack.

If your AWS account already has the GitHub Actions OIDC provider, set `existing_github_oidc_provider_arn` in `terraform.tfvars` to reuse it.

## Required GitHub Variables

`deploy.yml` expects these variables per GitHub Environment:

- `AWS_ROLE_ARN`
- `AWS_REGION`
- `S3_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `SITE_URL`

Set `manage_github_environment_variables = true` if you want Terraform to write them automatically. Otherwise, use the Terraform output `github_environment_variables` and paste the values into:

`GitHub repository -> Settings -> Environments -> production -> Variables`

## Usage

```bash
cd infra/github-actions-oidc
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

If `manage_github_environment_variables = true`, export a GitHub token before `terraform plan`:

```bash
export GITHUB_TOKEN="..."
```

On PowerShell:

```powershell
$env:GITHUB_TOKEN = "..."
```

## AWS Credentials For Terraform

Run Terraform with an AWS identity that can manage IAM, S3, and optionally read the current AWS account ID.

For example:

```bash
aws sts get-caller-identity
terraform plan
```

## Trust Boundary

Each deploy role only trusts tokens from:

- repository: `github_owner/github_repository`
- branch: the configured environment branch
- GitHub environment: the map key, such as `production`

That means the production role is intended for the `production` GitHub Environment and `main` branch.
#