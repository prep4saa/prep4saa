const crypto = require('crypto');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const auth = getAuth();

async function resolveUserRef(customData, attributes) {
  const userId = customData.user_id;
  const email = customData.email || attributes.user_email || attributes.customer_email;

  if (userId) {
    return { userRef: db.collection('users').doc(userId), userKey: userId };
  }

  if (email) {
    const userRecord = await auth.getUserByEmail(email);
    return { userRef: db.collection('users').doc(userRecord.uid), userKey: email };
  }

  return { userRef: null, userKey: null };
}

exports.handler = async (event) => {
  console.log('🧾 Webhook received:', event.httpMethod);

  try {
    const signature = event.headers['X-Signature'] || event.headers['x-signature'] || event.headers['X-Lemon-Squeezy-Signature'] || event.headers['x-lemon-squeezy-signature'];
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    const body = event.body;

    if (!signature || !secret) {
      console.error('Missing signature or secret');
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const digest = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (signature !== digest) {
      console.error('Invalid signature');
      return { statusCode: 401, body: 'Invalid signature' };
    }

    const payload = JSON.parse(body);
    const eventName = payload.meta?.event_name;
    const data = payload.data || {};
    const attributes = data.attributes || {};
    const customData = payload.meta?.custom_data || attributes.custom_data || {};

    console.log('Event:', eventName);

    const paidEvents = ['order_created', 'subscription_created', 'subscription_payment_success'];
    const cancelEvents = ['subscription_cancelled', 'subscription_expired'];

    if (!paidEvents.includes(eventName) && !cancelEvents.includes(eventName)) {
      return { statusCode: 200, body: 'Ignored' };
    }

    const resolved = await resolveUserRef(customData, attributes);
    if (!resolved.userRef) {
      console.error('No user_id or email found in payload');
      return { statusCode: 400, body: 'No user found' };
    }

    if (paidEvents.includes(eventName)) {
      const isPaid = attributes.status === 'active' || attributes.status === 'on_trial' || eventName === 'order_created';

      await resolved.userRef.set(
        {
          isPaid,
          userStatus: isPaid ? 'paid' : 'loggedIn',
          lemonSqueezySubscriptionId: data.id,
          lemonSqueezyCustomerId: attributes.customer_id,
          subscriptionStatus: attributes.status,
          subscriptionCreatedAt: attributes.created_at,
          subscriptionUpdatedAt: attributes.updated_at,
          subscriptionRenewsAt: attributes.renews_at,
          updatedAt: new Date().toISOString(),
          ...(isPaid ? { paidAt: new Date().toISOString() } : {}),
        },
        { merge: true }
      );

      console.log(`isPaid=${isPaid} set for ${resolved.userKey}`);
      return { statusCode: 200, body: 'OK' };
    }

    if (cancelEvents.includes(eventName)) {
      const isPaid = attributes.status === 'active' || attributes.status === 'on_trial' || attributes.status === 'cancelled';

      await resolved.userRef.set(
        {
          isPaid,
          userStatus: isPaid ? 'paid' : 'loggedIn',
          subscriptionStatus: attributes.status || 'cancelled',
          subscriptionCancelledAt: new Date().toISOString(),
          subscriptionEndsAt: attributes.ends_at || null,
          subscriptionRenewsAt: attributes.renews_at || null,
          lemonSqueezySubscriptionId: data.id,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      console.log(`Subscription cancelled for ${resolved.userKey}`);
      return { statusCode: 200, body: 'OK' };
    }

    return { statusCode: 200, body: 'Ignored' };
  } catch (error) {
    console.error('Error:', error.message);
    return { statusCode: 500, body: error.message };
  }
};
