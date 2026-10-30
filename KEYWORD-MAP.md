# Keyword map: kaunsa keyword kis page par (Roman Urdu / Hinglish)

## 1. Aap ki CSV (KeywordStats_10_29_2026.csv) mein asal mein kya hai
- Is file mein **sirf 100 keywords** hain aur ye **duniya bhar ke (zyada tar USA/UK)** numbers hain. Isme London, Toronto, Johannesburg ke keywords hain, Pakistan ke nahi.
- Sab se zyada impressions wale brand naam hain (Enterprise, Hertz, Avis, National, Turo, Zipcar, Kayak waghera). **Inhein hum use nahi kar sakte**: ye doosri companies ke naam hain.
- Kaam ke general words: `rental cars`, `car rental`, `rent a car`, `car hire`, `hire car`, `rent car`, `car rentals`, `car for rent`, `cars for rent`, `car rent`, `car on rent`, `rent a car near me`, `book rental car`, `self drive car rental`.
- Is liye ye numbers Pakistan ke liye "trend" ya "traffic" ka saboot nahi hain. Pakistan ka asli data aap ki apni Search Console (Performance > Queries, country = Pakistan) aur Bing Webmaster Tools (Keyword Research, country = Pakistan) se milega. Jo 200 keywords aap ne paste kiye, unka koi volume is CSV mein nahi hai.

## 2. Qaida: har page ko ek main phrase
Sab 200 keywords har page par nahi. Har page ko apne customer ke sawal ke hisab se 1 main phrase aur 2-3 kareeb ke phrase (title, description, H1, FAQ mein, natural jumlon mein).

| Page | Main phrase | Saath ke phrase |
|---|---|---|
| Home `/` | rent a car Islamabad with driver | car rental, car hire, airport pickup, weddings |
| `/car-rental-pakistan` | car rental Pakistan | rent a car with driver Pakistan, chauffeur service, luxury / family / tourist car rental |
| `/locations/islamabad` | rent a car Islamabad | car hire Islamabad, car rental Islamabad |
| `/airport-transfer/islamabad` | Islamabad airport pickup service | airport transfer, airport drop |
| `/local-car-rental-islamabad` | local car rental Islamabad | daily car with driver |
| `/out-of-station-car-rental` | outstation car rental Islamabad | one way, long distance |
| `/services/corporate-transportation` | corporate car rental Islamabad | executive car, staff transport |
| `/services/wedding-event-transportation` | wedding car rental Islamabad | bridal car, wedding guest transport |
| `/services/chauffeur-service` | chauffeur service Islamabad | chauffeur driven car |
| `/services/vip-executive-transportation` | VIP car service Islamabad | protocol car service |
| `/services/group-transportation` | group transportation with driver | Coaster hire |
| `/services/premium-car-rental` | premium car rental Pakistan | luxury cars with driver |
| `/cars/land-cruiser-v8` | Land Cruiser V8 rental Islamabad | Land Cruiser rent a car |
| `/cars/premium-luxury-land-cruiser` | Premium Land Cruiser rental Islamabad | VIP, executive, wedding |
| `/cars/prado` | Prado rent a car Islamabad | Prado rental Pakistan |
| `/cars/toyota-fortuner` | Fortuner rent a car Islamabad | Fortuner rental |
| `/cars/revo` | Revo rent a car Islamabad | Hilux Revo rental |
| `/cars/honda-civic` | Honda Civic rental Islamabad | Civic rent a car |
| `/cars/toyota-grande` | Corolla Grande rental Islamabad | Corolla rental |
| `/cars/coaster` | Coaster rent a car Islamabad | Coaster rental |
| `/cars/range-rover` | Range Rover rental Pakistan | luxury SUV |
| `/routes/islamabad-to-<city>` (sab) | Islamabad to <city> car rental | car hire, rent a car |
| `/locations/<city>` (sab) | rent a car in <city> with driver | car with driver |
| `/visit-pakistan` | rent a car in Pakistan for tourists | private driver for tourists |
| `/overseas-pakistanis` | airport pickup for overseas Pakistanis | family travel |
| `/northern-areas` | northern areas tour with driver | rent a car |
| `/faq` | sawal wale phrase | "how much does car rental cost in Pakistan", "is driver included", "can tourists rent a car in Pakistan", "how to book airport pickup", "which car is best for Murree / Hunza" waghera (15 naye jawab shamil kiye) |
| `/guides/...` (20 posts) | trip phrase | Islamabad to Skardu / Hunza / Kumrat / Naran / Swat... |

## 3. Jo keywords maine jaan boojh kar use NAHI kiye (aur kyun)
- **self drive car rental**: hum sirf driver ke saath dete hain. Is liye FAQ mein saaf likha hai "No, with driver only". Isse sahi customer aata hai.
- **Toyota Yaris, Suzuki Alto**: ye gaariyan aap ke fleet mein nahi hain. Fleet mein aayein to page ban jayega.
- **Karachi, Sialkot** ke alag page: hamara base Islamabad hai. FAQ mein honest jawab hai ("contact karein, hum confirm karte hain").
- **best car rental in Pakistan, cheapest, affordable, protocol guarantee**: ye dawe hain jo hum saabit nahi kar sakte. Site ka quality check bhi "cheapest / best price" ko rok deta hai.
- **monthly car rental rates, prices, per day (numbers)**: price site par tab tak nahi jab tak aap sahi rate PWA mein na dalein.

## 4. Bing ke liye
- `scripts/indexnow.mjs` Bing ko har deploy ke baad saare pages bata deta hai. Chalane ke liye deploy ke baad: `node scripts/indexnow.mjs`.
- Bing Webmaster Tools mein sitemap `https://www.saadcarremtal.com/sitemap.xml` submit karein aur Keyword Research mein country = Pakistan chunein.

## 5. Agla qadam (Google Keyword Planner)
Keyword Planner mein "Discover new keywords" ya "Get search volume and forecasts" kholein, location = Pakistan, aur apne 200 keywords paste karke volume nikaalein. Jo phrase top par aayein unhein upar wali table mein main phrase bana dein. Mujhe numbers bhej dein to main titles aur FAQs unke hisab se dobara tuning kar dunga.
