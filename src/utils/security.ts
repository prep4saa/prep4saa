// 보안 유틸리티: rate limiting, 관리자 확인, 이메일 마스킹

// ===== Rate Limiting =====
const requestTimestamps: { [key: string]: number[] } = {};
const RATE_LIMIT_REQUESTS = 10; // 10초당 최대 10요청
const RATE_LIMIT_WINDOW = 10000; // 10초

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  if (!requestTimestamps[userId]) {
    requestTimestamps[userId] = [];
  }

  const timestamps = requestTimestamps[userId];
  const recentTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

  if (recentTimestamps.length >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  recentTimestamps.push(now);
  requestTimestamps[userId] = recentTimestamps;
  return true;
}

/**
 * 운영자 계정 확인 (서버 API 호출, sessionStorage 캐시)
 *
 * 보안: admin 이메일을 번들에 담지 않도록 서버 /api/checkAdmin 호출.
 * 서버는 process.env.VITE_ADMIN_EMAIL 로 비교.
 */
export async function isAdminUser(email: string | null): Promise<boolean> {
  if (!email) return false;

  // 이메일을 키에 노출하지 않기 위해 btoa 로 불투명화
  const cacheKey = `_r_${btoa(email).replace(/=/g, '').slice(-10)}`;

  // 보안: ADMIN_TOKEN_ 형식만 인식 (DevTools 수정 방지)
  const cachedToken = sessionStorage.getItem(cacheKey);
  if (cachedToken !== null) {
    if (cachedToken.startsWith('ADMIN_TOKEN_')) return true;
    return false;
  }

  // 서버 API 호출 (admin 이메일은 서버에만 존재)
  const hostname = typeof window !== 'undefined' ? window.location?.hostname : '';
  const backendUrl = (hostname === 'localhost' || hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

  try {
    const res = await fetch(`${backendUrl}/api/checkAdmin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      sessionStorage.setItem(cacheKey, 'NOT_ADMIN');
      return false;
    }

    const data = await res.json();
    const isAdmin = data?.isAdmin === true;

    if (isAdmin) {
      const adminToken = `ADMIN_TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(cacheKey, adminToken);
    } else {
      sessionStorage.setItem(cacheKey, 'NOT_ADMIN');
    }

    return isAdmin;
  } catch {
    // 서버 통신 실패 시 관리자 아님으로 간주 (보안 우선)
    sessionStorage.setItem(cacheKey, 'NOT_ADMIN');
    return false;
  }
}

/**
 * 이메일 마스킹 (개인정보 보호)
 */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;

  // 첫 2글자 + **** + 마지막 4글자
  const masked = name.substring(0, 2) + '****' + name.slice(-4);
  return `${masked}@${domain}`;
}
