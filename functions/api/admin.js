// POST /api/admin  { action: "login" | "load" | "save" | "upload", ... }
// The password is checked HERE on the server (never in the browser). Set in Cloudflare Pages > Settings > Variables:
//   ADMIN_USER, ADMIN_PASS (secret)   optional: ADMIN_SECRET (extra signing secret)
// Storage: KV binding SITEDATA (or the existing RECEIPTS binding).
import { getVapid, subId } from "../_lib/push.js";
import { stats, liveFeed, activityFeed, dayOf, addDays, RANGE_DAYS } from "../_lib/stats.js";
import { leadsAdmin } from "../_lib/leads.js";
import { hasSb } from "../_lib/sb.js";
import * as SB from "../_lib/sbstats.js";
import * as SBL from "../_lib/sbleads.js";
import { listPosts, getPost, savePost, deletePost, pingIndexNow, SITE } from "../_lib/posts.js";
import { getOrders, markSeen, removeOrder } from "../_lib/orderidx.js";
const enc = new TextEncoder();
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const same = (a, b) => { a = String(a); b = String(b); let d = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return d === 0; };
async function sign(env, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(`${env.ADMIN_SECRET || ""}|${env.ADMIN_PASS}|${env.ADMIN_USER}|saad-admin-v1`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(msg))))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
const mint = async (env) => { const exp = String(Date.now() + 30 * 864e5); return `${exp}.${await sign(env, exp)}`; };   // valid 30 days; changing the password logs everyone out
const valid = async (env, t) => { const [exp, sig] = String(t).split("."); return !!(exp && sig && Number(exp) > Date.now() && same(sig, await sign(env, exp))); };

