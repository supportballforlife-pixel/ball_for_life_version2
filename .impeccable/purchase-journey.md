# Product-to-Checkout Refinement

Date: 16 October 2026.
Mode: Persuade for product/customer media; Operate for checkout.

## Approved Scope

The user approved the five priorities from the preceding design assessment: tighter mobile reviews, a more compact mobile purchase area, less repetitive checkout, T-jay's photos on the matching Curry product, and genuine review presentation without unsupported ratings. This is refinement of the existing black/white BFL system, not a whole-site replacement. Preserve prices, options, product identity, cart payloads, guest checkout, delivery/returns wording and the GBP65 after-discount shipping threshold.

## Shipped Locally

- Phone product galleries use a contained square image rather than the taller 4:5 panel. The existing customer referral link follows the purchase controls instead of delaying the product title beneath the gallery.
- Phones show five 44px colour swatches and a count disclosure. All colours remain selectable. Folding the list retains the selected extra colour among the visible five; larger screens still show the full list.
- Stephen Curry Variant 2 includes front/back plus T-jay's fit, sleeve and print photos in its existing gallery. Arrows, touch handlers, thumbnails and zoom follow the active image. Customer-photo captions explicitly identify Black; browsing them never changes the selected merchandise colour/size or the front image used in the bag.
- Original JPEGs are retained. `tools/build-customer-gallery.cjs` follows the repository's BFL_DEPENDENCIES/Sharp convention and creates WebP display images and 160px thumbnails. Three originals total 798666 bytes, display derivatives 567608 bytes and thumbnails 27778 bytes. No AI alteration or invented customer photography.
- A native checkout details disclosure starts folded at <=600px, open above that. The total, applied discount, delivery estimate and returns remain visible outside it. Contact fields are reached sooner. The order count reflects item quantities, the payment logo row appears once, and the existing order cutoff line sits beneath the payment action.
- Review cards use natural content rows. Their shop links follow their actual image/copy rather than a stretched filler row. Decorative star ratings are removed from the shared partial and compiled homepage/reviews page; genuine quotes, attributions, product links and both videos remain.
- CSS/product/checkout asset versions are purchase1. Active community, welcome and shell generators emit consistent versions. Other historical one-off generators were not broadly rewritten.

## Verification

`check-purchase-journey.cjs` in the Codex workspace passed 228 assertions, with no JavaScript errors or missing local assets. Product widths: 320, 390, 430, 600, 768, 1024 and 1440px. Checks cover full/compact colour choices, selected extra colours, actual customer image loading, gallery cycling and simulated touch events, zoom, customer-photo/variant independence, cart images and sizes, all other garment galleries, independent set sizing, native keyboard disclosure behaviour, summary defaults and resizing, preserved discounts and UK/international shipping, and a mocked/retryable guest payment request.

Existing `check-store-mobile-media.cjs --behaviour-only` also passed after the layout changes, checking real advancing muted video playback, offscreen pause, rapid review navigation, manual pause, dialogs, reduced motion and empty/populated checkout. The isolated set checkout payload test passed. No real payment, order, email or database write was performed; external services were blocked or mocked.

Screenshots and the current report are in `C:/Users/sue25000644/Documents/Codex/2026-08-25/tghis/outputs/purchase-journey/`. One batched inspection and one confirmation were used; the inspection's low-contrast photo caption was corrected with a compact white backing. Browser screenshots/tests use local Edge with mobile/touch emulation, not physical iPhone/Safari verification. Earlier native-browser local-server access and the Impeccable engine were unavailable in this session; do not claim a successful detector scan or physical-device test.

## Deployment and Limits

Saved local project changes only. No commit, push or Cloudflare deployment was performed. Publish source and all six new WebP assets through the normal store deployment before expecting the live phone view to change. Genuine customer testing and live funnel data are still needed to judge conversion; passing functional tests is not a claim of a perfect store or guaranteed sales uplift.
