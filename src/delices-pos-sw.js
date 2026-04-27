// Nimara Délices POS — Service Worker
const CACHE = 'nimara-pos-v1';
const IMGS = [
  '/assets/images/products/banana-bread.png',
  '/assets/images/products/bircher-muesli.png',
  '/assets/images/products/boeuf-8-epices.jpeg',
  '/assets/images/products/brookie.png',
  '/assets/images/products/brownie.png',
  '/assets/images/products/butter-chicken.jpeg',
  '/assets/images/products/cake-citron.png',
  '/assets/images/products/cake-marbre.png',
  '/assets/images/products/cake-pomme-orange.png',
  '/assets/images/products/carrot-cake.png',
  '/assets/images/products/cheesecake-speculos.png',
  '/assets/images/products/cinnamon-roll.png',
  '/assets/images/products/crevettes-curry.jpeg',
  '/assets/images/products/curry-poulet-epices.png',
  '/assets/images/products/curry-pois-chiches.png',
  '/assets/images/products/dal-rouge.png',
  '/assets/images/products/hero-patisseries.png',
  '/assets/images/products/naan.jpeg',
  '/assets/images/products/pakora.png',
  '/assets/images/products/pate-feuilletee-epinards-feta.png',
  '/assets/images/products/pecan-pie.png',
  '/assets/images/products/plat-indien-fumant.png',
  '/assets/images/products/pois-chiches.jpeg',
  '/assets/images/products/poulet-mangue.jpeg',
  '/assets/images/products/poulet-tikka-masala.jpeg',
  '/assets/images/products/poulet-vindaloo.jpeg',
  '/assets/images/products/samosa-legumes.png',
  '/assets/images/products/saag-epinards.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      // Cache the page shell
      return c.addAll(['/delices-pos/', ...IMGS]).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Bypass n8n requests — let them go straight to network
  if (url.hostname.includes('n8n.cloud')) return;
  // Images: cache-first
  if (url.pathname.startsWith('/assets/images/')) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }))
    );
    return;
  }
  // Page: network-first with cache fallback
  if (url.pathname.startsWith('/delices-pos')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Everything else: network only
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
