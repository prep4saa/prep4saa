// API 호출 헬퍼 (Phase 4-3 사전 작업)
// -----------------------------------------------------------------
// USE_COGNITO_AUTH=true 일 때 모든 API 호출에 자동으로
// Authorization: Bearer <JWT> 헤더 첨부
//
// 사용:
//   import { api } from '@/auth/apiClient';
//   const res = await api.post('/api/getProblemCountToday', { userId });

import { getAccessToken } from "./cognito";
import { resolveJavaBackendUrl } from "../api";

const USE_COGNITO_AUTH = import.meta.env.VITE_USE_COGNITO_AUTH === "true";

// Strangler Fig: 자바 백엔드로 이전 완료된 엔드포인트 목록.
// 여기 등록된 경로는 자바(VITE_JAVA_BACKEND_URL)로, 나머지는 server.js 로 라우팅된다.
// 도메인을 옮길 때마다 이 집합에 경로를 추가한다.
const MIGRATED_TO_JAVA = new Set<string>([
  // user 슬라이스
  "/api/user/me",
  // quiz 슬라이스
  "/api/recordQuizResult",
  "/api/getQuizStats",
  "/api/getUserProblemSessions",
  // mockexam 슬라이스
  "/api/getPastExamPage",
  "/api/getPastExamTotalCount",
  "/api/getTodayMockExam",
  "/api/saveMockExamProblems",
  "/api/completeMockExam",
  // admin 슬라이스 (JWT + admin role 필요 — apiClient 가 Bearer 토큰 자동 첨부)
  "/api/admin/stats",
  "/api/admin/users",
  "/api/admin/user/sessions",
  "/api/uploadMockToPastExams",
  "/api/uploadPastExams",
  // daily-count 슬라이스 (server.js → 자바 daily_stats PostgreSQL)
  "/api/recordProblemGeneration",
  "/api/getProblemCountToday",
  // pdf-export (서버 사이드 PDF + S3 presigned URL)
  "/api/exportQuizSessionPdf",
  "/api/exportMockExamPdf",
  // shared mock exam (공유 + attempt)
  "/api/getSharedMockExam",
  "/api/saveMockExamAnswers",
  "/api/completeSharedMockExam",
  // payment — LemonSqueezy
  "/api/lemonsqueezy/checkout",
  "/api/lemonsqueezy/cancel-subscription",
  "/api/webhooks/lemon-squeezy",
]);

function getBackendUrl(): string {
  if (typeof window === "undefined") return "http://localhost:5000";
  const hostname = window.location?.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }
  return import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
}

// 통합 fetch wrapper
async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  // Strangler Fig: 이전된 엔드포인트는 자바 백엔드로, 나머지는 server.js 로
  const base = MIGRATED_TO_JAVA.has(path) ? resolveJavaBackendUrl() : getBackendUrl();
  const url = `${base}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Cognito 사용 시 JWT 토큰 자동 첨부
  if (USE_COGNITO_AUTH) {
    const token = await getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return fetch(url, { ...options, headers });
}

export const api = {
  get: (path: string) => apiFetch(path, { method: "GET" }),

  post: (path: string, body: unknown) =>
    apiFetch(path, { method: "POST", body: JSON.stringify(body) }),

  put: (path: string, body: unknown) =>
    apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),

  delete: (path: string) => apiFetch(path, { method: "DELETE" }),
};
