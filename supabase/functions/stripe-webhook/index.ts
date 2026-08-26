const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'stripe-signature, content-type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getProjectSecretKey() {
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys);
      if (parsed.default) return parsed.default;
    } catch (_) {}
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
}

function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const parts = Object.fromEntries(signatureHeader.split(',').map((part) => {
    const [key, value] = part.split('=');
    return [key, value];
  }));
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signedPayload = `${timestamp}.${payload}`;
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  return timingSafeEqual(hex(digest), signature);
}

function rewardCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const suffix = [...bytes].map((byte) => alphabet[byte % alphabet.length]).join('');
  return `BFL10-${suffix}`;
}

async function fetchJson(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || data?.error || `Request failed with ${response.status}`);
  return data;
}

async function generateEarnedRewards(supabaseUrl: string, secretKey: string, userId: string) {
  const paidOrders = await fetchJson(
    `${supabaseUrl}/rest/v1/orders?user_id=eq.${encodeURIComponent(userId)}&payment_status=eq.paid&select=subtotal_gbp`,
    {
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
      },
    },
  );
  const totalPaid = (Array.isArray(paidOrders) ? paidOrders : [])
    .reduce((sum, order) => sum + Number(order.subtotal_gbp || 0), 0);
  const targetRewards = Math.floor(totalPaid / 150);

  const existingRewards = await fetchJson(
    `${supabaseUrl}/rest/v1/reward_codes?user_id=eq.${encodeURIComponent(userId)}&select=id`,
    {
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
      },
    },
  );
  const existingCount = Array.isArray(existingRewards) ? existingRewards.length : 0;
  const missing = Math.max(0, targetRewards - existingCount);
  if (!missing) return 0;

  for (let i = 0; i < missing; i += 1) {
    let inserted = false;
    for (let attempt = 0; attempt < 5 && !inserted; attempt += 1) {
      const response = await fetch(`${supabaseUrl}/rest/v1/reward_codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
          code: rewardCode(),
          discount_percent: 10,
          earned_from_spend: 150,
        }),
      });
      inserted = response.ok;
    }
  }

  return missing;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const secretKey = getProjectSecretKey();
    if (!webhookSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET secret.');
    if (!supabaseUrl || !secretKey) throw new Error('Missing Supabase server secrets.');

    const signature = req.headers.get('stripe-signature') || '';
    const payload = await req.text();
    const verified = await verifyStripeSignature(payload, signature, webhookSecret);
    if (!verified) return json({ error: 'Invalid Stripe signature.' }, 400);

    const event = JSON.parse(payload);
    if (event.type !== 'checkout.session.completed') {
      return json({ received: true, ignored: event.type });
    }

    const session = event.data?.object || {};
    if (session.payment_status !== 'paid') {
      return json({ received: true, ignored: 'not_paid' });
    }

    const metadata = session.metadata || {};
    const orderId = String(metadata.order_id || '').trim();
    const orderNumber = String(metadata.order_number || '').trim();
    const userId = String(metadata.user_id || '').trim();
    const rewardCodeId = String(metadata.reward_code_id || '').trim();
    if (!orderId && !orderNumber) throw new Error('Stripe session has no order reference.');

    const orderFilter = orderId
      ? `id=eq.${encodeURIComponent(orderId)}`
      : `order_number=eq.${encodeURIComponent(orderNumber)}`;

    const orders = await fetchJson(
      `${supabaseUrl}/rest/v1/orders?${orderFilter}&select=id,user_id`,
      {
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );
    const order = Array.isArray(orders) ? orders[0] : null;
    if (!order) throw new Error('Order not found.');

    await fetchJson(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order.id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        payment_status: 'paid',
        status: 'processing',
        tracking_status: 'Order received',
        payment_reference: session.id,
        paid_at: new Date().toISOString(),
      }),
    });

    if (rewardCodeId) {
      await fetchJson(`${supabaseUrl}/rest/v1/reward_codes?id=eq.${encodeURIComponent(rewardCodeId)}&used_at=is.null`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
        },
        body: JSON.stringify({
          used_order_id: order.id,
          used_at: new Date().toISOString(),
        }),
      });
    }

    const accountUserId = userId || order.user_id;
    const generated = accountUserId
      ? await generateEarnedRewards(supabaseUrl, secretKey, accountUserId)
      : 0;

    return json({ received: true, order_id: order.id, generated_rewards: generated });
  } catch (error) {
    return json({ error: error.message }, 400);
  }
});
