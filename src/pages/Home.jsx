import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { SITE, telHref, waHref } from "../config";
import { fleet, allVehicles } from "../data/fleet";
import { useSeo } from "../seo";
import VehicleCarousel from "../components/automotive/VehicleCarousel";
import Reviews from "../components/Reviews";
import { RvRating, RvCount } from "../components/reviews/Live";
import HeroShowcase from "../components/HeroShowcase";
import HomeBooking from "../components/HomeBooking";
import { HomeSeoSections } from "../seo/pages";
import { imgSet, CARD_SIZES } from "../imgset";
const featured = allVehicles.filter((v) => !v.placeholder);
// One showroom per row. To add a car later: add its images in fleet.js and put its category slug in a row here.
const ROOMS = [["Land Cruiser", ["land-cruiser-v8", "land-cruiser-tz"]], ["Prado", ["prado"]], ["Revo", ["revo"]], ["Honda Civic", ["honda-civic"]], ["Toyota Grande", ["toyota-grande"]]];
const roomCars = (slugs) => fleet.filter((c) => slugs.includes(c.slug)).flatMap((c) => c.vehicles).filter((v) => !v.placeholder);
export default function Home() {
  useSeo();
  const hero = useRef(null);
  useEffect(() => { // gentle scroll effect on the hero picture. GSAP is downloaded AFTER the page is already visible and usable.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx, dead = false;
    const start = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (dead) return; gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => { gsap.to(".hero__show", { scale: 1.08, y: 30, ease: "none", scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: true } }); }, hero);
    };
    const t = "requestIdleCallback" in window ? requestIdleCallback(start, { timeout: 3000 }) : setTimeout(start, 1500);
    return () => { dead = true; ctx?.revert(); if ("cancelIdleCallback" in window) cancelIdleCallback(t); else clearTimeout(t); };
  }, []);
  const heroImages = useMemo(() => featured.map((v) => ({ src: v.image, alt: `${v.color} ${v.name} ${v.trim}`.trim() })), []);
  return (<>
    <section className="hero" ref={hero}><div className="hero__txt"><p className="eyebrow">{SITE.name}</p><h1>Car Rental in Islamabad With Professional Driver</h1>
      <p className="hero__tag">Premium cars. Professional drivers.</p><p>Book premium vehicles with professional drivers for business, travel, events, airport transfers and private journeys.</p>
      <div className="trust"><span><b>{SITE.years}</b> years serving Islamabad</span><span><b><RvRating /> ★</b> <RvCount /> Google reviews</span></div>
      <div className="row"><a className="btn btn--dark" href="#fleet">Explore Cars</a><Link className="btn" to="/book">Book Now</Link>{telHref && <a className="btn" href={telHref}>Call Now</a>}{waHref() && <a className="btn" href={waHref()} target="_blank" rel="noopener noreferrer">WhatsApp</a>}</div></div>
      <HeroShowcase images={heroImages} /></section>
    <HomeBooking />
    <section id="fleet" className="sec"><h2 className="h2">Explore Our Fleet</h2><p className="lead">All vehicles available with a professional driver.</p>
      {[...ROOMS, ...fleet.filter((c) => !ROOMS.some(([, s]) => s.includes(c.slug))).map((c) => [c.title, [c.slug]])].map(([t, slugs]) => { const vs = roomCars(slugs); return vs.length ? (<div className="showroom" key={t}><VehicleCarousel vehicles={vs} label={`${t} carousel`} /><h3><Link to={`/cars/${slugs[0]}`}>{t} with professional driver →</Link></h3></div>) : null; })}
      <div className="cats">{fleet.map((c) => (<Link className="cat" to={`/cars/${c.slug}`} key={c.slug}><img src={c.vehicles[0].image} {...imgSet(c.vehicles[0].image, CARD_SIZES)} alt={`${c.title} with professional driver`} loading="lazy" width="805" height="510" /><div><h3>{c.title}</h3><p>With professional driver →</p></div></Link>))}</div></section>
    <HomeSeoSections />
    <Reviews />
  </>);
}
