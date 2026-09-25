/* Service worker for the תזונה app.

   Three jobs:
   1. Be present, so the page can call registration.showNotification()
      (mobile Chrome forbids the `new Notification()` constructor).
   2. Show the daily reminder when the push server wakes us - this is the only
      path that works with the app fully closed.
   3. Handle taps on a notification - focus the open app, or open it.

   Deliberately no caching while we iterate: a stale cache on a single-file
   app is far more painful than a network round-trip. */

// THE FALLBACK ONLY. The real sentence comes from the page, which stashes it
// in the sumrem-config cache when it subscribes - already translated and
// already in the voice the reader chose, neither of which this worker can
// work out for itself. These two are what shows if that cache is empty or
// unreadable, and they are the app's own English rather than a third wording.
//
// They were the ONLY text here until 25 September, so the notification that
// arrives with the app closed - the whole point of a push - was in English on
// every screen in every language.
var MSG_TITLE = 'Reminder to close the day';
var MSG_BODY = "You haven't stopped to close the day yet.";

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
  var pushed = null;
  if (e.data) {
    try { pushed = e.data.text() || null; } catch (err) {}
  }
  // iOS revokes push permission from a web app that receives a push without
  // showing a notification, so EVERY path below ends in one - including the
  // one where the cache cannot be read at all.
  e.waitUntil(
    (async function () {
      var title = MSG_TITLE, body = pushed || MSG_BODY;
      try {
        // the page left the sentence here when it subscribed: already in the
        // reader's language, and already in the voice she chose
        var cfg = await readConfig();
        if (cfg && cfg.title) title = cfg.title;
        if (!pushed && cfg && cfg.body) body = cfg.body;
      } catch (err) {}
      return self.registration.showNotification(title, {
        body: body,
        icon: 'assets/logo.png',
        badge: 'assets/logo.png',
        tag: 'sumrem',
        renotify: true,
      });
    })()
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
