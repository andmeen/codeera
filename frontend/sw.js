const CACHE_NAME = 'codeera-v3';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/css/dashboard.css',
  '/assets/css/auth.css',
  '/assets/img/icon-transperant.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Only handle GET
  if (request.method !== 'GET') return;

  try {
    const url = new URL(request.url);
    const isSameOrigin = url.origin === self.location.origin;
    // Always bypass cache for API requests to avoid stale data
    if (isSameOrigin && url.pathname.startsWith('/api/')) {
      event.respondWith(fetch(request));
      return;
    }
  } catch (_) {
    // If URL parsing fails, fall back to default strategy below
  }

  // Network-first for same-origin HTML, cache-first for others
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match('/index.html')))
    );
  } else {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
  }
});
