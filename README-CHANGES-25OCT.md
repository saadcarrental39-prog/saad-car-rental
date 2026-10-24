# Badlaav (25 Oct 2026)

## 1. Orders 500 error
Sabab: Admin app har 12 second mein Cloudflare KV ka `list()` chalati thi. KV list ki rozana hadd sab se kam hai (Free plan par 1,000), isliye kuch ghanton baad list fail hoti, server 500 deta aur purane orders nazar nahi aate the. Orders KV mein safe hain.
Ab: naye `functions/_lib/orderidx.js` mein orders ki ek chhoti list (`ordidx`) `get()` se parhi jati hai; asli `list()` sirf 10 minute mein ek baar (reconcile) chalti hai. Agar `list()` phir bhi block ho to app aakhri list dikhati hai. Admin app ki polling 12s se 30s ki.
Files: `functions/_lib/orderidx.js` (nayi), `functions/api/admin.js`, `functions/api/orders.js`, `src/pages/Admin.jsx` (sirf 2 jagah). Ab koi crash bhi ho to app mein wajah likhi aati hai.

## 2. Teen naye posts (Posts tab mein live)
`functions/_lib/seedposts.js` mein: Islamabad to Murree, Islamabad to Skardu, Islamabad to Naran Kaghan (Land Cruiser with driver).
Deploy ke baad `/posts` ya Admin > Posts pehli baar khulte hi teen posts KV mein ek baar copy ho jati hain, phir aam posts ki tarah edit / delete ho sakti hain (dobara copy nahi hoti).
Photos site ki apni hain (`/assets/pages/...`). Reel / video link har post mein baqi hai: Admin > Posts se daal dein (SEO score 93% se 100%).

## 3. Images / Google Lens
Har post ke har picture ka alt text + caption hai, aur ab `ImageObject` schema (naam, caption, jagah, malik) bhi page mein jata hai. Image sitemap pehle se `sitemap-posts.xml` mein hai.
