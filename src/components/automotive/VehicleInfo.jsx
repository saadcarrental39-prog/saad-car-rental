import ReviewBadge from "../reviews/ReviewBadge";
const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

// Keyed by vehicle id in the parent, so the text re-mounts and plays its enter animation on every change.
export default function VehicleInfo({ v }) {
  return (
    <div className="lc__info" aria-live="polite">
      <p className="lc__label">{v.subtitle}</p>
      <h2>{v.name}{v.trim && <em>{v.trim}</em>}</h2>
      <p className="lc__desc">{v.description}</p>
      <ul className="lc__chips">
        <li>{v.color}</li><li>With Professional Driver</li>
      </ul>
      <ReviewBadge />
      <div className="lc__cta">
        <button type="button" className="lc__btn-primary" onClick={() => window.dispatchEvent(new CustomEvent("open-booking", { detail: v.id }))}>Book With Driver  <Arrow /></button>
        <button type="button" className="lc__btn-ghost" onClick={() => window.dispatchEvent(new CustomEvent("open-details", { detail: v.id }))}>Details</button>
      </div>
    </div>
  );
}
