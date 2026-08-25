const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const siteUrl = Deno.env.get('SITE_URL');

    if (!stripeKey) throw new Error('Missing STRIPE_SECRET_KEY secret.');
    if (!siteUrl) throw new Error('Missing SITE_URL secret.');

    const body = await req.json();
    const orderNumber = String(body.order_number || '').trim();
    const customerEmail = String(body.customer_email || '').trim();
    const subtotalGbp = Number(body.subtotal_gbp || 0);
    const shippingCountry = String(body.shipping_country || '').trim();
    const shippingGbp = subtotalGbp >= 50 ? 0 : 4.99;
    const totalGbp = Number((subtotalGbp + shippingGbp).toFixed(2));
    const amountPence = Math.round(totalGbp * 100);

    if (!orderNumber) throw new Error('Missing order number.');
    if (!Number.isFinite(subtotalGbp) || subtotalGbp <= 0) throw new Error('Invalid order subtotal.');
    if (!shippingCountry) throw new Error('Missing shipping country.');

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
    params.set('metadata[subtotal_gbp]', subtotalGbp.toFixed(2));
    params.set('metadata[shipping_gbp]', shippingGbp.toFixed(2));
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

    return new Response(JSON.stringify({ url: session.url, id: session.id, subtotal_gbp: subtotalGbp, shipping_gbp: shippingGbp, total_gbp: totalGbp }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
