# Google reviews: website par LIVE rating aur count

Website ke har number (Home, Contact, About, "Trusted by our customers", neeche wala booking popup) ab **Google ke live reviews** se aate hain.
Pehle sab jagah `211` fixed likha tha (`business.config.js`), isi liye Google par 218 aur website par purane 211 dikhte the.

## Kaise kaam karta hai
1. Website khulte hi `/api/reviews?summary=1` se rating aur total reviews mangti hai.
2. Server Google (Places API) se **ghante mein sirf 1 baar** poochta hai (mahine mein ~720 calls, Google ki free limit 1,000 calls/mahina hai).
3. Google par koi nayi review aaye to website par **ek ghante ke andar** count badh jata hai.
4. Google na chale (key ghalat, limit khatam, internet) to **aakhri sahi number** dikhta rehta hai. Website kabhi khali ya kharab nahi hoti.

Number ka order: **Google live** → **Admin app mein haath se likha number** → `business.config.js` ka fixed number.

## Setup A: Google se live (khud update)  — ek baar, ~10 minute
Google Cloud mein **billing account (card)** lagana parta hai. Free limit ke andar paisa nahi katta. Phir bhi **Budget alert** laga dein.

1. **Place ID**: https://developers.google.com/maps/documentation/places/web-service/place-id kholein, search box mein apna business naam likhein (jaise *Saad Car Rental Services Islamabad*), map par apna business chunein. Neeche **Place ID** dikhega (`ChIJ...` se shuru). Copy kar lein.
2. https://console.cloud.google.com kholein, apne Google account se login, upar **New project** banayein (naam: saad-website).
3. Menu > **Billing** > billing account jorein (card). Menu > **Billing > Budgets & alerts** mein 5 dollar ka alert laga dein.
4. Menu > **APIs & Services > Library** > **Places API (New)** (dhyan: "(New)" wala) > **Enable**.
5. **APIs & Services > Credentials > Create credentials > API key**. Key copy karein. Phir us key par **Edit** > **API restrictions** > *Restrict key* > sirf **Places API (New)** chunein > Save.
6. Cloudflare > **Workers & Pages** > aap ka project > **Settings > Variables and Secrets > Add**:
   - `GOOGLE_PLACES_API_KEY` = aap ki key (Type: **Secret**)
   - `GOOGLE_PLACE_ID` = Place ID (Type: Text)
   - Environment: **Production**. Save.
7. **Deployments > Retry deployment** (nayi variables sirf naye deployment par lagti hain).
8. Check: browser mein `https://aap-ki-site/api/reviews?summary=1` kholein. `"source":"google"` aur sahi `count` aana chahiye.
   Agar `"error":"google_403"` aaye to key restriction ya billing check karein, `google_404` aaye to Place ID ghalat hai.

## Setup B: Haath se (agar Google key abhi nahi lagani)
Admin app > **Account** tab > **Google reviews (website par)**: rating (5.0) aur total reviews (jaise 218) likh kar **Number save karein**. Website par foran badal jata hai, `update.bat` ki zarurat nahi.
Google key lagne ke baad ye number sirf backup rehta hai (live Google number is par jeet jata hai).

Admin mein **"Abhi Google se update karein"** button (key lagne ke baad) foran naya number mangwata hai, ghante ka intezar nahi.

## Zaroori baatein
- Pehli paint par fixed number (`business.config.js`, ab 218) dikhta hai, phir live number aa jata hai. Isi liye `reviewCount` ko kabhi kabhi Google ke number ke qareeb rakhein.
- Google search ko dikhne wale meta description / pages ka text deploy ke waqt ka fixed number leta hai. Wo live nahi hota.
- Sirf **count aur rating** live hain. Review ke cards (naam + text) website par nahi dikhte. Google API sirf 5 reviews deta hai.
- Naqli reviews mat dalein: Google ki policy ke khilaf hai.

## Kin files mein badlaav hua
- `functions/api/reviews.js` (naya `?summary=1`), `functions/api/admin.js` (reviews_get / reviews_set / reviews_refresh)
- `src/components/reviews/store.js`, `Live.jsx` (live hook), `src/components/Reviews.jsx`, `RecentBookings.jsx`, `ReviewBadge.jsx`, `ReviewPanel.jsx`
- `src/pages/Home.jsx`, `Contact.jsx`, `Pages.jsx` (About), `src/pages/Admin.jsx` (Account tab ka card), `src/business.config.js` (211 → 218)
