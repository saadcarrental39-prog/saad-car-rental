// Posts ("Trips, Spots & Videos"): storage in KV + server-side HTML. Pages are rendered here (not by the React app), so they work the
// moment the owner presses Save in the admin app: no build, no deploy. Google gets complete HTML (title, meta, H1, text, images, video, JSON-LD).
import { BUSINESS as B } from "../../src/business.config.js";
import { cleanPost, parseVideo, slugify } from "./postcore.js";

export const SITE = B.website;
const KEY = "post:";
export const todayPK = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);   // Pakistan date, so "today" posts go live at midnight PKT
const bytes = (s) => new TextEncoder().encode(s).length;

// ---------------------------------------------------------------- storage
const meta = (p) => {
  let m = { s: p.slug, t: p.title.slice(0, 100), d: p.date, u: p.updated, st: p.status, i: (p.images[0] || {}).url || "", c: p.category, l: p.location, ds: p.description.slice(0, 160) };
  if (bytes(JSON.stringify(m)) > 950) m.ds = "";
  if (bytes(JSON.stringify(m)) > 950) m.i = "";
  if (bytes(JSON.stringify(m)) > 950) m.t = m.t.slice(0, 50);
  return m;
};
const fromMeta = (m) => ({ slug: m.s, title: m.t, date: m.d, updated: m.u || m.d, status: m.st, image: m.i || "", category: m.c || "", location: m.l || "", description: m.ds || "" });

export async function listPosts(kv, { drafts = false } = {}) {
  const out = []; let cursor;
  for (let n = 0; n < 5; n++) {
    const l = await kv.list({ prefix: KEY, limit: 1000, cursor });
    for (const k of l.keys) if (k.metadata && k.metadata.s) out.push(fromMeta(k.metadata));
    if (l.list_complete) break; cursor = l.cursor;
  }
  const t = todayPK();
  return out.filter((p) => drafts || (p.status === "published" && p.date <= t)).sort((a, b) => (b.date + b.updated).localeCompare(a.date + a.updated));
}
export async function getPost(kv, slug, fresh = false) {   // fresh = admin reads (no 60 s edge cache)
  if (!/^[a-z0-9-]{1,80}$/.test(slug || "")) return null;
  try { return JSON.parse((await (fresh ? kv.get(KEY + slug) : kv.get(KEY + slug, { cacheTtl: 60 }))) || "null"); } catch { return null; }
}
export const isLive = (p) => !!p && p.status === "published" && p.date <= todayPK();

export async function savePost(kv, raw, oldSlug) {
  const { post, dropped } = cleanPost(raw, todayPK());
  if (post.title.length < 5) return { error: "title_short" };
  if (!post.slug) return { error: "bad_slug" };
  const old = oldSlug ? await getPost(kv, String(oldSlug), true) : null;
  if (old && old.status === "published" && old.slug !== post.slug) post.slug = old.slug;   // a published address never changes (Google would lose the page)
  if (!old || old.slug !== post.slug) {                                                      // new post: never overwrite another post
    let s = post.slug, n = 2; while (await kv.get(KEY + s)) { s = `${post.slug.slice(0, 74)}-${n++}`; if (n > 30) return { error: "slug_taken" }; } post.slug = s;
  }
  post.created = (old && old.created) || todayPK(); post.updated = todayPK();
  const prev = await kv.get(KEY + post.slug); if (prev) await kv.put(`postprev:${post.slug}`, prev);   // one-step undo copy
  await kv.put(KEY + post.slug, JSON.stringify(post), { metadata: meta(post) });
  if (old && old.slug !== post.slug) await kv.delete(KEY + old.slug);
  return { post, dropped };
}
export async function deletePost(kv, slug) {
  const p = await getPost(kv, slug, true); if (!p) return false;
  await kv.put(`postprev:${slug}`, JSON.stringify(p)); await kv.delete(KEY + slug); return true;
}
// Tell Bing / Yandex / Seznam (IndexNow) at once. Google reads sitemap-posts.xml (lastmod changes on every edit).
export async function pingIndexNow(env, urls) {
  try {
    const keyFile = await env.ASSETS.fetch(new URL("/4e93d2812bb8a4cd63f7ef18b4ade804.txt", SITE)); if (!keyFile.ok) return;
    const key = (await keyFile.text()).trim();
    await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ host: new URL(SITE).host, key, keyLocation: `${SITE}/${key}.txt`, urlList: urls }) });
  } catch { /* never block saving */ }
}

