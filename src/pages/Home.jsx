import { useLayoutEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE, telHref, waHref } from "../config";
import { fleet, allVehicles } from "../data/fleet";
import { useSeo } from "../seo";
import VehicleCarousel from "../components/automotive/VehicleCarousel";
import Reviews from "../components/Reviews";
import HeroShowcase from "../components/HeroShowcase";
gsap.registerPlugin(ScrollTrigger);
const featured = allVehicles.filter((v) => !v.placeholder);
// One showroom per row. To add a car later: add its images in fleet.js and put its category slug in a row here.
const ROOMS = [["Land Cruiser", ["land-cruiser-v8", "land-cruiser-tz"]], ["Prado", ["prado"]], ["Revo", ["revo"]], ["Honda Civic", ["honda-civic"]], ["Toyota Grande", ["toyota-grande"]]];
const roomCars = (slugs) => fleet.filter((c) => slugs.includes(c.slug)).flatMap((c) => c.vehicles).filter((v) => !v.placeholder);
export default function Home() {
  useSeo({ title: "Premium Car Rental With Professional Driver in Islamabad", description: "Premium car rental with professional driver in Islamabad for 22 years. Land Cruiser, Prado, Revo, Honda Civic, Toyota Grande, Range Rover and Coaster. Book via WhatsApp." });
  const hero = useRef(null);
  useLayoutEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".hero__txt > *", { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .7, ease: "power3.out", clearProps: "all" });
      gsap.to(".hero__show", { scale: 1.08, y: 30, ease: "none", scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: true } });
    }, hero);
    return () => { ctx.revert(); ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, []);
  const heroImages = useMemo(() => featured.map((v) => ({ src: v.image, alt: `${v.color} ${v.name} ${v.trim}`.trim() })), []);
  return (<>
    <section className="hero" ref={hero}><div className="hero__txt"><p className="eyebrow">{SITE.name}</p><h1>Premium Cars. Professional Drivers.</h1>
      <p>Book premium vehicles with professional drivers for business, travel, events, airport transfers and private journeys.</p>
      <div className="trust"><span><b>{SITE.years}</b> years serving Islamabad</span><span><b>{SITE.rating} ★</b> {SITE.reviewCount} Google reviews</span></div>
      <div className="row"><a className="btn btn--dark" href="#fleet">Explore Cars</a><Link className="btn" to="/book">Book Now</Link>{telHref && <a className="btn" href={telHref}>Call Now</a>}{waHref() && <a className="btn" href={waHref()} target="_blank" rel="noopener noreferrer">WhatsApp</a>}</div></div>
      <HeroShowcase images={heroImages} /></section>
    <section id="fleet" className="sec"><h2 className="h2">Explore Our Fleet</h2><p className="lead">All vehicles available with a professional driver.</p>
      {ROOMS.map(([t, slugs]) => { const vs = roomCars(slugs); return vs.length ? (<div className="showroom" key={t}><VehicleCarousel vehicles={vs} label={`${t} carousel`} /><h3><Link to={`/cars/${slugs[0]}`}>{t} with professional driver →</Link></h3></div>) : null; })}
      <div className="cats">{fleet.map((c) => (<Link className="cat" to={`/cars/${c.slug}`} key={c.slug}><img src={c.vehicles[0].image} alt={`${c.title} with professional driver`} loading="lazy" width="805" height="510" /><div><h3>{c.title}</h3><p>With professional driver →</p></div></Link>))}</div></section>
    <Reviews />
  </>);
}
