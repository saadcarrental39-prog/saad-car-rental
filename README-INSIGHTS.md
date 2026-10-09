# Dashboard (Insights) — premium dark dashboard, Admin app ka pehla tab

Admin app ka pehla tab **Dashboard** hai: black + gold premium design. Website ki visits, naye / purane customers,
**Daily · Weekly · Monthly** trends, traffic sources, popular gaariyan, customer actions aur bookings sab ek jagah.

## Setup (sirf ek baar, pehle se kiya hua ho to dobara nahi)
1. Cloudflare Dashboard > **Storage & databases > D1** > *Create database*, naam: `saad-analytics`.
2. **Workers & Pages** > aap ka Pages project > **Settings > Bindings > Add > D1 database**. Variable name: `DB`.
3. `update.bat` chalayein (ya Deployments mein *Retry deployment*).

Tables khud ban jati hain. **Naya update karne par kuch aur nahi karna**: naya `vfirst` table khud ban jata hai aur
purane visitors ka data khud us mein bhar jata hai (ek baar).

## Dashboard mein kya hai
- **Aaj / 7 Din / 30 Din / 90 Din**: upar ke buttons. Har number pichle muddat se compare hota hai (▲ ▼ %).
- **Total visitors** (bara number + chart). Gold hissa = naye visitors, safed = purane. Bar par tap karein to us din / ghante ka hisaab.
- **Aaj ka khulasa**: khud likhe hue 3-4 jumle (visitors barhe ya kam hue, busy waqt, sab se zyada traffic wala din, top source, top gaari).
- **6 cards**: Page views, Visits, Naye visitors, Purane visitors, Inquiries, **Bookings** (website se aaye orders), har ek ke saath % change aur chhoti trend line.
- **Naye vs Purane customers**: donut + pages per visit, bounce rate, visits per visitor.
- **Daily · Weekly · Monthly** (naya): teen buttons. Daily = pichle 30 din, Weekly = pichle 12 hafte, Monthly = pichle 12 mahine.
  Chart par ya table ki kisi bhi row par tap karein: us muddat ke visitors / naye / purane / views aur pichli muddat se % farq.
- **Ek nazar mein**: Aaj, Kal, 7 din, 30 din ke visitors + naye + views, aur Bookings aaj / 7 din / 30 din.
- **Customer actions**: Book Now → form shuru → booking bheji, Calls, WhatsApp, Email, inquiry rate.
- Traffic sources, top pages, popular gaariyan, routes / services, devices, shehr, **hafte ke din** (kis din zyada traffic), busy waqt, live activity.
- Upar-right **download button**: saara daily / weekly / monthly data CSV mein (Excel / Google Sheets mein khulta hai).
- Dashboard har 45 second mein khud refresh hota hai.

## Numbers ka matlab
- **Visitor**: ek phone / browser. **Naya** = jo is browser se pehli baar aaya, **Purana** = pehle bhi aa chuka hai.
- **Page view**: kisi page ka khulna. **Visit (session)**: ek baar ki browsing.
- **Bounce rate**: jin visits mein sirf ek page dekha gaya.
- **Inquiries** = Calls + WhatsApp + bheji hui booking / contact forms. **Bookings** = Orders tab mein aaye orders.
- Saare waqt **Pakistan time** mein hain.
- Weekly / Monthly mein "visitors" us muddat ke **alag alag** log hain (ek banda hafte mein 5 din aaye to 1 ginta hai).

## Zaroori baatein
- Data **deploy ke baad se** jama hota hai; purani visits nahi aati.
- **Aap ka apna phone / computer count nahi hota** (Admin kholte hi). Test ke liye Dashboard ke neeche **"Apni visits ginein"** On karein, ya kisi doosre phone se website kholein.
- Browser data saaf karne ya nayi device par wohi banda dobara "naya" ginta hai. Ad-blocker / "Do Not Track" wale kuch log count nahi hote: ye andaza hai, 100% exact nahi.
- Bots (Google bot, WhatsApp preview waghera) ginti mein nahi aate.
- **Privacy**: koi naam, phone number ya IP save nahi hota. Sirf random id, page, source, device aur shehr.
- Cloudflare D1 free plan mein roz ~1 lakh visits tak aaram se chalta hai. Visit ka detail 13 mahine rakha jata hai.
- GA4 / Cloudflare Web Analytics (agar `.env` mein set hon) pehle jaise chalte rahenge.

## Kin files mein badlaav hua (is update mein)
- `functions/_lib/stats.js`: naya `vfirst` table (naye visitors tez aur sahi), daily / weekly / monthly trend, hafte ke din, 90 second cache.
  Pehle har refresh par poori table scan hoti thi, ab nahi hoti (D1 free limit bachti hai).
- `functions/api/admin.js`: `stats` ke saath bookings (orders) ki ginti.
- `src/components/Insights.jsx`, `src/styles/insights.css`: naya premium dark design aur naye sections.
