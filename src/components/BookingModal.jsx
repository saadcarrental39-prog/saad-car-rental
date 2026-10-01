import { useEffect, useState } from "react";
import { SITE, waHref } from "../config";
import { allVehicles } from "../data/fleet";
import { buildMessage, clean } from "../booking";
const FIELDS = [["name", "Full Name", "text", 1], ["phone", "Phone Number", "tel", 1], ["pickup", "Pickup Location", "text", 1], ["drop", "Drop-off Location", "text", 1], ["date", "Travel Date", "date", 1], ["time", "Pickup Time", "time", 1], ["pax", "Passengers", "number"]];
export default function BookingModal() {
  const [vid, setVid] = useState(null); const [d, setD] = useState({ pax: "1" }); const [err, setErr] = useState("");
  useEffect(() => { const o = (e) => { setVid(e.detail); setErr(""); }; window.addEventListener("open-booking", o); return () => window.removeEventListener("open-booking", o); }, []);
  useEffect(() => {
    if (!vid) return; const k = (e) => e.key === "Escape" && setVid(null);
    addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [vid]);
  if (!vid) return null;
  const v = allVehicles.find((x) => x.id === vid) || allVehicles[0];
  const miss = FIELDS.filter((f) => f[3] && !clean(d[f[0]]));
  const href = waHref(buildMessage({ ...d, whatsapp: d.phone }, v));
  const send = (e) => { if (miss.length) { e.preventDefault(); setErr(`Please fill: ${miss.map((f) => f[1]).join(", ")}`); } else setTimeout(() => setVid(null), 400); };
  return (<div className="mdl" onMouseDown={(e) => e.target === e.currentTarget && setVid(null)}>
    <div className="mdl__box" role="dialog" aria-modal="true" aria-labelledby="mdl-t">
      <button className="mdl__x" onClick={() => setVid(null)} aria-label="Close booking form">×</button>
      <p className="eyebrow">{SITE.name}</p><h2 id="mdl-t">Book {v.name} {v.trim}</h2><p className="badge">WITH PROFESSIONAL DRIVER</p>
      <label>Vehicle<select value={vid} onChange={(e) => setVid(e.target.value)}>{allVehicles.map((x) => <option key={x.id} value={x.id}>{x.name} {x.trim} – {x.color}</option>)}</select></label>
      {FIELDS.map(([k, l, t, r]) => <label key={k}>{l}{r ? " *" : ""}<input type={t} value={d[k] || ""} maxLength={120} min={t === "number" ? 1 : undefined} onChange={(e) => setD({ ...d, [k]: e.target.value })} /></label>)}
      <label>Additional Requirements<textarea rows="2" maxLength={300} value={d.extra || ""} onChange={(e) => setD({ ...d, extra: e.target.value })} /></label>
      {err && <p role="alert" className="note">{err}</p>}
      {href ? <a className="btn btn--dark" href={href} target="_blank" rel="noopener noreferrer" onClick={send}>Book via WhatsApp</a> : <p className="note">WhatsApp booking is temporarily unavailable. Please call us.</p>}
    </div></div>);
}
