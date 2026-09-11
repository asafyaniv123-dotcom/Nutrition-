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

**Parsing is not running.** `return''+_t('x')+''` rewritten to `return_t('x')`
parses perfectly — it is a call to an undefined function, not a return — and
throws only when that branch executes. It shipped, and driving the screens is
what found it. When a replacement removes the text right after a keyword, put
the space back.

Two traps specific to this file. **Write patch scripts as files**, never as
`node -e` — the shell eats backslashes and returns confidently wrong results.
And **`{ … }` blocks overlap `style="…"` attributes**, so an edit reached
through both gets applied twice.

**Never touch:** `index.html` (release only), and the game inside
`<script id="game-src">` — a standalone document with its own `:root`. Every
pass should assert it comes through byte-identical.

**The open work is written down.** `TODO.md` holds what Asaf has asked for and
is not built yet; `I18N.md` and `UX-AUDIT.md` hold the internationalisation and
UX work, including what was deliberately left alone and why.

## Every change ships its languages

**The app is meant to be international** — Hebrew, English, German, Spanish,
Japanese, French, Italian, Portuguese, Simplified and Traditional Chinese,
Arabic. Not a Hebrew app with translations bolted on. That is a rule about how
we work, not a phase that ends:

**A change that adds a string is not done until every shipped language answers
it.** `data/lang/*.json` are the languages a person can actually pick, so a key
one of them is missing is a Hebrew word on their screen. The check enforces it:

    node tools/build-lang-template.mjs          # regenerate, and name what is new
    node tools/build-lang-template.mjs --check  # fails on a stale template OR a gap

So the loop for any user-facing text is: edit `dev/index.html`, regenerate,
answer the new keys everywhere, re-check until it is quiet.

**Write English as the original, not as a translation of the Hebrew.** The
reader has never seen the app and does not know what *סיום יום* is meant to be.
Every other language is written from the English, because a Japanese translator
does not read Hebrew — which makes English the pivot and worth more care than
the rest.

**Four rules the key set has to keep**, each learned from a bug that shipped:

1. **One key, one meaning.** `ש` was Saturday, fat *and* seconds. Saturday is S
   and fat is F; no dictionary can say both.
2. **A sentence is one key.** Never assemble one from fragments — `_t('(כעת') +
   n + ')'` hands over half a parenthesis. `find-glued-sentences.mjs` catches
   the pair shape, the lone fragment, the pair split over a `<br>`, and a
   **plural chosen by a ternary**. That last one is a rule of its own: a
   ternary has two branches, Hebrew has three plural categories and Arabic
   six, so `n===1?_t('יום'):_t('ימים')` can never say *יומיים*. Answer with a
   plural key — a dictionary value that is an object of categories — and pass
   the count as `{n:…}`; `Intl.PluralRules` does the grammar. The key needs
   no `{n}` hole to inflect, which is how a badge that draws the number
   itself still gets the right word beside it. The same check also finds a
   count printed beside a noun that never tries to inflect at all
   (`now.sets +' '+ _t('סטים')` → *1 Sätze*), and a value glued to a
   preposition (`n +' '+ _t('מתוך') +' '+ total`) — the shape where Japanese
   had answered *מתוך* with a slash, because the word order it wanted was
   not available to it.
3. **A list that is compared or stored is data.** Translate it at the point of
   display, never in the declaration. `find-translated-data.mjs` is the check,
   and it has caught fourteen collections that looked exactly like labels.
4. **A unit comes from `fmtWeight` / `weightUnit`**, never welded into a
   sentence — otherwise an imperial reader is shown pounds labelled in
   kilograms, which shipped.
5. **Options a person chooses between must stay distinct in every
   language.** The daily reflection opens with a five-point mood scale, and
   Spanish put *Bien* under faces three and four while Arabic put *لا بأس*
   under two and three — a person being asked to choose between two
   identical words. Hebrew cannot show it, because in Hebrew every step is
   distinct; it exists only in the answers. Where the collapse is real —
   Hebrew marks gender on בן משפחה / בת משפחה and ten languages do not —
   the list is drawn through `optOnce`, which shows one chip per label and
   lights it for either value. The same check reads capitals: *Zum Besseren ·
   zum Schlechteren · Beides* is three chips in one row, two capitalised and
   one not, in six languages — each defensible alone and wrong together.

Hebrew is its own key, so the Hebrew build carries no dictionary and a missing
translation falls back to readable text rather than to `fitness.set.add`.

**Seven checks are tools rather than prose**, and all should only ever go down:

    node tools/find-glued-sentences.mjs        # sentences built from fragments
    node tools/find-translated-data.mjs        # _t() results used as data, not shown
    node tools/find-units-in-strings.mjs       # kg or ml welded into a sentence
    node tools/find-frozen-translations.mjs    # _t() called once, at load, then never
    node tools/find-unwrapped-hebrew.mjs       # Hebrew that never reaches _t() at all
    node tools/find-duplicate-options.mjs      # two choices wearing the same label,
                                               # or disagreeing about capitals
    node tools/build-lang-template.mjs --check # the template still matches the app

`tools/test-background-fill.mjs` is a seventh, of a different kind: it lifts
the closet's background flood fill out of the shipped file and runs it against
pictures whose right answer is known, asserting no garment pixel is ever taken.
It also records the case the fill cannot do, so nobody has to rediscover it.

They exit non-zero when they find anything. All but the last take a file path,
so they can be pointed at an older revision — which is how each was shown to
actually detect the bugs it claims to, rather than being trusted because it
reported nothing.

The last two divide the ground between them. A collection declared at the top
level calls `_t()` while the page is still booting, before any dictionary has
been fetched — so it fills with Hebrew and stays Hebrew for the life of the
tab. `langOn(fn)` runs fn then and again on every language change; the frozen
check finds the declarations that are missing it. The unwrapped check finds the
opposite failure: a Hebrew string that never tried to be translated, which no
language file can reveal because it has no key to be missing.

**Three bugs of the same shape, so far.** An array whose middle items are
`_t('…')` and whose first — or last — is a bare string. It is what a pass
anchored on a preceding comma leaves behind. When you find one, wrap the whole
declaration and count, rather than picking lines off one at a time.

**A key may carry a context after a vertical bar.** `בוקר` is one Hebrew word
for the part of the day and for the meal, and German has two; `_t('בוקר|ארוחה')`
says which is meant. Nothing shows the bar — with no answer `_t` returns the
part before it — so the Hebrew app is unchanged and a translator sees both
halves. Reach for it only when one Hebrew word genuinely needs two answers.

**A tool that has never caught anything has not been tested.** Twice now a
detector was written, reported zero, and was believed — and both times it was
missing the very bugs it had been written for. `find-translated-data.mjs`
initially caught **none** of the three collections that motivated its second
pass, because two are declared across several lines and the third is reached
through a member rather than an index. So: after writing a check, run it against
a revision that has the bug, and record both numbers.

That matters more than it sounds. The units check exists because a commit
asserted the job was done, having searched only for the Latin `kg` while every
Hebrew `ק"ג` went past — and the app spells that two ways.

## Layout

- `index.html` - the whole app: markup, CSS and JS in one file.
- `sw.js` - service worker: notification permission surface, web push receiver.
  No caching, deliberately.
- `push-server/` - Cloudflare Worker holding push subscriptions and firing the
  daily reminder. Deployed separately with wrangler.
