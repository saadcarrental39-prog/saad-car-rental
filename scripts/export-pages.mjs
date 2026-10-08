// Dumps the page list (path, share-image text, vehicle photo) to .seo-build/pages.json for scripts/make-og.py.
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
mkdirSync(".seo-build", { recursive: true });
const r = await build({ stdin: { contents: `import { PAGES } from "./src/seo/registry"; import { baseFleet } from "./src/data/fleet"; import { BUSINESS } from "./src/business.config"; export default { PAGES, baseFleet, BUSINESS };`, resolveDir: process.cwd(), loader: "js" },
  bundle: true, write: false, format: "esm", platform: "node", define: { "import.meta.env": "{}" }, loader: { ".webp": "empty" }, logLevel: "error" });
const { default: d } = await import("data:text/javascript;base64," + Buffer.from(r.outputFiles[0].text).toString("base64"));
const photo = Object.fromEntries(d.baseFleet.map((c) => [c.slug, (c.vehicles.find((v) => !v.placeholder) || {}).image || null]));
const pages = d.PAGES.map((p) => ({ key: p.ogKey, path: p.path, a: p.og.a, b: p.og.b, vehicle: photo[p.og.vehicle] || photo.prado }));
pages.push({ key: "saad-car-rental-og", path: "/", a: "SAAD CAR RENTAL", b: "WITH DRIVER", c: "Islamabad, Pakistan", vehicle: photo["land-cruiser-v8"], isDefault: true });
writeFileSync(".seo-build/pages.json", JSON.stringify({ phone: d.BUSINESS.phoneDisplay, pages }, null, 1));
console.log("pages.json:", pages.length);
