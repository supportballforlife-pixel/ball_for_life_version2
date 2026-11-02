const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

function getProjectSecretKey() {
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (secretKeys) {
    try { const parsed = JSON.parse(secretKeys); if (parsed.default) return parsed.default } catch (_) {}
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
}

async function upsertChristmasDrawEntry(supabaseUrl: string, secretKey: string, email: string, marketingOptIn: boolean) {
  const headers = { apikey: secretKey, Authorization: `Bearer ${secretKey}` }
  const existingRes = await fetch(`${supabaseUrl}/rest/v1/christmas_draw_entries?email=eq.${encodeURIComponent(email)}&select=id`, { headers })
  if (!existingRes.ok) throw new Error('Could not check draw entry.')
  const existingRows = await existingRes.json()
  if (Array.isArray(existingRows) && existingRows[0]) return false

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/christmas_draw_entries`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ email, marketing_opted_in: marketingOptIn, terms_accepted_at: new Date().toISOString() }),
  })
  if (!insertRes.ok) throw new Error('Could not save draw entry.')
  return true
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const source = String(body.source || 'unknown').trim()
    const campaign = String(body.campaign || '').trim()
    const isChristmasDraw = campaign === 'christmas_2026'
    const marketingOptIn = body.marketing_opt_in === true
    const christmasDrawEndsAt = new Date('2026-12-24T23:59:59+00:00')

    if (!email) return json({ error: 'Email is required.' }, 400)
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Please enter a valid email address.' }, 400)
    if (isChristmasDraw && body.accepted_draw_terms !== true) return json({ error: 'You must accept the draw terms to enter.' }, 400)
    if (isChristmasDraw && Date.now() > christmasDrawEndsAt.getTime()) return json({ error: 'The Christmas Draw has now closed.' }, 400)
    if (!new Set(['homepage_newsletter', 'first_visit_popup', 'christmas_2026_popup', 'unknown']).has(source)) return json({ error: 'Invalid signup source.' }, 400)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const secretKey = getProjectSecretKey()
    if (!supabaseUrl || !secretKey) return json({ error: 'Signup service is not configured.' }, 500)

    const drawEntryCreated = isChristmasDraw ? await upsertChristmasDrawEntry(supabaseUrl, secretKey, email, marketingOptIn) : false

    // Entering the draw alone never opts a person into marketing.
    if (!marketingOptIn) return json({ ok: true, already_subscribed: false, draw_entry_created: drawEntryCreated })

    const headers = { apikey: secretKey, Authorization: `Bearer ${secretKey}` }
    const existingRes = await fetch(`${supabaseUrl}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}&select=id`, { headers })
    const existingRows = existingRes.ok ? await existingRes.json() : []
    const existing = Array.isArray(existingRows) ? existingRows[0] : null
    if (existing) {
      const patchRes = await fetch(`${supabaseUrl}/rest/v1/newsletter_subscribers?id=eq.${encodeURIComponent(existing.id)}`, {
        method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_source: source, updated_at: new Date().toISOString(), is_subscribed: true }),
      })
      if (!patchRes.ok) return json({ error: 'Could not update subscription.' }, 500)
      return json({ ok: true, already_subscribed: true, draw_entry_created: drawEntryCreated })
    }
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/newsletter_subscribers`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, first_source: source, last_source: source, is_subscribed: true }),
    })
    if (!insertRes.ok) return json({ error: 'Could not save subscription.' }, 500)
    return json({ ok: true, already_subscribed: false, draw_entry_created: drawEntryCreated })
  } catch (error) {
    console.error(error)
    return json({ error: error instanceof Error ? error.message : 'Unexpected server error.' }, 500)
  }
})
