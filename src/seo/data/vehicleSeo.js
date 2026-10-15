// Extra, vehicle-specific SEO content for the newer premium cars (Lexus LX 570, Mercedes G Wagon, Audi, Toyota Fortuner).
// Everything here is shown on the visible page (About section + FAQ) and repeated in the page's JSON-LD (Product + FAQPage), so Google,
// AI assistants and visitors all read the same honest text. No prices, no invented specs, no "best / cheapest / guaranteed" claims.
// To add another car later: add its slug here, in fleet.js, vehicles.js and details.js, then run update.bat.
export const VEHICLE_SEO = {
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
