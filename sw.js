const CACHE_NAME = "worship-cache-v1";
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/icon-192.png",
        "/icon-512.png"
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(
          (res) => res || caches.match(OFFLINE_URL)
        )
      )
  );
});
