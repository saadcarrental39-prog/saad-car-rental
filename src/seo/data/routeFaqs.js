// FAQs of a route page. Used by the page (visible) AND by the SEO registry (FAQPage schema), so both always match.
import { BUSINESS as B } from "../../business.config";
import { TERRAIN } from "./vehicles";
export const routeFaqs = (p) => [
  { q: `Can I hire a car with driver from Islamabad to ${p.name}?`, a: `Yes. We provide a car with professional driver from Islamabad or Rawalpindi to ${p.name}, one-way, as a round trip or as part of a multi-day booking.` },
  { q: `How much does the Islamabad to ${p.name} trip cost?`, a: `The price depends on the vehicle, the number of days and your requirements, so we quote each trip. Call ${B.phoneDisplay} or WhatsApp us for today's quote.` },
  { q: `Can you pick me up from Rawalpindi for the ${p.name} trip?`, a: `Yes. Pickup is arranged from Islamabad or Rawalpindi. Tell us the address when you book.` },
  { q: `Can the driver wait for me in ${p.name}?`, a: `Yes. Tell us how long you need the driver in ${p.name} and we plan the booking around it.` },
  { q: `Which vehicle should I choose for ${p.name}?`, a: `${TERRAIN[p.terrain].advice} Tell us your group size and luggage and we will confirm the best choice for your date.` },
];
