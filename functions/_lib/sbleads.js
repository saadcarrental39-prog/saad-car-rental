// Customers / leads on Supabase: same behaviour as leads.js (Cloudflare D1). What visitors type into the website forms is saved here
// (only after they ticked the privacy box, and also when they never press Send), so the owner can contact them. The SQL lives in supabase-setup.sql.
import { rpc } from "./sb.js";
import { pushAll } from "./push.js";
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|monitor|uptime/i;
const clip = (x, n) => String(x ?? "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, n);
const FORMS = new Set(["book", "modal", "contact", "home"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Called by POST /api/lead. Returns "ok" or the reason it was ignored. */
export async function saveLead({ env, kv, request, raw, waitUntil }) {
  if (BOT.test(request.headers.get("user-agent") || "")) return "bot";
  let b; try { b = JSON.parse(raw); } catch { return "bad_body"; }
  const vid = clip(b.v, 40).replace(/[^A-Za-z0-9-]/g, ""), src = FORMS.has(b.f) ? b.f : "";
  if (vid.length < 8 || !src) return "bad_fields";
  const phone = clip(b.phone, 25), email = clip(b.email, 80).toLowerCase(), digits = phone.replace(/\D/g, "");
  const okP = /^[\d+\s()-]{5,25}$/.test(phone) && digits.length >= 5, okE = EMAIL.test(email);
  if (!okP && !okE && clip(b.name, 60).length < 2) return "no_contact";   // a name alone is enough to save the person
  const row = { name: clip(b.name, 60), phone: okP ? phone : "", email: okE ? email : "", whatsapp: clip(b.whatsapp, 25), car: clip(b.car, 70), pickup: clip(b.pickup, 80), dropoff: clip(b.drop, 80),
    day: clip(b.date, 14), tm: clip(b.time, 8), pax: clip(b.pax, 4), extra: clip(b.extra, 300), city: clip((request.cf || {}).city, 40), dev: ["mobile", "tablet", "desktop"].includes(b.dev) ? b.dev : "" };
  const status = b.done ? "sent" : "partial", now = Date.now();
  const r = (await rpc(env, "saad_lead_save", { p_vid: vid, p_src: src, p_now: now, p_name: row.name, p_phone: row.phone, p_email: row.email, p_whatsapp: row.whatsapp, p_car: row.car,
    p_pickup: row.pickup, p_dropoff: row.dropoff, p_day: row.day, p_tm: row.tm, p_pax: row.pax, p_extra: row.extra, p_city: row.city, p_dev: row.dev, p_status: status })) || {};
  if (r.busy) return "busy";

  // phone notification the first time this visitor leaves any contact detail (a finished booking already pushes through Orders)
  const first = !r.had || (!r.prev_phone && !r.prev_email && !!(row.phone || row.email));   // push once when the person first appears, and again when a phone / email shows up
  if (kv && first && !(b.done && src !== "contact")) {
    if (Number(r.burst || 0) <= 15) {
      const who = row.name || "Naam nahi likha", how = row.phone || row.email || "phone / email abhi nahi likha";
      const job = pushAll(kv, { title: src === "contact" ? "💬 New enquiry" : "📝 Adhoora booking (send nahi kiya)", body: `${who} · ${how}${row.car ? `\n🚗 ${row.car}` : ""}`, count: Number(r.unseen || 0), id: `${vid}-${src}`, tab: "leads" }, new URL(request.url).origin);
      if (waitUntil) waitUntil(job); else await job;
    }
  }
  return "ok";
}

/** Admin app actions (all behind the admin login in functions/api/admin.js). */
export async function leadsAdmin(env, b) {
  const key = () => { const v = String(b.vid || "").replace(/[^A-Za-z0-9-]/g, ""), s = String(b.src || ""); return v && FORMS.has(s) ? [v, s] : null; };
  if (b.action === "lead_count") return { unseen: Number(((await rpc(env, "saad_lead_count"))?.unseen) || 0) };
  if (b.action === "leads") {
    const rows = (await rpc(env, "saad_lead_list")) || [];
    return { rows, unseen: rows.filter((r) => !r.seen).length };
  }
  if (b.action === "lead_seen") { await rpc(env, "saad_lead_seen"); return { ok: true }; }
  const k = key(); if (!k) return { error: "bad_key", status: 400 };
  if (b.action === "lead_update") { await rpc(env, "saad_lead_update", { p_vid: k[0], p_src: k[1], p_called: !!b.called }); return { ok: true }; }
  if (b.action === "lead_delete") { await rpc(env, "saad_lead_delete", { p_vid: k[0], p_src: k[1] }); return { ok: true }; }
  return { error: "unknown", status: 400 };
}
