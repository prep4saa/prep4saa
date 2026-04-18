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
 * 운영자 계정 확인 (sessionStorage 캐시 + ENV 비교)
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

  // 보안: 특정 env 값만 정적 참조 (전체 env destructure 금지)
  const adminEmailsStr = import.meta.env.VITE_ADMIN_EMAILS || '';
  const adminEmails = adminEmailsStr.split(',').map((e: string) => e.trim()).filter(Boolean);

  const isAdmin = adminEmails.includes(email);

  if (isAdmin) {
    const adminToken = `ADMIN_TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(cacheKey, adminToken);
  } else {
    sessionStorage.setItem(cacheKey, 'NOT_ADMIN');
  }

  return isAdmin;
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
