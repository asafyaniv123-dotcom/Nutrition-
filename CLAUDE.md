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

## How we work

**Don't stop to ask permission for ordinary work.** Edit, run, test, commit,
push. Releasing is included: `./release.sh --go` once a change is verified and
worth shipping. Ask only when the answer would genuinely change what gets
built, or before something destructive.

**Done means proven, not asserted.** The checks that have actually caught bugs
here, in the order they earn their keep:

1. **Reverse the change and diff it.** If undoing a mechanical pass does not
   return the original byte for byte, the pass is wrong. This caught ten
   corrupted declarations in the direction pass.
2. **Measure the result in the browser, on every screen, not one.** Geometry
   beats `getComputedStyle`, which reports `text-align` as the keyword that was
   written — so `start` and `right` read as different while painting the same.
3. **Walk the real path.** Type into the actual boxes, press the actual button,
   reload the actual page. Calling the function from the console has produced
   false passes here more than once.
4. **Assert a new global is free before adding it** — free means nothing
   *shadows* it, not that nothing declares it. `t` is bound as a local in 74
   places in this file.

A reversal test proves a transform is lossless, not that it is *right*: it
cannot see a string that was translated but is used as a lookup key, and it
cannot see a `var` read before its own line assigns it. Both of those shipped.

Two traps specific to this file. **Write patch scripts as files**, never as
`node -e` — the shell eats backslashes and returns confidently wrong results.
And **`{ … }` blocks overlap `style="…"` attributes**, so an edit reached
through both gets applied twice.

**Never touch:** `index.html` (release only), and the game inside
`<script id="game-src">` — a standalone document with its own `:root`. Every
pass should assert it comes through byte-identical.

**The open work is written down** in `I18N.md` and `UX-AUDIT.md`, including what
was deliberately left alone and why.

**Two checks are tools rather than prose**, and both should only ever go down:

    node tools/find-glued-sentences.mjs    # sentences built from fragments
    node tools/find-translated-data.mjs    # _t() results used as data, not shown

The second exits non-zero when it finds anything. Both accept a file path, so
they can be pointed at an older revision — which is how they were shown to
actually detect the bugs they claim to.

## Layout

- `index.html` - the whole app: markup, CSS and JS in one file.
- `sw.js` - service worker: notification permission surface, web push receiver.
  No caching, deliberately.
- `push-server/` - Cloudflare Worker holding push subscriptions and firing the
  daily reminder. Deployed separately with wrangler.
