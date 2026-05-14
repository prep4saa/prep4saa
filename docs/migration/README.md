# Firebase → AWS Migration Documents

이 폴더는 Firebase Auth + Firestore에서 AWS Cognito + RDS PostgreSQL로의 마이그레이션 문서를 담고 있습니다.

## Documents

| Document | Purpose |
|---|---|
| [RFC-001-firebase-to-cognito.md](./RFC-001-firebase-to-cognito.md) | 마이그레이션 RFC (제안서) |
| [inventory.md](./inventory.md) | Firebase 사용 인벤토리 + Risk Register |

## Status

```
Phase 0: Discovery ✅ (이 문서들)
Phase 1: Infrastructure 🔧
Phase 2: Backend Dual-Auth ⏳
Phase 3: Frontend ⏳
Phase 4: Data Migration ⏳
Phase 5: Cutover ⏳
Phase 6: Cleanup ⏳
```

## How to Read

1. RFC 먼저 읽기 (전체 큰 그림)
2. inventory 로 영향도 파악
3. 각 Phase 시작 전 해당 phase 섹션 다시 읽기
