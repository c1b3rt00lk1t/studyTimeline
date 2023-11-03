const cacheName="studyTimeline-v01.040",appShellFiles=["/","index.html","app.webmanifest","css/index.css","icons/capture.png","bundle.js","https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css","https://cdn.jsdelivr.net/npm/bootstrap@5.1.2/dist/js/bootstrap.bundle.min.js"],contentToCache=appShellFiles;self.addEventListener("install",(e=>{console.log("[Service Worker] Install"),e.waitUntil((async()=>{const e=await caches.open(cacheName);console.log("[Service Worker] Caching all: app shell and content"),await e.addAll(contentToCache)})()),self.skipWaiting()})),self.addEventListener("activate",(e=>{e.waitUntil((async()=>(await caches.keys()).map((async e=>{if(e!==cacheName)return console.log("[Service Worker]: Removing old cache: "+e),await caches.delete(e)})))())})),self.addEventListener("fetch",(e=>{e.respondWith((async()=>{const t=await caches.match(e.request);if(t)return console.log(`[Service Worker] Serving resource from cache: ${e.request.url}`),t;console.log(`[Service Worker] Trying to fetch: ${e.request.url}`);return await fetch(e.request)})())}));