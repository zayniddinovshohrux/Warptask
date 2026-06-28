// Service Worker for WarpTask
const CACHE_NAME = 'warptask-v1.8.4';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/login.html',
    '/signup.html',
    '/settings.html',
    '/calendar.html',
    '/stats.html',
    '/add.html',
    '/root.css',
    '/bottom_nav.css',
    '/js/auth.js',
    '/js/global.js',
    '/imgs/warptasks.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                // Make network request
                return fetch(fetchRequest)
                    .then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the new response
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // If offline and HTML page requested, return index.html
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});



// NOTIFICATION ACTION + old notif'ni yopish
self.addEventListener('notificationclick', e => {
    e.notification.close();

    if (e.action === 'done') {
        console.log('Task bajarildi 😎');
        // backend request yoki local update qo‘shish mumkin
    } else {
        e.waitUntil(clients.openWindow('/'));
    }
});

// Har safar yangi notification chiqishi uchun eski notiflarni yopish
self.addEventListener('push', e => {
    e.waitUntil(
        self.registration.getNotifications().then(notifs => {
            notifs.forEach(n => n.close()); // eski notiflarni yop
        })
    );
});
