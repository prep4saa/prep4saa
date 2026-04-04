import React, { useState } from 'react';
import { ko } from '../locales/ko';
import { en } from '../locales/en';
import { ja } from '../locales/ja';

type Locale = 'ko' | 'en' | 'ja';

interface NavigatorProps {
  onTabChange: (tab: "quiz" | "concept" | "status" | "mockExam") => void;
  currentLocale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
  onLoginClick?: () => void;
  showLoginButton?: boolean;
  onLogoClick?: () => void;
}

export default function Navigator({ onTabChange, currentLocale = 'ko', onLocaleChange, onLoginClick, showLoginButton = true, onLogoClick }: NavigatorProps) {
  const [locale, setLocale] = useState<Locale>(currentLocale);

  const locales = { ko, en, ja };
  const t = locales[locale];

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    if (onLocaleChange) {
      onLocaleChange(newLocale);
    }
    localStorage.setItem('landingPageLocale', newLocale);
  };

  const styles = `
    nav{position:fixed;width:100%;z-index:50;background-color:rgba(15,22,41,.9);backdrop-filter:blur(12px);border-bottom:1px solid #2A344A;}
    .nav-inner{max-width:80rem;margin:0 auto;padding:0 1.5rem;height:5rem;display:flex;align-items:center;justify-content:space-between;}
    .nav-logo{display:flex;align-items:center;gap:.5rem;cursor:pointer;transition:opacity 0.2s;}
    .nav-logo:hover{opacity:0.8;}
    .logo-icon{width:2rem;height:2rem;border-radius:.25rem;background:linear-gradient(135deg,#FF9900,#ea580c);display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(255,153,0,.4);}
    .nav-links{display:none;align-items:center;gap:2rem;}
    .nav-links a{font-size:.875rem;font-weight:500;color:#D1D5DB;transition:color .15s;}
    .nav-links button{font-size:.875rem;font-weight:500;color:#D1D5DB;transition:color .15s;background:none;border:none;cursor:pointer;}
    .nav-links a:hover,.nav-links button:hover{color:#fff;}
    .nav-actions{display:flex;align-items:center;gap:1rem;}
    .btn-login{background:#FF9900;color:#0F1629;font-weight:600;font-size:.875rem;padding:.625rem 1.25rem;border-radius:.375rem;transition:all .15s;box-shadow:0 0 15px rgba(255,153,0,.3);cursor:pointer;border:none;}
    .btn-login:hover{background:#E68A00;box-shadow:0 0 20px rgba(255,153,0,.5);}
    .lang-select{background:#151E32;border:1px solid #2A344A;color:#D1D5DB;font-size:.875rem;padding:.5rem .75rem;border-radius:.375rem;cursor:pointer;transition:all .15s;font-family:Inter,sans-serif;}
    .lang-select:hover{border-color:#FF9900;}
    .lang-select:focus{outline:none;border-color:#FF9900;box-shadow:0 0 10px rgba(255,153,0,.2);}
    .lang-select option{background:#0F1629;color:#D1D5DB;}
    @media(min-width:768px){.nav-links{display:flex;}}
  `;

  return (
    <>
      <style>{styles}</style>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
        <div className="nav-inner">
          <button onClick={onLogoClick} className="nav-logo" style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}>
            <div className="logo-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-.025em' }}>AWSArchive</span>
          </button>
          <div className="nav-links">
            <button onClick={() => onTabChange('quiz')} style={{ background: 'none', border: 'none', color: '#D1D5DB', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color .15s' }}>
              {t.tabQuiz}
            </button>
            <button onClick={() => onTabChange('concept')} style={{ background: 'none', border: 'none', color: '#D1D5DB', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color .15s' }}>
              {t.tabConcept}
            </button>
            <button onClick={() => onTabChange('status')} style={{ background: 'none', border: 'none', color: '#D1D5DB', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color .15s' }}>
              {t.tabStatus}
            </button>
            <button onClick={() => onTabChange('mockExam')} style={{ background: 'none', border: 'none', color: '#D1D5DB', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color .15s' }}>
              {t.tabMockExam}
            </button>
          </div>
          <div className="nav-actions">
            <select
              value={locale}
              onChange={(e) => handleLanguageChange(e.target.value as Locale)}
              className="lang-select"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
            {showLoginButton && (
              <button onClick={onLoginClick} className="btn-login">{t.landingNavLogin}</button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
