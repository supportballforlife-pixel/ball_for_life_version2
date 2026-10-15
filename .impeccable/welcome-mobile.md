# Newsletter Welcome and Mobile Homepage

Mode: Persuade for the newsletter invitation and homepage; Operate for privacy preferences.

## Confirmed Brief

- Redesign the newsletter invitation, not the whole store identity.
- The invitation is the first automatic prompt on the homepage. Preserve the previous choice: once per browser-tab visit unless this browser has subscribed successfully.
- Cookie choices follow dismissal, without enabling analytics by default or making consent a condition of shopping/signup.
- Improve the mobile homepage and prevent the hero changing shape as browser controls collapse during scrolling.
- Preserve the existing BFL header logo, handwritten hero wordmark, campaign assets, products, customer media and purchase flows.

## Direction

Use one existing streetwear photograph with a quiet white signup panel, the real black BFL logo and a sentence-case Inter heading. A visible email label, one Join the list action, an explicit Continue shopping exit and concise consent copy form the entire task. No invented discount, scarcity claim or decorative card stack. Mobile becomes a compact photo strip above the form; short screens scroll inside the panel. Do not automatically open the mobile keyboard.

The mobile hero uses a width-derived 4:5 format rather than viewport-height sizing. The picture is a positioned layer inside a stable section, never scroll transformed. The supplied mobile photography, wordmark and shop action remain. Scroll locking preserves the underlying page position; scrollbar space is reserved on desktop so prompt dismissal does not widen/reframe the hero.

## Evidence and Limits

The incumbent hero did not have JavaScript parallax. Its mobile height used `100svh`; the replacement removes height dependence on browser viewport changes. Device Safari behaviour must be checked separately from desktop Chromium emulation. The October 14 analytics work still requires its Supabase SQL migration and normal deployment; do not imply the live backend or storefront has been deployed.

## Documentation Outcome (2026-10-15)

The Impeccable documenter role was performed inline because the harness has no named documenter agent. This was a bounded documentation comparison of the finished extension and existing evidence, not a fresh design review or a new functional test run.

The extension preserves the incumbent world recorded in `DESIGN.md`, `PRODUCT.md` and `.impeccable/design.json`: black/white and neutral surfaces, quiet Inter shopping typography, the original BFL header logo, supplied wordmarks, authentic photography and sharp controls. The Content Rule and Hierarchy Rule still apply. The popup composition, local 32px/28px heading, 16px email field and width-derived mobile hero are surface decisions consistent with that world. No durable new system fact requiring a system-file update was identified; those files remain unchanged.

Source checked: `public/index.html`, `public/store-design.css`, `public/script.js` and `public/privacy-controls.js`; the existing focus-containment handler in `public/store-ui.js` was sampled as supporting evidence. The source retains one invitation per browser-tab visit through the session seen flag, suppresses future invitations after successful subscription through the local joined flag, and sets no joined flag on failure. Coarse-pointer devices focus the close control rather than automatically focusing email. Below 601px, the hero uses `aspect-ratio:4/5` and an absolutely positioned picture; scroll locking restores the previous page position and desktop scrollbar space is reserved.

The `holdNewsletter` / `releaseNewsletter` state APIs keep cookie choices behind an outstanding invitation, including deferred initialisation beyond the three-second fallback. The persisted `pageshow` path checks for an already open invitation before the seen flag, retaining the hold on Back/Forward restoration. Dismissal releases the hold after the close transition. These are local sequencing changes, not new global design rules.

## Verification Evidence Checked

All six supplied PNGs were opened and compared with the current source. Their dimensions were read from the files. Evidence paths are relative to the project root:

| Evidence | Dimensions | Observation |
| --- | --- | --- |
| `.impeccable/review/welcome/popup-390.png` | 390 x 844 | Compact photo strip, labelled email, Join the list, explicit shopping exit; no cookie prompt visible. |
| `.impeccable/review/welcome/popup-1440.png` | 1440 x 1000 | Existing photograph beside the white signup panel; original header retained; no cookie prompt visible. |
| `.impeccable/review/welcome/homepage-390.png` | 390 x 844 | Original mobile header and wordmark, portrait campaign hero, reassurance row and next shopping section. |
| `.impeccable/review/welcome/homepage-1440.png` | 1440 x 1000 | Original desktop identity and campaign imagery with the next shopping section visible. |
| `.impeccable/review/welcome/homepage-full-390.png` | 390 x 3795 | Two-column featured products, white customer media, categories, newsletter band and footer retained. |
| `.impeccable/review/welcome/homepage-full-1440.png` | 1440 x 3262 | Four-column featured products, white customer media, categories, newsletter band and footer retained. |
| `.impeccable/review/welcome/test-report.json` | 92 distinct checks; zero errors | Existing mock-backed verification result; entries counted in this pass, tests not rerun. |

The saved report covers widths 320, 390, 430, 768, 1024 and 1440; newsletter-first sequencing, deferred invitation and Back navigation, mobile focus, hero stability, overflow, same-visit suppression, signup failure/retry/success, subscribed-browser suppression, consent/withdrawal, quick add and review navigation. Static screenshots alone do not establish those behaviours. Report SHA-256: `d81ec1690dae3610d40b8aba69717d4c6e1c950686817f83148944ff103aff78`.

The supplied independent-review handoff accepts the incumbent identity and records both material sequencing fixes resolved, with disposition ship for that fix list. This documents the supplied outcome without expanding its review scope.

## Existing Documentation Drift Left Unchanged

- `PRODUCT.md` still names New Arrivals in the homepage flow, while the source and captures say Best Selling. `.impeccable/fashion-refinement.md` already records that approved follow-up as a user-curated selection, not an automatic sales ranking.
- `.impeccable/design.json` has an abbreviated overview rather than the full `DESIGN.md` wording. Its Email Input preview stays at 14px without the documented 16px phone treatment; the implemented popup field is 16px. These existing preview differences are not promoted into system rules.
- The older `.impeccable/reviews.md` describes a black band with a 1240px inner layout, while the current source, captures and incumbent design/product documents describe white customer media using the shared layout. The older delayed newsletter timing in `.impeccable/final-polish.md` is superseded for this surface by this welcome brief.

These are existing documentation discrepancies or superseded surface instructions, not approval to repair implementation or refresh the global system.

## Remaining Deployment Limits

Verification used mock backend responses only. It does not verify live signup delivery, live Supabase/Stripe behaviour, deployment or conversion uplift. The October 14 Supabase analytics migration and normal deployment remain outstanding as previously recorded. Actual device Safari behaviour remains separate from desktop Chromium emulation.

Context loading and the detector were previously disclosed as unavailable and were not rerun. No fresh design review, launcher run, detector run, implementation edit, whole-site certification or legal certification was performed in this documentation pass.
