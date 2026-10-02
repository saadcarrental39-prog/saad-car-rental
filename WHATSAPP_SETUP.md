# Auto-send booking receipt to WhatsApp (one-time setup)

Flow: customer clicks **Book via WhatsApp** -> receipt PNG is created -> website sends it to `/api/booking`
(`functions/api/booking.js`, Cloudflare Pages Function) -> WhatsApp Business Cloud API delivers the PNG
to the owner number (+92 333 9850599). No copy/paste for the customer.
If this is not set up yet, the site automatically falls back to: save PNG + copy + open chat.

## 1. Meta / WhatsApp Cloud API
1. https://developers.facebook.com -> Create App (type: Business) -> add product **WhatsApp**.
2. WhatsApp > API Setup: you get a **Phone number ID** and can add a sender number.
   - IMPORTANT: the *sender* number must be different from the owner's number (+92 333 9850599).
     Use a new SIM/number for the API, or Meta's free test number while testing
     (test number can only message numbers you verify under "To" — add +92 333 9850599 there).
3. Create a permanent token: Business Settings > Users > System Users > add system user > Generate token
   with `whatsapp_business_messaging` + `whatsapp_business_management`.

## 2. Create the message template (needed because the business starts the chat)
WhatsApp Manager > Message templates > Create:
- Name: `new_booking`   Category: **Utility**   Language: English (`en`)
- Header: **Image** (upload any sample image)
- Body (6 variables):
  `New booking {{1}}. Customer: {{2}}, Phone: {{3}}. Vehicle: {{4}}. Trip: {{5}}. When: {{6}}.`
Wait for "Approved" (usually minutes to a few hours).

## 3. Cloudflare Pages > Settings > Environment variables (Production, mark as Secret)
| Name | Value |
|---|---|
| `WA_TOKEN` | permanent token from step 1 |
| `WA_PHONE_ID` | Phone number ID from step 1 |
| `WA_TO` | `923339850599` (add more owners with commas: `923339850599,923001234567`) |
| `WA_TEMPLATE` | `new_booking` (optional, default) |
| `WA_LANG` | `en` (optional, default) |

Redeploy. Test with one booking. The `functions/` folder must be in the project root that Cloudflare builds.

## Notes
- Never put the token in `VITE_` variables or in the browser code.
- Spam protection: the endpoint checks file type/size and fields. For extra safety add Cloudflare
  Turnstile or a rate-limit rule (Cloudflare > Security > WAF > Rate limiting) on `/api/booking`.
- Meta charges per conversation/template (utility templates are cheap); see Meta's pricing for Pakistan.

---
# Phone fallback without Meta API: receipt link (works with WhatsApp and WhatsApp Business)
A browser can never attach an image to a chat by itself. Until the Meta API above is set up, phones use this instead:
receipt is stored on your own site -> the owner's chat opens with the receipt link already typed -> customer taps **Send**.
WhatsApp shows the receipt picture as the link preview; the owner taps it to see/download the full PNG.
Needs no Meta account and no extra number. On PC the old "copy image + open chat" flow is kept.

Setup (one time, free):
1. Cloudflare > Storage & Databases > Workers KV > **Create namespace** (name: `receipts`).
2. Pages > your project > Settings > Functions > **KV namespace bindings** > Add binding:
   Variable name `RECEIPTS`, namespace `receipts` (Production; add Preview too if you test there).
3. Redeploy. Open `https://YOUR-SITE/api/receipt-link` -> should show `{"configured":true}`.

Notes: links are random (128-bit), not indexed by search engines, and expire after 30 days.
Cloudflare Pages must be served on https (preview needs a public link, not localhost).
If the Meta API (`/api/booking`) is configured and works, it is always used first and this link is not needed.
