import { Component, useEffect, useState } from "react";
import { Routes, Route, Link, NavLink, useLocation } from "react-router-dom";
import { SITE, telHref, waHref } from "./config";
import Home from "./pages/Home";
import BookingModal from "./components/BookingModal";
import ReviewPanel from "./components/reviews/ReviewPanel";
import ReviewDesigns from "./pages/ReviewDesigns";
import { fleet } from "./data/fleet";
import { Cars, CarPage, Services, About, Contact } from "./pages/Pages";
import Book from "./pages/Book";

// If anything ever crashes, recover instead of showing a white screen.
class Guard extends Component {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch() { if (!sessionStorage.getItem("crash")) { sessionStorage.setItem("crash", "1"); location.reload(); } }
  render() { return this.state.err ? <div className="pad narrow"><h1>Please reload</h1><p><a className="btn btn--dark" href="/">Back to Home</a></p></div> : this.props.children; }
}
function ScrollTop() { const { pathname } = useLocation(); useEffect(() => window.scrollTo(0, 0), [pathname]); return null; }
export default function App() {
  const [open, setOpen] = useState(false); const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <>
      <ScrollTop />
      <a className="skip" href="#main">Skip to content</a>
      <header className="hdr"><Link to="/" className="logo">SAAD <span>CAR RENTAL SERVICES</span></Link>
        <nav aria-label="Main">{[["/", "Home"], ["/cars", "Cars"], ["/services", "Services"], ["/about", "About"], ["/contact", "Contact"]].map(([to, t]) => <NavLink key={to} to={to} end={to === "/"}>{t}</NavLink>)}</nav>
        <Link to="/book" className="btn btn--dark">Book Now</Link>
        <button className="burger" aria-expanded={open} aria-controls="menu" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? "✕" : "☰"}</button></header>
      {open && <nav id="menu" className="menu" aria-label="Mobile">{[["/", "Home"], ["/cars", "All Cars"], ...fleet.map((c) => [`/cars/${c.slug}`, c.title]), ["/services", "Services"], ["/about", "About"], ["/contact", "Contact"], ["/book", "Book Now"]].map(([to, t]) => <Link key={to} to={to}>{t}</Link>)}</nav>}
      <BookingModal />
      <ReviewPanel />
      <main id="main"><Guard key={pathname}>
        <Routes><Route path="/" element={<Home />} /><Route path="/cars" element={<Cars />} /><Route path="/cars/:slug" element={<CarPage />} />
          <Route path="/services" element={<Services />} /><Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} /><Route path="/book" element={<Book />} />{import.meta.env.DEV && <Route path="/review-designs" element={<ReviewDesigns />} />}<Route path="*" element={<Home />} /></Routes>
      </Guard></main>
      <footer className="ftr"><div><strong>{SITE.name}</strong><p>{SITE.tagline}</p></div><address>{SITE.address.map((l) => <span key={l}>{l}<br /></span>)}<a href={SITE.maps} target="_blank" rel="noopener noreferrer">Google Maps</a></address>
        <nav aria-label="Footer"><Link to="/">Home</Link>{["cars", "services", "about", "contact", "book"].map((p) => <Link key={p} to={`/${p}`}>{p[0].toUpperCase() + p.slice(1)}</Link>)}</nav>
        <nav aria-label="Fleet">{fleet.map((c) => <Link key={c.slug} to={`/cars/${c.slug}`}>{c.title}</Link>)}</nav>
        <small>© {new Date().getFullYear()} {SITE.name} · build {typeof __BUILD_ID__ !== "undefined" ? __BUILD_ID__.slice(-6) : "dev"}</small></footer>
      <div className="mbar">{telHref && <a href={telHref}>Call</a>}{waHref() && <a href={waHref()} target="_blank" rel="noopener noreferrer">WhatsApp</a>}<Link to="/book">Book Now</Link></div>
    </>
  );
}
