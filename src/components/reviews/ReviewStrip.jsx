import { useMemo, useRef } from "react";
import { SITE } from "../../config";
import { fleet } from "../../data/fleet";
import Stars from "./Stars";
import { useReviews } from "./store";
const titleOf = (slug) => fleet.find((c) => c.slug === slug)?.title || "";
const ago = (iso) => { const d = Math.floor((Date.now() - new Date(iso)) / 864e5); return d < 1 ? "today" : d < 30 ? `${d} day${d > 1 ? "s" : ""} ago` : d < 365 ? `${Math.floor(d / 30)} month${d >= 60 ? "s" : ""} ago` : `${Math.floor(d / 365)} year${d >= 730 ? "s" : ""} ago`; };

// Premium review strip. cars = category slugs: website reviews written for these cars show here,
// Google reviews (which belong to the business, not to one car) show under every car.
export default function ReviewStrip({ cars, compact = false }) {
  const d = useReviews(), track = useRef(null);
  const g = d?.google;
  const items = useMemo(() => {
    if (!d) return [];
    const site = (d.site || []).filter((r) => !cars || cars.includes(r.car));
    return [...site, ...(g?.reviews || [])].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 20);
  }, [d, cars]);
  const rating = g?.rating ?? Number(SITE.rating), count = g?.count ?? SITE.reviewCount;
  const all = g?.mapsUrl || SITE.reviewsMap, write = g?.writeUrl || SITE.reviewsMap;
  const scroll = (dir) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.85, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  return (
    <section className={`rv${compact ? " rv--compact" : ""}`} aria-label="Customer reviews">
      <div className="rv__sum">
        <b className="rv__score">{Number(rating).toFixed(1)}</b>
        <Stars value={rating} size={compact ? 22 : 26} />
        <span className="rv__count">{count} Google reviews</span>
        <div className="rv__btns">
          <button type="button" className="rv__btn rv__btn--gold" onClick={() => window.dispatchEvent(new CustomEvent("open-review", { detail: cars?.[0] || "" }))}>Write a review</button>
          <a className="rv__btn" href={all} target="_blank" rel="noopener noreferrer">All on Google</a>
        </div>
      </div>
      <div className="rv__wrap">
        {d?.sample && <p className="rv__demo">Local preview with sample data. Live reviews load on the deployed site.</p>}
        {items.length ? (<>
          <div className="rv__track" ref={track} tabIndex={0} role="region" aria-label="Review cards. Scroll sideways to read more.">
            {items.map((r) => (
              <article className="rv__card" key={r.id}>
                <Stars value={r.rating} size={16} />
                <p className="rv__text">{r.text}</p>
                <footer className="rv__who">
                  {r.avatar ? <img src={r.avatar} alt="" referrerPolicy="no-referrer" width="36" height="36" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <i aria-hidden="true">{r.name.slice(0, 1).toUpperCase()}</i>}
                  <span><strong>{r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a> : r.name}</strong>
                    <small>{r.source === "google" ? "Google review" : `Website review${r.car ? ` · ${titleOf(r.car)}` : ""}`} · {r.when || (r.date && ago(r.date))}</small></span>
                </footer>
              </article>))}
          </div>
          {items.length > 1 && <div className="rv__nav"><button type="button" onClick={() => scroll(-1)} aria-label="Previous reviews">‹</button><button type="button" onClick={() => scroll(1)} aria-label="Next reviews">›</button></div>}
        </>) : (
          <p className="rv__empty">{d ? "Be the first to review this car, or read what customers say about us on Google." : "Loading reviews…"}</p>)}
      </div>
    </section>);
}
