# Firebase Usage Inventory

**Document ID:** MIG-INV-001
**Author:** imjaichoi
**Date:** 2026-05-10
**Status:** DRAFT

---

## 1. Executive Summary

Firebase Auth와 Firestore가 다음 영역에서 사용 중:

| 영역 | 파일 수 | 영향도 |
|---|---|---|
| 인증 (Auth) | 2 | 🔴 Critical |
| 사용자 프로필 데이터 | 1 (server.js) | 🔴 Critical |
| 퀴즈 결과 저장/조회 | 1 (server.js) | 🟡 High |
| 일일 통계 | 1 (server.js) | 🟡 High |
| 결제 상태 | 1 (server.js) | 🔴 Critical |
| Google 소셜 로그인 | 1 (firebase.ts) | 🟡 High |

---

## 2. Firebase Auth 사용처

### 2.1 클라이언트 (src/firebase.ts)

| 함수 | Line | Cognito 매핑 |
|---|---|---|
| `signUp(email, password, displayName)` | 133 | `cognitoIdentityProvider.signUp()` |
| `signIn(email, password)` | 198 | `cognitoIdentityProvider.initiateAuth()` |
| `signOut()` | 231 | `cognitoIdentityProvider.globalSignOut()` |
| `onAuthStateChange(callback)` | 285 | `Hub.listen('auth')` (Amplify) |
| `sendEmailVerification(user)` | 163 | Cognito 자동 (USER_POOL setting) |
| `signInWithGoogle()` | 292 | Cognito Identity Provider (Google) |
| `linkEmailPasswordToCurrentUser` | 340 | Cognito 자동 처리 |
| `getCurrentUser()` | 242 | `cognitoIdentityProvider.getUser()` |

### 2.2 서버 (server.js)

| 사용 | Line | Cognito 매핑 |
|---|---|---|
| `admin.auth().generateEmailVerificationLink(email)` | 1140 | Cognito가 자동 발송 |
| `admin.auth().getUserByEmail(email)` | 1373, 1418, 1458 | `AdminGetUser` (Cognito Admin API) |
| Firebase Admin SDK 초기화 | 39 | AWS SDK Cognito 사용 |

### 2.3 컴포넌트 간접 사용

```
src/web-app.tsx           ← onAuthStateChange 호출
src/analytics.ts          ← user identification
src/components/Modals/    ← user 정보 표시
src/components/organisms/Footer.tsx
```

---

## 3. Firestore 데이터 구조 (현재)

### 3.1 컬렉션 트리

```
users/{userId}/                   ← 메인 사용자 문서
  ├── email
  ├── displayName
  ├── examStartDate                ← 시험 D-day
  ├── isPremium / paidStatus
  ├── premiumUntil
  ├── streak                       ← 학습 streak
  ├── createdAt
  │
  ├── quizResults/{resultId}/      ← 서브컬렉션: 풀이 결과
  │   ├── sessionId
  │   ├── timestamp
  │   ├── date
  │   ├── difficulty
  │   ├── fullProblem (JSON)
  │   ├── userAnswer
  │   ├── isCorrect
  │   ├── timeSpent
  │   └── expiresAt                ← 24h TTL
  │
  └── dailyStats/{date}/           ← 서브컬렉션: 일일 통계
      ├── date
      ├── problemCount
      ├── createdAt
      └── lastGeneratedAt
```

### 3.2 PostgreSQL 매핑

```sql
-- 메인 users 테이블
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  cognito_sub     VARCHAR(255) UNIQUE NOT NULL,  -- Cognito User ID
  email           VARCHAR(255) UNIQUE NOT NULL,
  display_name    VARCHAR(255),
  exam_start_date DATE,
  is_premium      BOOLEAN DEFAULT FALSE,
  premium_until   TIMESTAMP,
  streak          INT DEFAULT 0,
  role            VARCHAR(20) DEFAULT 'user',     -- user | admin
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  last_login_at   TIMESTAMP
);

-- quiz_results (Firestore 서브컬렉션 → 별도 테이블)
CREATE TABLE quiz_results (
  id                 SERIAL PRIMARY KEY,
  user_id            INT REFERENCES users(id) ON DELETE CASCADE,
  session_id         VARCHAR(255),
  question_id        VARCHAR(255),
  difficulty         VARCHAR(20),
  full_problem       JSONB,
  user_answer        TEXT,
  is_correct         BOOLEAN,
  time_spent_seconds INT,
  created_at         TIMESTAMP DEFAULT NOW(),
  expires_at         TIMESTAMP                    -- TTL 처리용
);

CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_created ON quiz_results(user_id, created_at DESC);
CREATE INDEX idx_quiz_results_expires ON quiz_results(expires_at) WHERE expires_at IS NOT NULL;

-- daily_stats (날짜별 카운터)
CREATE TABLE daily_stats (
  user_id           INT REFERENCES users(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  problem_count     INT DEFAULT 0,
  last_generated_at TIMESTAMP,
  PRIMARY KEY (user_id, date)
);

CREATE INDEX idx_daily_stats_date ON daily_stats(date);
```

