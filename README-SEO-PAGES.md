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