const s = (x, n) => String(x ?? "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
const slug = (x) => s(x, 40).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const price = (x) => { const n = Math.round(Number(x)); return n > 0 && n < 10000000 ? n : null; };
const img = (x) => (/^\/api\/img\/[a-f0-9]{16}$/.test(String(x)) || /^\/assets\/[A-Za-z0-9._\/-]{1,120}$/.test(String(x)) ? String(x) : "");
const THEMES = ["white", "black", "grey", "red", "plum", "blue"];
function fields(o) {
  const r = {};
  if ("price" in o) r.price = price(o.price);
  if ("priceOut" in o) r.priceOut = price(o.priceOut);
  if (o.hidden) r.hidden = true;
  for (const [k, n] of [["name", 60], ["trim", 30], ["color", 40], ["subtitle", 40], ["description", 200]]) if (s(o[k], n)) r[k] = s(o[k], n);
  if (img(o.image)) r.image = img(o.image);
  return r;
}
function clean(d) {
  d = d && typeof d === "object" ? d : {};
  const out = { v: 1, vehicles: {}, added: [], cats: [] };
  for (const [id, o] of Object.entries(d.vehicles || {}).slice(0, 200)) if (slug(id) && o && typeof o === "object") out.vehicles[slug(id)] = fields(o);
  const cats = new Set();
  for (const c of (d.cats || []).slice(0, 20)) { const sl = slug(c.slug || c.title), title = s(c.title, 40); if (sl && title && !cats.has(sl)) { cats.add(sl); out.cats.push({ slug: sl, title, description: s(c.description, 200) }); } }
  const ids = new Set();
  for (const a of (d.added || []).slice(0, 100)) {
    const id = slug(a.id), cat = slug(a.cat);
    if (!id || !cat || ids.has(id) || !s(a.name, 60)) continue; ids.add(id);
    out.added.push({ id, cat, theme: THEMES.includes(a.theme) ? a.theme : "white", ...fields(a), name: s(a.name, 60) });
  }
  return out;
}

async function orderCounts(kv, range) {
  try {
    const l = await getOrders(kv), days = l.map((m) => dayOf(Number(m.ts) || 0)).filter((d) => d > "2000"), today = dayOf(Date.now()), n = RANGE_DAYS[range] || 7;
    const between = (a, b) => days.filter((d) => d >= a && d <= b).length, from = addDays(today, -(n - 1)), pTo = addDays(from, -1);
    return { cur: between(from, today), prev: between(addDays(pTo, -(n - 1)), pTo), today: between(today, today), week: between(addDays(today, -6), today), month: between(addDays(today, -29), today) };
  } catch { return null; }
}
export async function onRequestPost(ctx) {   // any unexpected crash answers with a readable reason (shown in the app) instead of a bare 500
  try { return await handle(ctx); } catch (e) { return json({ error: "server_error", detail: String((e && e.message) || e).slice(0, 160) }, 500); }
}
async function handle({ request, env, waitUntil }) {
  if (!env.ADMIN_USER || !env.ADMIN_PASS) return json({ error: "admin_not_configured" }, 503);
  const kv = env.SITEDATA || env.RECEIPTS; if (!kv) return json({ error: "no_storage" }, 503);
  if (Number(request.headers.get("content-length") || 0) > 1.7e6) return json({ error: "too_big" }, 413);
  let b; try { b = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  if (b.action === "login") {
    const rl = `rl:admin:${request.headers.get("CF-Connecting-IP") || "x"}`, tries = Number(await kv.get(rl)) || 0;
    if (tries >= 8) return json({ error: "too_many" }, 429);
    if (same(s(b.user, 60), env.ADMIN_USER) & same(String(b.pass || "").slice(0, 200), env.ADMIN_PASS)) return json({ token: await mint(env) });
    await kv.put(rl, String(tries + 1), { expirationTtl: 900 });
    return json({ error: "invalid" }, 401);
  }
  if (!(await valid(env, (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")))) return json({ error: "unauthorized" }, 401);
  if (b.action === "orders") {                                       // newest first; unread = seen is 0
    try { const list = (await getOrders(kv)).slice(0, 300); return json({ orders: list, unread: list.filter((m) => !m.seen).length }); }
    catch (e) { return json({ error: "orders_failed", detail: String((e && e.message) || e).slice(0, 160) }, 500); }
  }
  if (b.action === "order_seen") {
    const ids = (Array.isArray(b.ids) ? b.ids : []).map(String).slice(0, 100); if (!ids.length) return json({ ok: true });
    await markSeen(kv, ids); return json({ ok: true });
  }
  if (b.action === "order_del") {
    const id = String(b.id || ""); if (!/^[a-f0-9]{20}$/.test(id)) return json({ error: "bad_request" }, 400);
    await removeOrder(kv, id); return json({ ok: true });
  }
  if (b.action === "stats") {                                       // website analytics for the Insights tab (data lives in Supabase, or in D1 binding DB if Supabase is not set up)
    if (!env.DB && !hasSb(env)) return json({ error: "no_db" }, 503);
    try {
      const data = await (hasSb(env) ? SB.stats(env, String(b.range || "7d")) : stats(env.DB, String(b.range || "7d")));
      data.orders = await orderCounts(kv, data.range);          // bookings received through the website (Orders tab), same period + previous period
      return json(data);
    } catch (e) { return json({ error: "stats_failed", detail: String((e && e.message) || e).slice(0, 160) }, 500); }
  }
  if (b.action === "activity") {                                    // older activity, page by page (the "Taza activity" sheet scrolls back to the very first visit)
    if (!env.DB && !hasSb(env)) return json({ error: "no_db" }, 503);
    try { return json(await (hasSb(env) ? SB.activityFeed(env, b.before) : activityFeed(env.DB, b.before))); } catch (e) { return json({ error: "activity_failed", detail: String((e && e.message) || e).slice(0, 160) }, 500); }
  }
  if (b.action === "live") {                                        // who is on the website right now (polled every ~4 s by the dashboard)
    if (!env.DB && !hasSb(env)) return json({ error: "no_db" }, 503);
    try { return json(await (hasSb(env) ? SB.liveFeed(env, Math.max(0, Number(b.since) || 0)) : liveFeed(env.DB, Math.max(0, Number(b.since) || 0)))); } catch (e) { return json({ error: "live_failed", detail: String((e && e.message) || e).slice(0, 160) }, 500); }
  }
  if (typeof b.action === "string" && b.action.startsWith("lead")) {   // customers / leads typed into the website forms (Clients tab)
    if (!env.DB && !hasSb(env)) return json({ error: "no_db" }, 503);
    try { const r = await (hasSb(env) ? SBL.leadsAdmin(env, b) : leadsAdmin(env.DB, b)); return json(r, r.status || 200); } catch (e) { return json({ error: "leads_failed", detail: String((e && e.message) || e).slice(0, 160) }, 500); }
  }
  if (b.action === "reviews_get") {                                  // Google review numbers shown on the website (manual backup + live status)
    const get = async (k) => { try { return JSON.parse((await kv.get(k)) || "null"); } catch { return null; } }, g = await get("reviews:g");
    return json({ manual: await get("reviews:manual"), google: g ? { rating: g.rating ?? null, count: g.count ?? null, ts: g.ts || 0, err: g.err || "" } : null, configured: !!(env.GOOGLE_PLACES_API_KEY && env.GOOGLE_PLACE_ID) });
  }
  if (b.action === "reviews_set") {
    const count = Math.round(Number(b.count)), rating = Math.round(Number(b.rating) * 10) / 10;
    if (!(count >= 0 && count <= 1e6)) return json({ error: "bad_count" }, 400);
    if (!(rating >= 1 && rating <= 5)) return json({ error: "bad_rating" }, 400);
    await kv.put("reviews:manual", JSON.stringify({ rating, count, ts: Date.now() })); return json({ ok: true });
  }
  if (b.action === "reviews_refresh") {                              // ask Google again on the next /api/reviews?summary=1 call
    try { const g = JSON.parse((await kv.get("reviews:g")) || "null"); if (g) await kv.put("reviews:g", JSON.stringify({ ...g, tried: 0 })); } catch { /* nothing stored yet */ }
    return json({ ok: true });
  }
  if (b.action === "push_key") return json({ key: (await getVapid(kv)).pub });
  if (b.action === "push_sub") {
    const sub = b.sub; if (!sub?.endpoint || !/^https:\/\//.test(sub.endpoint) || !sub.keys?.p256dh || !sub.keys?.auth) return json({ error: "bad_request" }, 400);
    await kv.put(`push:sub:${await subId(sub.endpoint)}`, JSON.stringify({ endpoint: sub.endpoint, keys: { p256dh: String(sub.keys.p256dh), auth: String(sub.keys.auth) } }));
    return json({ ok: true });
  }
  if (b.action === "push_off") { if (b.endpoint) await kv.delete(`push:sub:${await subId(String(b.endpoint))}`); return json({ ok: true }); }
  if (b.action === "load") { try { return json({ data: JSON.parse((await kv.get("site:fleet")) || "{}") }); } catch { return json({ data: {} }); } }
  if (b.action === "save") {
    const data = clean(b.data), old = await kv.get("site:fleet");
    if (old) await kv.put("site:fleet:prev", old);              // one step of undo-backup
    await kv.put("site:fleet", JSON.stringify(data));
    return json({ ok: true, data });
  }
  if (b.action === "spots_load") { try { return json({ data: JSON.parse((await kv.get("site:spots")) || "{}") }); } catch { return json({ data: {} }); } }
  if (b.action === "spots_save") {                                    // photos for the Murree tourist-spot pages (Spots tab)
    const out = { v: 1, spots: {} }, src = b.data && typeof b.data === "object" && b.data.spots && typeof b.data.spots === "object" ? b.data.spots : {};
    for (const [sl, list] of Object.entries(src).slice(0, 60)) {
      if (!/^[a-z0-9-]{2,70}$/.test(sl) || !Array.isArray(list)) continue;
      const imgs = list.slice(0, 12).map((i) => ({ url: String((i && i.url) || "").trim(), alt: s((i && i.alt) || "", 140), caption: s((i && i.caption) || "", 160) }))
        .filter((i) => /^https:\/\/[^\s"'<>]{4,600}$/.test(i.url) || /^\/api\/img\/[a-f0-9]{16}$/.test(i.url));
      if (imgs.length) out.spots[sl] = imgs;
    }
    const old = await kv.get("site:spots"); if (old) await kv.put("site:spots:prev", old);
    await kv.put("site:spots", JSON.stringify(out));
    return json({ ok: true, data: out });
  }
  if (b.action === "posts_list") { try { return json({ posts: await listPosts(kv, { drafts: true }) }); } catch { return json({ posts: [] }); } }   // Posts tab: every post incl. drafts / scheduled
  if (b.action === "posts_get") { const p = await getPost(kv, String(b.slug || ""), true); return p ? json({ post: p }) : json({ error: "not_found" }, 404); }
  if (b.action === "posts_save") {                                  // Posts tab: create / edit one post. It is live on /posts/<slug> as soon as status is published and the date has come.
    const r = await savePost(kv, b.post, b.old); if (r.error) return json(r, 400);
    const live = r.post.status === "published" && r.post.date <= new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);
    if (live && waitUntil) waitUntil(pingIndexNow(env, [`${SITE}/posts/${r.post.slug}`, `${SITE}/posts`, `${SITE}/sitemap-posts.xml`]));   // Bing / Yandex hear about it at once
    return json({ ok: true, post: r.post, dropped: r.dropped, url: `${SITE}/posts/${r.post.slug}`, live });
  }
  if (b.action === "posts_delete") { const ok = await deletePost(kv, String(b.slug || "")); return ok ? json({ ok: true }) : json({ error: "not_found" }, 404); }
  if (b.action === "upload") {
    const m = /^data:(image\/(?:webp|png|jpeg));base64,([A-Za-z0-9+\/=]+)$/.exec(String(b.image || ""));
    if (!m) return json({ error: "bad_image" }, 400);
    const bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
    const ok = (m[1] === "image/png" && bytes[0] === 0x89 && bytes[1] === 0x50) || (m[1] === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8) || (m[1] === "image/webp" && bytes[0] === 0x52 && bytes[8] === 0x57);
    if (!ok || bytes.length > 900 * 1024) return json({ error: "bad_image" }, 400);
    const id = [...crypto.getRandomValues(new Uint8Array(8))].map((x) => x.toString(16).padStart(2, "0")).join("");
    await kv.put(`img:${id}`, bytes, { metadata: { type: m[1] } });
    return json({ url: `/api/img/${id}` });
  }
  return json({ error: "bad_action" }, 400);
}

// GET /api/admin?img=<orderId>&t=<token>  -> the receipt picture (token in the URL because <img> cannot send headers)
export async function onRequestGet({ request, env }) {
  if (!env.ADMIN_USER || !env.ADMIN_PASS) return json({ error: "admin_not_configured" }, 503);
  const kv = env.SITEDATA || env.RECEIPTS; if (!kv) return json({ error: "no_storage" }, 503);
  const u = new URL(request.url), id = u.searchParams.get("img") || "";
  if (!/^[a-f0-9]{20}$/.test(id) || !(await valid(env, u.searchParams.get("t") || ""))) return json({ error: "unauthorized" }, 401);
  const buf = await kv.get(`oimg:${id}`, "arrayBuffer"); if (!buf) return json({ error: "not_found" }, 404);
  return new Response(buf, { headers: { "content-type": "image/png", "cache-control": "private, max-age=86400", "x-robots-tag": "noindex" } });
}
