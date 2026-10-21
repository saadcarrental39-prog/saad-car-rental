// GET /posts : list of all published posts (server-rendered, filter by ?cat=, paging by ?page=)
import { listPosts, renderIndex, securityHeaders } from "../_lib/posts.js";

export async function onRequestGet({ env, request }) {
  const kv = env.SITEDATA || env.RECEIPTS, u = new URL(request.url);
  const all = kv ? await listPosts(kv) : [];
  return new Response(renderIndex(all, { cat: (u.searchParams.get("cat") || "").slice(0, 40), page: Number(u.searchParams.get("page")) || 1 }), { headers: { ...securityHeaders, "cache-control": "public, max-age=120, stale-while-revalidate=600" } });
}
