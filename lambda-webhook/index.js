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

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Signature, X-Lemon-Squeezy-Signature',
    'Content-Type': 'application/json',
  };
}

async function handleCancelSubscription(rawBody, requestId) {
  try {
    const payload = JSON.parse(rawBody);
    const { userId, email } = payload;

    let userRef = null;
    let userData = null;

    if (userId) {
      console.log(`[${requestId}] Processing cancel subscription for userId: ${userId}`);
      userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        userData = userDoc.data();
      }
    } else if (email) {
      console.log(`[${requestId}] Processing cancel subscription for email: ${email}`);
      const snap = await db.collection('users').where('email', '==', email).limit(1).get();
      if (!snap.empty) {
        userRef = snap.docs[0].ref;
        userData = snap.docs[0].data();
      }
    }

    if (!userRef || !userData) {
      console.error(`[${requestId}] User not found for cancel request`, { userId, email });
      return {
        statusCode: 404,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const subscriptionId = userData?.lemonSqueezySubscriptionId;

    if (!subscriptionId) {
      console.error(`[${requestId}] No subscription found for user`, { userId, email });
      return {
        statusCode: 400,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: 'No active subscription' })
      };
    }

    console.log(`[${requestId}] Found subscription: ${subscriptionId}`);

    // Cancel subscription via Lemon Squeezy API
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    if (!apiKey) {
      console.error(`[${requestId}] LEMON_SQUEEZY_API_KEY not configured`);
      return {
        statusCode: 500,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    const lsResponse = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!lsResponse.ok) {
      const errorText = await lsResponse.text();
      console.error(`[${requestId}] Lemon Squeezy API error: ${lsResponse.status}`, errorText);
      return {
        statusCode: lsResponse.status,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: `Lemon Squeezy API error: ${lsResponse.status}` })
      };
    }

    const result = await lsResponse.json();
    const attributes = result?.data?.attributes || {};
    const isPaid = attributes.status === 'active' || attributes.status === 'on_trial' || attributes.status === 'cancelled';

    console.log(`[${requestId}] Subscription cancelled successfully: ${subscriptionId}`, {
      status: attributes.status,
      endsAt: attributes.ends_at || null,
    });

    // Update Firestore to mark as cancelled locally
    await userRef.set(
      {
        isPaid,
        userStatus: isPaid ? 'paid' : 'loggedIn',
        subscriptionStatus: attributes.status || 'cancelled',
        subscriptionCancelledAt: new Date().toISOString(),
        subscriptionEndsAt: attributes.ends_at || null,
        subscriptionRenewsAt: attributes.renews_at || null,
        lemonSqueezySubscriptionId: subscriptionId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        success: true,
        message: 'Subscription cancelled',
        subscriptionStatus: attributes.status || 'cancelled',
        subscriptionEndsAt: attributes.ends_at || null,
      })
    };
  } catch (error) {
    console.error(`[${requestId}] Error in handleCancelSubscription:`, error?.stack || error?.message || error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: error?.message || 'Internal Server Error' })
    };
  }
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const requestId = context.awsRequestId || event?.requestContext?.requestId || 'unknown-request';
  const method = event?.requestContext?.http?.method || event?.httpMethod || 'unknown-method';
  const path = event?.requestContext?.http?.path || event?.path || event?.rawPath || 'unknown-path';
  const rawBody = getRawBody(event);
  const headers = event?.headers || {};

  // Debug logging
  console.log(`[${requestId}] Full event context:`, {
    'requestContext.http.path': event?.requestContext?.http?.path,
    'path': event?.path,
    'rawPath': event?.rawPath,
    resolvedPath: path,
    method,
  });

  console.log(`[${requestId}] Request received`, {
    method,
    path,
    hasBody: Boolean(rawBody),
    bodyLength: rawBody.length,
    headerKeys: Object.keys(headers),
  });

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Signature, X-Lemon-Squeezy-Signature',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  // Handle REST API endpoints
  if (method === 'POST' && path?.includes('cancel-subscription')) {
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
      return {
        statusCode: 401,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const verifyStartedAt = Date.now();
    const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    console.log(`[${requestId}] Signature verification completed in ${Date.now() - verifyStartedAt}ms`);

    if (signature !== digest) {
      console.error(`[${requestId}] Invalid signature`, { signature, digest });
      return {
        statusCode: 401,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: 'Invalid signature' })
      };
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
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ message: 'Ignored' })
      };
    }

    const resolveStartedAt = Date.now();
    console.log(`[${requestId}] About to resolve user with customData:`, customData);
    const resolved = await resolveUserRef(customData, attributes, requestId);
    console.log(`[${requestId}] User resolution finished in ${Date.now() - resolveStartedAt}ms`, { resolved });

    if (!resolved.userRef) {
      console.error(`[${requestId}] No user reference resolved from webhook payload`, { resolved });
      return {
        statusCode: 400,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: 'No user found' })
      };
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
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ message: 'OK' })
      };
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
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ message: 'OK' })
      };
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
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ message: 'OK' })
      };
    }

    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify({ message: 'Ignored' })
    };
  } catch (error) {
    console.error(`[${requestId}] Error:`, error?.stack || error?.message || error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: error?.message || 'Internal Server Error' })
    };
  }
};
