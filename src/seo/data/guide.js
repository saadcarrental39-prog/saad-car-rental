// "Car rental with driver in Pakistan: search guide". A VISIBLE page that helps people (and search engines) match what they type into Google
// with the right page on this site.
//
// NOTE (Oct 2026 SEO audit): the `phrases` lists are NO LONGER shown on the page. Long blocks of raw search phrases look like keyword stuffing.
// The page now shows natural sentences, cards and FAQs; write new content as sentences (intro / cards / faqs), not as phrase lists.
// Never hide keywords (white-on-white, tiny text, code-only): Google treats that as spam. Cards use place / service / vehicle
// slugs; a place that is not "live" is skipped automatically.
const f = (q, a) => ({ q, a });

export const GUIDE = {
  path: "/car-rental-guide",
  title: "Car Rental With Driver in Pakistan: Guide",
  h1: "Car Rental With Driver in Pakistan: Search Guide",
  description: "Find the right car with a professional driver in Pakistan: Islamabad, Lahore, northern areas, airport pickup, weddings, and booking from abroad.",
  eyebrow: "Guide",
  lead: "Looking for a car on rent in Islamabad, a chauffeur for a family trip, or a driver for Hunza and Skardu? This guide groups the most common searches and takes you straight to the page that answers them.",
  groups: [
    {
      id: "islamabad", title: "Car rental in Islamabad and Rawalpindi",
      intro: "Our office is in G-11 Markaz, Islamabad. Every vehicle is hired with an experienced professional driver, for a few hours, a full day or several days.",
      phrases: ["car rental Islamabad", "rent a car with driver in Islamabad", "car on rent Islamabad with driver", "chauffeur service Islamabad", "luxury car rental Islamabad", "Land Cruiser on rent in Islamabad", "Prado on rent in Islamabad", "rent a car Rawalpindi with driver", "hire a driver with car in Islamabad", "daily car rental with driver Islamabad"],
      cards: [{ to: "/local-car-rental-islamabad", title: "Local service in Islamabad", text: "A car with driver for daily use inside the city: shopping, hotels, meetings and picnic spots." }, { place: "islamabad" }, { place: "rawalpindi" }, { service: "chauffeur-service" }, { service: "premium-car-rental" }, { service: "islamabad-rawalpindi-transportation" }],
    },
    {
      id: "local-places", title: "Markets, hotels, picnic spots and landmarks in Islamabad",
      intro: "Local searches usually name a place. Pick the market, hotel, picnic spot or landmark you want to visit and open its page.",
      phrases: ["Centaurus Mall car with driver", "Jinnah Super Market pick and drop", "Islamabad shopping day car with driver", "Serena Hotel Islamabad airport pickup", "Marriott Hotel Islamabad car service", "Daman-e-Koh car rental with driver", "Pir Sohawa taxi with driver", "Margalla Hills picnic car", "Faisal Mosque tour with driver", "Islamabad city tour with car and driver", "Rawal Lake family picnic car", "Fatima Jinnah Park car with driver"],
      cards: [{ to: "/islamabad-places", title: "All places in Islamabad", text: "Markets, premium hotels, picnic spots and landmarks, each with its own page." }, { to: "/islamabad/centaurus-mall", title: "Centaurus Mall", text: "Shopping trips with the car waiting between stops." }, { to: "/islamabad/daman-e-koh", title: "Daman-e-Koh", text: "A hill viewpoint over the city, popular for evening outings." }, { to: "/islamabad/faisal-mosque", title: "Faisal Mosque", text: "The landmark visitors ask for first." }, { to: "/islamabad/serena-hotel-islamabad", title: "Serena Hotel Islamabad", text: "Airport pickup and daily travel for hotel guests." }, { to: "/islamabad/rawal-lake-view-point", title: "Rawal Lake View Point", text: "Family picnics and evening walks by the lake." }],
    },
    {
      id: "cities", title: "Car with driver to other cities in Pakistan",
      intro: "Most intercity trips start in Islamabad or Rawalpindi and run one way or as a round trip, with the same driver for the whole journey.",
      phrases: ["Islamabad to Lahore car with driver", "Islamabad to Peshawar taxi", "Islamabad to Faisalabad car rental", "Islamabad to Multan car with driver", "Islamabad to Abbottabad car rental", "one way car with driver from Islamabad", "intercity car rental Pakistan"],
      cards: [{ place: "lahore" }, { place: "peshawar" }, { place: "faisalabad" }, { place: "multan" }, { place: "abbottabad" }, { place: "muzaffarabad" }],
    },
    {
      id: "north", title: "Northern areas, hill stations and tourist trips",
      intro: "Mountain roads need the right vehicle and a driver who knows them. Tell us your dates and group size and we suggest a suitable SUV, 4x4 or Coaster.",
      phrases: ["Islamabad to Hunza car rental", "Islamabad to Skardu with driver", "Murree tour car with driver", "Naran Kaghan car rental", "Swat Kalam tour with driver", "Fairy Meadows trip car", "northern areas tour Pakistan with car and driver", "Gilgit Baltistan car rental with driver", "Chitral car with driver", "4x4 jeep rental for northern Pakistan"],
      cards: [{ to: "/out-of-station-car-rental", title: "Out of Station trips from Islamabad", text: "Cities, hill stations, valleys and the north, with the same driver for the whole journey." }, { place: "murree" }, { place: "naran" }, { place: "swat" }, { place: "hunza" }, { place: "skardu" }, { place: "fairy-meadows" }, { place: "chitral" }, { place: "gilgit" }],
    },
    {
      id: "abroad", title: "Visitors from abroad and overseas Pakistanis",
      intro: "People who live outside Pakistan, or are visiting for the first time, can book in advance and have a driver waiting at Islamabad International Airport.",
      phrases: ["Islamabad airport pickup and drop", "airport transfer Islamabad", "tourist car with driver Pakistan", "rent a car in Pakistan for tourists", "overseas Pakistani car rental", "book a car in Islamabad from abroad", "family airport pickup Islamabad"],
      cards: [{ to: "/visit-pakistan", title: "Visiting Pakistan as a tourist", text: "Airport pickup and a professional driver for the north and the cities. Book before you travel." }, { to: "/overseas-pakistanis", title: "Overseas Pakistanis", text: "Book a premium car with a driver before you land, for family trips, weddings and airport pickup." }, { to: "/airport-transfer/islamabad", title: "Islamabad airport transfer", text: "How pickup and drop at Islamabad International Airport works." }],
    },
    {
      id: "occasions", title: "Family, business, weddings and events",
      intro: "The same professional drivers handle everyday family travel and special occasions. Book early for popular wedding dates and holiday weekends.",
      phrases: ["wedding car rental Islamabad", "bridal car with driver Islamabad", "corporate car rental Islamabad", "executive transport Islamabad", "family trip car with driver", "group transport Islamabad Coaster", "hotel transfer Islamabad", "VIP car with driver Islamabad"],
      cards: [{ service: "wedding-event-transportation" }, { service: "corporate-transportation" }, { service: "business-travel" }, { service: "family-travel" }, { service: "group-transportation" }, { service: "vip-executive-transportation" }],
    },
    {
      id: "cars", title: "The cars you can hire",
      intro: "Choose by group size, luggage and the kind of road. Each vehicle comes with a professional driver.",
      phrases: ["Land Cruiser V8 2018 model rental with driver", "Premium Luxury Land Cruiser on rent", "Toyota Prado rent a car", "Hilux Revo on rent", "Honda Civic with driver", "Toyota Corolla Grande with driver", "Range Rover rental with driver", "Toyota Coaster on rent Islamabad", "Lexus LX 570 on rent Islamabad", "Toyota Fortuner rent a car", "Mercedes G Wagon on rent", "G Vegan rental Islamabad", "Audi rent a car with driver"],
      cards: [{ vehicle: "land-cruiser-v8" }, { vehicle: "premium-luxury-land-cruiser" }, { vehicle: "prado" }, { vehicle: "revo" }, { vehicle: "honda-civic" }, { vehicle: "toyota-grande" }, { vehicle: "lexus-lx-570" }, { vehicle: "toyota-fortuner" }, { vehicle: "mercedes-g-wagon" }, { vehicle: "audi" }, { vehicle: "range-rover" }, { vehicle: "coaster" }],
    },
    {
      id: "urdu", title: "Search in Urdu or Roman Urdu",
      intro: "Many customers search in Urdu or Roman Urdu, so the phrases people use are listed here too. Write or call us in the language you are comfortable with.",
      phrases: ["Islamabad mein car rental", "driver ke saath gaari kiraye par", "Islamabad se Murree gaari", "Hunza Skardu ke liye gaari", "shadi ke liye gaari kiraye par", "airport se pickup gaari", "گاڑی کرائے پر ڈرائیور کے ساتھ اسلام آباد", "اسلام آباد ایئرپورٹ پک اینڈ ڈراپ"],
      cards: [{ to: "/contact", title: "Call or WhatsApp us", text: "Tell us your plan in Urdu or English and we reply with a quote." }, { to: "/faq", title: "Frequently asked questions", text: "Vehicles, airport pickup, quotes and booking." }, { to: "/book", title: "Book now", text: "Send your trip details in one short form." }],
    },
  ],
  faqs: [
    f("Do you rent cars without a driver in Pakistan?", "No. Every vehicle is provided with an experienced professional driver, so you do not drive yourself. This suits visitors, families and business travellers who want a comfortable and safe journey."),
    f("How do I rent a car with a driver in Islamabad?", "Call 0333 9850599, message us on WhatsApp or use the Book Now form with your pickup, destination, date and number of passengers. We confirm the vehicle and reply with a quote for your trip."),
    f("Which cars can I hire in Islamabad?", "Premium Luxury Land Cruiser (2025 model), Land Cruiser V8 (2018 model), Lexus LX 570, Prado, Toyota Fortuner, Mercedes G Wagon, Audi, Hilux Revo, Honda Civic, Toyota Corolla Grande, Range Rover and a Toyota Coaster for groups, each with a professional driver."),
    f("Can I book a car from Islamabad airport?", "Yes. Share your flight number, landing time, number of passengers and luggage and we arrange the pickup. You can also book a drop to the airport."),
    f("Which car is best for Hunza, Skardu or Naran?", "An SUV or 4x4 such as the Land Cruiser, Prado or Hilux Revo is the sensible choice for mountain roads. A Coaster suits larger groups on the main routes."),
    f("Do you drive to Lahore, Peshawar and other cities?", "Yes. We provide chauffeur-driven trips from Islamabad and Rawalpindi to Lahore, Peshawar, Faisalabad, Multan and other cities, one way or round trip."),
    f("Can overseas Pakistanis and tourists book in advance?", "Yes, and we recommend it. Send your arrival date, flight and plan before you travel, and we confirm the vehicle and quote so a driver is ready when you land."),
    f("How much does a car with a driver cost?", "Every trip is quoted individually because it depends on the vehicle, the route, the number of days and your requirements. Call or WhatsApp us for a quote for your dates."),
    f("Can I hire a car for a wedding in Islamabad?", "Yes. Tell us the date, venues and timing and we confirm vehicles and a quote. Please book early for popular wedding dates."),
    f("What is the difference between Local and Out of Station service?", "Local is for travel inside Islamabad, such as shopping, hotels, meetings and picnic spots. Out of Station is for any trip that leaves Islamabad. They are priced differently, so you choose one when you book."),
    f("Where is your office?", "Office No 12, 3rd Floor, Shah Nawaz Plaza, G-11 Markaz, Islamabad. Our team replies by phone and WhatsApp."),
  ],
};
