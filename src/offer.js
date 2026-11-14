// One place for the special offer (set in business.config.js). Everything on the site that mentions the offer reads from here.
import { BUSINESS as B } from "./business.config";
const o = B.offer || {};
const fmt = (n) => `Rs ${Number(n).toLocaleString("en-PK")}`;
const ended = !!(o.endsOn && new Date(`${o.endsOn}T23:59:59+05:00`) < new Date());
export const OFFER = {
  on: !!(o.active && o.amountOff > 0) && !ended,
  amount: o.amountOff || 0,
  money: fmt(o.amountOff || 0),
  line: `${fmt(o.amountOff || 0)} off per day on every vehicle`,
  short: `${fmt(o.amountOff || 0)} off per day`,
  endsOn: o.endsOn || null,
  endsText: o.endsOn ? new Date(`${o.endsOn}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "",
};
export const afterOffer = (n) => Math.max(0, Number(n) - OFFER.amount);
export const rupees = fmt;
export const offerMsg = () => (OFFER.on ? ` I saw your offer: ${OFFER.line}.` : "");
