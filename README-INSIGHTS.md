# Dashboard (Insights) — premium white / black dashboard, Admin app ka pehla tab

Admin app ka pehla tab **Dashboard** hai: white / black premium design (gold = naye visitors). Website ki visits, naye / purane customers,
**Daily · Weekly · Monthly** trends, traffic sources, popular gaariyan, customer actions aur bookings sab ek jagah.

## Setup (sirf ek baar, pehle se kiya hua ho to dobara nahi)
1. Cloudflare Dashboard > **Storage & databases > D1** > *Create database*, naam: `saad-analytics`.
2. **Workers & Pages** > aap ka Pages project > **Settings > Bindings > Add > D1 database**. Variable name: `DB`.
3. `update.bat` chalayein (ya Deployments mein *Retry deployment*).

Tables khud ban jati hain. **Naya update karne par kuch aur nahi karna**: naya `vfirst` table khud ban jata hai aur
purane visitors ka data khud us mein bhar jata hai (ek baar).

## LIVE (sab se upar)
- **Abhi website par kitne log hain** (bara number) aur kaun: shehr, phone / computer, kahan se aaya (Google search, Facebook, WhatsApp, seedha link) aur kaun sa page dekh raha hai.
- Jaise hi koi website kholta hai, **8 second ke liye kala banner** aata hai: *"Naya visitor aya — Peshawar · Mobile · Google search se"* (ya *Purana visitor wapas aya*, *WhatsApp dabaya*, *Gaari dekhi* waghera).
- **Awaz on** button: har nayi visit par chhoti beep. Dashboard khula aur screen on honi chahiye.
- Dashboard har **4 second** mein khud check karta hai aur baqi numbers bhi naye visit par 2 second mein update ho jate hain.
- "Online" = pichle ~100 second mein dikhne wala visitor. Website har 30 second mein chhota "ping" bhejti hai jab tak page khula aur screen par ho.

## Indicator
- **Hara radar (slow smooth blink) + "LIVE"** = tracking system chal raha hai aur database se jura hai (visitors 0 hon tab bhi). Jab koi online ho to blink thora tez aur number hara ho jata hai.
- **Grey "OFFLINE"** = dashboard server / database se baat nahi kar pa raha.
- Website ki visits ab `/api/visit` par jati hain (ad-blockers `collect` naam block kar dete hain). Purana `/api/collect` bhi chalta hai.

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
- **Ab har visit count hoti hai, aap ki apni bhi** (pehle Admin kholne wala device khud ba khud count hona band ho jata tha, wo galti thi). Apna phone / computer exclude karna ho to Dashboard ke neeche **"Meri apni visits ginein"** Off karein.
- **Connection check:** browser mein `https://aap-ki-site/api/visit` kholein. `{"ok":true,"db":true}` aaye to database sahi jura hua hai. `db:false` aaye to D1 binding (`DB`) nahi lagi.
- Browser data saaf karne ya nayi device par wohi banda dobara "naya" ginta hai. Ad-blocker wale kuch log count nahi hote: ye andaza hai, 100% exact nahi.
- Bots (Google bot, WhatsApp preview waghera) ginti mein nahi aate.
- **Privacy**: koi naam, phone number ya IP save nahi hota. Sirf random id, page, source, device aur shehr.
- Cloudflare D1 free plan mein roz ~1 lakh visits tak aaram se chalta hai. Visit ka detail 13 mahine rakha jata hai.
- GA4 / Cloudflare Web Analytics (agar `.env` mein set hon) pehle jaise chalte rahenge.

## Kin files mein badlaav hua (is update mein)
- `functions/_lib/stats.js`: naya `vfirst` table (naye visitors tez aur sahi), daily / weekly / monthly trend, hafte ke din, 90 second cache.
  Pehle har refresh par poori table scan hoti thi, ab nahi hoti (D1 free limit bachti hai).
- `functions/api/admin.js`: `stats` ke saath bookings ki ginti, aur naya `live` action.
- `functions/api/collect.js`: connection check (GET).
- `src/analytics.js`: ping (online dikhane ke liye), "Do Not Track" aur owner-skip wali galti theek.
- `src/pages/Admin.jsx`: Admin kholne par device ko khud ba khud "owner" banane wali line hata di.
- `src/components/Insights.jsx`, `src/styles/insights.css`: white / black premium design, LIVE panel aur naye sections.
