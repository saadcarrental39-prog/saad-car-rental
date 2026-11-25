// Extra, vehicle-specific SEO content for the newer premium cars (Lexus LX 570, Mercedes G Wagon, Audi, Toyota Fortuner).
// Everything here is shown on the visible page (About section + FAQ) and repeated in the page's JSON-LD (Product + FAQPage), so Google,
// AI assistants and visitors all read the same honest text. Prices appear only where the owner supplied them (Land Cruiser pages, written as "100,000 PKR" so the site price filter accepts them); no invented specs, no "best / cheapest / guaranteed" claims.
// To add another car later: add its slug here, in fleet.js, vehicles.js and details.js, then run update.bat.
export const VEHICLE_SEO = {
"mercedes-a-class": {
    "title": "Mercedes A-Class on Rent in Islamabad",
    "desc": "Hire a Mercedes-Benz A-Class with a professional driver in Islamabad for executives, airport transfers and stylish city travel. Call or WhatsApp.",
    "name": "Mercedes A-Class",
    "brand": "Mercedes-Benz",
    "model": "A-Class",
    "alias": [
      "Mercedes A-Class with driver",
      "A-Class on rent Islamabad",
      "Mercedes hatchback rent a car Islamabad"
    ],
    "about": [
      "The Mercedes-Benz A-Class is the compact luxury choice in our fleet: a graphite-grey hatchback with a sharp, modern look, provided with an experienced professional driver by SAAD CAR RENTAL SERVICES. It suits guests who want a premium arrival without the size of a full-size SUV.",
      "Business visitors choose it for meetings across Islamabad and Rawalpindi, for airport pickups with light luggage and for stylish city days. It is at its best with one to three passengers. For a larger group or heavy bags, we suggest an SUV and tell you before you book."
    ],
    "faqs": [
      {
        "q": "Is the A-Class a good choice for airport pickups?",
        "a": "Yes, for one to three guests with moderate luggage. For several large bags we suggest an SUV or an MPV."
      },
      {
        "q": "Who usually books the A-Class?",
        "a": "Business visitors, couples and guests who want a modern premium car for city travel and meetings."
      }
    ]
  },
  "mercedes-ml": {
    "title": "Mercedes ML SUV on Rent in Islamabad",
    "desc": "Mercedes-Benz ML SUV with a professional driver in Islamabad for VIP guests, families and weddings. Call or WhatsApp to confirm your date.",
    "name": "Mercedes ML",
    "brand": "Mercedes-Benz",
    "model": "ML",
    "alias": [
      "Mercedes ML with driver",
      "Mercedes ML SUV on rent Islamabad",
      "ML 350 rent a car Islamabad"
    ],
    "about": [
      "The Mercedes ML is a white luxury SUV with a quiet, comfortable cabin, provided with an experienced professional driver by SAAD CAR RENTAL SERVICES. It gives VIP guests and families more room than a sedan while keeping a polished, formal look.",
      "We offer it for airport arrivals, wedding days, corporate visits and long motorway journeys from Islamabad. The white finish is bright and photographs well at venues, and the driver handles the route, parking and timing while passengers relax."
    ],
    "faqs": [
      {
        "q": "What is the Mercedes ML best for?",
        "a": "VIP guests, families, wedding days and long motorway journeys where comfort and presence matter."
      },
      {
        "q": "Can the ML go to Murree or the north?",
        "a": "On the main hill roads in normal conditions, yes. For snow or rough tracks we suggest a Prado, Land Cruiser or Revo and tell you before you book."
      }
    ]
  },
  "bmw-m3": {
    "title": "BMW M3 on Rent in Islamabad With Driver",
    "desc": "Book a white BMW M3 sports sedan with a professional driver in Islamabad for weddings, executive arrivals and special occasions. Call or WhatsApp.",
    "name": "BMW M3",
    "brand": "BMW",
    "model": "M3",
    "alias": [
      "BMW M3 with driver",
      "BMW M3 for wedding Islamabad",
      "BMW rent a car Islamabad"
    ],
    "about": [
      "The BMW M3 is our sporty statement sedan: a white M3 with a bold front end and wide stance, provided with an experienced professional driver by SAAD CAR RENTAL SERVICES. It is chosen when the car itself should be noticed.",
      "It suits wedding arrivals, executive entrances, photo shoots and special occasions in Islamabad and Rawalpindi. It is a low sports sedan, so it is best kept to paved roads and city or motorway use, and it carries up to four passengers with limited luggage."
    ],
    "faqs": [
      {
        "q": "Is the BMW M3 suitable for weddings?",
        "a": "Yes. Its sporty look and white finish make it a popular statement car for the couple. Tell us your schedule and we confirm the booking."
      },
      {
        "q": "Can the M3 be used for long trips?",
        "a": "On paved roads and motorways, yes. For mountain or rough routes we suggest an SUV or 4x4."
      }
    ]
  },
  "suzuki-swift": {
    "title": "Suzuki Swift on Rent in Islamabad",
    "desc": "Rent a Suzuki Swift with a professional driver in Islamabad for city travel, short trips and light airport runs. Call or WhatsApp.",
    "name": "Suzuki Swift",
    "brand": "Suzuki",
    "model": "Swift",
    "alias": [
      "Suzuki Swift with driver",
      "Swift on rent Islamabad",
      "small car with driver Islamabad"
    ],
    "about": [
      "The Suzuki Swift is our compact, easy-going hatchback: a white Swift that is simple to park and comfortable in busy city traffic, provided with an experienced professional driver by SAAD CAR RENTAL SERVICES.",
      "Guests choose it for errands, shopping days, short trips and airport runs with light luggage, when a large vehicle is not needed. It suits one to three passengers. If your group or luggage is larger, we suggest a bigger vehicle and tell you honestly before you book."
    ],
    "faqs": [
      {
        "q": "How many people fit in the Swift?",
        "a": "The Swift typically suits up to four passengers with light luggage. For more people or heavy bags, we suggest an MPV or an SUV."
      },
      {
        "q": "Is the Swift good for Murree?",
        "a": "For a day trip in dry weather it can manage the main road, but in winter or on rough roads we recommend a 4x4."
      }
    ]
  },
  "suzuki-ertiga": {
    "title": "Suzuki Ertiga on Rent in Islamabad",
    "desc": "Suzuki Ertiga family MPV with a professional driver in Islamabad for families, airport pickups and intercity trips. Call or WhatsApp.",
    "name": "Suzuki Ertiga",
    "brand": "Suzuki",
    "model": "Ertiga",
    "alias": [
      "Suzuki Ertiga with driver",
      "Ertiga on rent Islamabad",
      "7 seater car with driver Islamabad"
    ],
    "about": [
      "The Suzuki Ertiga is a white family MPV with flexible seating, provided with an experienced professional driver by SAAD CAR RENTAL SERVICES. It gives a family more room than a sedan without the size of a large SUV.",
      "Families use it for airport pickups, day trips, shopping and intercity journeys such as Lahore or Peshawar. It is a practical choice for a group of up to six passengers; tell us your luggage and we confirm the fit before the trip."
    ],
    "faqs": [
      {
        "q": "Is the Ertiga a seven-seater?",
        "a": "The Ertiga is a family MPV that typically seats up to six passengers with the driver. We confirm seating and luggage for your date when you book."
      },
      {
        "q": "Is the Ertiga good for family airport pickups?",
        "a": "Yes. Its flexible seating and boot space suit families arriving with several bags."
      }
    ]
  },
  "toyota-innova-crysta": {
    "title": "Toyota Innova Crysta on Rent in Islamabad",
    "desc": "Hire a Toyota Innova Crysta MPV with a professional driver in Islamabad for families, corporate guests and long journeys. Call or WhatsApp.",
    "name": "Toyota Innova Crysta",
    "brand": "Toyota",
    "model": "Innova Crysta",
    "alias": [
      "Innova Crysta with driver",
      "Toyota Innova on rent Islamabad",
      "Innova Crysta rent a car Islamabad"
    ],
    "about": [
      "The Toyota Innova Crysta is a white premium MPV with a spacious cabin, provided with an experienced professional driver by SAAD CAR RENTAL SERVICES. It is one of the most comfortable ways to move a family or a small team over a long day.",
      "Corporate guests like its smart look, and families like the room for luggage and the relaxed ride on motorway journeys from Islamabad to Lahore, Peshawar or the hill stations. It suits up to six passengers."
    ],
    "faqs": [
      {
        "q": "Who books the Innova Crysta?",
        "a": "Families, corporate guests and small teams who want a roomy, comfortable vehicle for long drives."
      },
      {
        "q": "Can the Innova Crysta be used for the northern areas?",
        "a": "On the main roads in good weather, yes. For rough or snowy routes we suggest a 4x4 and tell you before you book."
      }
    ]
  },
  "toyota-avanza": {
    "title": "Toyota Avanza on Rent in Islamabad",
    "desc": "Toyota Avanza family MPV with a professional driver in Islamabad for family travel, airport transfers and intercity trips. Call or WhatsApp.",
    "name": "Toyota Avanza",
    "brand": "Toyota",
    "model": "Avanza",
    "alias": [
      "Toyota Avanza with driver",
      "Avanza on rent Islamabad",
      "family car with driver Islamabad"
    ],
    "about": [
      "The Toyota Avanza is a white family MPV that seats a household comfortably, provided with an experienced professional driver by SAAD CAR RENTAL SERVICES. It is a practical, no-fuss vehicle for everyday family travel.",
      "We offer it for airport runs, visits between Islamabad and Rawalpindi and intercity trips. It suits up to six passengers, and we confirm luggage space for your group before you travel."
    ],
    "faqs": [
      {
        "q": "Is the Avanza comfortable for long drives?",
        "a": "Yes, on motorway and intercity routes it is a comfortable family vehicle. Tell us your luggage and we confirm the fit."
      },
      {
        "q": "How is the Avanza different from the Ertiga?",
        "a": "Both are family MPVs. Tell us your group size and bags and we recommend the one with the better fit for your date."
      }
    ]
  },
  "honda-mobilio": {
    "title": "Honda Mobilio on Rent in Islamabad",
    "desc": "Honda Mobilio family MPV with a professional driver in Islamabad for family travel, airport pickups and day trips. Call or WhatsApp.",
    "name": "Honda Mobilio",
    "brand": "Honda",
    "model": "Mobilio",
    "alias": [
      "Honda Mobilio with driver",
      "Mobilio on rent Islamabad",
      "MPV with driver Islamabad"
    ],
    "about": [
      "The Honda Mobilio is a white family MPV with flexible seating, provided with an experienced professional driver by SAAD CAR RENTAL SERVICES. It is easy to drive through city traffic and roomy enough for a small family.",
      "Guests use it for airport pickups, day trips and visits across Islamabad and Rawalpindi. It suits up to six passengers, and we confirm luggage space for your group when you book."
    ],
    "faqs": [
      {
        "q": "Is the Mobilio good for city use?",
        "a": "Yes. It is easy to drive and park in city traffic, and comfortable for family outings."
      },
      {
        "q": "Can the Mobilio carry extra luggage?",
        "a": "Space depends on how many seats are used. Tell us your bags and we confirm the fit or suggest a larger vehicle."
      }
    ]
  },
  "suzuki-wagon-r": {
    "title": "Suzuki Wagon R on Rent in Islamabad",
    "desc": "Suzuki Wagon R Stingray with a professional driver in Islamabad for economical city travel, errands and short trips. Call or WhatsApp.",
    "name": "Suzuki Wagon R",
    "brand": "Suzuki",
    "model": "Wagon R Stingray",
    "alias": [
      "Suzuki Wagon R with driver",
      "Wagon R on rent Islamabad",
      "economical car with driver Islamabad"
    ],
    "about": [
      "The Suzuki Wagon R Stingray is our smallest and most economical choice: a tall, compact hatchback in white, provided with an experienced professional driver by SAAD CAR RENTAL SERVICES.",
      "It suits errands, short city trips and solo or small-group travel in Islamabad and Rawalpindi, with light luggage. It carries up to three passengers, and for more people or bags we suggest a larger vehicle."
    ],
    "faqs": [
      {
        "q": "How many passengers can the Wagon R take?",
        "a": "Typically up to three passengers with light luggage. For a larger group we suggest a Cultus, a Swift or an MPV."
      },
      {
        "q": "Is the Wagon R good for long trips?",
        "a": "It is best for city and short trips. For long motorway journeys with luggage we suggest a sedan, an MPV or an SUV."
      }
    ]
  },
  "suzuki-cultus": {
    "title": "Suzuki Cultus on Rent in Islamabad",
    "desc": "Suzuki Cultus in white, grey and blue-grey with a professional driver in Islamabad for city travel, errands and airport runs. Call or WhatsApp.",
    "name": "Suzuki Cultus",
    "brand": "Suzuki",
    "model": "Cultus",
    "alias": [
      "Suzuki Cultus with driver",
      "Cultus on rent Islamabad",
      "budget car with driver Islamabad"
    ],
    "about": [
      "The Suzuki Cultus is a simple, economical hatchback that we offer in three colours: white, grey and blue-grey, each provided with an experienced professional driver by SAAD CAR RENTAL SERVICES.",
      "It suits errands, shopping days, short trips and airport runs with light luggage for up to four passengers. Choose your colour when you book and we confirm what is available for your date."
    ],
    "faqs": [
      {
        "q": "Which colours does the Cultus come in?",
        "a": "We offer the Cultus in white, grey and blue-grey. We confirm the colour for your date when you book."
      },
      {
        "q": "Is the Cultus suitable for the airport?",
        "a": "Yes, for up to three or four guests with light luggage. For more bags we suggest an MPV or an SUV."
      }
    ]
  },
  "toyota-hiace": {
    "title": "Toyota Hiace on Rent in Islamabad With Driver",
    "desc": "Toyota Hiace high-roof group van with a professional driver in Islamabad for families, groups, events and tours. Call or WhatsApp.",
    "name": "Toyota Hiace",
    "brand": "Toyota",
    "model": "Hiace",
    "alias": [
      "Toyota Hiace with driver",
      "Hiace on rent Islamabad",
      "van with driver Islamabad"
    ],
    "about": [
      "The Toyota Hiace is a white high-roof group van, provided with an experienced professional driver by SAAD CAR RENTAL SERVICES. It carries a whole group together, which keeps arrivals organised and the plan simple.",
      "Groups book it for airport pickups, family gatherings, events, wedding guests and tours from Islamabad. Seating depends on the van configuration, so tell us your group size and luggage and we confirm the fit or suggest a Coaster."
    ],
    "faqs": [
      {
        "q": "How many people does the Hiace carry?",
        "a": "Seating depends on the configuration of the van. Tell us your group size and we confirm that it fits, or suggest a Coaster for a larger group."
      },
      {
        "q": "Is the Hiace good for airport groups?",
        "a": "Yes. A group can travel together with luggage, with one driver for the whole trip."
      }
    ]
  },
  "premium-luxury-land-cruiser": {
    title: "Premium Luxury Land Cruiser Rental Islamabad",
    desc: "Hire the Premium Luxury Land Cruiser (2025 model, black) with a professional driver in Islamabad for VIP, executive and wedding travel. Call or WhatsApp.",
    name: "Premium Luxury Land Cruiser", brand: "Toyota", model: "Land Cruiser (2025 model)",
    alias: ["Land Cruiser 2025 on rent", "Premium Land Cruiser Islamabad", "Luxury Land Cruiser with driver", "Toyota Land Cruiser rent a car Islamabad"],
    about: [
      "The Premium Luxury Land Cruiser is the top of our SUV fleet: a 2025 model Toyota Land Cruiser in black, provided with an experienced professional driver by SAAD CAR RENTAL SERVICES. It is the car we offer to guests, delegations and families who want the newest Land Cruiser with a spacious, quiet cabin and a commanding presence.",
      "We have it in black only. It suits VIP and executive pickups, wedding arrivals, corporate visits and long journeys from Islamabad to Lahore, Peshawar or the mountains. On a long day the newer cabin keeps everyone comfortable, and a driver who knows the roads takes care of the route, parking and timing.",
      "The Local rent for the Premium Luxury Land Cruiser is 100,000 PKR per day with a professional driver; Out of Station trips are priced separately. Send your date, pickup point and route by WhatsApp or the Book Now form and we confirm availability and your trip details.",
    ],
    faqs: [
      { q: "What is the Premium Luxury Land Cruiser?", a: "It is our 2025 model Toyota Land Cruiser in black, provided with a professional driver. It is our top luxury SUV for VIP, executive and wedding travel in Islamabad." },
      { q: "What is the rent of the Premium Luxury Land Cruiser per day?", a: "The Local rent is 100,000 PKR per day with a professional driver; Out of Station trips are priced separately. Your route, number of days and any out of station requirements are confirmed when you call or WhatsApp us, so you get exact trip details for your date." },
      { q: "Is the Premium Luxury Land Cruiser available in other colours?", a: "No, we have it in black only. If you want a white Land Cruiser, ask about our Land Cruiser V8 2018 model, which is available in white and black." },
      { q: "Can the Premium Luxury Land Cruiser go outside Islamabad?", a: "Yes. It can be booked for Lahore, Peshawar, Murree and other out of station trips, and for the main northern routes. For very rough or snowy stretches we may suggest a Revo or another 4x4, and we tell you honestly which vehicle suits your route." },
      { q: "How many passengers does it carry?", a: "It is a full-size SUV that normally seats up to seven. Tell us your group size and luggage and we confirm that it is the right vehicle for you." },
    ],
  },
  "land-cruiser-v8": {
    title: "Land Cruiser V8 2018 Rental With Driver",
    desc: "Hire a Land Cruiser V8 2018 model in white or black with a professional driver in Islamabad for airports, weddings and long trips. Call or WhatsApp.",
    name: "Land Cruiser V8 2018 Model", brand: "Toyota", model: "Land Cruiser V8 (2018 model)",
    alias: ["Land Cruiser V8 on rent", "Land Cruiser 2018 rent a car", "Land Cruiser V8 with driver", "Toyota Land Cruiser V8 rental Islamabad"],
    about: [
      "The Toyota Land Cruiser V8, 2018 model, is a full-size luxury SUV that we offer in white and black, each with a professional driver. It gives you the Land Cruiser's roomy seating, strong road presence and comfortable long-distance ride, and it is a good alternative to our 2025 Premium Luxury Land Cruiser when you want a Land Cruiser at a lower day rate.",
      "Families, groups and business guests book it for airport transfers, weddings, trips to Murree and Naran, and long journeys to Lahore, Peshawar and the northern areas. Both colours are shown on this page: choose black for a formal look or white for a brighter, wedding-friendly one.",
      "The Local rent for the Land Cruiser V8 2018 model is 22,000 PKR per day with a professional driver; Out of Station trips are priced separately. Send your date, route and number of passengers and we confirm availability and your trip details.",
    ],
    faqs: [
      { q: "Can I rent a Land Cruiser V8 2018 model with a driver in Islamabad?", a: "Yes. The Land Cruiser V8 2018 model is provided with an experienced professional driver. Share your date, pickup point and destination and we confirm availability." },
      { q: "What is the rent of the Land Cruiser V8 2018 model per day?", a: "The Local rent is 22,000 PKR per day with a professional driver; Out of Station trips are priced separately. Route, number of days and any out of station requirements are confirmed when you call or WhatsApp us." },
      { q: "Which colours does the Land Cruiser V8 2018 model come in?", a: "We have it in white and black. Tell us which colour you prefer when you book and we confirm which one is free on your date." },
      { q: "What is the difference between the V8 2018 model and the Premium Luxury Land Cruiser?", a: "The Premium Luxury Land Cruiser is our 2025 model in black at 100,000 PKR per day. The Land Cruiser V8 is a 2018 model in white and black at 22,000 PKR per day. Choose by the model year, colour and rent that suit you." },
      { q: "Is the Land Cruiser V8 good for Murree, Hunza and Skardu?", a: "Yes, a Land Cruiser is a popular and comfortable choice for hill roads and long mountain highways. In winter or on very rough stretches, ask us about conditions before you book." },
    ],
  },
  "lexus-lx-570": {
    desc: "Hire a Lexus LX 570 with a professional driver in Islamabad for VIP travel, weddings, airport pickups and long trips. Call or WhatsApp for a quote.",
    name: "Lexus LX 570", brand: "Lexus", model: "LX 570",
    alias: ["Lexus LX570", "Lexus LX 570 on rent", "Lexus rent a car Islamabad", "Lexus with driver"],
    about: [
      "The Lexus LX 570 is Lexus's flagship full-size luxury SUV, powered by a 5.7-litre V8. At SAAD CAR RENTAL SERVICES it comes with an experienced professional driver, so you enjoy the quiet cabin and the road presence without driving in Islamabad traffic yourself. Self-drive hire is not offered.",
      "People usually choose the LX 570 for VIP and executive pickups, wedding arrivals, visiting delegations and families who want a premium SUV with plenty of room. It is steady on the Islamabad to Lahore motorway and comfortable on hill roads towards Murree, which is why it suits both city days and longer journeys.",
      "This page shows the LX 570 in black, cream white and pearl white. Tell us which colour you prefer when you book and we confirm availability for your date.",
    ],
    faqs: [
      { q: "Can I rent a Lexus LX 570 with a driver in Islamabad?", a: "Yes. The Lexus LX 570 is provided with a professional driver from our office in G-11 Markaz, Islamabad. Send your date, pickup point and destination by WhatsApp or the Book Now form and we confirm availability and your quote." },
      { q: "What is the Lexus LX 570 hired for most often?", a: "Typical uses are VIP and executive transport, wedding arrivals, airport pickups for important guests, delegations and family journeys where space and a quiet cabin matter." },
      { q: "Can the Lexus LX 570 go outside Islamabad?", a: "Yes. It can be booked for Lahore, Peshawar, Murree and other out of station trips. For rough or seasonal mountain stretches we may suggest a Land Cruiser, Prado or Revo instead, and we tell you honestly which vehicle suits your route." },
      { q: "How many passengers fit in the Lexus LX 570?", a: "It is a full-size SUV that normally seats up to seven. Tell us your group size and luggage and we confirm that this is the right vehicle for you." },
      { q: "How is the Lexus LX 570 priced?", a: "Every trip is quoted by route, days and requirements, so there is no fixed public price. Call or WhatsApp us for a quote for your date." },
    ],
  },
  "mercedes-g-wagon": {
    title: "Mercedes G Wagon Rental Islamabad With Driver",
    desc: "Hire a Mercedes G Wagon (G Vegan) with a professional driver in Islamabad for weddings, VIP arrivals and events. Call or WhatsApp for a quote.",
    name: "Mercedes G Wagon", brand: "Mercedes-Benz", model: "G-Class (G Wagon)",
    alias: ["G Wagon", "G Wagen", "G-Class", "G Vegan", "Mercedes G Class", "Mercedes G Wagon on rent"],
    about: [
      "The Mercedes-Benz G Wagon, officially the G-Class, began life in 1979 as a military off-roader and became one of the most recognisable luxury SUVs in the world. Its square shape and strong presence are the reason it is booked for arrivals that people remember. At SAAD CAR RENTAL SERVICES every G Wagon is provided with a professional driver.",
      "Many customers in Pakistan call it G Wagon, G Wagen or even G Vegan, and all of these mean the same Mercedes G-Class. It is a favourite for groom entries, nikah and barat processions, mehndi and walima events, photo shoots, VIP arrivals and business guests who want to make an impression in Islamabad and Rawalpindi.",
      "The high seating position gives passengers a good view of the road and the driver handles parking and the route, so you can focus on the occasion. We show the G Wagon in black, silver white and grey on this page. Choose a colour and we confirm availability for your date.",
    ],
    faqs: [
      { q: "Can I hire a Mercedes G Wagon with a driver in Islamabad?", a: "Yes. The Mercedes G Wagon is available with an experienced professional driver. Share your date, pickup point and event or destination and we confirm availability and send a quote." },
      { q: "Is G Vegan the same as G Wagon?", a: "Yes. G Wagon, G Wagen and G Vegan are the names people commonly use for the Mercedes-Benz G-Class. If you search for any of them, you are looking at the same vehicle that we offer on this page." },
      { q: "Is the G Wagon good for weddings?", a: "It is one of our most requested cars for wedding arrivals, groom entry and photo shoots because of its strong look and presence. Book early for popular wedding dates, and tell us the venue so the driver can plan the route and timing." },
      { q: "Can the G Wagon be booked for trips outside Islamabad?", a: "Yes, for cities such as Lahore, Peshawar and Murree. For long mountain journeys in the northern areas we may recommend a Land Cruiser, Prado or Revo for comfort and practicality, and we advise you honestly before you book." },
      { q: "How many people can travel in a G Wagon, and what does it cost?", a: "The G Wagon seats up to five passengers. It is quoted per trip according to route, hours or days and your requirements, so call or WhatsApp us for a quote." },
    ],
  },
  audi: {
    desc: "Hire an Audi with a professional driver in Islamabad for executive travel, airport transfers, weddings and city trips. Call or WhatsApp for a quote.",
    name: "Audi", brand: "Audi", model: "Audi luxury car",
    alias: ["Audi on rent", "Audi rent a car Islamabad", "Audi with driver", "Audi car rental Pakistan"],
    about: [
      "If you prefer a sleek luxury car to a large SUV, our Audi is the choice. It is quiet, smooth and low-slung, a good match for executives, couples and guests who want to arrive in style. At SAAD CAR RENTAL SERVICES the Audi is provided with a professional driver, so you can relax in the back or take calls on the way.",
      "The Audi works especially well for airport transfers at Islamabad International Airport, business meetings across Islamabad and Rawalpindi, wedding days and evening events. It seats up to four passengers, which is ideal for one to three guests with light luggage.",
      "An Audi sits lower than an SUV, so for rough or mountain roads we suggest a Prado, Fortuner or Land Cruiser instead. We show the Audi in silver grey and glacier white on this page. Model and year can vary, so tell us what you need and we confirm which Audi is available on your date.",
    ],
    faqs: [
      { q: "Can I rent an Audi with a driver in Islamabad?", a: "Yes. Our Audi is provided with an experienced professional driver. Send your date, pickup point and destination and we confirm availability and your quote." },
      { q: "Which Audi model do you offer?", a: "This page shows our Audi in silver grey and glacier white. The exact model and year can vary, so please tell us what you are looking for and we confirm which Audi we can provide for your date." },
      { q: "Is the Audi suitable for airport transfers and weddings?", a: "Yes. It suits airport pickups, executive meetings, wedding days and evening events, especially for one to three guests who want a refined sedan-style ride." },
      { q: "Should I take the Audi to the northern areas?", a: "We do not recommend a low luxury car for rough or mountain roads. For Murree, Naran, Hunza or Skardu we suggest a Prado, Fortuner, Land Cruiser or Revo, and we will tell you honestly which vehicle fits the route." },
      { q: "How much does it cost to hire an Audi with a driver?", a: "Trips are quoted by route, hours or days and your requirements, so there is no fixed public price. Call or WhatsApp us for a quote." },
    ],
  },
  "toyota-fortuner": {
    desc: "Hire a Toyota Fortuner with a professional driver in Islamabad for family trips, Murree, Naran, airport pickups and Lahore. Call or WhatsApp for a quote.",
    name: "Toyota Fortuner", brand: "Toyota", model: "Fortuner",
    alias: ["Fortuner on rent", "Toyota Fortuner rent a car", "Fortuner with driver", "Fortuner rental Islamabad"],
    about: [
      "The Toyota Fortuner is a practical seven-seat SUV that suits families and small groups. It sits higher than a sedan, has room for suitcases and handles hill roads with confidence, which is why it is one of the most useful cars for trips out of Islamabad. At SAAD CAR RENTAL SERVICES every Fortuner is provided with a professional driver.",
      "Families book the Fortuner for Murree, Nathia Gali, Naran, Swat and other holiday routes, for airport pickups with luggage, and for intercity travel to Lahore and Peshawar. It is also a sensible choice for tour groups who want comfort without choosing a larger luxury SUV.",
      "On this page the Fortuner is shown in black, pearl white and maroon. Tell us your group size, luggage and route and we confirm that the Fortuner is the right vehicle, or suggest a Prado, Land Cruiser or Coaster if your plan needs it.",
    ],
    faqs: [
      { q: "Can I rent a Toyota Fortuner with a driver in Islamabad?", a: "Yes. The Toyota Fortuner is provided with an experienced professional driver. Share your date, route and group size and we confirm availability and your quote." },
      { q: "How many passengers can the Fortuner carry?", a: "The Fortuner is a seven-seat SUV, and luggage space shrinks when all seats are used. Tell us your passengers and bags and we confirm whether it fits or suggest a bigger vehicle." },
      { q: "Is the Fortuner good for Murree, Naran and the northern areas?", a: "Yes, it is a popular and practical choice for hill and mountain roads on the main routes. In winter, when snow or ice is possible, or on very rough stretches, ask us about a 4x4 such as the Revo or Land Cruiser before you book." },
      { q: "Fortuner or Prado: which should I choose?", a: "The Prado has a more premium feel, while the Fortuner is a straightforward, practical family SUV. Both suit families and hill roads. Tell us your group and luggage and we recommend the better fit for your date." },
      { q: "How much does the Fortuner cost per day?", a: "We quote each trip by route, days and requirements, so there is no fixed public price. Call or WhatsApp us for a quote for your dates." },
    ],
  },
};
export const vehicleSeo = (slug) => VEHICLE_SEO[slug] || null;
