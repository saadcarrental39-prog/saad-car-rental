// node scripts/i18n-check.mjs  -> lists texts that are missing in a language file (they fall back to English, nothing breaks).
import { readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const dir = join(process.cwd(), "src/i18n");
const keys = (await import(pathToFileURL(join(dir, "keys.js")).href)).default;
let bad = 0;
for (const f of readdirSync(join(dir, "dict")).filter((x) => x.endsWith(".js"))) {
  const d = (await import(pathToFileURL(join(dir, "dict", f)).href)).default;
  if (f === "en-GB.js") continue;
  const miss = keys.map((k, i) => (d[i] ? null : i)).filter((x) => x !== null);
  const ph = keys.map((k, i) => (d[i] && (k.match(/\{\w+\}/g) || []).sort().join() !== (d[i].match(/\{\w+\}/g) || []).sort().join() ? i : null)).filter((x) => x !== null);
  console.log(`${f}: ${keys.length - miss.length}/${keys.length} translated${miss.length ? `, missing lines ${miss.slice(0, 15).join(",")}${miss.length > 15 ? "..." : ""}` : ""}${ph.length ? `, BAD {placeholders} at ${ph.join(",")}` : ""}`);
  bad += miss.length + ph.length;
}
process.exit(bad ? 1 : 0);
