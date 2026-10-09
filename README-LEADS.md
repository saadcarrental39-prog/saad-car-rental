# Clients (Leads): form mein jo likha wo save, chahe Send na dabaya ho

Admin app ke **Clients** tab mein har wo shakhs nazar aata hai jis ne website ke form mein naam, phone ya email likha.
Pehle sirf wahi order milta tha jis ne "Book via WhatsApp" dabaya. Ab adhoori booking ka data bhi milta hai.

## Kaise kaam karta hai
1. Visitor **Book page**, **gaari ke Booking popup** ya **Contact form** mein likhna shuru karta hai.
2. Jaise hi **poora phone number** (kam az kam 10 digit) ya **sahi email** likha jaye aur wo 2.5 second rukay (ya page chhor de), website ye data `/api/lead` ko bhej deti hai.
3. Data D1 database (wahi `DB` jo Dashboard ke liye hai) mein save hota hai. Ek banda = ek record, jo likhte rehne par update hota rehta hai.
4. Pehli baar contact milte hi aap ke phone par **notification** aati hai (📝 Adhoora booking / 💬 New enquiry), aur Clients tab par **laal badge**.
5. Agar visitor baad mein form Send kar de to wohi record **SEND KIYA** ho jata hai.

Is mein sirf wo cheezein hain jo visitor ne khud form mein likhi: naam, phone, email, gaari, pickup, drop, date, time, passengers, notes. Shehr aur device (mobile/computer) bhi, jo analytics mein pehle se hai.

## Clients tab mein kya hai
- Har client ka card: naam, phone, email, gaari, safar, date, kab likha, kis form se aaya.
- **Call**, **WhatsApp**, **Email** ke buttons ek tap mein.
- **"Rabta ho gaya?"** ka button: jise phone kar liya uspar tick lagayein, filter **"Rabta baqi"** sirf unhein dikhata hai jin se baat nahi hui.
- Filter: Sab / Adhoore / Send kiye / Rabta baqi, aur naam / phone / email / gaari se **search**.
- **Excel (CSV) download**: saara data Excel ya Google Sheets mein.
- Delete: kisi ka record hata dein.

## Setup
Dashboard ke liye jo D1 database (`DB` binding) lagayi thi wahi chalti hai, **kuch naya setup nahi**. Table khud ban jati hai.
Check: browser mein `https://aap-ki-site/api/lead` kholein, `{"ok":true,"db":true}` aana chahiye.

## Privacy (zaroori)
- Form ke neeche saaf likha hota hai: *"We save the details you type (name, phone, email) so we can contact you about your booking, even if you do not press send."* Isay hataein mat.
- Data sirf aap ko Admin login ke baad nazar aata hai. Google Analytics ko koi naam / phone / email nahi jata.
- 2 saal baad purane records khud hat jate hain. Kisi ke kehne par Delete button se foran hata dein.
- Apne website ki privacy policy mein ek jumla likh dein ke form mein likhi hui details aap save karte hain.

## Jo ho SAKTA hai aur jo NAHI
- **Ho sakta hai**: jo form mein kuch likhe, Chrome / phone ki autofill se bhara ho, ya haath se, wo save ho jata hai (autofill ke liye forms mein `name`, `tel`, `email` ke sahi attributes laga diye hain, to Chrome "Google se" khud suggest karta hai aur visitor ka kaam aasan ho jata hai).
- **Nahi ho sakta**: kisi ka phone number ya email **jab tak wo khud na likhe** pata karna. Browser aur Google ye koi website ko nahi dete, aur chhup kar nikalna ghalat aur Google / Cloudflare ki policy ke khilaf hai.
- Agar chahein to "Google se sign in" ka button bhi lag sakta hai: visitor ek tap se apna naam / email apni marzi se de deta hai (Google Cloud ka Client ID chahiye hoga).

## Kin files mein badlaav hua
- Naye: `functions/api/lead.js`, `functions/_lib/leads.js`, `src/leads.js`
- Badle: `functions/_lib/stats.js` (leads table), `functions/api/admin.js`, `sw/admin-sw.template.js` (lead notification), `src/pages/Book.jsx`, `src/components/BookingModal.jsx` (email field), `src/pages/Contact.jsx` (email field), `src/pages/Admin.jsx` (Clients tab), `src/styles/admin.css`, `src/styles/site.css`
