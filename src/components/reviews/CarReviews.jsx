// Customer reviews under every car: a small rating line on the card (opens all reviews of that car) and a full review section on the car page.
// Reviews come from src/data/reviews.js (real Google reviews, in the page HTML) plus the ones added in the Admin app > Reviews tab.
// Every review has a "See translation" button (Urdu, English, Arabic, Chinese and more).
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { REVIEWS } from "../../data/reviews";
import Stars from "./Stars";
import { useT } from "../../i18n";

const COL = ["#1a73e8", "#e8710a", "#188038", "#a142f4", "#d93025", "#12857a", "#b06000", "#c2185b"];
const colorOf = (s) => COL[[...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % COL.length];
const ago = (iso, when) => { if (!iso) return when || ""; const d = Math.floor((Date.now() - new Date(iso)) / 864e5); if (!(d >= 0)) return when || ""; return d < 7 ? "this week" : d < 30 ? `${Math.floor(d / 7)} week${d >= 14 ? "s" : ""} ago` : d < 365 ? `${Math.floor(d / 30)} month${d >= 60 ? "s" : ""} ago` : `${Math.floor(d / 365)} year${d >= 730 ? "s" : ""} ago`; };
export const LANGS = [["ur", "اردو", "urdu"], ["en", "English", "english"], ["ar", "العربية", "arabic"], ["zh", "中文", "chinese"], ["fr", "Français", "french"], ["de", "Deutsch", "german"], ["es", "Español", "spanish"], ["ja", "日本語", "japanese"], ["ru", "Русский", "russian"], ["tr", "Türkçe", "turkish"]];
const NAME = { ur: "urdu", en: "english", ar: "arabic", zh: "chinese", fr: "french", de: "german", es: "spanish", ja: "japanese", ru: "russian", tr: "turkish", ko: "korean" };

let curatedCache = null;
function useCurated() {
  const [d, setD] = useState(curatedCache || []);
  useEffect(() => { if (curatedCache) return; fetch("/api/reviews?curated=1").then((r) => (r.ok && /json/.test(r.headers.get("content-type") || "") ? r.json() : null)).then((j) => { curatedCache = (j && j.curated) || []; setD(curatedCache); }).catch(() => { curatedCache = []; }); }, []);
  return d;
}
export function useCarReviews(slug) {
  const extra = useCurated();
  return useMemo(() => {
    const seen = new Set(); const all = [];
    [...REVIEWS, ...extra].forEach((r) => { if (!r || seen.has(r.id)) return; seen.add(r.id); if (!slug || !r.cars || !r.cars.length || r.cars.includes(slug)) all.push(r); });
    return all.sort((a, b) => String(b.iso || "").localeCompare(String(a.iso || "")));
  }, [extra, slug]);
}
const avg = (l) => (l.reduce((a, r) => a + (Number(r.rating) || 0), 0) / (l.length || 1));

async function translate(text, to, from) {
  try {
    const r = await fetch("/api/translate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, to: NAME[to], from: NAME[from] || "english" }) });
    const j = await r.json().catch(() => ({})); if (r.ok && j.text) return { text: j.text };
  } catch { /* fall through to Google Translate */ }
  return { link: `https://translate.google.com/?sl=auto&tl=${to}&text=${encodeURIComponent(text)}&op=translate` };
}

export function ReviewCard({ r }) {
  const t = useT(); const [menu, setMenu] = useState(false), [tr, setTr] = useState(null), [busy, setBusy] = useState(false);
  const go = async (to) => {
    setMenu(false); if (to === r.lang) { setTr(null); return; }
    setBusy(true); const x = await translate(r.text, to, r.lang); setBusy(false);
    if (x.link) { window.open(x.link, "_blank", "noopener"); return; }
    setTr({ to, text: x.text });
  };
  const rtl = tr && (tr.to === "ar" || tr.to === "ur");
  return (
    <article className="grv__card">
      <header className="grv__who">
        <i className="grv__av" style={{ background: colorOf(r.name) }} aria-hidden="true">{r.name.trim().slice(0, 1).toUpperCase()}</i>
        <span><strong>{r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer nofollow">{r.name}</a> : r.name}</strong>{r.meta && <small>{r.meta}</small>}</span>
        <svg className="grv__g" viewBox="0 0 48 48" width="22" height="22" role="img" aria-label="Google"><path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2.1 5-4.4 6.5v5.4h7.1c4.2-3.8 6.6-9.5 6.6-15.9z" /><path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.4c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.6C8.1 41.3 15.5 46 24 46z" /><path fill="#FBBC05" d="M11.8 28.4c-.4-1.3-.7-2.7-.7-4.4s.3-3 .7-4.4v-5.6H4.5C3 17.1 2 20.4 2 24s1 6.9 2.5 10l7.3-5.6z" /><path fill="#EA4335" d="M24 10.6c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.5 2 8.1 6.7 4.5 14l7.3 5.6c1.7-5.2 6.5-9 12.2-9z" /></svg>
      </header>
      <div className="grv__row"><Stars value={r.rating} size={16} /><small>{ago(r.iso, r.when)}</small></div>
      <p className="grv__text" lang={tr ? tr.to : r.lang} dir={rtl ? "rtl" : undefined}>{tr ? tr.text : r.text}</p>
      <footer className="grv__foot">
        <div className="grv__tr">
          <button type="button" onClick={() => (tr ? setTr(null) : setMenu((m) => !m))} aria-expanded={menu} disabled={busy}>🌐 {busy ? t("Translating…") : tr ? t("Show original") : t("See translation")}</button>
          {menu && <ul className="grv__menu" role="menu">{LANGS.filter(([c]) => c !== r.lang).map(([c, label]) => <li key={c}><button type="button" role="menuitem" onClick={() => go(c)}>{label}</button></li>)}</ul>}
        </div>
        <span className="grv__src">{t("Google review")}</span>
      </footer>
    </article>
  );
}

// small rating line for the car card
export function CarReviewBadge({ slug }) {
  const t = useT(); const list = useCarReviews(slug); const [open, setOpen] = useState(false);
  if (!list.length) return null;
  const a = avg(list);
  return (<>
    <button type="button" className="grv__badge" onClick={() => setOpen(true)} aria-haspopup="dialog">
      <Stars value={a} size={15} /><b>{a.toFixed(1)}</b><span>{list.length} {t(list.length === 1 ? "customer review" : "customer reviews")}</span><em>{t("Read")} →</em>
    </button>
    {open && <ReviewsModal slug={slug} onClose={() => setOpen(false)} />}
  </>);
}

export function ReviewsModal({ slug, onClose }) {
  const t = useT(); const list = useCarReviews(slug);
  useEffect(() => { const k = (e) => e.key === "Escape" && onClose(); addEventListener("keydown", k); const p = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { removeEventListener("keydown", k); document.body.style.overflow = p; }; }, [onClose]);
  return createPortal(
    <div className="grv__modal" role="dialog" aria-modal="true" aria-label={t("Customer reviews")} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="grv__box"><button type="button" className="grv__x" onClick={onClose} aria-label="Close">×</button>
        <h2>{t("Customer reviews")}</h2><p className="grv__sub"><Stars value={avg(list)} size={18} /> <b>{avg(list).toFixed(1)}</b> · {list.length} {t("real Google reviews")}</p>
        <div className="grv__list">{list.map((r) => <ReviewCard key={r.id} r={r} />)}</div>
      </div></div>, document.body);
}

// full section for the car page: all reviews in a swipeable row
export function ReviewCards({ slug }) {
  const list = useCarReviews(slug); if (!list.length) return null;
  return <div className="grv__row-wrap"><div className="grv__track" tabIndex={0} aria-label="Customer reviews, swipe sideways">{list.map((r) => <ReviewCard key={r.id} r={r} />)}</div></div>;
}
