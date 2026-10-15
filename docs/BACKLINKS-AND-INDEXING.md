# Free backlinks, listings and indexing (new cars: Lexus LX 570, G Wagon, Audi, Fortuner)

Backlinks cannot be added from code: they come from profiles you create on other sites. Use the SAME name, address and phone everywhere.

## Copy-paste business details
- Name: SAAD CAR RENTAL SERVICES
- Address: Office No 12, 3rd Floor, Shah Nawaz Plaza, G-11 Markaz, Islamabad 44000, Pakistan
- Phone / WhatsApp: +92 333 9850599
- Website: your real domain (the one set in Cloudflare)
- Short text: Car rental with a professional driver in Islamabad. Lexus LX 570, Mercedes G Wagon, Audi, Toyota Fortuner, Land Cruiser, Prado, Revo, Civic, Corolla and Coaster for airport transfers, weddings, business and trips to Murree, Hunza and Skardu.

## Where to create free profiles (put the website link in each)
1. Google Business Profile (most important; add each car as a photo, link /cars). Then paste the long Google Maps URL into `googleBusinessProfile` in `src/business.config.js`.
2. Bing Places, Apple Business Connect.
3. Facebook page, Instagram, TikTok, YouTube, LinkedIn page, Pinterest, X. Put the real links in `socialProfiles` in `business.config.js` (they then become schema `sameAs`).
4. Free Pakistani business directories and classified sites: add the business with the same details; skip any that ask for payment or look spammy.
5. Post a photo + link per car on Facebook/Instagram/Pinterest, using the car page as the link:
   - /cars/lexus-lx-570  - /cars/mercedes-g-wagon  - /cars/audi  - /cars/toyota-fortuner

Do not buy backlink packages or post links in comments in bulk: Google treats this as spam and can lower the whole site.

## Per-car text for posts (honest, no prices)
- Lexus LX 570 with driver in Islamabad: full-size luxury SUV for VIP travel, weddings, airport pickups and long trips.
- Mercedes G Wagon (G Vegan) with driver in Islamabad: weddings, groom entry, VIP arrivals and events.
- Audi with driver in Islamabad: executive travel, airport transfers, weddings and city trips.
- Toyota Fortuner with driver in Islamabad: family trips, Murree, Naran, airport pickups and Lahore.

## After each deploy
1. Search Console > Sitemaps: `https://YOUR-DOMAIN/sitemap.xml` (already lists the 4 new pages).
2. URL Inspection > Request indexing for the 4 car pages and /cars.
3. Optional (Bing/Yandex): after the deploy is live run `node scripts/indexnow.mjs` (needs `dist/` from `npm run build`).
4. Bing Webmaster Tools: import the site from Search Console.