// ---------------------------------------------------------------- text helpers
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inline = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/\[([^\]]{1,120})\]\((\/[A-Za-z0-9\-_/#?=&.%;]*|https:\/\/[^\s)]+)\)/g, (m, a, u) => `<a href="${u}"${u.startsWith("http") ? ' rel="noopener nofollow" target="_blank"' : ""}>${a}</a>`);
function blocks(text) {
  const out = []; let list = []; const flush = () => { if (list.length) { out.push(`<ul>${list.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>`); list = []; } };
  for (const raw of String(text || "").split("\n")) {
    const l = raw.trim(); if (!l) { flush(); continue; }
    if (/^[-•*]\s+/.test(l)) { list.push(l.replace(/^[-•*]\s+/, "")); continue; }
    flush();
    if (l.startsWith("### ")) out.push(`<h3>${inline(l.slice(4))}</h3>`); else if (l.startsWith("## ")) out.push(`<h2>${inline(l.slice(3))}</h2>`); else out.push(`<p>${inline(l)}</p>`);
  }
  flush(); return out.join("\n");
}
const dateLong = (d) => { try { return new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }); } catch { return d; } };
const abs = (u) => (/^https?:\/\//.test(u) ? u : SITE + u);
const url = (slug) => `${SITE}/posts/${slug}`;
const waLink = (text) => `https://api.whatsapp.com/send?phone=${B.whatsapp}&text=${encodeURIComponent(text)}`;

// ---------------------------------------------------------------- shared page shell
const CSS = `:root{--bg:#fff;--fg:#16181b;--mut:#62666c;--line:#e6e8eb;--soft:#f5f6f7;--dark:#16181b}*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;font:16px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--fg);background:var(--bg)}
a{color:inherit}img,iframe,video{max-width:100%}.w{max-width:960px;margin:0 auto;padding:0 18px}
header.top{background:var(--dark);color:#fff;position:sticky;top:0;z-index:5}header.top .w{display:flex;align-items:center;gap:14px;min-height:56px;flex-wrap:wrap}
.brand{font-weight:800;letter-spacing:.02em;text-decoration:none;font-size:15px}.brand small{font-weight:600;opacity:.7;margin-left:4px}
nav.m{display:flex;gap:4px 14px;flex-wrap:wrap;margin-left:auto;font-size:14px}nav.m a{text-decoration:none;opacity:.85;padding:6px 0}nav.m a:hover,nav.m a.on{opacity:1;text-decoration:underline}
.bk{background:#fff;color:var(--fg);padding:8px 14px;border-radius:999px;font-weight:700;text-decoration:none;font-size:14px}
.crumb{font-size:13px;color:var(--mut);margin:18px 0 8px}.crumb a{text-decoration:none}
h1{font-size:clamp(26px,5vw,40px);line-height:1.15;margin:8px 0 10px;letter-spacing:-.01em}h2{font-size:clamp(21px,3.5vw,27px);line-height:1.25;margin:34px 0 10px}h3{font-size:18px;margin:22px 0 6px}
.meta{display:flex;flex-wrap:wrap;gap:6px 14px;color:var(--mut);font-size:14px;margin:0 0 18px}.meta b{color:var(--fg)}
.hero{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:16px;background:var(--soft)}
.ans{border:1px solid var(--line);border-left:5px solid var(--dark);background:var(--soft);border-radius:12px;padding:14px 18px;margin:20px 0}.ans b.l{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin-bottom:4px}.ans p{margin:0;font-size:17px}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:18px 0;padding:0;list-style:none}.facts li{border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-size:14px}.facts b{display:block;color:var(--mut);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.06em}
.vids{display:grid;gap:16px;margin:22px 0}.vid{position:relative;width:100%;aspect-ratio:16/9;background:#000 center/cover no-repeat;border-radius:14px;overflow:hidden}.vid.v{aspect-ratio:9/16;max-width:360px;margin:0 auto}.vid.v.ig{aspect-ratio:9/14}
.vid iframe,.vid video{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}.vt{font-size:14px;color:var(--mut);margin:6px 2px 0}.vt a{font-weight:600}
.spots{list-style:none;padding:0;margin:0;display:grid;gap:10px}.spots li{border:1px solid var(--line);border-radius:12px;padding:12px 16px}.spots b{display:block;font-size:17px}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin:14px 0}.gal figure{margin:0}.gal img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px;background:var(--soft)}.gal figcaption{font-size:13px;color:var(--mut);margin-top:4px}
.faq h3{margin-top:18px}.faq p{margin:4px 0 0}
.cta{background:var(--dark);color:#fff;border-radius:18px;padding:24px;margin:36px 0}.cta h2{margin:0 0 6px;color:#fff}.cta p{margin:0 0 14px;opacity:.85}.cta .r{display:flex;flex-wrap:wrap;gap:10px}
.btn{display:inline-block;padding:11px 18px;border-radius:999px;border:1px solid var(--line);font-weight:700;text-decoration:none;background:#fff;color:var(--fg);font-size:15px}.cta .btn{border-color:#fff}.btn.p{background:#25d366;border-color:#25d366;color:#08210f}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0;padding:0;list-style:none}.tags li{background:var(--soft);border-radius:999px;padding:4px 12px;font-size:13px;color:var(--mut)}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin:18px 0}.card{display:block;text-decoration:none;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:#fff}.card img,.card .ph{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;background:var(--soft)}.card div{padding:12px 14px 14px}.card b{display:block;font-size:17px;line-height:1.3}.card small{color:var(--mut)}.card p{margin:6px 0 0;font-size:14px;color:var(--mut)}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.chips a{border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:14px;text-decoration:none}.chips a.on{background:var(--dark);color:#fff;border-color:var(--dark)}
footer.ft{background:var(--dark);color:#cfd2d6;margin-top:48px;padding:28px 0;font-size:14px}footer.ft a{color:#fff}footer.ft address{font-style:normal;margin:8px 0}
.pager{display:flex;gap:10px;justify-content:center;margin:20px 0}
@media(max-width:560px){nav.m{margin-left:0;width:100%}}`;

const NAV = [["/", "Home"], ["/cars", "Cars"], ["/services", "Services"], ["/posts", "Trips & Spots"], ["/contact", "Contact"]];
const shell = ({ title, desc, canonical, robots = "index, follow, max-image-preview:large, max-video-preview:-1", image, ogType = "article", jsonld, body, active = "", extraHead = "", script = "" }) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(canonical)}"><meta name="robots" content="${robots}">
<meta name="theme-color" content="${B.themeColor}"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="192x192" href="/icons/saad-192.png"><link rel="apple-touch-icon" href="/icons/saad-apple-180.png">
<meta property="og:type" content="${ogType}"><meta property="og:site_name" content="${esc(B.shortName)}"><meta property="og:locale" content="en_PK"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(canonical)}">
${image ? `<meta property="og:image" content="${esc(image)}"><meta name="twitter:image" content="${esc(image)}">` : ""}<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}">
${extraHead}<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script></head><body>
<header class="top"><div class="w"><a class="brand" href="/">SAAD CAR<small>RENTAL SERVICES</small></a><nav class="m" aria-label="Main">${NAV.map(([h, t]) => `<a href="${h}"${h === active ? ' class="on"' : ""}>${t}</a>`).join("")}</nav><a class="bk" href="/book">Book Now</a></div></header>
<main class="w">${body}</main>
<footer class="ft"><div class="w"><strong>${esc(B.businessName)}</strong> · ${esc(B.tagline)}<address>${B.addressLines.map(esc).join(", ")}</address><div>Call / WhatsApp: <a href="tel:${esc(B.phone)}">${esc(B.phoneDisplay)}</a> · <a href="/">Home</a> · <a href="/cars">Cars</a> · <a href="/services">Services</a> · <a href="/routes">Routes</a> · <a href="/posts">Trips &amp; Spots</a> · <a href="/contact">Contact</a> · <a href="/privacy-policy">Privacy</a></div></div></footer>
${script}</body></html>`;

const orgNode = () => ({ "@type": "AutoRental", "@id": `${SITE}/#business`, name: B.businessName, url: SITE + "/", telephone: B.phone, image: abs(B.defaultOgImage),
  address: { "@type": "PostalAddress", streetAddress: B.streetAddress, addressLocality: B.city, addressRegion: B.region, postalCode: B.postalCode, addressCountry: B.countryCode } });

