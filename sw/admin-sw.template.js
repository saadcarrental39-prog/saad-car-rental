// SAAD Admin service worker. The build stamps a new version into this file on EVERY deploy (see vite.config.js),
// so the phone sees "a new worker" after each update.bat, installs it by itself and reloads the app. Nothing to do by hand.
const V = "__BUILD_ID__";
const SHELL = `saad-admin-shell-${V}`;
const STATIC = "saad-admin-static";            // icons/logo/video: refreshed in the background, so new icons arrive automatically
const ADMIN = "/saad-owner-7k3x9/";

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(STATIC).then((c) => c.addAll(["/icons/saad-logo.png", "/icons/saad-splash.mp4", "/sounds/order-tone.mp3"]).catch(() => {})));
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
  if (u.pathname.startsWith("/icons/") || u.pathname.startsWith("/sounds/") || u.pathname.startsWith("/assets/brand/")) {                  // show cached now, refresh for next time
    e.respondWith(caches.open(STATIC).then(async (c) => { const hit = await c.match(r); const net = fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit); return hit || net; }));
  }
});

// ---- New booking order: phone notification + app-icon count (works even when the app is closed) ----
self.addEventListener("push", (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch { /* plain text */ }
  const n = Number(d.count) || 0, lead = d.tab === "leads";
  e.waitUntil((async () => {
    try { if (!lead && n && self.navigator.setAppBadge) await self.navigator.setAppBadge(n); } catch { /* not supported */ }
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    wins.forEach((w) => w.postMessage({ type: lead ? "new-lead" : "new-order", count: n }));       // open app: refresh the list (orders also play the tone)
    if (wins.some((w) => w.visibilityState === "visible" && w.focused)) return; // app is in front: no extra system banner
    await self.registration.showNotification(d.title || "🚘 New Booking Order", {
      body: d.body || "Naya booking order aya hai. App kholein.", icon: "/icons/saad-192.png", badge: "/icons/saad-48.png", tag: lead ? "saad-lead" : "saad-order", renotify: true,
      requireInteraction: true, vibrate: [300, 120, 300, 120, 500], silent: false, data: { url: `${ADMIN}?tab=${lead ? "leads" : "orders"}`, tab: lead ? "leads" : "orders" },
    });
  })());
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || `${ADMIN}?tab=orders`;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const w = wins.find((x) => x.url.includes(ADMIN));
    if (w) { await w.focus(); w.postMessage({ type: "open-tab", tab: (e.notification.data && e.notification.data.tab) || "orders" }); } else await self.clients.openWindow(url);
  })());
});
