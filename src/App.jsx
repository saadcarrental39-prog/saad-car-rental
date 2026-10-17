import { Component, Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route, Link, NavLink, useLocation } from "react-router-dom";
import { SITE, ADMIN_PATH, telHref, waHref } from "./config";
import Home from "./pages/Home";
import RecentBookings from "./components/RecentBookings";
import CookieNotice from "./components/CookieNotice";
import BookingModal from "./components/BookingModal";
import { fleet } from "./data/fleet";
import { CarPage, Services, About } from "./pages/Pages";
import Cars from "./pages/Cars";
import Contact from "./pages/Contact";
import Book from "./pages/Book";
import { SeoPage, NotFoundPage } from "./seo/pages";
import { pageByPath } from "./seo/registry";
import { useSeo } from "./seo";
import { PROVINCES } from "./seo/data/places";
import { useI18n, LangSelect } from "./i18n";
const Admin = lazy(() => import("./pages/Admin"));

// If anything ever crashes, recover instead of showing a white screen.
class Guard extends Component {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch() { if (!sessionStorage.getItem("crash")) { sessionStorage.setItem("crash", "1"); location.reload(); } }
  render() { return this.state.err ? <div className="pad narrow"><h1>Please reload</h1><p><a className="btn btn--dark" href="/">Back to Home</a></p></div> : this.props.children; }
}
function CatchAll() {
  const { pathname } = useLocation(); const page = pageByPath(pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname);
  useSeo(page ? {} : { notFound: true });
  return page ? <SeoPage page={page} /> : <NotFoundPage />;
}
function ScrollTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); }, [pathname]); return null; }
export default function App() {
  const [open, setOpen] = useState(false); const { pathname } = useLocation(); const { t } = useI18n();
  useEffect(() => { setOpen(false); }, [pathname]);
  if (pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`)) return <Suspense fallback={null}><Admin /></Suspense>;
  return (
    <>
      <ScrollTop />
      <a className="skip" href="#main">{t("Skip to content")}</a>
      <header className="hdr"><Link to="/" className="logo"><img className="logo__img" src="/assets/brand/saadcar-logo-dark.svg" alt="SAAD CAR" width="3840" height="1228" /> <span>RENTAL SERVICES</span></Link>
        <nav aria-label={t("Main")}>{[["/", "Home"], ["/cars", "Cars"], ["/services", "Services"], ["/northern-areas", "Northern Areas"], ["/routes", "Routes"], ["/about", "About"], ["/contact", "Contact"]].map(([to, tt]) => <NavLink key={to} to={to} end={to === "/"}>{t(tt)}</NavLink>)}</nav>
        <LangSelect className="lang--hdr" />
        <Link to="/book" className="btn btn--dark">{t("Book Now")}</Link>
        <button className="burger" aria-expanded={open} aria-controls="menu" aria-label={t("Menu")} onClick={() => setOpen(!open)}>{open ? "✕" : "☰"}</button></header>
      {open && <nav id="menu" className="menu" aria-label="Mobile"><LangSelect className="lang--menu" />{[["/", "Home"], ["/cars", "All Cars"], ...fleet.map((c) => [`/cars/${c.slug}`, c.title]), ["/services", "Services"], ["/northern-areas", "Northern Areas"], ["/routes", "Routes"], ["/destinations", "Destinations"], ["/guides", "Guides"], ["/car-rental-pakistan", "Across Pakistan"], ["/airport-transfer/islamabad", "Airport Transfer"], ["/out-of-station-car-rental", "Out of Station"], ["/local-car-rental-islamabad", "Local · Islamabad"], ["/islamabad-places", "Islamabad Places"], ["/car-rental-guide", "Car Rental Guide"], ["/visit-pakistan", "Visit Pakistan"], ["/overseas-pakistanis", "Overseas Pakistanis"], ["/faq", "FAQ"], ["/about", "About"], ["/contact", "Contact"], ["/book", "Book Now"]].map(([to, tt]) => <Link key={to} to={to}>{tt === "All Cars" || !fleet.some((c) => c.title === tt) ? t(tt) : tt}</Link>)}</nav>}
      <BookingModal />
      <RecentBookings />
      <CookieNotice />
      <main id="main"><Guard key={pathname}>
        <Routes><Route path="/" element={<Home />} /><Route path="/cars" element={<Cars />} /><Route path="/cars/:slug" element={<CarPage />} />
          <Route path="/services" element={<Services />} /><Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} /><Route path="/book" element={<Book />} /><Route path="*" element={<CatchAll />} /></Routes>
      </Guard></main>
      <footer className="ftr"><div><strong className="ftr__brand"><img src="/assets/brand/saadcar-logo-light.svg" alt="SAAD CAR" width="3840" height="1228" loading="lazy" /> <span>RENTAL SERVICES</span></strong><p>{t(SITE.tagline)}</p></div><address>{SITE.address.map((l) => <span key={l}>{l}<br /></span>)}<a href={SITE.maps} target="_blank" rel="noopener noreferrer">{t("Google Maps")}</a></address>
        <nav aria-label="Footer"><Link to="/">{t("Home")}</Link>{["cars", "services", "about", "contact", "book"].map((p) => <Link key={p} to={`/${p}`}>{t(p[0].toUpperCase() + p.slice(1))}</Link>)}</nav>
        <nav aria-label={t("Explore")}><Link to="/routes">{t("Routes")}</Link><Link to="/northern-areas">{t("Northern Areas")}</Link><Link to="/airport-transfer/islamabad">{t("Airport Transfer")}</Link><Link to="/local-car-rental-islamabad">{t("Local · Islamabad")}</Link><Link to="/out-of-station-car-rental">{t("Out of Station")}</Link><Link to="/guides">{t("Guides")}</Link><Link to="/faq">{t("FAQ")}</Link></nav>
        <nav aria-label="Legal"><Link to="/privacy-policy">{t("Privacy Policy")}</Link><Link to="/terms-of-service">{t("Terms of Service")}</Link><Link to="/refund-policy">{t("Refund Policy")}</Link><Link to="/cookie-policy">{t("Cookie Policy")}</Link><Link to="/ai-info">{t("AI Info")}</Link></nav>
        <nav aria-label="Fleet">{fleet.filter((c) => ["land-cruiser-v8", "prado", "toyota-fortuner", "coaster"].includes(c.slug)).map((c) => <Link key={c.slug} to={`/cars/${c.slug}`}>{c.title}</Link>)}</nav>
        {Object.values(SITE.social || {}).some(Boolean) && <nav aria-label="Social">{Object.entries(SITE.social).filter(([, u]) => u).map(([k, u]) => <a key={k} href={u} target="_blank" rel="noopener noreferrer me">{k[0].toUpperCase() + k.slice(1)}</a>)}</nav>}
        <LangSelect className="lang--ftr" /><small>© {new Date().getFullYear()} {SITE.name} · build {typeof __BUILD_ID__ !== "undefined" ? __BUILD_ID__.slice(-6) : "dev"}</small></footer>
      <div className="mbar">{telHref && <a href={telHref}>{t("Call")}</a>}{waHref() && <a href={waHref()} target="_blank" rel="noopener noreferrer">WhatsApp</a>}<Link to="/book">{t("Book Now")}</Link></div>
    </>
  );
}
