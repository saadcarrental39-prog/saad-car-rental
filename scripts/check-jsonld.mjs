// Checks the structured data (JSON-LD) of every built page:  node scripts/check-jsonld.mjs   (run after `npm run build`)
// Prints each page's schema types and any problem: bad JSON, a Product/Offer without price, duplicate @id, missing url/name.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
const dist = new URL("../dist", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : []; });
let pages = 0, problems = 0; const typeCount = {};
for (const f of walk(dist)) {
  const html = readFileSync(f, "utf8"); const rel = f.slice(dist.length).replace(/\\/g, "/");
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!blocks.length) continue; pages++; const ids = new Set(); const issues = []; const types = [];
  for (const b of blocks) {
    let d; try { d = JSON.parse(b); } catch (e) { issues.push("invalid JSON: " + e.message); continue; }
    for (const n of (d["@graph"] || [d])) {
      const t = [].concat(n["@type"]).join("/"); types.push(t); typeCount[t] = (typeCount[t] || 0) + 1;
      if (n["@id"]) { if (ids.has(n["@id"])) issues.push("duplicate @id " + n["@id"]); ids.add(n["@id"]); }
      if (t === "Product" && !n.offers) issues.push("Product without offers");
      if (/Offer/.test(t) && n.price === undefined && !n.priceSpecification) issues.push("Offer without price");
      if (n.offers && !(n.offers.price !== undefined || n.offers.priceSpecification)) issues.push("offers without price");
      if (/^(Service|AutoRental|WebPage)$/.test(t) && !n.name && !n.url) issues.push(t + " without name/url");
      if (/^(Service|Product)$/.test(t) && n.aggregateRating && !/review/i.test(html)) issues.push(t + " has aggregateRating but no visible reviews");
    }
  }
  if (issues.length) { problems += issues.length; console.log(rel, "->", issues.join("; ")); }
}
console.log(`\n${pages} pages with structured data. Types:`, typeCount, "\nProblems:", problems);
process.exit(problems ? 1 : 0);
