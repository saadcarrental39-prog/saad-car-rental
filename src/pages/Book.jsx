import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SITE, waHref } from "../config";
import { allVehicles } from "../data/fleet";
import { useSeo } from "../seo";
import { clean, buildMessage, makeData, newRef } from "../booking";
import { ReceiptCard } from "./Receipt";
import ReceiptActions from "../components/ReceiptActions";
const F = [["name", "Full Name", "text", 1], ["phone", "Phone Number", "tel", 1], ["whatsapp", "WhatsApp Number", "tel"], ["email", "Email (optional)", "email"], ["pickup", "Pickup Location", "text", 1], ["drop", "Drop-off Location", "text", 1], ["date", "Travel Date", "date", 1], ["time", "Pickup Time", "time", 1], ["rdate", "Return Date (optional)", "date"], ["rtime", "Return Time (optional)", "time"], ["pax", "Passengers", "number"], ["trip", "Trip Type", "text"]];
export default function Book() {
  useSeo({ title: "Book a Car With Driver", description: "Book a premium car with professional driver in Islamabad. No account needed.", path: "/book" });
  const [q] = useSearchParams();
  const [vid, setVid] = useState(allVehicles.find((v) => v.id === q.get("car"))?.id || allVehicles[0].id);
  const [d, setD] = useState({ pax: "1" }); const [err, setErr] = useState(""); const [preview, setPreview] = useState(false);
  const v = allVehicles.find((x) => x.id === vid);
  const ref = useRef(newRef()); const data = () => makeData(d, v, ref.current); const msg = () => buildMessage(d, v, data());
  const submit = (e) => { e.preventDefault(); const miss = F.filter((f) => f[3] && !clean(d[f[0]])); if (miss.length) return setErr(`Please fill: ${miss.map((f) => f[1]).join(", ")}`); if (!/^[\d+\s()-]{7,20}$/.test(d.phone)) return setErr("Enter a valid phone number."); setErr(""); setPreview(true); };
  if (preview) { const x = data(); return (<div className="pad narrow rcpw"><ReceiptCard data={x} v={v} />
    <div className="row noprint rcpw__a"><button className="btn" onClick={() => setPreview(false)}>Edit Booking</button>
      {waHref() ? <a className="btn btn--dark" href={waHref(msg())} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a> : <span className="note">WhatsApp booking is temporarily unavailable. Please call us.</span>}</div>
    <p className="noprint rcpa__m">Press Send in WhatsApp to deliver this booking and receipt to us.</p><div className="noprint"><ReceiptActions data={x} v={v} /></div><p className="row noprint"><button className="btn" onClick={() => window.print()}>Print / Save as PDF</button></p></div>); }
  return (<form className="pad narrow form" onSubmit={submit} noValidate><h1>Book Now</h1><p className="lead">No account needed.</p>
    <label>Vehicle<select value={vid} onChange={(e) => setVid(e.target.value)}>{allVehicles.map((x) => <option key={x.id} value={x.id}>{x.name} {x.trim} – {x.color}</option>)}</select></label>
    {F.map(([k, l, t, r]) => <label key={k}>{l}{r ? " *" : ""}<input type={t} value={d[k] || ""} onChange={(e) => setD({ ...d, [k]: e.target.value })} maxLength={120} min={t === "number" ? 1 : undefined} /></label>)}
    <label>Additional Requirements<textarea rows="3" maxLength={300} value={d.extra || ""} onChange={(e) => setD({ ...d, extra: e.target.value })} /></label>
    {err && <p role="alert" className="note">{err}</p>}<button className="btn btn--dark" type="submit">Preview Booking</button></form>);
}
