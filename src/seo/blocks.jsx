// Small, SSR-safe building blocks for the SEO pages (no browser APIs: they are rendered to static HTML at build time).
import { Link, useLocation } from "react-router-dom";
import { imagesOf, Pic } from "./media";
import { thumbOf } from "./data/pageMeta";
import { PageBoost } from "./boost";
import { SITE, telHref, waHref } from "../config";
import { photoOf } from "./links";
import { VEHICLE_PITCH, VEHICLE_FIT, USE } from "./data/vehicles";
import { imgSet } from "../imgset";
import { useT } from "../i18n";
import { BUSINESS as B } from "../business.config";
import { rs } from "./data/vehicleFacts";

export const Crumbs = ({ items }) => { const t = useT(); return items.length < 2 ? null : (
  <nav className="sx-crumbs" aria-label={t("Breadcrumb")}><ol>{items.map((c, i) => <li key={c.path}>{i < items.length - 1 ? <Link to={c.path}>{t(c.name)}</Link> : <span aria-current="page">{t(c.name)}</span>}</li>)}</ol></nav>
); };

export const Hero = ({ eyebrow, h1, lead, crumbs, children }) => {
  const im = imagesOf(useLocation().pathname)[0];
  return (
    <section className={`sx-hero${im ? " sx-hero--img" : ""}`}><div className={`sx-in${im ? " sx-hero__grid" : ""}`}>
      <div className="sx-hero__text">
        {crumbs && <Crumbs items={crumbs} />}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{h1}</h1>
        {lead && <p className="sx-lead">{lead}</p>}
        {children}
      </div>
      {im && <Pic im={im} eager sizes="(max-width: 900px) 92vw, 520px" className="px-fig px-fig--hero" />}
    </div></section>
  );
};

// "Call now / WhatsApp now / Get a quote" (Call and WhatsApp use the number from business.config.js)
export function Cta({ ctx, from, to, title = "Get today's availability and quote", text = "Tell us your pickup, destination, date and vehicle preference. We reply with a quote, never a fake instant price.", car, svc }) {
  const t = useT();
  const msg = `Hello ${SITE.name}, I would like a quote for a car with driver${ctx ? ` (${ctx})` : ""}. Pickup: ${from || ""} Destination: ${to || ""} Date: Passengers:`;
  const q = [from && `from=${encodeURIComponent(from)}`, to && `to=${encodeURIComponent(to)}`, car && `car=${encodeURIComponent(car)}`, svc && `svc=${svc}`].filter(Boolean).join("&");
  const chat = waHref(msg);
  return (
    <><PageBoost />
    <section className="sx-cta" aria-label={t("Contact and booking")}><div className="sx-in">
      <div><h2>{t(title)}</h2><p>{t(text)}</p></div>
      <div className="sx-cta__row">
        {telHref && <a className="sx-btn sx-btn--call" href={telHref}>{t("Call now")} · {SITE.phoneDisplay}</a>}
        {chat && <a className="sx-btn sx-btn--wa" href={chat} target="_blank" rel="noopener noreferrer">{t("WhatsApp now")}</a>}
        <Link className="sx-btn sx-btn--quote" to={`/book${q ? `?${q}` : ""}`} rel={q ? "nofollow" : undefined}>{t("Get a quote")}</Link>
      </div>
    </div></section></>
  );
}

export const Answer = ({ q, children }) => (
  <aside className="sx-answer"><p className="sx-answer__q">{q}</p><p>{children}</p></aside>
);

export const Sec = ({ id, title, children, tone }) => (
  <section className={`sx-sec${tone ? ` sx-sec--${tone}` : ""}`} aria-labelledby={id}><div className="sx-in"><h2 id={id}>{title}</h2>{children}</div></section>
);

