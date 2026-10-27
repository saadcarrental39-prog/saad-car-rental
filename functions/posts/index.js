// GET /posts : list of all published posts (server-rendered, filter by ?cat=, paging by ?page=)
import { listPosts, renderIndex, securityHeaders } from "../_lib/posts.js";

export async function onRequestGet({ env, request }) {
  const kv = env.SITEDATA || env.RECEIPTS, u = new URL(request.url);
  const mine = kv ? await listPosts(kv) : [];
  let guides = [];   // ready-made trip guides of the website (built at deploy time): shown next to the owner's posts
  try { const r = await env.ASSETS.fetch(new URL("/guide-posts.json", request.url)); if (r.ok && /json/.test(r.headers.get("content-type") || "")) guides = await r.json(); } catch { /* posts still work without them */ }
  const all = [...mine, ...guides].sort((a, b) => (b.date + (b.updated || "")).localeCompare(a.date + (a.updated || "")));
  return new Response(renderIndex(all, { cat: (u.searchParams.get("cat") || "").slice(0, 40), page: Number(u.searchParams.get("page")) || 1 }), { headers: { ...securityHeaders, "cache-control": "public, max-age=120, stale-while-revalidate=600" } });
}
