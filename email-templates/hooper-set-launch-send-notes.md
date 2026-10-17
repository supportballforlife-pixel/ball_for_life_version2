# Hooper Set Launch Email

Subject: The Hooper Set is out now

Preview text: Can't Rush Greatness meets Un-Guardable. The new Hooper Set is out now.

## Files

- Send: `hooper-set-launch-email.html`
- Local preview only: `hooper-set-launch-email-local-preview.html`
- Email images: `../public/assets/email/hooper-launch/`

## Before Sending

1. Include `public/assets/email/hooper-launch/` in the next normal website publish. It contains four JPEG product photos and the PNG BFL logo. The email also uses the existing campaign image at `public/assets/ui/campaign.webp`. The public image URLs in the send file must be available before recipients open the email.
2. Use the send HTML in your existing Resend Broadcasts workflow, with your verified sender and subscribed recipients. Do not import the local-preview file: its image paths only work on this computer.
3. Keep `{{{RESEND_UNSUBSCRIBE_URL}}}` unchanged. Resend Broadcasts replaces it with a recipient-specific unsubscribe link. A manual Gmail paste does not process this token. See https://resend.com/blog/broadcast-api.
4. Send a test to your own inbox after publishing the images. Check the front and back photos, shop buttons, mobile layout and unsubscribe link before sending to subscribers.

Nothing has been sent or scheduled by Codex.

## Content And Checks

The full set is GBP 84.99. Separates are GBP 44.99 and GBP 49.99; buying the set saves GBP 9.99. All pieces are Black in S/M/L/XL. Bottoms are knee-length, and the set allows a different size for each piece. Fabric or stock claims and timed promotions are intentionally absent because none were supplied for this campaign.

Browser previews were checked at 1000, 390 and 320 pixels: all five images loaded, no horizontal overflow, and no scripts. The live product catalogue contains all three linked products. The product page, contact page and shipping/returns page returned HTTP 200. Actual inbox rendering and personalized unsubscribe behavior need the Resend test send; they have not been tested by sending an email.

The design opens with a real Ball For Life campaign image, then moves into the full set and individual product options. It keeps the established black/white brand using email-safe font fallbacks. No storefront design files were changed for this email.
