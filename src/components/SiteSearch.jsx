// Site search: a button in the header (every page) opens a search box with live suggestions for cars, places, routes, guides and services.
// The list of pages comes from /search-index.json, which is built from the real page list at every build, so it is never out of date.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useT } from "../i18n";
import { useSeo } from "../seo";

const SYN = { lc: "land cruiser", gari: "car", gadi: "car", gaadi: "car", taxi: "car with driver", cab: "car with driver", rent: "rental", hire: "rental", airport: "airport transfer pickup", kashmir: "azad kashmir neelum muzaffarabad",
  honeymoon: "family couples", jeep: "4x4 suv prado land cruiser", suv: "prado land cruiser fortuner revo", bus: "coaster group", van: "coaster group", wedding: "wedding event", hotel: "hotels", mari: "murree", lahor: "lahore", peshwar: "peshawar" };
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();
const lev1 = (a, b) => { if (Math.abs(a.length - b.length) > 1) return false; let i = 0, j = 0, d = 0; while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; } else { if (++d > 1) return false; if (a.length > b.length) i++; else if (a.length < b.length) j++; else { i++; j++; } } } return d + (a.length - i) + (b.length - j) <= 1; };

export function runSearch(index, query, limit = 12) {
  const q = norm(query); if (!q) return [];
  const toks = q.split(" ").flatMap((t) => [t, ...(SYN[t] ? norm(SYN[t]).split(" ") : [])]);
  const base = q.split(" ");
  const out = [];
  for (const it of index) {
    const title = it._t || (it._t = norm(it.t)), words = it._w || (it._w = title.split(" ")), hay = it._h || (it._h = norm(`${it.w || ""} ${it.d || ""}`));
    let score = 0, hit = 0;
    for (const t of base) {
      let s = 0;
      if (title.includes(t)) s = title.startsWith(t) ? 9 : words.some((w) => w.startsWith(t)) ? 7 : 5;
      else if (hay.includes(t)) s = 2;
      else if (t.length >= 4 && words.some((w) => lev1(w, t))) s = 3;
      else if (SYN[t] && norm(SYN[t]).split(" ").some((x) => title.includes(x) || hay.includes(x))) s = 2;
      if (s) { hit++; score += s; }
    }
    if (!hit) continue;
    if (hit < base.length) score *= 0.4;                       // all words matching ranks first
    if (title.includes(q)) score += 8;
    if (it.k === "Cars" || it.k === "Cities" || it.k === "Routes") score += 1;
    out.push({ it, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.it);
}

let cache = null;
function useIndex(on) {
  const [idx, setIdx] = useState(cache);
  useEffect(() => { if (!on || cache) return; fetch("/search-index.json").then((r) => r.json()).then((j) => { cache = j; setIdx(j); }).catch(() => setIdx([])); }, [on]);
  return idx;
}
const POPULAR = ["Cars", "Prado", "Murree", "Hunza", "Skardu", "Naran", "Lahore", "Airport pickup", "Wedding"];

function Results({ items, onGo }) {
  const t = useT();
  const seen = [...new Set(items.map((x) => x.k))];   // groups appear in order of their best match
  const groups = seen.map((k) => [k, items.filter((x) => x.k === k)]);
  return groups.map(([k, v]) => (
    <div className="ss__grp" key={k}><p className="ss__k">{t(k)}</p>
      <ul>{v.map((it) => (
        <li key={it.u}><Link to={it.u} onClick={onGo} className="ss__hit"><b>{it.t}</b>{it.d && <span>{it.d}</span>}</Link>{it.b && <Link to={it.b} rel="nofollow" onClick={onGo} className="ss__book">{t("Book")}</Link>}</li>
      ))}</ul>
    </div>));
}

export function SearchButton({ className = "" }) {
  const t = useT(); const [open, setOpen] = useState(false);
  useEffect(() => { const k = (e) => { if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement && document.activeElement.tagName)) { e.preventDefault(); setOpen(true); } }; addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  return <>
    <button type="button" className={`ss__btn ${className}`} onClick={() => setOpen(true)} aria-label={t("Search the website")} aria-haspopup="dialog"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg></button>
    {open && <SearchOverlay onClose={() => setOpen(false)} />}
  </>;
}

function SearchOverlay({ onClose }) {
  const t = useT(); const nav = useNavigate(); const idx = useIndex(true); const [q, setQ] = useState(""); const [sel, setSel] = useState(0); const inp = useRef(null);
  const items = useMemo(() => (idx ? runSearch(idx, q, 10) : []), [idx, q]);
  useEffect(() => { inp.current && inp.current.focus(); const prev = document.body.style.overflow; document.body.style.overflow = "hidden"; const k = (e) => e.key === "Escape" && onClose(); addEventListener("keydown", k); return () => { document.body.style.overflow = prev; removeEventListener("keydown", k); }; }, [onClose]);
  useEffect(() => setSel(0), [q]);
  const go = useCallback((to) => { onClose(); nav(to); }, [nav, onClose]);
  const key = (e) => { if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, items.length - 1)); } else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); } else if (e.key === "Enter") { e.preventDefault(); if (items[sel]) go(items[sel].u); else if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`); } };
  return createPortal(
    <div className="ss" role="dialog" aria-modal="true" aria-label={t("Search")} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ss__box">
        <div className="ss__row"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input ref={inp} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={key} placeholder={t("Search cars, cities, routes, places…")} aria-label={t("Search")} autoComplete="off" enterKeyHint="search" />
          <button type="button" className="ss__x" onClick={onClose} aria-label={t("Close")}>✕</button></div>
        <div className="ss__body">
          {!q.trim() && <div className="ss__pop"><p className="ss__k">{t("Popular searches")}</p><p>{POPULAR.map((p) => <button type="button" key={p} onClick={() => setQ(p)}>{p}</button>)}</p></div>}
          {q.trim() && !idx && <p className="ss__empty">{t("Loading…")}</p>}
          {q.trim() && idx && !items.length && <p className="ss__empty">{t("No match yet. Try a city, a car name or a route such as Hunza, Prado or Lahore.")} <Link to="/contact" onClick={onClose}>{t("Ask us on WhatsApp")}</Link></p>}
          {items.length > 0 && <Results items={items} onGo={onClose} />}
        </div>
        {q.trim() && <Link className="ss__all" to={`/search?q=${encodeURIComponent(q.trim())}`} onClick={onClose}>{t("See all results for")} “{q.trim()}”</Link>}
      </div>
    </div>, document.body);
}

export function SearchPage() {
  const t = useT(); const [sp, setSp] = useSearchParams(); const q = sp.get("q") || ""; const idx = useIndex(true);
  useSeo({ title: "Search", description: "Search cars, cities, routes, places and guides." });
  const items = useMemo(() => (idx ? runSearch(idx, q, 40) : []), [idx, q]);
  return (
    <div className="pad ss__page">
      <h1>{t("Search")}</h1>
      <form role="search" onSubmit={(e) => e.preventDefault()}><input type="search" value={q} onChange={(e) => setSp(e.target.value ? { q: e.target.value } : {}, { replace: true })} placeholder={t("Search cars, cities, routes, places…")} aria-label={t("Search")} autoFocus /></form>
      {!q && <p className="ss__pop"><span className="ss__k">{t("Popular searches")}</span> {POPULAR.map((p) => <button type="button" key={p} onClick={() => setSp({ q: p })}>{p}</button>)}</p>}
      {q && !idx && <p>{t("Loading…")}</p>}
      {q && idx && !items.length && <p>{t("No match yet. Try a city, a car name or a route such as Hunza, Prado or Lahore.")}</p>}
      {items.length > 0 && <Results items={items} onGo={() => {}} />}
    </div>
  );
}
