# Google "Page with redirect" and the ScamAdviser trust score (Oct 2026)

## 1. Google Search Console: "Page with redirect"
Two different things were mixed in that list.

1. **http:// and non-www addresses** (http://saadcarremtal.com/, https://saadcarremtal.com/services/...). They redirect to https://www.saadcarremtal.com on purpose. Google lists them as "Page with redirect" and that is normal. Nothing to fix. (Cloudflare: SSL/TLS > Edge Certificates > Always Use HTTPS = ON, and a Redirect Rule saadcarremtal.com/* -> https://www.saadcarremtal.com/$1, status 301.)
2. **https://www addresses without a slash** (routes/islamabad-to-faisalabad, locations/punjab ...). The site used to be built as folders (`routes/x/index.html`). Cloudflare Pages serves folders at `/routes/x/` and redirects `/routes/x` to `/routes/x/`, but our canonical, sitemap and links use `/routes/x`. So Google met a redirect on the address we asked it to index. **Fixed in this version:** pages are now flat files (`routes/x.html`), served at `/routes/x` directly with no redirect.

After you deploy: Search Console > Pages > "Page with redirect" > press **Validate fix** (or Request indexing on the main pages with the URL Inspection tool). Google takes days to weeks to re-check; the count falls slowly.

## 2. Trust score (ScamAdviser)
What the site can change (done): WhatsApp links now use the official api.whatsapp.com address instead of the wa.me short link, and a security.txt file is published. The Google Maps short link (maps.app.goo.gl) is still in `src/business.config.js` (`googleBusinessProfile`): open your Google Business Profile, copy the long https://www.google.com/maps/... address and paste it there to remove the last shortened link.

What the site cannot change (these are not website code):
- **WHOIS hidden with a paid privacy service** and **registrar reputation**: set by your domain registrar account.
- **New domain**: the score rises with the age of the domain, month by month.
- **Few visitors**: grows with SEO, Google Business Profile, WhatsApp referrals and real customers.
- A score of 90+ cannot be promised by anyone; the checker uses data we do not control. Real reviews, a verified Google Business Profile and a longer domain registration help over time. Do not buy fake reviews or fake trust badges.

## 3. Languages
See the plan in the chat answer: separate language URLs with hreflang (not automatic redirects), added in phases, translated and checked by a native speaker.
