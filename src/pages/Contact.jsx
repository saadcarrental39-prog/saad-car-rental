import { useEffect, useState } from "react";
import { SITE, telHref, waHref } from "../config";
import { allVehicles } from "../data/fleet";
import { useSeo } from "../seo";
import { clean } from "../booking";
import { openChat } from "../sendBooking";
import { track } from "../analytics";
import { captureLead, completeLead } from "../leads";
import { RvRating, RvCount } from "../components/reviews/Live";

const TOPICS = ["Booking enquiry", "Airport transfer", "Wedding / event", "Corporate / business travel", "Long distance / tours", "Other"];
const PHONE_OK = /^[\d+\s()-]{7,20}$/;

const Ico = {
  phone: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>,
  chat: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.6-5.4A8.4 8.4 0 1 1 21 11.5z" /></svg>,
  pin: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  arrow: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
  check: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>,
};

function buildText(d) {
  const lines = [
    `Hello ${SITE.name}, I have an enquiry.`,
    `Name: ${clean(d.name)}`,
    `Phone: ${clean(d.phone)}`,
    `Topic: ${clean(d.topic)}`,
  ];
  if (clean(d.car)) lines.push(`Vehicle: ${clean(d.car)}`);
  if (clean(d.date)) lines.push(`Date: ${clean(d.date)}`);
  if (clean(d.message)) lines.push(`Message: ${clean(d.message)}`);
  return lines.join("\n");
}

async function sendToServer(d) {
  try {
    const r = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: clean(d.name), phone: clean(d.phone), topic: clean(d.topic), car: clean(d.car), date: clean(d.date), message: clean(d.message), website: d.website || "" }),
    });
    let j = null;
    try { j = await r.json(); } catch { /* not json */ }
    return r.ok && j?.ok === true;
  } catch { return false; }
}

