# Home page booking box

- Sits right under the fading hero pictures (`src/components/HomeBooking.jsx`, styles at the end of `src/styles/site.css`, class `hb`). Black + white, orange buttons with white text.
- Step 1: pick-up location, pick-up date + time, drop-off date + time, optional different drop-off place -> **Search**.
- Step 2: car, name, phone, WhatsApp number (optional), email (optional), passengers -> **Book now**. This saves the order (with receipt picture) in the Admin app **Orders** tab, with the usual notification + tone, and opens the owner's WhatsApp with the message ready.
- If the visitor types a valid phone number and leaves without pressing Book now, the details still arrive in the Admin app **Clients** tab as "Home page booking" (form key `home`, `functions/_lib/leads.js`).
- Button colour is `#cc4a0a`: a slightly deeper orange so white text stays readable (PageSpeed Accessibility needs enough contrast; plain bright orange fails).

# Speed changes in this version
- Visit counting (`src/analytics.js`) and the live Google review number (`src/components/reviews/store.js`) now start only after the page has fully loaded and the browser is idle. Counting is unchanged; it just no longer competes with the first paint.

# Visitor details in the Admin app
- A website cannot know a visitor's name or email unless the visitor types it. Details typed in ANY form (Home booking box, /book, booking popup, contact) reach the Clients tab, even if the visitor never presses send.
- Email is now asked (optional) in the Home booking box too, saved in the Clients tab, stored with the order, and shown on the order card in the Orders tab.

# Dashboard shows "OFFLINE"?
The red line under the badge now says the real reason (database not connected, old server version, server error, or no internet). Fix the one it names.

# WhatsApp field
Every booking form (Home box, /book, booking popup, contact) has a WhatsApp number field. It is NOT required (no star). If filled, it shows in the order message, the Orders tab card and the Clients tab.
The line "We save the details you type..." was removed from all forms. The Privacy Policy page still explains it, which is where the law expects it.

# Booking form fields (Local / Out of Station) - src/components/TripForm.jsx
One shared form for the Book page, the car popup and the Home box. Sections: 1 Your Details (name, WhatsApp, country, optional email), 2 Ride Information / Tour Details, 3 Driver Arrangement, 4 Additional Services, 5 Extra Notes.
- No self-drive: "Car with driver" is the default service.
- Local: customer chooses (a) provide driver stay + meals, or (b) not provide: car returns to the office and is sent again at the next pickup time, customer pays the driver 2500 PKR for food.
- Out of Station: providing the driver's stay + meals is compulsory (box must be ticked).
- Change the food amount in one place: `DRIVER_FOOD_PKR` in TripForm.jsx.
