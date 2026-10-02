import { useEffect, useState } from "react";
import { SITE } from "../config";
import { allVehicles } from "../data/fleet";
import { clean } from "../booking";
import ReceiptView from "./ReceiptView";
import { sendBooking } from "../sendBooking";
const FIELDS = [["name", "Full Name", "text", 1], ["phone", "Phone Number", "tel", 1], ["pickup", "Pickup Location", "text", 1], ["drop", "Drop-off Location", "text", 1], ["date", "Travel Date", "date", 1], ["time", "Pickup Time", "time", 1], ["pax", "Passengers", "number"]];
export default function BookingModal() {
  const [vid, setVid] = useState(null); const [d, setD] = useState({ pax: "1" }); const [err, setErr] = useState(""); const [step, setStep] = useState("form"); const [busy, setBusy] = useState(false);
  useEffect(() => { const o = (e) => { setVid(e.detail); setErr(""); setStep("form"); }; window.addEventListener("open-booking", o); return () => window.removeEventListener("open-booking", o); }, []);
  useEffect(() => {
    if (!vid) return; const k = (e) => e.key === "Escape" && setVid(null);
    addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [vid]);
  if (!vid) return null;
  const v = allVehicles.find((x) => x.id === vid) || allVehicles[0];
  const miss = FIELDS.filter((f) => f[3] && !clean(d[f[0]]));
  const send = async () => { if (miss.length) setErr(`Please fill: ${miss.map((f) => f[1]).join(", ")}`); else { setErr(""); setBusy(true); const res = await sendBooking({ ...d, whatsapp: d.phone }, v); setBusy(false); if (res === "failed") setStep("receipt"); else if (res !== "cancelled") setVid(null); } };
  return (<div className="mdl" onMouseDown={(e) => e.target === e.currentTarget && setVid(null)}>
    <div className="mdl__box" role="dialog" aria-modal="true" aria-labelledby="mdl-t">
      <button className="mdl__x" onClick={() => setVid(null)} aria-label="Close booking form">×</button>
      {step === "receipt" ? <ReceiptView d={{ ...d, whatsapp: d.phone }} v={v} onBack={() => setStep("form")} onDone={() => setVid(null)} /> : <>
      <p className="eyebrow">{SITE.name}</p><h2 id="mdl-t">Book {v.name} {v.trim}</h2><p className="badge">WITH PROFESSIONAL DRIVER</p>
      <label>Vehicle<select value={vid} onChange={(e) => setVid(e.target.value)}>{allVehicles.map((x) => <option key={x.id} value={x.id}>{x.name} {x.trim} – {x.color}</option>)}</select></label>
      {FIELDS.map(([k, l, t, r]) => <label key={k}>{l}{r ? " *" : ""}<input type={t} value={d[k] || ""} maxLength={120} min={t === "number" ? 1 : undefined} onChange={(e) => setD({ ...d, [k]: e.target.value })} /></label>)}
      <label>Additional Requirements<textarea rows="2" maxLength={300} value={d.extra || ""} onChange={(e) => setD({ ...d, extra: e.target.value })} /></label>
      {err && <p role="alert" className="note">{err}</p>}
      <button className="btn btn--dark" disabled={busy} onClick={send}>{busy ? "Preparing receipt…" : "Book via WhatsApp"}</button></>}
    </div></div>);
}
