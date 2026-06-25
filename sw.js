const CACHE_NAME = 'ketchup-menu-v2026';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/lllogo.jpg'
];

// تفعيل السيرفيس وركر وتخزين الملفات الأساسية مبدئياً
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 🔥 السطر السحري: إجبار التحديث الجديد على التنشيط فوراً بدون انتظار إغلاق التاب
  self.skipWaiting();
});

// تنظيف الكاش القديم تماماً بمجرد نزول أي تحديث جديد على السيرفر
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('تم تدمير كاش المنيو القديم بنجاح:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // 🔥 السطر السحري الثاني: السيطرة الفورية على جميع صفحات الزباين المفتوحة حالا وتحديثها
      return self.clients.claim();
    })
  );
});

// استراتيجية جلب البيانات (الشبكة أولاً، ولو مفيش إنترنت يفتح من الكاش)
self.addEventListener('fetch', (event) => {
  // استثناء روابط الجوجل شيت والـ Live عشان نقرأ الأسعار الجديدة فوراً من السيرفر
  if (event.request.url.includes('docs.google.com') || event.request.url.includes('cache_bust')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // لو الشبكة تمام، نحدث الكاش بالنسخة الأحدث ونرجع الملف للزبون
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // لو مفيش إنترنت نهائياً عند الزبون، يفتح من الكاش المتخزن على موبايله
        return caches.match(event.request);
      })
  );
});
