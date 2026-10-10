// Customers / leads: what visitors type into the website forms is saved here even when they never press Send, so the owner can contact them.
// Only what the visitor typed is stored (name, phone, email, trip details). The forms tell the visitor this. Data lives in D1 (binding DB).
import { ensure } from "./stats.js";
import { pushAll } from "./push.js";
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|monitor|uptime/i;
const clip = (x, n) => String(x ?? "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, n);
const FORMS = new Set(["book", "modal", "contact", "home"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DAY = 864e5;
const COLS = ["name", "phone", "email", "whatsapp", "car", "pickup", "dropoff", "day", "tm", "pax", "extra", "city", "dev"];

/** Called by POST /api/lead. Returns "ok" or the reason it was ignored. */
export async function saveLead({ db, kv, request, raw, waitUntil }) {
  if (BOT.test(request.headers.get("user-agent") || "")) return "bot";
  let b; try { b = JSON.parse(raw); } catch { return "bad_body"; }
  const vid = clip(b.v, 40).replace(/[^A-Za-z0-9-]/g, ""), src = FORMS.has(b.f) ? b.f : "";
  if (vid.length < 8 || !src) return "bad_fields";
  const phone = clip(b.phone, 25), email = clip(b.email, 80).toLowerCase(), digits = phone.replace(/\D/g, "");
  const okP = /^[\d+\s()-]{9,25}$/.test(phone) && digits.length >= 9, okE = EMAIL.test(email);
  if (!okP && !okE) return "no_contact";
  const row = { name: clip(b.name, 60), phone: okP ? phone : "", email: okE ? email : "", whatsapp: clip(b.whatsapp, 25), car: clip(b.car, 70), pickup: clip(b.pickup, 80), dropoff: clip(b.drop, 80),
    day: clip(b.date, 14), tm: clip(b.time, 8), pax: clip(b.pax, 4), extra: clip(b.extra, 300), city: clip((request.cf || {}).city, 40), dev: ["mobile", "tablet", "desktop"].includes(b.dev) ? b.dev : "" };
  const status = b.done ? "sent" : "partial", now = Date.now();
  await ensure(db);
  const prev = await db.prepare(`SELECT phone, email, status FROM leads WHERE vid=?1 AND src=?2`).bind(vid, src).first();
  if (!prev) {   // flood guard: a bot cannot fill the list
    const c = await db.prepare(`SELECT COUNT(*) n FROM leads WHERE created > ?`).bind(now - 3600e3).first();
    if ((c?.n || 0) > 400) return "busy";
  }
  const set = COLS.map((k) => `${k}=CASE WHEN excluded.${k}<>'' THEN excluded.${k} ELSE leads.${k} END`).join(", ");
  await db.prepare(`INSERT INTO leads (vid, src, created, updated, ${COLS.join(", ")}, status) VALUES (?1, ?2, ?3, ?3, ${COLS.map((_, i) => `?${i + 4}`).join(", ")}, ?${COLS.length + 4})
    ON CONFLICT(vid, src) DO UPDATE SET updated=excluded.updated, ${set},
      status=CASE WHEN leads.status='sent' OR excluded.status='sent' THEN 'sent' ELSE 'partial' END,
      seen=CASE WHEN excluded.status='sent' AND leads.status<>'sent' THEN 0 ELSE leads.seen END`)
    .bind(vid, src, now, ...COLS.map((k) => row[k]), status).run();
  if (Math.random() < 0.01) await db.prepare(`DELETE FROM leads WHERE updated < ?`).bind(now - 730 * DAY).run();   // keep 2 years

  // phone notification the first time this visitor leaves any contact detail (a finished booking already pushes through Orders)
  const first = !prev || (!prev.phone && !prev.email);
  if (kv && first && !(b.done && src !== "contact")) {
    const burst = await db.prepare(`SELECT COUNT(*) n FROM leads WHERE created > ?`).bind(now - 60e3).first();
    if ((burst?.n || 0) <= 15) {
      const unseen = (await db.prepare(`SELECT COUNT(*) n FROM leads WHERE seen=0`).first())?.n || 0, who = row.name || "Naam nahi likha", how = row.phone || row.email;
      const job = pushAll(kv, { title: src === "contact" ? "💬 New enquiry" : "📝 Adhoora booking (send nahi kiya)", body: `${who} · ${how}${row.car ? `\n🚗 ${row.car}` : ""}`, count: unseen, id: `${vid}-${src}`, tab: "leads" }, new URL(request.url).origin);
      if (waitUntil) waitUntil(job); else await job;
    }
  }
  return "ok";
}

/** Admin app actions (all behind the admin login in functions/api/admin.js). */
export async function leadsAdmin(db, b) {
  await ensure(db);
  const key = () => { const v = String(b.vid || "").replace(/[^A-Za-z0-9-]/g, ""), s = String(b.src || ""); return v && FORMS.has(s) ? [v, s] : null; };
  if (b.action === "lead_count") return { unseen: (await db.prepare(`SELECT COUNT(*) n FROM leads WHERE seen=0`).first())?.n || 0 };
  if (b.action === "leads") {
    const rows = (await db.prepare(`SELECT vid, src, created, updated, name, phone, email, whatsapp, car, pickup, dropoff, day, tm, pax, extra, city, dev, status, seen, called FROM leads ORDER BY updated DESC LIMIT 500`).all()).results || [];
    return { rows, unseen: rows.filter((r) => !r.seen).length };
  }
  if (b.action === "lead_seen") { await db.prepare(`UPDATE leads SET seen=1 WHERE seen=0`).run(); return { ok: true }; }
  const k = key(); if (!k) return { error: "bad_key", status: 400 };
  if (b.action === "lead_update") { await db.prepare(`UPDATE leads SET called=?3 WHERE vid=?1 AND src=?2`).bind(k[0], k[1], b.called ? 1 : 0).run(); return { ok: true }; }
  if (b.action === "lead_delete") { await db.prepare(`DELETE FROM leads WHERE vid=?1 AND src=?2`).bind(k[0], k[1]).run(); return { ok: true }; }
  return { error: "unknown", status: 400 };
}
