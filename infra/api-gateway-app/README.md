# API Gateway (app) module — design only

REST API (v1) in front of the Express backend as an **HTTP proxy**.
Adds throttling, CORS, CloudWatch logging, and dev/staging/prod stages
without introducing Lambda — the existing long-running server is reused.

> **Not applied.** IaC documentation of the intended design. Applying it
> changes the public API URL (a production cutover) — see below.

## What it builds

| Resource | Feature |
|---|---|
| `aws_api_gateway_rest_api` + `{proxy+}` | Catch-all HTTP_PROXY → `backend_base_url` |
| `aws_api_gateway_method` OPTIONS + MOCK | CORS preflight handled at the edge |
| `aws_api_gateway_method_settings` | Throttling (rate + burst), metrics |
| `aws_api_gateway_stage` ×3 | `dev` / `staging` / `prod` separation |
| `aws_cloudwatch_log_group` ×3 | Per-stage access logs (JSON format) |
| `aws_iam_role` + `aws_api_gateway_account` | API Gateway → CloudWatch logging |

## Feature coverage

| Feature | How |
|---|---|
| Throttling | `throttle_rate_limit` / `throttle_burst_limit` per stage |
| CORS | OPTIONS MOCK integration returns CORS headers (no backend hit) |
| Logging | `access_log_settings` → CloudWatch, JSON structured |
| Stages | one deployment, three stages = versioning + env separation |
| Caching | `enable_caching` var — **OFF by default** (see cost note) |

## Cost

- Request pricing: **$3.50 / million requests** — ~$0 at portfolio traffic.
- **Caching is the trap**: a stage cache cluster bills per hour
  (~$14+/mo for 0.5 GB), like an ALB. `enable_caching` defaults to
  `false` — do response caching in `server.js` with the existing
  ElastiCache instead.

## Why HTTP proxy, not Lambda

The backend is a long-running Express server, not Lambda. `HTTP_PROXY`
integration lets API Gateway forward straight to `api.prep4saa.com`
unchanged — API Gateway adds the edge features, the server keeps the
business logic.

## Cutover plan (when actually applied)

1. `terraform apply` → note `stage_invoke_urls["staging"]`.
2. Point the **staging** frontend `VITE_BACKEND_URL` at the staging
   invoke URL; verify all endpoints.
3. Optionally attach a custom domain (`api.prep4saa.com`) to the prod
   stage so the frontend URL does not change.
4. Switch the prod frontend, then retire the direct Caddy route.

## Demo workflow

```bash
cd infra/api-gateway-app
terraform init
terraform plan
terraform apply     # request pricing only; ~$0 unless enable_caching
terraform destroy
```

## Outputs

`rest_api_id`, `stage_invoke_urls` (per stage), `access_log_groups`.
