import React, { useEffect, useState } from 'react';
import { useLocale } from '../LocaleContext';

type Locale = 'ko' | 'en' | 'ja';
type LegalPolicyKey = 'terms' | 'privacy' | 'refund' | 'cookies';

type PolicySection = {
  heading: string;
  bullets: string[];
};

type PolicyCopy = {
  title: string;
  subtitle: string;
  updatedLabel: string;
  updatedAt: string;
  sections: PolicySection[];
  closeLabel: string;
};

type FooterCopy = {
  brand: string;
  description: string;
  legalTitle: string;
  labels: Record<LegalPolicyKey, string>;
  copyright: string;
};

const footerCopy: Record<Locale, FooterCopy> = {
  ko: {
    brand: 'SAA Cloud Prep',
    description: 'AWS SAA-C03 합격을 위한 AI 학습 플랫폼',
    legalTitle: '정책',
    labels: {
      terms: '이용약관',
      privacy: '개인정보처리방침',
      refund: '환불정책',
      cookies: '쿠키정책',
    },
    copyright: '© 2026 SAA Cloud Prep. 본 서비스는 Amazon Web Services 또는 Amazon.com과 무관한 독립 교육 플랫폼입니다. 결제는 Lemon Squeezy를 통해 처리됩니다.',
  },
  en: {
    brand: 'SAA Cloud Prep',
    description: 'An AI study platform for AWS SAA-C03',
    legalTitle: 'Legal',
    labels: {
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      refund: 'Refund Policy',
      cookies: 'Cookie Policy',
    },
    copyright: '© 2026 SAA Cloud Prep. This service is an independent educational platform and is not affiliated with Amazon Web Services or Amazon.com. Payments are processed through Lemon Squeezy.',
  },
  ja: {
    brand: 'SAA Cloud Prep',
    description: 'AWS SAA-C03 対策のAI学習プラットフォーム',
    legalTitle: 'ポリシー',
    labels: {
      terms: '利用規約',
      privacy: 'プライバシーポリシー',
      refund: '返金ポリシー',
      cookies: 'クッキーポリシー',
    },
    copyright: '© 2026 SAA Cloud Prep. 本サービスは Amazon Web Services および Amazon.com とは関係のない独立した教育プラットフォームです。決済は Lemon Squeezy で処理されます。',
  },
};

