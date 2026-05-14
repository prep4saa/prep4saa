# Claude 세션 컨텍스트 — AWS SAA-C03 학습

**기간:** 2026-05-08 ~ 2026-05-10
**목표:** ADB Senior Full-stack Developer 인터뷰 대비 AWS 실습

---

## 📋 진행 현황

### ✅ 완료
- **시나리오 1:** Serverless REST API (Lambda + API Gateway + DynamoDB)
- **시나리오 2:** 이벤트 드리븐 (SQS + DLQ + SNS + Lambda)
- **시나리오 3 일부:**
  - VPC 3-tier (Public/Private App/Private Data) — Terraform
  - Security Groups — Terraform
  - RDS PostgreSQL + Secrets Manager — Terraform
  - ElastiCache Redis — Terraform
  - Bastion EC2 + Session Manager — Terraform
  - DBeaver 연결 (localhost:5432 포트 포워딩)
  - DB 초기화 Lambda (init/seed/query/list/sql 액션)
  - DB-init Lambda Terraform 모듈 작성 (배포 직전)

### 🔧 진행 중
- **Step 7:** Redis 캐싱 로직 + Cache Invalidation
  - Lambda Terraform 모듈은 완성 (`infra/lambda-db-init/`)
  - 배포 (terraform apply) 대기 중
  - Redis 코드 추가 필요 (ioredis)

### 🔜 남은 작업
- Step 7-2: index.js에 Redis 연결 + 캐싱 로직
- Step 7-3: terraform apply로 배포
- Step 7-4: 캐시 hit/miss 성능 비교
- 시나리오 1, 2 Terraform 리팩터링 (어제 약속)
- teardown.sh 작성

---

## 🏗️ 만든 인프라 (현재 운영 중)

```
VPC: vpc-0ec57bad1fc6caa15 (10.0.0.0/16)
├── Public Subnet × 2
│   └── Bastion EC2 (i-0e1b25519e625d96b, 3.238.91.142)
├── Private App Subnet × 2
│   └── (Lambda saa-db-init - Terraform 배포 직전)
└── Private Data Subnet × 2
    ├── RDS: saa-quiz-db.ckdq8oyw05u2.us-east-1.rds.amazonaws.com:5432
    └── ElastiCache: saa-quiz-cache.bowstg.0001.use1.cache.amazonaws.com:6379

추가:
- Secrets Manager: saa-quiz-db-credentials
- DynamoDB: user-daily-count
- API Gateway: trade-api (id: to0up7hmjh)
- Lambda: trade-api-daily-count, problem-notify
- SQS: problem-generation-queue + DLQ
- SNS: problem-generation-alert
```

**AWS Account:** 973294444983
**Region:** us-east-1
**IAM User:** imjaichoi

---

## 🔑 주요 결정사항

1. **IAM Group 분리** (10개 정책 한도 우회)
   - `saa-developers`: AWS 관리형 정책 + 기본 커스텀 정책
   - `saa-developers-extra`: SSM, EC2, SecretsManager 등

2. **Secrets Manager 환경변수 주입** (VPC Endpoint 비용 회피)
   - 배포 시점에 CLI로 자격증명 조회 → Lambda 환경변수에 주입
   - Terraform에서는 `data.aws_secretsmanager_secret_version`으로 자동화

3. **Bastion + Session Manager** (SSH 키 관리 불필요)
   - SSH 22번 포트 닫힘
   - IAM 인증으로 접근

4. **NAT Gateway 안 만듦** (비용 절약)
   - S3, DynamoDB는 Gateway VPC Endpoint (무료)
   - SSM은 EC2가 Public Subnet이라 IGW 통해 도달

5. **Redis 캐시 전략: Cache Invalidation (B 옵션)**
   - 30분 TTL
   - 데이터 변경 시 캐시 즉시 삭제

6. **Terraform 표준화 점진적 적용**
   - 시나리오 3는 처음부터 Terraform
   - 시나리오 1, 2는 CLI로 만든 후 나중에 리팩터링 약속

---

## 🛠️ 트러블슈팅 기록

