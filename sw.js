const CACHE = 'caihe-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// 网络优先：有网就拿最新，没网才用缓存
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(resp => {
      if (resp.ok) {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return resp;
    }).catch(() => caches.match(e.request))
  );
});

// 新版本检测：发现新 SW 立即激活
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
