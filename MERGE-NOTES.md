# Merge notes (10 Oct 2026)

Base: `saad-car-rental-seo latest and update.zip` (SEO + speed work kept exactly as it was).
Added back from old `saad.zip`:
- Dashboard (Insights, LIVE visitors): `src/components/Insights.jsx`, `src/styles/insights.css`, `functions/_lib/stats.js`, `functions/api/visit.js`, `collect.js`, `src/analytics.js`
- Clients / Leads tab: `functions/api/lead.js`, `functions/_lib/leads.js`, `src/leads.js` + Book / Contact / BookingModal (email field) 
- Admin app (`src/pages/Admin.jsx`, `admin.css`, `functions/api/admin.js`, `sw/admin-sw.template.js`) with all tabs
- Google reviews live: `functions/api/reviews.js`, `src/components/reviews/*`, `src/data/reviews.js`
- Receipt + car details: `functions/receipt.js`, `src/pages/Receipt.jsx`, `ReceiptActions.jsx`, `receiptImage.js`, `VehicleDetails.jsx`, `src/data/details.js`
- `update.bat`, `update-with-message.bat`, `_update-core.bat`, `check-status.bat`, `start-dev.bat`, README-INSIGHTS/LEADS/REVIEWS/RECEIPT-DETAILS/UPDATE.md

Merged by hand: `index.html`, `public/_headers` (/bundle/* cache stays 1 hour, as in the old fix; /assets/* stays 1 year), `Home.jsx`, `site.css`, `Admin.jsx` (old + the new smaller photo `shrink()`).
NOT brought over (SEO stays as in the new zip): /visit-pakistan and /overseas-pakistanis pages, llms.txt.
