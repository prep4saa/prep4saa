import React from 'react';
import { useLocale } from '../LocaleContext';
import { ko } from '../locales/ko';
import { en } from '../locales/en';
import { ja } from '../locales/ja';

interface FooterProps {
  onTabChange?: (tab: "quiz" | "concept" | "status" | "mockExam") => void;
}

const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  const { locale } = useLocale();
  const locales = { ko, en, ja };
  const t = locales[locale];

  const styles = `
    footer{border-top:1px solid #2A344A;background:#0A101E;padding-top:4rem;padding-bottom:2rem;}
    .footer-inner{max-width:80rem;margin:0 auto;padding:0 1.5rem;}
    .footer-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:2rem;margin-bottom:3rem;}
    .footer-brand p{font-size:.875rem;color:#9CA3AF;}
    .footer-col h4{color:#fff;font-weight:600;margin-bottom:1rem;}
    .footer-col ul li{margin-bottom:.5rem;}
    .footer-col a{font-size:.875rem;color:#9CA3AF;transition:color .15s;}
    .footer-col a:hover{color:#FF9900;}
    .footer-col button{background:none;border:none;color:inherit;cursor:pointer;padding:0;font:inherit;font-size:.875rem;color:#9CA3AF;transition:color .15s;}
    .footer-col button:hover{color:#FF9900;}
    .footer-bottom{border-top:1px solid #2A344A;padding-top:2rem;display:flex;flex-direction:column;gap:1rem;align-items:center;}
    .footer-legal{font-size:.75rem;color:#6B7280;text-align:center;}
    .footer-langs{display:flex;gap:1rem;font-size:.75rem;color:#6B7280;}
    @media(min-width:768px){
      .footer-grid{grid-template-columns:repeat(4,1fr);}
      .footer-bottom{flex-direction:row;justify-content:space-between;}
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <footer>
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '.25rem', background: '#FF9900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#0F1629" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.125rem' }}>AWSArchive</span>
              </div>
              <p className="footer-brand">{t.landingFooterBrand}</p>
            </div>
            <div className="footer-col">
              <h4>{t.landingFooterProduct}</h4>
              <ul>
                <li>{onTabChange ? <button onClick={() => onTabChange('quiz')}>{t.tabQuiz}</button> : <a href="#">{t.tabQuiz}</a>}</li>
                <li>{onTabChange ? <button onClick={() => onTabChange('status')}>{t.tabStatus}</button> : <a href="#">{t.tabStatus}</a>}</li>
                <li>{onTabChange ? <button onClick={() => onTabChange('mockExam')}>{t.tabMockExam}</button> : <a href="#">{t.tabMockExam}</a>}</li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>{t.landingFooterLegal}</h4>
              <ul>
                <li><a href="#">{t.landingFooterLegalTerms}</a></li>
                <li><a href="#">{t.landingFooterLegalPrivacy}</a></li>
                <li><a href="#">{t.landingFooterLegalRefund}</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-legal">{t.landingFooterCopyright}</p>
            <div className="footer-langs">
              <span>EN</span>
              <span>KO</span>
              <span>JA</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
