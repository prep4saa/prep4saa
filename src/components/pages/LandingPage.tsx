import { useState, useEffect } from 'react';
import Navigator from '../organisms/Navigator';
import Footer from '../organisms/Footer';
import Carousel from '../organisms/Carousel';
import { ko } from '../../locales/ko';
import { en } from '../../locales/en';
import { ja } from '../../locales/ja';

type Locale = 'ko' | 'en' | 'ja';

interface LandingPageProps {
  onGetStarted: () => void;
  onTabChange: (tab: "quiz" | "concept" | "status" | "mockExam" | "pastExam" | "admin" | "users") => void;
  onLoginClick?: () => void;
  onProClick?: () => void;
  userEmail?: string | null;
  dday?: string;
  streak?: number;
  onDdayClick?: () => void;
  userStatus?: "guest" | "loggedIn" | "paid";
  onLogout?: () => void;
  onCancelSubscription?: () => void;
  currentLocale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
  isAdmin?: boolean;
  isAuthChecked?: boolean;
  emailVerified?: boolean;
  subscriptionCancelled?: boolean;
  premiumUntil?: string | null;
}

export default function LandingPage({ onGetStarted, onTabChange, onLoginClick, onProClick, userEmail, dday, streak, onDdayClick, userStatus, onLogout, onCancelSubscription, currentLocale = 'ko', onLocaleChange, isAdmin = false, subscriptionCancelled = false, premiumUntil = null }: LandingPageProps) {

  // 버튼 클릭 핸들러: 비로그인 → 로그인 창, 로그인 → 해당 액션
  const handleFreeClick = () => userEmail ? onGetStarted() : onLoginClick?.();
  const handleProClick = () => {
    if (!userEmail) { onLoginClick?.(); return; }
    if (userStatus === "paid" || isAdmin) { onGetStarted(); return; } // paid 또는 운영자 → 퀴즈로 이동
    onProClick?.();
  };
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('landingPageLocale') as Locale;
    if (saved && ['ko', 'en', 'ja'].includes(saved)) return saved;
    const lang = navigator.language.substring(0, 2);
    if (lang === 'ko') return 'ko';
    if (lang === 'ja') return 'ja';
    return 'en';
  });

  const locales = { ko, en, ja };
  const t = locales[locale];

  // currentLocale prop이 변경되면 내부 locale 상태 업데이트
  useEffect(() => {
    setLocale(currentLocale);
  }, [currentLocale]);

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('landingPageLocale', newLocale);
    if (onLocaleChange) {
      onLocaleChange(newLocale);
    }
  };

  const styles = `
    :root{--aws-bg:#0F1629;--aws-card:#151E32;--aws-cardHover:#1A253D;--aws-border:#2A344A;--aws-orange:#FF9900;--aws-orangeHover:#E68A00;--aws-heading:#F9FAFB;--aws-text:#D1D5DB;}
    *,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;}
    html{line-height:1.5;font-family:Inter,sans-serif;scroll-behavior:smooth;}
    body{margin:0;background-color:#0F1629;color:#D1D5DB;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;}
    h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit;margin:0;}
    a{color:inherit;text-decoration:inherit;}
    p{margin:0;}
    ol,ul{list-style:none;margin:0;padding:0;}
    img,svg{display:block;vertical-align:middle;max-width:100%;}
    button,input{font-family:inherit;font-size:100%;line-height:inherit;color:inherit;margin:0;padding:0;}
    button{cursor:pointer;background:transparent;border:0;}
    *{-ms-overflow-style:none!important;scrollbar-width:none!important;}
    *::-webkit-scrollbar{display:none!important;}

    .bg-grid{background-size:40px 40px;background-image:linear-gradient(to right,rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.05) 1px,transparent 1px);}
    .glow{box-shadow:0 0 40px -10px rgba(255,153,0,.3);}
    .clip-text{background-clip:text;-webkit-background-clip:text;color:transparent;}

    .btn-primary{background:#FF9900;color:#0F1629;font-weight:600;font-size:.875rem;padding:.625rem 1.25rem;border-radius:.375rem;transition:all .15s;box-shadow:0 0 15px rgba(255,153,0,.3);cursor:pointer;border:none;}
    .btn-primary:hover{background:#E68A00;box-shadow:0 0 20px rgba(255,153,0,.5);}

    /* HERO */
    .hero{position:relative;padding-top:3rem;padding-bottom:3rem;overflow:hidden;}
    .hero-grid{position:absolute;inset:0;opacity:.3;pointer-events:none;}
    .hero-glow{position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 20% 0%,rgba(255,153,0,0.15),transparent 60%),radial-gradient(ellipse 50% 40% at 85% 20%,rgba(52,211,153,0.08),transparent 60%);pointer-events:none;}
    .hero-inner{max-width:80rem;margin:0 auto;padding:0 1.5rem;position:relative;z-index:10;}
    .hero-grid-cols{display:grid;gap:4rem;align-items:center;}
    .hero-badge{display:inline-flex;align-items:center;gap:.5rem;padding:.25rem .75rem;border-radius:9999px;background:#151E32;border:1px solid #2A344A;margin-bottom:1.5rem;}
    .hero-badge-dot{width:.5rem;height:.5rem;border-radius:9999px;background:#FF9900;flex-shrink:0;}
    .hero-badge-text{font-size:.75rem;font-weight:500;color:#D1D5DB;text-transform:uppercase;letter-spacing:.05em;}
    h1{font-size:3.25rem;font-weight:800;color:#F9FAFB;line-height:1.1;margin-bottom:1.5rem;letter-spacing:-.025em;word-break:keep-all;text-shadow:0 0 40px rgba(255,255,255,0.04);}
    .hero-sub{font-size:1.125rem;color:#D1D5DB;line-height:1.625;margin-bottom:2rem;max-width:36rem;}
    .hero-ctas{display:flex;flex-direction:column;gap:1rem;margin-bottom:1rem;}
    .btn-hero-primary{background:#FF9900;color:#0F1629;font-weight:700;font-size:1.125rem;padding:1rem 2rem;border-radius:.5rem;transition:all .15s;box-shadow:0 0 20px rgba(255,153,0,.3);text-align:center;cursor:pointer;border:none;display:inline-block;text-decoration:none;}
    .btn-hero-primary:hover{background:#E68A00;box-shadow:0 0 30px rgba(255,153,0,.5);transform:translateY(-.125rem);}
    .btn-hero-secondary{background:#151E32;border:1px solid #2A344A;color:#fff;font-weight:600;font-size:1.125rem;padding:1rem 2rem;border-radius:.5rem;transition:all .15s;text-align:center;cursor:pointer;display:inline-block;text-decoration:none;}
    .btn-hero-secondary:hover{background:#1A253D;}
    .hero-note{font-size:.875rem;color:#9CA3AF;display:flex;align-items:center;gap:.5rem;}

    /* MOCK EXAM CARD */
    .mock-card{position:relative;border-radius:1rem;border:1px solid #2A344A;background:#0F1629;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);transform:rotate(2deg);transition:transform .5s;margin-top:2rem;}
    .mock-card:hover{transform:rotate(0);}
    .mock-blur-1{position:absolute;top:-1rem;right:-1rem;width:6rem;height:6rem;background:rgba(255,153,0,.2);filter:blur(64px);border-radius:9999px;}
    .mock-blur-2{position:absolute;bottom:-2rem;left:-2rem;width:8rem;height:8rem;background:rgba(255,153,0,0.15);filter:blur(64px);border-radius:9999px;}
    .mock-bar{display:flex;align-items:center;gap:.5rem;padding:.75rem 1rem;border-bottom:1px solid #2A344A;background:#151E32;border-radius:1rem 1rem 0 0;}
    .dot-red{width:.75rem;height:.75rem;border-radius:9999px;background:rgba(239,68,68,.8);}
    .dot-yellow{width:.75rem;height:.75rem;border-radius:9999px;background:rgba(234,179,8,.8);}
    .dot-green{width:.75rem;height:.75rem;border-radius:9999px;background:rgba(34,197,94,.8);}
    .mock-url{margin-left:1rem;font-size:.75rem;color:#6B7280;font-family:monospace;}
    .mock-body{padding:1.5rem;background:#0a0f18;border-radius:0 0 1rem 1rem;}
    .mock-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;}
    .mock-q-count{font-weight:600;color:#F9FAFB;}
    .mock-timer{color:#FF9900;font-weight:600;background:rgba(255,153,0,.1);padding:.25rem .75rem;border-radius:.25rem;}
    .mock-question{padding:1rem;border-radius:.5rem;border:1px solid #2A344A;background:#151E32;margin-bottom:1rem;}
    .mock-question p{color:#D1D5DB;line-height:1.625;}
    .mock-option{display:flex;align-items:flex-start;gap:.75rem;padding:1rem;border-radius:.5rem;border:1px solid #2A344A;background:#151E32;cursor:pointer;margin-bottom:.75rem;transition:border-color .15s;}
    .mock-option:hover{border-color:rgba(255,153,0,.5);}
    .mock-option.selected{border-color:#FF9900;background:rgba(255,153,0,.05);}
    .radio{width:1rem;height:1rem;border-radius:9999px;border:1px solid #6B7280;margin-top:.125rem;flex-shrink:0;}
    .radio.selected{border:4px solid #FF9900;background:#fff;}
    .mock-option span{color:#D1D5DB;}
    .mock-option.selected span{color:#fff;font-weight:500;}

    /* STATS BAR */
    .stats-bar{border-top:1px solid #2A344A;border-bottom:1px solid #2A344A;background:rgba(21,30,50,.5);padding:2rem 0;}
    .stats-inner{max-width:80rem;margin:0 auto;padding:0 1.5rem;}
    .stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:2rem;}
    .stat-item{text-align:center;padding:0 1rem;border-left:1px solid rgba(42,52,74,.5);}
    .stat-item:first-child{border-left:0;}
    .stat-num{font-size:1.875rem;font-weight:700;color:#fff;margin-bottom:.25rem;}
    .stat-label{font-size:.875rem;color:#9CA3AF;}

    /* FEATURES */
    .section{padding:6rem 0;}
    .section-inner{max-width:80rem;margin:0 auto;padding:0 1.5rem;}
    .section-header{text-align:center;max-width:48rem;margin:0 auto 4rem;}
    h2{font-size:1.875rem;font-weight:700;color:#fff;margin-bottom:1rem;}
    .section-sub{font-size:1.125rem;color:#9CA3AF;}
    .features-grid{display:grid;gap:2rem;}
    .feature-card{background:#151E32;border:1px solid #2A344A;border-radius:1rem;padding:2rem;transition:border-color .15s;}
    .feature-card:hover{border-color:rgba(255,153,0,.4);}
    .feature-title{font-size:1.25rem;font-weight:700;color:#fff;margin-bottom:.75rem;}
    .feature-desc{color:#9CA3AF;line-height:1.625;}

    /* HOW IT WORKS */
    .how-section{padding:6rem 0;background:#0A101E;border-top:1px solid #2A344A;border-bottom:1px solid #2A344A;}
    .steps-grid{display:grid;gap:3rem;position:relative;}
    .step{text-align:center;}
    .step-num{width:6rem;height:6rem;margin:0 auto;background:#0F1629;border:2px solid #2A344A;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:1.875rem;font-weight:700;color:#FF9900;margin-bottom:1.5rem;position:relative;z-index:10;}
    .step-num.active{border-color:#FF9900;box-shadow:0 0 20px rgba(255,153,0,.2);}
    .step-title{font-size:1.25rem;font-weight:700;color:#fff;margin-bottom:.75rem;}
    .step-desc{color:#9CA3AF;}

    /* PRICING */
    .pricing-section{padding:6rem 0;background:#0A101E;border-top:1px solid #2A344A;border-bottom:1px solid #2A344A;}
    .pricing-grid{display:grid;gap:2rem;max-width:56rem;margin:0 auto;}
    .price-card{background:#151E32;border:1px solid #2A344A;border-radius:1.5rem;padding:2rem;display:flex;flex-direction:column;}
    .price-card-pro{background:linear-gradient(to bottom,#151E32,#0F1629);border:2px solid #FF9900;box-shadow:0 0 40px rgba(255,153,0,.15);position:relative;}
    .popular-badge{position:absolute;top:0;left:50%;transform:translate(-50%,-50%);background:#FF9900;color:#0F1629;font-weight:700;padding:.25rem 1rem;border-radius:9999px;font-size:.875rem;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;}
    .price-title{font-size:1.5rem;font-weight:700;color:#fff;margin-bottom:.5rem;}
    .price-desc{color:#9CA3AF;min-height:2.5rem;margin-bottom:1.5rem;}
    .price-amount{display:flex;align-items:baseline;gap:.5rem;}
    .price-num{font-size:3rem;font-weight:800;color:#fff;}
    .price-period{color:#9CA3AF;font-weight:500;}
    .price-features{flex-grow:1;margin:2rem 0;}
    .price-feature{display:flex;align-items:center;gap:.75rem;color:#D1D5DB;margin-bottom:1rem;}
    .price-feature.faded{color:#4B5563;}
    .pro-features{flex-grow:1;margin:2rem 0;display:flex;flex-direction:column;gap:1.5rem;}
    .pro-feature{border-left:3px solid #FF9900;padding-left:1rem;padding-right:1rem;}
    .pro-feature-title{font-weight:700;color:#F9FAFB;margin-bottom:.5rem;font-size:1rem;}
    .pro-feature-desc{color:#D1D5DB;font-size:.95rem;line-height:1.6;margin:0;}
    .check-orange{color:#FF9900;}
    .check-gray{color:#6B7280;}
    .btn-free{width:100%;padding:1rem 1.5rem;border-radius:.5rem;font-weight:600;border:1px solid #2A344A;color:#fff;transition:background .15s;cursor:pointer;}
    .btn-free:hover{background:rgba(42,52,74,.5);}
    .btn-pro{width:100%;padding:1rem 1.5rem;border-radius:.5rem;font-weight:700;background:#FF9900;color:#0F1629;transition:background .15s;display:flex;justify-content:center;align-items:center;gap:.5rem;cursor:pointer;border:none;}
    .btn-pro:hover{background:#E68A00;}

    /* FAQ */
    .faq-inner{max-width:48rem;margin:0 auto;padding:0 1.5rem;}
    .faq-item{background:#151E32;border:1px solid #2A344A;border-radius:.75rem;padding:1.5rem;margin-bottom:1.5rem;}
    .faq-q{font-size:1.125rem;font-weight:700;color:#fff;margin-bottom:.75rem;}
    .faq-a{color:#9CA3AF;line-height:1.625;}

    /* FINAL CTA */
    .cta-section{padding:6rem 0;position:relative;overflow:hidden;}
    .cta-bg{position:absolute;inset:0;background:rgba(255,153,0,.05);pointer-events:none;}
    .cta-box{background:linear-gradient(135deg,#151E32,#0F1629);border:1px solid #2A344A;border-radius:2.5rem;padding:3rem;text-align:center;position:relative;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);}
    .cta-blur-1{position:absolute;top:-6rem;right:-6rem;width:16rem;height:16rem;background:rgba(255,153,0,.2);filter:blur(80px);border-radius:9999px;pointer-events:none;}
    .cta-blur-2{position:absolute;bottom:-6rem;left:-6rem;width:16rem;height:16rem;background:rgba(255,153,0,0.1);filter:blur(80px);border-radius:9999px;pointer-events:none;}
    .cta-h{font-size:2.25rem;font-weight:800;color:#fff;margin-bottom:1.5rem;letter-spacing:-.025em;position:relative;z-index:10;}
    .cta-sub{font-size:1.25rem;color:#D1D5DB;margin-bottom:2.5rem;max-width:42rem;margin-left:auto;margin-right:auto;position:relative;z-index:10;}
    .cta-btns{display:flex;flex-direction:column;align-items:center;gap:1rem;position:relative;z-index:10;}


    /* MOBILE */
    @media(max-width:480px){
        .landing-outer{padding-top:4rem;}
        .hero{padding-top:2rem;padding-bottom:2.5rem;}
    }

    /* RESPONSIVE */
    @media(min-width:640px){
        .hero-ctas{flex-direction:row;}
        .cta-btns{flex-direction:row;justify-content:center;}
    }
    @media(min-width:768px){
        .stats-grid{grid-template-columns:repeat(4,1fr);}
        .features-grid{grid-template-columns:repeat(2,1fr);}
        .steps-grid{grid-template-columns:repeat(3,1fr);}
        .pricing-grid{grid-template-columns:repeat(2,1fr);}
        .price-card-pro{transform:translateY(-1rem);}
    }
    @media(min-width:1024px){
        .hero-grid-cols{grid-template-columns:repeat(2,1fr);}
        h1{font-size:4.25rem;}
        .mock-card{margin-top:0;margin-left:2.5rem;}
        .cta-h{font-size:3rem;}
        .hero{padding-top:5rem;padding-bottom:5rem;}
    }

    /* ── Hero entrance: fade-up stagger ── */
    @keyframes heroFadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes heroFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .hero-grid-cols > div:first-child > * { animation: heroFadeUp 0.8s ease backwards; }
    .hero-grid-cols > div:first-child > *:nth-child(1) { animation-delay: 0.05s; }
    .hero-grid-cols > div:first-child > *:nth-child(2) { animation-delay: 0.15s; }
    .hero-grid-cols > div:first-child > *:nth-child(3) { animation-delay: 0.25s; }
    .hero-grid-cols > div:first-child > *:nth-child(4) { animation-delay: 0.35s; }
    .hero-grid-cols > div:first-child > *:nth-child(5) { animation-delay: 0.45s; }
    .hero-grid-cols > .mock-card { animation: heroFadeIn 0.8s ease backwards; animation-delay: 0.55s; }
  `;

  return (
    <>
      <style>{styles}</style>
      <Navigator
        onTabChange={onTabChange}
        currentLocale={locale}
        onLocaleChange={handleLanguageChange}
        showLoginButton={!userEmail}
        onLoginClick={onLoginClick}
        userEmail={userEmail}
        dday={dday}
        streak={streak}
        onDdayClick={onDdayClick}
        userStatus={userStatus}
        onLogout={onLogout}
        onCancelSubscription={onCancelSubscription}
        subscriptionCancelled={subscriptionCancelled}
        premiumUntil={premiumUntil}
        isAdmin={isAdmin}
      />
      <div className="landing-outer" style={{ width: '100%', minHeight: '100vh', background: '#0F1629', color: '#D1D5DB', fontFamily: 'Inter, sans-serif', overflowX: 'hidden', paddingTop: '5rem' }}>

        {/* HERO */}
        <section className="hero">
          <div className="hero-grid bg-grid"></div>
          <div className="hero-glow"></div>
          <div className="hero-inner">
            <div className="hero-grid-cols" style={{ display: 'grid', gap: '4rem', alignItems: 'center' }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FF9900', display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.75rem', textShadow: '0 0 20px rgba(255,153,0,0.3)' }}>
                  <span style={{ width: '1.75rem', height: '1.5px', background: '#FF9900' }}></span>
                  {t.landingBadgeText}
                </span>
                <h1>{t.landingHeading}<br /><span style={{ background: 'linear-gradient(to right,#FF9900,#fb923c)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>{t.landingHeadingGradient}</span></h1>
                <p className="hero-sub">{t.landingSub}</p>
                <div className="hero-ctas">
                  <button onClick={handleFreeClick} className="btn-hero-primary">{t.landingCTAPrimary}</button>
                </div>
                <p className="hero-note">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#4ADE80" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t.landingNote}
                </p>
              </div>
              {/* Mock Exam UI */}
              <div className="mock-card glow">
                <div className="mock-blur-1"></div>
                <div className="mock-blur-2"></div>
                <div className="mock-bar">
                  <div className="dot-red"></div>
                  <div className="dot-yellow"></div>
                  <div className="dot-green"></div>
                  <span className="mock-url">www.prep4saa.com</span>
                </div>
                <div className="mock-body">
                  <div className="mock-header">
                    <span className="mock-q-count">{t.mockExamQCount} 12 {t.mockExamOf} 50</span>
                    <span className="mock-timer">01:45:22 {t.mockExamTimeRemaining}</span>
                  </div>
                  <div className="mock-question">
                    <p>{t.mockExamQuestion}</p>
                  </div>
                  <div className="mock-option">
                    <div className="radio"></div>
                    <span>{t.mockExamOption1}</span>
                  </div>
                  <div className="mock-option selected">
                    <div className="radio selected"></div>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{t.mockExamOption2}</span>
                  </div>
                  <div className="mock-option">
                    <div className="radio"></div>
                    <span>{t.mockExamOption3}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="stats-bar">
          <div className="stats-inner">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-num">{t.landingStats1}</div>
                <div className="stat-label">{t.landingStats1Desc}</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">{t.landingStats2}</div>
                <div className="stat-label">{t.landingStats2Desc}</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">{t.landingStats3}</div>
                <div className="stat-label">{t.landingStats3Desc}</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">{t.landingStats4}</div>
                <div className="stat-label">{t.landingStats4Desc}</div>
              </div>
            </div>
          </div>
        </div>

        {/* HONEST FEATURES - 솔직한 기능 소개 */}
        <section id="honest-features" className="section" style={{ background: '#0A101E', borderTop: '1px solid #2A344A', borderBottom: '1px solid #2A344A' }}>
          <div className="section-inner">
            <div style={{ maxWidth: '48rem', marginBottom: '3.5rem' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF9900', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ width: '1.5rem', height: '1px', background: '#FF9900' }}></span>
                {t.landingHonestEyebrow}
              </span>
              <h2 style={{ textAlign: 'left', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.5rem 0 1rem', color: '#fff' }}>{t.landingHonestTitle}</h2>
              <p style={{ fontSize: '1.0625rem', color: '#9CA3AF', lineHeight: 1.6 }}>{t.landingHonestSub}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[
                { icon: 'Q', title: t.landingHonest1Title, desc: t.landingHonest1Desc },
                { icon: 'M', title: t.landingHonest2Title, desc: t.landingHonest2Desc },
                { icon: 'G', title: t.landingHonest3Title, desc: t.landingHonest3Desc },
                { icon: '3', title: t.landingHonest4Title, desc: t.landingHonest4Desc },
                { icon: 'P', title: t.landingHonest5Title, desc: t.landingHonest5Desc },
                { icon: 'AI', title: t.landingHonest6Title, desc: t.landingHonest6Desc },
                { icon: 'H', title: t.landingHonest7Title, desc: t.landingHonest7Desc },
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.375rem', background: 'rgba(255,153,0,0.12)', border: '1px solid rgba(255,153,0,0.25)', color: '#FF9900', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1.25rem' }}>{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CAROUSEL - 훓어보기 */}
        <section id="preview" style={{ padding: '6rem 0', background: '#0F1629' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0' }}>
            <Carousel
              title={t.carouselTitle}
              slides={[
                {
                  title: t.carouselMockExamTitle,
                  description: t.carouselMockExamDesc,
                  imagePath: '/screenshots/mock-exam.png'
                },
                {
                  title: t.carouselConceptsTitle,
                  description: t.carouselConceptsDesc,
                  imagePath: '/screenshots/concepts.png'
                },
                {
                  title: t.carouselRelationshipMapTitle,
                  description: t.carouselRelationshipMapDesc,
                  imagePath: '/screenshots/relationship-map.png'
                },
                {
                  title: t.carouselProgressTitle,
                  description: t.carouselProgressDesc,
                  imagePath: '/screenshots/progress.png'
                }
              ]}
              autoSlide={true}
              autoSlideInterval={6000}
            />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="how-section">
          <div className="section-inner">
            <div className="section-header">
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF9900', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ width: '1.5rem', height: '1px', background: '#FF9900' }}></span>
                {t.landingHowEyebrow}
              </span>
              <h2>{t.landingHowTitle}</h2>
              <p className="section-sub">{t.landingHowSub}</p>
            </div>
            <div className="steps-grid">
              <div className="step">
                <div className="step-num">1</div>
                <div className="step-title">{t.landingStep1Title}</div>
                <p className="step-desc">{t.landingStep1Desc}</p>
              </div>
              <div className="step">
                <div className="step-num active">2</div>
                <div className="step-title">{t.landingStep2Title}</div>
                <p className="step-desc">{t.landingStep2Desc}</p>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <div className="step-title">{t.landingStep3Title}</div>
                <p className="step-desc">{t.landingStep3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="pricing-section">
          <div className="section-inner">
            <div className="section-header">
              <h2>{t.landingPricingTitle}</h2>
              <p className="section-sub">{t.landingPricingSub}</p>
            </div>
            <div className="pricing-grid">
              <div className="price-card">
                <div className="price-title">{t.landingFreePlanTitle}</div>
                <div className="price-desc">{t.landingFreePlanDesc}</div>
                <div className="price-amount">
                  <span className="price-num">$0</span>
                  <span className="price-period">/forever</span>
                </div>
                <div className="price-features">
                  <div className="price-feature">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {t.landingFreePlanFeature1}
                  </div>
                  <div className="price-feature">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {t.landingFreePlanFeature2}
                  </div>
                  <div className="price-feature">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {t.landingFreePlanFeature3}
                  </div>
                  <div className="price-feature">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {t.landingFreePlanFeature4}
                  </div>
                </div>
                <button className="btn-free" onClick={handleFreeClick}>{t.landingFreePlanBtn}</button>
              </div>
              <div className="price-card price-card-pro">
                <div className="popular-badge">Most Popular</div>
                <div className="price-title">{t.landingProPlanTitle}</div>
                <div className="price-desc">{t.landingProPlanDesc}</div>
                <div className="price-amount">
                  <span className="price-num">$14.99</span>
                  <span className="price-period">/month</span>
                </div>
                <div className="pro-features">
                  <div className="pro-feature">
                    <div className="pro-feature-title">{t.landingProPlanFeature1Title}</div>
                  </div>
                  <div className="pro-feature">
                    <div className="pro-feature-title">{t.landingProPlanFeature2Title}</div>
                  </div>
                  <div className="pro-feature">
                    <div className="pro-feature-title">{t.landingProPlanFeature3Title}</div>
                  </div>
                  <div className="pro-feature">
                    <div className="pro-feature-title">{t.landingProPlanFeature4Title}</div>
                  </div>
                </div>
                {(userStatus === "paid" || isAdmin) ? (
                  <button className="btn-pro" onClick={handleProClick}>
                    {locale === 'ko' ? '퀴즈 시작하기' : locale === 'ja' ? 'クイズを始める' : 'Start Quiz'}
                  </button>
                ) : (
                  <button className="btn-pro" onClick={handleProClick}>
                    {t.premiumUpgradeBtn}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section">
          <div className="faq-inner">
            <div className="section-header">
              <h2>{t.landingFaqTitle}</h2>
            </div>
            <div className="faq-item">
              <div className="faq-q">{t.landingFaq1Q}</div>
              <p className="faq-a">{t.landingFaq1A}</p>
            </div>
            <div className="faq-item">
              <div className="faq-q">{t.landingFaq2Q}</div>
              <p className="faq-a">{t.landingFaq2A}</p>
            </div>
            <div className="faq-item">
              <div className="faq-q">{t.landingFaq3Q}</div>
              <p className="faq-a">{t.landingFaq3A}</p>
            </div>
            <div className="faq-item">
              <div className="faq-q">{t.landingFaq4Q}</div>
              <p className="faq-a">{t.landingFaq4A}</p>
            </div>
            <div className="faq-item">
              <div className="faq-q">{t.landingFaq5Q}</div>
              <p className="faq-a">{t.landingFaq5A}</p>
            </div>
            <div className="faq-item">
              <div className="faq-q">{t.landingFaq6Q}</div>
              <p className="faq-a">{t.landingFaq6A}</p>
            </div>
            <div className="faq-item">
              <div className="faq-q">{t.landingFaq7Q}</div>
              <p className="faq-a">{t.landingFaq7A}</p>
            </div>
          </div>
        </section>

{/* FINAL CTA */}
        <section className="cta-section">
          <div className="cta-bg"></div>
          <div className="section-inner">
            <div className="cta-box">
              <div className="cta-blur-1"></div>
              <div className="cta-blur-2"></div>
              <h2 className="cta-h">{t.landingCtaTitle}</h2>
              <p className="cta-sub">{t.landingCtaSub}</p>
              <div className="cta-btns">
                <button onClick={handleFreeClick} className="btn-hero-primary" style={{ minWidth: '200px' }}>{t.landingCtaPrimary}</button>
                <a href="#pricing" style={{ minWidth: '160px', background: 'transparent', border: '1px solid #2A344A', color: '#fff', fontWeight: 600, fontSize: '1.125rem', padding: '1rem 2rem', borderRadius: '.5rem', transition: 'all .15s', textAlign: 'center', display: 'inline-block' }}>{t.landingCtaSecondary}</a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
