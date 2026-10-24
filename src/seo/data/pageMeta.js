// Pure helpers (no React) shared by the page components, the SEO registry, the sitemap and the audit.
import IMAGES from "./pageImages.json";
import MAN from "./pageImageManifest.json";
import { BOOST } from "./pageBoost";
import THUMBS from "./thumbManifest.json";
import { fallbackFor } from "./heroFallback";

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

// The main picture(s) of a page: its own pictures, or (for pages without any) a relevant one from heroFallback.js.
export function heroImagesOf(path) {
  const own = imagesOf(path); if (own.length) return own;
  const f = fallbackFor(norm(path)); if (!f || !MAN[f.key]) return [];
  const m = MAN[f.key];
  return [{ ...f, w: m.w, h: m.h, url: `/assets/pages/${f.key}.webp`, srcSet: m.sizes.length > 1 ? `/assets/pages/${f.key}-640.webp 640w, /assets/pages/${f.key}.webp ${m.w}w` : undefined }];
}

// Which in-depth trip guide belongs to which route / place page (shown as a "Read the full guide" card on those pages).
const G = (slug, title, text) => ({ to: `/guides/${slug}`, title, text });
const SK = G("islamabad-to-skardu-by-road-guide", "Guide: Islamabad to Skardu by road", "Days, route, season and the right 4x4.");
const DE = G("islamabad-to-deosai-national-park-guide", "Guide: Islamabad to Deosai National Park", "Season, routes and vehicle for the Land of Giants.");
const KU = G("islamabad-to-kumrat-valley-guide", "Guide: Islamabad to Kumrat Valley", "Route to Thall, the jeep stretch and best months.");
const NA = G("islamabad-to-naran-kaghan-guide", "Guide: Islamabad to Naran and Kaghan", "Route, Saiful Muluk, Babusar Top and season.");
const SW = G("islamabad-to-swat-kalam-guide", "Guide: Islamabad to Swat and Kalam", "Driving times, Malam Jabba and a 3-day plan.");
export const GUIDE_LINK = { "/routes/islamabad-to-skardu": SK, "/locations/skardu": SK, "/destinations/shigar-valley": SK, "/destinations/khaplu": SK, "/destinations/deosai-national-park": DE,
  "/destinations/kumrat-valley": KU, "/routes/islamabad-to-naran": NA, "/locations/naran": NA, "/destinations/shogran": NA, "/destinations/babusar-top": NA,
  "/routes/islamabad-to-swat": SW, "/locations/swat": SW, "/destinations/malam-jabba": SW, "/northern-areas": SK };
