# Store Shopping Path Polish

Mode: Persuade on the homepage and collection; Operate during selection and checkout.

This is refinement of the established black-and-white BFL editorial system. Preserve the current logos, real images, compact reviews, catalogue, price rules, backend and factual policies. No new identity or fabricated commercial claim is authorised by this pass.

## Purpose

Keep the garment visible, answer practical purchase questions at the decision point, and add useful discovery rather than decorative animation. The small surprise is instant visual product search from the actual local catalogue.

## Shipped Behaviour

- The homepage retains the user's `hhh.jpg` photograph, served as optimised 1920px and 960px WebP variants. Mobile framing keeps the wearer in view and leaves the New Arrivals heading visible below the hero and factual reassurance row.
- The cotton/returns/support row uses genuine product specifications and links to existing cancellation information and WhatsApp. It is an unframed band, not a stack of trust-badge cards.
- Search offers up to six real product matches, image links, a result count and a recovery link for empty searches. Normal search submission remains available.
- Quick add is a native modal, positioned as a bottom sheet on phones. It requires a size, includes an inline size guide and confirms the selected size in the purchase action.
- Tee measurements are owned by `TEE_MEASUREMENTS` in `public/product.js` and exported to the static catalogue for quick add. They remain tee-specific, not a universal future-clothing guide.
- Only the three products with supplied community proof receive a wearer link. The link names the actual person/location and targets that review's homepage anchor.
- Product returns and sizing support link to existing customer-care destinations. Checkout shows the selected item image without changing amounts or payment behaviour.
- The first-visit newsletter is homepage-only, requires browsing New Arrivals and at least 15 seconds, and does not interrupt an active form, bag, menu or modal. It remains dismissible and respects the existing seen flag.

## Source And Provenance

Shared styling: `public/store-design.css`. Search: `public/store-ui.js`. Quick add and newsletter: `public/script.js`. Purchase selection: `public/product.js`. Summary imagery: `public/checkout.js`.

`tools/finish-polish.cjs` creates WebP assets from the user's existing `public/hhh.jpg`, exports supplied tee measurements, generates icons from the bundled Lucide library and bumps cache versions. No new imagery or font family is introduced. Existing shared compilers preserve the catalogue measurements and current styling version.

## Validation Boundary

The browser checks cover 320, 390, 768, 1024 and 1440px, touch-phone layout, landscape hero, search results/empty recovery, quick-add sizing, colour/size persistence, bag quantities, populated checkout, coming-soon categories, reduced motion and the delayed newsletter. Supabase requests are blocked during these checks; no live payment, email or order is generated. A local pass does not establish a conversion-rate uplift or verify live Stripe/Supabase services.
