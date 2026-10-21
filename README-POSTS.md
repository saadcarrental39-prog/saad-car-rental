# Posts: Trips, Spots & Videos (daily content, har post ka apna SEO page)

## Kya hai
Admin app mein **Posts** tab (Spots tab ki jagah). Aap sirf ye daalte hain: title, meta description, focus keyword, tags, images ke links
(imgbb / postimages), reels / video links, spots, FAQ. Save dabate hi:
- `https://www.saadcarremtal.com/posts/<slug>` naya page ban jata hai (poora HTML, Google seedha parhta hai): title, meta, H1, text, images, video, FAQ, schema (BlogPosting, FAQPage, VideoObject, BreadcrumbList, ItemList)
- `/posts` list page aur home page ka "Trips · Spots · Reels" hissa khud update hota hai
- `sitemap-posts.xml` (images + videos ke saath) update hota hai, `sitemap.xml` aur `robots.txt` mein pehle se listed
- Bing / Yandex ko IndexNow se foran khabar jati hai
Koi rebuild / update.bat nahi chahiye. Hosting mein sirf text (KV) save hota hai, photos / videos aap ke links par hi rehte hain.

## Roz ka tareeqa (2 minute)
1. imgbb / postimages par photo upload karein, **Direct link** copy karein (`i.ibb.co/...` ya `i.postimg.cc/...`). Page link (`ibb.co/xxxx`) kaam nahi karta, tab warning dikhti hai.
2. Facebook / Instagram / YouTube reel ka link copy karein.
3. Admin > Posts > **+ Nayi post**. “✨ Khali SEO fields khud bharo” dabayein, title / location / short answer / details likhein.
4. SEO checklist **85%+** karein, **Publish karein**.
5. Wohi page link Facebook / Instagram / WhatsApp status par share karein (backlink + traffic).
Aane wali date daalein to post usi din live hogi (scheduling): 7 posts ek saath bana ke roz ek chalwa sakte hain.

## Autoplay
- YouTube, Facebook: page par scroll karke video aate hi khud chalti hai (awaaz band, tap par on). Is se page tez bhi rehta hai (video tab tak load nahi hoti).
- Seedha .mp4 link: autoplay + loop, bahar nikalte hi pause.
- Instagram / TikTok apni taraf se autoplay allow nahi karte: wahan play button dabana parta hai (platform ki pabandi).

## Text likhne ke nishan
`## Heading`, `### Chhota heading`, `- bullet`, `**bold**`, `[text](/cars)` (internal link). Naya paragraph = khali line.

## Ranking ke liye zaroori
- Har post ka **ek** focus keyword (jaise “islamabad to murree car with driver”) title, description, short answer mein ho.
- Short answer 25-70 alfaz: Google AI Overview / ChatGPT / voice search yehi uthate hain (AEO + GEO).
- Kam az kam 3 images (alt text ke saath), 1 video, 2 FAQ, 400+ alfaz.
- Live post ka address (slug) kabhi nahi badalta.
- Search Console: `https://www.saadcarremtal.com/sitemap-posts.xml` ek baar Sitemaps mein add karein. Naye post ke liye URL Inspection > Request indexing.
- Bing Webmaster: `BingSiteAuth.xml` public/ mein hai (verify), sitemap.xml add karein.

## Cloudflare par kuch naya nahi
Wohi `SITEDATA` / `RECEIPTS` KV aur `ADMIN_USER` / `ADMIN_PASS`. Sirf deploy karein (`update.bat`).
