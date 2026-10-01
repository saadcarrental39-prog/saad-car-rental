# Reviews (card ke andar, Google jaisa)

## Kaise dikhta hai
Har car ke card ke andar: ⭐⭐⭐⭐⭐ 5.0 (212 reviews). Us par click karein to poori reviews window khulti hai (naam, profile icon, stars, text, "Write a review", aur "See all 212 reviews on Google Maps"). Review text card par nazar nahi aata, sirf click par.

## Design chunna (4 designs)
1. `start-dev.bat` chalayein, browser mein `http://localhost:5173/review-designs` kholein.
2. Chaaron designs click karke dekhein.
3. Pasand wala number `src/config.js` mein `reviewDesign: 1` ki jagah likhein (1, 2, 3 ya 4), ya mujhe batayein.
(Yeh page sirf aap ke computer par hai, live site par nahi.)

## Apne asli reviews lagana
`src/data/reviews.js` kholein, Google Maps se apne reviews copy karke is format mein paste karein:

    { name: "Ali Khan", rating: 5, date: "2 months ago", text: "Review ka text", photo: "" },

- `photo` khali = naam ke pehle harf ka rangeen icon. Photo chahiye to `public/assets/reviews/` mein image rakhein aur `"/assets/reviews/ali.webp"` likhein.
- Rating aur count `src/config.js` ke `rating` aur `reviewCount` se aate hain (abhi 5.0 aur 212). Jab Google par badlein, wahan bhi badal dein.
- "Write a review" aur "See all reviews" ka link `writeReviewUrl` / `reviewsMap` (config.js) mein hai.
- Sirf asli reviews dalein. Naqli reviews Google ki policy ke khilaf hain aur profile par action ho sakta hai.

Phir `update.bat` chalayein.