// ---------------------------------------------------------------- video block (autoplay when it scrolls into view; nothing is loaded before that)
function videoHtml(v, i, titleFallback) {
  const pv = parseVideo(v.url); if (!pv) return "";
  const t = v.title || `${titleFallback} - video ${i + 1}`;
  const watch = `<p class="vt">${esc(t)} · <a href="${esc(pv.watch)}" target="_blank" rel="noopener nofollow">Watch on ${pv.label} ↗</a></p>`;
  if (pv.type === "file") return `<div><div class="vid"><video data-auto muted loop playsinline controls preload="none" aria-label="${esc(t)}" src="${esc(pv.embed)}"></video></div>${watch}</div>`;
  const bg = pv.thumb ? ` style="background-image:url('${esc(pv.thumb)}')"` : "";
  return `<div><div class="vid${pv.vertical ? " v" : ""}${pv.type === "instagram" ? " ig" : ""}"${bg}><iframe data-src="${esc(pv.embed)}" title="${esc(t)}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>${watch}</div>`;
}
const PLAY = `<script>(function(){var L=document.querySelectorAll("iframe[data-src],video[data-auto]");function go(n){if(n.tagName==="VIDEO"){n.muted=true;var p=n.play();if(p&&p.catch)p.catch(function(){})}else if(!n.src){n.src=n.getAttribute("data-src")}}if(!("IntersectionObserver"in window)){[].forEach.call(L,go);return}var io=new IntersectionObserver(function(es){es.forEach(function(e){var n=e.target;if(e.isIntersecting){go(n);if(n.tagName!=="VIDEO")io.unobserve(n)}else if(n.tagName==="VIDEO"){n.pause()}})},{threshold:.35});[].forEach.call(L,function(n){io.observe(n)})})();</script>`;

