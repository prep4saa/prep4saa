const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Resend } = require('resend');
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
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// ??蹂댁븞 ?ㅻ뜑 ?ㅼ젙 (XSS, Clickjacking, MIME-sniffing 諛⑹?)
app.use(helmet());

// ??CORS ?ㅼ젙
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

// ????꾩븘???ㅼ젙
app.use((req, res, next) => {
  req.setTimeout(30000);  // 30珥?  res.setTimeout(30000);
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
      console.error('??ANTHROPIC_API_KEY not found in environment');
      return res.status(400).json({ error: { message: 'ANTHROPIC_API_KEY not found' } });
    }

    console.log('?뱾 Sending request to Claude API:', { model, max_tokens });

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
      console.error('??Claude API Error:', error);
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    console.log('??Claude API Success');
    res.json(data);
  } catch (error) {
    console.error('??Proxy error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
}

// ?묒そ ?붾뱶?ъ씤??吏??app.post('/api/claude', handleClaudeProxy);
app.post('/api/claudeProxy', handleClaudeProxy);

// ??Gemini API ?꾨줉???몃뱾??(蹂댁븞: API ?ㅻ뒗 ?쒕쾭?먮쭔 ?덉쓬)
async function handleGeminiProxy(req, res) {
  try {
    const { prompt, maxTokens = 2000 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('??GEMINI_API_KEY not found in environment');
      return res.status(400).json({ error: { message: 'GEMINI_API_KEY not found' } });
    }

    console.log('?뱾 Sending request to Gemini API');

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
      console.error('??Gemini API Error:', error);
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    console.log('??Gemini API Success');
    res.json(data);
  } catch (error) {
    console.error('??Gemini Proxy error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
}

// Gemini API ?붾뱶?ъ씤??app.post('/api/gemini', handleGeminiProxy);

app.post('/api/process2CheckoutPayment', async (req, res) => {
  try {
    const { email, fullName, amount, currency } = req.body;

    // ?㎦ ?뚯뒪??紐⑤뱶: 2Checkout API ???놁씠???묐룞
    // ?꾨줈?뺤뀡: 2Checkout API ???꾩슂
    const twoCheckoutApiKey = process.env.TWO_CHECKOUT_API_KEY;

    console.log('?뱾 Processing 2Checkout payment:', { email, fullName, amount, currency });

    // ???뚯뒪??紐⑤뱶: ??긽 ?깃났
    if (!twoCheckoutApiKey) {
      console.log('?㎦ Test Mode: Simulating 2Checkout payment');
      return res.json({
        success: true,
        message: 'Test mode: Payment simulated successfully',
        transactionId: `TEST_${Date.now()}`,
      });
    }

    // ?꾨줈?뺤뀡: ?ㅼ젣 2Checkout API ?몄텧
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
    console.error('??2Checkout Payment Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed',
    });
  }
});

// Payment Intent Handler (Stripe - ?덇굅??
app.post('/api/createPaymentIntent', async (req, res) => {
  try {
    const { email, fullName, amount, currency } = req.body;

    // ?뚯뒪??紐⑤뱶: ?ㅼ젣 Stripe ?듯빀 ???쒕??덉씠??    // ?꾨줈?뺤뀡: Stripe SDK ?꾩슂
    const stripeSecretKey = process.env.VITE_STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      // ?뚯뒪??紐⑤뱶: ?붾? clientSecret 諛섑솚
      const dummyClientSecret = `pi_test_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;

      return res.json({
        clientSecret: dummyClientSecret,
        status: 'test_mode',
        message: 'Test mode: Payment intent created (simulated)'
      });
    }

    // ?꾨줈?뺤뀡?먯꽌???ㅼ젣 Stripe API ?몄텧
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

    // ?뚯뒪??紐⑤뱶: ?먮윭 濡쒓퉭留??섑뻾
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

    // ?ㅼ젣 ?섍꼍?먯꽌??Firebase Cloud Function?대굹 ?대찓???쒕퉬???몄텧
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

    // ?섍꼍蹂?섏뿉???섏떊 ?대찓??媛?몄삤湲?(濡쒖쭅???몄텧 X)
    const contactEmail = process.env.CONTACT_EMAIL;

    const contactData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      timestamp: timestamp || new Date().toISOString(),
      receivedAt: new Date().toISOString()
    };

    console.log('?? ??:', {
      senderName: contactData.name,
      senderEmail: contactData.email,
      subject: contactData.subject,
      timestamp: contactData.timestamp
    });

    // ?벁 Resend API瑜??ъ슜?섏뿬 ?대찓???꾩넚
    if (contactEmail && process.env.RESEND_API_KEY) {
      try {
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">?덈줈??臾몄쓽媛 ?꾩갑?덉뒿?덈떎</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>諛쒖떊??</strong> ${contactData.name}</p>
              <p><strong>?대찓??</strong> ${contactData.email}</p>
              <p><strong>?쒕ぉ:</strong> ${contactData.subject}</p>
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
          subject: `??臾몄쓽: ${contactData.subject}`,
          html: htmlContent,
        });

        console.log(`?됵툘 Resend ?대찓??諛쒖넚 ?꾨즺: ${contactEmail}`);
      } catch (emailError) {
        console.error('?좑툘 Resend ?대찓??諛쒖넚 ?ㅽ뙣:', emailError.message);
        // ?대찓??諛쒖넚 ?ㅽ뙣?대룄 ?대씪?댁뼵?몄뿉???깃났 ?묐떟 ?꾩넚
      }
    }

    // ?뾼截?Firebase??臾몄쓽 ???(?좏깮?ы빆)
    // await saveContactToFirebase(contactData);

    // ?깃났 ?묐떟
    res.json({
      status: 'success',
      message: 'Contact message received. We will reply soon.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('??Contact form error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// ===== Admin 寃利?=====

// Admin check (蹂댁븞: ?쒕쾭?먯꽌留?泥섎━)
app.post('/api/checkAdmin', (req, res) => {
  try {
    const { email } = req.body;
    const adminEmail = process.env.VITE_ADMIN_EMAIL;

    // ?쒕쾭?먯꽌留?admin ?대찓??鍮꾧탳
    const isAdmin = email && adminEmail && email === adminEmail;

    // ?붾쾭洹?濡쒓렇
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
    console.error('??Admin check error:', error);
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

    // Admin ?뺤씤 ?꾨즺, ?ㅼ쓬 ?몃뱾?щ줈
    next();
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin ?듦퀎 議고쉶 (愿由ъ옄 ?꾩슜)
app.post('/api/admin/stats', (req, res) => {
  try {
    const { email } = req.body;
    // 誘몃뱾?⑥뼱?먯꽌 ?대? 寃利앸맖

    // ?뚯뒪?몄슜 ?묐떟 (?ㅼ젣濡쒕뒗 Firebase getAdminStats() ?몄텧)
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

// Admin - 紐⑤뱺 ?ъ슜??紐⑸줉 議고쉶 (愿由ъ옄 ?꾩슜)
app.post('/api/admin/users', (req, res) => {
  try {
    const { email } = req.body;
    // 誘몃뱾?⑥뼱?먯꽌 ?대? 寃利앸맖

    // ?뚯뒪?몄슜 ?묐떟 (?ㅼ젣濡쒕뒗 Firebase getAllUsersForAdmin() ?몄텧)
    res.json({
      users: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin - ?뱀젙 ?ъ슜?먯쓽 臾몄젣 ?몄뀡 議고쉶 (愿由ъ옄 ?꾩슜)
app.post('/api/admin/user/sessions', (req, res) => {
  try {
    const { email, userId } = req.body;
    // 誘몃뱾?⑥뼱?먯꽌 ?대? 寃利앸맖

    if (!userId) {
      return res.status(400).json({ error: { message: 'userId is required' } });
    }

    // ?뚯뒪?몄슜 ?묐떟 (?ㅼ젣濡쒕뒗 Firebase getUserProblemSessions() ?몄텧)
    res.json({
      sessions: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin Console: ?쒕쾭 紐낅졊???ㅽ뻾 (admin ?꾩슜)
app.post('/api/admin/console', (req, res) => {
  const { exec } = require('child_process');
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'command is required' });
    }
    // 紐낅졊??湲몄씠 ?쒗븳
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

// ??Lemon Squeezy Checkout API
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
    console.error('??Checkout error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * ???대찓??寃利?留곹겕 諛쒖넚
 * ?뚯썝媛?????ъ슜?먯뿉寃??뺤씤 硫붿씪 諛쒖넚
 */
app.post('/api/send-verification-email', async (req, res) => {
  try {
    const { email, userName } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const response = await resend.emails.send({
      from: process.env.CONTACT_EMAIL || 'awsarchive06@gmail.com',
      to: email,
      subject: 'AWS SAA-C03 - Email Verification Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello${userName ? `, ${userName}` : ''}!</h2>
          <p>Your account verification email has been sent successfully.</p>
          <p>Please click the link in that email to verify your address.</p>
          <p>If you did not request this email, you can ignore it.</p>
        </div>
      `,
    });

    if (response.error) {
      console.error('Resend API error:', response.error);
      return res.status(500).json({ error: `Resend API error: ${response.error}` });
    }

    console.log('Verification email sent:', email, 'ID:', response.id);
    return res.json({ success: true, message: 'Verification email sent.' });
  } catch (error) {
    console.error('Verification email send failed:', error);
    return res.status(500).json({ error: 'Verification email send failed.' });
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
  console.log(`??Proxy server running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/checkAdmin`);
  console.log(`   Contact API: http://localhost:${PORT}/api/contact`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`??Port ${PORT} is already in use`);
    console.error('   Try: taskkill /F /IM node.exe');
    process.exit(1);
  } else {
    console.error(`??Server error: ${err.message}`);
    process.exit(1);
  }
});
