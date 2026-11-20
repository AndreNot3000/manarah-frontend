// ============================================================
// MANARAH SERVICE WORKER - SELF-DESTRUCT MODE
// This worker immediately unregisters itself and wipes ALL caches.
// This permanently fixes the "Load failed" / HTTP 404 bug caused
// by stale cached assets on mobile devices.
// ============================================================

self.addEventListener("install", (event) => {
  // Skip waiting so this new SW takes over immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 1. Delete ALL caches unconditionally
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // 2. Tell every open tab to reload so they get fresh HTML
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }

      // 3. Unregister this service worker entirely
      await self.registration.unregister();
    })()
  );
});

