// The two services the customer chooses between, and the page that lists the Islamabad places.
//   LOCAL_PILLAR  = daily use inside Islamabad (markets, hotels, picnic spots, meetings)
//   OUT_PILLAR    = every trip that leaves Islamabad (cities, hill stations, valleys, the north)
// They are priced differently, so each has its own page and its own search keywords. Prices are never shown on the website.
const f = (q, a) => ({ q, a });

export const LOCAL_PILLAR = {
  path: "/local-car-rental-islamabad", slug: "local",
  title: "Daily Local Car With Driver in Islamabad",
  h1: "Local Car Rental With Driver for Daily Use in Islamabad",
  description: "Local car with a professional driver inside Islamabad: shopping, markets, premium hotels, meetings and picnic spots. Choose your places and book.",
  eyebrow: "Local service",
  lead: "Need a car and driver for the day inside Islamabad? Our Local service is for everyday travel in the city: shopping, markets, hotels, meetings, family visits and picnic spots. Your driver stays with you and the car waits when you need it.",
  answerQ: "What is the Local service?",
  answer: "Local service means a car with a professional driver used inside Islamabad (and Rawalpindi on request) for the day or for a few hours. It is different from an Out of Station trip, which leaves the city for another town or valley, and the two are priced differently. Choose Local when you book and we quote for your day.",
  usesTitle: "What people book the Local service for",
  uses: [
    "Shopping days across Centaurus Mall, F-7, F-6 and Giga Mall, with the car waiting between stops.",
    "Meetings and business visits in the Blue Area and other sectors, with a driver who knows the roads and arrives early.",
    "Hotel guests who need a private car for the stay, from airport pickup to dinner.",
    "Family outings and picnics to Daman-e-Koh, Pir Sohawa, Rawal Lake and the Margalla trails.",
    "City tours of Faisal Mosque, Pakistan Monument and Lok Virsa for visitors and overseas Pakistanis.",
    "Weddings, events and special occasions inside the city.",
  ],
  howTitle: "How a Local booking works",
  how: [
    ["1. Choose Local", "Select Local when you open the booking form, so we know it is a trip inside Islamabad."],
    ["2. Share your day", "Tell us the pickup place, the date, the time you start and the places you want to visit. Add how long you need the car."],
    ["3. We confirm", "We confirm the vehicle and driver and reply with a quote for your day. Nothing is charged by the website."],
    ["4. Your driver arrives", "The driver collects you at the agreed place and time and stays with you for the booking."],
  ],
  vsTitle: "Local or Out of Station?",
  vs: "Choose Local when every stop is inside Islamabad. Choose Out of Station when the trip leaves the city, for example to Murree, Lahore, Swat, Kumrat, Hunza or Skardu. If your plan has both, for example airport pickup and then a trip to the north, tell us and we quote the two parts clearly.",
  faqs: [
    f("What is the difference between Local and Out of Station?", "Local is for travel inside Islamabad, usually by the day or for a few hours. Out of Station is for trips that leave Islamabad. They are quoted differently, so you choose one when you book."),
    f("Can I book a car for a few hours only?", "Yes. A Local booking can be for a few hours, for example an evening of shopping or a meeting. Tell us the start time and how long you need the car."),
    f("Can the driver wait while I shop or attend a meeting?", "Yes. Waiting time can be part of a Local booking. We confirm it with the quote so you know how the day will run."),
    f("Do you cover Rawalpindi in the Local service?", "Yes, on request. Many trips begin in Rawalpindi and continue into Islamabad. Tell us your pickup area when you send the request."),
    f("Can I use the same car for several days in the city?", "Yes. You can book a driver for several days, and the plan can change from day to day. Share the dates and we confirm."),
    f("Which vehicle should I choose for city travel?", "For one or two people a Honda Civic or Toyota Grande is a comfortable choice. For families with bags a Prado or Land Cruiser suits better, and a Coaster suits large groups."),
  ],
};

