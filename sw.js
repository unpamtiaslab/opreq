// ==================== SERVICE WORKER for PERSISTENT NOTIFICATIONS ====================
// Service Worker Version
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `aslab-opreq-${CACHE_VERSION}`;

// Assets to cache
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style/style.css',
  './script/script.js',
  './config.json',
  './images/aslab_logo.webp',
  './images/filkom.webp',
  './images/favicon.ico'
];

// ==================== INSTALL EVENT ====================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// ==================== ACTIVATE EVENT ====================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// ==================== FETCH EVENT (Offline Support) ====================
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version or fetch from network
        return cachedResponse || fetch(event.request)
          .then((response) => {
            // Cache new responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            return response;
          });
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('./index.html');
      })
  );
});

// ==================== PUSH EVENT (Receive Notifications) ====================
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {
    title: '🔔 ASLAB UNPAM',
    body: 'Anda memiliki notifikasi baru',
    icon: './images/aslab_logo.webp',
    badge: './images/favicon.ico',
    vibrate: [200, 100, 200],
    tag: 'aslab-notification',
    requireInteraction: false,
  };

  // Parse push data if exists
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (error) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      vibrate: data.vibrate,
      tag: data.tag,
      requireInteraction: data.requireInteraction,
      data: {
        url: data.url || './',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'open',
          title: '📖 Buka Website',
          icon: './images/aslab_logo.webp'
        },
        {
          action: 'close',
          title: '❌ Tutup',
          icon: './images/favicon.ico'
        }
      ]
    })
  );
});

// ==================== NOTIFICATION CLICK EVENT ====================
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open or focus existing tab
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const url = event.notification.data?.url || './';
        
        // Check if already open
        for (let client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ==================== NOTIFICATION CLOSE EVENT ====================
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
  
  // Track notification dismissal
  event.waitUntil(
    self.registration.pushManager.getSubscription()
      .then((subscription) => {
        // Could send analytics here
        console.log('[SW] Notification dismissed by user');
      })
  );
});

// ==================== BACKGROUND SYNC EVENT ====================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-countdown') {
    event.waitUntil(syncCountdown());
  }
});

// ==================== PERIODIC BACKGROUND SYNC ====================
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);

  if (event.tag === 'check-deadline') {
    event.waitUntil(checkDeadlineAndNotify());
  }
});

// ==================== MESSAGE EVENT (Communication with main thread) ====================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleNotification(event.data.payload);
  }

  if (event.data.type === 'CHECK_DEADLINE') {
    checkDeadlineAndNotify();
  }
});

// ==================== HELPER FUNCTIONS ====================

async function syncCountdown() {
  try {
    const response = await fetch('./config.json');
    const config = await response.json();
    
    if (config.countdown_deadline) {
      const deadline = parseDeadline(config.countdown_deadline);
      const now = Date.now();
      const daysLeft = Math.floor((deadline - now) / (1000 * 60 * 60 * 24));
      
      console.log('[SW] Days left:', daysLeft);
      
      // Send message to all clients
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'COUNTDOWN_UPDATE',
          daysLeft: daysLeft
        });
      });
    }
  } catch (error) {
    console.error('[SW] Sync countdown failed:', error);
  }
}

async function checkDeadlineAndNotify() {
  try {
    const response = await fetch('./config.json');
    const config = await response.json();
    
    if (!config.countdown_deadline) return;
    
    const deadline = parseDeadline(config.countdown_deadline);
    const now = Date.now();
    const distance = deadline - now;
    const daysLeft = Math.floor(distance / (1000 * 60 * 60 * 24));
    
    // Notification configurations
    const notifications = [
      { days: 7, title: '⚠️ 1 Minggu Lagi!', body: 'Pendaftaran ASLAB ditutup dalam 7 hari', requireInteraction: false },
      { days: 3, title: '🔔 3 Hari Lagi!', body: 'Segera daftar! Hanya 3 hari tersisa', requireInteraction: true },
      { days: 1, title: '⏰ Besok Terakhir!', body: 'Ini hari terakhir pendaftaran ASLAB!', requireInteraction: true },
      { days: 0, title: '🚨 Hari Ini Deadline!', body: 'Pendaftaran ASLAB ditutup hari ini!', requireInteraction: true }
    ];
    
    const notifConfig = notifications.find(n => n.days === daysLeft);
    
    if (notifConfig) {
      // Check if already sent today
      const cache = await caches.open(CACHE_NAME);
      const sentKey = `notification_sent_day_${daysLeft}`;
      const today = new Date().toDateString();
      
      const sentResponse = await cache.match(sentKey);
      let lastSent = null;
      
      if (sentResponse) {
        lastSent = await sentResponse.text();
      }
      
      if (lastSent !== today) {
        // Send notification
        await self.registration.showNotification(notifConfig.title, {
          body: notifConfig.body,
          icon: './images/aslab_logo.webp',
          badge: './images/favicon.ico',
          vibrate: [300, 100, 300, 100, 300],
          tag: `deadline-${daysLeft}`,
          requireInteraction: notifConfig.requireInteraction,
          data: {
            url: './',
            daysLeft: daysLeft,
            timestamp: Date.now()
          },
          actions: [
            {
              action: 'open',
              title: '📝 Daftar Sekarang'
            },
            {
              action: 'close',
              title: 'Tutup'
            }
          ]
        });
        
        // Mark as sent
        const response = new Response(today);
        await cache.put(sentKey, response);
        
        console.log('[SW] Notification sent for', daysLeft, 'days left');
      }
    }
  } catch (error) {
    console.error('[SW] Check deadline failed:', error);
  }
}

function scheduleNotification(payload) {
  const { title, body, delay } = payload;
  
  setTimeout(() => {
    self.registration.showNotification(title, {
      body: body,
      icon: './images/aslab_logo.webp',
      badge: './images/favicon.ico',
      vibrate: [200, 100, 200],
      tag: 'scheduled-notification',
      requireInteraction: false
    });
  }, delay);
}

function parseDeadline(deadlineData) {
  const months = {
    'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
    'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
    'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
  };
  
  const [day, monthName, year] = deadlineData.date.split(' ');
  const month = months[monthName];
  const isoDate = `${year}-${month}-${day.padStart(2, '0')}`;
  
  return new Date(`${isoDate}T${deadlineData.time}`).getTime();
}

// ==================== KEEP ALIVE (Prevent SW from sleeping) ====================
self.addEventListener('fetch', (event) => {
  // This keeps service worker active
});

console.log('[SW] Service Worker loaded successfully');
