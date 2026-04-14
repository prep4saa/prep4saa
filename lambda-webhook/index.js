const crypto = require('crypto');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

function getHeader(headers, name) {
  if (!headers) {
    return null;
  }

  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key && key.toLowerCase() === target) {
      return Array.isArray(value) ? value[0] : value;
    }
  }

  return null;
}

function getRawBody(event) {
  if (!event || event.body == null) {
    return '';
  }

  if (event.isBase64Encoded) {
    return Buffer.from(event.body, 'base64').toString('utf8');
  }

  return typeof event.body === 'string' ? event.body : JSON.stringify(event.body);
}

const initStartedAt = Date.now();
if (!getApps().length) {
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountRaw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured');
  }

  const serviceAccount = JSON.parse(serviceAccountRaw);
  initializeApp({ credential: cert(serviceAccount) });
  console.log(`Firebase admin initialized in ${Date.now() - initStartedAt}ms`);
} else {
  console.log('Firebase admin reused from warm container');
}

const db = getFirestore();
const auth = getAuth();

async function resolveUserRef(customData, attributes, requestId) {
  const userId = customData.user_id;

  if (userId) {
    console.log(`[${requestId}] Resolving user by user_id: ${userId}`);
    return { userRef: db.collection('users').doc(userId), userKey: userId };
  }

  console.warn(`[${requestId}] No user_id in webhook custom_data`);
  return { userRef: null, userKey: null };
}

