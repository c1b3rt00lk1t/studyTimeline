// creates a list of files to be cached, both from app shell and the content
const cacheName = "studyTimeline-v01.018";

// For clarity, it is advised to separate between the app shell files and the content
const appShellFiles = [
  "/",
  "index.html",
  "app.webmanifest",
  "css/index.css",
  "icons/capture.png",
  "bundle.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.2/dist/js/bootstrap.bundle.min.js",
];

const contentToCache = appShellFiles;

// The next block installs the service worker, which then actually caches all the files contained in the above list
self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("[Service Worker] Caching all: app shell and content");
      await cache.addAll(contentToCache);
    })()
  );
  self.skipWaiting();
});

// Deleting previous caches
self.addEventListener("activate", (event) => {
  // Remove old caches
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      return keys.map(async (cache) => {
        if (cache !== cacheName) {
          console.log("[Service Worker]: Removing old cache: " + cache);
          return await caches.delete(cache);
        }
      });
    })()
  );
});

// The service worker fetches content from the cache if it is available there, providing offline functionality
self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      if (r) {
        console.log(
          `[Service Worker] Serving resource from cache: ${e.request.url}`
        );
        return r;
      }
      console.log(`[Service Worker] Trying to fetch: ${e.request.url}`);
      const response = await fetch(e.request);
      return response;
    })()
  );
});
