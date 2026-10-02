import { SITE } from "./config";
export const clean = (s) => String(s || "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, 300);
export const newRef = () => `SCR-${Date.now().toString(36).slice(-5).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
// Short keys keep the receipt link short. Empty values are dropped.
export function makeData(d, v, ref) {
  const o = { r: ref, i: Date.now(), v: v.id, n: d.name, p: d.phone, w: d.whatsapp, em: d.email, u: d.pickup, o: d.drop, d: d.date, t: d.time, rd: d.rdate, rt: d.rtime, tr: d.trip, x: d.pax, e: d.extra };
  return Object.fromEntries(Object.entries(o).map(([k, x]) => [k, typeof x === "string" ? clean(x) : x]).filter(([, x]) => x !== "" && x != null));
}
const b64 = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
export const receiptUrl = (data) => `${location.origin}/receipt?d=${b64(JSON.stringify(data))}`;
export function decode(s) { try { const b = String(s).replace(/-/g, "+").replace(/_/g, "/"); return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b), (c) => c.charCodeAt(0)))); } catch { return null; } }
export const receiptRows = (x) => [["Customer", x.n], ["Phone", x.p], ["WhatsApp", x.w], ["Email", x.em], ["Date & Time", [x.d, x.t].filter(Boolean).join("  at ")], ["Pickup", x.u], ["Drop-off", x.o],
  ["Return", [x.rd, x.rt].filter(Boolean).join("  at ")], ["Trip type", x.tr], ["Passengers", x.x], ["Requests", x.e]].filter(([, val]) => val);
export function buildMessage(d, v, data) {
  const g = (k) => clean(d[k]) || "-";
  return [`*${SITE.name}*`, `*NEW BOOKING REQUEST*  Ref: ${data.r}`, "", `Name: ${g("name")}`, `Phone: ${g("phone")}`, `Vehicle: ${`${v.name} ${v.trim}`.trim()} (${v.color})`, "Service: With Professional Driver",
    `Date / Time: ${g("date")} ${g("time")}`, `Pickup: ${g("pickup")}`, `Drop-off: ${g("drop")}`, `Passengers: ${g("pax")}`, d.extra ? `Requirements: ${g("extra")}` : "", "", "Full receipt:", receiptUrl(data)].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
}
