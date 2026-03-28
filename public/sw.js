const CACHE_NAME = "daodejing-cache-v3";

/** 与 sw.js 同目录的站点根（/ 或 /repo/），兼容 GitHub Pages 子路径 */
const SW_DIR = self.location.pathname.slice(0, self.location.pathname.lastIndexOf("/") + 1);
const BASE = self.location.origin + SW_DIR;

const APP_SHELL = [
  `${BASE}index.html`,
  `${BASE}manifest.webmanifest`,
  `${BASE}icons.svg`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(`${BASE}index.html`))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});

self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "PRECACHE_URLS") return;

  const urls = Array.isArray(event.data.payload) ? event.data.payload : [];
  if (urls.length === 0) return;

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urls))
  );
});
