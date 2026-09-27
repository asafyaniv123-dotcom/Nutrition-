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
`dev/index.html` + `dev/sw.js` to the root, refreshes `stable/`, and commits.

**And `data/` is not the app's data — `stable/data/` is.** For a long time it
was: `appBase()` strips `/dev/`, so *both* copies fetched `data/`, `assets/`
and `vendor/` from the root, and a language file edited for a dev experiment
was on her phone the moment Pages built — no release, no diff, no way back.
Since 1 September `data/lang` alone changed in 191 commits. So the data now has
the shape the app always had: `liveBase()` sends dev to the working copy and
the stable app to `stable/`, a snapshot only `release.sh` writes. **The twelve
tools are unchanged — they read `data/`, which is still where you edit.** One
snapshot directory rather than `data-stable/` + `assets-stable/` +
`vendor-stable/`, because three parallel names are three chances to forget one.

Two consequences worth keeping in mind. A release's dry run now *names* every
data file that would start reaching her, which is the half it used to be blind
to. And `.gitattributes` pins both trees to LF: `core.autocrlf` is true here,
so without it a fresh clone checks both out as CRLF, the first tool to rewrite
a dictionary leaves `data/` as LF, and the release then cries wolf on twelve
untouched files — a guard that cries wolf is a guard that gets ignored.

The two `index.html` files are byte-identical by design, so a release is a plain
copy with nothing to merge. Everything dev-specific is decided at runtime from
the `/dev/` path:

- a `localStorage` shim near the top of `<head>` namespaces every key with
  `dev:`, seeded once from the real data so dev opens looking lived-in. A dev
  experiment therefore cannot touch the real week of data. `__devReseed()` in
  the console re-copies the real data over the sandbox.
- `PUSH_SERVER` is blank in dev, so only the stable app subscribes to the daily
  push - otherwise the phone would get two notifications every evening.
- `liveBase()` answers `stable/` for the stable app and the working copy for
  dev. `sw.js` makes the same decision from `self.location.pathname` (`IS_DEV`),
  which is what lets both copies of it stay byte-identical.
- `SUMREM_CACHE` namespaces the one Cache Storage entry. **Cache Storage is per
  ORIGIN, not per path**, so before this dev wrote the config the stable app's
  service worker reads — handing it a blank server, which makes
  `pushsubscriptionchange` return early and the reminder stop arriving one day
  with no visible cause. Storage is per device, so this never reached her; it
  reached every device that opened both, which is every device we test on.
- a small `DEV` badge sits in the top-left corner.

`manifest.json` and `dev/manifest.json` differ (different app name and theme
colour) and are *not* copied by a release - that difference is what makes the
phone install them as two separate icons. Because they are never copied, the
stable one points at `stable/assets/logo.png` directly; dev's points at its own
`dev/assets/`. Both were found on the wire, not by reading, and they are the
reason the rule has no exception list: an exception list is what rots.

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

**Never touch:** `index.html` (release only).

The game that used to live inside `<script id="game-src">` — a standalone
document with its own `:root` — is **gone**: `game-src` appears zero times in
both copies. The rule that guarded it stayed here after it left, and on
24 Sep a release gate that asserted "it comes through byte-identical" happily
reported *identical* on a slice of **length zero**. A guard whose subject has
been removed is worse than no guard, because it answers. If a standalone
document is ever embedded again, bring the rule back and make it assert the
slice is non-empty first.

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
   kilograms, which shipped. **A number and a date are the same rule.**
   `nfmt` and `dfmt` are the one place that knows the reader's digits,
   separators and date order; written by hand, `11/9/2026` is the eleventh of
   September in Hebrew and the ninth of November in American English, and a
   raw `5` sits beside `٥` on the same Arabic screen. `_t` now formats any
   hole whose value is an actual number, so a whole sentence only has to
   pass the number in. **A percent sign is a unit too** — Arabic writes `٪`
   and French puts a space in front of it — so a percentage comes from
   `pfmt()`, never from `nfmt(n)+'%'`. And the rule has a mirror image: a
   number a MACHINE reads must never be formatted. `style.height = "٥٠%"` is
   not a CSS length and the browser discards it; `find-formatted-css.mjs`
   is the check, and the bars it was written for had shipped.
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

