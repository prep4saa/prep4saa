const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const crypto = require('crypto');
const admin = require('firebase-admin');
require('dotenv').config();

function loadFirebaseServiceAccount() {
  // Try environment variable first
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', error?.message || error);
      throw error;
    }
  }

  // Fallback to firebase-key.json file
  try {
    return require('./firebase-key.json');
  } catch (error) {
    throw new Error('❌ FIREBASE_SERVICE_ACCOUNT not found. Set environment variable or include firebase-key.json file.');
  }
}

const serviceAccount = loadFirebaseServiceAccount();
console.log('🔐 Firebase service account loaded:', {
  projectId: serviceAccount.project_id,
  clientEmail: serviceAccount.client_email,
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});
const db = admin.firestore();

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
app.post('/api/checkAdmin', (req, res) => {
  try {
    const { email } = req.body;
    const adminEmail = process.env.VITE_ADMIN_EMAIL;

    // 백쾭에꽌留?admin 이찓//鍮꾧탳
    const isAdmin = email && adminEmail && email === adminEmail;

    // 메쾭洹?濡쒓렇
    console.log('?뵇 Admin check:', {
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
    console.error('⚠️ Admin check error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

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

    // Admin ?뺤씤 ?꾨즺, 설쓬 ?몃뱾?щ줈
    next();
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin ?듦퀎 議고쉶 (愿由ъ옄 ?요청슜)
app.post('/api/admin/stats', (req, res) => {
  try {
    const { email } = req.body;
    // 誘몃뱾?⑥뼱에꽌 이? 寃利앸맖

    // 푸뒪?몄슜 응떟 (설젣濡백뒗 Firebase getAdminStats() ?몄텧)
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

// Admin - 紐⑤뱺 사슜//紐⑸줉 議고쉶 (愿由ъ옄 ?요청슜)
app.post('/api/admin/users', (req, res) => {
  try {
    const { email } = req.body;
    // 誘몃뱾?⑥뼱에꽌 이? 寃利앸맖

    // 푸뒪?몄슜 응떟 (설젣濡백뒗 Firebase getAllUsersForAdmin() ?몄텧)
    res.json({
      users: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin - ?뱀젙 사슜에쓽 臾몄젣 ?몄뀡 議고쉶 (愿由ъ옄 ?요청슜)
app.post('/api/admin/user/sessions', (req, res) => {
  try {
    const { email, userId } = req.body;
    // 誘몃뱾?⑥뼱에꽌 이? 寃利앸맖

    if (!userId) {
      return res.status(400).json({ error: { message: 'userId is required' } });
    }

    // 푸뒪?몄슜 응떟 (설젣濡백뒗 Firebase getUserProblemSessions() ?몄텧)
    res.json({
      sessions: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
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

    const today = new Date().toISOString().split('T')[0];
    const dailyStatsRef = db.collection('users').doc(userId).collection('dailyStats').doc(today);
    const dailyStats = await dailyStatsRef.get();

    if (dailyStats.exists) {
      // 기존 기록 업데이트
      const newCount = (dailyStats.data().problemCount || 0) + 1;
      await dailyStatsRef.update({
        problemCount: newCount,
        lastGeneratedAt: new Date().toISOString()
      });
      console.log(`✅ Problem recorded: ${newCount} problems generated today (userId: ${userId})`);
    } else {
      // 새 기록 생성
      await dailyStatsRef.set({
        date: today,
        problemCount: 1,
        createdAt: new Date().toISOString(),
        lastGeneratedAt: new Date().toISOString()
      });
      console.log(`✅ First problem recorded today (userId: ${userId})`);
    }

    // 문제를 quizResults에 저장
    if (problem) {
      const timestamp = Date.now();
      const sessionId = `${today}_session`;
      const quizResultRef = db.collection('users').doc(userId).collection('quizResults').doc(`${timestamp}_${Math.random().toString(36).substr(2, 9)}`);

      await quizResultRef.set({
        sessionId: sessionId,
        timestamp: timestamp,
        date: today,
        difficulty: 'medium',
        fullProblem: problem,
        userAnswer: null,
        isCorrect: null,
        timeSpent: 0,
        expiresAt: new Date().getTime() + 24 * 60 * 60 * 1000  // 1일(24시간) 뒤 삭제
      });
      console.log(`✅ Problem saved to quizResults (userId: ${userId})`);
    }

    return res.json({ success: true, message: 'Problem generation recorded' });
  } catch (error) {
    console.error('❌ Error recording problem generation:', error);
    return res.status(500).json({ error: error.message || 'Failed to record problem generation' });
  }
});

// 오늘 생성한 문제 개수 조회 (보안: 서버에서 검증)
app.post('/api/getProblemCountToday', async (req, res) => {
  try {
    const { userId, userStatus } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const today = new Date().toISOString().split('T')[0];

    // 상태별 제한
    let limit = 2;
    if (userStatus === 'paid') {
      limit = 20;
    } else if (userStatus === 'loggedIn') {
      limit = 2;
    } else {
      limit = 2;
    }

    // quizResults 컬렉션에서 오늘 생성된 문제 개수 세기
    const resultsRef = db.collection('users').doc(userId).collection('quizResults');
    const snapshot = await resultsRef.where('date', '==', today).get();

    const now = new Date().getTime();
    const validDocs = snapshot.docs.filter(doc => {
      const expiresAt = doc.data().expiresAt;
      return !expiresAt || expiresAt >= now;
    });

    const count = validDocs.length;

    console.log(`📊 Today's problem count for ${userId}: ${count}/${limit}`);

    return res.json({
      count: count,
      limit: limit,
      canGenerate: count < limit
    });
  } catch (error) {
    console.error('❌ Error getting problem count:', error);
    // Fallback: 허용하지만 로그에 에러 기록
    return res.json({
      count: 0,
      limit: 20,
      canGenerate: true
    });
  }
});

// 사용자의 문제 세션 조회 (PDF 다운로드용)
app.post('/api/getUserProblemSessions', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const resultsRef = db.collection('users').doc(userId).collection('quizResults');
    const snapshot = await resultsRef.get();

    const now = new Date().getTime();

    // sessionId별로 그룹화
    const sessionMap = new Map();

    snapshot.forEach((doc) => {
      const data = doc.data();

      // 만료되지 않은 항목만 포함
      if (data.expiresAt && data.expiresAt < now) {
        return;
      }

      const sessionId = data.sessionId;
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, []);
      }
      sessionMap.get(sessionId).push({
        ...data,
        docId: doc.id
      });
    });

    // 날짜/시간별로 포맷
    const sessions = Array.from(sessionMap.entries()).map(([sessionId, problems]) => {
      const timestamp = problems[0].timestamp;
      const date = new Date(timestamp);
      const dateStr = date.toLocaleDateString('ko-KR');
      const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

      // fullProblem이 없으면 개별 필드들로부터 문제 객체 재구성
      const reconstructedProblems = problems.map(p => {
        if (p.fullProblem) {
          return p.fullProblem;
        }

        // fullProblem이 없으면 저장된 필드들로부터 재구성
        return {
          question: p.question || '',
          options: {
            A: p.optionA || '',
            B: p.optionB || '',
            C: p.optionC || '',
            D: p.optionD || ''
          },
          answer: p.correctAnswer || '',
          keywords: p.keywords || [],
          goal: p.goal || '',
          explanation: {
            correct: p.explanationCorrect || '',
            trap_A: p.explanationTrapA || '',
            trap_B: p.explanationTrapB || '',
            trap_C: p.explanationTrapC || '',
            trap_D: p.explanationTrapD || ''
          },
          easyMode: {
            explanation: p.easyModeExplanation || '',
            A: p.easyModeA || '',
            B: p.easyModeB || '',
            C: p.easyModeC || '',
            D: p.easyModeD || ''
          },
          patterns: p.patterns || []
        };
      });

      return {
        date: dateStr,
        time: timeStr,
        problemCount: problems.length,
        difficulty: problems[0].difficulty,
        problems: reconstructedProblems,
        sessionTimestamp: timestamp
      };
    });

    // 최신순 정렬
    const sortedSessions = sessions.sort((a, b) => b.sessionTimestamp - a.sessionTimestamp);

    console.log(`✅ Retrieved ${sortedSessions.length} problem sessions for user ${userId}`);

    return res.json(sortedSessions);
  } catch (error) {
    console.error('❌ Error getting problem sessions:', error);
    return res.status(500).json({ error: error.message || 'Failed to get problem sessions' });
  }
});

// 사용자의 퀴즈 통계 조회 (현황 탭용)
app.post('/api/getQuizStats', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const resultsRef = db.collection('users').doc(userId).collection('quizResults');
    const snapshot = await resultsRef.get();

    let totalAttempts = 0;
    let correctCount = 0;

    const now = new Date().getTime();

    snapshot.forEach((doc) => {
      const data = doc.data();

      // 만료되지 않은 항목만 포함
      if (data.expiresAt && data.expiresAt < now) {
        return;
      }

      totalAttempts++;

      // 정답인 경우만 카운트
      const isCorrect = data.isCorrect === true;
      if (isCorrect) {
        correctCount++;
      }
    });

    // 정확도 계산
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

    // 서비스별 통계는 aggregatedStats 에서 읽음 (NODE id 기준 누적치)
    // quizResults.keywords 는 AI 생성 한국어 키워드라 locale 전환 시 혼란을 유발
    let byService = {};
    try {
      const statsDoc = await db.collection('users').doc(userId)
        .collection('userData').doc('aggregatedStats').get();
      if (statsDoc.exists) {
        const raw = statsDoc.data()?.byService || {};
        // accuracy 필드 계산 후 주입
        Object.keys(raw).forEach((service) => {
          const entry = raw[service] || {};
          const total = entry.total || 0;
          const correct = entry.correct || 0;
          byService[service] = {
            total,
            correct,
            accuracy: total > 0 ? Math.round((correct / total) * 100) : 0
          };
        });
      }
    } catch (aggErr) {
      // aggregatedStats 읽기 실패 시 빈 객체로 폴백 (화면은 "데이터 없음" 처리)
      byService = {};
    }

    return res.json({
      totalAttempts,
      correctCount,
      accuracy,
      byService
    });
  } catch (error) {
    console.error('❌ Error getting quiz stats:', error);
    return res.json({
      totalAttempts: 0,
      correctCount: 0,
      accuracy: 0,
      byService: {}
    });
  }
});

// 퀴즈 결과 저장 (정답/오답 기록)
app.post('/api/recordQuizResult', async (req, res) => {
  try {
    const { userId, problem, selectedAnswer, difficulty, sessionId, selectedServices } = req.body;

    if (!userId || !problem) {
      return res.status(400).json({ error: 'userId and problem are required' });
    }

    const isCorrect = selectedAnswer === problem.answer;
    const resultsRef = db.collection('users').doc(userId).collection('quizResults');
    const today = new Date().toISOString().split('T')[0];

    // 24시간 뒤 만료 타임스탬프
    const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000;

    // 1️⃣ quizResults에 저장 (fullProblem은 시도하지만, 실패 시 개별 필드로 저장)
    const quizResultData = {
      sessionId: sessionId,
      question: problem.question || '',
      correctAnswer: problem.answer || '',
      selectedAnswer: selectedAnswer || '',
      userAnswer: selectedAnswer || '',
      isCorrect: isCorrect,
      difficulty: difficulty,
      date: today,
      createdAt: new Date().toISOString(),
      timestamp: new Date().getTime(),
      expiresAt: expiresAt,
      keywords: problem.keywords || [],
      goal: problem.goal || '',
      // 선택지 저장
      optionA: (problem.options?.A) || '',
      optionB: (problem.options?.B) || '',
      optionC: (problem.options?.C) || '',
      optionD: (problem.options?.D) || '',
      // 설명 저장
      explanationCorrect: (problem.explanation?.correct) || '',
      explanationTrapA: (problem.explanation?.trap_A) || '',
      explanationTrapB: (problem.explanation?.trap_B) || '',
      explanationTrapC: (problem.explanation?.trap_C) || '',
      explanationTrapD: (problem.explanation?.trap_D) || '',
      // 이지 모드 저장
      easyModeExplanation: (problem.easyMode?.explanation) || '',
      easyModeA: (problem.easyMode?.A) || '',
      easyModeB: (problem.easyMode?.B) || '',
      easyModeC: (problem.easyMode?.C) || '',
      easyModeD: (problem.easyMode?.D) || '',
      patterns: problem.patterns || []
    };

    try {
      // fullProblem도 함께 시도
      await resultsRef.add({
        ...quizResultData,
        fullProblem: problem
      });

      console.log(`📝 Quiz result saved: ${isCorrect ? '✅' : '❌'} (user: ${userId})`);
    } catch (saveError) {
      console.error(`❌ Error saving with fullProblem:`, saveError?.message);
      // fullProblem 없이 재시도
      console.log(`♻️ Retrying without fullProblem...`);
      try {
        await resultsRef.add(quizResultData);
        console.log(`📝 Quiz result saved (without fullProblem)`);
      } catch (retryError) {
        console.error(`❌ Error saving quiz result:`, retryError?.message);
        throw retryError;
      }
    }

    // 2️⃣ aggregatedStats에 누적 통계 저장
    const userRef = db.collection('users').doc(userId);
    const statsRef = userRef.collection('userData').doc('aggregatedStats');

    console.log(`📝 Saving stats to: users/${userId}/userData/aggregatedStats`);

    let statsDocExists = false;
    let currentStats = null;

    try {
      const statsDoc = await statsRef.get();
      // 제대로 된 DocumentSnapshot 객체인지 확인
      if (statsDoc && typeof statsDoc.exists === 'function') {
        statsDocExists = statsDoc.exists();
        if (statsDocExists) {
          currentStats = statsDoc.data() || {};
        }
      } else {
        console.warn(`⚠️ Invalid statsDoc response type`);
        statsDocExists = false;
      }
    } catch (getError) {
      console.error(`⚠️ Error getting stats doc:`, getError?.message);
      statsDocExists = false;
    }

    if (statsDocExists && currentStats) {
      // 서비스별 통계 업데이트
      const byService = currentStats.byService || {};
      (selectedServices || []).forEach(service => {
        if (!byService[service]) {
          byService[service] = { total: 0, correct: 0 };
        }
        byService[service].total++;
        if (isCorrect) byService[service].correct++;
      });

      try {
        await statsRef.update({
          totalAttempts: (currentStats.totalAttempts || 0) + 1,
          correctCount: isCorrect ? (currentStats.correctCount || 0) + 1 : currentStats.correctCount || 0,
          byService: byService,
          updatedAt: new Date().getTime()
        });
        console.log(`✅ Stats updated (existing doc)`);
      } catch (updateError) {
        console.error(`❌ Update error:`, updateError?.message);
        // 에러가 나도 계속 진행 (통계는 선택사항)
      }
    } else {
      // 첫 문제인 경우 또는 조회 실패한 경우
      const byService = {};
      (selectedServices || []).forEach(service => {
        byService[service] = { total: 1, correct: isCorrect ? 1 : 0 };
      });

      try {
        await statsRef.set({
          totalAttempts: 1,
          correctCount: isCorrect ? 1 : 0,
          byService: byService,
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime()
        });
        console.log(`✅ Stats created (new doc)`);
      } catch (setError) {
        console.error(`❌ Set error:`, setError?.message);
        // 에러가 나도 계속 진행 (통계는 선택사항)
      }
    }

    console.log(`📊 Stats updated for user ${userId}`);

    return res.json({ success: true, isCorrect: isCorrect });
  } catch (error) {
    console.error('❌ Error recording quiz result:', error);
    return res.status(500).json({ error: error.message || 'Failed to record quiz result' });
  }
});

//Lemon Squeezy Checkout API
app.post('/api/lemonsqueezy/checkout', async (req, res) => {
  try {
    const { email, returnUrl } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const storeId = process.env.VITE_LEMON_SQUEEZY_STORE_ID;
    const productId = process.env.VITE_LEMON_SQUEEZY_PRODUCT_ID;

    if (!storeId || !productId) {
      return res.status(400).json({
        error: 'Lemon Squeezy store/product environment variables are missing',
      });
    }

    const checkoutParams = new URLSearchParams({
      'checkout[email]': email,
      'checkout[custom][email]': email,
    });

    if (returnUrl) {
      checkoutParams.set('checkout[custom][return_url]', returnUrl);
    }

    const checkoutUrl = `https://${storeId}.lemonsqueezy.com/checkout/buy/${productId}?${checkoutParams.toString()}`;

    console.log('✅ Checkout URL generated:', checkoutUrl);

    return res.json({
      checkoutUrl,
      email,
    });
  } catch (error) {
    console.error('⚠️ Checkout error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * //이찓//寃利?留곹겕 諛쒖넚
 * 푸썝媛////사슜에뿉寃//뺤씤 硫붿씪 諛쒖넚
 */
app.post('/api/send-verification-email', async (req, res) => {
  try {
    const { email, userName } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Firebase Admin SDK를 통해 이메일 확인 링크 생성
    let verificationLink = '';
    try {
      verificationLink = await admin.auth().generateEmailVerificationLink(email);
      console.log(`✅ Generated verification link for ${email}`);
    } catch (linkError) {
      console.error('Failed to generate verification link:', linkError?.message);
      return res.status(500).json({ error: 'Failed to generate verification link' });
    }

    // HTML 이메일 템플릿 (버튼 포함)
    let greeting = userName ? `안녕하세요, ${userName}!` : '안녕하세요!';
    let htmlContent = `
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { background: #FF9900; color: white; padding: 14px 32px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 16px; }
    .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <p>${greeting}</p>
    <p>AWS SAA-C03 준비 플랫폼 계정을 생성해주셔서 감사합니다!</p>
    <p>아래 버튼을 클릭하여 이메일을 확인해주세요:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${verificationLink}" class="button">✅ 이메일 확인하기</a>
    </p>
    <p style="color: #666; font-size: 14px;">
      위 버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:
    </p>
    <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px;">
      <a href="${verificationLink}" style="color: #0066cc;">${verificationLink}</a>
    </p>
    <div class="footer">
      <p>이 이메일을 요청하지 않았다면 무시해도 됩니다.</p>
      <p>AWS SAA-C03 Preparation Platform</p>
    </div>
  </div>
</body>
</html>
    `;

    // AWS SES로 이메일 전송
    const senderEmail = process.env.SES_FROM_EMAIL || 'noreply@prep4saa.com';
    const command = new SendEmailCommand({
      Source: senderEmail,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: '🔒 이메일 확인 - AWS SAA-C03',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const response = await sesClient.send(command);
    console.log(`✅ Verification email sent to ${email} (MessageId: ${response.MessageId})`);
    return res.json({ success: true, message: 'Verification email sent.' });
  } catch (error) {
    console.error('❌ Verification email send failed:', error?.message);
    return res.status(500).json({ error: error?.message || 'Verification email send failed.' });
  }
});

app.post('/api/lemonsqueezy/cancel-subscription', async (req, res) => {
  try {
    const { userId, email } = req.body || {};
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY || process.env.VITE_LEMON_SQUEEZY_API_KEY || '';

    console.log('🧾 Cancel subscription request received', {
      hasUserId: !!userId,
      hasEmail: !!email,
      hasApiKey: !!apiKey,
      userId,
      email,
    });

    if (!apiKey) {
      console.error('❌ LEMON_SQUEEZY_API_KEY not configured');
      return res.status(500).json({ error: 'LEMON_SQUEEZY_API_KEY not configured' });
    }

    let userRef = null;
    let userData = null;

    if (userId) {
      userRef = db.collection('users').doc(userId);
      const snap = await userRef.get();
      if (snap.exists) {
        userData = snap.data();
      }
    } else if (email) {
      const snap = await db.collection('users').where('email', '==', email).limit(1).get();
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        userRef = docSnap.ref;
        userData = docSnap.data();
      }
    }

    if (!userRef || !userData) {
      console.warn('⚠️ Cancel subscription user not found', { userId, email });
      return res.status(404).json({ error: 'User not found' });
    }

    const subscriptionId = userData.lemonSqueezySubscriptionId;
    if (!subscriptionId) {
      console.warn('⚠️ No Lemon Squeezy subscription found for user', {
        userId,
        email,
        docId: userRef.id,
      });
      return res.status(404).json({ error: 'No Lemon Squeezy subscription found for this user' });
    }

    console.log('🧾 Cancelling Lemon Squeezy subscription', {
      subscriptionId,
      userId,
      email,
      docId: userRef.id,
    });

    const response = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('❌ Lemon Squeezy cancel API error', {
        status: response.status,
        errorText: responseText,
        subscriptionId,
      });
      return res.status(response.status).json({ error: responseText || 'Failed to cancel subscription' });
    }

    let result = {};
    if (responseText) {
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.warn('⚠️ Lemon Squeezy cancel response was not JSON', {
          subscriptionId,
          responseTextPreview: responseText.slice(0, 300),
        });
      }
    }

    const attributes = result?.data?.attributes || {};
    const isPaid = attributes.status === 'active' || attributes.status === 'on_trial' || attributes.status === 'cancelled';

    await userRef.set({
      isPaid,
      userStatus: isPaid ? 'paid' : 'loggedIn',
      subscriptionStatus: attributes.status || 'cancelled',
      subscriptionCancelledAt: new Date().toISOString(),
      subscriptionEndsAt: attributes.ends_at || null,
      subscriptionRenewsAt: attributes.renews_at || null,
      lemonSqueezySubscriptionId: subscriptionId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return res.json({
      success: true,
      subscriptionStatus: attributes.status || 'cancelled',
      subscriptionEndsAt: attributes.ends_at || null,
    });
  } catch (error) {
    console.error('Cancel subscription failed:', error?.stack || error);
    return res.status(500).json({ error: error.message || 'Cancel subscription failed' });
  }
});

app.post('/api/webhooks/lemon-squeezy', async (req, res) => {
  try {
    const signature = req.headers['x-signature'] || req.headers['x-lemon-squeezy-signature'] || req.headers['X-Signature'] || req.headers['X-Lemon-Squeezy-Signature'];
    const body = req.rawBody || JSON.stringify(req.body);
    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('⚠️  LEMON_SQUEEZY_WEBHOOK_SECRET not configured');
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
    const customData = req.body.meta?.custom_data || data?.attributes?.custom_data || {};

    console.log(`🧭 Lemon Squeezy Webhook: ${event}`);

    const paidEvents = ['order_created', 'subscription_created', 'subscription_payment_success'];
    const cancelEvents = ['subscription_cancelled'];
    const expiredEvents = ['subscription_expired'];

    if (paidEvents.includes(event)) {
      const subscription = data.attributes;
      const userId = customData.user_id;
      const email = customData.email || subscription.user_email || subscription.customer_email;

      if (!userId && !email) {
        console.warn('⚠️  No user_id or email in webhook data');
        return res.json({ received: true });
      }

      try {
        let userRef;
        if (userId) {
          userRef = db.collection('users').doc(userId);
        } else {
          const userRecord = await admin.auth().getUserByEmail(email);
          userRef = db.collection('users').doc(userRecord.uid);
        }

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

        console.log(`✅ Firebase updated for user ${userId || email}:`, {
          isPaid: updateData.isPaid,
          status: subscription.status,
          subscriptionId: data.id
        });

        return res.json({ received: true });
      } catch (error) {
        console.error('❌ Firebase update error:', error);
        return res.status(500).json({ error: 'Firebase update failed' });
      }
    }

    if (cancelEvents.includes(event)) {
      const subscription = data.attributes;
      const userId = customData.user_id;
      const email = customData.email || subscription.user_email || subscription.customer_email;

      if (!userId && !email) {
        console.warn('⚠️  No user_id or email in webhook data');
        return res.json({ received: true });
      }

      try {
        let userRef;
        if (userId) {
          userRef = db.collection('users').doc(userId);
        } else {
          const userRecord = await admin.auth().getUserByEmail(email);
          userRef = db.collection('users').doc(userRecord.uid);
        }

        const isPaid = subscription.status === 'active' || subscription.status === 'on_trial' || subscription.status === 'cancelled';

        await userRef.set({
          isPaid,
          userStatus: isPaid ? 'paid' : 'loggedIn',
          subscriptionStatus: subscription.status || 'cancelled',
          subscriptionCancelledAt: new Date().toISOString(),
          subscriptionEndsAt: subscription.ends_at || null,
          subscriptionRenewsAt: subscription.renews_at || null,
          lemonSqueezySubscriptionId: data.id,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log(`✅ Subscription cancelled for user ${userId || email}`);
        return res.json({ received: true });
      } catch (error) {
        console.error('❌ Firebase update error:', error);
        return res.status(500).json({ error: 'Firebase update failed' });
      }
    }

    if (expiredEvents.includes(event)) {
      const subscription = data.attributes;
      const userId = customData.user_id;
      const email = customData.email || subscription.user_email || subscription.customer_email;

      if (!userId && !email) {
        console.warn('⚠️  No user_id or email in webhook data');
        return res.json({ received: true });
      }

      try {
        let userRef;
        if (userId) {
          userRef = db.collection('users').doc(userId);
        } else {
          const userRecord = await admin.auth().getUserByEmail(email);
          userRef = db.collection('users').doc(userRecord.uid);
        }

        await userRef.set({
          isPaid: false,
          userStatus: 'loggedIn',
          subscriptionStatus: subscription.status || 'expired',
          subscriptionExpiredAt: new Date().toISOString(),
          subscriptionEndsAt: subscription.ends_at || null,
          subscriptionRenewsAt: subscription.renews_at || null,
          lemonSqueezySubscriptionId: data.id,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log(`✅ Subscription expired for user ${userId || email}`);
        return res.json({ received: true });
      } catch (error) {
        console.error('❌ Firebase update error:', error);
        return res.status(500).json({ error: 'Firebase update failed' });
      }
    }

    console.log(`ℹ️ Unhandled event: ${event}`);
    return res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
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
