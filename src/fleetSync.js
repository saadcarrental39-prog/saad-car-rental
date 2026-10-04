import { applyOverrides } from "./data/fleet";
// Loads prices/cars saved from the admin app. Uses the saved copy instantly (no waiting) and refreshes in the background.
const KEY = "fleet-ov";
const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
export const saveLocal = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* ignore */ } };
export async function initFleet() {
  let cur = get(); if (cur) { try { applyOverrides(JSON.parse(cur)); } catch { cur = null; } }
  const fresh = fetch("/api/fleet", { cache: "no-store" }).then((r) => (r.ok && (r.headers.get("content-type") || "").includes("json") ? r.json() : null)).catch(() => null);
  const apply = (d, live) => { const s = JSON.stringify(d); if (s === cur) return; cur = s; applyOverrides(d); saveLocal(d); if (live) window.dispatchEvent(new Event("fleet-updated")); };
  if (!cur) { const d = await Promise.race([fresh, new Promise((r) => setTimeout(() => r(null), 1200))]); if (d) apply(d, false); }
  fresh.then((d) => d && apply(d, true));
}
