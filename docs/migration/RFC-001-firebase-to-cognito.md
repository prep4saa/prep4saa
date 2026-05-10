# RFC-001: Firebase Auth → AWS Cognito Migration

**Status:** PROPOSED
**Author:** imjaichoi
**Reviewers:** TBD (Tech Lead, Security, DevOps)
**Created:** 2026-05-10
**Target Completion:** 2026-05-24 (2주)

---

## 1. Background

현재 인증과 사용자 데이터 저장에 Firebase (Auth + Firestore) 를 사용 중. 다음 이유로 AWS Cognito + RDS PostgreSQL 로 마이그레이션:

1. **인프라 통일**: 모든 인프라가 AWS 위에서 동작 (관리 단순화)
2. **컴플라이언스**: 금융권 고객 대응을 위한 데이터 주권 (region 제어)
3. **비용 예측 가능성**: AWS 통합 빌링
4. **고급 인증 기능**: MFA, Custom Auth Flow, Lambda Triggers
5. **PostgreSQL의 트랜잭션/JOIN 활용**

---

## 2. Goals & Non-Goals

### Goals
- [ ] Zero-downtime 마이그레이션 (사용자 영향 최소화)
- [ ] 기존 사용자 100% 보존 (비번 재설정 강요 X)
- [ ] 14일 안에 cutover 완료
- [ ] 모든 API에 JWT 검증 적용 (보안 강화)
- [ ] PostgreSQL ACID 트랜잭션 활용 (결제 등)

### Non-Goals
- Firebase Storage 마이그레이션 (별도 RFC)
- Firebase Analytics 교체 (별도 RFC)
- 신규 인증 기능 추가 (MFA 등)
- UI/UX 변경

---

## 3. Detailed Design

### 3.1 인증 흐름

```
┌─────────────────────────────────────────────────┐
│ 신규 사용자                                       │
│                                                  │
│ 1. 가입 → Cognito SignUp                         │
│ 2. Cognito가 verification email 자동 발송         │
│ 3. 인증 → Cognito ConfirmSignUp                  │
│ 4. PostgreSQL users 테이블 INSERT (PostConfirm  │
│    Lambda Trigger)                              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 기존 Firebase 사용자                              │
│                                                  │
│ 1. Cognito 로그인 시도                           │
│ 2. Cognito: "사용자 없음" → User Migration       │
│    Lambda Trigger                               │
│ 3. Lambda: Firebase Admin SDK 로 비번 검증        │
│ 4. 성공 시 Cognito 사용자 자동 생성              │
│ 5. PostgreSQL users 테이블 INSERT                │
│ 6. JWT 토큰 발급                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 매 API 요청                                      │
│                                                  │
│ 1. 클라이언트: Authorization: Bearer <JWT>       │
│ 2. API Gateway/server.js: Cognito JWT 검증       │
│ 3. JWT payload 에서 cognito_sub 추출             │
│ 4. PostgreSQL users 테이블에서 user_id 조회       │
│ 5. 비즈니스 로직 실행                              │
└─────────────────────────────────────────────────┘
```

### 3.2 Cognito User Pool 구성

```hcl
# Password Policy (대기업 표준)
password_policy {
  minimum_length    = 12
  require_uppercase = true
  require_lowercase = true
  require_numbers   = true
  require_symbols   = true
  temporary_password_validity_days = 1
}

# Email verification 필수
auto_verified_attributes = ["email"]

# Account recovery
account_recovery_setting {
  recovery_mechanism {
    name     = "verified_email"
    priority = 1
  }
}

# Lambda Triggers
lambda_config {
  user_migration   = aws_lambda_function.user_migration.arn
  post_confirmation = aws_lambda_function.post_confirmation.arn
  pre_token_generation = aws_lambda_function.pre_token.arn
}

# Token expiration
access_token_validity  = 1  # 1 hour
id_token_validity      = 1  # 1 hour
refresh_token_validity = 30 # 30 days
```

### 3.3 PostgreSQL Schema

(상세는 inventory.md 참고)

핵심:
- `users.cognito_sub` 가 Cognito User Pool 의 user ID 와 1:1 매핑
- `users.role` 컬럼으로 admin 판단 (환경변수 의존 제거)
- 외래키 ON DELETE CASCADE 로 사용자 삭제 시 관련 데이터 자동 정리

### 3.4 백엔드 Auth Middleware

