---
name: Ball For Life
description: Bold editorial basketball streetwear with clear shopping controls.
colors:
  black: "#111111"
  white: "#ffffff"
  charcoal: "#252525"
  paper: "#f7f7f7"
  surface: "#f3f3f3"
  muted: "#686868"
  secondary-text: "#515151"
  divider: "#e1e1e1"
  dark-divider: "#393939"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0"
  product-title:
    fontFamily: "Inter, sans-serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  button:
    fontFamily: "Inter, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
rounded:
  sharp: "0px"
spacing:
  compact: "12px"
  grouped: "16px"
  mobile-gutter: "20px"
  panel: "24px"
  laptop-gutter: "32px"
  desktop-gutter: "48px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.sharp}"
    padding: "14px 28px"
    height: "50px"
  button-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    typography: "{typography.button}"
    rounded: "{rounded.sharp}"
    padding: "14px 28px"
    height: "50px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    rounded: "{rounded.sharp}"
    padding: "12px 14px"
    height: "48px"
---

# Design System: Ball For Life

## Overview

**Creative North Star: "Editorial basketball streetwear"**

The store is minimal, confident and fashion-led, with the visual discipline of the user's Nike and Represent references. Real clothing and real people carry the identity. The supplied handwritten wordmark leads the homepage; quiet shopping typography lets the clothing speak. Condensed lettering remains a campaign-story accent, not the voice of every heading.

The active shared implementation is `public/store-design.css`, with presentation interactions in `public/store-ui.js`. `public/style.css` is a retained legacy file and is not loaded by the redesigned pages. Do not extend it for new store work. Header and footer source templates live in `partials/`; `tools/update-store-shell.cjs` compiles them into the existing static HTML pages.

**Key Characteristics:**

- Supplied handwritten hero lettering and quiet Inter shopping headings.
- Authentic campaign, product and customer photography.
- White shopping surfaces and full-width black brand sections.
- Sharp corners, restrained rules and consistent spacing.
- Mobile layouts that keep products and required options clear.

## Colors

### Primary

Black anchors primary actions, typography and brand sections. White provides the shopping ground and reverses text on dark surfaces.

### Neutral

Charcoal supports dark media surfaces. Paper separates the newsletter band; surface grey distinguishes product imagery and order summaries. Muted and secondary text colours carry supporting information. Light and dark dividers separate related groups without decorative elevation.

**The Content Rule.** Product imagery, real colour swatches and customer media supply colour; the store interface stays restrained.

## Typography

Barlow Condensed is reserved for expressive campaign story headings and existing compact tool titles. Inter carries section and page headings, product titles, body copy and controls. Both are self-hosted WOFF2 assets with swap loading and included font licences. Letter spacing is zero.

Use sentence/title case and medium-weight Inter for shopping headings. Desktop section headings use the headline role; phone section headings step down to 24px. Product titles use the product-title role and step down to 24px on phones. Collection and customer-care titles use 40px on desktop and 32px on phones. Body copy stays readable and short; product-card prices sit below the title/category/specification group. Prices use tabular numerals.

The homepage H1 is the actual supplied handwritten wordmark (`assets/ui/wordmark-script.webp`), with accessible Ball For Life alt text and a CSS white treatment over the real campaign photo. Do not approximate the lettering with a font. Keep the original BFL header logo. The looping mark (`assets/ui/wordmark-loop.webp`) appears only in the neutral newsletter band and is not another navigation logo.

**The Hierarchy Rule.** Hero type belongs in a hero. Product controls, panels and admin screens use a smaller, functional scale.

## Layout

The shared content width is capped at 1536px. Horizontal gutters step from the desktop-gutter token to laptop-gutter below 1101px and mobile-gutter at 600px. Page sections are full-width bands with constrained inner content, not floating cards.

Homepage merchandise uses four columns on desktop and two at 900px and below. Collection merchandise uses four columns from 1101px, three at intermediate widths and two on phones. Product image panels contain the whole garment. Gallery and purchase information sit beside each other on desktop, then stack at 900px and below. Keep headline and product information unframed; give repeated merchandise consistent image tracks and quiet spacing.

