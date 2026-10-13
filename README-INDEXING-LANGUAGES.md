# Google indexing fix + languages + trust (Oct 2026)

## 1. Why Search Console showed "Page with redirect" / "Alternative page with proper canonical" / "Crawled - not indexed"
Cloudflare Pages answered `/routes/x` with a redirect to `/routes/x/`, but every page said its canonical was `/routes/x` (no slash) and the sitemap listed `/routes/x`.
Google therefore saw: sitemap URL -> redirect, slash URL -> "canonical is another URL". The bare domain `saadcarremtal.com` also answered 200 by itself (a second copy of the site).

Fixes in this version
- `scripts/prerender.mjs`: pages are written as `route.html` (served at `/route`, status 200, no redirect). Canonical, sitemap and links all use the same no-slash address.
- `functions/_middleware.js` (new): http -> https, `saadcarremtal.com` -> `www.` (301), `/page/` -> `/page` (301), wrong upper-case -> lower-case, **real 404** for URLs that do not exist (no more soft-404), `*.pages.dev` gets `noindex`.
- `public/_redirects` + middleware: `/cars/mercedes-luxury` -> `/cars` (old car page).
- Sitemaps no longer carry a `<lastmod>` that changes for every page on every deploy.
- `/book` stays `noindex` on purpose ("Excluded by noindex" for /book is correct, ignore it).

"Crawled - currently not indexed" is Google's quality/priority decision, not an error. After the fix above Google can finally consolidate signals; the rest needs time + links:
get real links (Google Business Profile, Facebook/Instagram/TikTok pages linking to the site, directories), keep adding unique text to the thinnest pages, and request indexing for the 10-15 most important URLs.

### What to do in Search Console after deploy
1. Deploy. Open `https://saadcarremtal.com/services/private-tours` -> must jump to `https://www...`; open `/routes/islamabad-to-hunza/` -> must jump to no-slash.
2. Search Console -> Sitemaps -> remove old, add `https://www.saadcarremtal.com/sitemap.xml`.
3. Each report (Page with redirect, Alternative page with proper canonical, ...) -> **Validate fix**. Validation takes up to ~2 weeks.
4. URL Inspection -> Request indexing for: `/`, `/cars`, `/services`, `/routes/islamabad-to-hunza`, `/airport-transfer/islamabad`, `/contact`.
5. Expected leftovers that are NOT problems: `http://` and non-`www` URLs listed under "Page with redirect" (they are meant to redirect), `/book` under noindex.

## 2. Languages (16)
English US, English UK, Urdu, Arabic, Persian, Chinese (Simplified), Japanese, Korean, Dutch, German, French, Spanish, Italian, Turkish, Russian, Malay. **No Hebrew / Israel region.**
- Auto choice: (1) the visitor's saved choice, (2) browser/phone language, (3) country (`/api/geo`, Cloudflare), (4) English (UK English for UK, Pakistan, India, Ireland, Australia ...).
- Selector (globe) in the header, mobile menu and footer. Urdu / Arabic / Persian switch the page to right-to-left.
- Translated: menu, footer, cookie notice, home, fleet, services, about, contact, all booking forms (labels, errors, buttons), reviews, "how to book", FAQ headings.
  The long guide texts of route / location / legal pages stay English and show one short notice in the visitor's language. (Googlebot always sees the normal English site: no redirects, no cloaking.)
- Booking messages that arrive on your WhatsApp / Admin stay in English on purpose.
- Edit a translation: `src/i18n/dict/<code>.js` (line number = line in `src/i18n/keys.js`). Check: `node scripts/i18n-check.mjs`.
- New text on the site: wrap it with `t("English text")`, add the English text at the END of `keys.js`, then add the same number to each language file.

## 3. ScamAdviser / trust (what code can and cannot do)
Done in code
- Removed the short link `maps.app.goo.gl` and the short domain `wa.me` (likely cause of "technology to shorten links"). **Paste your long Google Maps URL into `googleBusinessProfile` in `src/business.config.js`.**
- Single canonical host, 404s for wrong URLs, https everywhere.
You must do (cannot be done in code)
- Add a business e-mail (`email` in business.config.js) and your real Facebook / Instagram / TikTok / YouTube URLs (`socialProfiles`) - empty today.
- ScamAdviser "Claim your site / Business verification", Google Business Profile with the same name/address/phone, Trustpilot or Google reviews.
- WHOIS privacy hides the owner: use the registrar's option to show business details, and register the domain for 2+ years.
- Domain age and visitor count only grow with time. 90+ is realistic after a few months of real traffic, not immediately.
- **Spelling: the domain is `saadcarremtal.com` ("remtal", not "rental").** Scam checkers and customers read this as a typo/look-alike. Strongly consider buying `saadcarrental.com` (or similar) and 301-redirecting the old name to it; set `VITE_SITE_URL` and `CANONICAL_HOST` for the new name.
- The "recent bookings" popup must only show real customers who agreed (see `src/data/customers.js`); invented names harm trust.

Cloudflare variable (optional): `CANONICAL_HOST` = `www.saadcarremtal.com` (default already).

## Google Analytics (GA4)
Measurement ID G-4X8SSHV3BG is set in src/business.config.js (analytics.ga4). It loads only after the visitor presses Accept in the cookie notice.
To change it later, edit that one value (or set VITE_GA4_ID in Cloudflare, which wins over the file). Check: Analytics > Reports > Realtime.
