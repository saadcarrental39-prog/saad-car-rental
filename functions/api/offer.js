// GET /api/offer : public. The special-offer switch saved in the admin app (Offers tab). {} = nothing saved yet, so the website uses business.config.js.
export async function onRequestGet({ env }) {
  const kv = env.SITEDATA || env.RECEIPTS;
  let body = "{}";
  try { if (kv) body = (await kv.get("site:offer")) || "{}"; } catch { /* use website defaults */ }
  return new Response(body, { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=20" } });
}
