# Home page booking box

- Sits right under the fading hero pictures (`src/components/HomeBooking.jsx`, styles at the end of `src/styles/site.css`, class `hb`). Black + white, orange buttons with white text.
- Step 1: pick-up location, pick-up date + time, drop-off date + time, optional different drop-off place -> **Search**.
- Step 2: car, name, phone, passengers -> **Book now**. This saves the order (with receipt picture) in the Admin app **Orders** tab, with the usual notification + tone, and opens the owner's WhatsApp with the message ready.
- If the visitor types a valid phone number and leaves without pressing Book now, the details still arrive in the Admin app **Clients** tab as "Home page booking" (form key `home`, `functions/_lib/leads.js`).
- Button colour is `#cc4a0a`: a slightly deeper orange so white text stays readable (PageSpeed Accessibility needs enough contrast; plain bright orange fails).

# Speed changes in this version
- Visit counting (`src/analytics.js`) and the live Google review number (`src/components/reviews/store.js`) now start only after the page has fully loaded and the browser is idle. Counting is unchanged; it just no longer competes with the first paint.
