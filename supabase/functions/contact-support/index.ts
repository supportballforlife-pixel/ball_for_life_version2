const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SUPPORT_TO_EMAIL = 'supportballforlife@gmail.com'
const DEFAULT_FROM = 'Ball For Life Support <onboarding@resend.dev>'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getProjectSecretKey() {
  // New Supabase keys are exposed as a JSON map.
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys)
      if (parsed.default) return parsed.default
    } catch (_) {}
  }

  // Legacy fallback.
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const body = await req.json()

    // Honeypot. Real customers never see/fill this field.
    if (String(body.website || '').trim()) {
      return json({ ok: true })
    }

    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const orderNumber = String(body.order_number || '').trim()
    const reason = String(body.reason || '').trim()
    const message = String(body.message || '').trim()

    if (!name || !email || !reason || !message) {
      return json({ error: 'Please complete all required fields.' }, 400)
    }

    if (name.length > 120 || email.length > 254 || orderNumber.length > 100 || reason.length > 100 || message.length > 5000) {
      return json({ error: 'One or more fields are too long.' }, 400)
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Please enter a valid email address.' }, 400)
    }

    const allowedReasons = new Set([
      'Order Question',
      'Delivery / Missing Parcel',
      'Return',
      'Refund',
      'Damaged Item',
      'Wrong Item / Size / Colour',
      'Product Question',
      'Other',
    ])

    if (!allowedReasons.has(reason)) {
      return json({ error: 'Invalid support reason.' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const secretKey = getProjectSecretKey()
    const resendKey = Deno.env.get('RESEND_API_KEY') || ''
    const fromEmail = Deno.env.get('SUPPORT_FROM_EMAIL') || DEFAULT_FROM

    if (!supabaseUrl || !secretKey) {
      console.error('Missing Supabase server environment variables')
      return json({ error: 'Support service is not configured.' }, 500)
    }

    // 1) Save support request in Supabase.
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/support_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        name,
        email,
        order_number: orderNumber || null,
        reason,
        message,
        status: 'new',
      }),
    })

    const inserted = await insertRes.json()

    if (!insertRes.ok) {
      console.error('Supabase insert failed', inserted)
      return json({ error: 'We could not save your support request.' }, 500)
    }

    const row = Array.isArray(inserted) ? inserted[0] : inserted

    // 2) Email the support Gmail via Resend.
    let emailSent = false
    let resendEmailId: string | null = null

    if (resendKey) {
      const safeName = escapeHtml(name)
      const safeEmail = escapeHtml(email)
      const safeOrder = escapeHtml(orderNumber || 'N/A')
      const safeReason = escapeHtml(reason)
      const safeMessage = escapeHtml(message).replaceAll('\n', '<br>')

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [SUPPORT_TO_EMAIL],
          reply_to: email,
          subject: `Ball For Life Support — ${reason}${orderNumber ? ` — Order ${orderNumber}` : ''}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#111">
              <h2>New Ball For Life support request</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Customer email:</strong> ${safeEmail}</p>
              <p><strong>Order number:</strong> ${safeOrder}</p>
              <p><strong>Reason:</strong> ${safeReason}</p>
              <hr style="border:0;border-top:1px solid #ddd;margin:24px 0">
              <p><strong>Message</strong></p>
              <p style="line-height:1.6">${safeMessage}</p>
              <hr style="border:0;border-top:1px solid #ddd;margin:24px 0">
              <p style="font-size:12px;color:#666">Reply to this email normally in Gmail. The Reply-To address is set to the customer.</p>
            </div>
          `,
          text:
`New Ball For Life support request

Name: ${name}
Customer email: ${email}
Order number: ${orderNumber || 'N/A'}
Reason: ${reason}

Message:
${message}

Reply to this email normally. Reply-To is the customer.`,
        }),
      })

      const emailData = await emailRes.json()

      if (emailRes.ok) {
        emailSent = true
        resendEmailId = emailData.id || null
      } else {
        // Do NOT throw here: the support request is already safely stored.
        console.error('Resend failed', emailData)
      }
    } else {
      console.error('RESEND_API_KEY is not configured')
    }

    // 3) Record whether the email notification succeeded.
    if (row?.id) {
      await fetch(`${supabaseUrl}/rest/v1/support_requests?id=eq.${encodeURIComponent(row.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
        },
        body: JSON.stringify({
          email_sent: emailSent,
          resend_email_id: resendEmailId,
        }),
      })
    }

    return json({
      ok: true,
      request_id: row?.id || null,
      email_sent: emailSent,
    })
  } catch (error) {
    console.error(error)
    return json({ error: 'Unexpected server error.' }, 500)
  }
})
