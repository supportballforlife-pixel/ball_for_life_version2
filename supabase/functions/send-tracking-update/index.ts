const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

async function fetchJson(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || data?.error || `Request failed with ${response.status}`);
  return data;
}

async function getUser(supabaseUrl: string, secretKey: string, req: Request) {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token || token.startsWith('sb_')) return null;

  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;
  return await res.json();
}

function escapeHtml(value: unknown) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function trackingIntro(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('shipped')) return 'Your order has been shipped.';
  if (normalized.includes('out for delivery')) return 'Your order is out for delivery.';
  if (normalized.includes('delivered')) return 'Your order has been marked as delivered.';
  if (normalized.includes('processing')) return 'Your order is now being prepared.';
  return 'Your order status has been updated.';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const secretKey = getProjectSecretKey();
    const resendKey = Deno.env.get('RESEND_API_KEY') || '';
    const siteUrl = (Deno.env.get('SITE_URL') || 'https://ballforlife.store').replace(/\/+$/, '');

    if (!supabaseUrl || !secretKey) throw new Error('Supabase server secrets are missing.');
    if (!resendKey) throw new Error('RESEND_API_KEY is missing.');

    const user = await getUser(supabaseUrl, secretKey, req);
    const adminEmail = String(user?.email || '').trim().toLowerCase();
    if (!adminEmail) throw new Error('You must be logged in as an admin.');

    const adminRows = await fetchJson(
      `${supabaseUrl}/rest/v1/admin_emails?email=ilike.${encodeURIComponent(adminEmail)}&select=email`,
      {
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );
    if (!Array.isArray(adminRows) || !adminRows.length) throw new Error('Only admins can send tracking emails.');

    const body = await req.json();
    const orderId = String(body.order_id || '').trim();
    if (!orderId) throw new Error('Missing order id.');

    const orders = await fetchJson(
      `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=id,order_number,shipping_name,shipping_email,tracking_status,tracking_number,payment_status`,
      {
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );
    const order = Array.isArray(orders) ? orders[0] : null;
    if (!order) throw new Error('Order not found.');

    const toEmail = String(order.shipping_email || '').trim();
    if (!toEmail) throw new Error('This order does not have a customer email.');
    if (order.payment_status !== 'paid') throw new Error('Tracking emails only send for paid orders.');

    const orderNumber = String(order.order_number || 'your order');
    const customerName = String(order.shipping_name || 'there').trim();
    const trackingStatus = String(order.tracking_status || 'Updated').trim();
    const trackingNumber = String(order.tracking_number || '').trim();
    const trackUrl = `${siteUrl}/order-created.html?order=${encodeURIComponent(orderNumber)}`;
    const logoUrl = `${siteUrl}/brand-logo.png`;
    const fromEmail = Deno.env.get('ORDER_FROM_EMAIL') || 'Ball For Life <orders@ballforlife.store>';
    const replyTo = Deno.env.get('ORDER_REPLY_TO_EMAIL') || 'supportballforlife@gmail.com';

    const html = `
      <div style="margin:0;padding:0;background:#0b0b0b;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0b;">
          <tr>
            <td align="center" style="padding:28px 14px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#f7f7f2;color:#111;border:1px solid #282828;font-family:Arial,sans-serif;">
                <tr>
                  <td align="center" style="padding:24px 22px 18px;background:#111;">
                    <img src="${logoUrl}" width="112" alt="Ball For Life" style="display:block;border:0;max-width:112px;height:auto;">
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px 28px 24px;background:#111;color:#fff;">
                    <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#bdbdb6;">Tracking update</p>
                    <h1 style="margin:0;font-size:34px;line-height:1.04;font-weight:900;letter-spacing:0;text-transform:uppercase;">${escapeHtml(trackingIntro(trackingStatus))}</h1>
                    <p style="margin:14px 0 0;color:#deded8;font-size:15px;line-height:1.6;">Hi ${escapeHtml(customerName)}, we have updated your Ball For Life order.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 28px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff;border:1px solid #e1e1da;">
                      <tr>
                        <td style="padding:16px;">
                          <p style="margin:0 0 5px;color:#777;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Order number</p>
                          <p style="margin:0;font-size:18px;font-weight:900;">${escapeHtml(orderNumber)}</p>
                        </td>
                        <td align="right" style="padding:16px;">
                          <a href="${trackUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:.5px;text-transform:uppercase;padding:12px 16px;">View order</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ecece6;border:1px solid #deded7;">
                      <tr>
                        <td style="padding:18px;">
                          <p style="margin:0 0 6px;color:#777;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;">Current status</p>
                          <p style="margin:0;font-size:18px;line-height:1.4;font-weight:900;">${escapeHtml(trackingStatus)}</p>
                          ${trackingNumber ? `
                            <p style="margin:16px 0 6px;color:#777;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;">Tracking number</p>
                            <p style="margin:0;font-size:16px;line-height:1.4;font-weight:900;">${escapeHtml(trackingNumber)}</p>
                          ` : ''}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 28px 28px;color:#333;font-size:14px;line-height:1.7;">
                    <p style="margin:0;">You can use the View Order button to check the latest order status any time. If you need help, reply to this email with your order number.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px;background:#0b0b0b;color:#85857d;font-size:12px;line-height:1.6;text-align:center;">
                    Ball For Life &bull; Premium graphic streetwear<br>
                    Secure checkout &bull; Heavyweight cotton &bull; Order tracking
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    const text = `Ball For Life tracking update

Hi ${customerName},

${trackingIntro(trackingStatus)}
Order number: ${orderNumber}
Status: ${trackingStatus}
${trackingNumber ? `Tracking number: ${trackingNumber}\n` : ''}
View order: ${trackUrl}

Reply to this email if you need help.`;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: replyTo,
        subject: `Tracking update for your Ball For Life order ${orderNumber}`,
        html,
        text,
      }),
    });

    const emailData = await emailRes.json().catch(() => null);
    if (!emailRes.ok) throw new Error(emailData?.message || emailData?.error || 'Tracking email failed.');

    return json({ ok: true, email_id: emailData?.id || null });
  } catch (error) {
    return json({ ok: false, error: error.message }, 400);
  }
});