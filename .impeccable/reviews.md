# Homepage Customer Media

Mode: Persuade.

Purpose: show real customers and creators wearing Ball For Life, with readable feedback and a direct route to the exact tee. This section inherits the established black-and-white editorial store identity; it is not a new visual world.

## Composition

- Full-width black band with a constrained 1240px inner layout.
- The two-line heading sits above the media, never behind or beside a narrow tall column.
- Three equal columns on desktop. At 900px and below, a native horizontal scroll-snap row uses consistent portrait media with a next-card preview.
- Attribution, location, username and supplied feedback live below the image or video, not in an overlay. Product links align at the bottom.
- Video is contained so the whole original portrait frame remains visible. Customer photos fill a stable 3:4 image box.

## Content Truth

RST from Essex is first and links to the Ball For Life Graphic Tee. T-jay from Reading has all three supplied photos in one card and links to Stephen Curry Variant 2. KadenBruney from Preston links to the Rodman Fck What They Think Tee. Preserve their original feedback and the supplied creator details. No fabricated testimonial, buyer verification, aggregate rating or follower-count updates.

## Behaviour

- Native touch swiping, keyboard arrow navigation and explicit previous/next controls.
- Review auto-advance pauses on interaction, hover, focus, offscreen state, hidden documents or reduced motion. The visitor can explicitly resume it.
- Video sources attach when needed. Playback and sound controls remain visible.
- T-jay's three-photo slideshow has manual dot controls. Manual selection stops automatic photo changes.
- The expand control opens a native dialog with contained full-size media, photo navigation or video controls. Escape closes the viewer.
- Reduced motion disables automatic video playback and automatic review/photo changes without removing manual controls.

## Sources

`partials/community.html` is the canonical markup. `tools/update-community.cjs` compiles the homepage and the existing standalone reviews page without adding navigation to that page. `public/community.js` owns review interactions; do not reintroduce duplicate media initialisation in `public/store-ui.js`. Styling belongs in `public/store-design.css`.

## Verification

Checked at 375, 390, 768, 1024 and 1440px, with no page overflow or missing review imagery. Verified review navigation, manual photos, full media viewer, product routes, homepage quick add and reduced-motion behaviour with live Supabase requests blocked.
