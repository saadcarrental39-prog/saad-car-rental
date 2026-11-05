// WEDDING CAR BOOKING PAGE (/wedding-car-booking-with-driver). One page for every wedding search: wedding car, barat car, groom car, bridal car,
// mehndi and party Coaster, Land Cruiser V8, Prado, Honda Civic, Corolla. Text only here; the page is built in pages.jsx and registered in registry.js.
// Rules (same as the rest of the site): no prices, no discounts, no "guarantee", no superlatives, no claims we cannot keep.
// Flower decoration is described as "on request, confirmed in your quote" (the owner supplied the decorated-car photos).
const f = (q, a) => ({ q, a });

export const WEDDING = {
  path: "/wedding-car-booking-with-driver", slug: "wedding",
  title: "Wedding Car Booking With Driver in Islamabad",
  h1: "Wedding Car Booking With Driver in Islamabad and Rawalpindi",
  description: "Book a wedding car with driver in Islamabad: Land Cruiser V8, Prado, Honda Civic, Corolla and Coaster for barat, nikah, mehndi, walima and parties.",
  eyebrow: "Wedding cars · Barat · Mehndi · Walima",
  lead: "Book a decorated wedding car with a professional driver for your barat, nikah, rukhsati, walima or mehndi: Land Cruiser V8, Prado, Honda Civic, Toyota Corolla Grande, more luxury SUVs and a Coaster for family and guests. Based in Islamabad, serving Rawalpindi and weddings across Pakistan.",
  answerQ: "Can I book a wedding car with a driver in Islamabad?",
  answer: "Yes. SAAD CAR RENTAL SERVICES provides wedding cars with an experienced professional driver in Islamabad and Rawalpindi. Choose a Land Cruiser V8, Prado, Honda Civic, Toyota Corolla Grande or another car from our fleet for the groom and bride, and add a Coaster for relatives and guests. Send the date, the venue, the pickup time and the number of cars by WhatsApp, phone or the Book Now form and we confirm the vehicles and send your quote before the wedding. Flower decoration for the car is available on request and is written in your quote.",

  // key facts: one fact per line, easy for people, Google and AI assistants to read
  facts: [
    ["Service", "Wedding car booking with a professional driver (no self-drive)"],
    ["Based in", "G-11 Markaz, Islamabad, Pakistan"],
    ["Wedding areas", "Islamabad, Rawalpindi, Bahria Town, DHA, Gulberg, Park View and farmhouse venues on the outskirts; intercity weddings on request"],
    ["Cars for the couple", "Land Cruiser V8, Premium Luxury Land Cruiser, Prado, Lexus LX 570, Mercedes G Wagon, Audi, Honda Civic, Toyota Corolla Grande"],
    ["Group transport", "Toyota Coaster for mehndi, barat guests and parties (on request)"],
    ["Functions covered", "Mehndi, mayun, dholki, sangeet, nikah, barat, rukhsati, walima, reception and engagement"],
    ["Flower decoration", "On request, confirmed in your quote"],
    ["Pricing", "A quote for your date, cars and hours, sent before the wedding. No fake instant prices"],
    ["How to book", "Call 0333 9850599, WhatsApp, or the Book Now form"],
  ],

  // which cars, and what each is chosen for (slugs match the fleet in src/data/fleet.js)
  carsTitle: "Wedding cars we provide, with driver",
  carsIntro: "Every wedding car comes with a professional driver who is presentable and courteous, arrives early, knows the venue roads and stays with the car for the whole booking.",
  cars: [
    { slug: "land-cruiser-v8", name: "Land Cruiser V8 (V8 wedding car)", text: "The classic barat and groom car. Tall, commanding and spacious, it carries the groom with his sehra and family comfortably and looks right in a convoy. White and black available, 2018 model.", img: "wedding-land-cruiser-v8-white" },
    { slug: "prado", name: "Toyota Prado", text: "A smart, comfortable SUV for the groom, bride and close family. Popular in black and white with a floral bonnet garland and rose strings on the doors.", img: "wedding-prado-black" },
    { slug: "honda-civic", name: "Honda Civic", text: "A sleek sedan for the couple, the bride's entry or a smaller family wedding. Easy to park at crowded venues and comfortable for a long evening.", img: "wedding-honda-civic-black" },
    { slug: "toyota-grande", name: "Toyota Corolla Grande", text: "A familiar, refined sedan that suits a nikah, a walima or the bride's rukhsati, with plenty of room for the bridal dress.", img: "wedding-toyota-corolla-grande" },
    { slug: "premium-luxury-land-cruiser", name: "Premium Luxury Land Cruiser", text: "Our 2025 black Land Cruiser for families who want the most impressive arrival at the venue." },
    { slug: "lexus-lx-570", name: "Lexus LX 570", text: "A luxury SUV for the groom or bride that suits formal evening weddings and VIP guests." },
    { slug: "mercedes-g-wagon", name: "Mercedes G Wagon", text: "A statement car for the couple's entry, photographs and a standout barat." },
    { slug: "audi", name: "Audi", text: "A polished luxury sedan for the bride's entry and the couple after the ceremony." },
    { slug: "coaster", name: "Toyota Coaster", text: "A group vehicle for mehndi and dholki nights, barat guests, family and wedding parties, available on request. Share your group size early." },
  ],
  galleryTitle: "Wedding car photos",
  galleryIntro: "Real wedding-style setups: floral bonnet garlands, rose strings on the doors and ribbons, in Land Cruiser V8, Prado, Honda Civic and Corolla Grande. Tell us the car and the look you want.",

  // every wedding function and what we usually send for it
  eventsTitle: "Wedding functions we provide cars for",
  eventsIntro: "A Pakistani wedding is many days, not one. Tell us each function and we plan the cars for each, so the same driver and the same family car can be there from the first dholki to the walima.",
  events: [
    ["Mehndi and Ubtan", "Cars for the bride and family to the mehndi venue, and a Coaster to bring relatives and friends together."],
    ["Mayun, Manjha and Dholki", "Smaller family evenings: a sedan or SUV for the bride, and a Coaster when many relatives are travelling."],
    ["Sangeet and dance nights", "Late-night pickups and drops for the family and guests, with a driver who waits until the function ends."],
    ["Nikah", "A presentable car for the groom or bride and close family, arriving on time at the mosque, home or hall."],
    ["Barat", "The groom's car (Land Cruiser V8, Prado or G Wagon), family cars and a Coaster for baraatis, driven as a convoy to the venue."],
    ["Rukhsati (Bidaai)", "A decorated car waiting for the bride and groom, with the driver ready at the exit, whatever time the function ends."],
    ["Walima and Reception", "Cars for the couple, the families and guests on the second day, from the hotel or home to the venue."],
    ["Engagement (Mangni) and Roka", "A refined sedan or SUV for the family and the couple at the engagement dinner."],
    ["Dua-e-Khair and Rasm-e-Henna", "Family transport for smaller rituals and prayers at home or the hall."],
    ["Bridal salon and parlour", "A car for the bride from home to the salon and on to the hall, with the driver waiting."],
    ["Wedding guests from the airport", "Airport pickup for relatives from abroad, linked with the wedding plan, from Islamabad International Airport."],
    ["Mooh Dikhai and Pheray ki Rasam", "The couple's car for the first visits and family gatherings after the wedding."],
  ],

  // parties and non-wedding events (Coaster, SUVs, sedans)
  partiesTitle: "Mehndi, parties and events: Coaster and group transport",
  partiesIntro: "A Toyota Coaster (on request) moves a whole party together, so guests arrive at the same time and nobody has to search for parking. It also suits the events below, and we can pair it with SUVs and sedans for the family.",
  parties: [
    "Mehndi, mayun and dholki nights",
    "Barat guest transport and baraati groups",
    "Birthday parties and anniversary dinners",
    "Engagement and family dinners",
    "Baby shower, aqiqah and Eid Milan gatherings",
    "Corporate dinners, annual parties and team events",
    "Farewell parties and reunions",
    "Day trips with a group, for example Murree or Pir Sohawa",
  ],

  // where
  whereTitle: "Where we provide wedding cars",
  whereIntro: "Our office is in G-11 Markaz, Islamabad. Most weddings start in Islamabad or Rawalpindi, and we reach the common venue areas below. If your venue is not listed, ask us and we confirm.",
  areas: [
    ["Islamabad sectors", "F-6, F-7, F-8, F-10, F-11, E-11, G-11, G-13, G-15, I-8, I-10 and Blue Area banquet halls, hotels and homes"],
    ["Rawalpindi", "Saddar, Chaklala, Satellite Town, Adiala Road, Peshawar Road and the older city's wedding halls"],
    ["Housing societies", "Bahria Town, DHA Islamabad, Gulberg Greens, Park View City, B-17, Top City, Naval Anchorage, Faisal Town"],
    ["Farmhouses and marquees", "Chak Shahzad, Bhara Kahu, Express Highway, Murree Road, Lehtrar Road and Kahuta Road venues"],
    ["Airport", "Islamabad International Airport pickup for wedding guests and for the couple"],
    ["Other cities", "Lahore, Peshawar, Faisalabad, Multan, Abbottabad, Murree and more, one way or round trip, quoted for your route"],
  ],

  // how to book
  how: [
    ["1. Send your wedding plan", "The date, every function, the venues, the pickup times and how many cars you need, by WhatsApp, phone or the Book Now form."],
    ["2. Choose the cars", "Pick the groom's or bride's car (Land Cruiser V8, Prado, Civic, Corolla or another) and a Coaster for guests. Tell us if you want flowers on the car."],
    ["3. We confirm and quote", "We confirm the vehicles and drivers for your date and send a clear quote, with what is included written down, before you travel."],
    ["4. Your driver arrives early", "Your driver is at the agreed place before the pickup time and stays with the car for the whole booking, including late endings."],
  ],
  tellTitle: "What to tell us when you book a wedding car",
  tell: [
    "Wedding date and the date of each function (mehndi, nikah, barat, walima)",
    "Pickup address and venue name for each function",
    "Pickup time and the time the function is expected to end",
    "Number of cars and the car you prefer (Land Cruiser V8, Prado, Civic, Corolla, Coaster)",
    "Whether you want flowers on the car, and the colours you like",
    "Number of guests if you need a Coaster",
    "Any outstation travel, such as a barat going to Lahore or Peshawar",
  ],
  tipsTitle: "Planning tips for wedding day transport",
  tips: [
    "Book as soon as the date is fixed. Wedding season, Eid holidays and winter weekends fill the popular cars first.",
    "Keep a buffer. Barat timing often shifts, so tell us the latest likely finish and we plan the driver's waiting time.",
    "Give the driver one contact person on the day, ideally someone from the family who is not busy with the ceremony.",
    "Share the venue's gate or entrance, because many halls have separate entries for the groom, the bride and guests.",
    "For a convoy, tell us the order of the cars so the groom's car leads and the Coaster follows.",
    "Ask about flower decoration early so it is ready before the pickup, and agree who removes it afterwards.",
  ],

  // trust facts shown on the page come from SITE (years, rating, review count): see WeddingPage in pages.jsx

  // Urdu and Roman Urdu text for local searchers
  ur: [
    "شادی کے لیے ڈرائیور کے ساتھ گاڑی بک کرائیں۔ سعد کار رینٹل سروسز اسلام آباد اور راولپنڈی میں بارات، نکاح، مہندی، رخصتی اور ولیمہ کے لیے لینڈ کروزر وی ایٹ، پراڈو، ہونڈا سوک اور ٹویوٹا کرولا گرانڈے فراہم کرتی ہے۔",
    "مہندی، ڈھولکی اور پارٹیوں کے لیے کوسٹر بھی دستیاب ہے۔ تاریخ، جگہ اور گاڑیوں کی تعداد بتائیں، ہم شادی سے پہلے واضح قیمت بتا دیتے ہیں۔",
  ],
  roman: "Shadi ke liye driver ke saath gaari chahiye? Barat, nikah, mehndi, rukhsati aur walima ke liye Land Cruiser V8, Prado, Honda Civic, Corolla aur Coaster Islamabad aur Rawalpindi mein dastiyab hain. Tareekh, venue aur gaariyon ki tadaad WhatsApp karein, hum shadi se pehle quote bhej dete hain.",

  faqs: [
    f("How do I book a wedding car with a driver in Islamabad?", "Send the wedding date, the venue, the pickup time and the number of cars by WhatsApp on 0333 9850599, by phone or through the Book Now form. We confirm the vehicles and the driver and send your quote before the wedding."),
    f("Which cars are available for a wedding?", "For the groom and bride we provide the Land Cruiser V8 (white or black, 2018 model), Toyota Prado, Honda Civic, Toyota Corolla Grande, Premium Luxury Land Cruiser, Lexus LX 570, Mercedes G Wagon and Audi. Range Rover is available on request. A Toyota Coaster is available for guests."),
    f("Can I book a Land Cruiser V8 for my barat?", "Yes. The Land Cruiser V8 is one of the most requested barat and groom cars. Send your date, venue and pickup time and we confirm availability for that day."),
    f("Do you provide a Prado for weddings?", "Yes. The Toyota Prado is available with a professional driver for the groom, the bride and close family, in black and white. Ask us about flower decoration when you book."),
    f("Is a Honda Civic or Toyota Corolla available for a wedding car?", "Yes. The Honda Civic and the Toyota Corolla Grande are popular for the couple, the bride's entry, the nikah and smaller family weddings. We confirm the colour and the vehicle for your date."),
    f("Do you decorate the wedding car with flowers?", "Flower decoration with roses and a bonnet garland is available on request. Tell us the car, the colours and the timing when you book, and we write it in your quote."),
    f("Is the driver included in the wedding car booking?", "Yes. Every wedding car is provided with an experienced professional driver who knows the roads in Islamabad and Rawalpindi. We do not offer self-drive."),
    f("Do you have a Coaster for mehndi and parties?", "Yes, a Toyota Coaster is available on request for mehndi nights, barat guests, birthday parties and other group events. Send your group size, pickup points and the date early so we can confirm it."),
    f("Can you provide cars for the mehndi, barat and walima on different days?", "Yes. Send the date and the venue for each function. We plan the cars for every day, and the same vehicle and driver can be arranged across the functions when they are available."),
    f("How early should I book a wedding car?", "As soon as the wedding date is fixed. Wedding season, Eid holidays and winter weekends fill the popular cars first, so early booking gives you the car you want."),
    f("Which areas do you cover for weddings?", "We cover Islamabad and Rawalpindi, including Bahria Town, DHA, Gulberg, Park View City and farmhouse venues on the outskirts. Weddings in Lahore, Peshawar, Murree and other cities are arranged as outstation trips."),
    f("Can you pick up wedding guests from the airport?", "Yes. We provide airport pickup at Islamabad International Airport for relatives and guests, and we link it with your wedding plan."),
    f("Can the car wait until the function ends?", "Yes. Tell us the likely finish time and we include the driver's waiting time in the quote, so the car is ready for the rukhsati even if the function runs late."),
    f("How much does a wedding car cost?", "The price depends on the car, the date, the hours, the number of functions and any decoration, so we quote each wedding. Send your plan and we reply with a clear quote before you travel."),
    f("Do you provide wedding cars for weddings outside Islamabad?", "Yes. Barat and family trips to Lahore, Peshawar, Faisalabad, Multan, Abbottabad, Murree and other cities are available one way or round trip. See our Out of Station service and share your route."),
  ],
};

export const WEDDING_PATH = WEDDING.path;
