const CACHE_NAME = 'ketchup-v1';

// التثبيت والتنشيط الفوري
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map(key => caches.delete(key)));
        }).then(() => self.clients.claim())
    );
});

// جلب البيانات من الشبكة أولاً لضمان التحديث التلقائي
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});