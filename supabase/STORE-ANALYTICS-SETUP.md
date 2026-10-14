# Store Activity Setup

## Enable the Backend

1. Open the Ball For Life project in Supabase, then SQL Editor > New query.
2. Open `supabase/store-analytics.sql`, paste its contents and run the full query.
3. Publish the updated `public` folder through the usual GitHub/Cloudflare deployment.
4. Sign in to `admin.html`. The Store activity section refreshes every 30 seconds.

No new API secret, Edge Function deployment or paid analytics service is required. The existing admin email allowlist and orders table must already exist. Run this migration after the base schema if you rerun the base schema later: the base schema contains the deprecated visitor collector's old permissions.

The downloadable `public/store-analytics.sql` is a generated copy of the canonical SQL above. `tools/update-store-shell.cjs --shell-only` keeps it synchronised while compiling the footer and privacy script into the store pages.

## Test the Published Store

- Open the homepage in a private browser window. Before a cookie choice, no optional analytics request or browser identifier should be created.
- Choose Reject analytics. The store should work normally and the newsletter invitation should appear after about eight seconds, when no other dialog or form interaction is active.
- Close the invitation and refresh: it should not reappear during that browser-tab visit. A successful signup on this browser suppresses future automatic invitations, including the footer signup form. Existing subscribers on another device cannot be recognised until they submit their email there.
- Open Cookie settings in the footer, enable Store analytics and save. Browse a product, add it to the bag and visit checkout. Within 30 seconds those events should appear in admin.
- Reject analytics again in Cookie settings. The analytics browser and visit identifiers should be removed and further events should stop.
- A visitor who rejects tracking will not appear in live visitor counts. The owner viewing admin is also excluded from tracking.

## What the Metrics Mean

- Live visitors: distinct opted-in browsers active in the past minute.
- Visitors: distinct opted-in browsers with events in the selected UK-time period, not identified people.
- Page/product views and bag actions: actual recorded actions, not 25-second heartbeat counts. Checkout visits include repeat visits.
- Payment starts: a checkout URL was successfully generated and the browser attempted to redirect; this is not payment confirmation.
- Paid orders and paid revenue: all orders marked `payment_status = 'paid'`, using `paid_at` (or creation time for legacy rows). Includes delivery, before costs; not net profit or revenue after later refunds.
- Traffic sources: referring hostname only; direct, same-site and referrers stripped by browsers appear together. Device/source counts use one session per browser and will not necessarily add up to event counts.

Activity is client-reported and can be blocked or manipulated. Never use it to settle affiliate payouts or determine whether a customer paid. No conversion percentage divides all sales by only opted-in visitors.

## Privacy and Permissions

- Optional analytics defaults off. The saved versioned choice expires after 180 days; the random browser ID after 90 days; the visit ID after 30 minutes of inactivity or the end of the browser session.
- The collector receives canonical route names, public product IDs, bounded quantities, broad device type and external referrer hostname. It does not receive account identity, full query strings, form entries or payment details. Newsletter emails are still handled separately by the existing signup function.
- Supabase tables have RLS enabled and no direct anon/authenticated grants. Collection is write-only through a validated, size-limited RPC. Reports verify `admin_emails` and are denied to anonymous and non-admin users.
- Old visitor table rows are preserved. The old public collector and direct-write permissions are disabled by the migration. Review any historical personal data separately; this migration does not silently erase it.
- Rows older than 90 days are cleaned on incoming activity. On an inactive store, cleanup waits for the next collection request. Consent withdrawal stops new collection and clears the current browser identifiers, but does not delete prior records automatically.
- The public collector bounds events per session but is not bot-proof. A production WAF/rate rule can provide additional protection if abuse appears.

The privacy policy now describes this implementation. This change is not a legal certification of the whole store; have the policy reviewed for the business's wider data processing if needed.
