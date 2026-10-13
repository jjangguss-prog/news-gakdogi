// 뉴스 각도기: 오프라인 지원. 화면과 자료(data/*.json)는 늘 새로 받아 보고, 안 되면 마지막에 받은 것을 보여 준다.
const CACHE = 'news-gakdogi-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isJson = /\.json(\?|$)/.test(req.url);
  const isPage = req.mode === 'navigate' || req.url.endsWith('/') || req.url.endsWith('index.html');
  if (isPage || isJson) {
    const key = isJson ? req.url.split('?')[0] : 'index.html';
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(key, copy));
      return res;
    }).catch(() => caches.match(key)));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
