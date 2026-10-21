// Shared by the server (functions) AND the admin app (src/pages/AdminPosts.jsx). No imports, no browser or Worker APIs.
// Everything about a "post": field cleaning, video-link parsing, direct-image check and the live SEO checklist.

export const CATEGORIES = ["Murree & Galiyat", "Northern Areas", "Islamabad", "Airport & City", "Routes & Trips", "Weddings & Events", "Our Cars", "Tips & Guides"];

const line = (x, n) => String(x ?? "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
const block = (x, n) => String(x ?? "").replace(/\r/g, "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f<>]/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, n);
export const slugify = (x) => line(x, 120).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/g, "");
const URLX = /^https:\/\/[^\s"'<>]{4,600}$/;
export const words = (t) => (String(t || "").match(/[\p{L}\p{N}']+/gu) || []).length;

// imgbb / postimages: the PAGE link (ibb.co/xxxx, postimg.cc/xxxx) is not a picture. Only the DIRECT link (i.ibb.co/..., i.postimg.cc/...) works inside <img>.
export function imageLinkProblem(u) {
  let x; try { x = new URL(u); } catch { return "Link galat hai"; }
  if (x.protocol !== "https:") return "Link https:// se shuru hona chahiye";
  const h = x.hostname.replace(/^www\./, "");
  const pageHost = /^(ibb\.co|imgbb\.com|postimg\.cc|postimages\.org)$/.test(h);
  const ext = /\.(jpe?g|png|webp|gif|avif)$/i.test(x.pathname);
  if (pageHost && !ext) return "Ye page link hai. Direct link chahiye (i.ibb.co/... ya i.postimg.cc/...)";
  return "";
}

// YouTube / Facebook / Instagram / TikTok / direct .mp4 links -> how to show them
export function parseVideo(u) {
  let x; try { x = new URL(String(u).trim()); } catch { return null; }
  if (x.protocol !== "https:") return null;
  const h = x.hostname.replace(/^(www|m|web)\./, ""), p = x.pathname;
  if (h === "youtu.be" || h === "youtube.com" || h === "music.youtube.com" || h === "youtube-nocookie.com") {
    const id = h === "youtu.be" ? p.slice(1).split("/")[0] : x.searchParams.get("v") || (p.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/) || [])[1];
    if (!/^[\w-]{11}$/.test(id || "")) return null;
    return { type: "youtube", label: "YouTube", id, vertical: /\/shorts\//.test(p), watch: `https://www.youtube.com/watch?v=${id}`, thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${id}&rel=0&modestbranding=1` };
  }
  if (h === "facebook.com" || h === "fb.watch" || h === "fb.com") {
    const vertical = /\/reel\//.test(p) || h === "fb.watch";
    return { type: "facebook", label: "Facebook", vertical, watch: x.toString(), thumb: "", embed: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(x.toString())}&show_text=false&autoplay=true&muted=true&mute=1` };
  }
  if (h === "instagram.com") {
    const m = p.match(/^\/(?:[\w.]+\/)?(reel|reels|p|tv)\/([\w-]+)/);
    if (!m) return null; const kind = m[1] === "reels" ? "reel" : m[1];
    return { type: "instagram", label: "Instagram", vertical: true, watch: `https://www.instagram.com/${kind}/${m[2]}/`, thumb: "", embed: `https://www.instagram.com/${kind}/${m[2]}/embed` };
  }
  if (h === "tiktok.com") {
    const m = p.match(/\/video\/(\d{8,25})/); if (!m) return null;
    return { type: "tiktok", label: "TikTok", vertical: true, watch: x.toString(), thumb: "", embed: `https://www.tiktok.com/embed/v2/${m[1]}` };
  }
  if (/\.(mp4|webm|mov|m4v)$/i.test(p)) return { type: "file", label: "Video", vertical: false, watch: x.toString(), thumb: "", embed: x.toString() };
  return null;
}

// Cleans anything that comes from the admin form. Same function is the server-side guard.
export function cleanPost(r, today) {
  r = r && typeof r === "object" ? r : {};
  const title = line(r.title, 110), dropped = { images: 0, videos: 0 };
  const images = [];
  for (const i of (Array.isArray(r.images) ? r.images : []).slice(0, 60)) {
    const url = line(i && i.url, 600);
    if (!URLX.test(url) || imageLinkProblem(url)) { if (url) dropped.images++; continue; }
    images.push({ url, alt: line(i.alt, 140), caption: line(i.caption, 160) });
  }
  const videos = [];
  for (const v of (Array.isArray(r.videos) ? r.videos : []).slice(0, 12)) {
    const url = line(v && v.url, 600);
    if (!parseVideo(url)) { if (url) dropped.videos++; continue; }
    videos.push({ url, title: line(v.title, 120) });
  }
  const spots = (Array.isArray(r.spots) ? r.spots : []).slice(0, 40).map((s) => ({ name: line(s && s.name, 80), text: line(s && s.text, 400) })).filter((s) => s.name);
  const faqs = (Array.isArray(r.faqs) ? r.faqs : []).slice(0, 14).map((f) => ({ q: line(f && f.q, 160), a: line(f && f.a, 600) })).filter((f) => f.q && f.a);
  const tags = [...new Set((Array.isArray(r.tags) ? r.tags : []).map((t) => line(t, 40).toLowerCase()).filter(Boolean))].slice(0, 25);
  const body = block(r.body, 12000);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(r.date || "")) ? r.date : today;
  const post = {
    slug: slugify(r.slug || title), title, description: line(r.description, 170), keyword: line(r.keyword, 80), tags,
    category: line(r.category, 40) || CATEGORIES[0], location: line(r.location, 80),
    summary: line(r.summary, 420), body, images, videos, spots, faqs, date,
    status: r.status === "published" ? "published" : "draft",
  };
  // gentle auto-fill so a quick post is still complete for Google
  const firstPara = (body.split(/\n\s*\n|\n/).find((x) => x.trim() && !/^[#\-•*]/.test(x.trim())) || "").replace(/\*\*/g, "");
  if (!post.summary) post.summary = line(firstPara, 300);
  if (!post.description) post.description = line(post.summary || firstPara, 158);
  images.forEach((im, i) => { if (!im.alt) im.alt = line(`${post.title}${post.location ? ` - ${post.location}` : ""} photo ${i + 1}`, 140); });
  return { post, dropped };
}

// Live SEO checklist (admin) -> { score 0-100, items:[{ok,msg}] }
export function seoChecks(p) {
  const kw = (p.keyword || "").toLowerCase(), has = (t) => !!kw && String(t || "").toLowerCase().includes(kw);
  const first = words(p.summary) ? p.summary : String(p.body || "").slice(0, 600);
  const it = [
    [p.title.length >= 30 && p.title.length <= 65, `Title 30-65 akshar ho (abhi ${p.title.length})`],
    [(p.description || "").length >= 120 && p.description.length <= 160, `Meta description 120-160 akshar ho (abhi ${(p.description || "").length})`],
    [!!kw, "Focus keyword likhein (jaise: islamabad to murree car with driver)"],
    [has(p.title), "Focus keyword title mein ho"],
    [has(p.description), "Focus keyword description mein ho"],
    [has(first), "Focus keyword shuru ke jawab (summary) mein ho"],
    [words(p.summary) >= 25 && words(p.summary) <= 70, `Short answer 25-70 alfaz ho (abhi ${words(p.summary)}) - Google AI / ChatGPT yehi uthate hain`],
    [words(p.body) >= 200, `Details kam az kam 200 alfaz (abhi ${words(p.body)}), behtar 400+`],
    [!!p.location, "Location likhein (Murree, Hunza...)"],
    [p.images.length >= 3, `Kam az kam 3 images (abhi ${p.images.length})`],
    [p.images.length > 0 && p.images.every((i) => i.alt), "Har image ka alt text ho"],
    [p.videos.length >= 1, "Kam az kam 1 video / reel link"],
    [p.faqs.length >= 2, `Kam az kam 2 FAQ (abhi ${p.faqs.length}) - AEO ke liye`],
    [p.tags.length >= 3, `Kam az kam 3 tags (abhi ${p.tags.length})`],
  ];
  return { score: Math.round((it.filter(([ok]) => ok).length / it.length) * 100), items: it.map(([ok, msg]) => ({ ok, msg })) };
}
