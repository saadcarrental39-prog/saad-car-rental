export const services = ["Premium Car Rental","Chauffeur / Professional Driver Service","Airport Transfers","Business Travel","Corporate Transportation","Family Travel","Wedding / Event Transportation","Long Distance Travel","Private Tours","VIP / Executive Transportation","Hotel Transfers","Islamabad / Rawalpindi Transportation","Customized Travel Arrangements"];

// Services page cards: each service gets its own photo from your fleet. To use your own photo, put it in
// public/assets/services/ and change `img` (e.g. "/assets/services/airport.webp"). tone: "light" | "dark" | "grey"
const V = (f) => `/assets/vehicles/${f}.webp`;
export const serviceCards = [
  { name: "Premium Car Rental", img: V("land-cruiser-v8-white"), tone: "light", alt: "Pearl White Land Cruiser V8" },
  { name: "Chauffeur / Professional Driver Service", img: V("grande-x-black"), tone: "dark", alt: "Black Toyota Grande with chauffeur service" },
  { name: "Airport Transfers", img: V("prado-white"), tone: "light", alt: "White Prado for airport transfers" },
  { name: "Business Travel", img: V("corolla-altis-silver"), tone: "grey", alt: "Silver Corolla Altis for business travel" },
  { name: "Corporate Transportation", img: V("civic-rs-black"), tone: "dark", alt: "Black Honda Civic RS for corporate transport" },
  { name: "Family Travel", img: V("prado-black"), tone: "dark", alt: "Black Prado for family travel" },
  { name: "Wedding / Event Transportation", img: V("civic-rs-white"), tone: "light", alt: "White Honda Civic RS for weddings and events" },
  { name: "Long Distance Travel", img: V("land-cruiser-grey"), tone: "grey", alt: "Grey Land Cruiser for long distance travel" },
  { name: "Private Tours", img: V("revo-blue"), tone: "light", alt: "Blue Hilux Revo for private tours" },
  { name: "VIP / Executive Transportation", img: V("land-cruiser-tz-black"), tone: "dark", alt: "Black Land Cruiser TZ for VIP and executive transport" },
  { name: "Hotel Transfers", img: V("grande-plum"), tone: "light", alt: "Plum Toyota Grande for hotel transfers" },
  { name: "Islamabad / Rawalpindi Transportation", img: V("civic-silver"), tone: "grey", alt: "Silver Honda Civic for city transportation" },
  { name: "Customized Travel Arrangements", img: V("prado-red"), tone: "light", alt: "Red Prado for customised travel" },
];
