const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const crypto = require('crypto');

const sqsClient = new SQSClient({ region: 'us-east-1' });
const SQS_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/973294444983/problem-generation-queue';
const { generatePrompt } = require('./prompts-server');
require('dotenv').config();

// PostgreSQL 풀 + Cognito JWT 미들웨어
const { query: pgQuery } = require('./lib/db');
const { requireAuth, requireAdmin, USE_COGNITO_AUTH } = require('./middleware/auth');

console.log('✅ Server starting (Cognito + PostgreSQL only, Firebase removed)');

const app = express();
const PORT = 5000;

// AWS SES 클라이언트 초기화
const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

// 보안 헤더 설정 (XSS, Clickjacking, MIME-sniffing 방지)
app.use(helmet());

// CORS 설정
app.use(cors({
  origin: [
    'https://prep4saa.com',
    'https://www.prep4saa.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

//??요청븘//설정
app.use((req, res, next) => {
  req.setTimeout(30000);  // 30초
  res.setTimeout(30000);
  next();
});

app.use(express.json({
  // 마이그레이션/대량 업로드 위해 50MB 까지 허용
  limit: '50mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

async function handleClaudeProxy(req, res) {
  try {
    const { model, max_tokens, messages } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('⚠️ ANTHROPIC_API_KEY not found in environment');
      return res.status(400).json({ error: { message: 'ANTHROPIC_API_KEY not found' } });
    }

    console.log('🚀  Sending request to Claude API:', { model, max_tokens });

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
      console.error('⚠️ Claude API Error:', error);
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    console.log('✅ Claude API Success');
    res.json(data);
  } catch (error) {
    console.error('⚠️ Proxy error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
}

// 추そ 메메서드사씤//吏//app.post('/api/claude', handleClaudeProxy);
app.post('/api/claudeProxy', handleClaudeProxy);

// ═════════════════════════════════════════════════════════════
// 🔒 SAA Problem Generation — 프롬프트 서버 보관 (클라이언트 노출 방지)
// 클라이언트는 services/difficulty/locale/domain만 전달.
// 서버가 프롬프트 생성 + Gemini/Claude 호출 + JSON 파싱까지 담당.
// ═════════════════════════════════════════════════════════════
async function callGeminiFromServer(prompt, maxTokens) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not found');

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: 1 },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API Error: ${error?.error?.message || response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callClaudeFromServer(prompt, maxTokens) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API Error: ${error?.error?.message || response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

app.post('/api/generateSAAProblem', async (req, res) => {
  try {
    const { services, difficulty, locale = 'ko', domain, theme } = req.body || {};
    if (!Array.isArray(services) || !difficulty) {
      return res.status(400).json({ error: { message: 'services(array) and difficulty are required' } });
    }

    // 서버에서 프롬프트 생성 (클라이언트에 노출 안 됨)
    const prompt = generatePrompt(services, difficulty, locale, domain, theme);

    let content;
    let source;

    // Gemini 우선, 실패 시 Claude 폴백
    try {
      content = await callGeminiFromServer(prompt, 3500);
      source = 'gemini';
    } catch (geminiError) {
      console.warn('⚠️ Gemini failed, falling back to Claude:', geminiError?.message);
      try {
        content = await callClaudeFromServer(prompt, 3500);
        source = 'claude';
      } catch (claudeError) {
        console.error('❌ Both Gemini and Claude failed');

        // AI 두 곳 모두 실패 시 SQS로 오류 알림 전송
        await sqsClient.send(new SendMessageCommand({
          QueueUrl: SQS_QUEUE_URL,
          MessageBody: JSON.stringify({
            type: 'ERROR',
            userId: req.body?.userId || 'unknown',
            errorMessage: `Gemini: ${geminiError?.message} | Claude: ${claudeError?.message}`,
            occurredAt: new Date().toISOString(),
          }),
        })).catch(sqsErr => console.error('❌ SQS 전송 실패:', sqsErr?.message));

        return res.status(500).json({
          error: { message: `Gemini: ${geminiError?.message} | Claude: ${claudeError?.message}` }
        });
      }
    }

    // 🚫 안전장치 1: AI가 프롬프트 무시하고 "7년"을 사용한 경우 자동 치환
    const replacementsKo = ['1년', '2년', '5년', '10년', '6개월', '90일'];
    const replacementsEn = ['1 year', '2 years', '5 years', '10 years', '6 months', '90 days'];
    const replacementsJa = ['1年', '2年', '5年', '10年', '6ヶ月', '90日'];
    const pickKo = () => replacementsKo[Math.floor(Math.random() * replacementsKo.length)];
    const pickEn = () => replacementsEn[Math.floor(Math.random() * replacementsEn.length)];
    const pickJa = () => replacementsJa[Math.floor(Math.random() * replacementsJa.length)];
    if (typeof content === 'string') {
      content = content.replace(/7\s*년/g, pickKo);
      content = content.replace(/\b7[\s-]?years?\b/gi, pickEn);
      content = content.replace(/seven\s+years?/gi, pickEn);
      content = content.replace(/7\s*年/g, pickJa);
    }

    // 🚫 안전장치 2: 컴플라이언스 표현 검증
    // 정답이 S3 Object Lock/Glacier/Lifecycle 관련이 아니면 보존/불변 표현 정화
    if (typeof content === 'string') {
      const isStorageLifecycleProblem = /Object\s*Lock|Glacier|Lifecycle|S3\s*Standard-IA|Intelligent-Tiering/i.test(content);
      if (!isStorageLifecycleProblem) {
        // 컴플라이언스 정형 표현을 중립적 표현으로 치환
        content = content.replace(/(\d+)\s*년\s*동안\s*변경\s*불가능[하한]?\s*(?:게|상태로)?\s*보존[되하한][어아여]?[야는]?\s*합니다\.?/g, '높은 가용성과 확장성이 요구됩니다.');
        content = content.replace(/(\d+)\s*년\s*동안\s*보존[되하한][어아여]?[야는]?\s*합니다\.?/g, '비용 효율적인 운영이 필요합니다.');
        content = content.replace(/변경\s*불가능[하한]?\s*(?:게|상태로)?\s*보존/g, '안정적으로 운영');
        content = content.replace(/불변[하한]?\s*(?:게|상태로)?\s*보관/g, '안정적으로 운영');
        content = content.replace(/데이터\s*무결성[을를]?\s*보장[하한]?[어아여]?[야는]?\s*합니다\.?/g, '신뢰성 높은 응답이 필요합니다.');
        content = content.replace(/감사\s*추적\s*기능[이가]?\s*[필요필수]+합니다\.?/g, '관찰 가능성이 중요합니다.');
        content = content.replace(/규정\s*준수[를을]?\s*위[해한]/g, '안정성을 위해');

        // 영어 동등 표현
        content = content.replace(/must be (?:retained|preserved|kept) (?:immutably|unchanged|in an immutable state) for \d+\s*years?/gi, 'must support high availability and scalability');
        content = content.replace(/data integrity must be guaranteed/gi, 'reliable response is required');
        content = content.replace(/audit trail is required/gi, 'observability is critical');
        content = content.replace(/regulatory compliance is mandatory/gi, 'high reliability is mandatory');

        // 일본어 동등 표현
        content = content.replace(/(\d+)\s*年間\s*(?:変更不可能に|不変に)\s*保存/g, '高可用性とスケーラビリティで運用');
        content = content.replace(/データ整合性[をが]?保証/g, '信頼性の高い応答を保証');
      }
    }

    // 🚫 안전장치 3: 가용성 수치 표현(99.9%, 99.99%)을 정성적 표현으로 치환
    if (typeof content === 'string') {
      content = content.replace(/99\.9{1,2}%\s*(?:이상의?\s*)?가용성/g, '고가용성');
      content = content.replace(/(?:guarantee|ensure|provide|achieve)\s+99\.9{1,2}%\s+availability/gi, 'guarantee high availability');
      content = content.replace(/99\.9{1,2}%\s*の?可用性/g, '高可用性');
    }

    res.json({ content, source });
  } catch (error) {
    console.error('❌ generateSAAProblem error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Gemini API 프록시 (보안: API 키는 서버에만 저장)
async function handleGeminiProxy(req, res) {
  try {
    const { prompt, maxTokens = 2000 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('⚠️ GEMINI_API_KEY not found in environment');
      return res.status(400).json({ error: { message: 'GEMINI_API_KEY not found' } });
    }

    console.log('🚀  Sending request to Gemini API');

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
      console.error('⚠️ Gemini API Error:', error);
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    console.log('✅ Gemini API Success');
    res.json(data);
  } catch (error) {
    console.error('⚠️ Gemini Proxy error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
}

app.post('/api/gemini', handleGeminiProxy);

app.post('/api/process2CheckoutPayment', async (req, res) => {
  try {
    const { email, fullName, amount, currency } = req.body;

    // ?㎦ 푸뒪//紐⑤메서드: 2Checkout API //?놁씠//응룞
    // ?꾨줈?뺤뀡: 2Checkout API //?요청슂
    const twoCheckoutApiKey = process.env.TWO_CHECKOUT_API_KEY;

    console.log('🚀  Processing 2Checkout payment:', { email, fullName, amount, currency });

    //푸뒪//紐⑤메서드: //긽 성공났
    if (!twoCheckoutApiKey) {
      console.log('?㎦ Test Mode: Simulating 2Checkout payment');
      return res.json({
        success: true,
        message: 'Test mode: Payment simulated successfully',
        transactionId: `TEST_${Date.now()}`,
      });
    }

    // ?꾨줈?뺤뀡: 설젣 2Checkout API ?몄텧
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
    console.error('⚠️ 2Checkout Payment Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed',
    });
  }
});

// Payment Intent Handler (Stripe - ?덇굅//
app.post('/api/createPaymentIntent', async (req, res) => {
  try {
    const { email, fullName, amount, currency } = req.body;

    // 푸뒪//紐⑤메서드: 설젣 Stripe ?듯빀 //백//덉씠//    // ?꾨줈?뺤뀡: Stripe SDK ?요청슂
    const stripeSecretKey = process.env.VITE_STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      // 푸뒪//紐⑤메서드: 메? clientSecret 諛섑솚
      const dummyClientSecret = `pi_test_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;

      return res.json({
        clientSecret: dummyClientSecret,
        status: 'test_mode',
        message: 'Test mode: Payment intent created (simulated)'
      });
    }

    // ?꾨줈?뺤뀡에꽌//설젣 Stripe API ?몄텧
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

    // 푸뒪//紐⑤메서드: ?먮윭 濡쒓퉭留//섑뻾
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

    // 설젣 연꼍에꽌//Firebase Cloud Function이굹 이찓//백퉬//?몄텧
    console.log('?벁 Error notification:', errorLog);

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

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: { message: 'Missing required fields' } });
    }

    // 연꼍蹂?섏뿉//?섏떊 이찓//媛?몄삤湲?(濡쒖쭅//?몄텧 X)
    const contactEmail = process.env.CONTACT_EMAIL;

    const contactData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      timestamp: timestamp || new Date().toISOString(),
      receivedAt: new Date().toISOString()
    };

    console.log('✅  //:', {
      senderName: contactData.name,
      senderEmail: contactData.email,
      subject: contactData.subject,
      timestamp: contactData.timestamp
    });

    // ?벁 Resend API瑜//ъ슜?섏뿬 이찓//?요청넚
    if (contactEmail && process.env.RESEND_API_KEY) {
      try {
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">습줈//臾몄쓽媛 ?요청갑?덉뒿습떎</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>諛쒖떊//</strong> ${contactData.name}</p>
              <p><strong>이찓//</strong> ${contactData.email}</p>
              <p><strong>백ぉ:</strong> ${contactData.subject}</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
              <p><strong>硫붿떆吏:</strong></p>
              <p style="white-space: pre-wrap;">${contactData.message}</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
              <p style="color: #666; font-size: 12px;">?섏떊 ?쒓컙: ${contactData.receivedAt}</p>
            </div>
          </div>
        `;

        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: contactEmail,
          subject: `//臾몄쓽: ${contactData.subject}`,
          html: htmlContent,
        });

        console.log(`?됵툘 Resend 이찓//諛쒖넚 ?꾨즺: ${contactEmail}`);
      } catch (emailError) {
        console.error('🚀송툘 Resend 이찓//諛쒖넚 실뙣:', emailError.message);
        // 이찓//諛쒖넚 실뙣이룄 이씪?댁뼵?몄뿉//성공났 응떟 ?요청넚
      }
    }

    // ?뾼截?Firebase//臾몄쓽 ?//(?좏깮?ы빆)
    // await saveContactToFirebase(contactData);

    // 성공났 응떟
    res.json({
      status: 'success',
      message: 'Contact message received. We will reply soon.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('⚠️ Contact form error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// ===== Admin 寃利?=====

// Admin check (보안: 백쾭에꽌留?泥섎━)
app.post('/api/checkAdmin', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({ isAdmin: false, timestamp: new Date().toISOString() });
    }

    const result = await pgQuery(
      `SELECT role FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );

    const isAdmin = result.rows[0]?.role === 'admin';
    console.log('Admin check:', { email, isAdmin });

    res.json({ isAdmin, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin route guard
// - USE_COGNITO_AUTH=true: requireAuth (JWT) + requireAdmin (role check)
// - USE_COGNITO_AUTH=false: legacy fallback by email body
app.use('/api/admin/', async (req, res, next) => {
  if (USE_COGNITO_AUTH) {
    return requireAuth(req, res, () => requireAdmin(req, res, next));
  }
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(403).json({ error: { message: 'Email required' }, isAdmin: false });
    }
    const result = await pgQuery(
      `SELECT role FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    if (result.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Admin access required' }, isAdmin: false });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin ?듦퀎 議고쉶 (愿由ъ옄 ?요청슜)
// Admin: 전체 통계 (PostgreSQL)
app.post('/api/admin/stats', async (req, res) => {
  try {
    const result = await pgQuery(
      `SELECT
         COUNT(*) AS total_users,
         COUNT(CASE WHEN is_premium THEN 1 END) AS paid_users,
         COUNT(CASE WHEN NOT is_premium THEN 1 END) AS free_users,
         COUNT(CASE WHEN role = 'admin' THEN 1 END) AS admin_users
       FROM users`
    );
    const r = result.rows[0] || {};
    res.json({
      totalUsers: parseInt(r.total_users || 0),
      paidUsers: parseInt(r.paid_users || 0),
      freeUsers: parseInt(r.free_users || 0),
      adminUsers: parseInt(r.admin_users || 0),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('admin/stats error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin: 모든 사용자 목록 (PostgreSQL)
app.post('/api/admin/users', async (req, res) => {
  try {
    const result = await pgQuery(
      `SELECT id, cognito_sub, email, display_name, role, is_premium,
              premium_until, exam_start_date, streak,
              created_at, last_login_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 1000`
    );
    res.json({ users: result.rows, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('admin/users error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin: 특정 사용자의 문제 풀이 세션 (PostgreSQL)
app.post('/api/admin/user/sessions', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: { message: 'userId is required' } });

    const userRow = await pgQuery(
      `SELECT id FROM users WHERE email = $1 OR cognito_sub = $1 LIMIT 1`,
      [String(userId)]
    );
    if (!userRow.rows[0]) return res.json({ sessions: [], timestamp: new Date().toISOString() });
    const internalUserId = userRow.rows[0].id;

    const result = await pgQuery(
      `SELECT session_id, full_problem, difficulty, is_correct,
              user_answer, created_at,
              EXTRACT(EPOCH FROM created_at)*1000 AS timestamp_ms
       FROM quiz_results
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 500`,
      [internalUserId]
    );
    res.json({ sessions: result.rows, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('admin/user/sessions error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});


// Admin Console: 백쾭 紐낅졊//실뻾 (admin ?요청슜)
app.post('/api/admin/console', (req, res) => {
  const { exec } = require('child_process');
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'command is required' });
    }
    // 紐낅졊//湲몄씠 ?쒗븳
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

// 문제 생성 기록 저장 (백엔드)
app.post('/api/recordProblemGeneration', async (req, res) => {
  try {
    const { userId, problem } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // DynamoDB에 카운트 증가
    const userType = req.body.userStatus === 'paid' ? 'premium' : 'loggedIn';
    const apiUrl = `https://1k4zw2bkhk.execute-api.us-east-1.amazonaws.com/prod/count/${encodeURIComponent(userId)}`;
    const countResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userType })
    });
    const countData = await countResponse.json();

    if (countResponse.status === 429) {
      return res.status(429).json({ error: 'Daily limit reached', ...countData });
    }

    console.log(`✅ Problem recorded: ${countData.count}/${countData.limit} today (userId: ${userId})`);

    // 문제를 PostgreSQL quiz_results 에 저장
    // - userId 는 email 또는 cognito_sub
    // - users 테이블 lookup 후 internal id 사용
    if (problem) {
      const today = new Date().toISOString().split('T')[0];
      const sessionId = `${today}_session`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h TTL

      // userId 가 email 인지 cognito_sub 인지 자동 판별
      const userRow = await pgQuery(
        `SELECT id FROM users WHERE email = $1 OR cognito_sub = $1 LIMIT 1`,
        [userId]
      );
      if (!userRow.rows[0]) {
        console.warn(`User not found in DB: ${userId}`);
        return res.json({ success: true, message: 'Recorded (user not synced yet)' });
      }
      const internalUserId = userRow.rows[0].id;

      await pgQuery(
        `INSERT INTO quiz_results
           (user_id, session_id, question_id, difficulty, full_problem, time_spent_seconds, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          internalUserId,
          sessionId,
          problem?.id || `gen-${Date.now()}`,
          problem?.difficulty || 'medium',
          problem,  // JSONB
          0,
          expiresAt,
        ]
      );
      console.log(`✅ Problem saved to PostgreSQL quiz_results (userId: ${userId})`);
    }

    return res.json({ success: true, message: 'Problem generation recorded' });
  } catch (error) {
    console.error('❌ Error recording problem generation:', error);
    return res.status(500).json({ error: error.message || 'Failed to record problem generation' });
  }
});

// 오늘 생성한 문제 개수 조회 (DynamoDB via API Gateway)
app.post('/api/getProblemCountToday', async (req, res) => {
  try {
    const { userId, userStatus } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // 상태별 제한
    let limit = 2;
    if (userStatus === 'paid') limit = 20;

    // DynamoDB에서 오늘 카운트 조회
    const apiUrl = `https://1k4zw2bkhk.execute-api.us-east-1.amazonaws.com/prod/count/${encodeURIComponent(userId)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const count = data.count || 0;

    console.log(`📊 Today's problem count for ${userId}: ${count}/${limit}`);

    return res.json({
      count: count,
      limit: limit,
      canGenerate: count < limit
    });
  } catch (error) {
    console.error('❌ Error getting problem count:', error);
    return res.json({ count: 0, limit: 20, canGenerate: true });
  }
});

// 사용자의 문제 세션 조회 (PDF 다운로드용) - PostgreSQL
app.post('/api/getUserProblemSessions', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    // user 조회 (email 또는 cognito_sub)
    const userRow = await pgQuery(
      `SELECT id FROM users WHERE email = $1 OR cognito_sub = $1 LIMIT 1`,
      [userId]
    );
    if (!userRow.rows[0]) return res.json([]);
    const internalUserId = userRow.rows[0].id;

    // 만료 안 된 quiz_results 조회 (session_id 별 그룹)
    const result = await pgQuery(
      `SELECT session_id, full_problem, difficulty, created_at,
              EXTRACT(EPOCH FROM created_at)*1000 AS timestamp_ms
       FROM quiz_results
       WHERE user_id = $1
         AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY created_at DESC`,
      [internalUserId]
    );

    // session_id 별로 그룹화
    const sessionMap = new Map();
    for (const row of result.rows) {
      if (!sessionMap.has(row.session_id)) {
        sessionMap.set(row.session_id, []);
      }
      sessionMap.get(row.session_id).push(row);
    }

    // 세션별 포맷
    const sessions = Array.from(sessionMap.entries()).map(([sessionId, rows]) => {
      const first = rows[0];
      const date = new Date(first.created_at);
      const dateStr = date.toLocaleDateString('ko-KR');
      const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      return {
        date: dateStr,
        time: timeStr,
        problemCount: rows.length,
        difficulty: first.difficulty,
        problems: rows.map(r => r.full_problem),
        sessionTimestamp: Number(first.timestamp_ms),
      };
    });

    sessions.sort((a, b) => b.sessionTimestamp - a.sessionTimestamp);

    console.log(`✅ Retrieved ${sessions.length} problem sessions for user ${userId}`);
    return res.json(sessions);
  } catch (error) {
    console.error('❌ Error getting problem sessions:', error);
    return res.status(500).json({ error: error.message || 'Failed' });
  }
});

// 사용자의 퀴즈 통계 조회 (현황 탭용)
app.post('/api/getQuizStats', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const userRow = await pgQuery(
      `SELECT id FROM users WHERE email = $1 OR cognito_sub = $1 LIMIT 1`,
      [userId]
    );
    if (!userRow.rows[0]) {
      return res.json({ totalAttempts: 0, correctCount: 0, accuracy: 0, byService: {} });
    }
    const internalUserId = userRow.rows[0].id;

    // 만료 안 된 quiz_results
    const result = await pgQuery(
      `SELECT is_correct, full_problem
       FROM quiz_results
       WHERE user_id = $1
         AND (expires_at IS NULL OR expires_at > NOW())`,
      [internalUserId]
    );

    let totalAttempts = 0;
    let correctCount = 0;
    const byService = {};

    for (const row of result.rows) {
      totalAttempts++;
      if (row.is_correct === true) correctCount++;

      const keywords = row.full_problem?.keywords;
      if (Array.isArray(keywords) && keywords.length > 0) {
        const service = keywords[0];
        if (!byService[service]) {
          byService[service] = { total: 0, correct: 0, accuracy: 0 };
        }
        byService[service].total++;
        if (row.is_correct === true) byService[service].correct++;
      }
    }

    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    Object.keys(byService).forEach((service) => {
      const t = byService[service].total;
      byService[service].accuracy = t > 0 ? Math.round((byService[service].correct / t) * 100) : 0;
    });

    return res.json({ totalAttempts, correctCount, accuracy, byService });
  } catch (error) {
    console.error('❌ Error getting quiz stats:', error);
    return res.json({ totalAttempts: 0, correctCount: 0, accuracy: 0, byService: {} });
  }
});

// 퀴즈 결과 저장 (정답/오답 기록)
app.post('/api/recordQuizResult', async (req, res) => {
  try {
    const { userId, problem, selectedAnswer, difficulty, sessionId } = req.body;
    if (!userId || !problem) {
      return res.status(400).json({ error: 'userId and problem are required' });
    }

    const isCorrect = selectedAnswer === problem.answer;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // user 조회
    const userRow = await pgQuery(
      `SELECT id FROM users WHERE email = $1 OR cognito_sub = $1 LIMIT 1`,
      [userId]
    );
    if (!userRow.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    const internalUserId = userRow.rows[0].id;

    // quiz_results INSERT
    // - full_problem JSONB: 모든 문제 데이터 + 사용자 응답까지 한 번에 저장
    //   (Firestore 의 개별 컬럼들 → JSONB 통합으로 단순화)
    const enrichedProblem = {
      ...problem,
      userAnswer: selectedAnswer,
      isCorrect,
    };

    await pgQuery(
      `INSERT INTO quiz_results
         (user_id, session_id, question_id, difficulty, full_problem,
          user_answer, is_correct, time_spent_seconds, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        internalUserId,
        sessionId || `${new Date().toISOString().split('T')[0]}_session`,
        problem?.id || `gen-${Date.now()}`,
        difficulty || 'medium',
        enrichedProblem,
        selectedAnswer || null,
        isCorrect,
        0,
        expiresAt,
      ]
    );

    console.log(`📝 Quiz result saved: ${isCorrect ? '✅' : '❌'} (user: ${userId})`);
    return res.json({ success: true, isCorrect });
  } catch (error) {
    console.error('❌ Error recording quiz result:', error);
    return res.status(500).json({ error: error.message || 'Failed' });
  }
});

// ===== 기출문제 (Past Exams) - PostgreSQL =====

// 기출문제 페이지 조회 (locale 별 페이지네이션)
app.post('/api/getPastExamPage', async (req, res) => {
  try {
    const { locale = 'ko', page = 1, pageSize = 10 } = req.body;
    const offset = Math.max(0, (page - 1) * pageSize);

    const result = await pgQuery(
      `SELECT id, order_num, problem_data
       FROM past_exams
       WHERE locale = $1
       ORDER BY order_num ASC
       LIMIT $2 OFFSET $3`,
      [locale, pageSize, offset]
    );

    const problems = result.rows.map(r => ({
      id: String(r.id),
      order: r.order_num,
      ...r.problem_data,
    }));
    return res.json({ problems });
  } catch (error) {
    console.error('getPastExamPage error:', error);
    return res.status(500).json({ error: error.message, problems: [] });
  }
});

// 기출문제 총 개수
app.post('/api/getPastExamTotalCount', async (req, res) => {
  try {
    const { locale = 'ko' } = req.body;
    const result = await pgQuery(
      `SELECT COUNT(*) AS total FROM past_exams WHERE locale = $1`,
      [locale]
    );
    return res.json({ total: parseInt(result.rows[0]?.total || 0) });
  } catch (error) {
    console.error('getPastExamTotalCount error:', error);
    return res.json({ total: 0 });
  }
});

// ===== 모의시험 (Mock Exams) - PostgreSQL =====

// 오늘의 모의시험 조회
app.post('/api/getTodayMockExam', async (req, res) => {
  try {
    const { userId, locale = 'ko' } = req.body;
    if (!userId) return res.json({ problems: null });

    const userRow = await pgQuery(
      `SELECT id FROM users WHERE email = $1 OR cognito_sub = $1 LIMIT 1`,
      [userId]
    );
    if (!userRow.rows[0]) return res.json({ problems: null });
    const internalUserId = userRow.rows[0].id;

    const result = await pgQuery(
      `SELECT problems, answers, results, started_at, completed_at
       FROM mock_exams
       WHERE user_id = $1 AND locale = $2 AND exam_date = CURRENT_DATE`,
      [internalUserId, locale]
    );

    if (!result.rows[0]) return res.json({ problems: null });
    return res.json({
      problems: result.rows[0].problems || null,
      answers: result.rows[0].answers || [],
      results: result.rows[0].results,
      startedAt: result.rows[0].started_at,
      completedAt: result.rows[0].completed_at,
    });
  } catch (error) {
    console.error('getTodayMockExam error:', error);
    return res.json({ problems: null });
  }
});

// 모의시험 점진적 저장 (배치마다 호출)
app.post('/api/saveMockExamProblems', async (req, res) => {
  try {
    const { userId, locale = 'ko', problems = [], answers = [] } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const userRow = await pgQuery(
      `SELECT id FROM users WHERE email = $1 OR cognito_sub = $1 LIMIT 1`,
      [userId]
    );
    if (!userRow.rows[0]) return res.status(404).json({ error: 'User not found' });
    const internalUserId = userRow.rows[0].id;

    await pgQuery(
      `INSERT INTO mock_exams (user_id, locale, exam_date, problems, answers)
       VALUES ($1, $2, CURRENT_DATE, $3, $4)
       ON CONFLICT (user_id, locale, exam_date) DO UPDATE
       SET problems = EXCLUDED.problems,
           answers  = COALESCE($4, mock_exams.answers)`,
      [internalUserId, locale, JSON.stringify(problems), JSON.stringify(answers)]
    );

    return res.json({ saved: problems.length });
  } catch (error) {
    console.error('saveMockExamProblems error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 모의시험 종료 + 결과 저장
app.post('/api/completeMockExam', async (req, res) => {
  try {
    const { userId, locale = 'ko', answers, results } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const userRow = await pgQuery(
      `SELECT id FROM users WHERE email = $1 OR cognito_sub = $1 LIMIT 1`,
      [userId]
    );
    if (!userRow.rows[0]) return res.status(404).json({ error: 'User not found' });

    await pgQuery(
      `UPDATE mock_exams
       SET answers = $1, results = $2, completed_at = NOW()
       WHERE user_id = $3 AND locale = $4 AND exam_date = CURRENT_DATE`,
      [JSON.stringify(answers || []), JSON.stringify(results || {}), userRow.rows[0].id, locale]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('completeMockExam error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ===== Firebase → PostgreSQL 마이그레이션 트리거 (일회성) =====
// 실행: POST /api/migrate-firebase-to-pg { type: 'pastExams' | 'all' }
// - server.js 에 firebase-admin 이 없으면 사용자가 보낸 데이터 받아서 INSERT
app.post('/api/migrate-firebase-to-pg', async (req, res) => {
  try {
    const { type, locale = 'ko', items = [] } = req.body;
    if (!type) return res.status(400).json({ error: 'type required' });

    if (type === 'pastExams') {
      console.log(`[migrate] starting pastExams ${locale}: ${items.length} items`);

      const pool = require('./lib/db').getPool();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`DELETE FROM past_exams WHERE locale = $1`, [locale]);

        // batch INSERT (한 번의 query 로 모든 row)
        // - 큰 batch 는 parameter 한도 (~32K) 초과 가능 → 50개씩 chunk
        const CHUNK = 50;
        let inserted = 0;
        for (let i = 0; i < items.length; i += CHUNK) {
          const chunk = items.slice(i, i + CHUNK);
          const values = [];
          const params = [];
          chunk.forEach((item, idx) => {
            const order = item.order || (inserted + idx + 1);
            const { id: _id, order: _order, ...problemData } = item;
            const base = idx * 3;
            values.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
            params.push(locale, order, problemData);
          });
          await client.query(
            `INSERT INTO past_exams (locale, order_num, problem_data) VALUES ${values.join(',')}`,
            params
          );
          inserted += chunk.length;
          console.log(`[migrate] inserted ${inserted}/${items.length}`);
        }

        await client.query('COMMIT');
        console.log(`[migrate] DONE pastExams ${locale}: ${inserted}`);
        return res.json({ migrated: inserted, locale });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    return res.status(400).json({ error: `Unknown type: ${type}` });
  } catch (error) {
    console.error('migration error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 기출문제 일괄 업로드 (admin 전용)
// - 모의시험 → 기출문제 이전 시 호출
app.post('/api/uploadPastExams', async (req, res) => {
  // admin 인증 확인 (legacy or Cognito)
  if (USE_COGNITO_AUTH) {
    return requireAuth(req, res, () => requireAdmin(req, res, () => uploadPastExamsHandler(req, res)));
  }
  return uploadPastExamsHandler(req, res);
});

async function uploadPastExamsHandler(req, res) {
  try {
    const { locale = 'ko', problems = [] } = req.body;
    if (!Array.isArray(problems) || problems.length === 0) {
      return res.status(400).json({ error: 'problems[] required' });
    }

    // 다음 order_num 시작값 = 현재 max + 1
    const maxResult = await pgQuery(
      `SELECT COALESCE(MAX(order_num), 0) AS max_order FROM past_exams WHERE locale = $1`,
      [locale]
    );
    let nextOrder = parseInt(maxResult.rows[0].max_order) + 1;

    // 트랜잭션으로 일괄 INSERT
    const client = await require('./lib/db').getPool().connect();
    let uploaded = 0;
    try {
      await client.query('BEGIN');
      for (const p of problems) {
        await client.query(
          `INSERT INTO past_exams (locale, order_num, problem_data)
           VALUES ($1, $2, $3)`,
          [locale, nextOrder, p]
        );
        nextOrder++;
        uploaded++;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return res.json({ uploaded, totalAfter: nextOrder - 1 });
  } catch (error) {
    console.error('uploadPastExams error:', error);
    return res.status(500).json({ error: error.message });
  }
}

//Lemon Squeezy Checkout API
app.post('/api/lemonsqueezy/checkout', (req, res) => {
  // TODO Phase 7: PostgreSQL users.is_premium 변환 + LemonSqueezy webhook
  res.status(503).json({
    error: {
      message: 'Payment is being migrated to PostgreSQL. Coming soon.',
    },
  });
});

/**
 * //이찓//寃利?留곹겕 諛쒖넚
 * 푸썝媛////사슜에뿉寃//뺤씤 硫붿씪 諛쒖넚
 */
app.post('/api/send-verification-email', (req, res) => {
  // Cognito 가 가입 시 자동으로 verification 이메일 발송
  // 이 endpoint 는 Phase 6 에서 deprecated
  res.status(410).json({
    error: {
      message: 'Deprecated. Cognito sends verification email automatically on signup.',
    },
  });
});

app.post('/api/lemonsqueezy/cancel-subscription', (req, res) => {
  // TODO Phase 7
  res.status(503).json({
    error: { message: 'Payment is being migrated to PostgreSQL. Coming soon.' },
  });
});

app.post('/api/webhooks/lemon-squeezy', (req, res) => {
  // TODO Phase 7: webhook -> PostgreSQL users.is_premium update
  console.log('LemonSqueezy webhook received (no-op during migration)');
  res.status(200).json({ received: true });
});

// Start server on port 5000
const server = app.listen(PORT, () => {
  console.log(`//Proxy server running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/checkAdmin`);
  console.log(`   Contact API: http://localhost:${PORT}/api/contact`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`//Port ${PORT} is already in use`);
    console.error('   Try: taskkill /F /IM node.exe');
    process.exit(1);
  } else {
    console.error(`//Server error: ${err.message}`);
    process.exit(1);
  }
});
