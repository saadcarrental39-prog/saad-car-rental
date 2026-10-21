> NOTE: admin app ka "Spots" tab hata kar uski jagah "Posts" tab aa gaya hai (README-POSTS.md). Is file ke purane admin steps ab lagu nahi.

# Murree spot pages + photos

Pages (after build): /murree-tourist-spots and one page per spot (Patriata, Mall Road, Kashmir Point, Pindi Point, Bhurban, Ayubia).
Text lives in src/seo/data/tourSpots.js. To add a spot (e.g. Nathia Gali, Dunga Gali, Lalazar): copy one block, change slug/text, run update.bat.

Photos by URL:
1. Open  <your-admin-path>/spot-images  (e.g. https://www.saadcarremtal.com/<admin>/spot-images)
2. Paste image URLs + short alt text per spot, press Download spot-images.json
3. Copy that file to  public/spot-images.json  (shows in the browser straight away) AND  src/seo/data/spotImages.json  (goes into the page HTML at the next build, which is what Google reads).
Use images you own or have permission for.
