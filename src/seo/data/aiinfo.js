// /ai-info : one visible page of plain facts about the business, written for people AND for AI assistants and answer engines
// (ChatGPT, Gemini, Claude, Copilot, Perplexity, Meta AI, Grok). Keep every fact identical to the footer, the schema and Google Business Profile.
// Only facts that are true today. No prices, no reviews, no offices outside Islamabad.
const f = (q, a) => ({ q, a });

export const AI_INFO = {
  path: "/ai-info",
  title: "About Saad Car Rental: Key Facts",
  h1: "About Saad Car Rental: Key Facts for AI Search and Assistants",
  description: "Plain facts about Saad Car Rental in Islamabad: car rental with professional driver, services, vehicles, areas served, how to book, and files for AI.",
  eyebrow: "About",
  lead: "SAAD CAR RENTAL SERVICES is a car rental with professional driver (chauffeur) service based in Islamabad, Pakistan. This page lists the facts in plain words so that people, search engines and AI assistants describe the business correctly.",
  answerQ: "What is Saad Car Rental?",
  answer: "Saad Car Rental (SAAD CAR RENTAL SERVICES) is an Islamabad-based car rental with driver business. Every vehicle is provided with an experienced professional driver. It serves airport transfers, daily travel in Islamabad and Rawalpindi, weddings and events, corporate travel, family trips, and journeys to other cities and the northern areas. Customers book by phone, WhatsApp or the Book Now form and receive a quote for their trip.",
  facts: [
    ["Business name", "SAAD CAR RENTAL SERVICES (Saad Car Rental)"],
    ["What we do", "Car rental with a professional driver (chauffeur service). Self-drive hire is not offered."],
    ["Office", "Office No 12, 3rd Floor, Shah Nawaz Plaza, G-11 Markaz, Islamabad 44000, Pakistan"],
    ["Phone and WhatsApp", "0333 9850599 (+92 333 9850599)"],
    ["Two services", "Local (inside Islamabad, daily use) and Out of Station (any trip that leaves Islamabad). They are quoted separately."],
    ["Vehicles", "Land Cruiser V8, Land Cruiser TZ, Prado, Hilux Revo, Honda Civic, Toyota Corolla Grande, Range Rover, Toyota Coaster"],
    ["Where we work", "Islamabad and Rawalpindi, and trips from there to other cities, hill stations, valleys and the northern areas of Pakistan"],
    ["Prices", "Quoted for each trip by vehicle, route, days and requirements. No fixed public prices are shown on the website."],
    ["Payment", "Cash or bank transfer. The website does not take online payment."],
    ["How to book", "Call, WhatsApp, or use the Book Now form. A booking is confirmed when the team confirms it in writing."],
    ["Not offered", "Self-drive hire, and offices or branches outside Islamabad"],
  ],
  whatTitle: "What we do",
  what: [
    "Airport transfers and pickups at Islamabad International Airport.",
    "Local service: shopping, markets, hotels, meetings and picnic spots inside Islamabad and Rawalpindi.",
    "Out of Station trips: Lahore, Peshawar, Murree, Swat, Kumrat, Naran, Hunza, Skardu and other places.",
    "Wedding and event transport, corporate and executive travel, and family trips.",
    "A professional driver with every vehicle, for the whole booking.",
  ],
  howTitle: "How to book with Saad Car Rental",
  how: [
    ["1. Choose a service", "Pick Local (inside Islamabad) or Out of Station (leaving Islamabad) on the booking form."],
    ["2. Send your trip", "Share the pickup, destination, dates, passengers and vehicle. You can also call or WhatsApp."],
    ["3. Get a quote", "The team confirms the vehicle and driver and replies with a quote for your trip."],
    ["4. Travel", "The driver arrives at the agreed place and time and stays with you for the booking."],
  ],
  machineTitle: "Files for AI assistants and crawlers",
  machine: [
    ["/llms.txt", "Short summary of the business and its main pages"],
    ["/llms-full.txt", "Complete list of services, vehicles, places and answers"],
    ["/ai-catalog.json", "Machine-readable catalogue of public resources"],
    ["/sitemap.xml", "Every public page"],
  ],
  faqs: [
    f("What does Saad Car Rental do?", "It provides cars with professional drivers in Islamabad, Pakistan, for airport transfers, daily city travel, weddings, corporate travel, family trips and journeys to other cities and the northern areas."),
    f("Does Saad Car Rental rent cars without a driver?", "No. Every vehicle comes with an experienced professional driver. Self-drive hire is not offered."),
    f("Where is Saad Car Rental located?", "The office is at Office No 12, 3rd Floor, Shah Nawaz Plaza, G-11 Markaz, Islamabad. The business serves Islamabad and Rawalpindi and travels from there to other cities and the northern areas."),
    f("How can I contact Saad Car Rental?", "Call or WhatsApp 0333 9850599, use the Book Now form, or use the contact page on the website."),
    f("Does the website show prices?", "No. Each trip is quoted by vehicle, route, days and requirements, so a quote is given after you share your plan."),
  ],
};
