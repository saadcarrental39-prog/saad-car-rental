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

export async function onRequestGet(ctx) {
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
