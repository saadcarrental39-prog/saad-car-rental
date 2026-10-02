# Receipt aur Car Details

## Har car ki Details
Card ka **Details** button ab us car ki apni window kholta hai (colour, seats, type, description, 3 khaas baatein, "Best for", Book aur WhatsApp enquiry).
Text badalne ke liye `src/data/details.js` kholein. Har car ka apna block hai. **Seats typical likhe hain, apni gaari ke mutabiq zaroor check karein.**

## Premium Receipt
Customer booking form bhar kar **Send booking on WhatsApp** dabata hai.
1. Aap ke WhatsApp mein booking ki tafseel aur **Full receipt** ka link aata hai. Link par WhatsApp khud ek card dikhata hai (title + picture), aur us par tap karne se premium receipt page khulta hai (Print / Save as PDF ka button bhi wahan hai).
2. Booking ke baad customer ko **Share receipt picture** ka button milta hai. Phone par yeh share window kholta hai (WhatsApp chunein, phir apna chat), computer par picture copy hoti hai (chat mein Ctrl+V). Kuch download nahi karna padta.

### Sachchai
WhatsApp kisi website ko customer ki taraf se chat mein file ya picture khud nahi bhejne deta. Website sirf text khol sakti hai. Isliye 100% automatic picture/PDF sirf **WhatsApp Business Cloud API** (Meta account + approval) se mumkin hai. Chahein to wo agla step bana sakta hoon.

Receipt ke link mein booking ka data hota hai (kuch store nahi hota). Preview mein phone number nahi dikhta aur page search engines se chhupa hai. Receipt "booking request" hai, payment ka saboot nahi.