const legalCopy: Record<Locale, Record<LegalPolicyKey, PolicyCopy>> = {
  ko: {
    terms: {
      title: '이용약관',
      subtitle: '서비스를 사용하기 전에 아래 내용을 확인해 주세요.',
      updatedLabel: '최종 업데이트',
      updatedAt: '2026-04-10',
      sections: [
        {
          heading: '1. 서비스 개요',
          bullets: [
            'SAA Cloud Prep는 AWS SAA-C03 시험 대비를 돕는 교육용 서비스입니다.',
            '문제 생성, 모의고사, 학습 기록, PDF 내보내기 기능을 제공합니다.',
          ],
        },
        {
          heading: '2. 결제 및 구독',
          bullets: [
            '유료 구독은 Lemon Squeezy를 통해 월 단위로 결제됩니다.',
            '구독은 자동 갱신될 수 있으며, 사용자는 언제든지 해지할 수 있습니다.',
            '요금, 세금, 청구 정보는 결제 시점의 화면 안내와 구매 영수증을 기준으로 적용됩니다.',
          ],
        },
        {
          heading: '3. 이용자 의무',
          bullets: [
            '계정 정보는 정확하게 입력해 주세요.',
            '타인의 계정을 무단으로 사용하거나 서비스 운영을 방해해서는 안 됩니다.',
            '콘텐츠를 무단 복제, 재판매, 대량 수집하는 행위는 금지됩니다.',
          ],
        },
        {
          heading: '4. 제한 및 변경',
          bullets: [
            '서비스 내용, 가격, 제공 범위는 사전 고지 후 변경될 수 있습니다.',
            '법령, 보안, 운영상 필요가 있는 경우 서비스가 일시 중단될 수 있습니다.',
            '문의는 artsociety931@gmail.com 로 보내 주세요.',
          ],
        },
      ],
      closeLabel: '닫기',
    },
    privacy: {
      title: '개인정보처리방침',
      subtitle: '어떤 정보를 수집하고, 어디에 사용하는지 안내합니다.',
      updatedLabel: '최종 업데이트',
      updatedAt: '2026-04-10',
      sections: [
        {
          heading: '1. 수집하는 정보',
          bullets: [
            '이메일 주소, 계정 식별자, 비밀번호 해시, 학습 기록을 수집할 수 있습니다.',
            '시험 시작일, 언어 설정, 결제 상태와 같은 서비스 설정도 저장됩니다.',
            '접속 로그, 기기 정보, 쿠키 및 로컬 스토리지 정보가 포함될 수 있습니다.',
          ],
        },
        {
          heading: '2. 이용 목적',
          bullets: [
            '계정 관리, 로그인 유지, 학습 통계 제공을 위해 사용합니다.',
            '문제 생성, 모의고사 제공, 오류 분석 및 서비스 개선에 활용합니다.',
            '결제 확인, 구독 관리, 부정 이용 방지에도 필요합니다.',
          ],
        },
        {
          heading: '3. 제3자 제공',
          bullets: [
            'Firebase: 인증, 데이터 저장, 세션 관리.',
            'Lemon Squeezy: 결제 처리, 구독 관리, 세금 및 환불 처리.',
            'Anthropic: AI 문제 생성 요청 처리.',
          ],
        },
        {
          heading: '4. 보관 및 권리',
          bullets: [
            '법령 또는 분쟁 대응이 필요한 경우에만 필요한 기간 동안 보관합니다.',
            '이용자는 열람, 정정, 삭제를 요청할 수 있습니다.',
            '문의는 artsociety931@gmail.com 로 보내 주세요.',
          ],
        },
      ],
      closeLabel: '닫기',
    },
    refund: {
      title: '환불정책',
      subtitle: '디지털 구독 상품의 특성에 맞춘 환불 기준입니다.',
      updatedLabel: '최종 업데이트',
      updatedAt: '2026-04-10',
      sections: [
        {
          heading: '1. 기본 원칙',
          bullets: [
            '구독형 디지털 서비스는 결제 후 즉시 이용이 시작되므로 원칙적으로 사용한 기간에 대한 환불은 제공하지 않습니다.',
            '단순 변심, 일부 사용, 미이용을 이유로 한 환불은 제한될 수 있습니다.',
          ],
        },
        {
          heading: '2. 환불 가능 사유',
          bullets: [
            '중복 결제, 결제 오류, 시스템 문제로 인한 미제공이 확인된 경우 환불을 검토합니다.',
            'Lemon Squeezy는 판매자 정책을 따르되, 결제 후 60일 이내에는 차지백 방지를 위해 재량으로 환불을 처리할 수 있습니다.',
            '관련 법령 또는 Lemon Squeezy / 결제 프로세서 정책상 환불이 필요한 경우 이를 따릅니다.',
            '부정 결제나 무단 결제의 경우 추가 확인이 필요할 수 있습니다.',
          ],
        },
        {
          heading: '3. 구독 해지',
          bullets: [
            '구독 해지는 언제든지 가능합니다.',
            '해지 후에는 다음 청구 주기부터 갱신되지 않습니다.',
            '이미 시작된 청구 기간은 별도 고지 없이 환불되지 않을 수 있습니다.',
          ],
        },
        {
          heading: '4. 요청 방법',
          bullets: [
            '주문 번호, 결제 이메일, 요청 사유를 포함해 artsociety931@gmail.com 로 문의해 주세요.',
            '가능한 한 빠르게 확인 후 안내드리겠습니다.',
          ],
        },
      ],
      closeLabel: '닫기',
    },
    cookies: {
      title: '쿠키정책',
      subtitle: '서비스 운영에 필요한 저장 방식과 쿠키 사용 방침입니다.',
      updatedLabel: '최종 업데이트',
      updatedAt: '2026-04-10',
      sections: [
        {
          heading: '1. 사용하는 저장 방식',
          bullets: [
            '로그인 유지, 언어 설정, 테마 설정을 위해 쿠키 또는 로컬 스토리지를 사용할 수 있습니다.',
            '학습 진도, 시험 시작일, 오늘의 사용 횟수 관리에도 사용됩니다.',
          ],
        },
        {
          heading: '2. 사용 목적',
          bullets: [
            '기본 기능 제공, 세션 유지, 사용자 경험 개선을 위해 사용합니다.',
            '오류 분석과 서비스 품질 개선을 위한 분석 정보가 포함될 수 있습니다.',
          ],
        },
        {
          heading: '3. 제어 방법',
          bullets: [
            '브라우저 설정에서 쿠키와 저장 데이터를 삭제하거나 차단할 수 있습니다.',
            '단, 일부 기능은 정상 동작하지 않을 수 있습니다.',
          ],
        },
      ],
      closeLabel: '닫기',
    },
  },
  en: {
    terms: {
      title: 'Terms of Service',
      subtitle: 'Please review these terms before using the service.',
      updatedLabel: 'Last updated',
      updatedAt: '2026-04-10',
      sections: [
        {
          heading: '1. Service overview',
          bullets: [
            'SAA Cloud Prep is an educational service for AWS SAA-C03 exam preparation.',
            'It includes question generation, mock exams, learning history, and PDF export.',
          ],
        },
        {
          heading: '2. Billing and subscriptions',
          bullets: [
            'Premium plans are billed monthly through Lemon Squeezy.',
            'Subscriptions may renew automatically, and users can cancel anytime.',
            'Pricing, taxes, and billing details follow the checkout screen and receipt shown at purchase.',
          ],
        },
        {
          heading: '3. User obligations',
          bullets: [
            'Please keep account information accurate.',
            'Do not use another person’s account or interfere with the service.',
            'Unauthorized copying, resale, or bulk collection of content is prohibited.',
          ],
        },
        {
          heading: '4. Limits and changes',
          bullets: [
            'Features, pricing, and service scope may change with prior notice.',
            'Service may be suspended temporarily for legal, security, or operational reasons.',
            'Contact artsociety931@gmail.com for questions.',
          ],
        },
      ],
      closeLabel: 'Close',
    },
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'This explains what we collect and how we use it.',
      updatedLabel: 'Last updated',
      updatedAt: '2026-04-10',
      sections: [
        {
          heading: '1. Information we collect',
          bullets: [
            'We may collect email address, account identifier, password hash, and learning history.',
            'Service settings such as exam date, language, and payment status may also be stored.',
            'Access logs, device information, cookies, and local storage data may be collected.',
          ],
        },
        {
          heading: '2. Why we use it',
          bullets: [
            'To manage accounts, keep users signed in, and provide learning statistics.',
            'To generate questions, run mock exams, analyze errors, and improve the service.',
            'To verify payments, manage subscriptions, and prevent abuse.',
          ],
        },
        {
          heading: '3. Third parties',
          bullets: [
            'Firebase: authentication, storage, and session management.',
            'Lemon Squeezy: checkout, billing, tax handling, and refund processing.',
            'Anthropic: AI question generation requests.',
          ],
        },
        {
          heading: '4. Retention and rights',
          bullets: [
            'We retain data only as long as needed for legal or dispute resolution purposes.',
            'Users may request access, correction, or deletion of their data.',
            'Contact artsociety931@gmail.com for privacy requests.',
          ],
        },
      ],
      closeLabel: 'Close',
    },
    refund: {
      title: 'Refund Policy',
      subtitle: 'Refund rules for a digital subscription service.',
      updatedLabel: 'Last updated',
      updatedAt: '2026-04-10',
      sections: [
        {
          heading: '1. General rule',
          bullets: [
            'Because the subscription grants immediate access to digital content, refunds are generally not provided for used billing periods.',
            'Refunds may be limited for change-of-mind, partial use, or non-use.',
          ],
        },
        {
          heading: '2. Eligible cases',
          bullets: [
            'We may review refunds for duplicate charges, billing errors, or non-delivery caused by our system.',
            'Lemon Squeezy lets sellers define their own refund policy, while reserving the right to issue refunds within 60 days to prevent chargebacks.',
            'We also follow any refund requirements under applicable law or Lemon Squeezy / payment processor policies.',
            'Suspicious or unauthorized payments may require additional verification.',
          ],
        },
        {
          heading: '3. Cancellation',
          bullets: [
            'Subscriptions can be canceled anytime.',
            'After cancellation, the plan will not renew on the next billing cycle.',
            'The current billing period may remain non-refundable unless otherwise stated.',
          ],
        },
        {
          heading: '4. How to request a refund',
          bullets: [
            'Email artsociety931@gmail.com with your order number, billing email, and reason for the request.',
            'We will review it as quickly as possible and reply with the next steps.',
          ],
        },
      ],
      closeLabel: 'Close',
    },
    cookies: {
      title: 'Cookie Policy',
      subtitle: 'How we use cookies and local storage to run the service.',
      updatedLabel: 'Last updated',
      updatedAt: '2026-04-10',
      sections: [
        {
          heading: '1. Storage methods we use',
          bullets: [
            'We may use cookies or local storage to keep users signed in and remember language or theme settings.',
            'They are also used to track study progress, exam start dates, and daily usage limits.',
          ],
        },
        {
          heading: '2. Why we use them',
          bullets: [
            'To provide core functionality, maintain sessions, and improve user experience.',
            'Analytical data may be used for error analysis and service quality improvements.',
          ],
        },
        {
          heading: '3. How to control them',
          bullets: [
            'You can delete or block cookies and stored data in your browser settings.',
            'Some features may not work properly if you do so.',
          ],
        },
      ],
      closeLabel: 'Close',
    },
  },
  ja: {
    terms: {
      title: '利用規約',
      subtitle: 'サービスをご利用になる前にご確認ください。',
      updatedLabel: '最終更新',
      updatedAt: '2026-04-10',
      sections: [
        {
          heading: '1. サービス概要',
          bullets: [
            'SAA Cloud Prep は AWS SAA-C03 試験対策のための学習サービスです。',
            '問題生成、模擬試験、学習履歴、PDF出力機能を提供します。',
          ],
        },
        {
          heading: '2. 料金とサブスクリプション',
          bullets: [
            '有料プランは Lemon Squeezy を通じて月額課金されます。',
            'サブスクリプションは自動更新される場合があり、いつでも解約できます。',
            '料金、税金、請求内容は購入時の画面表示と領収書に従います。',
          ],
        },
        {
          heading: '3. ユーザーの義務',
          bullets: [
            'アカウント情報は正確に入力してください。',
            '他人のアカウントを無断で使用したり、サービス運営を妨げたりしてはいけません。',
            'コンテンツの無断複製、再販売、大量収集は禁止です。',
          ],
        },
        {
          heading: '4. 制限と変更',
          bullets: [
            '機能、料金、提供範囲は事前通知のうえ変更される場合があります。',
            '法令、セキュリティ、運用上の必要がある場合、サービスを一時停止することがあります。',
            'お問い合わせは artsociety931@gmail.com までご連絡ください。',
          ],
        },
      ],
      closeLabel: '閉じる',
    },
    privacy: {
      title: 'プライバシーポリシー',
      subtitle: '収集する情報と利用目的を説明します。',
      updatedLabel: '最終更新',
      updatedAt: '2026-04-10',
      sections: [
        {
          heading: '1. 収集する情報',
          bullets: [
            'メールアドレス、アカウント識別子、パスワードハッシュ、学習履歴を収集する場合があります。',
            '試験日、言語設定、支払い状態などの設定情報も保存されます。',
            'アクセスログ、端末情報、Cookie、ローカルストレージの情報が含まれることがあります。',
          ],
        },
        {
          heading: '2. 利用目的',
          bullets: [
            'アカウント管理、ログイン維持、学習統計の提供に使用します。',
            '問題生成、模擬試験、エラー分析、サービス改善に活用します。',
            '決済確認、購読管理、不正利用防止にも必要です。',
          ],
        },
        {
          heading: '3. 第三者提供',
          bullets: [
            'Firebase: 認証、保存、セッション管理。',
            'Lemon Squeezy: 決済、請求、税務、返金処理。',
            'Anthropic: AI問題生成リクエスト。',
          ],
        },
        {
          heading: '4. 保管と権利',
          bullets: [
            '法令または紛争対応に必要な期間のみ保管します。',
            '利用者は開示、訂正、削除を請求できます。',
            'artsociety931@gmail.com までご連絡ください。',
          ],
        },
      ],
      closeLabel: '閉じる',
    },
    refund: {
      title: '返金ポリシー',
      subtitle: 'デジタルサブスクリプション向けの返金基準です。',
      updatedLabel: '最終更新',
      updatedAt: '2026-04-10',
      sections: [
        {
          heading: '1. 基本方針',
          bullets: [
            'サブスクリプション型のデジタルサービスのため、利用済み期間の返金は原則として行いません。',
            '単なる気分変更、一部利用、未使用を理由とする返金は制限されることがあります。',
          ],
        },
        {
          heading: '2. 返金対象となる場合',
          bullets: [
            '重複請求、請求エラー、当社システム起因の未提供が確認された場合は返金を検討します。',
            'Lemon Squeezy は販売者の返金ポリシーを認めつつ、チャージバック防止のため購入後 60 日以内は裁量で返金できます。',
            '適用法令または Lemon Squeezy / 決済プロセッサの規定で返金が必要な場合はそれに従います。',
            '不正決済や無断決済の場合は追加確認が必要になることがあります。',
          ],
        },
        {
          heading: '3. 解約',
          bullets: [
            'サブスクリプションはいつでも解約できます。',
            '解約後は次回請求から更新されません。',
            '現在の請求期間は別途明記がない限り返金対象外となる場合があります。',
          ],
        },
        {
          heading: '4. 申請方法',
          bullets: [
            '注文番号、請求メール、申請理由を添えて artsociety931@gmail.com へご連絡ください。',
            'できるだけ早く確認してご案内します。',
          ],
        },
      ],
      closeLabel: '閉じる',
    },
    cookies: {
      title: 'クッキーポリシー',
      subtitle: 'サービス運営に必要な保存方式とCookieの利用方針です。',
      updatedLabel: '最終更新',
      updatedAt: '2026-04-10',
      sections: [
        {
          heading: '1. 使用する保存方式',
          bullets: [
            'ログイン維持、言語設定、テーマ設定のために Cookie または localStorage を使用することがあります。',
            '学習進捗、試験開始日、1日の利用回数管理にも使用されます。',
          ],
        },
        {
          heading: '2. 利用目的',
          bullets: [
            '基本機能の提供、セッション維持、ユーザー体験の向上のために使用します。',
            'エラー分析や品質改善のための解析情報が含まれることがあります。',
          ],
        },
        {
          heading: '3. 制御方法',
          bullets: [
            'ブラウザ設定から Cookie や保存データを削除・ブロックできます。',
            'ただし、一部機能が正常に動作しない場合があります。',
          ],
        },
      ],
      closeLabel: '閉じる',
    },
  },
};

