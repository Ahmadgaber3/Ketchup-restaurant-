const CACHE_NAME = 'ketchup-cache-v-' + Date.now(); // كاش ديناميكي يتغير مع كل تشغيل لضمان عدم التعليق

// التثبيت
self.addEventListener('install', (event) => {
    self.skipWaiting(); // إجبار السيرفس وركر الجديد على التنشيط فوراً دون انتظار إغلاق الأبلكيشن
});

// التنشيط ومسح الكاش القديم تماماً
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('تم تنظيف كاش قديم بنجاح');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // جعل السيرفس وركر يسيطر على كل الصفحات المفتوحة فوراً
    );
});

// استراتيجية جلب البيانات: تروح للسيرفر الأول (Network First) عشان تجيب التعديل الجديد فوراً، ولو مفيش نت يجيب من الكاش
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // لو الاستجابة سليمة، حط نسخة في الكاش للطوارئ ورجعها
                if (event.request.method === 'GET' && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // لو مفيش إنترنت خالص يشتغل من الكاش القديم المتسيف
                return caches.match(event.request);
            })
    );
});
