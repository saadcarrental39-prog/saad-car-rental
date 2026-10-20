// Admin app > "Spots" tab: photos for every Murree tourist-spot page (same idea as the Gaariyan tab, but for the tourism pages).
// A photo can be picked from the phone gallery (uploaded, shrunk and stored by the server) or added by a link (https://...). Alt text = what Google reads for image search.
import { useEffect, useState } from "react";
import { TOUR_SPOTS, TOUR_HUB } from "../seo/data/tourSpots";
import "../styles/admin-spots.css";

const IPin = () => <svg viewBox="0 0 24 24" aria-hidden="true" className="ad-i"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.4" /></svg>;
export { IPin };
const MAX = 12;

export default function AdminSpots({ tok, api, Photo, out }) {
  const [data, setData] = useState(null), [err, setErr] = useState(""), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false), [dirty, setDirty] = useState(false), [link, setLink] = useState({});
  useEffect(() => { api("spots_load", {}, tok).then((r) => setData({ v: 1, spots: {}, ...(r.data || {}) })).catch((e) => (e.status === 401 ? out() : setErr("Load nahi hua. Internet check karein."))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!data) return <div className="ad-load">{err ? <p>{err}</p> : <><span className="ad-spin" /><p>Load ho raha hai…</p></>}</div>;
  const list = (sl) => data.spots[sl] || [];
  const edit = (sl, fn) => { setData((d) => { const l = [...(d.spots[sl] || [])]; fn(l); return { ...d, spots: { ...d.spots, [sl]: l } }; }); setDirty(true); setMsg(""); };
  const add = (s, url) => { if (!url) return; edit(s.slug, (l) => { if (l.length < MAX) l.push({ url, alt: `${s.images[l.length % s.images.length] || s.name} - ${s.name}`, caption: "" }); }); };
  const save = async () => { setBusy(true); setMsg(""); try { const r = await api("spots_save", { data }, tok); setData({ v: 1, spots: {}, ...r.data }); setDirty(false); setMsg("Save ho gaya. Website par 1-2 minute mein nazar aayega."); } catch (e) { if (e.status === 401) return out(); setMsg("Save nahi hua. Dobara try karein."); } setBusy(false); };
  return (<>
    <section className="ad-card"><h2>Murree tourism pages</h2><p className="ad-note">Har spot ki photos yahan lagayein. Photo phone se chunein ya link paste karein. Neeche likha naam (alt text) Google images ke liye hai: saaf likhein, jaise “Patriata chairlift Murree”. Sirf wahi photos lagayein jo aapki hain ya jinki ijazat hai.</p></section>
    {TOUR_SPOTS.map((s) => (
      <section className="ad-card ad-spot" key={s.slug}>
        <h2>{s.name}<small>{list(s.slug).length}/{MAX}</small></h2>
        <a className="ad-note" href={`${TOUR_HUB.path}/${s.slug}`} target="_blank" rel="noopener noreferrer">Page dekhein →</a>
        {list(s.slug).map((im, i) => (
          <div className="ad-spot__row" key={i}>
            <img src={im.url} alt="" loading="lazy" referrerPolicy="no-referrer" />
            <div>
              <label className="ad-field"><span>Alt text (Google ke liye)</span><input value={im.alt} maxLength={140} onChange={(e) => edit(s.slug, (l) => { l[i] = { ...l[i], alt: e.target.value }; })} /></label>
              <label className="ad-field"><span>Caption (optional)</span><input value={im.caption || ""} maxLength={160} onChange={(e) => edit(s.slug, (l) => { l[i] = { ...l[i], caption: e.target.value }; })} /></label>
              <div className="ad-spot__btns">
                <button type="button" className="ad-btn ad-btn--ghost" disabled={i === 0} onClick={() => edit(s.slug, (l) => { [l[i - 1], l[i]] = [l[i], l[i - 1]]; })}>↑</button>
                <button type="button" className="ad-btn ad-btn--ghost" disabled={i === list(s.slug).length - 1} onClick={() => edit(s.slug, (l) => { [l[i + 1], l[i]] = [l[i], l[i + 1]]; })}>↓</button>
                <button type="button" className="ad-btn ad-btn--ghost" onClick={() => edit(s.slug, (l) => { l.splice(i, 1); })}>Hatayein</button>
              </div>
            </div>
          </div>
        ))}
        {list(s.slug).length < MAX && <>
          <Photo tok={tok} label="Phone se photo" onUrl={(u) => add(s, u)} />
          <div className="ad-spot__link"><input value={link[s.slug] || ""} placeholder="ya image ka link: https://..." inputMode="url" onChange={(e) => setLink({ ...link, [s.slug]: e.target.value })} />
            <button type="button" className="ad-btn ad-btn--ghost" onClick={() => { const u = (link[s.slug] || "").trim(); if (!/^https:\/\/\S{4,}$/.test(u)) return setMsg("Link https:// se shuru hona chahiye."); add(s, u); setLink({ ...link, [s.slug]: "" }); }}>Add</button></div>
        </>}
      </section>
    ))}
    {(dirty || msg) && <div className="ad-save" role="status"><span>{msg || "Badlaav save nahi hue"}</span>{dirty && <button type="button" className="ad-btn ad-btn--light" disabled={busy} onClick={save}>{busy ? "Save ho raha hai…" : "Save"}</button>}</div>}
  </>);
}
