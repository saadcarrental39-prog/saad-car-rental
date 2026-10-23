# SEO fix report (Roman Urdu / Hinglish)

## Pehle kya mila (framework)
React + Vite site, har page build ke waqt HTML mein bana diya jata hai (`scripts/prerender.mjs`), Cloudflare Pages par chalti hai.
Redirects, https/www aur 404 ka kaam `functions/_middleware.js` karta hai. Sitemap aur robots build mein khud bante hain.
Aap ki list ka bohat sa hissa (canonical, noindex /book, sitemap, 404, policy redirects, Service schema) pehle se maujood tha.
Neeche sirf wo hai jo is baar waqai theek kiya.

## Asal wajah (Search Console ke numbers)
| Masla | Wajah | Ab kya hua |
|---|---|---|
| Page with redirect (112) | purane/ghalat addresses: http, bina-www, `/page/` slash, purane naam (`/terms-and-conditions`, `/cancellation-policy`). Ye "redirect" hona normal hai, lekin 2-2 hop ban rahe the. | Middleware ab har cheez EK hi redirect mein theek karta hai (test kiya: 10 ghalat addresses, sab 1 hop). |
| Alternative page with proper canonical (39) | `/book?car=...`, `/book?svc=...` jaise parameter links crawl ho rahe the (112 jagah anchors). | In sab links par `rel="nofollow"` laga diya. Page `noindex, follow` hi hai. |
| Excluded by noindex (19) | Ye `/book...` aur consent/deletion pages hain: jaan boojh kar noindex. | Theek hain. Sitemap mein nahi hain, robots.txt mein block nahi (Google noindex padh sakta hai). |
| `/cars/mercedes-luxury` noindex | Ye page ab maujood hi nahi, `/cars` par 301 hai. Aap ke data mein purana URL tha. | Koi change nahi chahiye. Naya Mercedes page `/cars/mercedes-g-wagon` hai. |
| Discovered, not indexed (3) | `/services/premium-car-rental` ke links kam the. | Footer mein link, ab 59 pages se link. 629 words ka content pehle se hai. |
| Crawled, not indexed | `/cars/premium-luxury-land-cruiser` | 1400 words, unique FAQ, footer link. Koi thin-content nahi. |
| Product snippets / Merchant listings errors | Car pages par `Product` schema tha, jis ke `offers` mein price nahi tha (Google: "price ya priceSpecification chahiye"). | `Product` hata diya. Ab sirf `Service` (car rental with driver) hai. Ye sab 12 car pages par. Check: `node scripts/check-jsonld.mjs` -> Problems: 0. |

## Ek aur khatra jo theek kiya
Aap ke PC ki `.env` mein `VITE_SITE_URL=https://saad-car-rental.pages.dev` likha hai. Agar kabhi ye build mein chala jaye to canonical, sitemap
aur OG images sab `pages.dev` par chale jate. Ab code `*.pages.dev` ko site address maanta hi nahi (`src/business.config.js`).
Phir bhi Cloudflare mein check karein (neeche checklist).

## OG image (WhatsApp / Facebook / Google share)
- Har page par pehle se OG image thi. Ab `/book?car=prado-black` ya `/book?to=Faisal Mosque` jaise links par us gaari / jagah ki apni image aayegi
  (`functions/_middleware.js` + `og-map.json`, 30 gaariyan aur 66 jagahen).
- Agar aap ke paas koi aur link hai jis par image nahi aati, wo link mujhe bhej dein.

## Change log
| File | Kya badla | Kyun |
|---|---|---|
| src/seo/schema.js | Product schema hata diya, Service mein alternate names aur images | Google ka critical error |
| functions/_middleware.js | Sab redirects 1 hop; /book links ki share image | Redirect chain, OG |
| src/seo/registry.js, src/ssr/entry-server.jsx, scripts/prerender.mjs | og-map.json banta hai | /book share image |
| src/seo/blocks.jsx, src/pages/Cars.jsx, src/pages/Pages.jsx | `/book?...` links par nofollow | Parameter URLs |
| src/App.jsx | Footer mein Contact Consent, Data Deletion, Premium Car Rental, Premium Land Cruiser | Internal links |
| src/business.config.js | pages.dev kabhi site address nahi | Ghalat canonical se bachao |
| scripts/check-jsonld.mjs | naya: har page ka schema check | Task 9 |
| seo-page-audit.csv | naya: har page ki audit table | Task 11 |

## Policy pages ka faisla
`/terms-of-service`, `/privacy-policy`, `/refund-policy`, `/cookie-policy` = index, follow. `/contact-consent`, `/data-deletion` = noindex, follow, sitemap mein nahi.
Sab footer mein linked. Sab bina trailing slash. Purane `/terms-and-conditions`, `/cancellation-policy` 301 se naye par.

## Placeholders / jo aap ne dena hai
- Car pages par price schema mein nahi hai (har trip ka quote hota hai). Aap chahein to bata dein to fixed price likh sakte hain.
- Social links (sameAs): agar Facebook/Instagram ke asli links hain to bata dein.
- Reviews: schema mein koi rating nahi dali, kyunke page par asli reviews nahi hain.

## Deploy ke baad checklist
a) ZIP extract karke `update.bat` chalayen.
b) Cloudflare Pages -> Settings -> Environment variables: `VITE_SITE_URL` ya to khali ho ya `https://www.saadcarremtal.com`. `pages.dev` na ho.
   `CANONICAL_HOST` = `www.saadcarremtal.com`.
c) Rich Results Test mein 3-4 car pages aur `/services/premium-car-rental` test karein. "Product" nahi aana chahiye.
d) Search Console: sitemap `https://www.saadcarremtal.com/sitemap.xml` dobara submit, phir har masle par "Validate fix".
e) "Request indexing": home, /services/premium-car-rental, /cars/premium-luxury-land-cruiser, aur har /cars/* page.
f) Intezar: 1 se 4 hafte. "Page with redirect" aur "canonical" wali ginti zero kabhi nahi hoti, ye normal hai.

## Jo main code se verify nahi kar saka
- Cloudflare ki dashboard settings (upar b). Live check: `curl -I http://saadcarremtal.com/cars/prado/` -> sirf 1 redirect (301) www https par.
- `public/_redirects` aur middleware dono maujood hain. Agar kabhi bina-www purane address par 2 hop dikhein to batayein.
- /book share image ka HTMLRewriter sirf Cloudflare par chalta hai. Test: link WhatsApp ya Facebook Sharing Debugger mein daalein.
- Car pages ka text aapas mein kuch milta hai (6-lafz ke tukron mein 60% tak, template ki wajah se). Isay agla kaam banaya ja sakta hai.
