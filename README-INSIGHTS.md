# Dashboard (Insights) — Admin app mein website ki performance

Admin app ka pehla tab ab **Dashboard** hai. Isme website ki visits, naye / purane customers, daily-weekly-monthly numbers,
traffic kahan se aa raha hai, kaun si gaari / route zyada dekha gaya, aur customers ne kitni baar Call / WhatsApp / Booking dabayi, sab nazar aata hai.

## Setup (sirf ek baar, 3 kaam)
1. Cloudflare Dashboard > **Storage & databases > D1** > *Create database*, naam: `saad-analytics`.
2. **Workers & Pages** > aap ka Pages project > **Settings > Bindings > Add > D1 database**.
   Variable name: `DB`  |  Database: `saad-analytics`. (Production aur Preview dono mein add karna behtar hai.)
3. Naye files project mein copy karke `update.bat` chalayein (ya Deployments mein *Retry deployment*).

Tables khud ban jati hain, koi SQL chalane ki zarurat nahi. Setup se pehle Dashboard par "ek baar setup karein" ka card nazar aata hai.

## Dashboard mein kya hai
- **Aaj / 7 Din / 30 Din / 90 Din**: upar ke buttons se muddat badlein. Har number pichle muddat se compare hota hai (▲ ▼ %).
- **Total visitors + chart**: har bar ek din (Aaj mein ek ghanta, 90 Din mein ek hafta). Hara hissa = naye visitors, safed = purane. Bar par tap karein to us din ka hisaab dikhta hai.
- **Naye vs Purane customers**, pages per visit, bounce rate.
- **Daily · Weekly · Monthly**: Aaj, Kal, pichle 7 din, pichle 30 din ka visitors / views / naye, aur pichle 14 din ki chhoti chart.
- **Customer actions**: Book Now → form shuru → booking bheji (funnel), Calls, WhatsApp, Email, inquiry rate.
- **Traffic sources** (Google, Facebook, WhatsApp, Direct...), **top pages**, **popular gaariyan**, **routes / services**, **devices**, **shehr**, **busy waqt**, **live activity**.
- Upar "kitne log abhi website par hain" (pichle 5 minute). Dashboard har 30 second mein khud refresh hota hai.

## Numbers ka matlab
- **Visitor**: ek phone / browser. **Naya** = jo is browser se pehli baar aaya, **Purana** = pehle bhi aa chuka hai.
- **Page view**: kisi page ka khulna. **Visit (session)**: ek baar ki browsing.
- **Bounce rate**: jin visits mein sirf ek page dekha gaya.
- **Inquiries** = Calls + WhatsApp + bheji hui booking / contact forms.
- Saare waqt **Pakistan time** mein hain.

## Zaroori baatein
- Data **deploy ke baad se** jama hona shuru hota hai; purani visits nahi aati.
- **Aap ka apna phone / computer count nahi hota** (Admin kholte hi). Test karna ho to Dashboard ke neeche **"Apni visits ginein"** On karein, ya kisi doosre phone se website kholein.
- Agar koi customer browser ka data saaf kare ya nayi device use kare to wo dobara "naya" ginta hai. Ad-blocker / "Do Not Track" wale kuch log count nahi hote, is liye ye andaza hai, 100% exact nahi.
- Bots (Google bot, WhatsApp preview waghera) ginti mein nahi aate.
- **Privacy**: koi naam, phone number ya IP save nahi hota. Sirf random id, page, source, device aur shehr (Cloudflare se).
- Cloudflare D1 free plan mein roz ~1 lakh visits tak aaram se chalta hai. Data 13 mahine rakha jata hai, phir purana khud hat jata hai.
- GA4 / Cloudflare Web Analytics (agar `.env` mein set hon) pehle jaise chalte rahenge.

## Kin files mein badlaav hua
Naye: `src/components/Insights.jsx`, `src/styles/insights.css`, `functions/api/collect.js`, `functions/_lib/stats.js`
Badle: `src/analytics.js`, `src/pages/Admin.jsx`, `src/styles/admin.css` (5 tabs), `functions/api/admin.js` (`stats` action)
