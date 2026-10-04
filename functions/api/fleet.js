// GET /api/fleet : public. Returns the prices / cars the owner saved in the admin app (or {} if none yet).
export async function onRequestGet({ env }) {
  const kv = env.SITEDATA || env.RECEIPTS;
  let body = "{}";
  try { if (kv) body = (await kv.get("site:fleet")) || "{}"; } catch { /* serve defaults */ }
  return new Response(body, { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=30" } });
}