interface LegalPolicyModalProps {
  locale: Locale;
  policy: LegalPolicyKey;
  onClose: () => void;
}

function LegalPolicyModal({ locale, policy, onClose }: LegalPolicyModalProps) {
  const copy = legalCopy[locale][policy];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(5, 10, 20, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(100%, 44rem)',
          maxHeight: '88vh',
          overflowY: 'auto',
          borderRadius: '1.25rem',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(180deg, rgba(15,22,41,0.98), rgba(10,16,30,0.98))',
          boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
          color: '#E5E7EB',
        }}
      >
        <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: '#FFB547', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {copy.updatedLabel} {copy.updatedAt}
              </p>
              <h2 style={{ margin: '0.5rem 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>
                {copy.title}
              </h2>
              <p style={{ margin: '0.75rem 0 0', color: '#CBD5E1', lineHeight: 1.6 }}>
                {copy.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={copy.closeLabel}
              style={{
                flex: '0 0 auto',
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '999px',
                border: '1px solid rgba(255,153,0,0.3)',
                background: 'rgba(255,153,0,0.1)',
                color: '#FFD18A',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ padding: '0.5rem 1.5rem 1rem' }}>
          {copy.sections.map((section) => (
            <section
              key={section.heading}
              style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: '1rem',
                border: '1px solid rgba(148,163,184,0.16)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                {section.heading}
              </h3>
              <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.1rem', color: '#CBD5E1', lineHeight: 1.7 }}>
                {section.bullets.map((bullet) => (
                  <li key={bullet} style={{ marginBottom: '0.45rem' }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.9rem 1rem',
              borderRadius: '0.9rem',
              border: '1px solid rgba(255,153,0,0.35)',
              background: 'linear-gradient(180deg, rgba(255,153,0,0.2), rgba(255,153,0,0.12))',
              color: '#FFF6E6',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {copy.closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const Footer: React.FC = () => {
  const { locale } = useLocale();
  const currentLocale: Locale = locale in footerCopy ? locale : 'en';
  const copy = footerCopy[currentLocale];
  const [activePolicy, setActivePolicy] = useState<LegalPolicyKey | null>(null);

  const styles = `
    footer{border-top:1px solid #2A344A;background:linear-gradient(180deg,#0A101E,#09101C);padding-top:1.5rem;padding-bottom:1.5rem;}
    .footer-inner{max-width:80rem;margin:0 auto;padding:0 1.5rem;}
    .footer-brand{margin-bottom:.9rem;}
    .footer-brand p{font-size:.92rem;color:#9CA3AF;margin-top:.45rem;line-height:1.5;}
    .footer-links{display:flex;gap:.75rem;flex-wrap:wrap;align-items:center;justify-content:center;margin-bottom:.75rem;}
    .footer-links button{font-size:.875rem;color:#D1D5DB;transition:all .15s;background:rgba(255,255,255,0.03);border:1px solid #2A344A;border-radius:999px;padding:.55rem .95rem;cursor:pointer;}
    .footer-links button:hover{color:#FFB547;border-color:rgba(255,153,0,0.45);background:rgba(255,153,0,0.08);}
    .footer-links button:focus{outline:2px solid rgba(255,153,0,0.35);outline-offset:2px;}
    .footer-bottom{border-top:1px solid #2A344A;padding-top:.9rem;}
    .footer-legal{font-size:.78rem;color:#94A3B8;text-align:center;line-height:1.6;}
  `;

  return (
    <>
      <style>{styles}</style>
      <footer>
        <div className="footer-inner">
          <div style={{ textAlign: 'center' }}>
            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem', justifyContent: 'center' }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '.25rem', background: '#FF9900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#0F1629" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.125rem' }}>{copy.brand}</span>
              </div>
              <p className="footer-brand">{copy.description}</p>
            </div>
            <div className="footer-links">
              <button type="button" onClick={() => setActivePolicy('terms')}>{copy.labels.terms}</button>
              <button type="button" onClick={() => setActivePolicy('privacy')}>{copy.labels.privacy}</button>
              <button type="button" onClick={() => setActivePolicy('refund')}>{copy.labels.refund}</button>
              <button type="button" onClick={() => setActivePolicy('cookies')}>{copy.labels.cookies}</button>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-legal">{copy.copyright}</p>
          </div>
        </div>
        {activePolicy && (
          <LegalPolicyModal
            locale={currentLocale}
            policy={activePolicy}
            onClose={() => setActivePolicy(null)}
          />
        )}
      </footer>
    </>
  );
};

export default Footer;
