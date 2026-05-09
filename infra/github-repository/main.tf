# -------------------------------------------------------------------
# 공통 계산값 (locals)
# - 브랜치 보호 대상 브랜치 목록
# - 환경별 승인자, 대기 시간, 승인 팀
# -------------------------------------------------------------------
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

# -------------------------------------------------------------------
# 환경 승인자(사용자) 조회
# 변수에는 사용자명이 들어오지만, GitHub API는 사용자 ID가 필요하므로
# data source로 ID를 먼저 조회
# -------------------------------------------------------------------
data "github_user" "environment_reviewer" {
  for_each = toset(flatten([
    for reviewers in values(local.environment_reviewers) : tolist(reviewers)
  ]))

  username = each.value
}

# -------------------------------------------------------------------
# 환경 승인자(팀) 조회
# 변수에는 팀 슬러그가 들어오지만, GitHub API는 팀 ID가 필요하므로
# data source로 ID를 먼저 조회
# -------------------------------------------------------------------
data "github_team" "environment_reviewer" {
  for_each = toset(flatten([
    for teams in values(local.environment_reviewer_teams) : tolist(teams)
  ]))

  slug = each.value
}

# -------------------------------------------------------------------
# main / staging 브랜치 보호 규칙
# 강제 푸시·삭제 차단, 서명된 커밋 필수, 선형 이력 강제,
# CI 체크 통과 및 PR 리뷰 필수
# -------------------------------------------------------------------
resource "github_branch_protection" "protected" {
  for_each = local.protected_branches

  repository_id                   = var.github_repository
  pattern                         = each.value
  enforce_admins                  = true   # 관리자도 규칙 적용
  allows_deletions                = false  # 브랜치 삭제 불가
  allows_force_pushes             = false  # 강제 푸시 불가
  require_conversation_resolution = true   # 모든 코드 리뷰 대화 해결 필수
  required_linear_history         = true   # 선형 커밋 이력 강제 (merge commit 금지)
  require_signed_commits          = true   # GPG/SSH 서명된 커밋만 허용

  # strict=true: PR이 항상 베이스 브랜치 최신 커밋 기준으로 테스트되어야 함
  required_status_checks {
    strict   = true
    contexts = var.required_status_check_contexts
  }

  # PR 리뷰 정책
  required_pull_request_reviews {
    dismiss_stale_reviews      = true  # 새 커밋 추가 시 기존 승인 자동 취소
    require_code_owner_reviews = true  # CODEOWNERS 파일 기반 리뷰 필수
    require_last_push_approval = true  # 마지막 푸시 작성자가 아닌 사람의 승인 필요

    required_approving_review_count = var.required_approving_review_count

    # PR 리뷰 없이 머지를 우회할 수 있는 팀 목록
    pull_request_bypassers = [
      for team_slug in var.merge_bypass_teams :
      "${var.github_owner}/${team_slug}"
    ]
  }
}

# -------------------------------------------------------------------
# GitHub 배포 환경 (production / staging)
# 배포 전 승인자 지정, 대기 시간 설정,
# 보호 브랜치에서만 배포 허용
# -------------------------------------------------------------------
resource "github_repository_environment" "deploy" {
  for_each = local.environment_reviewers

  repository          = var.github_repository
  environment         = each.key
  prevent_self_review = true  # 자기 자신이 배포 승인 불가
  wait_timer          = local.environment_wait_timers[each.key]

  # 보호 브랜치(main, staging)에서만 이 환경으로 배포 가능
  deployment_branch_policy {
    protected_branches     = true
    custom_branch_policies = false
  }

  # 승인자(사용자 또는 팀)가 설정된 경우에만 reviewers 블록 생성
  dynamic "reviewers" {
    for_each = length(each.value) + length(local.environment_reviewer_teams[each.key]) > 0 ? [1] : []

    content {
      # 사용자명 → 사용자 ID 변환
      users = [
        for username in each.value :
        data.github_user.environment_reviewer[username].id
      ]

      # 팀 슬러그 → 팀 ID 변환
      teams = [
        for team_slug in local.environment_reviewer_teams[each.key] :
        data.github_team.environment_reviewer[team_slug].id
      ]
    }
  }
}

# -------------------------------------------------------------------
# 리포지터리 협업자 관리
# 특정 사용자에게 read / triage / write / maintain / admin 권한 부여
# -------------------------------------------------------------------
resource "github_repository_collaborator" "collaborator" {
  for_each = var.repository_collaborators

  repository = var.github_repository
  username   = each.key
  permission = each.value
}
