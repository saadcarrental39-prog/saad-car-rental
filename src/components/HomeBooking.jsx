import { useEffect, useState } from "react";
import { allVehicles } from "../data/fleet";
import { clean } from "../booking";
import ReceiptView from "./ReceiptView";
import { sendBooking } from "../sendBooking";
import { track } from "../analytics";
import { captureLead, completeLead } from "../leads";

// Home page booking box (sits under the hero pictures).
// Step 1: where + when (like a car-hire search box). Step 2: car + contact. Send -> the order appears in the owner's Admin app (Orders tab).
// Whatever the visitor types is also saved to the Admin app's Clients tab (form "home"), even if they never press the last button.
const ymd = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
const carName = (v) => `${v.name} ${v.trim || ""} ${v.color || ""}`.replace(/\s+/g, " ").trim();

export default function HomeBooking() {
  const [d, setD] = useState({ time: "10:00", rtime: "10:00", pax: "1" });
  const [diff, setDiff] = useState(false);
  const [vid, setVid] = useState(allVehicles[0].id);
  const [step, setStep] = useState(1);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);
  const [today, setToday] = useState("");
  useEffect(() => { // dates are filled in the browser (not in the prebuilt page) so they are never stale
    const t = new Date(), r = new Date(); r.setDate(r.getDate() + 2);
    setToday(ymd(t)); setD((x) => ({ ...x, date: x.date || ymd(t), rdate: x.rdate || ymd(r) }));
  }, []);
  const v = allVehicles.find((x) => x.id === vid) || allVehicles[0];
  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.value }));
  const full = { ...d, drop: diff ? d.drop : d.pickup, whatsapp: d.phone };

  useEffect(() => { if (step === 2) captureLead("home", full, { car: carName(v) }); }, [d, diff, vid, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const search = (e) => {
    e.preventDefault();
    if (!clean(d.pickup)) return setErr("Please enter the pick-up location.");
    if (diff && !clean(d.drop)) return setErr("Please enter the drop-off location.");
    if (!d.date || !d.time) return setErr("Please choose the pick-up date and time.");
    if (today && d.date < today) return setErr("Pick-up date cannot be in the past.");
    if (d.rdate && d.rdate < d.date) return setErr("Drop-off date must be after the pick-up date.");
    setErr(""); setStep(2);
  };
  const book = async (e) => {
    e.preventDefault();
    if (!clean(d.name)) return setErr("Please enter your name.");
    if (!/^[\d+\s()-]{7,20}$/.test(d.phone || "")) { track("form_error", { form: "home" }); return setErr("Please enter a valid phone number."); }
    setErr(""); setBusy(true); track("quote_submit", { form: "home" });
    completeLead("home", full, { car: carName(v) });
    const res = await sendBooking(full, v);
    setBusy(false); setSent(res); setStep("receipt");
  };

  if (step === "receipt") return (<section className="hb" id="book-now" aria-label="Booking"><div className="hb__box hb__box--r"><ReceiptView d={full} v={v} initial={sent} onBack={() => { setSent(null); setStep(2); }} onDone={() => { setSent(null); setStep(1); }} /></div></section>);

  return (<section className="hb" id="book-now" aria-labelledby="hb-t"><div className="hb__box">
    <h2 id="hb-t" className="hb__h">Book your car with driver</h2>
    {step === 1 ? (
      <form onSubmit={search} noValidate>
        <div className="hb__row">
          <label className="hb__f hb__f--loc"><span>Pick-up location</span><input type="text" name="pickup" autoComplete="off" placeholder="e.g. Islamabad Airport" value={d.pickup || ""} maxLength={120} onChange={set("pickup")} /></label>
          <label className="hb__f"><span>Pick-up date</span><input type="date" name="date" min={today || undefined} value={d.date || ""} onChange={set("date")} /></label>
          <label className="hb__f"><span>Time</span><input type="time" name="time" value={d.time || ""} onChange={set("time")} /></label>
          <label className="hb__f"><span>Drop-off date</span><input type="date" name="rdate" min={d.date || today || undefined} value={d.rdate || ""} onChange={set("rdate")} /></label>
          <label className="hb__f"><span>Time</span><input type="time" name="rtime" value={d.rtime || ""} onChange={set("rtime")} /></label>
          <button type="submit" className="hb__btn hb__btn--s">Search</button>
        </div>
        <div className="hb__chk"><label><input type="checkbox" checked={diff} onChange={(e) => setDiff(e.target.checked)} /> Different drop-off location</label></div>
        {diff && <label className="hb__f hb__f--drop"><span>Drop-off location</span><input type="text" name="drop" autoComplete="off" placeholder="e.g. Murree" value={d.drop || ""} maxLength={120} onChange={set("drop")} /></label>}
        {err && <p role="alert" className="hb__err">{err}</p>}
      </form>
    ) : (
      <form onSubmit={book} noValidate>
        <p className="hb__sum"><b>{d.pickup}{diff && d.drop ? ` → ${d.drop}` : ""}</b><span>{d.date} · {d.time}{d.rdate ? ` → ${d.rdate} · ${d.rtime || ""}` : ""}</span><button type="button" className="hb__link" onClick={() => { setErr(""); setStep(1); }}>Change</button></p>
        <div className="hb__row hb__row--2">
          <label className="hb__f"><span>Choose your car</span><select value={vid} onChange={(e) => setVid(e.target.value)}>{allVehicles.map((x) => <option key={x.id} value={x.id}>{x.name} {x.trim} – {x.color}</option>)}</select></label>
          <label className="hb__f"><span>Your name</span><input type="text" name="name" autoComplete="name" value={d.name || ""} maxLength={120} onChange={set("name")} /></label>
          <label className="hb__f"><span>Phone number</span><input type="tel" name="tel" autoComplete="tel" inputMode="tel" value={d.phone || ""} maxLength={25} onChange={set("phone")} /></label>
          <label className="hb__f"><span>Passengers</span><input type="number" name="pax" min="1" max="60" inputMode="numeric" value={d.pax || ""} onChange={set("pax")} /></label>
          <button type="submit" className="hb__btn" disabled={busy}>{busy ? "Sending…" : "Book now"}</button>
        </div>
        {err && <p role="alert" className="hb__err">{err}</p>}
        <p className="hb__fine">We save the details you type (name, phone) so we can contact you about your booking, even if you do not press the button.</p>
      </form>
    )}
  </div></section>);
}
