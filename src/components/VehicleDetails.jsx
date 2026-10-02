import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SITE, waHref } from "../config";
import { allVehicles } from "../data/fleet";
import { DETAILS, DEFAULT_DETAIL } from "../data/details";
import { useEsc } from "./reviews/data";
// Opens from the "Details" button on every car card. Each car shows its own details.
export default function VehicleDetails() {
  const [id, setId] = useState(null);
  useEffect(() => { const o = (e) => setId(e.detail); addEventListener("open-details", o); return () => removeEventListener("open-details", o); }, []);
  useEsc(!!id, () => setId(null));
  const v = id && allVehicles.find((x) => x.id === id);
  if (!v) return null;
  const x = DETAILS[v.id] || DEFAULT_DETAIL, name = `${v.name} ${v.trim}`.trim();
  const wa = waHref(`Hello, I would like to enquire about the ${name} (${v.color}) with a professional driver.`);
  return (<div className="vd" onMouseDown={(e) => e.target === e.currentTarget && setId(null)}>
    <div className="vd__box" role="dialog" aria-modal="true" aria-labelledby="vd-t">
      <button type="button" className="mdl__x" onClick={() => setId(null)} aria-label="Close details">×</button>
      <div className="vd__img"><img src={v.image} alt={`${v.color} ${name}`} /></div>
      <div className="vd__body">
        <p className="vd__sub">{v.subtitle}</p><h2 id="vd-t">{v.name}{v.trim && <em> {v.trim}</em>}</h2>
        <p className="vd__long">{x.long}</p>
        <dl className="vd__specs"><div><dt>Colour</dt><dd>{v.color}</dd></div><div><dt>Seats</dt><dd>{x.seats}</dd></div><div><dt>Type</dt><dd>{v.subtitle}</dd></div><div><dt>Service</dt><dd>With professional driver</dd></div></dl>
        <ul className="vd__pts">{x.points.map((p) => <li key={p}>{p}</li>)}</ul>
        <p className="vd__best"><b>Best for:</b> {x.best.join(" · ")}</p>
        <div className="vd__cta">
          <button type="button" className="btn btn--dark" onClick={() => { setId(null); window.dispatchEvent(new CustomEvent("open-booking", { detail: v.id })); }}>Book With Driver</button>
          {wa && <a className="btn" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp enquiry</a>}
        </div>
        <Link className="vd__more" to={`/cars/${v.category}`} onClick={() => setId(null)}>See all {v.category.replace(/-/g, " ")} options</Link>
      </div></div></div>);
}
