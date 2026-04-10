import React, { useEffect, useState } from 'react';
import { useLocale } from '../LocaleContext';

type Locale = 'ko' | 'en' | 'ja';

const copy = {
  ko: {
    title: '쿠키 사용 안내',
    body: '서비스 개선과 로그인 유지, 언어 설정 저장을 위해 쿠키와 로컬 스토리지를 사용합니다. 거부를 눌러도 필수 기능은 계속 동작합니다.',
    policy: '쿠키정책',
    reject: '거부',
    accept: '허용',
  },
  en: {
    title: 'Cookie notice',
    body: 'We use cookies and local storage to improve the service, keep you signed in, and remember your language settings. Essential features will still work if you reject.',
    policy: 'Cookie Policy',
    reject: 'Reject',
    accept: 'Accept',
  },
  ja: {
    title: 'クッキー通知',
    body: 'サービス改善、ログイン維持、言語設定の保存のために Cookie と localStorage を使用します。拒否しても必須機能は引き続き動作します。',
    policy: 'クッキーポリシー',
    reject: '拒否',
    accept: '許可',
  },
} satisfies Record<Locale, { title: string; body: string; policy: string; reject: string; accept: string }>;

const CookieConsent: React.FC = () => {
  const { locale } = useLocale();
  const [showCookie, setShowCookie] = useState(false);
  const currentLocale: Locale = locale in copy ? locale : 'en';
  const t = copy[currentLocale];

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowCookie(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowCookie(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowCookie(false);
  };

  if (!showCookie) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(180deg, rgba(10, 16, 30, 0.92), rgba(6, 10, 20, 0.98))',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      zIndex: 999,
      flexWrap: 'wrap'
    }}>
      <p style={{
        color: '#cbd5e1',
        fontSize: '13px',
        margin: '0',
        flex: '1',
        minWidth: '250px',
        lineHeight: '1.5'
      }}>
        <strong style={{ color: '#fff' }}>{t.title}</strong>
        <span style={{ display: 'block', marginTop: '4px' }}>{t.body} {t.policy}.</span>
      </p>

      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={handleReject}
          style={{
            padding: '8px 16px',
            border: '1px solid rgba(148,163,184,0.28)',
            background: 'rgba(255,255,255,0.03)',
            color: '#cbd5e1',
            borderRadius: '999px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.38)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.borderColor = 'rgba(148,163,184,0.28)';
          }}
        >
          {t.reject}
        </button>

        <button
          onClick={handleAccept}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'linear-gradient(180deg, #FFB547, #FF9900)',
            color: '#0F1629',
            borderRadius: '999px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'transform 0.2s, background 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {t.accept}
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
