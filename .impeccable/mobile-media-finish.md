# Mobile Hero and Customer Media Finish

Completed handover: 16 October 2026. Browser verification ran on 15 October 2026.
Mode: Persuade for the homepage; Operate for checkout.

## Scope and Direction

Preserve the original BFL header logo, supplied handwritten hero wordmark, authentic campaign imagery, catalogue, prices, testimonials and black/white identity. This is a bounded refinement, not another replacement visual world. No conversion uplift or absolute perfection is claimed.

- Mobile hero content is explicitly positioned inside the stable 4:5 image, aligned 28px above the bottom. It no longer depends on a percentage height resolving inside an auto-height parent. No scroll transforms or viewport-height resizing were added.
- White customer reviews use larger unobstructed media: 160px desktop and 132px phone tracks, with narrower-screen exceptions. Zoom controls sit with playback controls outside the image. Carousel navigation follows the reviews rather than separating the heading from them.
- Below 1201px reviews become horizontally scrollable, avoiding cramped three-column copy on intermediate widths. Rapid arrow clicks retain their requested destination during smooth scrolling.
- Visible review videos load lazily and play muted and inline when at least 40% visible. Offscreen playback pauses; manual pause persists. Reduced motion prevents automatic playback/download but retains explicit play controls. Leaving the viewport resets sound to muted.
- Native dialogs, including dialogs created after initialization, and existing drawers suspend inline previews. Closing the media viewer restores eligible inline playback. Visibility and page lifecycle handlers synchronize playback without adding a JavaScript scroll listener.
- Empty checkout provides a direct shopping action and hides the inactive form, summary and payment action. Populated checkout retains its existing totals and payment workflow. Subsection headings use the quieter Inter hierarchy.
- Current assets: stylesheet `hero4`, community script `community5`, checkout script `empty1`. Active page generators emit matching versions rather than restoring the older cache keys.

## Verification

Evidence: `C:/Users/sue25000644/Documents/Codex/2026-08-25/tghis/outputs/mobile-media/after-report.json` and adjacent final screenshots. The test script is `check-store-mobile-media.cjs` in that workspace.

80 local browser assertions passed with zero JavaScript errors. Widths: 320, 390, 430, 768, 1024 and 1440px. Phone contexts enabled mobile/touch emulation. Assertions cover hero anchoring during scrolling and browser-height changes, horizontal overflow, real advancing video time, lazy loading, muted inline playback, rapid navigation, manual pause, media viewer, search and late-created dialogs, reduced motion, empty checkout recovery, and populated one/two/three-tee totals. The separate isolated set checkout payload check also passed, preserving independent piece sizes, images and guest identity.

External services were mocked or blocked. No real orders, payments, signup emails or live database changes were made. Physical iPhone/Safari and device power-saving autoplay restrictions were not tested. Native in-app browser access to the temporary local HTTP server timed out; isolated Edge/Playwright provided the verification fallback. The temporary server and browser processes were stopped after testing.

An independent generic finish reviewer identified the dynamic-dialog and generator-version gaps; both were addressed and verified. No named reviewer/documenter roles are exposed by this harness. The fresh generic documenter failed on an account usage limit before writing its note, so this source-backed handover was completed inline. Earlier Impeccable engine loading failed; no successful deterministic detector run or clean-detector claim is made.

## Deployment

The user confirmed they were checking `ballforlife.store` on their phone, not the local preview. These are saved project changes only. No deployment was performed in this pass. Publish the updated project through the existing Cloudflare workflow before expecting the phone's live site to show the changes. The local homepage remains `public/index.html`.

## Design-System Outcome

The refinement follows `DESIGN.md` and introduces no replacement identity, new factual claims, product data changes or durable new design tokens. Existing system documentation and unrelated source remain intact. Older historical one-off build scripts were not broadly rewritten; the active community, welcome and shared-shell generators were updated within scope.
