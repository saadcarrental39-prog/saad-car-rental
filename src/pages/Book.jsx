import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { allVehicles } from "../data/fleet";
import { useSeo } from "../seo";
import { clean } from "../booking";
import ReceiptView from "../components/ReceiptView";
import { sendBooking } from "../sendBooking";
import { track } from "../analytics";
const F = [["name", "Full Name", "text", 1], ["phone", "Phone Number", "tel", 1], ["whatsapp", "WhatsApp Number", "tel"], ["email", "Email (optional)", "email"], ["pickup", "Pickup Location", "text", 1], ["drop", "Drop-off Location", "text", 1], ["date", "Travel Date", "date", 1], ["time", "Pickup Time", "time", 1], ["rdate", "Return Date (optional)", "date"], ["rtime", "Return Time (optional)", "time"], ["pax", "Passengers", "number"], ["trip", "Trip Type", "text"]];
export default function Book() {
  useSeo({ title: "Book a Car With Driver", description: "Book a premium car with professional driver in Islamabad. No account needed.", path: "/book" });
  const [q] = useSearchParams();
  const [vid, setVid] = useState(allVehicles.find((v) => v.id === q.get("car"))?.id || allVehicles[0].id);
  const [d, setD] = useState({ pax: "1", pickup: q.get("from") || "", drop: q.get("to") || "" }); const [err, setErr] = useState(""); const [preview, setPreview] = useState(false); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(null);
  const v = allVehicles.find((x) => x.id === vid);
  const submit = async (e) => { e.preventDefault(); const miss = F.filter((f) => f[3] && !clean(d[f[0]])); if (miss.length) { track("form_error", { form: "book" }); return setErr(`Please fill: ${miss.map((f) => f[1]).join(", ")}`); } if (!/^[\d+\s()-]{7,20}$/.test(d.phone)) { track("form_error", { form: "book" }); return setErr("Enter a valid phone number."); } setErr(""); setBusy(true); track("quote_submit", { form: "book" }); const res = await sendBooking(d, v); setBusy(false); setSent(res); setPreview(true); };
  if (preview) return (<div className="pad narrow"><ReceiptView d={d} v={v} initial={sent} onBack={() => { setSent(null); setPreview(false); }} /></div>);
  return (<form className="pad narrow form" onSubmit={submit} noValidate><h1>Book Now</h1><p className="lead">No account needed.</p>
    <label>Vehicle<select value={vid} onChange={(e) => setVid(e.target.value)}>{allVehicles.map((x) => <option key={x.id} value={x.id}>{x.name} {x.trim} – {x.color}</option>)}</select></label>
    {F.map(([k, l, t, r]) => <label key={k}>{l}{r ? " *" : ""}<input type={t} value={d[k] || ""} onChange={(e) => setD({ ...d, [k]: e.target.value })} maxLength={120} min={t === "number" ? 1 : undefined} /></label>)}
    <label>Additional Requirements<textarea rows="3" maxLength={300} value={d.extra || ""} onChange={(e) => setD({ ...d, extra: e.target.value })} /></label>
    {err && <p role="alert" className="note">{err}</p>}<button className="btn btn--dark" type="submit" disabled={busy}>{busy ? "Sending…" : "Book via WhatsApp"}</button></form>);
}
