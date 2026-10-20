// GET /api/spots : public. Returns the tourist-spot photos the owner saved in the admin app ({ v:1, spots:{ slug:[{url,alt,caption}] } } or {}).
export async function onRequestGet({ env }) {
  const kv = env.SITEDATA || env.RECEIPTS;
  let body = "{}";
  try { if (kv) body = (await kv.get("site:spots")) || "{}"; } catch { /* serve empty */ }
  return new Response(body, { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" } });
}
