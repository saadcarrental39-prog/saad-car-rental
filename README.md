# SAAD CAR RENTAL SERVICES – website
React + Vite + GSAP + React Router. Built from the supplied land-cruiser-carousel project.
## Updates and cache
Every build gets a new ID. Hashed files in /static are cached forever, HTML and /assets are always revalidated, and the site checks /version.json on load and when the tab is reopened, then reloads itself once if a newer build exists. The footer shows the build number so you can confirm which version is running.
## Hero
The hero on the Home page loops fleet pictures (src/components/HeroShowcase.jsx). IMAGE_MS = time per picture, FADE_MS = fade length. Videos were removed: they are full dark scenes and cannot be made transparent.
## Run
`npm install` · `npm run dev` · `npm run build` (output: `dist/`)
## Configure (.env, copy from .env.example)
VITE_WHATSAPP_NUMBER (digits, country code), VITE_PHONE_NUMBER, VITE_SITE_URL. Without them, WhatsApp/Call buttons are hidden and a call fallback shows.
## Cloudflare Pages
Connect the repo · build `npm run build` · output `dist` · set the env vars · add custom domain under Pages > Custom domains (HTTPS is automatic). SPA routing works by default on Pages.
## Before launch
Replace `YOUR_DOMAIN.com` in `public/robots.txt`, `public/sitemap.xml` and set VITE_SITE_URL. Then in Google Search Console: add property, verify (DNS TXT), submit `/sitemap.xml`, use URL Inspection > Request indexing. Indexing is not automatic.
## Add a vehicle / colour / model
Edit `src/data/fleet.js` (one entry per model/colour). Put verified images in `public/assets/vehicles/<category>/` (webp). Entries without an image show a placeholder. Add new category pages to `public/sitemap.xml`.
## Business details (src/config.js)
Showrooms on the Home page are set in `ROOMS` at the top of `src/pages/Home.jsx`: add a new category slug there once its images exist in `fleet.js`.

Phone 0333 9850599 (+923339850599), WhatsApp defaults to the same number (override with env vars). 22 years, 5.0 rating, 211 Google reviews are set in `SITE` in `src/config.js`; update them when they change. Live review cards are built: see `README-REVIEWS.md` (Pages Function in `functions/api/reviews.js`). No AggregateRating schema is added on purpose (Google does not allow self-served reviews in LocalBusiness markup).