| 문제 | 해결 |
|---|---|
| IAM 정책 10개 한도 | IAM Group 분리 |
| Secrets Manager VPC Lambda 타임아웃 | 환경변수 주입 |
| Git Bash JSON 따옴표 | Base64 인코딩 |
| Node.js 20 미지원 | nodejs22.x 사용 |
| SSM Agent 미등록 | user_data + IMDSv2 hop_limit 2 |
| EC2 권한 부족 | AmazonEC2FullAccess 추가 |
| RDS Query Editor 사용 불가 | Aurora Serverless 전용, 일반 RDS는 불가 |

---

## 📁 주요 파일

### Terraform 모듈
- `infra/vpc/` — VPC + Subnets + Routing + Security Groups
- `infra/rds/` — RDS PostgreSQL + Secrets Manager
- `infra/elasticache/` — Redis Cluster
- `infra/bastion/` — Bastion EC2 + IAM Role
- `infra/lambda-db-init/` — DB 초기화 Lambda (방금 작성)

### Lambda 코드
- `trade-api/index.js` — 시나리오 1 (DynamoDB 일일 제한)
- `trade-api/notify/index.js` — 시나리오 2 (SNS 알림)
- `trade-api/db-init/index.js` — 시나리오 3 (RDS 초기화)

### 정책/설정
- `trade-api/trust-policy.json` — Lambda 신뢰 정책
- `trade-api/sqs-sns-policy.json` — 최소 권한 정책
- `trade-api/budget.json` — $5 예산 알림
- `trade-api/schema.sql` — quiz_results 테이블 정의

### 문서
- `AWS-실습-가이드.html` — 전체 실습 가이드 (PDF 변환용)
- `CLAUDE.md` — 프로젝트 가이드
- `SESSION-CONTEXT.md` — 이 파일

---

## 🎯 다른 AI/세션에서 이어가려면

### 1. 이 zip 파일 풀기
```bash
cd <원하는 위치>
unzip session-context.zip
```

### 2. 새 AI에게 컨텍스트 전달
```
"이 프로젝트는 AWS SAA-C03 학습 + ADB 인터뷰 준비용입니다.
SESSION-CONTEXT.md를 먼저 읽고 다음 작업을 이어주세요:
1. infra/lambda-db-init/ 모듈 terraform apply
2. Redis 캐싱 로직 코드 추가
3. ..."
```

### 3. 진행 명령어 (이 세션 멈춘 곳)
```bash
cd infra/lambda-db-init
terraform init
terraform plan
terraform apply
```

---

## 💰 비용 관리

### 멈추기 (단기)
```bash
aws ec2 stop-instances --instance-ids <BASTION_ID> --region us-east-1
aws rds stop-db-instance --db-instance-identifier saa-quiz-db --region us-east-1
```

### 다시 켜기
```bash
aws ec2 start-instances --instance-ids <BASTION_ID> --region us-east-1
aws rds start-db-instance --db-instance-identifier saa-quiz-db --region us-east-1
```

### 완전 정리
```bash
cd infra/lambda-db-init && terraform destroy -auto-approve
cd ../elasticache && terraform destroy -auto-approve
cd ../rds && terraform destroy -auto-approve
cd ../bastion && terraform destroy -auto-approve
cd ../vpc && terraform destroy -auto-approve
```

---

## 🎤 인터뷰 답변 핵심

**전체 시스템:**
> "I designed a 3-tier VPC architecture using Terraform. RDS PostgreSQL and
> ElastiCache Redis sit in private data subnets, isolated from the internet.
> Bastion EC2 with AWS Session Manager provides secure access without exposing
> SSH ports. Lambda functions run inside the VPC with security groups controlled
> by SG IDs. For event-driven error handling, SQS with a DLQ ensures fault
> tolerance, and SNS handles email notifications."

**보안:**
> "I applied least privilege everywhere — custom IAM policies instead of
> FullAccess, SG IDs instead of CIDR ranges, Secrets Manager for credentials,
> and Session Manager instead of SSH."

**비용 최적화:**
> "Used Gateway VPC Endpoints for S3/DynamoDB instead of NAT Gateway saving
> ~$32/month. Evaluated Secrets Manager Interface Endpoint vs environment
> variables — chose env vars for cost while documenting the security tradeoff."
