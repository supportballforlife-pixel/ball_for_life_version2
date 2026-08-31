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

function clampMoney(value: number) {
  return Number(Math.max(0, value).toFixed(2));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    const siteUrl = Deno.env.get('SITE_URL') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const secretKey = getProjectSecretKey();

    if (!stripeKey) throw new Error('Missing STRIPE_SECRET_KEY secret.');
    if (!siteUrl) throw new Error('Missing SITE_URL secret.');
    if (!supabaseUrl || !secretKey) throw new Error('Missing Supabase server secrets.');

    const body = await req.json();
    const user = await getUser(supabaseUrl, secretKey, req);
    const orderNumber = String(body.order_number || '').trim();
    const customerEmail = String(body.customer_email || '').trim();
    const subtotalGbp = clampMoney(Number(body.subtotal_gbp || 0));
    const shippingCountry = String(body.shipping_country || '').trim();
    const rewardCodeInput = String(body.reward_code || '').trim().toUpperCase();
    const shippingGbp = subtotalGbp >= 50 ? 0 : 4.99;
    let discountGbp = 0;
    let rewardCodeId: string | null = null;
    let rewardCode: string | null = null;

    if (!orderNumber) throw new Error('Missing order number.');
    if (!Number.isFinite(subtotalGbp) || subtotalGbp <= 0) throw new Error('Invalid order subtotal.');
    if (!shippingCountry) throw new Error('Missing shipping country.');

    if (rewardCodeInput) {
      if (!user?.id) throw new Error('Log in to use a reward code.');

      const rewardRes = await fetch(
        `${supabaseUrl}/rest/v1/reward_codes?code=eq.${encodeURIComponent(rewardCodeInput)}&user_id=eq.${encodeURIComponent(user.id)}&used_at=is.null&select=id,code,discount_percent`,
        {
          headers: {
            apikey: secretKey,
            Authorization: `Bearer ${secretKey}`,
          },
        },
      );
      const rewards = await rewardRes.json();
      const reward = Array.isArray(rewards) ? rewards[0] : null;
      if (!rewardRes.ok || !reward) throw new Error('That reward code is not valid for this account.');

      rewardCodeId = reward.id;
      rewardCode = reward.code;
      discountGbp = clampMoney(subtotalGbp * (Number(reward.discount_percent || 10) / 100));
    }

    const totalGbp = clampMoney(subtotalGbp + shippingGbp - discountGbp);
    const amountPence = Math.round(totalGbp * 100);
    if (amountPence < 50) throw new Error('Order total is too low for secure payment.');

    const orderPayload = {
      user_id: user?.id || null,
      order_number: orderNumber,
      items: body.items || [],
      subtotal_gbp: subtotalGbp,
      shipping_gbp: shippingGbp,
      discount_gbp: discountGbp,
      total_gbp: totalGbp,
      status: 'pending-payment',
      tracking_status: 'Waiting for payment',
      payment_status: 'pending_payment',
      reward_code: rewardCode,
      reward_code_id: rewardCodeId,
      shipping_name: String(body.shipping_name || '').trim(),
      shipping_email: customerEmail,
      shipping_phone: String(body.shipping_phone || '').trim(),
      shipping_address: String(body.shipping_address || '').trim(),
      shipping_city: String(body.shipping_city || '').trim(),
      shipping_postcode: String(body.shipping_postcode || '').trim(),
      shipping_country: shippingCountry,
    };

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(orderPayload),
    });
    const inserted = await insertRes.json();
    if (!insertRes.ok) {
      throw new Error(inserted.message || inserted.error || 'Could not save order.');
    }
    const order = Array.isArray(inserted) ? inserted[0] : inserted;

    const params = new URLSearchParams();
    params.set('mode', 'payment');
    params.set('success_url', `${siteUrl}/order-created.html?order=${encodeURIComponent(orderNumber)}&paid=1`);
    params.set('cancel_url', `${siteUrl}/checkout.html?cancelled=1`);
    params.set('client_reference_id', orderNumber);
    params.set('line_items[0][quantity]', '1');
    params.set('line_items[0][price_data][currency]', 'gbp');
    params.set('line_items[0][price_data][unit_amount]', String(amountPence));
    params.set('line_items[0][price_data][product_data][name]', `Ball For Life order ${orderNumber}`);
    params.set('metadata[order_number]', orderNumber);
    params.set('metadata[order_id]', order.id);
    params.set('metadata[user_id]', user?.id || '');
    params.set('metadata[reward_code_id]', rewardCodeId || '');
    params.set('metadata[reward_code]', rewardCode || '');
    params.set('metadata[subtotal_gbp]', subtotalGbp.toFixed(2));
    params.set('metadata[shipping_gbp]', shippingGbp.toFixed(2));
    params.set('metadata[discount_gbp]', discountGbp.toFixed(2));
    params.set('metadata[total_gbp]', totalGbp.toFixed(2));
    params.set('metadata[shipping_country]', shippingCountry);
    if (customerEmail) params.set('customer_email', customerEmail);

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const session = await stripeResponse.json();
    if (!stripeResponse.ok) {
      throw new Error(session.error?.message || 'Stripe could not create checkout.');
    }

    const paymentLinkUpdate = fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order.id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        payment_url: session.url,
        payment_reference: session.id,
      }),
    }).catch((error) => console.error('Could not update order payment link', error));

    EdgeRuntime.waitUntil(paymentLinkUpdate);

    return json({
      url: session.url,
      id: session.id,
      order: { ...order, payment_url: session.url, payment_reference: session.id },
      subtotal_gbp: subtotalGbp,
      shipping_gbp: shippingGbp,
      discount_gbp: discountGbp,
      total_gbp: totalGbp,
      reward_code: rewardCode,
    });
  } catch (error) {
    return json({ error: error.message }, 400);
  }
});
