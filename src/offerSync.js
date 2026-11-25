import { setOffer } from "./offer";
// Loads the on/off switch saved in the admin app. Uses the saved copy instantly, then refreshes in the background and re-renders the page if it changed.
const KEY = "offer-ov";
const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
export async function initOffer() {
  let cur = get(); if (cur) { try { setOffer(JSON.parse(cur)); } catch { cur = null; } }
  const fresh = fetch("/api/offer", { cache: "no-store" }).then((r) => (r.ok && (r.headers.get("content-type") || "").includes("json") ? r.json() : null)).catch(() => null);
  const apply = (d, live) => { const s = JSON.stringify(d); if (s === cur) return; cur = s; setOffer(d); try { localStorage.setItem(KEY, s); } catch { /* ignore */ } if (live) window.dispatchEvent(new Event("fleet-updated")); };
  if (!cur) { const d = await Promise.race([fresh, new Promise((r) => setTimeout(() => r(null), 350))]); if (d) apply(d, false); }
  fresh.then((d) => d && apply(d, true));
}
