import { Link, useParams, Navigate } from "react-router-dom";
import { SITE, telHref, waHref } from "../config";
import { fleet, findCategory } from "../data/fleet";
import { services } from "../data/services";
import { useSeo } from "../seo";
import Reviews from "../components/Reviews";
import VehicleCarousel from "../components/automotive/VehicleCarousel";
export function Cars() {
  useSeo({ title: "Our Fleet – Cars With Professional Driver", description: "Explore the SAAD CAR RENTAL SERVICES fleet in Islamabad, all available with a professional driver.", path: "/cars" });
  return <div className="pad"><h1>Our Fleet</h1><div className="grid">{fleet.map((c) => <Link key={c.slug} to={`/cars/${c.slug}`} className="card"><h2>{c.title}</h2><p>{c.description}</p><span>View →</span></Link>)}</div></div>;
}
export function CarPage() {
  const c = findCategory(useParams().slug);
  useSeo({ title: c?.seo || "Cars", description: c?.description || "", path: `/cars/${c?.slug}` });
  if (!c) return <Navigate to="/cars" replace />;
  return <div className="pad"><h1>{c.title} – With Professional Driver</h1><p className="lead">{c.description}</p><VehicleCarousel key={c.slug} vehicles={c.vehicles} label={`${c.title} carousel`} />
    <p className="row"><Link className="btn btn--dark" to={`/book?car=${c.vehicles[0].id}`}>Book Now</Link></p>
    <nav className="chips" aria-label="Other vehicles">{fleet.filter((x) => x.slug !== c.slug).map((x) => <Link key={x.slug} to={`/cars/${x.slug}`}>{x.title}</Link>)}</nav></div>;
}
export function Services() {
  useSeo({ title: "Chauffeur & Car Rental Services in Islamabad", description: "Airport transfers, business travel, weddings, tours and more, all with a professional driver in Islamabad.", path: "/services" });
  return <div className="pad"><h1>Services</h1><div className="grid">{services.map((s) => <div className="card" key={s}><h2>{s}</h2><Link to="/book">Book Now →</Link></div>)}</div></div>;
}
export function About() {
  useSeo({ title: "About Us – 22 Years of Chauffeur Car Rental in Islamabad", description: "SAAD CAR RENTAL SERVICES has provided premium car rental with professional drivers in Islamabad for 22 years. Rated 5.0 on Google from 211 reviews.", path: "/about" });
  const v = [["Professional Drivers", "Experienced, courteous drivers who know Islamabad and Rawalpindi, so you can relax from pickup to drop-off."], ["Premium Fleet", "Land Cruiser, Prado, Revo, Honda Civic, Toyota Grande, Range Rover and Coaster for every journey."], ["Reliable Booking", "No account and no waiting. Send your request on WhatsApp or call us directly."], ["Customer First", "Clear communication and punctual service, for business, family and events."]];
  return (<><section className="hero" style={{ minHeight: "auto", gridTemplateColumns: "1fr" }}><div className="hero__txt"><p className="eyebrow">About us</p><h1>{SITE.years} years of driving Islamabad forward.</h1><p>{SITE.name} provides premium car rental with professional drivers for airport transfers, business travel, weddings and private journeys.</p></div></section>
    <div className="pad"><div className="stats"><div><b>{SITE.years}+</b><span>Years of service</span></div><div><b>{SITE.rating}</b><span>Google rating</span></div><div><b>{SITE.reviewCount}</b><span>Google reviews</span></div><div><b>8</b><span>Vehicle categories</span></div></div>
      <h2 className="h2">Why customers choose us</h2><div className="abt">{v.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}</div></div>
    <section className="dark"><p className="eyebrow">Our promise</p><h2 className="h2">Premium cars. Professional drivers. Seamless journeys.</h2><p>For more than two decades we have helped families, executives and visitors travel comfortably across Islamabad and beyond. Every vehicle is offered with a professional driver, so your time is spent on what matters.</p>
      <p className="row"><Link className="btn" to="/book">Book Now</Link><Link className="btn" to="/cars">Explore Cars</Link></p></section><Reviews /></>);
}
export function Contact() {
  useSeo({ title: "Contact", description: "Contact SAAD CAR RENTAL SERVICES, G-11 Markaz, Islamabad. Call, WhatsApp or book online.", path: "/contact" });
  return <div className="pad narrow"><h1>Contact</h1><p><strong>{SITE.phoneDisplay}</strong></p><address>{SITE.name}<br />{SITE.address.map((l) => <span key={l}>{l}<br /></span>)}</address>
    <p className="row"><a className="btn btn--dark" href={SITE.maps} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>{telHref && <a className="btn" href={telHref}>Call Now</a>}{waHref() && <a className="btn" href={waHref()} target="_blank" rel="noopener noreferrer">WhatsApp</a>}<Link className="btn" to="/book">Book Now</Link></p>
    <iframe className="map" title="SAAD CAR RENTAL SERVICES location" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Shah+Nawaz+Plaza+G-11+Markaz+Islamabad&output=embed" /></div>;
}
