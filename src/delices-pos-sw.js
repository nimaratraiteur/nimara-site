// Nimara Délices POS — Service Worker
// Objectif : la caisse doit se charger INSTANTANÉMENT et fonctionner HORS-LIGNE,
// même sur un écran peu puissant et une connexion lente.
const CACHE = 'nimara-pos-v3';

// Le strict nécessaire pour démarrer (la page est autonome : CSS + JS inline).
const CORE = [
  '/delices-pos/',
  '/assets/manifest-delices.json'
];

// Polices Google (chargées une fois puis servies depuis le cache).
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // Chaque ressource est mise en cache individuellement : si l'une échoue
    // (image renommée, 404…), les autres sont quand même cachées.
    await Promise.allSettled(CORE.map(u => c.add(u)));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }

  // Laisser passer les appels n8n directement vers le réseau.
  if (url.hostname.includes('n8n.cloud')) return;

  // Polices : cache d'abord.
  if (FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(cacheFirst(req));
    return;
  }

  // On ne gère que notre propre origine ensuite.
  if (url.origin !== self.location.origin) return;

  // Page de la caisse : stale-while-revalidate (affichage instantané, MAJ en arrière-plan).
  if (url.pathname.startsWith('/delices-pos')) {
    e.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Images produits : cache d'abord.
  if (url.pathname.startsWith('/assets/images/')) {
    e.respondWith(cacheFirst(req));
    return;
  }

  // Autres assets (css/js/manifest) : stale-while-revalidate.
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(staleWhileRevalidate(req));
    return;
  }
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const c = await caches.open(CACHE);
      c.put(req, res.clone());
    }
    return res;
  } catch (_) {
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cached = await caches.match(req);
  const network = fetch(req).then(res => {
    if (res && res.ok) {
      caches.open(CACHE).then(c => c.put(req, res.clone()));
    }
    return res;
  }).catch(() => null);
  // Renvoie le cache immédiatement s'il existe, sinon attend le réseau.
  return cached || (await network) || new Response('Hors-ligne', { status: 503 });
}