export const Faq = ({ items, title = "Frequently asked questions" }) => { const t = useT(); return !items || !items.length ? null : (
  <Sec id="faq" title={t(title)}>
    <div className="sx-faq">{items.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
  </Sec>
); };

export const Chips = ({ items }) => <ul className="sx-chips">{items.map((x) => <li key={x}>{x}</li>)}</ul>;
export const Bullets = ({ items }) => <ul className="sx-list">{items.map((x) => <li key={x}>{x}</li>)}</ul>;

export const LinkCards = ({ items }) => (
  <ul className="sx-cards">{items.map((i) => { const th = thumbOf(i.to); return <li key={i.to}><Link to={i.to}>{th && <img className="px-thumb" src={th} alt="" width="480" height="252" loading="lazy" decoding="async" />}<b>{i.title}</b>{i.text && <span>{i.text}</span>}<em aria-hidden="true">→</em></Link></li>; })}</ul>
);

export const VehicleStrip = ({ cats, ctxTo }) => (
  <ul className="sx-veh">{cats.map((c) => {
    const ph = photoOf(c); const fit = (VEHICLE_FIT[c.slug] || []).slice(0, 3).map((u) => USE[u]).join(" · ");
    return (
      <li key={c.slug}><Link to={`/cars/${c.slug}`}>
        {ph ? <img src={ph.image} {...imgSet(ph.image, "(max-width: 700px) 90vw, 360px")} alt={`${ph.color} ${ph.name} ${ph.trim} with professional driver`.replace(/\s+/g, " ")} width="805" height="510" loading="lazy" decoding="async" /> : <span className="sx-veh__ph">Real photos on request<br />Ask us on WhatsApp</span>}
        <b>{c.title}</b><span>{VEHICLE_PITCH[c.slug] ? VEHICLE_PITCH[c.slug].replace(/^a /, "A ").replace(/^an /, "An ") : ""}</span><em>{fit}</em>
      </Link></li>
    );
  })}</ul>
);

export const Steps = ({ items }) => { const t = useT(); return <ol className="sx-steps">{items.map((s) => <li key={s[0]}><b>{t(s[0])}</b><span>{t(s[1])}</span></li>)}</ol>; };
export const BOOKING_STEPS = [
  ["1. Tell us your trip", "Pickup, destination, date, time and number of passengers, by WhatsApp, phone or the Book Now form."],
  ["2. We confirm", "We confirm the vehicle and driver for your date and send you a clear quote before you travel. Where a daily rent is listed on a car we show it; every final price depends on your route, days and requirements."],
  ["3. Your driver arrives", "A professional driver collects you at the agreed place and time, and stays with you for the booking."],
];

// "Last updated" line (date comes from business.config.js: change it when you review the content).
export const Updated = ({ date = B.contentUpdated }) => { const d = new Date(`${date}T00:00:00Z`); const txt = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }); return <p className="sx-updated">Last updated: <time dateTime={date}>{txt}</time> · {B.businessName}</p>; };

// Simple data table (scrolls sideways on phones instead of breaking the page).
export const DataTable = ({ head, rows }) => (
  <div className="sx-tablewrap"><table className="sx-table"><thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody></table></div>
);

// Price guide. Shows only numbers the owner supplied (listed rent on the car, or `pricing` in business.config.js); otherwise explains how the quote is built.
export function PriceGuide({ name, rates = [] }) {
  const pr = B.pricing || {};
  const lines = [pr.localFromPerDay && ["Local (Islamabad / Rawalpindi)", `from ${rs(pr.localFromPerDay)} per day`], pr.outOfStationFromPerDay && ["Out of Station", `from ${rs(pr.outOfStationFromPerDay)} per day`], pr.airportFrom && ["Airport pickup or drop", `from ${rs(pr.airportFrom)}`]].filter(Boolean);
  return (<>
    {rates.length > 0 && <p><b>Local rent{name ? ` for the ${name}` : ""}: {rates.map(rs).join(" to ")} per day</b> with a professional driver. Out of Station trips are priced separately.</p>}
    {lines.length > 0 && <DataTable head={["Service", "Starting price"]} rows={lines} />}
    <p>The final quote depends on four things: whether the booking is <Link to="/local-car-rental-islamabad">Local</Link> or <Link to="/out-of-station-car-rental">Out of Station</Link>, the route and number of days, the vehicle, and any extras such as waiting time or an overnight driver stay. You always receive the quote before you travel.</p>
    <p>{pr.included ? <><b>Included:</b> {pr.included}. </> : null}{pr.notIncluded ? <><b>Not included:</b> {pr.notIncluded}. </> : null}{!pr.included && !pr.notIncluded ? "What is included and what is extra is written in your quote. " : null}<Link to="/guides/booking-terms-explained">Booking terms explained →</Link> · <Link to="/guides/car-rental-with-driver-islamabad-rates">How pricing works →</Link></p>
  </>);
}
