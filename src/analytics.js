// Conversion tracking. Sends events to Google Analytics 4 (set VITE_GA4_ID) and/or Cloudflare Web Analytics (VITE_CF_BEACON),
// and always pushes to window.dataLayer so Google Tag Manager also works. No personal data (names, phone numbers) is ever sent.
// Events: phone_click, whatsapp_click, email_click, booking_click, quote_start, quote_submit, form_error,
//         vehicle_view, service_view, route_view, location_view (page views of those page types)
import { BUSINESS } from "./business.config";
import { ADMIN_PATH } from "./config";
const SRC_KEY = "saad_attr";

export function track(name, params = {}) {
  try {
    const p = { page_path: location.pathname, ...attribution(), device: matchMedia("(max-width:900px)").matches ? "mobile" : "desktop", ...params };
    (window.dataLayer = window.dataLayer || []).push({ event: name, ...p });
    if (typeof window.gtag === "function") window.gtag("event", name, p);
    beacon(name, params.item);
  } catch { /* analytics must never break the site */ }
}
function attribution() {
  try {
    const q = new URLSearchParams(location.search); let a = JSON.parse(sessionStorage.getItem(SRC_KEY) || "null");
    if (!a) { a = { landing_page: location.pathname, source: q.get("utm_source") || (document.referrer ? new URL(document.referrer).hostname : "direct"), medium: q.get("utm_medium") || (document.referrer ? "referral" : "none") }; sessionStorage.setItem(SRC_KEY, JSON.stringify(a)); }
    return a;
  } catch { return {}; }
}

/* ---------- First-party counter for the owner's Insights dashboard (stored in Cloudflare D1 via /api/collect) ----------
   Anonymous: a random id per browser (new vs returning visitor) and per tab session. No name, phone or IP is sent or stored.
   The owner's own phone/PC is skipped automatically once the Admin app has been opened on it. */
const VID_KEY = "saad_vid", SID_KEY = "saad_sid";
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`);
const stored = (store, key) => { try { let v = store.getItem(key); if (!v) { v = uid(); store.setItem(key, v); } return v; } catch { return uid(); } };
const skip = () => { try { return localStorage.getItem("saad_owner") === "1" || navigator.doNotTrack === "1" || location.pathname.startsWith(ADMIN_PATH); } catch { return false; } };
const SRC = [[/google\./, "google"], [/bing\.com/, "bing"], [/duckduckgo|yahoo\./, "search"], [/facebook\.com|fb\.com|fb\.me|l\.facebook/, "facebook"], [/instagram\.com/, "instagram"], [/(^|\.)wa\.me|whatsapp/, "whatsapp"], [/youtube\.com|youtu\.be/, "youtube"], [/tiktok\.com/, "tiktok"], [/(^|\.)t\.co$|twitter\.com|x\.com/, "x"]];
function source() {
  const a = attribution() || {}, s = String(a.source || "direct").toLowerCase();
  if (s === "direct") return "direct";
  const hit = SRC.find(([re]) => re.test(s)); if (hit) return hit[1];
  try { if (s === location.hostname || s.replace(/^www\./, "") === location.hostname.replace(/^www\./, "")) return "direct"; } catch { /* ignore */ }
  return s.replace(/^www\./, "").slice(0, 30);
}
const device = () => { const w = innerWidth; return w <= 700 ? "mobile" : w <= 1100 ? "tablet" : "desktop"; };
function beacon(type, item) {
  try {
    if (skip()) return;
    const body = JSON.stringify({ t: type === "pageview" ? "pv" : type, v: stored(localStorage, VID_KEY), s: stored(sessionStorage, SID_KEY), p: location.pathname, i: item || "", r: source(), d: device() });
    if (!(navigator.sendBeacon && navigator.sendBeacon("/api/collect", new Blob([body], { type: "text/plain" })))) fetch("/api/collect", { method: "POST", body, keepalive: true, headers: { "content-type": "text/plain" } }).catch(() => {});
  } catch { /* analytics must never break the site */ }
}
let lastPv = "";
function pageview() { const p = location.pathname; if (p === lastPv) return; lastPv = p; beacon("pageview"); }
function watchRoutes() {   // single-page site: count every route change, not just the first load
  for (const m of ["pushState", "replaceState"]) { const o = history[m]; history[m] = function () { const r = o.apply(this, arguments); setTimeout(pageview, 0); return r; }; }
  addEventListener("popstate", () => setTimeout(pageview, 0));
  pageview();
}
const VIEW = { vehicle: "vehicle_view", service: "service_view", route: "route_view", location: "location_view", destination: "location_view" };
export const trackPageType = (kind, slug) => VIEW[kind] && track(VIEW[kind], { item: slug });

export function initAnalytics() {
  const { ga4, cfBeacon } = BUSINESS.analytics;
  const load = () => {
    if (ga4) {
      window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date()); window.gtag("config", ga4, { send_page_view: true });
      const s = document.createElement("script"); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`; document.head.appendChild(s);
    }
    if (cfBeacon) { const s = document.createElement("script"); s.defer = true; s.src = "https://static.cloudflareinsights.com/beacon.min.js"; s.setAttribute("data-cf-beacon", JSON.stringify({ token: cfBeacon })); document.head.appendChild(s); }
  };
  (window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(load); // never delays the first paint
  watchRoutes();
  // One delegated listener: every tel: / WhatsApp / mailto / booking link on every page is tracked automatically.
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]"); if (!a) return; const h = a.getAttribute("href") || "";
    if (h.startsWith("tel:")) track("phone_click");
    else if (/wa\.me|whatsapp\.com/.test(h)) track("whatsapp_click");
    else if (h.startsWith("mailto:")) track("email_click");
    else if (h.startsWith("/book")) track("booking_click", { label: a.textContent.trim().slice(0, 40) });
  }, true);
  let started = false;
  document.addEventListener("focusin", (e) => { if (!started && e.target.closest && e.target.closest("form")) { started = true; track("quote_start"); } });
}
