// GET /sitemap-posts.xml : every published post with its images and videos (listed in sitemap.xml and robots.txt)
import { listPosts, getPost, renderSitemap } from "./_lib/posts.js";

export async function onRequestGet({ env }) {
  const kv = env.SITEDATA || env.RECEIPTS; let posts = [];
  if (kv) {   // newest 40 posts: full data (images + videos). Older ones: address + first picture only (keeps KV reads low)
    const l = await listPosts(kv);
    posts = await Promise.all(l.map(async (m, i) => (i < 40 && (await getPost(kv, m.slug))) || { ...m, images: m.image ? [{ url: m.image, alt: m.title }] : [], videos: [] }));
  }
  return new Response(renderSitemap(posts), { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=600" } });
}
