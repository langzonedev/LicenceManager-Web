// Only explicit, versioned public application files are cached. Never cache an
// API response, customer record, document download or arbitrary navigation URL.
const ROOT = new URL('./', self.location.href);
const CACHE_PREFIX = `licencemanager-shell:${ROOT.pathname}:`;
const VERSION = `${CACHE_PREFIX}v12`;
const FILES = ['index.html','styles.css','app.js','model.js','demo-data.js','manifest.webmanifest','assets/icon.svg','assets/licence-manager-mark-dark.svg','assets/icon-192.png','assets/icon-512.png'];
const allowed = new Set(FILES.map(path => new URL(path, ROOT).href));
self.addEventListener('install', event => { event.waitUntil(caches.open(VERSION).then(cache => cache.addAll([...allowed].map(url => new Request(url, {cache: 'reload'}))))); });
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== VERSION).map(key => caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  if (url.pathname.includes('/api/') || url.pathname.includes('/documents/')) return;
  const navigation = event.request.mode === 'navigate';
  if (navigation && (url.pathname === ROOT.pathname || url.pathname === new URL('index.html',ROOT).pathname)) {
    // Keep HTML and its imports on the same installed release. A network-first
    // document could import the old cached scripts while an update is waiting.
    event.respondWith(caches.open(VERSION).then(async cache => (await cache.match(new URL('index.html', ROOT).href)) || fetch(event.request)));
    return;
  }
  if (allowed.has(url.href)) {
    event.respondWith(caches.open(VERSION).then(async cache => (await cache.match(event.request)) || fetch(event.request)));
  }
});
