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

function absoluteAssetUrl(path: unknown) {
  const value = String(path || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value.replaceAll(' ', '%20');
  const siteUrl = (Deno.env.get('SITE_URL') || 'https://ballforlife.store').replace(/\/+$/, '');
  return `${siteUrl}/${value.replace(/^\/+/, '').replaceAll(' ', '%20')}`;
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
  const siteUrl = (Deno.env.get('SITE_URL') || 'https://ballforlife.store').replace(/\/+$/, '');
  const trackUrl = `${siteUrl}/order-created.html?order=${encodeURIComponent(orderNumber)}`;
  const logoUrl = `${siteUrl}/brand-logo.png`;
  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #e8e8e2;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="78" valign="top">
              ${item.image ? `<img src="${escapeHtml(absoluteAssetUrl(item.image))}" width="64" alt="${escapeHtml(item.name || 'Ball For Life item')}" style="display:block;width:64px;height:64px;object-fit:cover;background:#f3f3ee;border:1px solid #e3e3dc;">` : ''}
            </td>
            <td valign="top" style="padding-left:${item.image ? '12px' : '0'};">
              <strong style="font-size:14px;line-height:1.35;">${escapeHtml(item.name || 'Ball For Life item')}</strong><br>
              <span style="display:block;margin-top:5px;font-size:12px;color:#666;line-height:1.5;">Size ${escapeHtml(item.size || 'N/A')} &bull; Qty ${Number(item.qty || 1)}</span>
              <span style="display:block;margin-top:3px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.08em;">Heavyweight 250 GSM &bull; 100% cotton</span>
            </td>
          </tr>
        </table>
      </td>
      <td valign="top" style="padding:14px 0;border-bottom:1px solid #e8e8e2;text-align:right;font-size:14px;font-weight:700;">${money(Number(item.price || 0) * Number(item.qty || 1))}</td>
    </tr>
  `).join('');

  const html = `
    <div style="margin:0;padding:0;background:#0b0b0b;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0b;">
        <tr>
          <td align="center" style="padding:28px 14px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#f7f7f2;color:#111;border:1px solid #282828;font-family:Arial,sans-serif;">
              <tr>
                <td align="center" style="padding:24px 22px 18px;background:#111;">
                  <img src="${logoUrl}" width="112" alt="Ball For Life" style="display:block;border:0;max-width:112px;height:auto;">
                </td>
              </tr>
              <tr>
                <td style="padding:30px 28px 24px;background:#111;color:#fff;">
                  <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#bdbdb6;">Order confirmed</p>
                  <h1 style="margin:0;font-size:34px;line-height:1.04;font-weight:900;letter-spacing:0;text-transform:uppercase;">Thanks for your order, ${escapeHtml(customerName)}.</h1>
                  <p style="margin:14px 0 0;color:#deded8;font-size:15px;line-height:1.6;">Your payment has gone through and your Ball For Life order is now being processed.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:22px 28px 0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff;border:1px solid #e1e1da;">
                    <tr>
                      <td style="padding:16px;">
                        <p style="margin:0 0 5px;color:#777;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Order number</p>
                        <p style="margin:0;font-size:18px;font-weight:900;font-family:Arial,sans-serif;">${escapeHtml(orderNumber)}</p>
                      </td>
                      <td align="right" style="padding:16px;">
                        <a href="${trackUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:.5px;text-transform:uppercase;padding:12px 16px;">View order</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:22px 28px 8px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="50%" valign="top" style="padding:14px;background:#ecece6;border:1px solid #deded7;">
                        <p style="margin:0 0 6px;color:#777;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;">Delivery estimate</p>
                        <p style="margin:0;font-size:14px;line-height:1.45;font-weight:700;">Usually 7-14 working days</p>
                      </td>
                      <td width="12"></td>
                      <td width="50%" valign="top" style="padding:14px;background:#ecece6;border:1px solid #deded7;">
                        <p style="margin:0 0 6px;color:#777;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;">Returns</p>
                        <p style="margin:0;font-size:14px;line-height:1.45;font-weight:700;">14-day change-of-mind returns</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px 0;">
                  <h2 style="margin:0 0 10px;font-size:18px;text-transform:uppercase;">Order summary</h2>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                    ${itemRows || '<tr><td style="padding:14px 0;border-bottom:1px solid #e8e8e2;">Ball For Life order</td></tr>'}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px 0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:2px solid #111;padding-top:12px;">
                    <tr><td style="padding:5px 0;color:#555;">Subtotal</td><td align="right" style="padding:5px 0;font-weight:700;">${money(order.subtotal_gbp)}</td></tr>
                    <tr><td style="padding:5px 0;color:#555;">Delivery</td><td align="right" style="padding:5px 0;font-weight:700;">${Number(order.shipping_gbp || 0) === 0 ? 'Free' : money(order.shipping_gbp)}</td></tr>
                    ${Number(order.discount_gbp || 0) > 0 ? `<tr><td style="padding:5px 0;color:#555;">Discount</td><td align="right" style="padding:5px 0;font-weight:700;">-${money(order.discount_gbp)}</td></tr>` : ''}
                    <tr><td style="padding:12px 0 0;font-size:18px;font-weight:900;">Total paid</td><td align="right" style="padding:12px 0 0;font-size:18px;font-weight:900;">${money(order.total_gbp || order.subtotal_gbp)}</td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 28px 28px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#111;color:#fff;">
                    <tr>
                      <td style="padding:18px 16px;">
                        <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#aaa;">Need help?</p>
                        <p style="margin:0;font-size:14px;line-height:1.55;">Reply to this email with your order number and we will help you out.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px;background:#0b0b0b;color:#85857d;font-size:12px;line-height:1.6;text-align:center;">
                  Ball For Life &bull; Premium graphic streetwear<br>
                  Secure checkout &bull; Heavyweight cotton &bull; UK shipping
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
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
