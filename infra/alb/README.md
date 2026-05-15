# ALB module — design only

Application Load Balancer fronting the Express backend EC2 instance.
Multi-AZ, HTTP→HTTPS redirect, ACM cert, target-group health checks.

> **Not applied.** This module exists as IaC documentation of the
> intended design. Apply it only for a demo, then `terraform destroy`.

## Why not always-on

An ALB bills **~$17/month** with no stop state — you destroy it or pay
for it. For a near-zero-traffic portfolio app the multi-AZ / health-check
benefits don't justify the fixed cost. Keeping it as code (and destroyed)
proves the design without the bill.

## What it builds

| Resource | Purpose |
|---|---|
| `aws_lb` | Public ALB across the public subnets (multi-AZ) |
| `aws_security_group` | ALB SG — inbound 80/443 from internet |
| `aws_security_group_rule` | Lets the ALB SG reach the backend app port |
| `aws_acm_certificate` (+ validation) | TLS cert for `api.prep4saa.com`, DNS-validated |
| `aws_lb_target_group` (+ attachment) | Backend EC2 on port 5000, health-checked |
| `aws_lb_listener` ×2 | 80 → 301 redirect to 443; 443 → forward |
| `aws_route53_record` | `api.prep4saa.com` A-alias → ALB |

## Trade-off vs the current Caddy setup

Today `api.prep4saa.com` is served by Caddy on the EC2 instance
(Let's Encrypt). This module would move TLS termination + DNS to the ALB:

- ALB replaces Caddy as the public HTTPS entry point
- ACM replaces Let's Encrypt (auto-renew, no in-instance cert)
- adds health checks + a path to multi-instance / Auto Scaling later

If applied, Caddy on the instance becomes redundant (ALB talks plain
HTTP to port 5000).

## Prerequisites before applying

1. Add a `GET /health` route to `server.js` returning `200` — the target
   group health check pings `var.health_check_path` (default `/health`).
   Without it, set `health_check_path` to a real 200 route.
2. Route 53 hosted zone for `prep4saa.com` must be reachable by the
   credentials running Terraform (needs `route53:*` on that zone).

## Demo workflow

```bash
cd infra/alb
terraform init
terraform plan
terraform apply        # ~$17/month starts here
# ... demo, screenshots ...
terraform destroy      # cost stops
```

## Outputs

`alb_dns_name`, `https_url`, `target_group_arn`, `certificate_arn`.
