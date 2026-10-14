# Hooper Drop

Mode: Persuade.

## Request

Extend the established Ball For Life storefront with the Can't Rush Greatness Hooper Set and its separate pieces. Help mobile-first basketball and streetwear shoppers inspect the real garments, choose sizes and buy. This is an ordinary extension following a SHIP visual review; no system change is approved.

Scope compared: `public/product.js`, `public/store-design.css`, `partials/hooper-cards.html` and `public/shop.html`, against `PRODUCT.md`, normative `DESIGN.md` and `.impeccable/design.json`.

## Product Truth

| Product | Price | Supplied garment facts |
| --- | --- | --- |
| Can't Rush Greatness Hooper Set | GBP 84.99 | Sleeveless hoodie plus knee-length Hooper Sweatpants |
| Can't Rush Greatness Sleeveless Hoodie | GBP 44.99 | Sleeveless hooded top, front statement print and back BFL graphic |
| Hooper Sweatpants | GBP 49.99 | Around-the-knee length, not full-length trousers |

All three are Black in S/M/L/XL. The set requires independent hoodie and bottoms sizes. Garment fabric, GSM, care, measurements and genuine supplier shipping costs remain unsupplied; tee cotton/GSM, care and measurement charts do not apply.

## Inherited Direction

Retain the established editorial basketball streetwear identity: Barlow Condensed headings, Inter shopping controls, neutral shopping surfaces, sharp corners, thin dividers and authentic product imagery. The finished code reuses the existing palette variables, responsive merchandise grids, contained imagery, primary purchase action, selected-size states, front/back controls, zoom, details accordions and mobile purchase bar. `DESIGN.md` owns normative tokens and `.impeccable/design.json` owns its extensions; this brief adds no global tokens or rules.

## Changes

- Add the three products to New Arrivals, Tracksuits, relevant Hoodies filtering, navigation and search; preserve four visible homepage arrivals and the tee catalogue.
- Show both actual garments together through paired HTML images in set cards, gallery, front/back thumbnails, zoom, shopping bag and checkout. The set gallery's local 5:4 panel adapts the incumbent contained-image component; merchandise cards retain their existing proportions.
- Require both set sizes before Add to Bag and carry the chosen options, product identity, both images and correct price through cart and checkout. Separate pieces use their own S/M/L/XL options.
- Bypass historical tee-only sales for the new garments. Existing customer shipping calculation and the qualifying free UK shipping threshold remain connected.
- Admin production estimates are GBP 22.71 for the hoodie, GBP 27.59 for bottoms and GBP 50.30 for the set. Shipping, net profit and payout estimates wait for genuine garment supplier shipping costs instead of applying tee rates.

## Assets

Only the four user-supplied front/back PNGs listed in `hooper-assets.json` supply garment pictures. Each 1400px square source becomes a proportional 1200px WebP at quality 92, with identical copies in `public/assets/product-cards`. The set's stored primary image and set-named thumbnail copies reuse the hoodie; its paired HTML presentation also displays the actual bottoms. There is no generated picture or flattened set composition. Source paths, SHA-256 hashes, optimized paths and copy relationships are recorded in the manifest.

## Acceptance Evidence

- Checked `C:/Users/sue25000644/Documents/Codex/2026-08-25/tghis/outputs/hooper-drop/report.json`: 140 passing checks, 25 route/viewport combinations at 320/390/768/1024/1440px, no document overflow, no broken images and no JavaScript errors. Routes cover home, Tracksuits and all three product pages; additional checks cover discovery, independent sizes, matched backs/zoom, bag, checkout, prices, shipping, tee regression and sale isolation.
- The isolated `check-hooper-payload.cjs` test passed again: both sizes, both images, product identity, GBP 84.99 and unlinked guest identity survive the checkout payload. Its fetch is mocked; no network request is sent.
- All four optimized files match an in-memory conversion of their actual supplied sources at the recorded settings. All four garment card copies and both set-named hoodie copies are byte-identical to their corresponding optimized image.
- Review handoff: a fresh finish reviewer returned SHIP after reviewing 14 required screenshots in the report directory. This documentation pass checked the existing evidence and did not repeat screenshot or visual-review work.
- Detector unavailable: engine absent/cache permission limitation. No real payments, real orders or deployment were performed.

Existing drift, reported only: `.impeccable/direction.md` still describes four newest tees; `DESIGN.md` gallery prose is tee-focused and omits the incumbent tablet square-gallery variant; shared CSS retains an unused `--accent` declaration outside the documented palette. No drift repair or normative refresh is authorized. Existing `DESIGN.md` and `.impeccable/design.json` are preserved.
