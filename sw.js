const CACHE = 'nisseland-v16';
const FILES = ['./', 'index.html', 'style.css', 'manifest.webmanifest', 'icons/icon.svg',
  'js/audio.js', 'js/store.js', 'js/story.js', 'js/taskbank.js', 'js/tasks.js',
  'js/avatar.js', 'js/art.js', 'js/room3d.js', 'js/world.js', 'js/app.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('nisseland-') && k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});

// Network-first so updates arrive quickly; cache keeps the game playable offline.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.includes('/rest/v1/')) return;
  // no-cache: ask the server every time, so the browser's own cache can't serve old game files
  e.respondWith(
    fetch(req, url.origin === location.origin ? { cache: 'no-cache' } : undefined).then(res => {
      if (res.ok && (url.origin === location.origin || url.host.includes('fonts.g'))) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
  );
});
