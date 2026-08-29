/* Service worker for the תזונה app.
   Two jobs only:
   1. Be present, so the page can call registration.showNotification()
      (mobile Chrome forbids the `new Notification()` constructor).
   2. Handle taps on a notification - focus the open app, or open it.

   Deliberately no caching while we iterate: a stale cache on a single-file
   app is far more painful than a network round-trip. */

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});

// Network passthrough. Chrome wants a fetch handler before it offers "install".
self.addEventListener('fetch', function (e) {
  return;
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var target = new URL('./', self.location.href).href;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) return list[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
