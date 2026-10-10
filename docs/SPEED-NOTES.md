# Speed notes (PageSpeed 95+ and Agentic browsing 4/4)

What was changed and why:
- Hero picture: the first car is visible immediately (it used to fade in after the scripts loaded, which made "Largest Contentful Paint" 2.5 s). The home page also tells the browser to download it first (preload + fetchpriority).
- Car photos have small copies (`-480.webp`, `-800.webp`). Phones download the small one. Make them for new photos with `python3 scripts/make-image-sizes.py`.
- Carousel pictures load only when the carousel is about to be seen (before, all 17 downloaded at once, twice: picture + shine mask).
- GSAP (scroll effect) is downloaded after the page is already usable.
- `public/_headers`: `/assets/*` is cached 1 year. Rename a file when you replace a photo.
- `.well-known/ai-catalog.json` is created by `scripts/prerender.mjs` from `src/business.config.js` (only real public pages). `npm run build` fails if it is missing or not valid.
- Admin app: new photos are shrunk to about 150 KB.
