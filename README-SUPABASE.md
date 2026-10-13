# Supabase (D1 ki jagah): step by step

## Pehle yeh samajh lein
- Aapki website mein **sirf 2 cheezein D1 mein thin**: Insights (visits, live visitors, taza activity) aur Clients (jo log form bhar kar chhor dete hain).
- **Orders, booking, contact, reviews, receipts, push, version.json D1 use hi nahi karte** (woh Cloudflare KV mein hain). Unhe is migration mein chhua nahi gaya, isliye woh jaise chal rahe the waise hi chalenge.
- D1 ki limit isliye khatam hui ke live dashboard har 4 second mein bahut saari "ping" rows scan karta tha. Supabase mein is ke liye chhote indexes bana diye gaye hain.
- Supabase ke liye koi npm package ki zaroorat nahi: code seedha Supabase ke REST address se baat karta hai. `package.json` ko badalna nahi hai.

## Step 1: Supabase account
1. https://supabase.com par jayein, **Start your project** > **Sign in** (GitHub ya email).
2. **New project** dabayein. Organization chunein.
3. Name: `saad-car-rental`. **Database password**: koi strong password likhein aur kisi safe jagah save kar lein (dobara nahi dikhta).
4. Region: sab se qareeb wali chunein (South Asia/Mumbai, ya Singapore). Plan: **Free**. **Create new project**. 1 se 2 minute intezaar karein.

## Step 2: SQL chalayein (tables + security + functions)
1. Left menu mein **SQL Editor** > **New query**.
2. Is zip ki file `supabase-setup.sql` ko Notepad mein kholein, **poora** copy karein aur SQL Editor mein paste karein.
3. **Run** dabayein. Neeche "Success. No rows returned" aana chahiye. (Dobara chalane se koi nuqsan nahi.)
4. Check: **Table Editor** mein `hits`, `vfirst`, `leads` nazar aane chahiye, un par "RLS enabled" likha hoga. Koi policy nahi hai: matlab public key kuch bhi padh/likh nahi sakti. Sirf aapka server (secret key) kaam kar sakta hai.

## Step 3: URL aur key copy karein
1. **Project Settings** (neeche gear icon) > **API Keys**. (Naye projects mein anon aur service_role ki jagah naye naam hain.)
2. **Project URL** copy karein (`https://xxxxxxxx.supabase.co`). Yeh **Settings > Data API** ya API page par bhi milta hai.
3. **Publishable and secret API keys** tab > **Secret keys** > `default` ke saamne key **Reveal/Copy** karein. Yeh `sb_secret_...` se shuru hoti hai.
   - Agar aapke purane project mein sirf **Legacy API Keys** tab hai, to wahan `service_role` key copy karein. Woh bhi chalti hai.
4. **Anon / publishable key ki zaroorat nahi.** Browser kabhi Supabase se seedha baat nahi karta. Secret key kisi ko mat dikhayein, GitHub par mat daalein.

## Step 4: Cloudflare mein variables
1. Cloudflare Dashboard > **Workers & Pages** > `saad-car-rental` > **Settings** > **Variables and Secrets** > **Add**.
2. Pehla: Type **Plaintext**, Name `SUPABASE_URL`, Value: Project URL. (Aakhir mein `/` ho ya na ho, dono theek.)
3. Doosra: Type **Secret**, Name `SUPABASE_SERVICE_ROLE_KEY`, Value: `sb_secret_...` wali key.
4. Dono **Production** ke liye add karein (Preview bhi chahein to wahan bhi). **Deploy/Save** dabayein.
5. **Zaroori:** variables sirf naye deploy par lagte hain. Files lagane ke baad `update.bat` chalayein (ya Deployments > latest > **Retry deployment**).

## Step 5: Files lagayein aur deploy karein
1. Is zip ko `D:\saad` mein extract karein, "Replace" par **Yes**.
2. `update.bat` chalayein. Cloudflare ke Deployments mein "Success" ka intezaar karein.

## Step 6: Testing
1. Browser mein `https://www.saadcarremtal.com/api/visit` kholein. Yeh dikhna chahiye: `{"ok":true,"db":true,"store":"supabase"}`. Agar `"store":"d1"` ya `"none"` aaye to variables ya redeploy check karein (Step 4).
2. Admin app mein Insights kholein. Neeche **Tracking test** button ho to dabayein. Phir apni site kisi doosre phone/incognito se kholein: kuch second mein "online" mein 1 visitor dikhna chahiye.
3. Supabase > **Table Editor** > `hits`: nayi rows aani chahiye.
4. Site ka Contact form: naam aur phone likhein, **Send mat dabayein**, page chhor dein. Admin > Clients mein woh entry dikhni chahiye. (Jab form par privacy checkbox ho to pehle woh tick karein.)
5. Ek test booking (Book Now) bhejein: Orders tab mein aani chahiye (yeh KV mein hai, pehle jaisa).

## Purana data (optional)
- **Visits ki history (hits)**: bahut badi hai, isi ne D1 ki limit khatam ki. Isey shift karne ki salah nahi di jati. Insights naye sire se shuru honge.
- **Clients (leads)** shift karna chahein to D1 ka daily limit reset (00:00 UTC = subah 5 baje Pakistan) hone ke baad: Cloudflare > Storage & Databases > D1 > apna database > **Console** mein `SELECT * FROM leads;` chalayein. Ya terminal mein `npx wrangler d1 export DATABASE_NAME --remote --table leads --no-schema --output leads.sql` chalayein, phir file ke INSERT lines Supabase SQL Editor mein paste karke Run karein. Koi error aaye to pehli lines mujhe bhej dein. Yeh zaroori nahi: naye clients khud aane lagenge.

## Rollback (agar kuch ghalat lage)
1. Cloudflare > Settings > Variables and Secrets mein `SUPABASE_URL` aur `SUPABASE_SERVICE_ROLE_KEY` **delete** karein.
2. Deployments > latest > **Retry deployment**. Site wapas purane D1 code par chalegi (D1 binding `DB` wahin lagi hai). Purana code touch nahi hua.
3. Yaad rahe: D1 ki limit roz 00:00 UTC par reset hoti hai, to rollback ke baad wahi limit wala masla wapas aa sakta hai.

## Dhyan rakhne ki baatein
- **Free project 1 hafte kisi bhi activity ke baghair pause ho jata hai.** Aapki site par roz visits hon to pause nahi hoga. Agar site 7 din bilkul khali rahe to Supabase Dashboard mein **Restore project** dabana padega (jab tak pause hai Insights/Clients save nahi honge).
- Free plan: 500 MB database, 5 GB egress/month. Admin dashboard har 4 second mein live data mangta hai. Isey poora din kai devices par khula na chhodein.
- Supabase ki taraf se aane wale reminders/emails ignore na karein.
- 30 second wale "ping" rows 7 din baad khud delete ho jati hain (sirf "abhi online" ke liye chahiye). Baqi visits ki detail ~13 mahine rehti hai, is liye 500 MB free limit aaram se kaafi rehti hai.
