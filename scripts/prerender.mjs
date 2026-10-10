// Runs after `vite build` (see package.json "build"). Turns the single-page app into real HTML for every public URL and writes
// sitemap.xml (segmented), robots.txt. Output goes into dist/. Needs only packages that Vite already installs (esbuild).
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd(), dist = join(root, "dist"), work = join(root, ".seo-build");
if (!existsSync(join(dist, "index.html"))) { console.error("dist/index.html not found: run `vite build` first."); process.exit(1); }

// ---- env (same VITE_* values the browser build used)
let env = {};
try { const { loadEnv } = await import("vite"); env = loadEnv("production", root, "VITE_"); } catch { env = Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith("VITE_"))); }
let buildId = "ssr"; try { buildId = JSON.parse(readFileSync(join(dist, "version.json"), "utf8")).id; } catch { /* ignore */ }

// ---- bundle the server entry. import.meta.glob (poster images) has no meaning here, so it becomes {}
await build({
  entryPoints: [join(root, "src/ssr/entry-server.jsx")], outfile: join(work, "entry.mjs"), bundle: true, platform: "node", format: "esm",
  // react / react-dom stay external (one React copy); router + gsap are bundled so Node never has to guess their module format
  external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime"], mainFields: ["module", "main"], jsx: "automatic", logLevel: "error", sourcemap: false,
  banner: { js: 'import { createRequire as __cr } from "node:module"; const require = __cr(import.meta.url);' },
  define: { "process.env.NODE_ENV": '"production"', "import.meta.env": JSON.stringify({ ...env, PROD: true }), __BUILD_ID__: JSON.stringify(buildId) },
  loader: { ".webp": "empty", ".png": "empty", ".jpg": "empty", ".svg": "empty", ".css": "empty", ".mp3": "empty", ".mp4": "empty" },
  plugins: [{ name: "no-glob", setup(b) { b.onLoad({ filter: /src[\\/]data[\\/]services\.js$/ }, (a) => ({ contents: readFileSync(a.path, "utf8").replace(/import\.meta\.glob\([^)]*\)/g, "{}"), loader: "js" })); } }],
});
const mod = await import(pathToFileURL(join(work, "entry.mjs")).href);
const { PAGES, render, BUSINESS, ADMIN_PATH, baseFleet, imgSet, HERO_SIZES } = mod;

// ---- quiet the harmless React "useLayoutEffect does nothing on the server" warning
const err = console.error; console.error = (...a) => { if (!/useLayoutEffect|fetchpriority/.test(String(a[0]))) err(...a); };

// ---- write every page
const template = readFileSync(join(dist, "index.html"), "utf8");
const strip = (h) => h.replace(/<title>[\s\S]*?<\/title>\s*/i, "").replace(/<meta\s+name="description"[^>]*>\s*/i, "");
let written = 0;
for (const page of PAGES) {
  const { html, head } = render(page.path);
  if (!html || html.length < 500) throw new Error(`Empty render for ${page.path}`);
  // Home page: tell the browser to start downloading the big hero picture straight away (it is the "Largest Contentful Paint" element).
  let preload = "";
  if (page.path === "/") {
    const hero = baseFleet.flatMap((c) => c.vehicles).find((v) => !v.placeholder), s = hero && imgSet(hero.image, HERO_SIZES);
    if (hero) preload = `\n<link rel="preload" as="image" href="${hero.image}"${s.srcSet ? ` imagesrcset="${s.srcSet}" imagesizes="${s.sizes}"` : ""} fetchpriority="high">`;
  }
  let out = strip(template).replace("</head>", `${head}${preload}\n</head>`);
  if (!out.includes('<div id="root"></div>')) throw new Error('index.html is missing <div id="root"></div>');
  out = out.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  const file = page.path === "/" ? join(dist, "index.html") : join(dist, page.path, "index.html");
  mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, out); written++;
}
console.log(`prerender: wrote ${written} HTML pages`);

