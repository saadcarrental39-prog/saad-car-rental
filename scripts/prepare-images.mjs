// npm run images
// Put downloaded photos (jpg / png / webp) in the folder  incoming-images/  and name each one after the service it is for
// (e.g. family-travel.jpg). This script resizes them to 1200x800, converts to a small .webp, saves them into
// src/assets/services/ (the Services page picks them up by name) and moves the originals to incoming-images/done/.
import { readdirSync, mkdirSync, renameSync, existsSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
let sharp; try { sharp = (await import("sharp")).default; } catch { console.error("sharp is not installed. Run once:  npm install --no-save sharp   (it is not part of the website build, so it is not in package.json)"); process.exit(1); }
const SLUGS = ["premium-car-rental", "chauffeur-service", "airport-transfers", "business-travel", "corporate-transportation", "family-travel", "wedding-event-transportation", "long-distance-travel", "private-tours", "vip-executive-transportation", "hotel-transfers", "islamabad-rawalpindi-transportation", "customized-travel"];
const IN = "incoming-images", OUT = "src/assets/services", DONE = join(IN, "done");
mkdirSync(IN, { recursive: true }); mkdirSync(OUT, { recursive: true });
const files = readdirSync(IN).filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && statSync(join(IN, f)).isFile());
if (!files.length) { console.log(`No photos in ${IN}/. Download photos, rename them (e.g. family-travel.jpg) and put them there.\nValid names:\n  ${SLUGS.join("\n  ")}`); process.exit(0); }
let ok = 0, bad = 0; mkdirSync(DONE, { recursive: true });
for (const f of files) {
  const slug = basename(f, extname(f)).toLowerCase();
  if (!SLUGS.includes(slug)) { console.warn(`SKIP  ${f}: "${slug}" is not a service name. Valid: ${SLUGS.join(", ")}`); bad++; continue; }
  const target = join(OUT, `${slug}.webp`);
  const info = await sharp(join(IN, f)).rotate().resize(1200, 800, { fit: "cover", position: "attention" }).webp({ quality: 78 }).toFile(target);
  console.log(`OK    ${f} -> ${target}  (${Math.round(info.size / 1024)} KB)`);
  renameSync(join(IN, f), join(DONE, f)); ok++;
}
console.log(`${ok} image(s) ready${bad ? `, ${bad} skipped` : ""}. Now run the update/build as usual.`);
