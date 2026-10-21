// GET /api/posts?limit=6 : public list (title, description, first image, date) used by the home page strip.
import { listPosts } from "../_lib/posts.js";

export async function onRequestGet({ env, request }) {
  const kv = env.SITEDATA || env.RECEIPTS, n = Math.min(24, Math.max(1, Number(new URL(request.url).searchParams.get("limit")) || 6));
  let posts = []; try { if (kv) posts = (await listPosts(kv)).slice(0, n); } catch { /* empty */ }
  return new Response(JSON.stringify({ posts }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=120" } });
}
