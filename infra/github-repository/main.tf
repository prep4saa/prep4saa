locals {
  protected_branches = toset(["main", "staging"])
  environment_reviewers = {
    production = var.production_environment_reviewers
    staging    = var.staging_environment_reviewers
  }
  environment_wait_timers = {
    production = var.production_wait_timer_minutes
    staging    = var.staging_wait_timer_minutes
  }
  environment_reviewer_teams = {
    production = var.production_environment_reviewer_teams
    staging    = var.staging_environment_reviewer_teams
  }
}

data "github_user" "environment_reviewer" {
  for_each = toset(flatten([
    for reviewers in values(local.environment_reviewers) : tolist(reviewers)
  ]))

  username = each.value
}

data "github_team" "environment_reviewer" {
  for_each = toset(flatten([
    for teams in values(local.environment_reviewer_teams) : tolist(teams)
  ]))

  slug = each.value
}



resource "github_branch_protection" "protected" {
  for_each = local.protected_branches

  repository_id                   = var.github_repository
  pattern                         = each.value
  enforce_admins                  = true
  allows_deletions                = false
  allows_force_pushes             = false
  require_conversation_resolution = true
  required_linear_history         = true
  require_signed_commits          = true

  required_status_checks {
    strict   = true
    contexts = var.required_status_check_contexts
  }

  required_pull_request_reviews {
    dismiss_stale_reviews      = true
    require_code_owner_reviews = true
    require_last_push_approval = true

    required_approving_review_count = var.required_approving_review_count

    pull_request_bypassers = [
      for team_slug in var.merge_bypass_teams :
      "${var.github_owner}/${team_slug}"
    ]
  }

}

resource "github_repository_environment" "deploy" {
  for_each = local.environment_reviewers

  repository          = var.github_repository
  environment         = each.key
  prevent_self_review = true
  wait_timer          = local.environment_wait_timers[each.key]

  deployment_branch_policy {
    protected_branches     = true
    custom_branch_policies = false
  }

  dynamic "reviewers" {
    for_each = length(each.value) + length(local.environment_reviewer_teams[each.key]) > 0 ? [1] : []

    content {
      users = [
        for username in each.value :
        data.github_user.environment_reviewer[username].id
      ]
      teams = [
        for team_slug in local.environment_reviewer_teams[each.key] :
        data.github_team.environment_reviewer[team_slug].id
      ]
    }
  }
}

resource "github_repository_collaborator" "collaborator" {
  for_each = var.repository_collaborators

  repository = var.github_repository
  username   = each.key
  permission = each.value
}
