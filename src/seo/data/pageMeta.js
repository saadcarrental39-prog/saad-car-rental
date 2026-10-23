// Pure helpers (no React) shared by the page components, the SEO registry, the sitemap and the audit.
import IMAGES from "./pageImages.json";
import MAN from "./pageImageManifest.json";
import { BOOST } from "./pageBoost";
import THUMBS from "./thumbManifest.json";

export const norm = (p) => (p && p.length > 1 ? p.replace(/\/+$/, "") : p);
export function imagesOf(path) {
  const e = IMAGES[norm(path)];
  return ((e && e.images) || []).filter((i) => MAN[i.key]).map((i) => {
    const m = MAN[i.key];
    return { ...i, w: m.w, h: m.h, url: `/assets/pages/${i.key}.webp`, srcSet: m.sizes.length > 1 ? `/assets/pages/${i.key}-640.webp 640w, /assets/pages/${i.key}.webp ${m.w}w` : undefined };
  });
}
// The quick answer comes first, then the extra questions: the same list is shown on the page and written into the FAQ schema.
export const boostFaqs = (path) => { const b = BOOST[norm(path)]; return b ? [{ q: b.a[0], a: b.a[1] }, ...b.faqs] : []; };
export const boostTags = (path) => { const b = BOOST[norm(path)]; return b ? b.tags : []; };
// small share-image thumbnail of any page (made by scripts/make-page-images.py), used by the link cards
const THUMB_SET = new Set(THUMBS);
export const thumbOf = (to) => { const slug = String(to || "").split(/[?#]/)[0].replace(/^\/+|\/+$/g, "").replace(/\//g, "-"); return slug && THUMB_SET.has(slug) ? `/images/og/thumb/${slug}.webp` : null; };
