const CACHE_NAME = "manarah-cache-v2";
const OFFLINE_URL = "/offline.html";

const STATIC_ASSETS = [
  "/manifest.json",
  "/assets/images/icon-192.png",
  "/assets/images/icon-512.png",
  "/assets/images/icons8-google.svg",
  OFFLINE_URL,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn(`Failed to cache PWA asset: ${url}`, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Clear any old caches (v1, etc.)
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Removing outdated PWA cache:", cacheName);
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

  // Only intercept HTTP/HTTPS schemes
  if (!event.request.url.startsWith("http")) return;

  const requestUrl = new URL(event.request.url);

  // Never intercept API requests
  if (requestUrl.pathname.includes("/api/")) return;

  // For HTML navigation requests (pages): NETWORK FIRST
  // This guarantees users always get the latest code/deployment and never stale login pages
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL).then((offlinePage) => {
            return offlinePage || new Response("Offline", { status: 503, statusText: "Offline" });
          });
        })
    );
    return;
  }

  // For static assets (images, icons, manifest): CACHE FIRST with network fallback
  if (requestUrl.origin === self.location.origin) {
    const isStaticAsset =
      requestUrl.pathname.startsWith("/assets/") ||
      requestUrl.pathname.endsWith(".png") ||
      requestUrl.pathname.endsWith(".jpg") ||
      requestUrl.pathname.endsWith(".svg") ||
      requestUrl.pathname === "/manifest.json";

    if (isStaticAsset) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache).catch(() => {});
              });
            }
            return response;
          });
        })
      );
    }
  }
});
