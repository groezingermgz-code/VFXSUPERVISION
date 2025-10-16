const CACHE_NAME = 'vfx-supervision-cache-v2';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/Icons/Icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => null))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Alte Caches bereinigen
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
        return Promise.resolve();
      }));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // nur GET cachen

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const res = await fetch(req);
        // erfolgreiche Antworten cachen
        if (res && (res.status === 200 || res.status === 0)) {
          cache.put(req, res.clone());
        }
        return res;
      } catch (err) {
        // Offline: versuche Cache
        const cached = await cache.match(req);
        if (cached) return cached;

        // Navigation: Fallback auf gecachte Startseite
        if (req.mode === 'navigate') {
          const index = await cache.match('/');
          if (index) return index;
          const indexHtml = await cache.match('/index.html');
          if (indexHtml) return indexHtml;
        }

        throw err;
      }
    })
  );
});