import { Link, useParams, Navigate } from "react-router-dom";
import { SITE, telHref, waHref } from "../config";
import { fleet, findCategory } from "../data/fleet";
import { serviceCards } from "../data/services";
import { useSeo } from "../seo";
import Reviews from "../components/Reviews";
import { RvRating, RvCount } from "../components/reviews/Live";
import { VehicleExtras } from "../seo/pages";
import { Crumbs } from "../seo/blocks";
import { BUSINESS } from "../business.config";
import { pageByPath } from "../seo/registry";
import { vehicleSeo } from "../seo/data/vehicleSeo";
import VehicleCarousel from "../components/automotive/VehicleCarousel";
import { useT } from "../i18n";
export function CarPage() {
  const t = useT();
  const c = findCategory(useParams().slug);
  useSeo({ title: c?.seo || "Cars", description: c?.description || "" });
  if (!c) return <Navigate to="/cars" replace />;
  const pg = pageByPath(`/cars/${c.slug}`); const X = vehicleSeo(c.slug);
  return <div className="pad">{pg && <Crumbs items={pg.breadcrumbs} />}<h1>{(X && X.name) || c.title} {t("on rent in Islamabad with professional driver")}</h1><p className="lead">{c.description}</p><VehicleCarousel key={c.slug} vehicles={c.vehicles} label={`${c.title} carousel`} />
    <p className="row"><Link className="btn btn--dark" to={`/book?car=${c.vehicles[0].id}`}>{t("Book Now")}</Link></p>
    <nav className="chips" aria-label={t("Other vehicles")}>{fleet.filter((x) => x.slug !== c.slug).map((x) => <Link key={x.slug} to={`/cars/${x.slug}`}>{x.title}</Link>)}</nav><VehicleExtras slug={c.slug} /></div>;
}
export function Services() {
  const t = useT();
  useSeo({ title: "Chauffeur & Car Rental Services in Islamabad", description: "Airport transfers, business travel, weddings, tours and more, all with a professional driver in Islamabad." });
  return <div className="pad"><h1>{t("Services")}</h1><p className="lead">{t("Every service is provided with an experienced professional driver. SAAD CAR RENTAL SERVICES is based in G-11 Markaz, Islamabad, and arranges airport transfers, business and family travel, weddings, tours and long-distance trips. Choose a service to see the vehicles, routes and how to book, or call or WhatsApp us for today's quote.")}</p><div className="svc">{serviceCards.map((s) => <article className={`svc__card svc__card--${s.tone}`} key={s.name}>
    <div className={`svc__img${s.poster ? " svc__img--poster" : ""}`}><img src={s.poster || s.img} alt={s.poster ? s.posterAlt || s.name : s.alt} width="1200" height={s.poster ? "800" : "760"} loading="lazy" decoding="async" /></div>
    <div className="svc__body"><h2>{s.name}</h2><Link to={`/services/${s.slug}`}>{t("Details & booking")} <span aria-hidden="true">→</span></Link></div></article>)}</div><p className="lead"><Link to="/services/group-transportation">{t("Group transportation with a Coaster")} →</Link></p></div>;
}
export function About() {
  const t = useT(); const A = BUSINESS.about;
  useSeo({ title: "About Us – 22 Years of Chauffeur Car Rental in Islamabad", description: `SAAD CAR RENTAL SERVICES has provided premium car rental with professional drivers in Islamabad for 22 years. Rated ${SITE.rating} on Google from ${SITE.reviewCount} reviews.` });
  const v = [["Professional Drivers", "Experienced, courteous drivers who know Islamabad and Rawalpindi, so you can relax from pickup to drop-off."], ["Premium Fleet", "Land Cruiser, Prado, Revo, Honda Civic, Toyota Grande, Range Rover and Coaster for every journey."], ["Reliable Booking", "No account and no waiting. Send your request on WhatsApp or call us directly."], ["Customer First", "Clear communication and punctual service, for business, family and events."]].map(([a, b]) => [t(a), t(b)]);
  return (<><section className="hero" style={{ minHeight: "auto", gridTemplateColumns: "1fr" }}><div className="hero__txt"><p className="eyebrow">{t("About us")}</p><h1>{t("{n} years of driving Islamabad forward.", { n: SITE.years })}</h1><p>{t("{name} provides premium car rental with professional drivers for airport transfers, business travel, weddings and private journeys.", { name: SITE.name })}</p></div></section>
    <div className="pad"><div className="stats"><div><b>{SITE.years}+</b><span>{t("Years of service")}</span></div><div><b><RvRating /></b><span>{t("Google rating")}</span></div><div><b><RvCount /></b><span>{t("Google reviews")}</span></div><div><b>{fleet.length}</b><span>{t("Vehicle categories")}</span></div></div>
      <h2 className="h2">{t("Why customers choose us")}</h2><div className="abt">{v.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
      {(A.ownerName || A.ownerStory) && <section className="sx-bio" aria-label="Our people">{A.ownerPhoto && <img src={A.ownerPhoto} alt={A.ownerName ? `${A.ownerName}, ${A.ownerRole || "SAAD CAR RENTAL SERVICES"}` : "SAAD CAR RENTAL SERVICES"} width="140" height="140" loading="lazy" />}<div><h2 className="h2">{A.ownerName ? `${A.ownerName}${A.ownerRole ? `, ${A.ownerRole}` : ""}` : "Our story"}</h2>{A.ownerStory && <p>{A.ownerStory}</p>}</div></section>}
      <h2 className="h2">How we work</h2><div className="abt">
        <div><h3>Driver included</h3><p>Every vehicle is provided with an experienced professional driver. We do not offer self-drive.</p></div>
        <div><h3>Confirmed before you travel</h3><p>We confirm the vehicle, the driver and the details of your trip with you before the day.</p></div>
        <div><h3>A clear quote</h3><p>You receive the quote before the trip. Fuel, tolls, driver stay and waiting time are agreed up front. <Link to="/guides/booking-terms-explained">See the booking terms</Link>.</p></div>
        <div><h3>Reachable by phone and WhatsApp</h3><p>Talk to our team directly at {SITE.phoneDisplay}. Our office is at {SITE.address.slice(0, 3).join(" ").replace(/,\s*$/, "")}, Islamabad.</p></div></div>
      <h2 className="h2">Who we drive</h2><ul className="sx-chips">{A.clientTypes.map((x) => <li key={x}>{x}</li>)}</ul>
      {(A.driverStandards || A.vehicleStandards || A.insurance || A.registration) && <><h2 className="h2">Safety and standards</h2><div className="abt">
        {A.driverStandards && <div><h3>Our drivers</h3><ul className="sx-list">{A.driverStandards.map((x) => <li key={x}>{x}</li>)}</ul></div>}
        {A.vehicleStandards && <div><h3>Our vehicles</h3><ul className="sx-list">{A.vehicleStandards.map((x) => <li key={x}>{x}</li>)}</ul></div>}
        {A.insurance && <div><h3>Insurance</h3><p>{A.insurance}</p></div>}
        {A.registration && <div><h3>Registration</h3><p>{A.registration}</p></div>}</div></>}
      {A.gallery && A.gallery.length > 0 && <><h2 className="h2">Our fleet, drivers and office</h2><div className="sx-gal">{A.gallery.map((g) => <img key={g.src} src={g.src} alt={g.alt} loading="lazy" width="640" height="420" />)}</div></>}
      {A.testimonials && A.testimonials.length > 0 && <><h2 className="h2">What customers say</h2>{A.testimonials.map((x) => <blockquote key={x.name + x.date} className="sx-quote"><p>{x.text}</p><cite>{x.name}{x.trip ? `, ${x.trip}` : ""}{x.date ? `, ${x.date}` : ""}</cite></blockquote>)}</>}
      <p className="lead"><Link to="/contact">{t("Contact")}</Link> · <Link to="/guides">Guides</Link> · <Link to="/faq">FAQ</Link> · <Link to="/privacy-policy">Privacy</Link> · <Link to="/terms-of-service">Terms</Link> · <Link to="/refund-policy">Refunds</Link> · <a href={SITE.reviewsUrl} target="_blank" rel="noopener noreferrer">Google reviews</a></p></div>
    <section className="dark"><p className="eyebrow">{t("Our promise")}</p><h2 className="h2">{t("Premium cars. Professional drivers. Seamless journeys.")}</h2><p>{t("For more than two decades we have helped families, executives and visitors travel comfortably across Islamabad and beyond. Every vehicle is offered with a professional driver, so your time is spent on what matters.")}</p>
      <p className="row"><Link className="btn" to="/book">{t("Book Now")}</Link><Link className="btn" to="/cars">{t("Explore Cars")}</Link></p></section><Reviews /></>);
}