**Thirteen checks are tools rather than prose**, and all should only ever go down:

    node tools/find-glued-sentences.mjs        # sentences built from fragments
    node tools/find-translated-data.mjs        # _t() results used as data, not shown
    node tools/find-units-in-strings.mjs       # kg or ml welded into a sentence
    node tools/find-frozen-translations.mjs    # _t() called once, at load, then never
    node tools/find-unwrapped-hebrew.mjs       # Hebrew that never reaches _t() at all
    node tools/find-hardcoded-english.mjs      # English written straight into the markup,
                                               # which no language file can reveal
    node tools/find-duplicate-options.mjs      # two choices wearing the same label,
                                               # or disagreeing about capitals
    node tools/find-raw-clock-days.mjs         # a DAY decided from new Date(),
                                               # which does not know the day ends at 04:00
    node tools/find-crowd-address.mjs          # Hebrew speaking to a crowd in an
                                               # app that addresses one person
    node tools/find-formatted-css.mjs          # a reader's number used as a machine's,
                                               # and a percent sign welded on by hand
    node tools/find-masculine-left.mjs      # a sentence the app still says to HER
                                               # in the masculine, or turns only halfway
    node tools/find-unreadable-tokens.mjs      # a colour named "readable as text"
                                               # that measures 2.8:1
    node tools/build-lang-template.mjs --check # the template still matches the app

**`find-unreadable-tokens.mjs` is the newest, and it exists because a COMMENT
was being used as evidence.** Five palette tokens carry the note *"readable as
text"*. Over one night three of them turned out not to be, each found by
accident on a different screen: `--terra-700` was 3.21:1 in thirteen places,
`--amber-700` 2.83 in eleven, `--green-700` 2.82 in five. The comment stopped
being evidence the first time it was wrong; this is the assertion that
replaces it.

It also reads every token used as a `color:` anywhere, not only the ones that
claim to be readable — which is what turned up **41 more sites** where a green,
amber, water or indigo FILL was being read as text, the same bug the 140
violet and terracotta ones were. Against the revision before the fix it finds
10; against the fix, 0.

Two things make it cheap, and both are worth knowing. `--card`, `--panel` and
`--page` all resolve to `--nu-ground` inside the twelve module blocks, so the
app has essentially **one background** and one number per token answers the
question. And a token a module block redefines never paints its `:root` value,
so the check reads those overrides from the file rather than carrying a list.

Its own first two versions were wrong the same way, which is the lesson worth
keeping: **the braces in a comment are not structure.** This file's comments
are prose *about* CSS, and one of them contains the literal text
`.app{background:var(--nu-ground)}`. Both early versions read that closing
brace as the end of a rule, put `--muted-soft` outside every module block, and
reported 127 uses of a value that never paints. Any structural scan of this
file blanks comments first.

`find-formatted-css.mjs` was the newest before it, and the bug it was written
for had shipped. `nfmt` writes numbers the way the READER writes them, so in Arabic
it answers `٥٠` — and `style.height = "٥٠%"` is not a CSS length, so the
browser silently discards it. The daily summary's four macro bars were built
that way and had been drawing at **zero height** for every Arabic reader.
Nothing could see it: Hebrew and English happen to use the digits CSS
accepts, so the only broken build was the one nobody opened.

It reads the QUESTION the number answers — inside `style="…"` a machine
reads it and it must never be formatted; followed by a bare `%` a person
reads it and the sign is a **unit**, so it comes from `pfmt()`. Its first
version demanded the closing quote too (`+'%'`) and therefore matched one
site in three, which is how a detector reports almost nothing and gets
believed. Against the revision that has the bug it finds **4**; against the
fix, **0**.

