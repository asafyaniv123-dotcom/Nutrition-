/* Service worker for the תזונה app.

   Three jobs:
   1. Be present, so the page can call registration.showNotification()
      (mobile Chrome forbids the `new Notification()` constructor).
   2. Show the daily reminder when the push server wakes us - this is the only
      path that works with the app fully closed.
   3. Handle taps on a notification - focus the open app, or open it.

   Deliberately no caching while we iterate: a stale cache on a single-file
   app is far more painful than a network round-trip. */

// Kept in sync with SUMREM_MSG / SUMREM_MSG_TITLE in index.html. Duplicated
// rather than imported because pushes carry no payload: the text has to
// already be here when the server wakes this worker.
var MSG_TITLE = 'Daily reflection';
var MSG_BODY = "It's time for your daily reflection";

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

self.addEventListener('push', function (e) {
  // Payload-less by design; if one ever arrives, prefer it.
  var body = MSG_BODY;
  if (e.data) {
    try { body = e.data.text() || MSG_BODY; } catch (err) {}
  }
  // iOS revokes push permission from a web app that receives a push without
  // showing a notification, so this must always resolve to a visible one.
  e.waitUntil(
    self.registration.showNotification(MSG_TITLE, {
      body: body,
      icon: 'assets/logo.png',
      badge: 'assets/logo.png',
      tag: 'sumrem',
      renotify: true,
    })
  );
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

// A subscription can be rotated out from under us. Re-subscribe and re-register,
// otherwise the reminder silently stops arriving one day with no visible cause.
self.addEventListener('pushsubscriptionchange', function (e) {
  e.waitUntil(
    (async function () {
      try {
        var old = e.oldSubscription;
        var key = (old && old.options && old.options.applicationServerKey) || null;
        if (!key) return;
        var fresh = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        });
        var cfg = await readConfig();
        if (!cfg || !cfg.server) return;
        await fetch(cfg.server + '/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: fresh.toJSON(), time: cfg.time, tz: cfg.tz }),
        });
      } catch (err) {}
    })()
  );
});

// The page stashes what the resubscribe needs, since the SW cannot read localStorage.
async function readConfig() {
  try {
    var cache = await caches.open('sumrem-config');
    var res = await cache.match('config');
    return res ? await res.json() : null;
  } catch (err) {
    return null;
  }
}