Navigation is 86px tall on desktop and 72px at 900px and below. The desktop logo is left aligned; mobile places the logo centrally with a menu and shopping bag. Desktop product galleries are capped at 760px high. Keep campaign copy outside the model's garment area, and leave the next section visible in the first viewport.

Checkout uses a form and order-summary column on desktop. On phones, the summary and total come first, the contact and delivery form follows, and the payment action is last. Admin screens prioritise dense, organised information over campaign composition.

## Elevation & Depth

The interface uses tonal surfaces and thin borders rather than decorative shadows. Modals and drawers are separated from the page with a translucent backdrop. Quick-add controls use a light translucent surface over product imagery. Photographic overlays are used only to keep text readable.

## Shapes

Sections, image panels, buttons and fields have sharp corners. Colour swatches, small bag counts and video controls are circular because those forms communicate their function. Do not turn content bands into cards or nest cards inside cards.

## Components

### Navigation

Use shared templates so links and branding agree between pages. Search opens a native dialog; account, currency and shopping bag use familiar controls. Mobile navigation has an explicit close button, Escape handling and focus containment. Hidden drawers are inert and expose their open state with ARIA attributes.

### Product Cards

Use contained front imagery, real colour samples, title, current price and concise fabric information. Hover-capable devices reveal the back image and quick-add action; phones show quick add directly. Quick add requires the customer to choose a size. Preserve the real catalogue, prices and product links.

### Product Purchase Controls

Colour swatches and size buttons show selected state visually and through `aria-pressed`. The main Add to Bag action is the strongest control. Keep delivery estimates and returns information directly nearby. Provide front/back thumbnails, touch swiping, image zoom and accessible details accordions. Mobile uses the existing fixed purchase bar.

On phones, show five colour swatches with a disclosure for the remainder. Keep the selected colour visible when that disclosure closes, and use 44px touch targets. The compact square phone gallery contains the whole garment. Where genuine customer photos exist, include them only with their matching product, identify the photographed colour, and keep browsing media independent of the colour/size sent to the bag. Use small image derivatives for thumbnails.

### Checkout Summary

The native order-details disclosure starts closed on phones and open on larger screens. Keep the grand total, any applied discount, delivery estimate and returns visible outside it. Contact fields follow the compact phone summary; the payment action remains after the form. Show the payment-method row once beside the checkout heading. Empty checkout offers a direct shopping action without an inactive delivery form.

### Fields and Buttons

Primary actions use the black button; over a photograph use the light button. Fields use a light border and a white background. Focus indicators are visible, disabled controls reduce opacity, and status messages explain a relevant customer action or recovery. Phone form text is 16px to avoid unwanted input zoom.

### Shopping Bag

Keep thumbnails, chosen options, quantity and remove controls visible. Subtotal and free UK shipping progress update with the existing cart. The progress note explains that final delivery is calculated at checkout after applicable discounts. Keep the checkout action prominent.

### Customer Media

Use the same white background as shopping sections, with fine divider rules rather than framed cards. Keep attribution, genuine feedback and the correct product link with each photo or video. Show all three reviews on desktop and an accessible horizontal carousel on smaller screens. Customer photos have manual slide controls. Videos have visible playback and sound controls, use real frame posters and attach their sources when entering the viewport. Do not invent ratings or testimonials.

Review cards use natural content tracks, not equal-height filler above their product links. Supplied feedback and creator clips are not automatically five-star ratings; omit rating decoration when no actual score was supplied.

### Motion

Control feedback and image transitions take approximately 200ms. Drawers use a 300ms transition with the shared ease-out curve. The removed More Than Basketball section has no active scroll/reveal observer. Respect reduced-motion settings, pause offscreen videos and avoid continuous scroll listeners.

## Do's and Don'ts

### Do:

- Do reuse the BFL identity, real catalogue and authentic photography.
- Do keep the garment clear of headline and control overlays.
- Do use stable image proportions and responsive grid tracks.
- Do expose the order total before the final payment action.
- Do preserve keyboard focus, selected states and reduced-motion behaviour.

### Don't:

- Don't invent reviews, stock levels, discounts or delivery claims.
- Don't add decorative gradients, excessive shadows or oversized rounded containers.
- Don't load old campaign slides or videos before they are needed.
- Don't expose backend implementation details in customer status messages.
- Don't add new styles to the retired legacy stylesheet.