// ---- sitemaps (only canonical, indexable, public pages; indexable=false pages are excluded automatically)
const site = BUSINESS.website, today = new Date().toISOString().slice(0, 10);
const x = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const urlset = (items, ns = "") => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${ns}>\n${items.join("\n")}\n</urlset>\n`;
const urlTag = (p, extra = "") => `<url><loc>${x(site + (p.path === "/" ? "/" : p.path))}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority.toFixed(1)}</priority>${extra}</url>`;
const idx = PAGES.filter((p) => p.indexable);
const groups = {
  "sitemap-pages.xml": idx.filter((p) => ["app", "about", "contact", "hub", "faq", "airport"].includes(p.kind)),
  "sitemap-vehicles.xml": idx.filter((p) => p.kind === "vehicle"),
  "sitemap-services.xml": idx.filter((p) => p.kind === "service"),
  "sitemap-locations.xml": idx.filter((p) => p.kind === "location" || p.kind === "province"),
  "sitemap-destinations.xml": idx.filter((p) => p.kind === "destination"),
  "sitemap-routes.xml": idx.filter((p) => p.kind === "route"),
};
const IMG = ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
const imgTag = (u, t) => `<image:image><image:loc>${x(u)}</image:loc><image:title>${x(t)}</image:title></image:image>`;
const files = [];
for (const [name, list] of Object.entries(groups)) { if (!list.length) continue; writeFileSync(join(dist, name), urlset(list.map((p) => urlTag(p)))); files.push(name); }
// image sitemap: real vehicle photos (linked from their vehicle page) + each page's share image
const imgItems = idx.map((p) => {
  const imgs = [];
  if (p.kind === "vehicle") { const c = baseFleet.find((c) => c.slug === p.slug); (c ? c.vehicles : []).filter((v) => !v.placeholder).forEach((v) => imgs.push(imgTag(site + v.image, `${v.color} ${v.name} ${v.trim} with professional driver`.replace(/\s+/g, " ")))); }
  imgs.push(imgTag(site + p.ogImage, p.h1));
  return urlTag(p, imgs.join(""));
});
writeFileSync(join(dist, "sitemap-images.xml"), urlset(imgItems, IMG)); files.push("sitemap-images.xml");
writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files.map((f) => `<sitemap><loc>${site}/${f}</loc><lastmod>${today}</lastmod></sitemap>`).join("\n")}\n</sitemapindex>\n`);

// ---- /.well-known/ai-catalog.json : the list of public resources that AI agents may discover (Agentic Resource Discovery, ARD).
// Only real, public things that exist on this website are listed. No invented tools, APIs or agents.
const host = new URL(site).hostname, urn = (n) => `urn:air:${host}:${n}`;
const catalog = {
  specVersion: "1.0",
  host: { displayName: BUSINESS.businessName, documentationUrl: site + "/", logoUrl: site + "/icons/saad-512.png" },
  entries: [
    { identifier: urn("site:website"), displayName: `${BUSINESS.businessName} website`, type: "text/html", url: site + "/",
      description: "Car rental with a professional driver in Islamabad: vehicles, services, airport transfers and routes across Pakistan.",
      tags: ["car-rental", "chauffeur", "islamabad", "pakistan"],
      representativeQueries: ["car rental with driver in Islamabad", "Land Cruiser rental with driver for airport transfer in Islamabad", "Islamabad to Hunza car rental with driver"] },
    { identifier: urn("site:booking"), displayName: "Booking and quote request page", type: "text/html", url: site + "/book",
      description: "Page to send a booking or quote request for a car with a professional driver. The business replies to confirm details.",
      tags: ["booking", "quote"] },
    { identifier: urn("site:sitemap"), displayName: "Sitemap index", type: "application/xml", url: site + "/sitemap.xml",
      description: "Index of every public page on the website (vehicles, services, locations, destinations, routes).", tags: ["sitemap"] },
  ],
};
mkdirSync(join(dist, ".well-known"), { recursive: true });
writeFileSync(join(dist, ".well-known", "ai-catalog.json"), JSON.stringify(catalog, null, 2) + "\n");
console.log("prerender: .well-known/ai-catalog.json written");

// ---- robots.txt: crawlers may read everything public (CSS, JS, images, favicon). Private areas are ALSO protected by auth / noindex headers.
writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /r/\nDisallow: ${ADMIN_PATH}\n\nSitemap: ${site}/sitemap.xml\n`);
console.log(`prerender: sitemap index + ${files.length} sitemaps (${idx.length} indexable URLs), robots.txt`);
