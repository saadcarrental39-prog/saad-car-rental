// Tells Bing (and other IndexNow search engines: Yandex, Seznam, Naver) about every page of the site right after a deploy, so changes are picked up in hours, not weeks.
// Run after the deploy has finished:   node scripts/indexnow.mjs        (needs internet; it reads the built dist/ sitemaps)
// The key file public/4e93d2812bb8a4cd63f7ef18b4ade804.txt proves to Bing that the site is yours. Google does NOT use IndexNow: for Google use Search Console.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const KEY = "4e93d2812bb8a4cd63f7ef18b4ade804", HOST = "www.saadcarremtal.com";
const dist = new URL("../dist", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const urls = [...new Set(readdirSync(dist).filter((f) => /^sitemap-.*\.xml$/.test(f) && !/images/.test(f)).flatMap((f) => [...readFileSync(join(dist, f), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])))];
if (!urls.length) { console.log("No URLs found: run npm run build first."); process.exit(1); }
for (let i = 0; i < urls.length; i += 500) {
  const r = await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls.slice(i, i + 500) }) });
  console.log(`IndexNow ${i + 1}-${Math.min(i + 500, urls.length)}: HTTP ${r.status} ${r.status === 200 || r.status === 202 ? "accepted" : "check the key file is reachable at https://" + HOST + "/" + KEY + ".txt"}`);
}
