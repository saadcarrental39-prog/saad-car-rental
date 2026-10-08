# Saad Car Rental: SEO / GEO / AEO playbook (phase 1 + phase 2)

Domain: https://www.saadcarremtal.com/ (single canonical host; change only `VITE_SITE_URL`). Targets such as 10,000 visits a day are growth goals, not guarantees.

## 1. Audit of the live site (before this work)
**Current problems**: client-rendered app; every URL returned the same HTML shell (one generic title, a 6-word meta description, no canonical, no OG image, no JSON-LD on first load), so WhatsApp, Facebook and Telegram previews had no image and Google had to render JavaScript to see anything. The catch-all route showed the Home page for any wrong URL (soft-404 / duplicate content). `robots.txt` and `sitemap.xml` still contained `YOUR_DOMAIN.com`. No favicon link tags, no `favicon.ico`. No security headers beyond caching. Thin vehicle pages (heading + carousel), thin services page (13 cards, no text, all linking to /book). No location, route, destination, airport or FAQ content. No conversion tracking.
**Technical**: no prerender; head tags set only after JavaScript; schema only AutoRental without phone/logo; Home H1 did not say what/where.
**Security**: no HSTS / nosniff / referrer / permissions headers; `/api/*` and `/r/*` not marked noindex. (Admin path was already noindex; no secrets found in `src/`.)
**Missing**: location pages, route pages, destination pages, airport page, service detail pages, FAQ, hubs, share images, analytics events.

## 2. What was built
| Area | Where |
|---|---|
| Single source of truth for business data | `src/business.config.js` (+ `src/config.js` derives from it) |
| Pages data (places, routes, services, FAQ, vehicle fit) | `src/seo/data/*` |
| Page registry: title, description, canonical, robots, OG, breadcrumbs, schema, `indexable` flag | `src/seo/registry.js` |
| Schema (AutoRental, WebSite, WebPage, Breadcrumb, Service, FAQPage, ImageObject) | `src/seo/schema.js` |
| Real HTML for every page at build time (crawlers + WhatsApp see content) | `scripts/prerender.mjs` |
| Segmented sitemaps + image sitemap + robots.txt (generated, never stale) | `scripts/prerender.mjs` |
| Quality gate (score >= 80 or the build fails), duplicate / similarity / link / schema / security checks | `src/seo/quality.js`, `scripts/seo-audit.mjs` |
| 82 share images 1200x630 with real vehicle photos | `scripts/make-og.py` -> `public/images/og/` |
| Favicon.ico + icons + theme colour | `public/favicon.ico`, `index.html` |
| Conversion events | `src/analytics.js` |
| Security headers | `public/_headers` |
| URL / keyword / metadata / schema / OG / internal-link maps | `npm run seo:maps` -> `dist-reports/*.csv` |

Rules enforced in code: only `status: "live"` places get pages; `indexable=false` removes a page from the sitemap and adds `noindex`; no prices, distances, journey times, reviews or offices outside Islamabad are ever generated; no AggregateRating.

## 3. Architecture and URL map
`/` Home | `/cars`, `/cars/<vehicle>` (8, unchanged URLs) | `/services`, `/services/<slug>` (14) | `/airport-transfer/islamabad` | `/car-rental-pakistan` | `/locations` + `/locations/<city>` (15) + provinces `/locations/punjab`, `khyber-pakhtunkhwa`, `gilgit-baltistan`, `azad-kashmir` | `/northern-areas` | `/destinations` + `/destinations/<slug>` (15) | `/routes` + `/routes/islamabad-to-<city>` (13) | `/faq` | `/about` | `/contact` | `/book` (noindex).
Why destinations have no separate route page: a destination page already answers "Islamabad to X", and a second near-identical page would be a doorway page. `/book` is a form with no search value (noindex,follow).
Existing URLs were all kept (no redirect map needed). Province pages for Sindh and Balochistan, and every district, stay data-only until the service is confirmed.

## 4. Entity graph and internal links
Business -> vehicles -> services -> locations -> routes -> destinations -> FAQ. Generated in `src/seo/links.js`; every page links to its parents, siblings and 8+ related pages (see `dist-reports/internal-links-map.csv`).

## 5. GEO / AEO / AI search
Each page opens with a direct "Short answer" box, then detail, then related links, then CTA; FAQs are real and priced-free; the entity (name, address, phone, area served) is identical in HTML, schema and Google Business Profile. No fake "AI tags". Keep content factual and first-hand: add real trip notes from your drivers over time.

