import React, { useState, useEffect } from 'react';
import { ko } from '../locales/ko';
import { en } from '../locales/en';
import { ja } from '../locales/ja';

type Locale = 'ko' | 'en' | 'ja';

interface NavigatorProps {
  onTabChange: (tab: "quiz" | "concept" | "status" | "mockExam" | "admin" | "users") => void;
  currentLocale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
  onLoginClick?: () => void;
  showLoginButton?: boolean;
  onLogoClick?: () => void;
  isAdmin?: boolean;
  currentTab?: string;
  dday?: string;
  streak?: number;
  userEmail?: string | null;
  onDdayClick?: () => void;
  userStatus?: "guest" | "loggedIn" | "paid";
  onLogout?: () => void;
  onCancelSubscription?: () => void;
}

export default function Navigator({ onTabChange, currentLocale = 'ko', onLocaleChange, onLoginClick, showLoginButton = true, onLogoClick, isAdmin = false, currentTab, dday, streak, userEmail, onDdayClick, userStatus, onLogout, onCancelSubscription }: NavigatorProps) {
  const [locale, setLocale] = useState<Locale>(currentLocale);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // currentLocale prop이 변경되면 내부 locale 상태 업데이트
  useEffect(() => {
    setLocale(currentLocale);
  }, [currentLocale]);

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
    .nav-dday{display:flex;align-items:center;}
    .nav-streak{display:flex;align-items:center;}
    .hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:.5rem;}
    .hamburger span{display:block;width:22px;height:2px;background:#D1D5DB;border-radius:2px;transition:all .3s;}
    .mobile-menu{display:none;position:fixed;top:5rem;left:0;right:0;background:rgba(15,22,41,.97);border-bottom:1px solid #2A344A;z-index:9998;padding:1rem 1.5rem;flex-direction:column;gap:.75rem;}
    .mobile-menu.open{display:flex;}
    .mobile-menu-btn{background:none;border:none;color:#D1D5DB;font-size:.95rem;font-weight:500;cursor:pointer;padding:.75rem 0;text-align:left;border-bottom:1px solid rgba(255,255,255,0.05);width:100%;}
    .mobile-menu-btn:last-child{border-bottom:none;}
    .mobile-menu-btn.active{color:#FF9900;}
    .mobile-menu-divider{height:1px;background:rgba(255,255,255,0.1);margin:.25rem 0;}
    .mobile-lang-select{background:#151E32;border:1px solid #2A344A;color:#D1D5DB;font-size:.875rem;padding:.625rem .75rem;border-radius:.375rem;cursor:pointer;width:100%;}
    .mobile-login-btn{background:#FF9900;color:#0F1629;font-weight:600;font-size:.875rem;padding:.75rem;border-radius:.375rem;border:none;cursor:pointer;width:100%;margin-top:.25rem;}
    @media(min-width:768px){.nav-links{display:flex;}}
    @media(max-width:767px){
      .hamburger{display:flex;}
      .nav-actions .lang-select{display:none;}
      .nav-actions .btn-login{display:none;}
      .nav-dday{display:none;}
      .nav-streak{display:none;}
    }
    @media(max-width:480px){
      .nav-inner{padding:0 .75rem;height:4rem;}
      .nav-logo span{font-size:1rem;}
      .logo-icon{width:1.75rem;height:1.75rem;}
      .nav-actions{gap:.5rem;}
      .mobile-menu{top:4rem;}
    }
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
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-.025em' }}>SAA Cloud Prep</span>
          </button>
          <div className="nav-links">
            <button onClick={() => onTabChange('quiz')} style={{ background: 'none', border: 'none', color: currentTab === 'quiz' ? '#FF9900' : '#D1D5DB', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color .15s' }}>
              {t.tabQuiz}
            </button>
            <button onClick={() => onTabChange('concept')} style={{ background: 'none', border: 'none', color: currentTab === 'concept' ? '#FF9900' : '#D1D5DB', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color .15s' }}>
              {t.tabConcept}
            </button>
            <button onClick={() => onTabChange('status')} style={{ background: 'none', border: 'none', color: currentTab === 'status' ? '#FF9900' : '#D1D5DB', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color .15s' }}>
              {t.tabStatus}
            </button>
            <button onClick={() => onTabChange('mockExam')} style={{ background: 'none', border: 'none', color: currentTab === 'mockExam' ? '#FF9900' : '#D1D5DB', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color .15s' }}>
              {t.tabMockExam}
            </button>
            {isAdmin && (
              <>
                <button onClick={() => onTabChange('admin')} style={{ background: 'none', border: 'none', color: currentTab === 'admin' ? '#FF9900' : '#D1D5DB', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color .15s' }}>
                  Admin
                </button>
                <button onClick={() => onTabChange('users')} style={{ background: 'none', border: 'none', color: currentTab === 'users' ? '#FF9900' : '#D1D5DB', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color .15s' }}>
                  Users
                </button>
              </>
            )}
          </div>
          {/* 햄버거 버튼 (모바일 전용) */}
          <button className="hamburger" onClick={() => setShowMobileMenu(!showMobileMenu)} aria-label="메뉴">
            <span style={{ transform: showMobileMenu ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
            <span style={{ opacity: showMobileMenu ? 0 : 1 }}></span>
            <span style={{ transform: showMobileMenu ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
          </button>

          <div className="nav-actions">
            {userEmail && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#D1D5DB', fontSize: '.875rem', position: 'relative' }}>
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.5rem',
                    padding: '0 .75rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '.375rem',
                    border: 'none',
                    color: '#D1D5DB',
                    cursor: 'pointer',
                    transition: 'all .15s',
                    fontSize: '.875rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <span>{userEmail.split('@')[0]}</span>
                  <span style={{ fontSize: '0.75rem' }}>▼</span>
                </button>
                {showAccountMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '.5rem',
                    background: '#0F1629',
                    border: '1px solid #2A344A',
                    borderRadius: '.375rem',
                    minWidth: '150px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    zIndex: 1000
                  }}>
                    <button
                      onClick={() => {
                        onLogout?.();
                        setShowAccountMenu(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '.75rem 1rem',
                        background: 'none',
                        border: 'none',
                        color: '#D1D5DB',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '.875rem',
                        transition: 'all .15s',
                        borderBottom: userStatus === 'paid' ? '1px solid #2A344A' : 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      로그아웃
                    </button>
                    {userStatus === 'paid' && (
                      <button
                        onClick={() => {
                          onCancelSubscription?.();
                          setShowAccountMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '.75rem 1rem',
                          background: 'none',
                          border: 'none',
                          color: '#fca5a5',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '.875rem',
                          transition: 'all .15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        구독 취소
                      </button>
                    )}
                  </div>
                )}
                {dday && (
                  <button
                    onClick={onDdayClick}
                    className="nav-dday"
                    style={{
                      gap: '.5rem',
                      background: 'none',
                      border: 'none',
                      color: '#D1D5DB',
                      cursor: 'pointer',
                      transition: 'color .15s',
                      fontSize: '.875rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FF9900'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#D1D5DB'}
                  >
                    <span>{dday}</span>
                  </button>
                )}
                {streak !== undefined && streak > 0 && (
                  <div className="nav-streak" style={{ gap: '.5rem' }}>
                    <span>{streak}일차</span>
                  </div>
                )}
              </div>
            )}
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
              <button onClick={() => onLoginClick && onLoginClick()} className="btn-login">{t.landingNavLogin}</button>
            )}
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 드롭다운 */}
      <div className={`mobile-menu${showMobileMenu ? ' open' : ''}`}>
        {/* 탭 메뉴 */}
        <button className={`mobile-menu-btn${currentTab === 'quiz' ? ' active' : ''}`} onClick={() => { onTabChange('quiz'); setShowMobileMenu(false); }}>{t.tabQuiz}</button>
        <button className={`mobile-menu-btn${currentTab === 'concept' ? ' active' : ''}`} onClick={() => { onTabChange('concept'); setShowMobileMenu(false); }}>{t.tabConcept}</button>
        <button className={`mobile-menu-btn${currentTab === 'status' ? ' active' : ''}`} onClick={() => { onTabChange('status'); setShowMobileMenu(false); }}>{t.tabStatus}</button>
        <button className={`mobile-menu-btn${currentTab === 'mockExam' ? ' active' : ''}`} onClick={() => { onTabChange('mockExam'); setShowMobileMenu(false); }}>{t.tabMockExam}</button>
        {isAdmin && <>
          <button className={`mobile-menu-btn${currentTab === 'admin' ? ' active' : ''}`} onClick={() => { onTabChange('admin'); setShowMobileMenu(false); }}>Admin</button>
          <button className={`mobile-menu-btn${currentTab === 'users' ? ' active' : ''}`} onClick={() => { onTabChange('users'); setShowMobileMenu(false); }}>Users</button>
        </>}

        <div className="mobile-menu-divider" />

        {/* 언어 선택 */}
        <select value={locale} onChange={(e) => { handleLanguageChange(e.target.value as Locale); }} className="mobile-lang-select">
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>

        {/* 로그인/계정 */}
        {userEmail ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.25rem' }}>
            {dday && <span style={{ color: '#D1D5DB', fontSize: '.875rem' }}>{dday}</span>}
            {streak !== undefined && streak > 0 && <span style={{ color: '#D1D5DB', fontSize: '.875rem' }}>{streak}일차</span>}
            <button className="mobile-menu-btn" style={{ color: '#fca5a5' }} onClick={() => { onLogout?.(); setShowMobileMenu(false); }}>로그아웃</button>
            {userStatus === 'paid' && (
              <button className="mobile-menu-btn" style={{ color: '#fca5a5' }} onClick={() => { onCancelSubscription?.(); setShowMobileMenu(false); }}>구독 취소</button>
            )}
          </div>
        ) : showLoginButton ? (
          <button className="mobile-login-btn" onClick={() => { onLoginClick?.(); setShowMobileMenu(false); }}>{t.landingNavLogin}</button>
        ) : null}
      </div>
    </>
  );
}