export const OUT_PILLAR = {
  path: "/out-of-station-car-rental", slug: "out",
  title: "Out of Station Car With Driver From Islamabad",
  h1: "Out of Station Car Rental With Driver From Islamabad",
  description: "Out of station trips from Islamabad with a professional driver: Lahore, Peshawar, Murree, Swat, Kumrat, Hunza, Skardu and more. Plan and book your trip.",
  eyebrow: "Out of station",
  lead: "Planning a trip outside Islamabad? Our Out of Station service takes you to other cities, hill stations, valleys and picnic spots with the same professional driver for the whole journey, whether it is a day trip to Murree or a week in the north.",
  answerQ: "What is the Out of Station service?",
  answer: "Out of Station means a car with a professional driver for a trip that leaves Islamabad, one way or round trip, for a day or many days. Most of our customers choose it for Lahore, Peshawar, Murree, Swat, Kumrat, Naran, Hunza and Skardu. It is priced differently from the Local service, so you choose it when you book and we quote for your route.",
  usesTitle: "Why people choose Out of Station",
  uses: [
    "One driver and one vehicle for the whole journey, so luggage and plans stay in one place.",
    "A driver who knows the highways, the hill roads and the daily rhythm of mountain travel.",
    "The right vehicle for the road: an SUV or 4x4 for the mountains and a Coaster for large groups.",
    "Flexible stops for photos, meals and rest, planned with you before you leave.",
    "Pickup from Islamabad or Rawalpindi, and a drop at your hotel or home at the end.",
    "Round trips, one-way trips and multi-day tours.",
  ],
  howTitle: "How an Out of Station booking works",
  how: [
    ["1. Choose Out of Station", "Select Out of Station when you open the booking form and enter your destination."],
    ["2. Share your plan", "Tell us the destination, the dates, the number of passengers and any stops you want on the way."],
    ["3. We confirm and quote", "We confirm the right vehicle for your route and season and reply with a quote for the trip."],
    ["4. Travel with your driver", "Your driver collects you on the agreed day and stays with you until the trip ends."],
  ],
  vsTitle: "Out of Station or Local?",
  vs: "Choose Out of Station for any trip that leaves Islamabad. Choose Local for travel inside the city, such as shopping, hotels and picnic spots in the Margalla Hills. If you want both, we quote the two parts clearly.",
  groups: [
    { id: "cities", title: "Cities", intro: "Intercity trips from Islamabad or Rawalpindi, one way or round trip.", places: ["lahore", "peshawar", "faisalabad", "multan", "abbottabad", "muzaffarabad"] },
    { id: "hills", title: "Hill stations and picnic spots", intro: "Cool-weather escapes and day trips from Islamabad.", places: ["murree", "nathia-gali", "shogran", "naran", "babusar-top", "malam-jabba"] },
    { id: "swat", title: "Swat, Kumrat and Chitral", intro: "Green valleys, forests and rivers in the Khyber Pakhtunkhwa north.", places: ["swat", "kalam", "kumrat-valley", "chitral"] },
    { id: "gb", title: "Gilgit-Baltistan and Azad Kashmir", intro: "Long mountain journeys that need the right vehicle and an experienced driver.", places: ["gilgit", "hunza", "attabad-lake", "skardu", "khaplu", "shigar-valley", "fairy-meadows", "neelum-valley"] },
  ],
  faqs: [
    f("What counts as an Out of Station trip?", "Any trip that leaves Islamabad, for example to Lahore, Murree, Swat, Kumrat, Naran, Hunza or Skardu. A trip that stays inside Islamabad is a Local trip."),
    f("Can I book a one-way trip?", "Yes. One-way and round trips are both available. Tell us the pickup, the destination and the dates and we quote accordingly."),
    f("How do I choose a vehicle for the mountains?", "An SUV or 4x4 such as the Land Cruiser, Prado or Hilux Revo is the sensible choice for mountain roads. For larger groups a Coaster works on the main routes."),
    f("Can I plan a multi-day tour with several stops?", "Yes. Send your days, the places you want to see and the number of passengers. We confirm what is possible on the road and in the season and quote the whole plan."),
    f("Is the driver with us for the whole trip?", "Yes. The professional driver stays with the vehicle and with you for the whole booking."),
    f("What if the weather or road changes during the trip?", "Mountain weather and roads can change. Your driver advises on the safest option on the day, and our team adjusts the plan with you."),
  ],
};

export const PLACES_HUB = {
  path: "/islamabad-places", slug: "places",
  title: "Places in Islamabad We Cover With a Driver",
  h1: "Islamabad Places: Markets, Hotels, Picnic Spots and Landmarks",
  description: "Markets, premium hotels, picnic spots and landmarks in Islamabad where we provide a local car with a professional driver. Pick your place and book.",
  eyebrow: "Local service",
  lead: "Pick the place you want to visit in Islamabad and see how a local car with a professional driver can make the day easier. Every page explains the place and how to book the Local service.",
  faqs: [
    f("Which places in Islamabad can I visit with a driver?", "Any place inside the city. This page lists the markets, hotels, picnic spots and landmarks people ask for most, and your driver can also take you to places that are not listed."),
    f("Can I visit several places in one day?", "Yes. A Local booking can include many stops. Choose the places, share the timing and we plan the order of the day with you."),
    f("Do you serve all sectors of Islamabad?", "Yes. We pick up from across Islamabad and from Rawalpindi on request. Our office is in G-11 Markaz."),
  ],
};
