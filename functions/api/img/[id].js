// GET /api/img/<id> : photos of cars added from the admin app (stored in KV).
export async function onRequestGet({ env, params }) {
  const kv = env.SITEDATA || env.RECEIPTS, id = String(params.id || "");
  if (!kv || !/^[a-f0-9]{16}$/.test(id)) return new Response("Not found", { status: 404 });
  const { value, metadata } = await kv.getWithMetadata(`img:${id}`, "arrayBuffer");
  if (!value) return new Response("Not found", { status: 404 });
  return new Response(value, { headers: { "content-type": metadata?.type || "image/webp", "cache-control": "public, max-age=31536000, immutable" } });
}
