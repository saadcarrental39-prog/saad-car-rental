import { useEffect, useState } from "react";
import { SITE } from "../../config";
// Local-only sample so you can see the design with `npm run dev` (Pages Functions don't run in plain Vite).
// In the production build this branch is removed, so sample data can never appear on the live site.
const SAMPLE = { sample: true, google: { rating: 5, count: 211, mapsUrl: "", writeUrl: "", reviews: [
  { id: "s1", source: "google", name: "Sample Reviewer", rating: 5, text: "Sample text for the local preview. Real Google reviews appear here once the API is connected.", date: "2026-09-01T00:00:00Z", when: "a month ago" },
  { id: "s2", source: "google", name: "Another Sample", rating: 5, text: "Second sample card, only visible while testing on your own computer.", date: "2026-08-01T00:00:00Z", when: "2 months ago" },
  { id: "s3", source: "google", name: "Third Sample", rating: 4, text: "A four star sample so you can check partial stars and card heights.", date: "2026-07-01T00:00:00Z", when: "3 months ago" }] }, site: [] };
let cache = null;
export function loadReviews(force = false) {
  if (!cache || force) cache = fetch(`/api/reviews${force ? `?t=${Date.now()}` : ""}`, { headers: { accept: "application/json" } })
    .then((r) => { if (!r.ok || !(r.headers.get("content-type") || "").includes("json")) throw new Error("no api"); return r.json(); })
    .catch(() => (import.meta.env.DEV ? SAMPLE : { google: null, site: [] }));
  return cache;
}
export function useReviews() {
  const [d, setD] = useState(null);
  useEffect(() => {
    let on = true; const run = (f) => loadReviews(f).then((x) => on && setD(x));
    run(false); const h = () => run(true); window.addEventListener("reviews-updated", h);
    return () => { on = false; window.removeEventListener("reviews-updated", h); };
  }, []);
  return d;
}

/* ---------- live Google rating + review count for every number on the website ----------
   Shows the fixed number from business.config.js first, then switches to the live Google number (server asks Google at most once an hour). */
const SUM_KEY = "saad_rvsum";
let sumCache = null;
export function loadSummary() {
  if (!sumCache) sumCache = fetch("/api/reviews?summary=1", { headers: { accept: "application/json" } })
    .then((r) => (r.ok && (r.headers.get("content-type") || "").includes("json") ? r.json() : null))
    .then((d) => (d && d.count != null ? d : null)).catch(() => null);
  return sumCache;
}
export function useReviewSummary() {
  const [d, setD] = useState(() => { try { const v = JSON.parse(sessionStorage.getItem(SUM_KEY) || "null"); return v && v.count != null ? v : null; } catch { return null; } });
  useEffect(() => {
    let on = true;
    // asked after the page has loaded + the browser is idle, so it never slows the first paint
    const go = () => (window.requestIdleCallback ? requestIdleCallback(run, { timeout: 4000 }) : setTimeout(run, 2500));
    const run = () => loadSummary().then((x) => { if (x && on) { setD(x); try { sessionStorage.setItem(SUM_KEY, JSON.stringify(x)); } catch { /* ignore */ } } });
    if (document.readyState === "complete") go(); else addEventListener("load", () => setTimeout(go, 300), { once: true });
    return () => { on = false; };
  }, []);
  return { rating: d && d.rating != null ? Number(d.rating).toFixed(1) : SITE.rating, count: d ? d.count : SITE.reviewCount, live: !!d };
}
