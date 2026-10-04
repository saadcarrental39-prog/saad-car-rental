// SAAD Admin service worker. The build stamps a new version into this file on EVERY deploy (see vite.config.js),
// so the phone sees "a new worker" after each update.bat, installs it by itself and reloads the app. Nothing to do by hand.
const V = "__BUILD_ID__";
const SHELL = `saad-admin-shell-${V}`;
const STATIC = "saad-admin-static";            // icons/logo/video: refreshed in the background, so new icons arrive automatically
const ADMIN = "/saad-owner-7k3x9/";

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(STATIC).then((c) => c.addAll(["/icons/saad-logo.png", "/icons/saad-splash.mp4"]).catch(() => {})));
});
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith("saad-admin-shell-") && k !== SHELL) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;   // never touch the API
  if (r.mode === "navigate" && u.pathname.startsWith(ADMIN)) {                                        // always newest page, cached copy only when offline
    e.respondWith(fetch(r).then((res) => { const c = res.clone(); caches.open(SHELL).then((x) => x.put(ADMIN, c)); return res; })
      .catch(async () => (await caches.match(ADMIN)) || new Response("Internet chahiye. Dobara try karein.", { headers: { "content-type": "text/plain; charset=utf-8" } })));
    return;
  }
  if (u.pathname.startsWith("/bundle/")) {                                                            // hashed files never change: cache first
    e.respondWith(caches.open(SHELL).then(async (c) => (await c.match(r)) || fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res; })));
    return;
  }
  if (u.pathname.startsWith("/icons/") || u.pathname.startsWith("/assets/brand/")) {                  // show cached now, refresh for next time
    e.respondWith(caches.open(STATIC).then(async (c) => { const hit = await c.match(r); const net = fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit); return hit || net; }));
  }
});
