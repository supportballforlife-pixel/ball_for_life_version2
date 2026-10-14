# Fashion Refinement

Mode: Persuade on the homepage and collection; preserve the existing purchase flow.

## Confirmed Direction

Premium fashion-led refinement of the established BFL identity, not a new visual world. The user explicitly chose to keep the original BFL header logo. The supplied handwritten mark replaces the homepage's typeset brand title; the supplied loop mark appears once in the newsletter band. Medium-weight Inter shopping headings, neutral cool surfaces and clear product labels make the authentic photography the focus. Existing fonts, customer content, pricing and commerce rules remain.

## Latest Requirements

- Remove the More Than Basketball photo band and its reveal observer. Homepage flow is Hero, New Arrivals, white customer reviews, Shop by Category, newsletter and footer.
- Keep the real three reviews, customer attribution, video playback, photo slides, product links and accessible mobile carousel controls. No new review claims.
- Homepage arrivals contain the Hooper Set and newest tees, not separate hoodie/bottoms cards. Both pieces remain in collections and linked from the set page; set size selectors remain independent.
- Follow-up: the homepage heading is Best Selling, a user-curated selection of Hooper Set, GOAT Kobe x Jordan, No Wasted Potential and original LaMelo Ball tees. This is not an automatic sales-rank calculation. Review video thumbnails fill their slots without grey letterboxing; the full-screen viewer preserves the whole clip.
- Rename the bottoms to Ball For Life Un-Guardable Hooper Sweatpants without changing their product ID, price, colour, sizes or historical order data.
- Preserve the user's concurrent desktop hero photo and HOOPERS EXCLUSIVE line. Keep the original BFL header logo as selected.

## Implementation

`public/store-design.css` owns the shared refinement. `public/index.html` owns the hero and homepage sequence. `public/product.js` and `partials/hooper-cards.html` own the renamed product. `tools/add-hooper-drop.cjs` keeps separate homepage/collection card choices on rebuild. `tools/refine-fashion.cjs` optimises the actual supplied logos and refreshes cache versions. Asset origins and processing are in `fashion-assets.json`; no generated lettering or images were used.

`PRODUCT.md`, normative `DESIGN.md` and `.impeccable/design.json` record the authorised typography and surface changes. Preserve all other current work; no deployment, payment, real order or email has been performed.

## Evidence

Browser report: `C:/Users/sue25000644/Documents/Codex/2026-08-25/tghis/outputs/fashion-refinement/report.json`, 60 route/viewport combinations at 320/390/768/1024/1440px, 215 checks, no JavaScript errors or page overflow. Review-control report: `outputs/fashion-refinement/reviews/report.json`, 46 checks covering swipe, photo slides, full viewer, video controls, product links and reduced motion at 375/390/768/1024/1440px. Backend requests were blocked.

Current homepage captures are in `outputs/fashion-refinement/reviews/homepage-1440.png` and `homepage-390.png`. Root `hero-*.png` files are exact first-viewport crops of those settled captures. Product-page full mobile captures contain the usual fixed-bar full-page capture artifact; it is not document clipping.

The standalone Impeccable detector could not run because its engine is absent and the cache path is not writable. Fresh visual finish review returned SHIP after 17 required screenshots, with no material findings. Reviewed scope: authorised Inter typography and paper/surface/divider changes; original BFL header, supplied handwritten hero and newsletter loop; More Than Basketball removal; white customer reviews; homepage Hooper Set and newest tees rather than separate garments; Ball For Life Un-Guardable Hooper Sweatpants rename. Do not interpret passing functional checks as a conversion-rate claim.
