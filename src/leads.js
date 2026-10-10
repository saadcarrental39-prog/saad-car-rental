// Saves what a visitor TYPED into a booking / contact form (also when they never press Send), so the owner can contact them.
// Only the form fields are sent. Nothing is read from the browser, the device or the visitor's accounts.
// It starts only once a valid phone number (or email) has been typed and the visitor paused typing, and it is told on the form.
import { ADMIN_PATH } from "./config";
const VID_KEY = "saad_vid", URL_ = "/api/lead";
const PHONE = /^[\d+\s()-]{5,25}$/, EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
let mem = "", pending = null, lastKey = "", timer = 0, wired = false;

const owner = () => { try { return localStorage.getItem("saad_skip") === "1" || location.pathname.startsWith(ADMIN_PATH); } catch { return false; } };
const vid = () => { try { let v = localStorage.getItem(VID_KEY); if (!v) { v = crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`; localStorage.setItem(VID_KEY, v); } return v; } catch { return (mem = mem || `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`); } };
const dev = () => (/Mobi|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop");

function pack(form, d, x, done) {
  const phone = String(d.phone || d.whatsapp || "").trim(), email = String(d.email || "").trim(), name = String(d.name || "").trim(), v = vid();
  const okP = PHONE.test(phone) && phone.replace(/\D/g, "").length >= 5, okE = EMAIL.test(email);
  // Anything that lets the owner follow up is enough: a name, a (even half-typed) phone number, or an email.
  if (!v || (!okP && !okE && name.length < 2)) return null;
  return { v, f: form, name: d.name, phone: okP ? phone : "", email: okE ? email : "", whatsapp: d.whatsapp, car: x.car || d.car, pickup: d.pickup, drop: d.drop, date: d.date, time: d.time, pax: d.pax, extra: x.extra ?? d.extra ?? d.message, dev: dev(), ...(done ? { done: true } : {}) };
}
function send(p) {
  const body = JSON.stringify(p);
  try { if (navigator.sendBeacon && navigator.sendBeacon(URL_, new Blob([body], { type: "text/plain" }))) return; } catch { /* fall through */ }
  try { fetch(URL_, { method: "POST", body, keepalive: true, headers: { "content-type": "text/plain" } }).catch(() => {}); } catch { /* ignore */ }
}
function flush() {
  clearTimeout(timer); timer = 0; if (!pending) return;
  const p = pending, key = JSON.stringify(p); pending = null; if (key === lastKey) return; lastKey = key; send(p);
}
function wire() {
  if (wired) return; wired = true;
  addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());   // phone: tab switched / app closed
}
/** Call whenever the form values change. Sends 2.5 s after the visitor stops typing, or right away when the page is left. */
export function captureLead(form, d, x = {}) {
  if (owner()) return; const p = pack(form, d || {}, x, false); if (!p) return;
  wire(); pending = p; clearTimeout(timer); timer = setTimeout(flush, 2500);
}
/** Call when the visitor really sent the form: marks the customer as "Send kiya". */
export function completeLead(form, d, x = {}) {
  if (owner()) return; const p = pack(form, d || {}, x, true); if (!p) return;
  wire(); pending = p; flush();
}
