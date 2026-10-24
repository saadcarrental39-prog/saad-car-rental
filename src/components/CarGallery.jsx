// Interior / exterior photos of a car. The pictures are listed in src/seo/data/pageImages.json under "/cars/<slug>"
// (so the same list also feeds the Google image sitemap and the page schema). Used on the car cards, in the Details window and on the car page.
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { imagesOf } from "../seo/data/pageMeta";
import SwipeHint from "./SwipeHint";
import { useT } from "../i18n";

export const galleryOf = (slug) => imagesOf(`/cars/${slug}`).filter((im) => im.gal);   // only pictures marked "gal": true in pageImages.json (interior shots)

export function PhotoViewer({ items, start = 0, onClose }) {
  const [i, setI] = useState(start); const n = items.length; const box = useRef(null);
  const go = useCallback((d) => setI((x) => (x + d + n) % n), [n]);
  useEffect(() => {
    const key = (e) => { if (e.key === "Escape") onClose(); else if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); };
    addEventListener("keydown", key); const prev = document.body.style.overflow; document.body.style.overflow = "hidden"; box.current && box.current.focus();
    return () => { removeEventListener("keydown", key); document.body.style.overflow = prev; };
  }, [go, onClose]);
  const sx = useRef(null);
  const down = (e) => { sx.current = e.clientX; };
  const up = (e) => { if (sx.current == null) return; const dx = e.clientX - sx.current; sx.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); };
  const im = items[i];
  return createPortal(
    <div className="pv" role="dialog" aria-modal="true" aria-label="Photos" ref={box} tabIndex={-1} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <button type="button" className="pv__x" onClick={onClose} aria-label="Close photos">×</button>
      <figure className="pv__fig" onPointerDown={down} onPointerUp={up}>
        <img key={im.key} src={im.url} srcSet={im.srcSet} sizes="(max-width: 900px) 96vw, 760px" alt={im.alt} width={im.w} height={im.h} draggable="false" />
        <figcaption>{im.cap} <span>{i + 1} / {n}</span></figcaption>
      </figure>
      {n > 1 && <><button type="button" className="pv__nav pv__nav--l" onClick={() => go(-1)} aria-label="Previous photo">‹</button><button type="button" className="pv__nav pv__nav--r" onClick={() => go(1)} aria-label="Next photo">›</button></>}
    </div>, document.body);
}

// small thumbnails (car card, Details window)
export function GalleryStrip({ slug, label = "Interior & exterior photos" }) {
  const t = useT(); const items = galleryOf(slug); const [open, setOpen] = useState(null);
  if (!items.length) return null;
  return (
    <div className="gst">
      <span className="gst__label">{t(label)}</span>
      <ul>{items.map((im, k) => <li key={im.key}><button type="button" onClick={(e) => { e.preventDefault(); setOpen(k); }} aria-label={im.alt}><img src={im.url} srcSet={im.srcSet} sizes="84px" alt="" width={im.w} height={im.h} loading="lazy" decoding="async" /></button></li>)}</ul>
      {open != null && <PhotoViewer items={items} start={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

// big swipeable photo row (car page)
export function GallerySection({ slug }) {
  const items = galleryOf(slug); const [open, setOpen] = useState(null);
  if (!items.length) return null;
  return (
    <div className="gsec">
      <div className="gsec__track" tabIndex={0} aria-label="Photos, swipe sideways">
        {items.map((im, k) => (
          <figure key={im.key} className="gsec__item">
            <button type="button" onClick={() => setOpen(k)} aria-label={`Open photo: ${im.cap}`}><img src={im.url} srcSet={im.srcSet} sizes="(max-width: 700px) 80vw, 340px" alt={im.alt} width={im.w} height={im.h} loading="lazy" decoding="async" /></button>
            <figcaption>{im.cap}</figcaption>
          </figure>))}
      </div>
      {items.length > 1 && <SwipeHint label="Swipe to see more photos" />}
      {open != null && <PhotoViewer items={items} start={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
