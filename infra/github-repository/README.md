# GitHub Repository Policy

This Terraform stack manages repository-level collaboration and release policy.

It owns:

- `main` and `staging` branch protection
- required pull request reviews
- required CODEOWNERS review
- required CI status checks
- deployment approval gates for `production` and `staging`
- optional repository collaborator permissions

It does not deploy application code. Deployment execution safety stays in GitHub Actions workflow files.

## How Merge Permission Works

Terraform does not guess who should merge. You declare the people in variables.

Effective merge permission is the combination of:

- repository permission, such as `push`, `maintain`, or `admin`
- protected branch rules
- required PR approvals
- required CODEOWNERS review
- required status checks
- resolved conversations

For a personal repository, use `repository_collaborators` with GitHub usernames.
For an organization repository, use GitHub teams if you later migrate this stack to team-based permissions.

## Required Token

Set a GitHub token before running Terraform.

```powershell
$env:GITHUB_TOKEN = "github_pat_xxx"
```

The token needs repository administration permission because it manages branch protection, environments, and collaborators.

## Usage

```powershell
cd infra/github-repository
copy terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

If CI job names change in `.github/workflows/ci.yml`, update `required_status_check_contexts`.
