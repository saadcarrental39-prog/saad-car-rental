// Tiny service worker so the owner admin page can be installed as an app. It caches nothing.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") e.respondWith(fetch(e.request).catch(() => new Response("Internet chahiye. Dobara try karein.", { headers: { "content-type": "text/plain; charset=utf-8" } })));
});
