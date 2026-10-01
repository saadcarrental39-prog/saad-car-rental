# Reviews setup (Google reviews + website reviews)

Code tayyar hai. Asli reviews tab dikhenge jab neeche ke 4 steps ek baar kar lein. Bina setup ke bhi site theek chalti hai: rating, count aur "All on Google" link dikhta hai, aur koi nakli review kabhi nahi dikhaya jata.

## Kya kahan dikhta hai
- Har car carousel ke neeche (Home par har showroom, aur har car page par) premium review strip: gold stars, rating, review cards, "Write a review".
- Home aur About ke neeche bara section: saare reviews.
- Google reviews har car ke neeche aate hain (Google reviews poore business ke hote hain, kisi ek car ke nahi). Website se diye gaye reviews us car ke neeche aate hain jis car ka customer ne chuna.

## Setup (sirf ek baar)

**1. Google API key**
Google Cloud Console > naya project > "Places API (New)" Enable > Credentials > Create API key.
Key ko "API restrictions" mein sirf Places API (New) tak restrict karein. Billing budget alert zaroor lagayein (is setup mein 1 ghante ki cache hai, isliye kharcha bohat kam hota hai).

**2. Place ID**
Google ka "Place ID Finder" kholein, "Saad Car Rental Services G-11 Markaz Islamabad" search karein, `ChIJ...` wala ID copy karein.

**3. Cloudflare KV (website reviews ke liye)**
Cloudflare Dashboard > Workers & Pages > KV > Create namespace: `saad-reviews`.

**4. Cloudflare Pages settings**
Pages project > Settings:
- Bindings > Add > KV namespace: Variable name `REVIEWS_KV`, namespace `saad-reviews` (Production)
- Variables and Secrets (Production): `GOOGLE_PLACES_API_KEY` (Secret), `GOOGLE_PLACE_ID`, aur optional `ADMIN_TOKEN` (koi lamba random text)

Phir `update.bat` chala dein (bindings agli deployment se lagti hain).

## Zaroori sachchai (please parhein)

1. **Google sirf 5 reviews deta hai.** Places API har baar zyada se zyada 5 "most relevant" reviews deti hai, 211 nahi. Rating aur total count poora aata hai. Saare reviews ke liye Google Business Profile API chahiye (aap ka business owner access + Google ki approval). Chahein to agla step main bana doonga.
2. **Website se Google par review khud post nahi ho sakta.** Google kisi ko bhi API se customer ki taraf se review post karne nahi deta (sirf customer khud Google par likh sakta hai). Isliye: website review aap ki site par foran dikhta hai, aur submit ke baad customer ko "Copy and open Google review" button milta hai: text copy hota hai aur Google ka review page khulta hai, customer bas paste karke post karta hai.
3. Google reviews ka text sirf 1 ghante ki short cache mein rakha jata hai, kahin save nahi hota (Google ke terms is wajah se).
4. Local `start-dev.bat` mein Functions nahi chalte, wahan design dekhne ke liye sample cards dikhte hain (clearly "sample" likha hota hai). Live site par yeh kabhi nahi aate.

## Website review hatana
- Cloudflare > KV > `saad-reviews` > key `reviews:all` ko edit karke us review ka object delete karein, ya
- `ADMIN_TOKEN` set ho to: `curl -X DELETE -H "Authorization: Bearer TOKEN" "https://aapki-site/api/reviews?id=REVIEW_ID"`

## Spam se bachao
Hidden honeypot field, 10 minute mein ek IP se ek review, links block, 500 akshar ki limit, aur sab text safely escape hota hai.
