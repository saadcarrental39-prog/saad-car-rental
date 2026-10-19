/* Noor Dental Clinic - Service Worker
   Cache-First for the app shell, Network-First for /api/*, offline fallback page.
   Bump CACHE_NAME (e.g. noor-dental-v2) to force every client to update. */
const CACHE_NAME = 'noor-dental-v6';

const PAGES = ['/', '/index.html', '/dashboard.html', '/patients.html', '/waiting-room.html', '/appointments.html', '/ortho-tie.html', '/lab-records.html', '/expenses.html',
  '/ledger.html', '/pos.html', '/reports.html', '/reminders.html', '/settings.html', '/offline.html'];
const STATIC = [
  '/manifest.json', '/favicon.ico',
  '/css/theme.css', '/css/style.css',
  '/js/theme.js', '/js/api.js', '/js/app.js', '/js/whatsapp.js', '/vendor/chart.umd.js',
  '/js/pages/login.js', '/js/pages/dashboard.js', '/js/pages/patients.js', '/js/pages/waiting-room.js', '/js/pages/appointments.js', '/js/pages/ortho-tie.js',
  '/js/pages/lab-records.js', '/js/pages/expenses.js', '/js/pages/ledger.js', '/js/pages/pos.js', '/js/pages/reports.js', '/js/pages/reminders.js', '/js/pages/settings.js',
  '/fonts/inter-latin-400-normal.woff2', '/fonts/inter-latin-500-normal.woff2', '/fonts/inter-latin-600-normal.woff2', '/fonts/inter-latin-700-normal.woff2',
  '/icons/logo.png', '/icons/apple-touch-icon.png', '/icons/favicon-16.png', '/icons/favicon-32.png',
  '/icons/icon-72.png', '/icons/icon-96.png', '/icons/icon-128.png', '/icons/icon-144.png', '/icons/icon-152.png',
  '/icons/icon-192.png', '/icons/icon-384.png', '/icons/icon-512.png', '/icons/icon-maskable-192.png', '/icons/icon-maskable-512.png',
  '/assets/icons/appointment.png', '/assets/icons/bell.png', '/assets/icons/dashboard.png', '/assets/icons/delete_icon.png', '/assets/icons/edit_patient.png',
  '/assets/icons/expenses.png', '/assets/icons/female_patient_profile.png', '/assets/icons/install_app.png', '/assets/icons/ledger.png',
  '/assets/icons/male_patient_profile_icon.png', '/assets/icons/monthly_income.png', '/assets/icons/online.png', '/assets/icons/orthobrasis.png',
  '/assets/icons/patient.png', '/assets/icons/pdf.png', '/assets/icons/pos.png', '/assets/icons/profile.png', '/assets/icons/reminder.png',
  '/assets/icons/reports.png', '/assets/icons/search.png', '/assets/icons/settings.png', '/assets/icons/todays_revenue.png',
  '/assets/icons/waiting_room.png', '/assets/icons/whatsappicon.png'
];

/* install: pre-cache the whole app shell (one bad file must not break the install) */
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const results = await Promise.allSettled([...PAGES, ...STATIC].map(u => cache.add(new Request(u, { cache: 'reload' }))));
    results.forEach((r, i) => { if (r.status === 'rejected') console.warn('[SW] not cached:', [...PAGES, ...STATIC][i]); });
    /* NOTE: no automatic skipWaiting - the page shows "New version available — Refresh?" and sends SKIP_WAITING */
  })());
});

/* activate: delete old caches, take control of open pages */
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('noor-dental-') && k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => { if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting(); });

const jsonOffline = () => new Response(JSON.stringify({ error: 'Clinic server not reachable. Start it with start.bat / npm start.', offline: true }),
  { status: 503, headers: { 'Content-Type': 'application/json' } });

self.addEventListener('fetch', event => {
  const req = event.request; const url = new URL(req.url);
  /* skip: non-GET, external links (WhatsApp wa.me, mailto, etc.), uploaded files & big media (served straight from the local server) */
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  /* /assets/icons/*.png are small UI icons used everywhere via ic() - cache them like any
     other static asset. Everything else under /assets/ (the login video, the master logo)
     is left to the network: large/optional, not needed for the app shell to work offline. */
  if (url.pathname.startsWith('/uploads/') || (url.pathname.startsWith('/assets/') && !url.pathname.startsWith('/assets/icons/'))) return;
  if (url.pathname === '/service-worker.js') return;

  /* Network-First ONLY for the API (live data), fall back to cache, then a JSON error */
  if (url.pathname.startsWith('/api/')) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok && url.pathname.match(/^\/api\/(settings|services)/) && !url.search.includes('token=')) { const c = await caches.open(CACHE_NAME); c.put(req, res.clone()); }
        return res;
      } catch (e) { const hit = await caches.match(req); return hit || jsonOffline(); }
    })());
    return;
  }

  /* Cache-First for everything else (app shell). Query strings are ignored so /patients.html?id=3 works offline. */
  event.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok && (url.pathname.startsWith('/js/') || url.pathname.startsWith('/css/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/fonts/') || url.pathname.startsWith('/assets/icons/'))) { const c = await caches.open(CACHE_NAME); c.put(req, res.clone()); }
      return res;
    } catch (e) {
      if (req.mode === 'navigate') return (await caches.match('/offline.html')) || new Response('Offline', { status: 503 });
      return new Response('', { status: 504 });
    }
  })());
});
