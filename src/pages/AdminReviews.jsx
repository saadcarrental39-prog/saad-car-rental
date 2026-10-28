// Admin app > "Reviews" tab. Copy reviews from Google Maps / your Google Business Profile, paste them here, choose the stars and which car(s)
// they belong to, press Save: they appear under those cars on the website within a few minutes (no rebuild, no deploy).
import { useEffect, useMemo, useState } from "react";
import { fleet } from "../data/fleet";
import { REVIEWS } from "../data/reviews";
import { parseGoogleReviews, slugId } from "../components/reviews/parse";
import "../styles/admin-reviews.css";

export const IStar = () => <svg viewBox="0 0 24 24" aria-hidden="true" className="ad-i"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></svg>;

function Edit({ r, set, cats, del, fresh }) {
  const toggle = (slug) => set({ ...r, cars: r.cars.includes(slug) ? r.cars.filter((x) => x !== slug) : [...r.cars, slug] });
  return (
    <section className={`ad-card ad-rv${fresh ? " ad-rv--new" : ""}`}>
      <div className="ad-rv__top"><b>{r.name}</b><small>{r.meta}{r.when ? ` · ${r.when}` : ""}</small><button type="button" className="ad-btn ad-btn--ghost" onClick={del}>Hatayein</button></div>
      <p className="ad-rv__text">{r.text.length > 220 ? `${r.text.slice(0, 220)}…` : r.text}</p>
      <div className="ad-rv__row">
        <label>Stars <select value={r.rating} onChange={(e) => set({ ...r, rating: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n})</option>)}</select></label>
        <label>Mulk <input value={r.country || ""} onChange={(e) => set({ ...r, country: e.target.value })} placeholder="optional" maxLength={30} /></label>
      </div>
      <p className="ad-note">Kis gaari ke neeche dikhana hai? (kuch select na karein = har gaari par)</p>
      <div className="ad-rv__chips">{cats.map(([slug, title]) => <button type="button" key={slug} className={r.cars.includes(slug) ? "on" : ""} onClick={() => toggle(slug)}>{title}</button>)}</div>
    </section>
  );
}

export default function AdminReviews({ tok, api, out }) {
  const [saved, setSaved] = useState(null), [raw, setRaw] = useState(""), [fresh, setFresh] = useState([]), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false), [dirty, setDirty] = useState(false);
  const cats = useMemo(() => fleet.map((c) => [c.slug, c.title]), []);
  useEffect(() => { api("gmb_list", {}, tok).then((r) => setSaved(r.reviews || [])).catch((e) => (e.status === 401 ? out() : setSaved([]))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const have = new Set([...(saved || []).map((r) => r.id), ...REVIEWS.map((r) => r.id)]);
  const read = () => {
    const list = parseGoogleReviews(raw).map((r) => ({ ...r, id: slugId(r.name, r.text), rating: 5, cars: [], country: "" }));
    const add = list.filter((r) => !have.has(r.id) && !fresh.some((f) => f.id === r.id));
    setFresh([...add, ...fresh]); setRaw(""); setDirty(add.length > 0);
    setMsg(!list.length ? "Koi review nahi mila. Google se poora review (naam, tareekh, text) copy karke paste karein." : `${add.length} naye review mile${list.length - add.length ? `, ${list.length - add.length} pehle se maujood` : ""}. Stars aur gaari chunein, phir Save karein.`);
  };
  const save = async () => {
    setBusy(true); setMsg("");
    try { const all = [...fresh, ...saved]; const r = await api("gmb_save", { reviews: all }, tok); setSaved(all); setFresh([]); setDirty(false); setMsg(`Save ho gaya ✅ (${r.count}). Website par kuch minute mein nazar aayenge.`); }
    catch (e) { if (e.status === 401) return out(); setMsg("Save nahi hua. Internet check karein aur dobara try karein."); }
    setBusy(false);
  };
  if (!saved) return <div className="ad-load"><span className="ad-spin" /><p>Load ho raha hai…</p></div>;
  const upd = (list, setList) => (i) => (nr) => setList(list.map((x, k) => (k === i ? nr : x)));
  return (<>
    <section className="ad-card"><h2>Reviews<small>{saved.length + REVIEWS.length}</small></h2>
      <p className="ad-note">Google Maps ya Google Business Profile se review copy karke neeche paste karein. Ek saath kai reviews bhi paste ho sakte hain. Sirf asli reviews dalein: naqli reviews Google aur customers dono ke liye nuksan-deh hain.</p>
      <textarea className="ad-rv__ta" rows={7} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={"[Name](https://www.google.com/maps/contrib/…)\nLocal Guide · 23 reviews\n2 months ago\nReview ka text…"} />
      <div className="ad-spot__btns"><button type="button" className="ad-btn ad-btn--lg" onClick={read} disabled={!raw.trim()}>Reviews pehchanein</button></div>
      {msg && <p className="ad-note" role="status">{msg}</p>}
    </section>
    {fresh.length > 0 && <h3 className="ad-rv__h">Naye reviews (abhi save nahi hue)</h3>}
    {fresh.map((r, i) => <Edit key={r.id} r={r} cats={cats} fresh set={upd(fresh, (l) => { setFresh(l); setDirty(true); })(i)} del={() => setFresh(fresh.filter((x) => x.id !== r.id))} />)}
    {fresh.length > 0 && <div className="ad-rv__save"><button type="button" className="ad-btn ad-btn--lg" onClick={save} disabled={busy}>{busy ? "Save ho raha hai…" : `Save karein (${fresh.length})`}</button></div>}
    {saved.length > 0 && <h3 className="ad-rv__h">Website par maujood reviews</h3>}
    {saved.map((r, i) => <Edit key={r.id} r={r} cats={cats} set={(nr) => { setSaved(saved.map((x, k) => (k === i ? nr : x))); setDirty(true); }} del={() => { if (window.confirm("Ye review hata dein?")) { setSaved(saved.filter((x) => x.id !== r.id)); setDirty(true); } }} />)}
    {saved.length > 0 && dirty && fresh.length === 0 && <div className="ad-rv__save"><button type="button" className="ad-btn ad-btn--lg" onClick={async () => { setBusy(true); try { await api("gmb_save", { reviews: saved }, tok); setDirty(false); setMsg("Badlaav save ho gaye ✅"); } catch (e) { if (e.status === 401) return out(); setMsg("Save nahi hua."); } setBusy(false); }} disabled={busy}>Badlaav save karein</button></div>}
    <section className="ad-card"><p className="ad-note"><b>{REVIEWS.length} reviews</b> website ke code mein pehle se hain (Hussain, Abdullah, Shabih, Salman, Usman, Shamaila, Dr Mosa, Tariq). Ye har gaari par apne hisab se dikhte hain.</p></section>
  </>);
}
