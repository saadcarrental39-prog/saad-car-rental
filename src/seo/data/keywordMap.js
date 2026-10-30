// SEARCH-KEYWORD MAP: which search phrases each page is built to answer. One main phrase per page (plus a few close variants), NOT all keywords on every page.
// Titles and descriptions are applied in registry.js. Rules: no superlatives (best/cheapest), no prices, no services we do not offer (we are a car WITH driver service,
// based in Islamabad; we do not run self-drive rentals or offices in other cities). Full map and the reasoning: KEYWORD-MAP.md.
const D = (s) => s;   // descriptions are 120-160 characters
const MAP = {
  "/": { title: "Rent a Car in Islamabad With Driver", description: D("Rent a car with driver in Islamabad: car rental and car hire for airport pickup, family, business, weddings and trips to Murree, Hunza and Skardu.") },
  "/car-rental-pakistan": { title: "Car Rental Pakistan: Rent a Car With Driver", description: D("Rent a car with driver in Pakistan: car hire and chauffeur service from Islamabad to Lahore, Peshawar, Murree, Hunza and Skardu for families and tourists.") },
  "/locations/islamabad": { title: "Rent a Car Islamabad: Car Hire With Driver", description: D("Rent a car in Islamabad with a professional driver: car rental and car hire for airport pickups, city trips, family, business and weddings.") },
  "/airport-transfer/islamabad": { title: "Islamabad Airport Pickup Service With Driver", description: D("Islamabad airport pickup and drop with a professional driver: airport transfer for families, business guests and overseas Pakistanis.") },
  "/local-car-rental-islamabad": { title: "Local Car Rental Islamabad: Daily Car With Driver", description: D("Local car rental in Islamabad with a professional driver, by the day: shopping, meetings, hotels, city tours and picnic spots. Choose your places and book.") },
  "/out-of-station-car-rental": { title: "Outstation Car Rental From Islamabad With Driver", description: D("Outstation car rental from Islamabad with a professional driver: Lahore, Peshawar, Murree, Swat, Hunza, Skardu and more, one-way, round trip or multi-day.") },
  "/northern-areas": { title: "Northern Areas Tour With Driver: Rent a Car", description: D("Rent a car for the northern areas of Pakistan with a professional driver: Murree, Naran, Swat, Hunza, Skardu and more in SUVs, 4x4s and Coasters.") },
  "/visit-pakistan": { title: "Rent a Car in Pakistan for Tourists: Private Driver", description: D("Rent a car in Pakistan for tourists: a private driver from Islamabad airport to Hunza, Skardu, Swat, Naran and Lahore. Book before you arrive.") },
  "/overseas-pakistanis": { title: "Airport Pickup for Overseas Pakistanis With Driver", description: D("Overseas Pakistanis: book a car with a professional driver before you land. Islamabad airport pickup, family trips, weddings and journeys across Pakistan.") },
  "/services/airport-transfers": { title: "Islamabad Airport Transfer With Driver", description: D("Airport transfer with a professional driver in Islamabad: pickups and drop-offs for individuals, families and groups. Call or WhatsApp for today's quote.") },
  "/services/corporate-transportation": { title: "Corporate Car Rental Islamabad With Driver", description: D("Corporate car rental in Islamabad with a professional driver: guest pickups, executive transport, staff transfers and events for companies.") },
  "/services/business-travel": { title: "Business Travel Car Rental Islamabad", description: D("Rent a car with driver for business travel in Islamabad: meetings, offices and airport transfers for executives and visiting colleagues. Call or WhatsApp.") },
  "/services/wedding-event-transportation": { title: "Wedding Car Rental in Islamabad With Driver", description: D("Wedding car rental in Islamabad with a professional driver: a presentable car for the couple, family vehicles for relatives and a Coaster for guests.") },
  "/services/chauffeur-service": { title: "Chauffeur Service Islamabad: Chauffeur Driven Cars", description: D("Chauffeur service in Islamabad: a courteous professional driver and a well-kept chauffeur driven car for every journey. Call or WhatsApp for today's quote.") },
  "/services/vip-executive-transportation": { title: "VIP and Executive Car Service Islamabad", description: D("VIP and executive car service in Islamabad: a premium vehicle with a professional driver for delegations, senior guests and protocol-style transport.") },
  "/services/group-transportation": { title: "Group Transportation With Driver: Coaster Hire", description: D("Group transportation in Pakistan: a Toyota Coaster with a professional driver for groups, families, tours, staff transport and event guests. Call or WhatsApp.") },
  "/services/premium-car-rental": { title: "Premium Car Rental Pakistan: Luxury Cars With Driver", description: D("Premium and luxury car rental in Pakistan with a professional driver: Land Cruiser, Prado and more for weddings, VIP and executive travel from Islamabad.") },
  "/cars/land-cruiser-v8": { title: "Land Cruiser V8 Rental in Islamabad With Driver", description: D("Land Cruiser V8 rental in Islamabad: rent a 2018 model in white or black with a professional driver for airports, weddings and long trips.") },
  "/cars/premium-luxury-land-cruiser": { title: "Premium Land Cruiser Rental Islamabad With Driver", description: D("Premium Land Cruiser rental in Islamabad: the 2025 model in black with a professional driver for VIP, executive and wedding travel. Call or WhatsApp.") },
  "/cars/prado": { title: "Prado Rent a Car in Islamabad: Prado With Driver", description: D("Prado rent a car in Islamabad and across Pakistan: Prado rental with a professional driver for family travel, northern areas and long trips. Photos and booking.") },
  "/cars/toyota-fortuner": { title: "Fortuner Rent a Car in Islamabad With Driver", description: D("Toyota Fortuner rental in Islamabad with a professional driver: rent a Fortuner for family trips, Murree, Naran, airport pickups and Lahore. Call or WhatsApp.") },
  "/cars/revo": { title: "Revo Rent a Car Islamabad: Hilux Revo With Driver", description: D("Toyota Hilux Revo rental in Islamabad with a professional driver: rent a Revo for northern areas, mountain roads and adventure trips. Photos and booking.") },
  "/cars/honda-civic": { title: "Honda Civic Rental in Islamabad With Driver", description: D("Honda Civic rental in Islamabad with a professional driver: rent a Civic for city travel, airport transfers and corporate trips. Photos, routes and booking.") },
  "/cars/toyota-grande": { title: "Toyota Corolla Grande Rental Islamabad With Driver", description: D("Corolla Grande rental in Islamabad with a professional driver: rent a Corolla for family travel, airport transfers and city trips. Photos, routes and booking.") },
  "/cars/coaster": { title: "Coaster Rent a Car in Islamabad With Driver", description: D("Toyota Coaster rental in Islamabad with a professional driver: Coaster hire for groups, family trips, corporate groups and events. Photos and booking.") },
  "/cars/range-rover": { title: "Range Rover Rental Pakistan: Luxury SUV With Driver", description: D("Range Rover rental in Islamabad with a professional driver: a luxury SUV for VIP and executive travel, corporate use and weddings. Photos and booking.") },
};
const cityName = (rec) => { const m = /^Car Rental in (.+?) With Driver$/.exec(rec.h1 || ""); return m ? m[1] : null; };
export function keywordOverride(rec) {
  const p = rec.path;
  if (MAP[p]) return MAP[p];
  if (rec.kind === "route") {
    const m = /^Islamabad to (.+?) Car With Driver$/.exec(rec.h1 || ""); if (!m) return null; const x = m[1];
    const rest = String(rec.description || "").replace(/^Book a car with professional driver from Islamabad or Rawalpindi to [^.]+\.\s*/, "").replace(/\s*Call or WhatsApp.*$/, "");
    let d = `Islamabad to ${x} car rental and car hire with a professional driver: rent a car for a day trip, one-way or multi-day. ${rest}`.replace(/\s+/g, " ").trim();
    if (d.length > 160) d = `Islamabad to ${x} car rental with a professional driver: rent a car for a day trip, one-way or multi-day. Call or WhatsApp for a quote.`;
    return { title: `Islamabad to ${x} Car Rental With Driver`, description: d };
  }
  if (rec.kind === "location") { const n = cityName(rec); if (n && n !== "Islamabad") return { title: `Rent a Car in ${n} With Driver` }; }
  return null;
}