export default function Contact() {
  useSeo({ title: "Contact Us – Chauffeur Car Rental in Islamabad", description: "Contact SAAD CAR RENTAL SERVICES, G-11 Markaz, Islamabad. Call, WhatsApp or send an enquiry and our team will get back to you quickly.", path: "/contact" });
  const [d, setD] = useState({ topic: TOPICS[0], car: "", website: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // null | { mode: "sent" | "chat", opened: bool }
  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.value }));
  const lx = { car: d.car, extra: [d.topic, d.message].filter(Boolean).join(" | ") };
  useEffect(() => { if (!done) captureLead("contact", d, lx); }, [d, done]); // eslint-disable-line react-hooks/exhaustive-deps  (saves what was typed, even if Send is never pressed)

  const submit = async (e) => {
    e.preventDefault();
    if (d.website) return; // honeypot: real people never fill this
    if (!clean(d.name)) { track("form_error", { form: "contact" }); return setErr("Please enter your name."); }
    if (!PHONE_OK.test(clean(d.phone))) { track("form_error", { form: "contact" }); return setErr("Please enter a valid phone number."); }
    if (!clean(d.message)) { track("form_error", { form: "contact" }); return setErr("Please tell us a little about your trip or question."); }
    setErr(""); setBusy(true); track("quote_submit", { form: "contact" }); completeLead("contact", d, lx);
    const ok = await sendToServer(d);
    if (ok) { setBusy(false); return setDone({ mode: "sent" }); }
    // Server not set up / offline: open our WhatsApp chat with the message already typed in.
    const opened = openChat(buildText(d));
    setBusy(false);
    setDone({ mode: "chat", opened });
  };

  const reset = () => { setDone(null); setD({ topic: TOPICS[0], car: "", website: "" }); };
  const chatHref = waHref("Hello, I would like to know more about your car rental with driver service.");

  return (
    <>
      <section className="ct-hero">
        <div className="ct-hero__in">
          <p className="eyebrow">Contact</p>
          <h1>Let’s plan your journey.</h1>
          <p className="ct-hero__lead">Tell us where you are headed and we will take care of the rest: the right vehicle, a professional driver, and a smooth ride from pickup to drop-off.</p>
          <div className="ct-hero__row">
            {chatHref && <a className="ct-btn ct-btn--wa" href={chatHref} target="_blank" rel="noopener noreferrer">{Ico.chat}<span>Chat on WhatsApp</span></a>}
            {telHref && <a className="ct-btn ct-btn--ghost" href={telHref}>{Ico.phone}<span>Call {SITE.phoneDisplay}</span></a>}
          </div>
          <ul className="ct-trust" aria-label="Why choose us">
            <li><b>{SITE.years}+</b> years in Islamabad</li>
            <li><b><RvRating /> ★</b> <RvCount /> Google reviews</li>
            <li><b>100%</b> with professional driver</li>
          </ul>
        </div>
      </section>

      <section className="ct-wrap">
        <div className="ct-grid">
          <aside className="ct-info" aria-label="Contact details">
            {telHref && (
              <a className="ct-card" href={telHref}>
                <span className="ct-ico">{Ico.phone}</span>
                <span><small>Call us</small><strong>{SITE.phoneDisplay}</strong><em>Tap to call from your phone</em></span>
              </a>
            )}
            {chatHref && (
              <a className="ct-card" href={chatHref} target="_blank" rel="noopener noreferrer">
                <span className="ct-ico ct-ico--wa">{Ico.chat}</span>
                <span><small>WhatsApp</small><strong>Message our team</strong><em>Quick replies, share your trip details</em></span>
              </a>
            )}
            <a className="ct-card" href={SITE.maps} target="_blank" rel="noopener noreferrer">
              <span className="ct-ico">{Ico.pin}</span>
              <span><small>Visit our office</small><strong>{SITE.address.slice(0, 3).join(" ").replace(/,\s*$/, "")}</strong><em>{SITE.address.slice(3).join(" ").replace(/,\s*$/, "")}</em></span>
            </a>
          </aside>

          <div className="ct-formcard">
            {done ? (
              <div className="ct-done" role="status" aria-live="polite">
                <span className="ct-done__ico">{Ico.check}</span>
                {done.mode === "sent" ? (
                  <>
                    <h2>Thank you, we have your message.</h2>
                    <p>Your enquiry was sent to our team on WhatsApp. We will contact you on <b>{clean(d.phone)}</b> shortly.</p>
                  </>
                ) : (
                  <>
                    <h2>One last step.</h2>
                    <p>{done.opened ? "WhatsApp is opening with your message already written. Just tap Send and our team will reply." : "Tap the button below to open WhatsApp with your message already written, then press Send."}</p>
                    {chatHref && <a className="ct-btn ct-btn--wa" href={waHref(buildText(d))} target="_blank" rel="noopener noreferrer">{Ico.chat}<span>Open WhatsApp</span></a>}
                  </>
                )}
                <button type="button" className="ct-link" onClick={reset}>Send another message</button>
              </div>
            ) : (
              <form className="ct-form" onSubmit={submit} noValidate>
                <div className="ct-form__head">
                  <h2>Send an enquiry</h2>
                  <p>Fill in the details below. It goes straight to our team on WhatsApp.</p>
                </div>
                <div className="ct-row">
                  <label>Full name *<input type="text" name="name" autoComplete="name" value={d.name || ""} onChange={set("name")} maxLength={80} placeholder="Your name" /></label>
                  <label>Phone / WhatsApp *<input type="tel" name="phone" autoComplete="tel" inputMode="tel" value={d.phone || ""} onChange={set("phone")} maxLength={25} placeholder="03XX XXXXXXX" /></label>
                </div>
                <label>Email (optional)<input type="email" name="email" autoComplete="email" inputMode="email" value={d.email || ""} onChange={set("email")} maxLength={80} placeholder="you@example.com" /></label>
                <div className="ct-row">
                  <label>Enquiry type<select value={d.topic} onChange={set("topic")}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></label>
                  <label>Preferred vehicle<select value={d.car} onChange={set("car")}><option value="">Not sure yet</option>{allVehicles.filter((v) => !v.placeholder).map((v) => { const n = `${v.name} ${v.trim || ""} – ${v.color}`.replace(/\s+/g, " "); return <option key={v.id} value={n}>{n}</option>; })}</select></label>
                </div>
                <label>Travel date (optional)<input type="date" name="date" value={d.date || ""} onChange={set("date")} /></label>
                <label>Your message *<textarea name="message" rows="4" maxLength={400} value={d.message || ""} onChange={set("message")} placeholder="Pickup and drop-off, number of passengers, anything we should know…" /></label>
                {/* honeypot: hidden from people, bots fill it */}
                <input className="ct-hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={d.website} onChange={set("website")} />
                {err && <p role="alert" className="ct-err">{err}</p>}
                <button className="ct-btn ct-btn--dark ct-submit" type="submit" disabled={busy}>{busy ? "Sending…" : <><span>Send via WhatsApp</span>{Ico.arrow}</>}</button>
                <p className="ct-fine">We save the details you type (name, phone, email) so we can reply to you, even if you do not press send.</p>
              </form>
            )}
          </div>
        </div>

        <div className="ct-map">
          <div className="ct-map__bar">
            <div><p className="eyebrow">Find us</p><strong>{SITE.name}</strong></div>
            <a className="ct-btn ct-btn--dark ct-btn--sm" href={SITE.maps} target="_blank" rel="noopener noreferrer">Get directions</a>
          </div>
          <iframe title="SAAD CAR RENTAL SERVICES location" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Shah+Nawaz+Plaza+G-11+Markaz+Islamabad&output=embed" />
        </div>
      </section>
    </>
  );
}