async function handleCancelSubscription(rawBody, requestId) {
  try {
    const payload = JSON.parse(rawBody);
    const { userId } = payload;

    if (!userId) {
      console.error(`[${requestId}] Missing userId in cancel request`);
      return { statusCode: 400, body: JSON.stringify({ error: 'userId is required' }) };
    }

    console.log(`[${requestId}] Processing cancel subscription for user: ${userId}`);

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.error(`[${requestId}] User not found: ${userId}`);
      return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
    }

    const userData = userDoc.data();
    const subscriptionId = userData?.lemonSqueezySubscriptionId;

    if (!subscriptionId) {
      console.error(`[${requestId}] No subscription found for user: ${userId}`);
      return { statusCode: 400, body: JSON.stringify({ error: 'No active subscription' }) };
    }

    console.log(`[${requestId}] Found subscription: ${subscriptionId}`);

    // Cancel subscription via Lemon Squeezy API
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    if (!apiKey) {
      console.error(`[${requestId}] LEMON_SQUEEZY_API_KEY not configured`);
      return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    const lsResponse = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        data: {
          type: 'subscriptions',
          id: subscriptionId,
          attributes: {
            cancelled: true
          }
        }
      })
    });

    if (!lsResponse.ok) {
      const errorText = await lsResponse.text();
      console.error(`[${requestId}] Lemon Squeezy API error: ${lsResponse.status}`, errorText);
      return {
        statusCode: lsResponse.status,
        body: JSON.stringify({ error: `Lemon Squeezy API error: ${lsResponse.status}` })
      };
    }

    console.log(`[${requestId}] Subscription cancelled successfully: ${subscriptionId}`);

    // Update Firestore to mark as cancelled locally
    await db.collection('users').doc(userId).set(
      {
        isPaid: false,
        userStatus: 'loggedIn',
        subscriptionStatus: 'cancelled',
        subscriptionCancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Subscription cancelled' })
    };
  } catch (error) {
    console.error(`[${requestId}] Error in handleCancelSubscription:`, error?.stack || error?.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error?.message || 'Internal Server Error' })
    };
  }
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const requestId = context.awsRequestId || event?.requestContext?.requestId || 'unknown-request';
  const method = event?.requestContext?.http?.method || event?.httpMethod || 'unknown-method';
  const path = event?.path || event?.rawPath || 'unknown-path';
  const rawBody = getRawBody(event);
  const headers = event?.headers || {};

  console.log(`[${requestId}] Request received`, {
    method,
    path,
    hasBody: Boolean(rawBody),
    bodyLength: rawBody.length,
    headerKeys: Object.keys(headers),
  });

  // Handle REST API endpoints
  if (method === 'POST' && path?.includes('/api/lemonsqueezy/cancel-subscription')) {
    return handleCancelSubscription(rawBody, requestId);
  }

  // Handle Lemon Squeezy webhooks
  try {
    const signature =
      getHeader(headers, 'x-signature') ||
      getHeader(headers, 'x-lemon-squeezy-signature');
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      console.error(`[${requestId}] Missing signature or secret`, {
        hasSignature: Boolean(signature),
        hasSecret: Boolean(secret),
      });
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const verifyStartedAt = Date.now();
    const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    console.log(`[${requestId}] Signature verification completed in ${Date.now() - verifyStartedAt}ms`);

    if (signature !== digest) {
      console.error(`[${requestId}] Invalid signature`, { signature, digest });
      return { statusCode: 401, body: 'Invalid signature' };
    }

    const parseStartedAt = Date.now();
    const payload = JSON.parse(rawBody);
    console.log(`[${requestId}] Payload parsed in ${Date.now() - parseStartedAt}ms`);

    const eventName = payload.meta?.event_name;
    const data = payload.data || {};
    const attributes = data.attributes || {};
    const customData = payload.meta?.custom_data || attributes.custom_data || {};

    console.log(`[${requestId}] Event: ${eventName}`);
    console.log(
      `[${requestId}] Customer email: ${customData.email || attributes.user_email || attributes.customer_email || 'n/a'}`
    );
    console.log(`[${requestId}] Custom data keys: ${Object.keys(customData).join(', ') || 'none'}`);

    const paidEvents = ['order_created', 'subscription_created', 'subscription_payment_success'];
    const cancelledEvents = ['subscription_cancelled'];
    const expiredEvents = ['subscription_expired'];

    if (
      !paidEvents.includes(eventName) &&
      !cancelledEvents.includes(eventName) &&
      !expiredEvents.includes(eventName)
    ) {
      console.log(`[${requestId}] Ignored event: ${eventName}`);
      return { statusCode: 200, body: 'Ignored' };
    }

    const resolveStartedAt = Date.now();
    console.log(`[${requestId}] About to resolve user with customData:`, customData);
    const resolved = await resolveUserRef(customData, attributes, requestId);
    console.log(`[${requestId}] User resolution finished in ${Date.now() - resolveStartedAt}ms`, { resolved });

    if (!resolved.userRef) {
      console.error(`[${requestId}] No user reference resolved from webhook payload`, { resolved });
      return { statusCode: 400, body: 'No user found' };
    }
    console.log(`[${requestId}] User ref found: ${resolved.userKey}`);

    if (paidEvents.includes(eventName)) {
      const isPaid =
        attributes.status === 'active' ||
        attributes.status === 'on_trial' ||
        eventName === 'order_created';

      const updateStartedAt = Date.now();
      console.log(`[${requestId}] Writing paid state`, {
        userKey: resolved.userKey,
        subscriptionId: data.id,
        status: attributes.status,
        customerId: attributes.customer_id,
      });

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

      console.log(`[${requestId}] Paid state saved in ${Date.now() - updateStartedAt}ms for ${resolved.userKey}`);
      return { statusCode: 200, body: 'OK' };
    }

    if (cancelledEvents.includes(eventName)) {
      const isPaid =
        attributes.status === 'active' ||
        attributes.status === 'on_trial' ||
        attributes.status === 'cancelled';

      const updateStartedAt = Date.now();
      console.log(`[${requestId}] Writing cancel state`, {
        userKey: resolved.userKey,
        subscriptionId: data.id,
        status: attributes.status,
        endsAt: attributes.ends_at,
      });

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

      console.log(
        `[${requestId}] Cancel state saved in ${Date.now() - updateStartedAt}ms for ${resolved.userKey}`
      );
      return { statusCode: 200, body: 'OK' };
    }

    if (expiredEvents.includes(eventName)) {
      const updateStartedAt = Date.now();
      console.log(`[${requestId}] Writing expired state`, {
        userKey: resolved.userKey,
        subscriptionId: data.id,
        status: attributes.status,
        endsAt: attributes.ends_at,
      });

      await resolved.userRef.set(
        {
          isPaid: false,
          userStatus: 'loggedIn',
          subscriptionStatus: attributes.status || 'expired',
          subscriptionExpiredAt: new Date().toISOString(),
          subscriptionEndsAt: attributes.ends_at || null,
          subscriptionRenewsAt: attributes.renews_at || null,
          lemonSqueezySubscriptionId: data.id,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      console.log(
        `[${requestId}] Expired state saved in ${Date.now() - updateStartedAt}ms for ${resolved.userKey}`
      );
      return { statusCode: 200, body: 'OK' };
    }

    return { statusCode: 200, body: 'Ignored' };
  } catch (error) {
    console.error(`[${requestId}] Error:`, error?.stack || error?.message || error);
    return { statusCode: 500, body: error.message || 'Internal Server Error' };
  }
};
