// Service Worker - Version corrigée
const CACHE_NAME = "worship-cache-v2";
const OFFLINE_PAGE = "/offline.html";

// Liste des fichiers à mettre en cache
const CACHE_URLS = [
  "/",
  "/index.html",
  "/offline.html"
];

self.addEventListener("install", (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .catch((error) => {
        console.error('[SW] Cache failed:', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Ignorer les requêtes API pour éviter de cacher les données dynamiques
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Ne cacher que les requêtes GET réussies
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Retourner depuis le cache en cas d'erreur
        return caches.match(event.request)
          .then(res => res || caches.match(OFFLINE_PAGE));
      })
  );
});
