const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/css/styles.css',
    '/assets/js/db.js',
    '/assets/js/index.js',
    'manifest.json',
    "/assets/images/icons/icon_96x96.png",
    "/assets/images/icons/icon_128x128.png",
    "/assets/images/icons/icon_192x192.png",
    "/assets/images/icons/icon_256x256.png",
    "/assets/images/icons/icon_384x384.png",
    "/assets/images/icons/icon_512x512.png",
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@2.8.0',
];

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(PRECACHE)
            .then((cache) => cache.addAll(FILES_TO_CACHE))
            .then(self.skipWaiting())
    );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (event) => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // non GET requests are not cached and requests to other origins are not cached
    if (
        event.request.method !== "GET"
    ) {
        event.respondWith(fetch(event.request));
        return;
    }

    // old if statement: (event.request.url.startsWith(self.location.origin))

    if (event.request.method === "GET") {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    console.log(cachedResponse)
                    // return cachedResponse;
                }

                return caches.open(RUNTIME).then((cache) => {
                    return fetch(event.request).then((response) => {
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                });
            })
        );
    }
});











// const CACHE_NAME = "static-cache-v1";
// const DATA_CACHE_NAME = "data-cache-v1";

// // install
// self.addEventListener("install", function (evt) {
//     evt.waitUntil(
//         caches.open(CACHE_NAME).then(cache => {
//             console.log("Your files were pre-cached successfully!");
//             return cache.addAll(FILES_TO_CACHE);
//         })
//     );

//     self.skipWaiting();
// });
// // activate
// self.addEventListener("activate", function (evt) {
//     evt.waitUntil(
//         caches.keys().then(keyList => {
//             return Promise.all(
//                 keyList.map(key => {
//                     if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
//                         console.log("Removing old cache data", key);
//                         return caches.delete(key);
//                     }
//                 })
//             );
//         })
//     );

//     self.clients.claim();
// });

// // fetch
// self.addEventListener("fetch", function (evt) {
//     if (evt.request.url.includes("/api/")) {
//         evt.respondWith(
//             caches.open(DATA_CACHE_NAME).then(cache => {
//                 return fetch(evt.request)
//                     .then(response => {
//                         // If the response was good, clone it and store it in the cache.
//                         if (response.status === 200) {
//                             cache.put(evt.request.url, response.clone());
//                         }

//                         return response;
//                     })
//                     .catch(err => {
//                         // Network request failed, try to get it from the cache.
//                         return cache.match(evt.request);
//                     });
//             }).catch(err => console.log(err))
//         );

//         return;
//     }

//     evt.respondWith(
//         caches.open(CACHE_NAME).then(cache => {
//             return cache.match(evt.request).then(response => {
//                 return response || fetch(evt.request);
//             });
//         })
//     );
// });
