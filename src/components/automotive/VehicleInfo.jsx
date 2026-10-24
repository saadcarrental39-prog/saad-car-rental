import { Link, useLocation } from "react-router-dom";
import { GalleryStrip } from "../CarGallery";
const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

// Keyed by vehicle id in the parent, so the text re-mounts and plays its enter animation on every change.
export default function VehicleInfo({ v }) {
  const { pathname } = useLocation();
  const onOwnPage = pathname.replace(/\/+$/, "") === `/cars/${v.category}`;   // never link a car page to itself
  return (
    <div className="lc__info" aria-live="polite">
      <p className="lc__label">{v.subtitle}</p>
      <h2>{v.name}{v.trim && <em>{v.trim}</em>}</h2>
      <p className="lc__desc">{v.description}</p>
      <ul className="lc__chips">
        <li>{v.color}</li><li>With Professional Driver</li>
      </ul>
      <ul className="lc__rates" aria-label="Rent per day">
        {[["Local", v.price], ["Out of Station", v.priceOut]].map(([label, p]) => (
          <li key={label}><small>{label}</small>{p ? <><b>Rs {Number(p).toLocaleString("en-PK")}</b><span> / day</span></> : <span className="lc__ask">Quote on request</span>}</li>
        ))}
      </ul>
      <GalleryStrip slug={v.category} />
      <div className="lc__cta">
        <button type="button" className="lc__btn-primary" onClick={() => window.dispatchEvent(new CustomEvent("open-booking", { detail: v.id }))}>Book With Driver  <Arrow /></button>
        {!onOwnPage && <Link className="lc__btn-ghost" to={`/cars/${v.category}`}>Details</Link>}
      </div>
    </div>
  );
}
