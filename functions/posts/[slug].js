// GET /posts/<slug> : one post as complete server-rendered HTML (SEO page). Data comes from KV (saved in the admin app > Posts tab).
import { getPost, listPosts, isLive, renderPost, securityHeaders } from "../_lib/posts.js";

export async function onRequestGet({ params, env, request }) {
  const kv = env.SITEDATA || env.RECEIPTS;
  const slug = String(params.slug || "").toLowerCase();
  const p = kv ? await getPost(kv, slug) : null;
  if (!isLive(p)) {
    let body = "<!doctype html><title>Page not found</title><h1>Page not found</h1><p><a href=\"/posts\">Trips &amp; Spots</a></p>";
    try { const nf = await env.ASSETS.fetch(new URL("/not-found", request.url)); if (nf.ok) body = await nf.text(); } catch { /* tiny page */ }
    return new Response(request.method === "HEAD" ? null : body, { status: 404, headers: { ...securityHeaders, "cache-control": "no-store", "x-robots-tag": "noindex" } });
  }
  const all = await listPosts(kv);
  const rel = all.filter((x) => x.slug !== p.slug).sort((a, b) => (b.category === p.category) - (a.category === p.category)).slice(0, 6);
  return new Response(renderPost(p, rel), { headers: { ...securityHeaders, "cache-control": "public, max-age=120, stale-while-revalidate=600" } });
}
