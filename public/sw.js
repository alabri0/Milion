const CACHE_NAME = 'millionaire-cache-v1';
// List of files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/components/HomeScreen.tsx',
  '/components/GameScreen.tsx',
  '/components/EndScreen.tsx',
  '/components/SettingsScreen.tsx',
  '/components/LeaderboardScreen.tsx',
  '/components/PrizeLadder.tsx',
  '/components/LifelineButton.tsx',
  '/components/AudiencePollModal.tsx',
  '/components/PhoneFriendModal.tsx',
  '/services/audioService.ts',
  '/services/geminiService.ts',
  '/questions.json',
  '/audio/background.mp3',
  '/audio/correct.mp3',
  '/audio/wrong.mp3',
  '/audio/click.mp3',
  '/audio/timer.mp3',
  '/audio/win.mp3',
  '/audio/newQuestion.mp3',
  '/audio/fiftyFifty.mp3',
  '/audio/phoneFriend.mp3',
  '/audio/askAudience.mp3',
  '/audio/lose.mp3',
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhFbnwtLuJx97SHaZndJMPd9GJTC2RgYJuObwFsNbrXXGXckhWlvkx8zQuF6fw32sQg1T2cvyb_mVV3lLGlUKCuBqLnRjxhAtJh3B9y8AXOE3XUnqvL3AmDNkiwK5Ixd7b1AsU7zKbQXBki/s1600/%D9%84%D8%B9%D8%A8%D8%A9+%D9%85%D9%86+%D8%B3%D9%8A%D8%B1%D8%A8%D8%AD+%D8%A7%D9%84%D9%85%D9%84%D9%8A%D9%88%D9%86.jpg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0',
  'https://aistudiocdn.com/@google/genai@^1.27.0'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all URLs to cache, but don't fail the entire install if one fails
        const promises = urlsToCache.map(url => {
            return cache.add(new Request(url, { mode: 'no-cors' })).catch(err => {
                console.warn(`Failed to cache ${url}:`, err);
            });
        });
        return Promise.all(promises);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || (response.status !== 200 && response.status !== 0) || response.type === 'error') {
              return response;
            }
            
            // Only cache GET requests
            if(event.request.method !== 'GET') {
                return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Clean up old caches on activation
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