```javascript
// middleware/auth.js
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID,
});

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const payload = await verifier.verify(token);

    // PostgreSQL 에서 user 조회
    const user = await db.query(
      "SELECT * FROM users WHERE cognito_sub = $1",
      [payload.sub]
    );

    if (!user.rows[0]) {
      return res.status(403).json({ error: "User not found" });
    }

    req.user = user.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

async function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin required" });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
```

---

## 4. Phases

### Phase 1: Infrastructure (Day 1-2)
- [ ] VPC + RDS 재생성 (이미 코드 있음)
- [ ] Cognito User Pool Terraform 모듈
- [ ] User Migration Lambda 작성
- [ ] PostConfirmation Lambda 작성
- [ ] PostgreSQL schema 적용
- [ ] 검증: 빈 Cognito 에서 가입/로그인 가능

### Phase 2: Backend Dual-Auth (Day 3-5)
- [ ] `aws-jwt-verify` 패키지 설치
- [ ] `middleware/auth.js` 작성
- [ ] 기존 API 에 `requireAuth` 적용 (점진적)
- [ ] Firebase Auth 도 그대로 유지 (병행)
- [ ] Feature flag: `USE_COGNITO_AUTH`
- [ ] 검증: 두 인증 모두 동작

### Phase 3: Frontend (Day 6-8)
- [ ] AWS Amplify 또는 amazon-cognito-identity-js 설치
- [ ] `src/auth/cognito.ts` 작성
- [ ] Feature flag 로 분기
- [ ] 회원가입/로그인/로그아웃 UI 연결
- [ ] 검증: 신규 가입자 Cognito 사용

### Phase 4: Data Migration (Day 9-10)
- [ ] Firestore → JSON export
- [ ] Migration script: PostgreSQL INSERT
- [ ] 결제 상태 webhook replay
- [ ] 검증: 데이터 정합성 (행 수, 합계, 샘플 비교)

### Phase 5: Cutover (Day 11-12)
- [ ] Feature flag 단계적 전환:
  - 10% 사용자 → Cognito
  - 50% 사용자 → Cognito
  - 100% 사용자 → Cognito
- [ ] CloudWatch 알람 모니터링
- [ ] 24시간 안정화 관찰

### Phase 6: Cleanup (Day 13-14)
- [ ] Firebase 코드 제거
- [ ] `firebase`, `firebase-admin` npm 패키지 제거
- [ ] Firestore 컬렉션 백업 후 삭제
- [ ] 환경변수 정리
- [ ] 문서 업데이트

---

## 5. Rollback Plan

각 Phase 별 롤백 절차:

### Phase 1-2 롤백
- Terraform destroy (Cognito, Lambda)
- 백엔드 변경 revert

### Phase 3 롤백
- Feature flag = false 로 전환
- Frontend 코드 revert

### Phase 4 롤백 (데이터)
- PostgreSQL TRUNCATE users, quiz_results, daily_stats
- 마이그레이션 스크립트 재실행

### Phase 5 롤백 (Cutover)
- Feature flag 즉시 전환 (10초 안)
- Firebase Auth 로 복귀
- DB 변경 사항 추적 후 후속 동기화

---

## 6. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| 마이그레이션된 사용자 비율 | >95% | Cognito User Count vs Firebase Count |
| 로그인 성공률 | >99.5% | CloudWatch metric |
| API 응답 시간 (P95) | <200ms (변화 없음) | X-Ray |
| 다운타임 | 0초 | Status page |
| 데이터 정합성 | 100% | 자동 검증 스크립트 |
| 결제 상태 일치 | 100% | LemonSqueezy webhook replay |

---

## 7. Open Questions

1. ❓ Google 소셜 로그인 사용자 비율 → Cognito Federated 설정 우선순위 결정
2. ❓ Firebase Storage (PDF) 마이그레이션 일정 (별도 RFC)
3. ❓ Cognito 비용 견적 ($0.0055/MAU, 50K MAU 무료)
4. ❓ MFA 도입 여부 (이번 RFC 에선 옵션만 활성화)

---

## 8. References

- [Cognito User Migration Lambda Trigger](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-migrate-user.html)
- [aws-jwt-verify](https://github.com/awslabs/aws-jwt-verify)
- [AWS Amplify Auth](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)

---

## 9. Approval

- [ ] Author: imjaichoi
- [ ] Tech Lead: TBD
- [ ] Security: TBD
- [ ] DevOps: TBD

---

## Changelog

| Date | Version | Changes |
|---|---|---|
| 2026-05-10 | 0.1 | Initial draft |
