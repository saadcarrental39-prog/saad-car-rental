import { useEffect, useState } from "react";
import { SITE } from "../../config";
import Stars from "./Stars";
import { list, isSample, summary, useEsc } from "./data";
const COL = ["#1a73e8", "#e8710a", "#188038", "#a142f4", "#d93025", "#12857a", "#b06000"];
const Av = ({ r, i }) => r.photo ? <img className="rvp__av" src={r.photo} alt="" width="44" height="44" referrerPolicy="no-referrer" /> : <i className="rvp__av" style={{ background: COL[i % COL.length] }} aria-hidden="true">{r.name.trim().slice(0, 1).toUpperCase()}</i>;
// The full reviews window (opens when the rating line in the car card is clicked).
export default function ReviewPanel() {
  const [d, setD] = useState(0);
  useEffect(() => { const o = (e) => setD(Number(e.detail) || 1); addEventListener("open-reviews", o); return () => removeEventListener("open-reviews", o); }, []);
  useEsc(!!d, () => setD(0));
  if (!d) return null;
  const s = summary(), rs = list(), line = d === 3;
  return (<div className={`rvp rvp--d${d}`} onMouseDown={(e) => e.target === e.currentTarget && setD(0)}>
    <div className="rvp__box" role="dialog" aria-modal="true" aria-labelledby="rvp-t">
      <button type="button" className="rvp__x" onClick={() => setD(0)} aria-label="Close reviews">×</button>
      <header className="rvp__head"><div><h2 id="rvp-t">{SITE.name}</h2><div className="rvp__sum"><b>{s.rating}</b><Stars value={5} size={d === 4 ? 22 : 20} line={line} /><span>{s.count} reviews</span></div></div>
        <a className="rvp__write" href={SITE.writeReviewUrl} target="_blank" rel="noopener noreferrer">Write a review</a></header>
      {isSample() && <p className="rvp__demo">Sample preview. Asli reviews src/data/reviews.js se aate hain.</p>}
      <div className="rvp__list">
        {rs.length ? rs.map((r, i) => (<article key={i} className="rvp__item"><Av r={r} i={i} />
          <div><strong>{r.name}</strong><div className="rvp__meta"><Stars value={r.rating} size={14} line={line} /><small>{r.date}</small></div><p>{r.text}</p></div></article>))
          : <p className="rvp__empty">Saare reviews Google par dekhein.</p>}
      </div>
      <footer className="rvp__foot"><a href={SITE.reviewsMap} target="_blank" rel="noopener noreferrer">See all {s.count} reviews on Google Maps</a></footer>
    </div></div>);
}
