import { useState } from "react";
import { Link } from "react-router-dom";
import { SITE, telHref, waHref } from "../config";
import { fleet } from "../data/fleet";
import { useSeo } from "../seo";
import { imgSet } from "../imgset";
import { useT } from "../i18n";
import { GalleryStrip } from "../components/CarGallery";

// Which filter tab each category belongs to (add a new category slug here when you add a car in fleet.js).
const TYPE = { "land-cruiser-v8": "SUV", "premium-luxury-land-cruiser": "SUV", prado: "SUV", "range-rover": "SUV", "lexus-lx-570": "SUV", "mercedes-g-wagon": "SUV", "toyota-fortuner": "SUV", audi: "Sedan", revo: "Pickup", "honda-civic": "Sedan", "toyota-grande": "Sedan", coaster: "Van / Coaster" };
const TABS = ["All", "SUV", "Sedan", "Pickup", "Van / Coaster"];

// Swatch colour from the colour NAME in fleet.js (so the dot always matches the car it shows).
const SWATCH = [["white", "#f2f2f0"], ["black", "#17171a"], ["grey", "#8b94a0"], ["gray", "#8b94a0"], ["silver", "#c3c7cd"], ["red", "#b3262b"], ["blue", "#1f56b8"], ["plum", "#6b2d5c"], ["maroon", "#6e2a2a"], ["cream", "#efe7d3"]];
const swatch = (name = "") => (SWATCH.find(([k]) => name.toLowerCase().includes(k)) || [0, "#9aa0a8"])[1];
const label = (v) => `${v.color} ${v.name} ${v.trim}`.replace(/\s+/g, " ").trim();

function CarCard({ c }) {
  const t = useT();
  const [i, setI] = useState(0);
  const photos = c.vehicles.filter((v) => !v.placeholder);
  const v = photos[i] || null;           // the exact car shown (name + colour always match the picture)
  const first = c.vehicles[0];
  return (
    <article className="cp-card">
      <Link to={`/cars/${c.slug}`} className="cp-card__media" aria-label={`${c.title} ${t("View details")}`}>
        <span className="cp-chip">{t(TYPE[c.slug] || "Car")}</span>
        {v ? <img key={v.id} src={v.image} {...imgSet(v.image, "(max-width: 900px) 92vw, 50vw")} alt={`${label(v)} with professional driver`} width="1200" height="760" loading="lazy" decoding="async" />
           : <span className="cp-soon"><b>{c.title}</b>{t("Real photos on request")}<br />{t("Ask us on WhatsApp")}</span>}
      </Link>
      <div className="cp-card__body">
        <p className="cp-sub">{first.subtitle}</p>
        <h2><Link to={`/cars/${c.slug}`}>{c.title}</Link></h2>
        <p className="cp-desc">{c.description}</p>
        {photos.length > 1 && (
          <div className="cp-colors" role="group" aria-label={`${c.title} colours`}>
            {photos.map((p, k) => (
              <button key={p.id} type="button" className={k === i ? "on" : ""} style={{ "--sw": swatch(p.color) }} onClick={() => setI(k)} aria-pressed={k === i} aria-label={p.color} title={p.color} />
            ))}
            <span>{v ? v.color : ""}</span>
          </div>
        )}
        <GalleryStrip slug={c.slug} />
        <div className="cp-actions">
          <Link className="cp-btn cp-btn--dark" to={`/book?car=${(v || first).id}`} rel="nofollow">{t("Book now")}</Link>
          <Link className="cp-btn" to={`/cars/${c.slug}`}>{t("View details")}</Link>
        </div>
      </div>
    </article>
  );
}

export default function Cars() {
  const t = useT();
  useSeo({ title: "Our Fleet – Cars With Professional Driver", description: "Explore the SAAD CAR RENTAL SERVICES fleet in Islamabad: Land Cruiser, Lexus LX 570, Prado, Fortuner, G Wagon, Audi, Revo, Civic and more, all with a professional driver.", path: "/cars" });
  const [tab, setTab] = useState("All");
  const list = fleet.filter((c) => tab === "All" || TYPE[c.slug] === tab);
  const tabs = TABS.filter((tb) => tb === "All" || fleet.some((c) => TYPE[c.slug] === tb));
  const chat = waHref("Hello, I would like help choosing a car with driver.");
  return (
    <>
      <section className="cp-hero">
        <div className="cp-hero__in">
          <p className="eyebrow">{t("Our fleet")}</p>
          <h1>{t("Choose your ride.")}</h1>
          <p>{t("Every vehicle comes with an experienced professional driver, so you simply sit back and arrive in style.")}</p>
        </div>
      </section>
      <section className="cp-wrap">
        <div className="cp-tabs" role="tablist" aria-label={t("Vehicle type")}>
          {tabs.map((tb) => <button key={tb} role="tab" type="button" aria-selected={tab === tb} className={tab === tb ? "on" : ""} onClick={() => setTab(tb)}>{t(tb)}</button>)}
        </div>
        <div className="cp-grid">{list.map((c) => <CarCard key={c.slug} c={c} />)}</div>
        <div className="cp-cta">
          <div><h2>{t("Not sure which car suits you?")}</h2><p>{t("Tell us your trip and we will recommend the right vehicle.")}</p></div>
          <div className="cp-cta__row">
            {chat && <a className="cp-btn cp-btn--wa" href={chat} target="_blank" rel="noopener noreferrer">{t("WhatsApp us")}</a>}
            {telHref && <a className="cp-btn cp-btn--light" href={telHref}>{t("Call")} {SITE.phoneDisplay}</a>}
          </div>
        </div>
      </section>
    </>
  );
}
