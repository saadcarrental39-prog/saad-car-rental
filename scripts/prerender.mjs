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
  packages: "external", jsx: "automatic", logLevel: "error", sourcemap: false,
  define: { "import.meta.env": JSON.stringify({ ...env, PROD: true }), __BUILD_ID__: JSON.stringify(buildId) },
  loader: { ".webp": "empty", ".png": "empty", ".jpg": "empty", ".svg": "empty", ".css": "empty", ".mp3": "empty", ".mp4": "empty" },
  plugins: [
    // gsap only animates in the browser. On the server it is replaced by an empty stub (also avoids Node subpath-import problems).
    { name: "gsap-stub", setup(b) {
      b.onResolve({ filter: /^gsap(\/.*)?$/ }, (a) => ({ path: a.path, namespace: "gsap-stub" }));
      b.onLoad({ filter: /.*/, namespace: "gsap-stub" }, () => ({ loader: "js", contents: "const g={registerPlugin(){},context(f){return{revert(){}}},fromTo(){},to(){},from(){},set(){},timeline(){return g}};export default g;export const gsap=g;export const ScrollTrigger={getAll:()=>[],create(){},refresh(){}};" }));
    } },
    { name: "no-glob", setup(b) { b.onLoad({ filter: /src[\\/]data[\\/]services\.js$/ }, (a) => ({ contents: readFileSync(a.path, "utf8").replace(/import\.meta\.glob\([^)]*\)/g, "{}"), loader: "js" })); } }],
});
const mod = await import(pathToFileURL(join(work, "entry.mjs")).href);
const { PAGES, render, BUSINESS, ADMIN_PATH, baseFleet } = mod;

// ---- quiet the harmless React "useLayoutEffect does nothing on the server" warning
const err = console.error; console.error = (...a) => { if (!String(a[0]).includes("useLayoutEffect")) err(...a); };

// ---- write every page
const template = readFileSync(join(dist, "index.html"), "utf8");
const strip = (h) => h.replace(/<title>[\s\S]*?<\/title>\s*/i, "").replace(/<meta\s+name="description"[^>]*>\s*/i, "");
let written = 0;
for (const page of PAGES) {
  const { html, head } = render(page.path);
  if (!html || html.length < 500) throw new Error(`Empty render for ${page.path}`);
  let out = strip(template).replace("</head>", `${head}\n</head>`);
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

// ---- robots.txt: crawlers may read everything public (CSS, JS, images, favicon). Private areas are ALSO protected by auth / noindex headers.
writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /r/\nDisallow: ${ADMIN_PATH}\n\nSitemap: ${site}/sitemap.xml\n`);
console.log(`prerender: sitemap index + ${files.length} sitemaps (${idx.length} indexable URLs), robots.txt`);
