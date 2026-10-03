export const services = ["Premium Car Rental","Chauffeur / Professional Driver Service","Airport Transfers","Business Travel","Corporate Transportation","Family Travel","Wedding / Event Transportation","Long Distance Travel","Private Tours","VIP / Executive Transportation","Hotel Transfers","Islamabad / Rawalpindi Transportation","Customized Travel Arrangements"];

// Services page cards: each service gets its own photo from your fleet. To use your own photo, put it in
// public/assets/services/ and change `img` (e.g. "/assets/services/airport.webp"). tone: "light" | "dark" | "grey"
const V = (f) => `/assets/vehicles/${f}.webp`;
// Poster images are picked up automatically from src/assets/services/<slug>.(webp|jpg|png). See README.txt there.
const found = import.meta.glob("../assets/services/*.{webp,jpg,jpeg,png}", { eager: true, query: "?url", import: "default" });
const poster = (slug) => Object.entries(found).find(([k]) => k.split("/").pop().replace(/\.[^.]+$/, "") === slug)?.[1] || null;
const cards = [
  { slug: "premium-car-rental", name: "Premium Car Rental", img: V("land-cruiser-v8-white"), tone: "light", alt: "Pearl White Land Cruiser V8" },
  { slug: "chauffeur-service", name: "Chauffeur / Professional Driver Service", img: V("grande-x-black"), tone: "dark", alt: "Black Toyota Grande with chauffeur service", posterAlt: "Uniformed SAAD chauffeur beside a black luxury sedan" },
  { slug: "airport-transfers", name: "Airport Transfers", img: V("prado-white"), tone: "light", alt: "White Prado for airport transfers", posterAlt: "Chauffeur with a black Land Cruiser at the airport departures with a private jet behind" },
  { slug: "business-travel", name: "Business Travel", img: V("corolla-altis-silver"), tone: "grey", alt: "Silver Corolla Altis for business travel", posterAlt: "Black Land Cruiser at the airport with a businessman walking to a private jet" },
  { slug: "corporate-transportation", name: "Corporate Transportation", img: V("civic-rs-black"), tone: "dark", alt: "Black Honda Civic RS for corporate transport" },
  { slug: "family-travel", name: "Family Travel", img: V("prado-black"), tone: "dark", alt: "Black Prado for family travel" },
  { slug: "wedding-event-transportation", name: "Wedding / Event Transportation", img: V("civic-rs-white"), tone: "light", alt: "White Honda Civic RS for weddings and events" },
  { slug: "long-distance-travel", name: "Long Distance Travel", img: V("land-cruiser-grey"), tone: "grey", alt: "Grey Land Cruiser for long distance travel" },
  { slug: "private-tours", name: "Private Tours", img: V("revo-blue"), tone: "light", alt: "Blue Hilux Revo for private tours" },
  { slug: "vip-executive-transportation", name: "VIP / Executive Transportation", img: V("land-cruiser-tz-black"), tone: "dark", alt: "Black Land Cruiser TZ for VIP and executive transport" },
  { slug: "hotel-transfers", name: "Hotel Transfers", img: V("grande-plum"), tone: "light", alt: "Plum Toyota Grande for hotel transfers" },
  { slug: "islamabad-rawalpindi-transportation", name: "Islamabad / Rawalpindi Transportation", img: V("civic-silver"), tone: "grey", alt: "Silver Honda Civic for city transportation" },
  { slug: "customized-travel", name: "Customized Travel Arrangements", img: V("prado-red"), tone: "light", alt: "Red Prado for customised travel" },
];
export const serviceCards = cards.map((c) => ({ ...c, poster: poster(c.slug) }));
