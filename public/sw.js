const CACHE_NAME = "manarah-cache-v1";
const OFFLINE_URL = "/offline.html";

const ASSETS_TO_CACHE = [
  "/",
  "/login",
  "/register",
  "/manifest.json",
  "/assets/images/icon-192.png",
  "/assets/images/icon-512.png",
  "/assets/images/icons8-google.svg",
  OFFLINE_URL
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use cache.addAll but handle failures gracefully
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => console.warn(`Failed to cache PWA asset: ${url}`, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only intercept GET requests
  if (event.request.method !== "GET") return;

  // Only intercept requests to our own origin
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  // Only intercept HTTP/HTTPS schemes
  if (!event.request.url.startsWith("http")) return;

  // Skip API requests
  if (requestUrl.pathname.includes("/api/")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Only cache successful basic GET responses
          if (response && response.status === 200 && response.type === "basic") {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache).catch(() => {});
            });
          }
          return response;
        })
        .catch((err) => {
          // Navigation request offline fallback
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL).then((offlinePage) => {
              return offlinePage || Promise.reject(err);
            });
          }
          // Rethrow so browser handles sub-resource failures natively
          throw err;
        });
    })
  );
});
