const CACHE_NAME = 'travelogue-luxury-light-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/assets/css/global.css',
  '/assets/js/utils.js',
  '/auth/auth.js',
  '/auth/auth.css',
  '/auth/login.html',
  '/auth/signup.html',
  '/manifest.json',
  '/pages/destinations.html',
  '/pages/packages.html',
  '/pages/about.html',
  '/pages/blog.html',
  '/pages/gallery.html',
  '/pages/contact.html',
  '/pages/faq.html',
  '/pages/terms.html',
  '/pages/privacy.html',
  '/destinations/darjeeling.html',
  '/destinations/sikkim.html',
  '/destinations/dooars.html',
  '/destinations/sittong.html',
  '/destinations/mandarmani.html',
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Fetch Event
self.addEventListener('fetch', event => {
  const request = event.request;
  const acceptsHtml = request.headers.get('accept')?.includes('text/html');
  const isThemeAsset = request.url.endsWith('.css') || request.url.endsWith('.js') || request.url.endsWith('/manifest.json');

  if (request.method !== 'GET') {
    return;
  }

  if (acceptsHtml || isThemeAsset) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                // Don't cache API calls
                if (!request.url.includes('/api/')) {
                    cache.put(request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});

// Activate Event (clean up old caches)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
