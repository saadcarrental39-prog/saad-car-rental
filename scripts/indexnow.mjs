// Tells Bing, Yandex and other IndexNow search engines about every page in the sitemap (Google does not use IndexNow).
// Run after a deploy is live:   node scripts/indexnow.mjs     (site address = VITE_SITE_URL or www.saadcarremtal.com)
import { readFileSync, readdirSync } from "node:fs";
const KEY = "4e93d2812bb8a4cd63f7ef18b4ade804";
const site = (process.env.VITE_SITE_URL || "https://www.saadcarremtal.com").replace(/\/+$/, "");
const urls = [];
for (const f of readdirSync("dist").filter((n) => /^sitemap-.*\.xml$/.test(n) && n !== "sitemap-images.xml"))
  for (const m of readFileSync("dist/" + f, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1]);
const list = [...new Set(urls)].map((u) => u.replace(/^https?:\/\/[^/]+/, site));
const r = await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ host: new URL(site).host, key: KEY, keyLocation: `${site}/${KEY}.txt`, urlList: list }) });
console.log("IndexNow:", r.status, list.length, "URLs sent");
