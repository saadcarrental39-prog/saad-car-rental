// Builds the <head> tags for a page. Used (1) at build time to write real HTML into every prerendered page, so Google, WhatsApp,
// Facebook, Telegram etc. (which do not run JavaScript) see the right title / image, and (2) in the browser when visitors navigate.
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const json = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

export function headTags(h) {
  const t = [`<title>${esc(h.title)}</title>`, `<meta name="description" content="${esc(h.description)}" data-seo>`, `<meta name="robots" content="${esc(h.robots)}" data-seo>`];
  if (h.canonical) t.push(`<link rel="canonical" href="${esc(h.canonical)}" data-seo>`);
  if (h.og) {
    const o = h.og;
    t.push(`<meta property="og:type" content="${o.type}" data-seo>`, `<meta property="og:url" content="${esc(o.url)}" data-seo>`, `<meta property="og:title" content="${esc(o.title)}" data-seo>`, `<meta property="og:description" content="${esc(o.description)}" data-seo>`,
      `<meta property="og:image" content="${esc(o.image)}" data-seo>`, `<meta property="og:image:secure_url" content="${esc(o.image)}" data-seo>`, `<meta property="og:image:type" content="${o.imageType}" data-seo>`,
      `<meta property="og:image:width" content="${o.imageWidth}" data-seo>`, `<meta property="og:image:height" content="${o.imageHeight}" data-seo>`, `<meta property="og:image:alt" content="${esc(o.imageAlt)}" data-seo>`,
      `<meta property="og:site_name" content="${esc(o.siteName)}" data-seo>`, `<meta property="og:locale" content="${o.locale}" data-seo>`,
      `<meta name="twitter:card" content="summary_large_image" data-seo>`, `<meta name="twitter:title" content="${esc(o.title)}" data-seo>`, `<meta name="twitter:description" content="${esc(o.description)}" data-seo>`,
      `<meta name="twitter:image" content="${esc(o.image)}" data-seo>`, `<meta name="twitter:image:alt" content="${esc(o.imageAlt)}" data-seo>`);
  }
  if (h.jsonLd) t.push(`<script type="application/ld+json" data-seo>${json(h.jsonLd)}</script>`);
  return t;
}
export const headHtml = (h) => headTags(h).join("\n");

// Browser side: replace the tags written by the prerender (or the shell) with the tags for the page we navigated to.
export function applyHead(h) {
  if (typeof document === "undefined") return;
  document.title = h.title;
  document.head.querySelectorAll('[data-seo], meta[name="description"], meta[name="robots"], link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"]').forEach((n) => n.remove());
  const holder = document.createElement("template");
  holder.innerHTML = headTags(h).filter((x) => !x.startsWith("<title>")).join("");
  document.head.append(holder.content);
}