// ---------------------------------------------------------------- one post
export function renderPost(p, related) {
  const u = url(p.slug), img0 = p.images[0], ogImg = img0 ? img0.url : (p.videos.map((v) => (parseVideo(v.url) || {}).thumb).find(Boolean) || abs(B.defaultOgImage));
  const title = p.title.length > 56 ? p.title : `${p.title} | ${B.shortName}`;
  const vids = p.videos.map((v, i) => videoHtml(v, i, p.title)).filter(Boolean);
  const faqs = p.faqs.length ? p.faqs : [
    { q: `How can I visit ${p.location || "this place"} from Islamabad with a driver?`, a: `Call or WhatsApp ${B.businessName} on ${B.phoneDisplay} with your pickup point, date and number of passengers. We confirm the vehicle and send the quote before you travel. Every vehicle comes with an experienced professional driver.` },
    { q: "Is the driver included in the booking?", a: "Yes. Every vehicle is provided with an experienced professional driver. Fuel, tolls, parking and overnight stay are agreed and written in the quote before the trip." },
  ];
  const ld = { "@context": "https://schema.org", "@graph": [
    orgNode(),
    { "@type": "BlogPosting", "@id": `${u}#post`, mainEntityOfPage: { "@type": "WebPage", "@id": u }, headline: p.title.slice(0, 110), description: p.description, inLanguage: "en",
      image: p.images.length ? p.images.slice(0, 6).map((i) => i.url) : [ogImg], datePublished: p.date, dateModified: p.updated || p.date,
      author: { "@type": "Organization", name: B.businessName, url: SITE + "/" }, publisher: { "@id": `${SITE}/#business` },
      keywords: [p.keyword, ...p.tags].filter(Boolean).join(", "), articleSection: p.category, wordCount: (p.body + " " + p.summary).split(/\s+/).length,
      about: p.location ? { "@type": "Place", name: p.location } : undefined, contentLocation: p.location ? { "@type": "Place", name: p.location } : undefined, isAccessibleForFree: true },
    { "@type": "BreadcrumbList", itemListElement: [["Home", SITE + "/"], ["Trips & Spots", SITE + "/posts"], [p.title, u]].map(([n, i], k) => ({ "@type": "ListItem", position: k + 1, name: n, item: i })) },
    { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ...p.videos.map((v, i) => { const pv = parseVideo(v.url); const th = (pv && pv.thumb) || (img0 && img0.url); if (!pv || !th) return null;
      return { "@type": "VideoObject", name: v.title || `${p.title} - video ${i + 1}`, description: p.description, thumbnailUrl: [th], uploadDate: p.date, ...(pv.type === "file" ? { contentUrl: pv.embed } : { embedUrl: pv.embed.split("?")[0] }) }; }).filter(Boolean),
    ...(p.spots.length ? [{ "@type": "ItemList", name: `Places in ${p.title}`, itemListElement: p.spots.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, description: s.text || undefined })) }] : []),
  ].map((n) => JSON.parse(JSON.stringify(n))) };
  const wa = waLink(`Hello ${B.businessName}, I saw your post "${p.title}" (${u}). I would like a quote for a car with driver. Pickup: Date: Passengers:`);
  const waShare = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${p.title} ${u}`)}`;
  const body = `
<p class="crumb"><a href="/">Home</a> › <a href="/posts">Trips &amp; Spots</a> › ${esc(p.title)}</p>
<article>
<h1>${esc(p.title)}</h1>
<p class="meta"><span>📅 <b>${esc(dateLong(p.date))}</b></span>${p.updated && p.updated !== p.date ? `<span>Updated ${esc(dateLong(p.updated))}</span>` : ""}${p.location ? `<span>📍 ${esc(p.location)}</span>` : ""}<span>🏷️ ${esc(p.category)}</span></p>
${img0 ? `<img class="hero" src="${esc(img0.url)}" alt="${esc(img0.alt)}" width="1280" height="720" fetchpriority="high" decoding="async" referrerpolicy="no-referrer">` : ""}
${p.summary ? `<div class="ans"><b class="l">Quick answer</b><p>${inline(p.summary)}</p></div>` : ""}
<ul class="facts"><li><b>Service</b>Car with professional driver</li>${p.location ? `<li><b>Place</b>${esc(p.location)}</li>` : ""}<li><b>Pickup</b>Islamabad &amp; Rawalpindi</li><li><b>Book</b><a href="tel:${esc(B.phone)}">${esc(B.phoneDisplay)}</a> · WhatsApp</li></ul>
${vids.length ? `<h2>Videos &amp; reels</h2><div class="vids">${vids.join("")}</div>` : ""}
${blocks(p.body)}
${p.spots.length ? `<h2>Places and spots to visit</h2><ul class="spots">${p.spots.map((s) => `<li><b>${esc(s.name)}</b>${s.text ? esc(s.text) : ""}</li>`).join("")}</ul>` : ""}
${p.images.length > 1 ? `<h2>Photos</h2><div class="gal">${p.images.slice(1).map((im) => `<figure><a href="${esc(im.url)}" target="_blank" rel="noopener"><img src="${esc(im.url)}" alt="${esc(im.alt)}" width="800" height="600" loading="lazy" decoding="async" referrerpolicy="no-referrer"></a>${im.caption ? `<figcaption>${esc(im.caption)}</figcaption>` : ""}</figure>`).join("")}</div>` : ""}
<section class="faq"><h2>Frequently asked questions</h2>${faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}</section>
<section class="cta"><h2>Book a car with driver${p.location ? ` to ${esc(p.location)}` : ""}</h2><p>Tell us your pickup, date and passengers. We reply with a clear quote, never a fake instant price.</p><div class="r"><a class="btn p" href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp now</a><a class="btn" href="tel:${esc(B.phone)}">Call ${esc(B.phoneDisplay)}</a><a class="btn" href="/book">Get a quote</a></div></section>
${p.tags.length ? `<ul class="tags" aria-label="Tags">${p.tags.map((t) => `<li>#${esc(t)}</li>`).join("")}</ul>` : ""}
<p><a class="btn" href="${esc(waShare)}" target="_blank" rel="noopener nofollow">Share on WhatsApp</a> <a class="btn" href="/posts">More trips &amp; spots</a></p>
</article>
${related.length ? `<h2>More trips and spots</h2><div class="cards">${related.map(card).join("")}</div>` : ""}`;
  return shell({ title, desc: p.description, canonical: u, image: ogImg, jsonld: ld, body, active: "/posts", script: vids.length ? PLAY : "",
    extraHead: `<meta property="article:published_time" content="${p.date}"><meta property="article:modified_time" content="${p.updated || p.date}"><meta property="article:section" content="${esc(p.category)}">${p.tags.map((t) => `<meta property="article:tag" content="${esc(t)}">`).join("")}${p.keyword || p.tags.length ? `<meta name="keywords" content="${esc([p.keyword, ...p.tags].filter(Boolean).join(", "))}">` : ""}` });
}
const card = (p) => `<a class="card" href="/posts/${esc(p.slug)}">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" width="640" height="400" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : `<div class="ph"></div>`}<div><small>${esc(p.category)}${p.location ? " · " + esc(p.location) : ""} · ${esc(dateLong(p.date))}</small><b>${esc(p.title)}</b>${p.description ? `<p>${esc(p.description)}</p>` : ""}</div></a>`;

