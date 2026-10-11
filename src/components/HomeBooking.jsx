import { useEffect, useState } from "react";
import { allVehicles } from "../data/fleet";
import { clean } from "../booking";
import ReceiptView from "./ReceiptView";
import { sendBooking } from "../sendBooking";
import { track } from "../analytics";
import { captureLead, completeLead } from "../leads";
import ServiceSwitch from "./ServiceSwitch";
import TripForm, { prepare, leadNote } from "./TripForm";

// Home page booking box (sits under the hero pictures).
// 1) choose the service (Out of Station / Local)  2) where + when (quick search)  3) the full booking form (same fields as the Book page).
// Sending saves the order in the owner's Admin app (Orders tab). Whatever the visitor types is also saved to the Clients tab (form "home").
const ymd = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
const carName = (v) => `${v.name} ${v.trim || ""} ${v.color || ""}`.replace(/\s+/g, " ").trim();

export default function HomeBooking() {
  const [d, setD] = useState({ service: "Car with driver" });
  const [vid, setVid] = useState(allVehicles[0].id);
  const [step, setStep] = useState(1);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);
  const [fin, setFin] = useState(null);
  const [today, setToday] = useState("");
  useEffect(() => { // dates are filled in the browser (not in the prebuilt page) so they are never stale
    const t = new Date(), r = new Date(); r.setDate(r.getDate() + 2);
    setToday(ymd(t)); setD((x) => ({ ...x, date: x.date || ymd(t), rdate: x.rdate || ymd(r) }));
  }, []);
  const v = allVehicles.find((x) => x.id === vid) || allVehicles[0];
  const out = d.svc === "out";
  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.value }));
  useEffect(() => { if (step === 2) captureLead("home", { ...d, phone: d.whatsapp }, { car: carName(v), extra: leadNote(d, d.svc) }); }, [d, vid, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const search = (e) => {
    e.preventDefault();
    if (!d.svc) return setErr("Please choose Out of Station or Local first.");
    if (!clean(d.pickup)) return setErr("Please enter the pick-up location.");
    if (out && !clean(d.drop)) return setErr("Please enter your destination (city or place).");
    if (!d.date) return setErr("Please choose the pick-up date.");
    if (today && d.date < today) return setErr("Pick-up date cannot be in the past.");
    if (d.rdate && d.rdate < d.date) return setErr("Drop-off date must be after the pick-up date.");
    setErr(""); setStep(2);
  };
  const book = async (e) => {
    e.preventDefault();
    const r = prepare(d, d.svc);
    if (r.error) { track("form_error", { form: "home" }); return setErr(r.error); }
    setErr(""); setBusy(true); track("quote_submit", { form: "home", svc: d.svc });
    completeLead("home", r.dd, { car: carName(v), extra: r.dd.extra });
    const res = await sendBooking(r.dd, v);
    setBusy(false); setSent(res); setFin(r.dd); setStep("receipt");
  };

  if (step === "receipt") return (<section className="hb" id="book-now" aria-label="Booking"><div className="hb__box hb__box--r"><ReceiptView d={fin || d} v={v} initial={sent} onBack={() => { setSent(null); setStep(2); }} onDone={() => { setSent(null); setStep(1); }} /></div></section>);

  return (<section className="hb" id="book-now" aria-labelledby="hb-t"><div className="hb__box">
    <h2 id="hb-t" className="hb__h">Book your car with driver</h2>
    <ServiceSwitch dark value={d.svc || ""} onChange={(k) => { setD((x) => ({ ...x, svc: k, driver: "", addl: [], service: "Car with driver" })); setErr(""); }} />
    {!d.svc ? null : step === 1 ? (
      <form onSubmit={search} noValidate>
        <div className="hb__row">
          <label className="hb__f hb__f--loc"><span>Pick-up location</span><input type="text" name="pickup" autoComplete="off" placeholder={out ? "e.g. Islamabad Airport" : "e.g. F-7 Markaz, Islamabad"} value={d.pickup || ""} maxLength={120} onChange={set("pickup")} /></label>
          <label className="hb__f"><span>Pick-up date</span><input type="date" name="date" min={today || undefined} value={d.date || ""} onChange={set("date")} /></label>
          <label className="hb__f"><span>Return date</span><input type="date" name="rdate" min={d.date || today || undefined} value={d.rdate || ""} onChange={set("rdate")} /></label>
          <button type="submit" className="hb__btn hb__btn--s">Continue</button>
        </div>
        {out && <label className="hb__f hb__f--drop"><span>Destination</span><input type="text" name="drop" autoComplete="off" placeholder="e.g. Skardu, Hunza, Kumrat Valley" value={d.drop || ""} maxLength={120} onChange={set("drop")} /></label>}
        {err && <p role="alert" className="hb__err">{err}</p>}
      </form>
    ) : (
      <div className="hb__panel">
        <p className="hb__sum"><b>{out ? "Out of Station" : "Local"} · {d.pickup}{out && d.drop ? ` → ${d.drop}` : ""}</b><button type="button" className="hb__link" onClick={() => { setErr(""); setStep(1); }}>Change</button></p>
        <TripForm svc={d.svc} vid={vid} setVid={setVid} d={d} setD={setD} err={err} busy={busy} onSubmit={book} />
      </div>
    )}
  </div></section>);
}
