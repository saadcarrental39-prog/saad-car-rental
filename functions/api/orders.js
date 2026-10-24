// Cloudflare Pages Function: POST /api/orders  (called by the website when a customer books)
// Saves the booking + receipt PNG in KV so it shows in the owner's Admin app (Orders tab), then pushes a phone notification.
// Storage: KV binding SITEDATA (or the existing RECEIPTS binding). Same binding the admin app already uses.
import { pushAll } from "../_lib/push.js";
import { addOrder, getOrders } from "../_lib/orderidx.js";
const MAX_PNG = 1.5 * 1024 * 1024, TTL = 60 * 60 * 24 * 120; // orders are kept 120 days
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const isPng = (b) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
const clean = (s, n = 60) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, n);
const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");

export async function onRequestPost({ request, env, waitUntil }) {
  const kv = env.SITEDATA || env.RECEIPTS; if (!kv) return json({ ok: false, error: "no_storage" }, 503);
  let form; try { form = await request.formData(); } catch { return json({ ok: false, error: "bad_request" }, 400); }
  const file = form.get("file");
  if (!file || typeof file === "string" || file.size < 1000 || file.size > MAX_PNG) return json({ ok: false, error: "bad_file" }, 400);
  const png = new Uint8Array(await file.arrayBuffer()); if (!isPng(png)) return json({ ok: false, error: "bad_file" }, 400);
  const o = { ref: clean(form.get("ref"), 30).replace(/[^A-Za-z0-9-]/g, ""), name: clean(form.get("name"), 60), phone: clean(form.get("phone"), 25), car: clean(form.get("car"), 70),
    pickup: clean(form.get("pickup"), 80), drop: clean(form.get("drop"), 80), date: clean(form.get("date"), 14), time: clean(form.get("time"), 8), pax: clean(form.get("pax"), 4), extra: clean(form.get("extra"), 600), svc: ["out", "local"].includes(clean(form.get("svc"), 8)) ? clean(form.get("svc"), 8) : "", whatsapp: /^[\d+\s()-]{7,25}$/.test(clean(form.get("whatsapp"), 25)) ? clean(form.get("whatsapp"), 25) : "", email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean(form.get("email"), 60)) ? clean(form.get("email"), 60) : "" };
  if (!o.ref || !o.name || o.phone.replace(/\D/g, "").length < 7) return json({ ok: false, error: "bad_fields" }, 400);

  const ip = request.headers.get("CF-Connecting-IP") || "x", rl = `rl:ord:${ip}`, tries = Number(await kv.get(rl)) || 0;
  if (tries >= 20) return json({ ok: false, error: "too_many" }, 429);
  const id = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${o.ref}|${o.phone}`))).slice(0, 20);
  if (await kv.get(`oid:${id}`)) return json({ ok: true, id, dup: true });            // same receipt sent twice -> keep one order
  await kv.put(rl, String(tries + 1), { expirationTtl: 3600 });

  const ts = Date.now(), meta = { id, ts, seen: 0, ...o };
  // KV metadata must stay under 1024 bytes (Urdu text takes 2-3 bytes per letter): shorten the long fields if needed.
  for (const k of ["extra", "email", "pickup", "drop", "car", "name"]) { while (new TextEncoder().encode(JSON.stringify(meta)).length > 980 && meta[k].length > 12) meta[k] = meta[k].slice(0, Math.floor(meta[k].length * 0.7)); }
  try {
    await Promise.all([
      kv.put(`oimg:${id}`, png, { expirationTtl: TTL }),
      kv.put(`ord:${String(9999999999999 - ts).padStart(13, "0")}:${id}`, "1", { expirationTtl: TTL, metadata: meta }),   // newest first when listed
      kv.put(`oid:${id}`, "1", { expirationTtl: TTL }),
    ]);
  } catch { return json({ ok: false, error: "storage" }, 502); }

  await addOrder(kv, meta);                                                                  // keep the Admin app's order list (index) current
  let unread = 1; try { unread = Math.max(1, (await getOrders(kv)).filter((m) => !m.seen).length); } catch { /* the count is only a bonus */ }
  const job = pushAll(kv, { title: "🚘 New Booking Order", body: `${o.name} · ${o.car}\n📍 ${o.pickup} → ${o.drop}\n📅 ${o.date} ⏰ ${o.time}`, count: unread, id }, new URL(request.url).origin);
  if (waitUntil) waitUntil(job); else await job;
  return json({ ok: true, id });
}
export const onRequest = () => json({ ok: false, error: "method_not_allowed" }, 405);
