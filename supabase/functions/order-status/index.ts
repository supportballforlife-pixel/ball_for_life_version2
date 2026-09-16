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

function cleanOrderNumber(value: unknown) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const secretKey = getProjectSecretKey();
    if (!supabaseUrl || !secretKey) throw new Error('Order status service is not configured.');

    const body = await req.json();
    const orderNumber = cleanOrderNumber(body.order_number);
    if (!orderNumber) throw new Error('Missing order number.');

    const response = await fetch(
      `${supabaseUrl}/rest/v1/orders?order_number=eq.${encodeURIComponent(orderNumber)}&select=order_number,subtotal_gbp,shipping_gbp,discount_gbp,total_gbp,status,tracking_status,tracking_number,payment_status,payment_url,payment_reference,reward_code,created_at`,
      {
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Could not load order status.');
    }

    const orders = await response.json();
    const order = Array.isArray(orders) ? orders[0] : null;
    if (!order) return json({ error: 'Order not found.' }, 404);

    return json({ order });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Could not load order status.' }, 400);
  }
});
