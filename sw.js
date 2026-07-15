const CACHE_NAME = 'rift-arena-v0.3.1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/systems.js',
  '/manifest.json',
  '/assets/creatures/boulderon.PNG',
  '/assets/creatures/cindrake.PNG',
  '/assets/creatures/coralisk.PNG',
  '/assets/creatures/gustling.PNG',
  '/assets/creatures/pebblin.PNG',
  '/assets/creatures/pyrelope.PNG',
  '/assets/creatures/sparkit.PNG',
  '/assets/creatures/thornuke.PNG',
  '/assets/creatures/tidenne.PNG',
  '/assets/creatures/verdil.PNG',
  '/assets/creatures/voltigo.PNG',
  '/assets/creatures/zephyrn.PNG'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
