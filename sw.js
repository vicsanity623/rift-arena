const CACHE_NAME = 'rift-arena-v0.4.2';
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
  '/assets/creatures/zephyrn.PNG',
  '/assets/creatures/boulderon_evolved.PNG',
  '/assets/creatures/cindrake_evolved.PNG',
  '/assets/creatures/coralisk_evolved.PNG',
  '/assets/creatures/gustling_evolved.PNG',
  '/assets/creatures/pebblin_evolved.PNG',
  '/assets/creatures/pyrelope_evolved.PNG',
  '/assets/creatures/sparkit_evolved.PNG',
  '/assets/creatures/thornuke_evolved.PNG',
  '/assets/creatures/tidenne_evolved.PNG',
  '/assets/creatures/verdil_evolved.PNG',
  '/assets/creatures/voltigo_evolved.PNG',
  '/assets/creatures/zephyrn_evolved.PNG'
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
