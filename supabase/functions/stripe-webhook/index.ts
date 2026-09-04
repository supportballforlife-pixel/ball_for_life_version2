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

function escapeHtml(value: unknown) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function money(value: unknown) {
  return `£${Number(value || 0).toFixed(2)}`;
}

async function fetchJson(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || data?.error || `Request failed with ${response.status}`);
  return data;
}

async function sendOrderConfirmationEmail(order: Record<string, any>) {
  const resendKey = Deno.env.get('RESEND_API_KEY') || '';
  const toEmail = String(order.shipping_email || '').trim();
  if (!resendKey || !toEmail) return;

  const fromEmail = Deno.env.get('ORDER_FROM_EMAIL') || 'Ball For Life <orders@ballforlife.store>';
  const replyTo = Deno.env.get('ORDER_REPLY_TO_EMAIL') || 'supportballforlife@gmail.com';
  const trustpilotBcc = Deno.env.get('TRUSTPILOT_BCC_EMAIL') || 'ballforlife.store+9f6d814841@invite.trustpilot.com';
  const orderNumber = String(order.order_number || 'your order');
  const customerName = String(order.shipping_name || 'there').trim();
  const items = Array.isArray(order.items) ? order.items : [];
  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee;">
        <strong>${escapeHtml(item.name || 'Ball For Life item')}</strong><br>
        <span style="font-size:12px;color:#666;">Size ${escapeHtml(item.size || 'N/A')} · Qty ${Number(item.qty || 1)}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;">${money(Number(item.price || 0) * Number(item.qty || 1))}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111;background:#fff;">
      <div style="padding:28px 0;border-bottom:1px solid #111;text-align:center;">
        <h1 style="margin:0;font-size:24px;letter-spacing:-0.02em;">Ball For Life</h1>
      </div>
      <div style="padding:28px 0;">
        <p style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#777;margin:0 0 14px;">Order confirmation</p>
        <h2 style="font-size:28px;line-height:1.1;margin:0 0 16px;">Thanks for your order, ${escapeHtml(customerName)}.</h2>
        <p style="line-height:1.6;margin:0 0 20px;">We have received your payment and your Ball For Life order is now being processed.</p>
        <div style="background:#f6f6f6;border:1px solid #e6e6e6;padding:16px;margin:20px 0;">
          <strong>Order number</strong><br>
          <span style="font-family:monospace;">${escapeHtml(orderNumber)}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:18px 0;">
          ${itemRows || '<tr><td style="padding:10px 0;">Ball For Life order</td></tr>'}
        </table>
        <div style="border-top:1px solid #111;padding-top:14px;">
          <p style="display:flex;justify-content:space-between;margin:7px 0;"><span>Subtotal</span><strong>${money(order.subtotal_gbp)}</strong></p>
          <p style="display:flex;justify-content:space-between;margin:7px 0;"><span>Delivery</span><strong>${Number(order.shipping_gbp || 0) === 0 ? 'Free' : money(order.shipping_gbp)}</strong></p>
          ${Number(order.discount_gbp || 0) > 0 ? `<p style="display:flex;justify-content:space-between;margin:7px 0;"><span>Discount</span><strong>-${money(order.discount_gbp)}</strong></p>` : ''}
          <p style="display:flex;justify-content:space-between;margin:13px 0 0;font-size:18px;"><span>Total</span><strong>${money(order.total_gbp || order.subtotal_gbp)}</strong></p>
        </div>
        <p style="line-height:1.6;margin:24px 0 0;color:#555;">You can reply to this email if you need help with your order.</p>
      </div>
      <div style="padding:18px 0;border-top:1px solid #eee;color:#777;font-size:12px;">
        Ball For Life · Premium graphic streetwear
      </div>
    </div>
  `;

  const text = `Ball For Life order confirmation

Thanks for your order, ${customerName}.
Order number: ${orderNumber}
Total: ${money(order.total_gbp || order.subtotal_gbp)}

Your order is now being processed. Reply to this email if you need help.`;

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      bcc: trustpilotBcc ? [trustpilotBcc] : undefined,
      reply_to: replyTo,
      subject: `Your Ball For Life order ${orderNumber}`,
      html,
      text,
    }),
  });

  const emailData = await emailRes.json().catch(() => null);
  if (!emailRes.ok) {
    console.error('Order confirmation email failed', emailData);
  }
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
      `${supabaseUrl}/rest/v1/orders?${orderFilter}&select=id,user_id,order_number,items,subtotal_gbp,shipping_gbp,discount_gbp,total_gbp,shipping_name,shipping_email,payment_status`,
      {
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );
    const order = Array.isArray(orders) ? orders[0] : null;
    if (!order) throw new Error('Order not found.');
    const shouldSendConfirmationEmail = order.payment_status !== 'paid';

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

    if (shouldSendConfirmationEmail) {
      EdgeRuntime.waitUntil(sendOrderConfirmationEmail({
        ...order,
        payment_reference: session.id,
      }));
    }

    return json({ received: true, order_id: order.id, generated_rewards: generated });
  } catch (error) {
    return json({ error: error.message }, 400);
  }
});
