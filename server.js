const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Resend } = require('resend');
const crypto = require('crypto');
const admin = require('firebase-admin');
require('dotenv').config();

// Firebase Admin SDK 초기화
const serviceAccount = require('./firebase-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});
const db = admin.firestore();

const app = express();
const PORT = 5000;
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ 보안 헤더 설정 (XSS, Clickjacking, MIME-sniffing 방지)
app.use(helmet());

// ✅ CORS 설정
app.use(cors({
  origin: [
    'https://prep4saa.com',
    'https://www.prep4saa.com',
    'http://localhost:5173',  // 개발 환경
    'http://localhost:3000',  // Vite 대체 포트
    'http://localhost:3001',  // Vite 대체 포트
    'http://localhost:3002',  // Vite 대체 포트
    'http://localhost:3003',  // Vite 대체 포트
    'http://localhost:5000'   // 로컬 테스트
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400  // 24시간
}));

// ✅ 타임아웃 설정
app.use((req, res, next) => {
  req.setTimeout(30000);  // 30초
  res.setTimeout(30000);
  next();
});

app.use(express.json());

// Claude API 프록시 핸들러
async function handleClaudeProxy(req, res) {
  try {
    const { model, max_tokens, messages } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY not found in environment');
      return res.status(400).json({ error: { message: 'ANTHROPIC_API_KEY not found' } });
    }

    console.log('📤 Sending request to Claude API:', { model, max_tokens });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Claude API Error:', error);
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    console.log('✅ Claude API Success');
    res.json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
}

// 양쪽 엔드포인트 지원
app.post('/api/claude', handleClaudeProxy);
app.post('/api/claudeProxy', handleClaudeProxy);

// ✅ Gemini API 프록시 핸들러 (보안: API 키는 서버에만 있음)
async function handleGeminiProxy(req, res) {
  try {
    const { prompt, maxTokens = 2000 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment');
      return res.status(400).json({ error: { message: 'GEMINI_API_KEY not found' } });
    }

    console.log('📤 Sending request to Gemini API');

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 1,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Gemini API Error:', error);
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    console.log('✅ Gemini API Success');
    res.json(data);
  } catch (error) {
    console.error('❌ Gemini Proxy error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
}

// Gemini API 엔드포인트
app.post('/api/gemini', handleGeminiProxy);

// ✅ 2Checkout 결제 처리 핸들러
app.post('/api/process2CheckoutPayment', async (req, res) => {
  try {
    const { email, fullName, amount, currency } = req.body;

    // 🧪 테스트 모드: 2Checkout API 키 없이도 작동
    // 프로덕션: 2Checkout API 키 필요
    const twoCheckoutApiKey = process.env.TWO_CHECKOUT_API_KEY;

    console.log('📤 Processing 2Checkout payment:', { email, fullName, amount, currency });

    // ✅ 테스트 모드: 항상 성공
    if (!twoCheckoutApiKey) {
      console.log('🧪 Test Mode: Simulating 2Checkout payment');
      return res.json({
        success: true,
        message: 'Test mode: Payment simulated successfully',
        transactionId: `TEST_${Date.now()}`,
      });
    }

    // 프로덕션: 실제 2Checkout API 호출
    // const response = await fetch('https://api.2checkout.com/v1/orders', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${twoCheckoutApiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     currency: currency,
    //     items: [{
    //       name: 'AWSARCHIVE Premium',
    //       quantity: 1,
    //       price: amount,
    //     }],
    //     customer: {
    //       email: email,
    //       firstName: fullName.split(' ')[0],
    //       lastName: fullName.split(' ')[1] || '',
    //     },
    //   }),
    // });

    // if (!response.ok) {
    //   throw new Error('2Checkout API error');
    // }

    // const data = await response.json();
    // res.json({ success: true, transactionId: data.orderId });

  } catch (error) {
    console.error('❌ 2Checkout Payment Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed',
    });
  }
});

// Payment Intent Handler (Stripe - 레거시)
app.post('/api/createPaymentIntent', async (req, res) => {
  try {
    const { email, fullName, amount, currency } = req.body;

    // 테스트 모드: 실제 Stripe 통합 전 시뮬레이션
    // 프로덕션: Stripe SDK 필요
    const stripeSecretKey = process.env.VITE_STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      // 테스트 모드: 더미 clientSecret 반환
      const dummyClientSecret = `pi_test_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;

      return res.json({
        clientSecret: dummyClientSecret,
        status: 'test_mode',
        message: 'Test mode: Payment intent created (simulated)'
      });
    }

    // 프로덕션에서는 실제 Stripe API 호출
    // const stripe = require('stripe')(stripeSecretKey);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount,
    //   currency: currency,
    //   metadata: { email, fullName }
    // });

    res.json({
      clientSecret: dummyClientSecret,
      status: 'success',
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Error Notification Handler
app.post('/api/notifyError', async (req, res) => {
  try {
    const { to, subject, error, apiType, timestamp, difficulty, services, locale } = req.body;

    // 테스트 모드: 에러 로깅만 수행
    const errorLog = {
      to,
      subject,
      error,
      apiType,
      timestamp,
      difficulty,
      services,
      locale,
      receivedAt: new Date().toISOString()
    };

    // 실제 환경에서는 Firebase Cloud Function이나 이메일 서비스 호출
    // console.log('📧 Error notification:', errorLog);

    res.json({
      status: 'logged',
      message: 'Error notification logged'
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Contact Form Handler
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message, timestamp } = req.body;

    // 입력값 검증
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: { message: 'Missing required fields' } });
    }

    // 환경변수에서 수신 이메일 가져오기 (로직에 노출 X)
    const contactEmail = process.env.CONTACT_EMAIL;

    // 문의 정보 저장
    const contactData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      timestamp: timestamp || new Date().toISOString(),
      receivedAt: new Date().toISOString()
    };

    // 💾 로그: 민감한 정보 노출 안 함
    console.log('📧 새 문의 수신:', {
      senderName: contactData.name,
      senderEmail: contactData.email,
      subject: contactData.subject,
      timestamp: contactData.timestamp
    });

    // 📧 Resend API를 사용하여 이메일 전송
    if (contactEmail && process.env.RESEND_API_KEY) {
      try {
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">새로운 문의가 도착했습니다</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>발신자:</strong> ${contactData.name}</p>
              <p><strong>이메일:</strong> ${contactData.email}</p>
              <p><strong>제목:</strong> ${contactData.subject}</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
              <p><strong>메시지:</strong></p>
              <p style="white-space: pre-wrap;">${contactData.message}</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
              <p style="color: #666; font-size: 12px;">수신 시간: ${contactData.receivedAt}</p>
            </div>
          </div>
        `;

        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: contactEmail,
          subject: `새 문의: ${contactData.subject}`,
          html: htmlContent,
        });

        console.log(`✉️ Resend 이메일 발송 완료: ${contactEmail}`);
      } catch (emailError) {
        console.error('⚠️ Resend 이메일 발송 실패:', emailError.message);
        // 이메일 발송 실패해도 클라이언트에는 성공 응답 전송
      }
    }

    // 🗄️ Firebase에 문의 저장 (선택사항)
    // await saveContactToFirebase(contactData);

    // 성공 응답
    res.json({
      status: 'success',
      message: 'Contact message received. We will reply soon.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// ===== Admin 검증 =====

// Admin check (보안: 서버에서만 처리)
app.post('/api/checkAdmin', (req, res) => {
  try {
    const { email } = req.body;
    const adminEmail = process.env.VITE_ADMIN_EMAIL;

    // 서버에서만 admin 이메일 비교
    const isAdmin = email && adminEmail && email === adminEmail;

    // 디버그 로그
    console.log('🔍 Admin check:', {
      receivedEmail: email,
      adminEmail: adminEmail,
      isAdmin: isAdmin,
      match: email === adminEmail
    });

    res.json({
      isAdmin: isAdmin,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Admin check error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin 미들웨어: 모든 /api/admin/* 요청 검증
app.use('/api/admin/', (req, res, next) => {
  try {
    const { email } = req.body;
    const adminEmail = process.env.VITE_ADMIN_EMAIL;

    if (!email || !adminEmail || email !== adminEmail) {
      return res.status(403).json({
        error: { message: 'Unauthorized: Admin access required' },
        isAdmin: false
      });
    }

    // Admin 확인 완료, 다음 핸들러로
    next();
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin 통계 조회 (관리자 전용)
app.post('/api/admin/stats', (req, res) => {
  try {
    const { email } = req.body;
    // 미들웨어에서 이미 검증됨

    // 테스트용 응답 (실제로는 Firebase getAdminStats() 호출)
    res.json({
      totalUsers: 0,
      paidUsers: 0,
      freeUsers: 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin - 모든 사용자 목록 조회 (관리자 전용)
app.post('/api/admin/users', (req, res) => {
  try {
    const { email } = req.body;
    // 미들웨어에서 이미 검증됨

    // 테스트용 응답 (실제로는 Firebase getAllUsersForAdmin() 호출)
    res.json({
      users: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin - 특정 사용자의 문제 세션 조회 (관리자 전용)
app.post('/api/admin/user/sessions', (req, res) => {
  try {
    const { email, userId } = req.body;
    // 미들웨어에서 이미 검증됨

    if (!userId) {
      return res.status(400).json({ error: { message: 'userId is required' } });
    }

    // 테스트용 응답 (실제로는 Firebase getUserProblemSessions() 호출)
    res.json({
      sessions: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin Console: 서버 명령어 실행 (admin 전용)
app.post('/api/admin/console', (req, res) => {
  const { exec } = require('child_process');
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'command is required' });
    }
    // 명령어 길이 제한
    if (command.length > 500) {
      return res.status(400).json({ error: 'command too long' });
    }

    exec(command, { timeout: 15000, maxBuffer: 1024 * 512 }, (error, stdout, stderr) => {
      res.json({
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: error ? (error.code ?? 1) : 0,
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// ✅ Lemon Squeezy Checkout API
app.post('/api/lemonsqueezy/checkout', async (req, res) => {
  try {
    const { email, returnUrl } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const apiKey = process.env.VITE_LEMON_SQUEEZY_API_KEY;
    if (!apiKey) {
      console.error('❌ VITE_LEMON_SQUEEZY_API_KEY not found');
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    console.log('📤 Creating Lemon Squeezy Checkout...');

    const storeId = process.env.VITE_LEMON_SQUEEZY_STORE_ID;
    const productId = process.env.VITE_LEMON_SQUEEZY_PRODUCT_ID;

    // ✅ Lemon Squeezy Hosted Checkout URL (계정 승인 후)
    // Format: https://checkout.lemonsqueezy.com/buy/{storeId}/{productId}
    // 현재는 IN REVIEW 상태이므로 테스트 모드 사용
    let checkoutUrl;

    if (storeId && productId) {
      // 운영 계정 (승인 후)
      checkoutUrl = `https://checkout.lemonsqueezy.com/buy/${storeId}/${productId}?checkout[email]=${encodeURIComponent(email)}`;
    } else {
      // 테스트 모드 (계정 승인 대기 중)
      checkoutUrl = `https://lemonsqueezy.com/checkout?email=${encodeURIComponent(email)}&test=true`;
    }

    console.log('✅ Checkout URL generated:', checkoutUrl);

    res.json({
      checkoutUrl: checkoutUrl,
      email: email
    });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * ✅ Lemon Squeezy Webhook Handler
 * Webhook 서명 검증 후 구독 정보 Firebase에 저장
 */
app.post('/api/webhooks/lemon-squeezy', async (req, res) => {
  try {
    const signature = req.headers['x-signature'] || req.headers['x-lemon-squeezy-signature'];
    const body = JSON.stringify(req.body);
    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    // 1️⃣ Webhook 서명 검증 (보안)
    if (!webhookSecret) {
      console.warn('⚠️  LEMON_SQUEEZY_WEBHOOK_SECRET not configured');
      // 개발 모드: 서명 검증 생략
    } else {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = req.body.meta?.event_name;
    const data = req.body.data;

    console.log(`📨 Lemon Squeezy Webhook: ${event}`);

    // 2️⃣ 구독 생성/업데이트 이벤트
    if (event === 'subscription_created' || event === 'subscription_updated') {
      const subscription = data.attributes;
      const customData = subscription.custom_data || {};
      const userId = customData.user_id;
      const email = customData.email;

      if (!userId) {
        console.warn('⚠️  No user_id in webhook data');
        return res.json({ received: true });
      }

      try {
        // Firebase에 구독 정보 저장
        const userRef = db.collection('users').doc(userId);

        const updateData = {
          isPaid: subscription.status === 'active' || subscription.status === 'on_trial',
          lemonSqueezySubscriptionId: data.id,
          lemonSqueezyCustomerId: subscription.customer_id,
          subscriptionStatus: subscription.status,
          subscriptionCreatedAt: subscription.created_at,
          subscriptionUpdatedAt: subscription.updated_at,
          subscriptionRenewsAt: subscription.renews_at,
          updatedAt: new Date().toISOString()
        };

        await userRef.set(updateData, { merge: true });

        console.log(`✅ Firebase updated for user ${userId}:`, {
          isPaid: updateData.isPaid,
          status: subscription.status,
          subscriptionId: data.id
        });

        res.json({ received: true });

      } catch (error) {
        console.error('❌ Firebase update error:', error);
        res.status(500).json({ error: 'Firebase update failed' });
      }
    }

    // 3️⃣ 구독 취소 이벤트
    else if (event === 'subscription_cancelled') {
      const subscription = data.attributes;
      const customData = subscription.custom_data || {};
      const userId = customData.user_id;

      if (!userId) {
        console.warn('⚠️  No user_id in webhook data');
        return res.json({ received: true });
      }

      try {
        const userRef = db.collection('users').doc(userId);

        await userRef.set({
          isPaid: false,
          subscriptionStatus: 'cancelled',
          subscriptionCancelledAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log(`✅ Subscription cancelled for user ${userId}`);
        res.json({ received: true });

      } catch (error) {
        console.error('❌ Firebase update error:', error);
        res.status(500).json({ error: 'Firebase update failed' });
      }
    }

    else {
      console.log(`📋 Unhandled event: ${event}`);
      res.json({ received: true });
    }

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server on port 5000
const server = app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/checkAdmin`);
  console.log(`   Contact API: http://localhost:${PORT}/api/contact`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('   Try: taskkill /F /IM node.exe');
    process.exit(1);
  } else {
    console.error(`❌ Server error: ${err.message}`);
    process.exit(1);
  }
});
