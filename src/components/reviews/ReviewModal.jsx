import { useEffect, useState } from "react";
import { fleet } from "../../data/fleet";
import { loadReviews } from "./store";
import Stars from "./Stars";
const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
function Picker({ value, onChange }) {
  const [hov, setHov] = useState(0), shown = hov || value;
  return (<div className="pick" role="radiogroup" aria-label="Star rating" onMouseLeave={() => setHov(0)}>
    {[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} className={n <= shown ? "on" : ""}
      onMouseEnter={() => setHov(n)} onFocus={() => setHov(n)} onBlur={() => setHov(0)} onClick={() => onChange(n)}><img src="/assets/star.png" alt="" width="96" height="96" /></button>)}
    <span className="pick__txt">{LABELS[shown] || "Select rating"}</span></div>);
}
export default function ReviewModal() {
  const [open, setOpen] = useState(false), [f, setF] = useState({ rating: 0, name: "", text: "", car: fleet[0].slug, hp: "" });
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false), [done, setDone] = useState(null);
  useEffect(() => { const o = (e) => { setF((x) => ({ ...x, car: e.detail || x.car })); setErr(""); setDone(null); setOpen(true); }; window.addEventListener("open-review", o); return () => window.removeEventListener("open-review", o); }, []);
  useEffect(() => {
    if (!open) return; const k = (e) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (!f.rating) return setErr("Please choose 1 to 5 stars.");
    if (f.name.trim().length < 2) return setErr("Please enter your name.");
    if (f.text.trim().length < 10) return setErr("Please write at least a few words.");
    setBusy(true);
    try {
      const r = await fetch("/api/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(f) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Could not send your review. Please try again.");
      const g = (await loadReviews()).google;
      setDone({ write: g?.writeUrl || "" }); window.dispatchEvent(new Event("reviews-updated"));
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  const toGoogle = async () => { try { await navigator.clipboard.writeText(f.text); } catch { /* ignore */ } window.open(done.write, "_blank", "noopener"); };
  return (<div className="mdl" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
    <form className="mdl__box rvm" role="dialog" aria-modal="true" aria-labelledby="rvm-t" onSubmit={submit} noValidate>
      <button type="button" className="mdl__x" onClick={() => setOpen(false)} aria-label="Close review form">×</button>
      {done ? (<>
        <h2 id="rvm-t">Thank you!</h2><div style={{ textAlign: "center" }}><Stars value={f.rating} size={30} /></div>
        <p>Your review is now live on our website.</p>
        {done.write && <><p>Would you also share it on Google? It helps other travellers find us. We copy your text first so you can just paste it.</p>
          <button type="button" className="btn btn--dark" onClick={toGoogle}>Copy and open Google review</button></>}
        <button type="button" className="btn" onClick={() => setOpen(false)}>Close</button></>) : (<>
        <h2 id="rvm-t">Write a review</h2>
        <Picker value={f.rating} onChange={(rating) => setF({ ...f, rating })} />
        <label>Car<select value={f.car} onChange={(e) => setF({ ...f, car: e.target.value })}>{fleet.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}</select></label>
        <label>Your name<input value={f.name} maxLength={60} autoComplete="name" onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label>Your review<textarea rows="4" maxLength={500} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} placeholder="How was the car and the driver?" /></label>
        <input className="rvm__hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.hp} onChange={(e) => setF({ ...f, hp: e.target.value })} />
        {err && <p role="alert" className="note">{err}</p>}
        <button className="btn btn--dark" disabled={busy}>{busy ? "Sending…" : "Submit review"}</button></>)}
    </form></div>);
}
