# תזונה - a single-file PWA

Two published copies of the same app, both served by GitHub Pages from `main`:

| | URL | role |
|---|---|---|
| stable | https://asafyaniv123-dotcom.github.io/Nutrition-/ | installed on the phone, lived in for a week at a time |
| dev | https://asafyaniv123-dotcom.github.io/Nutrition-/dev/ | updated on every change we make |

## Working rule

**Edit `dev/index.html`, never `index.html`.** The root copy is the app being
used for real; it changes only through a release. When the user is happy with
dev, `./release.sh` shows the diff and `./release.sh --go` copies
`dev/index.html` + `dev/sw.js` to the root and commits.

The two `index.html` files are byte-identical by design, so a release is a plain
copy with nothing to merge. Everything dev-specific is decided at runtime from
the `/dev/` path:

- a `localStorage` shim near the top of `<head>` namespaces every key with
  `dev:`, seeded once from the real data so dev opens looking lived-in. A dev
  experiment therefore cannot touch the real week of data. `__devReseed()` in
  the console re-copies the real data over the sandbox.
- `PUSH_SERVER` is blank in dev, so only the stable app subscribes to the daily
  push - otherwise the phone would get two notifications every evening.
- a small `DEV` badge sits in the top-left corner.

`manifest.json` and `dev/manifest.json` differ (different app name and theme
colour) and are *not* copied by a release - that difference is what makes the
phone install them as two separate icons.

## Layout

- `index.html` - the whole app: markup, CSS and JS in one file.
- `sw.js` - service worker: notification permission surface, web push receiver.
  No caching, deliberately.
- `push-server/` - Cloudflare Worker holding push subscriptions and firing the
  daily reminder. Deployed separately with wrangler.