// ---------------------------------------------------------------- list page /posts
export function renderIndex(all, { cat = "", page = 1 } = {}) {
  const per = 24, cats = [...new Set(all.map((p) => p.category).filter(Boolean))];
  const list = cat ? all.filter((p) => p.category === cat) : all, pages = Math.max(1, Math.ceil(list.length / per)); page = Math.min(Math.max(1, page), pages);
  const shown = list.slice((page - 1) * per, page * per);
  const canonical = SITE + "/posts" + (page > 1 && !cat ? `?page=${page}` : "");
  const desc = "Photos, reels and details of trips from Islamabad: Murree, Patriata, Ayubia, Naran, Hunza, Skardu and more. Choose your spots and book a car with a professional driver.";
  const ld = { "@context": "https://schema.org", "@graph": [orgNode(),
    { "@type": "CollectionPage", "@id": `${SITE}/posts#page`, url: SITE + "/posts", name: "Trips, Spots and Videos from Islamabad", description: desc, isPartOf: { "@id": `${SITE}/#website` }, inLanguage: "en" },
    { "@type": "BreadcrumbList", itemListElement: [["Home", SITE + "/"], ["Trips & Spots", SITE + "/posts"]].map(([n, i], k) => ({ "@type": "ListItem", position: k + 1, name: n, item: i })) },
    { "@type": "ItemList", itemListElement: shown.map((p, i) => ({ "@type": "ListItem", position: (page - 1) * per + i + 1, url: url(p.slug), name: p.title })) }] };
  const body = `<p class="crumb"><a href="/">Home</a> › Trips &amp; Spots</p><h1>Trips, Spots &amp; Videos from Islamabad</h1>
<p>Every page below has the photos, reels and full details of a trip: which spots to visit, what to see, how a driver plans the day. Pick your spots (Murree, Patriata, Ayubia chairlift, Naran, Hunza, Skardu and more), then call or WhatsApp us to book your car with a professional driver.</p>
${cats.length > 1 ? `<div class="chips"><a href="/posts"${!cat ? ' class="on"' : ""}>All</a>${cats.map((c) => `<a href="/posts?cat=${encodeURIComponent(c)}"${c === cat ? ' class="on"' : ""}>${esc(c)}</a>`).join("")}</div>` : ""}
${shown.length ? `<div class="cards">${shown.map(card).join("")}</div>` : `<p>New posts are coming. Meanwhile see our <a href="/routes">routes</a> and <a href="/cars">cars</a>.</p>`}
${pages > 1 ? `<div class="pager">${page > 1 ? `<a class="btn" href="/posts?${cat ? `cat=${encodeURIComponent(cat)}&amp;` : ""}page=${page - 1}">← Newer</a>` : ""}${page < pages ? `<a class="btn" href="/posts?${cat ? `cat=${encodeURIComponent(cat)}&amp;` : ""}page=${page + 1}">Older →</a>` : ""}</div>` : ""}
<section class="cta"><h2>Ready to go?</h2><p>Share your plan on WhatsApp and get a quote with an experienced professional driver.</p><div class="r"><a class="btn p" href="${esc(waLink(`Hello ${B.businessName}, I would like a quote for a car with driver. Pickup: Destination: Date: Passengers:`))}" target="_blank" rel="noopener">WhatsApp now</a><a class="btn" href="tel:${esc(B.phone)}">Call ${esc(B.phoneDisplay)}</a></div></section>`;
  return shell({ title: `Trips, Spots & Videos from Islamabad | ${B.shortName}`, desc, canonical: cat ? SITE + "/posts" : canonical, robots: cat ? "noindex, follow" : "index, follow, max-image-preview:large", image: abs(B.defaultOgImage), ogType: "website", jsonld: ld, body, active: "/posts" });
}

