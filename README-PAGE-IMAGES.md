# Page photos (how to add or change a picture)

1. Put the photo (.jpg) in `page-images-src/`. The file name decides the key: lower case, every group of other characters becomes `-`
   (`f6_super_market.jpg` -> `f6-super-market`, `murree__3_.jpg` -> `murree-3`).
2. Run once on your PC:  `python scripts/make-page-images.py`   (needs Pillow: `pip install pillow`)
   It makes the fast web versions in `public/assets/pages/`, the share image (1200x630) in `public/images/og/` and updates the manifest.
3. Run `update.bat` as usual.

Which picture goes on which page (and the alt text / caption) is in `src/seo/data/pageImages.json`.
A picture that is listed there but not yet in `page-images-src/` is skipped, so nothing breaks.

Still needed (already wired, they appear as soon as the file exists):
- `f6_super_market.jpg`  -> /islamabad/f6-super-market
- `toyota_grande.jpg`   -> /cars/toyota-grande

Page text (why us, offers, FAQs, #tags) is in `src/seo/data/pageBoost.js`.
