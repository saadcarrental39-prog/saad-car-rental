# Booking Orders in the Admin app (receipt picture, tone, count, notification)

## Kya hota hai
1. Customer website par **Book via WhatsApp** dabata hai -> booking + receipt ki picture Cloudflare storage mein save hoti hai (`/api/orders`), aur saath hi aap ki WhatsApp chat (+92 333 9850599) khulti hai jis mein sirf **premium text** hota hai. Customer ko sirf Send dabana hai. Receipt ki picture WhatsApp mein nahi jati, sirf app mein aati hai.
2. Aap ke Admin app ke **Orders** tab mein order aata hai: receipt ki picture (tap karke bari), naam, phone, pickup, drop, date, time, passengers, notes.
3. Har order par: **Call**, **WhatsApp** (customer ko), **Receipt** download, **Delete**.
4. Naye order par: premium tone (`public/sounds/order-tone.mp3`) 3 baar bajti hai, Orders tab par **laal count** (jaise WhatsApp), app ke icon par count, aur upar "naya booking order" ka banner.
5. Orders tab kholte hi order "seen" ho jata hai aur count kam ho jata hai.
6. App band ho tab bhi **phone notification** aati hai (neeche "Notifications on karein").

## Setup (kuch naya nahi)
Wohi KV storage (`SITEDATA` ya `RECEIPTS`) aur wohi `ADMIN_USER` / `ADMIN_PASS` jo Admin app ke liye pehle set hain. Push ki keys khud ban jati hain.
1. Deploy karein.
2. Phone par Admin app kholein (naya version khud update hota hai) -> **Orders** tab -> **Notifications on karein** -> Allow.
3. Ek test booking karke dekhein.

## Tone ke baare mein zaroori baatein
- **App khuli ho:** aap ki tone (enhance ki hui, tez aur saaf) full volume par bajti hai. Pehli baar screen par ek tap zaroori hai (browser ka rule); agar tone block ho to "Tone ke liye yahan tap karein" ka button aata hai.
- **App band ho (phone notification):** web notification mein website apni tone nahi laga sakti, phone apni notification awaaz bajata hai. Apni tone lagane ke liye: `order-tone-premium.mp3` ko phone ke Notifications folder mein copy karein, phir Android Settings > Apps > SAAD Admin > Notifications > (category) > Sound mein wohi tone chunen.
- **iPhone:** notification sirf Home Screen par install ki hui app se aati hai (iOS 16.4+), awaaz iPhone ki apni hogi.
- Icon par count: iPhone par number dikhta hai, Android par launcher ke hisaab se dot ya number.

## Limits
- Orders 120 din rakhe jate hain, phir khud hat jate hain.
- Ek hi receipt do baar bhejne par ek hi order banta hai. Delete kiya hua order wapas nahi aata.
- Spam se bachao: ek IP se ghante mein 20 orders tak.