// ---------------------------------------------------------------- sitemap (pages + images + videos)
const x = (s) => esc(s);
export function renderSitemap(posts) {
  const lastAll = posts.reduce((m, p) => (p.updated > m ? p.updated : m), B.contentUpdated);
  const items = [`<url><loc>${SITE}/posts</loc><lastmod>${lastAll}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`];
  for (const p of posts) {
    const imgs = (p.images || []).slice(0, 20).map((i) => `<image:image><image:loc>${x(i.url)}</image:loc><image:title>${x(i.alt)}</image:title>${i.caption ? `<image:caption>${x(i.caption)}</image:caption>` : ""}</image:image>`).join("");
    const vids = (p.videos || []).map((v, i) => { const pv = parseVideo(v.url), th = pv && (pv.thumb || (p.images[0] || {}).url); if (!pv || !th) return "";
      return `<video:video><video:thumbnail_loc>${x(th)}</video:thumbnail_loc><video:title>${x(v.title || `${p.title} - video ${i + 1}`)}</video:title><video:description>${x(p.description || p.title)}</video:description>${pv.type === "file" ? `<video:content_loc>${x(pv.embed)}</video:content_loc>` : `<video:player_loc>${x(pv.embed.split("?")[0])}</video:player_loc>`}<video:publication_date>${p.date}</video:publication_date></video:video>`; }).join("");
    items.push(`<url><loc>${x(url(p.slug))}</loc><lastmod>${p.updated || p.date}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority>${imgs}${vids}</url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${items.join("\n")}\n</urlset>\n`;
}
export const securityHeaders = { "content-type": "text/html; charset=utf-8", "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin", "strict-transport-security": "max-age=31536000; includeSubDomains" };
export { slugify };