The newest one has the same shape as the units check and the same origin. This
app's day ends at **04:00**: `appNow()`, `todayStr()` and `dayShift()` carry
that rollover and `new Date()` does not, so between midnight and four every
raw-clock day decision is a day ahead of the day the person is still living
in — while everything they log is filed under the app's day. Seventeen of them
had accumulated, and the home card was printing *היום* over tomorrow's date
with today's schedule underneath it.

It needs no allow-list, which is the point, because the app genuinely does want
the wall clock in several places. What it reads is the QUESTION being asked:
`getHours` is a clock question, `getDate`/`getMonth`/`getFullYear`, a floor to
midnight, or a date handed to `dfmt` is a DAY question. A variable answering
both — the home card read its date for the header and its minutes for the
progress bar — is reported, and splitting it is the fix.

The newest of them guards the app's VOICE, which nothing else could. Hebrew is
its own key, so a defect in the Hebrew has no key to be missing and no language
file can report it — and the Hebrew was the only place a slip like this could
show at all, because Hebrew marks plural on the verb and the ten languages that
answer it do not. The reminder card said *קבעו שעה קבועה, ותקבלו תזכורת יומית*
while every other screen addresses one person, and all ten translations had
quietly read it as singular: nobody heard a crowd. It resolves escapes before
it looks, because a key is the string `_t` is CALLED with — the first version
of the scan missed the recipe placeholder entirely, since the character in
front of its verb is the letter `n` of a `\n`. And it carries one exemption,
spelled out in the tool: a recipe body is not the app talking. Every language
wrote that placeholder in its own cooking register — German and French the
infinitive, Japanese the dictionary form, Spanish and Arabic the singular
imperative — and Hebrew's cooking register is the plural.

`tools/test-background-fill.mjs` is a seventh, of a different kind: it lifts
the closet's background flood fill out of the shipped file and runs it against
pictures whose right answer is known, asserting no garment pixel is ever taken.
It also records the case the fill cannot do, so nobody has to rediscover it.

They exit non-zero when they find anything. All but the last take a file path,
so they can be pointed at an older revision — which is how each was shown to
actually detect the bugs it claims to, rather than being trusted because it
reported nothing.

Three of them divide the ground between them. A collection declared at the top
level calls `_t()` while the page is still booting, before any dictionary has
been fetched — so it fills with Hebrew and stays Hebrew for the life of the
tab. `langOn(fn)` runs fn then and again on every language change; the frozen
check finds the declarations that are missing it. The unwrapped check finds the
opposite failure: a Hebrew string that never tried to be translated, which no
language file can reveal because it has no key to be missing. And the English
check covers what neither can see — a hardcoded **English** word, which has no
key to be missing either and looks like an ordinary translation until you read
the screen in German. That one shipped twice: an `Exercises` heading among
German ones, and `1.1p 20.2c 0.3f` on every meal row. It carries a short list
of English that is meant to stay English — the app's own name, a platform it
talks to, and the paper-spread headings that are a design choice — and that
list is spelled out in the tool, because a list is the thing that rots.

**Three bugs of the same shape, so far.** An array whose middle items are
`_t('…')` and whose first — or last — is a bare string. It is what a pass
anchored on a preceding comma leaves behind. When you find one, wrap the whole
declaration and count, rather than picking lines off one at a time.

**A key may carry a context after a vertical bar.** `בוקר` is one Hebrew word
for the part of the day and for the meal, and German has two; `_t('בוקר|ארוחה')`
says which is meant. Nothing shows the bar — with no answer `_t` returns the
part before it — so the Hebrew app is unchanged and a translator sees both
halves. Reach for it only when one Hebrew word genuinely needs two answers.

**A key is the string `_t` is CALLED with, not the source between the quotes.**
`_t('למשל:\n200ג עוף')` is filed by the extractor under a backslash and an n
and asked for at runtime with a line break — two different strings, so the
lookup misses and `_t` falls back to its own Hebrew argument. Two recipe
placeholders sat translated into all eleven languages with every answer dead,
and **nothing in the toolchain could see it**: the template and the language
files were consistently wrong in the same way, so `--check` stayed green. The
extractor resolves escapes now; a German screen is what found it.

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