---

## 4. 영향받는 API 엔드포인트

| Endpoint | Line | 작업 |
|---|---|---|
| `POST /api/checkAdmin` | 541 | DB 조회로 변경 (role 컬럼) |
| `POST /api/admin/stats` | 587 | Firestore → PostgreSQL 집계 |
| `POST /api/admin/users` | 605 | Firestore → PostgreSQL 조회 |
| `POST /api/admin/user/sessions` | 621 | Firestore → PostgreSQL JOIN |
| `POST /api/recordProblemGeneration` | 671 | (이미 일부 DynamoDB 사용 중) |
| `POST /api/getProblemCountToday` | 723 | (이미 DynamoDB API Gateway 사용) |
| `POST /api/getUserProblemSessions` | 754 | Firestore → PostgreSQL |
| `POST /api/getQuizStats` | 854 | Firestore → PostgreSQL |
| `POST /api/recordQuizResult` | 930 | Firestore → PostgreSQL |
| `POST /api/send-verification-email` | 1126 | Cognito 자동 발송으로 대체 |
| `POST /api/lemonsqueezy/checkout` | 1082 | users 테이블 업데이트 |
| `POST /api/lemonsqueezy/cancel-subscription` | 1210 | users 테이블 업데이트 |
| `POST /api/webhooks/lemon-squeezy` | 1325 | users 테이블 업데이트 |

---

## 5. Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | 비번 해시 알고리즘 차이 (Firebase vs Cognito) | High | High | User Migration Lambda Trigger |
| R-02 | 마이그레이션 중 사용자 로그인 실패 | Medium | High | Dual-auth (병행 운영) |
| R-03 | Firestore TTL → PostgreSQL TTL 변환 누락 | Medium | Medium | Cron job 또는 expires_at 인덱스 활용 |
| R-04 | 결제 상태 동기화 실패 → 무료 사용자가 프리미엄 누림 | Low | Critical | 마이그레이션 후 webhook replay |
| R-05 | Google 소셜 로그인 사용자 매핑 실패 | Medium | High | Cognito Federated Identity로 사전 테스트 |
| R-06 | 데이터 손실 | Low | Critical | Firestore export to S3 (백업) 후 진행 |
| R-07 | Cognito User Pool 한도 초과 | Low | Medium | 사전 한도 확인 + 증액 요청 |
| R-08 | 마이그레이션 기간 운영자(admin) 계정 일시 락 | Medium | High | admin 계정 우선 마이그레이션 + 검증 |

---

## 6. 마이그레이션 패턴: User Migration Lambda Trigger

```
사용자가 Cognito 로그인 시도 (이미 Firebase 가입자)
       ↓
Cognito: "이 사용자 모르는데"
       ↓ User Migration Trigger
Lambda 실행
       ↓ Firebase Admin SDK
       ├── 1) Firebase에서 비번 검증
       ├── 2) 성공 시 Cognito 사용자 자동 생성
       ├── 3) 같은 비번으로 가입 (USER_PASSWORD_AUTH)
       └── 4) PostgreSQL users 테이블에 INSERT
       ↓
Cognito: 로그인 성공
       ↓
JWT 토큰 발급
```

**장점:**
- 사용자가 비번 재설정 안 해도 됨
- 활성 사용자 자동 마이그레이션
- 비활성 사용자는 Phase 6에서 일괄 삭제

---

## 7. Out of Scope (이번 마이그레이션 제외)

- Firebase Storage (PDF 업로드) → Phase 7로 분리 (S3 마이그레이션)
- Firebase Analytics → 별도 RFC (CloudWatch + 자체 로깅)
- Firebase Cloud Messaging (FCM) → 사용 안 함
