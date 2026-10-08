// Conversion tracking. Sends events to Google Analytics 4 (set VITE_GA4_ID) and/or Cloudflare Web Analytics (VITE_CF_BEACON),
// and always pushes to window.dataLayer so Google Tag Manager also works. No personal data (names, phone numbers) is ever sent.
// Events: phone_click, whatsapp_click, email_click, booking_click, quote_start, quote_submit, form_error,
//         vehicle_view, service_view, route_view, location_view (page views of those page types)
import { BUSINESS } from "./business.config";
const SRC_KEY = "saad_attr";

export function track(name, params = {}) {
  try {
    const p = { page_path: location.pathname, ...attribution(), device: matchMedia("(max-width:900px)").matches ? "mobile" : "desktop", ...params };
    (window.dataLayer = window.dataLayer || []).push({ event: name, ...p });
    if (typeof window.gtag === "function") window.gtag("event", name, p);
  } catch { /* analytics must never break the site */ }
}
function attribution() {
  try {
    const q = new URLSearchParams(location.search); let a = JSON.parse(sessionStorage.getItem(SRC_KEY) || "null");
    if (!a) { a = { landing_page: location.pathname, source: q.get("utm_source") || (document.referrer ? new URL(document.referrer).hostname : "direct"), medium: q.get("utm_medium") || (document.referrer ? "referral" : "none") }; sessionStorage.setItem(SRC_KEY, JSON.stringify(a)); }
    return a;
  } catch { return {}; }
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
