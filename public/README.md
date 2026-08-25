# Ball For Life

Static ecommerce storefront for Ball For Life.

## Deploy Notes

- Host the site folder on Cloudflare Pages.
- Build command: leave blank.
- Build output directory: leave blank or use `/`.
- After Cloudflare gives you the live URL, update the Supabase Edge Function secret:
  - `SITE_URL=https://your-cloudflare-pages-url.pages.dev`
- Keep Stripe secret keys in Supabase Edge Function secrets only.

## Backend

Supabase handles:

- Account login
- Order history
- Admin order/tracking updates
- Stripe Checkout Session creation through `create-checkout-session`
