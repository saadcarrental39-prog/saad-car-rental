# New pages (Oct 2026)

| Page | URL | Data file |
|---|---|---|
| Privacy Policy | /privacy-policy | `src/seo/data/legal.js` |
| Terms and Conditions | /terms-and-conditions | `src/seo/data/legal.js` |
| Disclaimer | /disclaimer | `src/seo/data/legal.js` |
| Cancellation and Changes Policy | /cancellation-policy | `src/seo/data/legal.js` |
| Car rental search guide (keywords) | /car-rental-guide | `src/seo/data/guide.js` |
| Tourists visiting Pakistan | /visit-pakistan | `src/seo/data/audiences.js` |
| Overseas Pakistanis | /overseas-pakistanis | `src/seo/data/audiences.js` |

All are in the footer, the mobile menu, sitemap.xml, the AI catalog (`/.well-known/ai-catalog.json`) and `public/llms.txt`.
Each page has its own title, description, share image, JSON-LD (WebPage, Breadcrumb, FAQPage, Service) and FAQ for answer engines.

## Add a search phrase (keyword)
Open `src/seo/data/guide.js`, add the phrase to the `phrases` list of the best group, run `update.bat`. The page, FAQ data and sitemap rebuild by themselves.
Keep phrases visible and honest (a car WITH a professional driver). Never hide keywords in white text or in code: Google treats that as spam.

## Before you rely on the legal pages
They contain no company registration number, refund percentage, advance amount or cancellation fee, because these were never confirmed. When you decide them,
add the exact terms to `legal.js` (section "Terms are set out in your quote" in the cancellation policy) and have a Pakistani lawyer read the pages once.

Share images for new pages: `npm run seo:og` (needs python3 + Pillow). Run `npm run build`: the SEO audit checks every page and stops the build on a problem.

# Two services: Out of Station and Local (Oct 2026)
- The customer must choose **Out of Station** (first card) or **Local · Islamabad** before any booking form opens (Home box, /book, booking popup). The choice shows in the WhatsApp message, the receipt, the Orders tab ("Service") and the Clients tab ("[Out of Station]" / "[Local]").
- Pages: `/out-of-station-car-rental`, `/local-car-rental-islamabad`, `/islamabad-places` and 19 place pages at `/islamabad/<name>` (`src/seo/data/islamabad.js`, `pillars.js`).
- Add a place: copy a block in `islamabad.js`, change text, `update.bat`. Keep every FAQ answer different from the other places, and no prices, hours, fees or distances.
- Out of Station pages use the existing places (`places.js`): add more cities / picnic spots there with `status: "live"`.
- Share images for new pages: `npm run seo:og`.
