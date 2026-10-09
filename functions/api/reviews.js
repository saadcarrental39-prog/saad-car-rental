// Cloudflare Pages Function  ->  /api/reviews
// GET    : Google reviews (Places API, server-side so the key stays private) + website reviews (KV)
// POST   : a visitor submits a website review (saved in KV, shown under the car right away)
// DELETE : remove a website review  (?id=...  with header  Authorization: Bearer <ADMIN_TOKEN>)
//
// Needed in Cloudflare Pages settings (see README-REVIEWS.md):
//   KV binding  REVIEWS_KV  |  env vars  GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID, ADMIN_TOKEN (optional)

const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const clean = (s, n) => String(s ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
const KEY = "reviews:all";
const readSite = async (env) => { try { return env.REVIEWS_KV ? JSON.parse((await env.REVIEWS_KV.get(KEY)) || "[]") : []; } catch { return []; } };

async function googleData(env, ctx) {
  if (!env.GOOGLE_PLACES_API_KEY || !env.GOOGLE_PLACE_ID) return null;
  const cache = caches.default, ck = new Request("https://reviews.internal/google-v1");
  const hit = await cache.match(ck); if (hit) return hit.json();
  try {
    const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(env.GOOGLE_PLACE_ID)}?languageCode=en`, {
      headers: { "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY, "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri,googleMapsLinks" } });
    if (!r.ok) return null;
    const p = await r.json(), L = p.googleMapsLinks || {};
    const out = {
      rating: p.rating ?? null, count: p.userRatingCount ?? null,
      mapsUrl: L.reviewsUri || p.googleMapsUri || "",
      writeUrl: L.writeAReviewUri || `https://search.google.com/local/writereview?placeid=${encodeURIComponent(env.GOOGLE_PLACE_ID)}`,
      reviews: (p.reviews || []).map((v, i) => ({ id: v.name || `g${i}`, source: "google", name: v.authorAttribution?.displayName || "Google user",
        avatar: v.authorAttribution?.photoUri || "", url: v.authorAttribution?.uri || "", rating: v.rating, text: v.originalText?.text || v.text?.text || "",
        date: v.publishTime || "", when: v.relativePublishTimeDescription || "" })).filter((v) => v.text),
    };
    ctx.waitUntil(cache.put(ck, new Response(JSON.stringify(out), { headers: { "cache-control": "public, max-age=3600" } })));  // short 1-hour cache keeps API cost near zero
    return out;
  } catch { return null; }
}

/* ---------- live rating + count for the whole website:  GET /api/reviews?summary=1 ----------
   Cost control: Google is asked for ONLY rating + userRatingCount, and at most once per hour for the whole site
   (the time of the last attempt is kept in KV), about 720 calls a month. If Google fails, the last good number stays.
   Order of truth: Google live  ->  number typed in the Admin app  ->  fixed number in business.config.js (the page decides). */
const store = (env) => env.SITEDATA || env.RECEIPTS || env.REVIEWS_KV || null;
const getJ = async (kv, k) => { try { return JSON.parse((await kv.get(k)) || "null"); } catch { return null; } };
const FRESH = 60 * 60e3, RETRY = 10 * 60e3;
async function liveSummary(env, ctx) {
  const key = env.GOOGLE_PLACES_API_KEY, pid = env.GOOGLE_PLACE_ID, kv = store(env);
  if (!key || !pid) return { configured: false, g: null, err: "" };
  let g = kv ? await getJ(kv, "reviews:g") : null; const now = Date.now();
  if (!kv) { const hit = await caches.default.match("https://reviews.internal/summary-v1"); if (hit) g = await hit.json(); }
  if (!g || now - (g.tried || 0) > FRESH) {
    try {
      const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(pid)}`, { headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "rating,userRatingCount" } });
      if (!r.ok) throw new Error(`google_${r.status}`);
      const p = await r.json(); if (!(Number(p.userRatingCount) >= 0)) throw new Error("no_count");
      g = { rating: p.rating ?? null, count: Number(p.userRatingCount), ts: now, tried: now };
    } catch (e) { g = { ...(g || {}), tried: now - (FRESH - RETRY), err: String((e && e.message) || e).slice(0, 60) }; }   // failed: keep the last good number, retry in ~10 minutes
    const save = kv ? kv.put("reviews:g", JSON.stringify(g)) : caches.default.put("https://reviews.internal/summary-v1", new Response(JSON.stringify(g), { headers: { "cache-control": "public, max-age=3600" } }));
    ctx.waitUntil ? ctx.waitUntil(save) : await save;
  }
  return { configured: true, g: g && g.count != null ? g : null, err: (g && g.err) || "" };
}
async function summary(ctx) {
  const { env } = ctx, kv = store(env), { configured, g, err } = await liveSummary(env, ctx); let out = null;
  if (g) out = { rating: g.rating, count: g.count, source: "google", updated: g.ts };
  else { const m = kv ? await getJ(kv, "reviews:manual") : null; if (m && m.count != null) out = { rating: m.rating, count: m.count, source: "manual", updated: m.ts }; }
  return new Response(JSON.stringify({ ok: true, ...(out || { rating: null, count: null, source: "static" }), configured, ...(err ? { error: err } : {}) }),
    { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=120" } });
}

export async function onRequestGet(ctx) {
  if (new URL(ctx.request.url).searchParams.get("summary") === "1") return summary(ctx);
  const [google, site] = await Promise.all([googleData(ctx.env, ctx), readSite(ctx.env)]);
  return J({ google, site, configured: { google: !!google, store: !!ctx.env.REVIEWS_KV } });
}

export async function onRequestPost({ request, env }) {
  if (!env.REVIEWS_KV) return J({ error: "Review storage is not set up yet." }, 503);
  let b; try { b = await request.json(); } catch { return J({ error: "Invalid request." }, 400); }
  if (b.hp) return J({ ok: true });                                   // honeypot: bots fill hidden fields
  const name = clean(b.name, 60), text = clean(b.text, 500), car = clean(b.car, 40).toLowerCase().replace(/[^a-z0-9-]/g, ""), rating = Math.round(Number(b.rating));
  if (name.length < 2) return J({ error: "Please enter your name." }, 400);
  if (!(rating >= 1 && rating <= 5)) return J({ error: "Please choose 1 to 5 stars." }, 400);
  if (text.length < 10) return J({ error: "Please write at least a few words." }, 400);
  if (/https?:\/\/|www\./i.test(text)) return J({ error: "Links are not allowed in reviews." }, 400);
  const rl = `rl:${request.headers.get("CF-Connecting-IP") || "x"}`;
  if (await env.REVIEWS_KV.get(rl)) return J({ error: "Please wait a few minutes before sending another review." }, 429);
  const item = { id: crypto.randomUUID(), source: "site", name, rating, text, car, date: new Date().toISOString() };
  const list = await readSite(env); list.unshift(item);
  await env.REVIEWS_KV.put(KEY, JSON.stringify(list.slice(0, 200)));
  await env.REVIEWS_KV.put(rl, "1", { expirationTtl: 600 });
  return J({ ok: true, review: item }, 201);
}

export async function onRequestDelete({ request, env }) {
  const t = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!env.ADMIN_TOKEN || t !== env.ADMIN_TOKEN) return J({ error: "Unauthorized" }, 401);
  const id = new URL(request.url).searchParams.get("id");
  const list = (await readSite(env)).filter((r) => r.id !== id);
  await env.REVIEWS_KV.put(KEY, JSON.stringify(list));
  return J({ ok: true });
}
