import { useEffect, useState } from "react";
import { SITE } from "../config";
import { allVehicles } from "../data/fleet";
import ReceiptView from "./ReceiptView";
import { sendBooking } from "../sendBooking";
import { track } from "../analytics";
import { captureLead, completeLead } from "../leads";
import ServiceSwitch from "./ServiceSwitch";
import TripForm, { prepare, leadNote } from "./TripForm";
export default function BookingModal() {
  const [vid, setVid] = useState(null); const [d, setD] = useState({ svc: "", service: "Car with driver" }); const [err, setErr] = useState(""); const [step, setStep] = useState("form"); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(null); const [fin, setFin] = useState(null);
  useEffect(() => { const o = (e) => { setVid(e.detail); setErr(""); setStep("form"); setSent(null); }; window.addEventListener("open-booking", o); return () => window.removeEventListener("open-booking", o); }, []);
  useEffect(() => {
    if (!vid) return; const k = (e) => e.key === "Escape" && setVid(null);
    addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [vid]);
  useEffect(() => { if (!vid) return; const c = allVehicles.find((x) => x.id === vid) || allVehicles[0]; captureLead("modal", { ...d, phone: d.whatsapp }, { car: `${c.name} ${c.trim || ""} ${c.color || ""}`.replace(/\s+/g, " ").trim(), extra: leadNote(d, d.svc) }); }, [d, vid]);   // saves what was typed, even if the visitor never sends
  if (!vid) return null;
  const v = allVehicles.find((x) => x.id === vid) || allVehicles[0];
  const car = `${v.name} ${v.trim || ""} ${v.color || ""}`.replace(/\s+/g, " ").trim();
  const submit = async (e) => {
    e.preventDefault();
    const r = prepare(d, d.svc);
    if (r.error) { track("form_error", { form: "booking-modal" }); return setErr(r.error); }
    setErr(""); setBusy(true); track("quote_submit", { form: "booking-modal", svc: d.svc });
    completeLead("modal", r.dd, { car, extra: r.dd.extra });
    const res = await sendBooking(r.dd, v); setBusy(false); setSent(res); setFin(r.dd); setStep("receipt");
  };
  return (<div className="mdl" onMouseDown={(e) => e.target === e.currentTarget && setVid(null)}>
    <div className="mdl__box" role="dialog" aria-modal="true" aria-labelledby="mdl-t">
      <button className="mdl__x" onClick={() => setVid(null)} aria-label="Close booking form">×</button>
      {step === "receipt" ? <ReceiptView d={fin || d} v={v} initial={sent} onBack={() => { setSent(null); setStep("form"); }} onDone={() => setVid(null)} /> : <>
      <p className="eyebrow">{SITE.name}</p><h2 id="mdl-t">Book {v.name} {v.trim}</h2><p className="badge">WITH PROFESSIONAL DRIVER</p>
      <ServiceSwitch value={d.svc || ""} onChange={(k) => { setD({ ...d, svc: k, driver: "", addl: [], service: "Car with driver" }); setErr(""); }} />
      {d.svc && <TripForm svc={d.svc} vid={vid} setVid={setVid} d={d} setD={setD} err={err} busy={busy} onSubmit={submit} />}</>}
    </div></div>);
}
