# Offers, new cars and new pages (Nov 2026)

## Offer: ON/OFF from the owner app
Open the owner app, tab **Offers**: switch the offer ON or OFF, change the amount (Rs per day) and set an optional end date. It goes live on the website within about 30 seconds, no rebuild needed. The values are saved on the server (`/api/offer`, same storage as the car rates). If nothing was saved yet, the website uses `offer` in `src/business.config.js`.
The offer text also exists in the pre-built HTML that search engines read first; the page replaces it as soon as it loads. To remove it from the pre-built HTML too, set `active: false` in `business.config.js` and run `update.bat`.

## New cars
Mercedes A-Class, Mercedes ML, BMW M3, Suzuki Swift, Ertiga, Innova Crysta, Avanza, Honda Mobilio, Wagon R Stingray, Cultus (white, grey, blue-grey), Toyota Hiace, plus a grey Civic and a silver-grey Corolla. Names were read from the photos: please check them. Seats are typical (`src/data/details.js`, marked "verify"). Cars live in `src/data/fleet.js`.

## New service pages
Stays in G-10, G-13 and F-11, stay and driver packages, personal drivers (monthly, weekly, daily), English-speaking drivers and the women travellers driver-and-assistant page: `src/seo/data/landing2.js`. Add real photos of the apartments and guest houses through the owner app's page-images feature.
