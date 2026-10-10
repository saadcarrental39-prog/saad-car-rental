// Small, SSR-safe building blocks for the SEO pages (no browser APIs: they are rendered to static HTML at build time).
import { Link } from "react-router-dom";
import { SITE, telHref, waHref } from "../config";
import { photoOf } from "./links";
import { VEHICLE_PITCH, VEHICLE_FIT, USE } from "./data/vehicles";
import { imgSet } from "../imgset";

export const Crumbs = ({ items }) => items.length < 2 ? null : (
  <nav className="sx-crumbs" aria-label="Breadcrumb"><ol>{items.map((c, i) => <li key={c.path}>{i < items.length - 1 ? <Link to={c.path}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}</li>)}</ol></nav>
);

export const Hero = ({ eyebrow, h1, lead, crumbs, children }) => (
  <section className="sx-hero"><div className="sx-in">
    {crumbs && <Crumbs items={crumbs} />}
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h1>{h1}</h1>
    {lead && <p className="sx-lead">{lead}</p>}
    {children}
  </div></section>
);

// "Call now / WhatsApp now / Get a quote" (Call and WhatsApp use the number from business.config.js)
export function Cta({ ctx, from, to, title = "Get today's availability and quote", text = "Tell us your pickup, destination, date and vehicle preference. We reply with a quote, never a fake instant price.", car }) {
  const msg = `Hello ${SITE.name}, I would like a quote for a car with driver${ctx ? ` (${ctx})` : ""}. Pickup: ${from || ""} Destination: ${to || ""} Date: Passengers:`;
  const q = [from && `from=${encodeURIComponent(from)}`, to && `to=${encodeURIComponent(to)}`, car && `car=${encodeURIComponent(car)}`].filter(Boolean).join("&");
  const chat = waHref(msg);
  return (
    <section className="sx-cta" aria-label="Contact and booking"><div className="sx-in">
      <div><h2>{title}</h2><p>{text}</p></div>
      <div className="sx-cta__row">
        {telHref && <a className="sx-btn sx-btn--call" href={telHref}>Call now · {SITE.phoneDisplay}</a>}
        {chat && <a className="sx-btn sx-btn--wa" href={chat} target="_blank" rel="noopener noreferrer">WhatsApp now</a>}
        <Link className="sx-btn sx-btn--quote" to={`/book${q ? `?${q}` : ""}`}>Get a quote</Link>
      </div>
    </div></section>
  );
}

export const Answer = ({ q, children }) => (
  <aside className="sx-answer"><p className="sx-answer__q">{q}</p><p>{children}</p></aside>
);

export const Sec = ({ id, title, children, tone }) => (
  <section className={`sx-sec${tone ? ` sx-sec--${tone}` : ""}`} aria-labelledby={id}><div className="sx-in"><h2 id={id}>{title}</h2>{children}</div></section>
);

export const Faq = ({ items, title = "Frequently asked questions" }) => !items || !items.length ? null : (
  <Sec id="faq" title={title}>
    <div className="sx-faq">{items.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
  </Sec>
);

export const Chips = ({ items }) => <ul className="sx-chips">{items.map((x) => <li key={x}>{x}</li>)}</ul>;
export const Bullets = ({ items }) => <ul className="sx-list">{items.map((x) => <li key={x}>{x}</li>)}</ul>;

export const LinkCards = ({ items }) => (
  <ul className="sx-cards">{items.map((i) => <li key={i.to}><Link to={i.to}><b>{i.title}</b>{i.text && <span>{i.text}</span>}<em aria-hidden="true">→</em></Link></li>)}</ul>
);

export const VehicleStrip = ({ cats, ctxTo }) => (
  <ul className="sx-veh">{cats.map((c) => {
    const ph = photoOf(c); const fit = (VEHICLE_FIT[c.slug] || []).slice(0, 3).map((u) => USE[u]).join(" · ");
    return (
      <li key={c.slug}><Link to={`/cars/${c.slug}`}>
        {ph ? <img src={ph.image} {...imgSet(ph.image, "(max-width: 700px) 90vw, 360px")} alt={`${ph.color} ${ph.name} ${ph.trim} with professional driver`.replace(/\s+/g, " ")} width="805" height="510" loading="lazy" decoding="async" /> : <span className="sx-veh__ph">Photo coming soon<br />Available on request</span>}
        <b>{c.title}</b><span>{VEHICLE_PITCH[c.slug] ? VEHICLE_PITCH[c.slug].replace(/^a /, "A ").replace(/^an /, "An ") : ""}</span><em>{fit}</em>
      </Link></li>
    );
  })}</ul>
);

export const Steps = ({ items }) => <ol className="sx-steps">{items.map((s, i) => <li key={s[0]}><b>{s[0]}</b><span>{s[1]}</span></li>)}</ol>;
export const BOOKING_STEPS = [
  ["1. Tell us your trip", "Pickup, destination, date, time and number of passengers, by WhatsApp, phone or the Book Now form."],
  ["2. We confirm", "We confirm the vehicle and driver for your date and send you a quote. No online prices are shown because every trip is different."],
  ["3. Your driver arrives", "A professional driver collects you at the agreed place and time, and stays with you for the booking."],
];
