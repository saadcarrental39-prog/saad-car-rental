// Facts shown on every car page (quick-facts table, price guide, specific FAQs). Everything comes from files the owner already controls:
// fleet.js (colours, listed rent), details.js (typical seats), vehicles.js (use cases, terrain) and business.config.js (price ranges, if set).
// Nothing is invented: when a value is unknown the page says "confirmed when you book".
import { baseFleet } from "../../data/fleet";
import { DETAILS } from "../../data/details";
import { TERRAIN, VEHICLE_FIT, USE } from "./vehicles";
import { BUSINESS as B } from "../../business.config";

export const rs = (n) => `Rs ${Number(n).toLocaleString("en-PK")}`;
export const cat = (slug) => baseFleet.find((c) => c.slug === slug);

export const seatsOf = (c) => { const v = c.vehicles.find((x) => DETAILS[x.id]); const s = v && DETAILS[v.id].seats; return s && !/ask/i.test(s) ? s : null; };
export const ratesOf = (c) => [...new Set(c.vehicles.map((v) => v.price).filter(Boolean))].sort((a, b) => a - b);
export const coloursOf = (c) => [...new Set(c.vehicles.filter((v) => !v.placeholder).map((v) => v.color).filter((x) => x && !/request/i.test(x)))];
export const roadsOf = (slug) => {
  if (TERRAIN.extreme.vehicles.includes(slug) && ["revo"].includes(slug)) return { key: "rough", text: "City, motorway, hill, mountain and rough 4x4 routes" };
  if (TERRAIN.mountain.vehicles.includes(slug)) return { key: "mountain", text: "City, motorway, hill and main mountain roads" };
  if (TERRAIN.hills.vehicles.includes(slug)) return { key: "hills", text: "City, motorway and hill roads" };
  return { key: "paved", text: "City streets and motorways (best kept to paved roads)" };
};
const seatsLower = (s) => s.replace(/^Up to /i, "up to ");

export function factRows(c) {
  const rows = []; const seats = seatsOf(c); const col = coloursOf(c); const fit = (VEHICLE_FIT[c.slug] || []).slice(0, 4).map((u) => USE[u]);
  rows.push(["Vehicle", c.title]);
  if (c.vehicles[0] && c.vehicles[0].subtitle) rows.push(["Type", c.vehicles[0].subtitle.replace(/^\d{4} Model · /, "")]);
  rows.push(["Seats", seats ? `Typically ${seatsLower(seats)} passengers` : "Confirmed when you book"]);
  rows.push(["Luggage", "Depends on how many passengers travel. Tell us your bags and we confirm the fit"]);
  if (col.length) rows.push(["Colours", col.join(", ")]);
  rows.push(["Driver", "Professional driver included with every booking"]);
  rows.push(["Roads", roadsOf(c.slug).text]);
  if (fit.length) rows.push(["Best for", fit.join(", ")]);
  return rows;
}

// Four to five specific questions per car (seats and luggage, price, mountain use, driver stay, payment and cancellation).
export function vehicleFaqs(c, nm, hasPriceFaq) {
  const seats = seatsOf(c); const rates = ratesOf(c); const r = roadsOf(c.slug); const out = [];
  out.push({ q: `How many passengers and how much luggage does the ${nm} take?`, a: seats ? `Our ${nm} typically seats ${seatsLower(seats)} passengers. Luggage space depends on how many people travel, so tell us your group size and bags when you book and we confirm the fit or suggest a larger vehicle.` : `Seating and luggage for the ${nm} are confirmed when you book. Tell us how many people and bags are travelling and we confirm that this vehicle fits, or suggest another one.` });
  if (!hasPriceFaq) {
    const pr = B.pricing || {};
    const lines = [pr.localFromPerDay && `Local service from ${rs(pr.localFromPerDay)} per day`, pr.outOfStationFromPerDay && `Out of Station from ${rs(pr.outOfStationFromPerDay)} per day`].filter(Boolean);
    out.push({ q: `How much does the ${nm} with driver cost?`, a: rates.length ? `The listed rent for the ${nm} is ${rates.map(rs).join(" to ")} per day with a professional driver. The final quote also depends on Local or Out of Station use, the route and the number of days.` : `We quote the ${nm} per trip, because the price depends on Local or Out of Station use, the route, the number of days and any extras.${lines.length ? ` ${lines.join("; ")}.` : ""} Send your plan on WhatsApp and you receive a clear quote before you travel.` });
  }
  out.push({ q: `Is the ${nm} suitable for mountain roads, Murree and the northern areas?`, a: r.key === "rough" ? `Yes. The ${nm} is one of our choices for hill, mountain and rougher 4x4 routes. Tell us your route and season and we confirm that it suits your road.` : r.key === "mountain" ? `Yes, on the main hill and mountain routes such as Murree, Naran, Swat and the Karakoram Highway. For rough or snowy stretches we may suggest a Revo or another 4x4, and we tell you honestly which vehicle suits your road.` : r.key === "hills" ? `It is fine for hill roads in normal conditions. In winter, when snow or ice is possible, or for rough mountain tracks, we suggest a 4x4 instead and tell you before you book.` : `The ${nm} is best kept to city streets, airport runs and motorway journeys. For Murree in snow or for the northern areas we suggest a Prado, Land Cruiser or Revo.` });
  out.push({ q: `Is the driver's food and overnight stay included on multi-day trips with the ${nm}?`, a: `For multi-day bookings we write down in your quote whether driver meals and overnight stay are included or charged as a daily allowance, so there is no surprise on the road. Ask us before you confirm.` });
  out.push({ q: `Is advance payment required for the ${nm}, and what is the cancellation policy?`, a: `Advance payment and cancellation terms for your ${nm} booking are confirmed in your quote. The general rules are on our Refund and Cancellation Policy page.` });
  return out;
}

// Three similar cars: the ones that share the most use cases with this one.
export function similarCars(slug) {
  const mine = new Set(VEHICLE_FIT[slug] || []);
  return baseFleet.filter((c) => c.slug !== slug && c.vehicles.some((v) => !v.placeholder))
    .map((c) => ({ c, n: (VEHICLE_FIT[c.slug] || []).filter((u) => mine.has(u)).length }))
    .sort((a, b) => b.n - a.n).slice(0, 3).map((x) => x.c);
}
