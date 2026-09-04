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

const PUBLIC_PROMO_CODES: Record<string, number> = {
  TIKTOK10: 10,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const secretKey = getProjectSecretKey();
    if (!supabaseUrl || !secretKey) throw new Error('Reward service is not configured.');

    const body = await req.json();
    const code = String(body.code || '').trim().toUpperCase();
    const subtotalGbp = Number(body.subtotal_gbp || 0);
    if (!code) throw new Error('Enter a reward code.');
    if (!Number.isFinite(subtotalGbp) || subtotalGbp <= 0) throw new Error('Your bag is empty.');

    const publicPromoPercent = PUBLIC_PROMO_CODES[code];
    if (publicPromoPercent) {
      const discountGbp = Number((subtotalGbp * (publicPromoPercent / 100)).toFixed(2));
      return json({
        valid: true,
        code,
        discount_percent: publicPromoPercent,
        discount_gbp: discountGbp,
      });
    }

    const user = await getUser(supabaseUrl, secretKey, req);
    if (!user?.id) throw new Error('Log in to use an earned reward code.');

    const rewardRes = await fetch(
      `${supabaseUrl}/rest/v1/reward_codes?code=eq.${encodeURIComponent(code)}&user_id=eq.${encodeURIComponent(user.id)}&used_at=is.null&select=id,code,discount_percent`,
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

    const percent = Number(reward.discount_percent || 10);
    const discountGbp = Number((subtotalGbp * (percent / 100)).toFixed(2));
    return json({
      valid: true,
      code: reward.code,
      discount_percent: percent,
      discount_gbp: discountGbp,
    });
  } catch (error) {
    return json({ valid: false, error: error.message }, 400);
  }
});
