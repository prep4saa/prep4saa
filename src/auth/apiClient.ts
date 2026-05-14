// API 호출 헬퍼 (Phase 4-3 사전 작업)
// -----------------------------------------------------------------
// USE_COGNITO_AUTH=true 일 때 모든 API 호출에 자동으로
// Authorization: Bearer <JWT> 헤더 첨부
//
// 사용:
//   import { api } from '@/auth/apiClient';
//   const res = await api.post('/api/getProblemCountToday', { userId });

import { getAccessToken } from "./cognito";

const USE_COGNITO_AUTH = import.meta.env.VITE_USE_COGNITO_AUTH === "true";

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
  const url = `${getBackendUrl()}${path}`;
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
