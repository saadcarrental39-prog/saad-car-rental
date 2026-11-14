import { Link } from "react-router-dom";
import { OFFER } from "../offer";
import { SITE, waHref } from "../config";

// Slim strip at the very top of every page. Controlled by `offer` in business.config.js (active / amountOff / endsOn).
export default function OfferBar() {
  if (!OFFER.on) return null;
  const chat = waHref(`Hello ${SITE.name}, I would like to book with your offer: ${OFFER.line}. Pickup: Destination: Date: Passengers:`);
  return (
    <div className="offer-bar" role="region" aria-label="Special offer">
      <span className="offer-bar__tag">Special offer</span>
      <strong>{OFFER.line}</strong>
      {OFFER.endsText && <span className="offer-bar__end">until {OFFER.endsText}</span>}
      <Link to="/packages">See packages</Link>
      {chat && <a href={chat} target="_blank" rel="noopener noreferrer">Claim on WhatsApp</a>}
    </div>
  );
}
