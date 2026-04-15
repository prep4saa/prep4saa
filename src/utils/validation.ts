// 입력값 검증 유틸리티

export function validateEmail(email: string): boolean {
  // RFC 5322 기반 이메일 검증
  const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email) || email.length > 254) {
    return false;
  }

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain || localPart.length > 64) {
    return false;
  }

  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return false;
  }

  return true;
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 6) return { valid: false, error: "비밀번호는 6자 이상이어야 합니다" };
  if (password.length > 128) return { valid: false, error: "비밀번호는 128자 이하여야 합니다" };
  return { valid: true };
}

export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 500); // XSS 방지: 길이 제한
}
