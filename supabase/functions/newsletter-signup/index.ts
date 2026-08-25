const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function getProjectSecretKey() {
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys)
      if (parsed.default) return parsed.default
    } catch (_) {}
  }

  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  try {
    const body = await req.json()

    const email = String(body.email || '').trim().toLowerCase()
    const source = String(body.source || 'unknown').trim()

    if (!email) {
      return json({ error: 'Email is required.' }, 400)
    }

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Please enter a valid email address.' }, 400)
    }

    const allowedSources = new Set([
      'homepage_newsletter',
      'first_visit_popup',
      'unknown',
    ])

    if (!allowedSources.has(source)) {
      return json({ error: 'Invalid signup source.' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const secretKey = getProjectSecretKey()

    if (!supabaseUrl || !secretKey) {
      console.error('Missing Supabase server environment variables')
      return json({ error: 'Signup service is not configured.' }, 500)
    }

    // Check first so the website can tell an existing subscriber from a new one.
    const existingRes = await fetch(
      `${supabaseUrl}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}&select=id,email,is_subscribed`,
      {
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
        },
      }
    )

    const existingRows = existingRes.ok ? await existingRes.json() : []
    const existing = Array.isArray(existingRows) ? existingRows[0] : null

    if (existing) {
      const patchRes = await fetch(
        `${supabaseUrl}/rest/v1/newsletter_subscribers?id=eq.${encodeURIComponent(existing.id)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: secretKey,
            Authorization: `Bearer ${secretKey}`,
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            last_source: source,
            updated_at: new Date().toISOString(),
            is_subscribed: true,
          }),
        }
      )

      if (!patchRes.ok) {
        console.error('Subscriber update failed', await patchRes.text())
        return json({ error: 'Could not update subscription.' }, 500)
      }

      return json({
        ok: true,
        already_subscribed: true,
      })
    }

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/newsletter_subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        email,
        first_source: source,
        last_source: source,
        is_subscribed: true,
      }),
    })

    if (!insertRes.ok) {
      console.error('Subscriber insert failed', await insertRes.text())
      return json({ error: 'Could not save subscription.' }, 500)
    }

    return json({
      ok: true,
      already_subscribed: false,
    })
  } catch (error) {
    console.error(error)
    return json({ error: 'Unexpected server error.' }, 500)
  }
})