## 6. Image / video SEO
Photos already have descriptive alt text and dimensions. Rename future photos like `saad-car-rental-prado-islamabad.webp`, keep them 1200 px wide WebP under 150 KB. Video plan (YouTube first, then embed with VideoObject): Prado, Land Cruiser, Revo, airport pickup, booking walkthrough, northern trip, Coaster, chauffeur service.

## 7. Google Business Profile plan
Primary category Car rental service (add Chauffeur service); exact business name only (no keywords); address as on the site; phone 0333 9850599; website = https://www.saadcarremtal.com/; hours once confirmed; service areas = places you really serve; add real photos of every vehicle weekly; ask every happy customer for a genuine review and reply to all; one post a week (trip photo + call/WhatsApp button). Never buy reviews.

## 8. Conversion plan
Every page has Call now / WhatsApp now / Get a quote (prefilled route in the WhatsApp text and the booking form via `?from=&to=&car=`) and the mobile sticky bar. Events: phone_click, whatsapp_click, email_click, booking_click, quote_start, quote_submit, form_error, vehicle_view, service_view, route_view, location_view, each with landing page, source, medium, device. In GA4 mark `quote_submit`, `phone_click`, `whatsapp_click` as key events. KPI: qualified leads, not visits.

## 9. Security report
Added: nosniff, HSTS, frame, referrer and permissions policies, report-only CSP (check the browser console for reports for a week, then rename the header to `Content-Security-Policy`), noindex on `/api/*`, `/r/*`, admin; robots.txt blocks private areas but is not relied on for security; the audit fails the build on `.env`, `.git`, `.map`, archives, dumps, or secret-like strings in `dist/`. Existing: honeypot on forms, server-side secrets only in Cloudflare env vars. Still to do on your side: turn on Cloudflare "Always Use HTTPS", add rate-limit rules for `/api/contact` and `/api/booking`, enable Dependabot / `npm audit`.
## 10. Performance and accessibility
Prerendered HTML shows text before JavaScript loads; images carry width/height and lazy-load; analytics loads on idle; fonts are non-blocking. Skip link, labelled nav/breadcrumbs, native `<details>` FAQ (keyboard friendly), visible focus. Check Core Web Vitals in Search Console after launch (target LCP < 2.5 s, INP < 200 ms, CLS < 0.1).

## 11. Launch checklist
1. Fill `BUSINESS-INFO-REQUIRED.md`. 2. Set env vars (`VITE_SITE_URL`, optional GA4). 3. `npm install && npm run build` (runs prerender + audit; must print 0 problems). 4. Deploy to Cloudflare Pages; set domain redirect so `saadcarremtal.com` -> `https://www.saadcarremtal.com` (single host). 5. Check `/robots.txt`, `/sitemap.xml`. 6. Search Console: add Domain property (DNS TXT), submit `https://www.saadcarremtal.com/sitemap.xml`, inspect Home + 3 route pages + request indexing. 7. Test sharing a route link in WhatsApp (previews are cached by WhatsApp; use a new URL variant or Facebook Sharing Debugger to refresh). 8. Validate schema on 3 pages (Rich Results Test). 9. Update Google Business Profile website link.
## 12. Maintenance checklist
Weekly: GBP post + photos, reply to reviews. Monthly: Search Console (queries, pages, coverage), update season/road notes, `npm run seo:audit`, add one genuinely useful guide. Quarterly: review drafts in `places.js` and promote only confirmed ones; refresh OG images (`npm run seo:og`).

## 13. Roadmap
**0-30 days**: deploy, Search Console, GBP optimisation, confirm routes, real Range Rover / Coaster photos, first 20 reviews asked. **31-60**: vehicle photo galleries, 3 to 5 guides (Prado vs Land Cruiser, Naran with family, how airport pickup works, northern trip planning), review replies, partner links (hotels, tour operators). **61-90**: YouTube videos + VideoObject, local press and tourism directory citations, corporate partnerships, evaluate drafts (Lahore pickups etc.). **6 months**: promote confirmed draft pages, add Urdu pages for top routes, build a reviews page from real Google reviews. **12 months**: seasonal landing pages (Murree snow, summer north), corporate case studies, dedicated blog hub.

## 14. Competitor analysis (to do with live data)
This environment could not browse competitor sites. Method: list the top 10 results for "car rental Islamabad with driver", "Islamabad to Hunza car", "Prado rent Islamabad"; compare fleet pages, route coverage, review counts and page speed; do not copy; target gaps (real photos, clear answers, route detail, no fake pricing).
