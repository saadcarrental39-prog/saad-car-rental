// One place for the special offer. Defaults come from business.config.js; the owner can switch it on/off from the admin app (Offers tab),
// which saves to /api/offer. OFFER is updated in place, and the app re-renders when it changes (see offerSync.js and main.jsx).
import { BUSINESS as B } from "./business.config";
const fmt = (n) => `Rs ${Number(n).toLocaleString("en-PK")}`;
export const rupees = fmt;
export const OFFER = { on: false, amount: 0, money: "", line: "", short: "", endsOn: null, endsText: "" };
export function setOffer(o = {}) {
  const base = B.offer || {};
  const active = typeof o.active === "boolean" ? o.active : !!base.active;
  const amount = Number.isFinite(Number(o.amountOff)) && o.amountOff !== undefined && o.amountOff !== null ? Number(o.amountOff) : base.amountOff || 0;
  const endsOn = o.endsOn !== undefined ? o.endsOn : base.endsOn || null;
  const ended = !!(endsOn && new Date(`${endsOn}T23:59:59+05:00`) < new Date());
  Object.assign(OFFER, {
    on: !!(active && amount > 0) && !ended, amount, money: fmt(amount), line: `${fmt(amount)} off per day on every vehicle`, short: `${fmt(amount)} off per day`,
    endsOn, endsText: endsOn ? new Date(`${endsOn}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "",
  });
  return OFFER;
}
setOffer();
export const afterOffer = (n) => Math.max(0, Number(n) - OFFER.amount);
export const offerMsg = () => (OFFER.on ? ` I saw your offer: ${OFFER.line}.` : "");
