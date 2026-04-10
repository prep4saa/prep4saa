const crypto = require('crypto');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Firebase Admin 초기화 (Lambda warm start 고려)
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const auth = getAuth();

exports.handler = async (event) => {
  console.log('📩 Webhook received:', event.httpMethod);

  try {
    // 1. Webhook 서명 검증
    const signature = event.headers['X-Signature'] || event.headers['x-signature'];
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    const body = event.body;

    if (!signature || !secret) {
      console.error('❌ Missing signature or secret');
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(body).digest('hex');

    if (signature !== digest) {
      console.error('❌ Invalid signature');
      return { statusCode: 401, body: 'Invalid signature' };
    }

    // 2. 이벤트 파싱
    const payload = JSON.parse(body);
    const eventName = payload.meta?.event_name;
    console.log('📌 Event:', eventName);

    // 결제 성공 이벤트
    const paidEvents = ['order_created', 'subscription_created', 'subscription_payment_success'];
    // 구독 취소/만료 이벤트
    const cancelEvents = ['subscription_cancelled', 'subscription_expired'];

    if (!paidEvents.includes(eventName) && !cancelEvents.includes(eventName)) {
      return { statusCode: 200, body: 'Ignored' };
    }

    // 3. 고객 이메일 추출
    const email =
      payload.data?.attributes?.user_email ||
      payload.data?.attributes?.customer_email ||
      payload.meta?.custom_data?.email;

    if (!email) {
      console.error('❌ No email found in payload');
      return { statusCode: 400, body: 'No email found' };
    }

    console.log('📧 Customer email:', email);

    // 4. Firebase Auth에서 UID 조회
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (err) {
      console.error('❌ Firebase user not found for email:', email);
      return { statusCode: 404, body: 'User not found in Firebase' };
    }

    // 5. Firestore 업데이트
    const userRef = db.collection('users').doc(userRecord.uid);
    const isPaid = paidEvents.includes(eventName);

    await userRef.set(
      {
        isPaid,
        userStatus: isPaid ? 'paid' : 'loggedIn',
        updatedAt: new Date().toISOString(),
        ...(isPaid ? { paidAt: new Date().toISOString() } : { cancelledAt: new Date().toISOString() }),
      },
      { merge: true }
    );

    console.log(`✅ isPaid=${isPaid} set for ${email} (uid: ${userRecord.uid})`);

    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { statusCode: 500, body: error.message };
  }
};
