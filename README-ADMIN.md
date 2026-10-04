# Owner Admin App (prices aur gaariyan)

## Kya hai
- Har car ke card par ab **Rs ___ / day** dikhta hai. Jab tak price set na ho, wahan "Call for price" likha aata hai.
- Owner ke phone ka alag **Admin app** hai: login, har gaari ki price badalna, naam / colour / photo badalna, gaari chhupana ya wapas dikhana, aur nayi gaari (ya nayi category) photo ke saath add karna.
- Badlaav Cloudflare ke storage mein save hote hain, isliye `update.bat` chalaye baghair ~30 second mein live site par aa jate hain.

## Admin ka link (chhupa hua)
`https://AAPKI-SITE.com/saad-owner-7k3x9`
Ye link site par kahin nahi dikhta aur Google se chhupa hai. **Sirf link chhupa hona hifazat nahi hai, asli hifazat password hai.**
Link badalna ho to teen jagah badlein: `src/config.js` (`ADMIN_PATH`), `public/admin.webmanifest` (start_url aur scope), `public/_headers`.

## Setup (sirf ek baar, Cloudflare Dashboard)
1. **Storage:** Workers & Pages > aap ka Pages project > Settings > Bindings (Functions) > KV namespace. Pehle se `RECEIPTS` bind hai to wahi chal jayega. Warna naya namespace banakar variable name `SITEDATA` se bind karein.
2. **Login:** Settings > Variables and Secrets (Production) mein ye do add karein:
   - `ADMIN_USER` = `admin`
   - `ADMIN_PASS` = aap ka password (Type: Secret)
3. `update.bat` chalayein (ya Deployments mein Retry), taake settings lag jayen.
4. Phone par admin link kholein, login karein, phir **Install app** dabayein.
   - Android (Chrome): Install app ya menu (⋮) > Add to Home screen.
   - iPhone: Safari mein Share > **Add to Home Screen**.

## Password ke baare mein zaroori baat
Login kabhi code ya GitHub mein nahi hota, sirf Cloudflare ke Secret mein. Aap ne `admin` / `admin123` maanga tha, wo `ADMIN_PASS` mein likh sakte hain, magar ye sab se pehle andaza lagaya jane wala password hai. Agar kisi ko link mil gaya to wo price badal sakta hai. Kam az kam 10 akshar ka password rakhein. 8 galat koshish ke baad 15 minute ke liye lock lag jata hai. Password badalte hi purane login (phone) khud log out ho jate hain.

## Istemal
- **Price:** gaari ke saamne Rs wali box mein likhein, neeche **Save karein**.
- **Chhupana:** "Visible" ka tick hata dein, Save karein. Gaari site se hat jati hai, delete nahi hoti.
- **Naya add:** "+ Nayi gaari add karein". Behtar photo wo hai jis ka background transparent ho (PNG/WebP), jaise site ki baaki photos. Phone ki aam photo bhi chalti hai magar background ke saath nazar aayegi. Photo ke baghair gaari carousel mein nahi dikhti.
- Har Save se pehle ka data ek backup (`site:fleet:prev`) mein rakha jata hai.

## Limits
- Static gaariyon ki asli list `src/data/fleet.js` mein hai. Admin app sirf us ke upar badlaav lagata hai.
- Delete ki hui gaari ki photo storage mein reh jati hai (bohat chhoti jagah leti hai).
- Booking receipt / WhatsApp message mein abhi price nahi aati.

---
# Premium Admin app: icon, opening animation, auto-update
- **Icon:** `public/icons/saad-*.png` (aap ki SAAD CAR RENTAL SERVICES wali image se bane). App ke andar ka logo: `public/icons/saad-logo.png`.
- **Opening animation:** app kholte hi `public/icons/saad-splash.mp4` (aap ki logo video, bina awaaz ke) chalti hai, phir login page aata hai. Screen par tap karne se skip ho jati hai. Dobara dekhne ke liye app band karke phir kholein.
- **Auto-update:** har `update.bat` (yaani har build) par app ka service worker (`admin-sw.js`) aur `version.json` naye number ke saath ban jate hain. Phone par app khulte hi naya version khud download hota hai aur app ek baar reload ho kar update ho jati hai. Koi aur kaam nahi.
- **Icon update:** Android (Chrome) apne aap manifest dobara check karta hai aur naya icon laga deta hai, aam taur par 1 din ke andar. **iPhone par icon khud nahi badalta** (Apple ki limit): purana app hata kar Safari se dobara "Add to Home Screen" karein.
- Naya icon / video badalna ho to `public/icons/` mein wohi naam rakh kar file badlein, phir `update.bat`.
