# Asked for, not yet built

Things Asaf has asked for that are not done. Newest first. When one is
finished it moves out of here and into a commit message, not into a "done"
section — git already keeps that.

---

## Planning area (2026-09-07)

Four items, all in תכנון זמן.

### 1. ~~A "now" line in the daily view~~ — done

A hairline at the current hour, offset by the minutes into it, with a dot on
the leading edge so it reads as a time rather than as a border. Only on today.

It repositions itself every minute rather than only at render: a line saying
14:00 at twenty past is worse than no line, because it looks authoritative.
One style write on one element, and the interval takes itself down when the
grid is gone.

### 2. ~~The weekly view will not swipe between weeks~~ — done

It was worse than reported: dead on all three horizons, and dead only *some*
of the time, which is why it read as flaky rather than broken.

`_planMode` stopped describing anything when the accordion put all three
panels on one page. The only thing still setting it is `planGo(mode)`,
reachable from two deep-link shortcuts — so arrive that way and the swipe
works, open planning normally and it does not. Two other features were riding
on the same dead variable: `planRerender()` (seven call sites, no `else`,
repainted nothing) and `dpRail()`, the loose-task rail, which simply never
appeared.

### 3. ~~Stretched tasks in the monthly view~~ — done

**Done: no breaks, and the text is no longer cut.**

The month was already drawing one chip per day, each bleeding -6px into the
join so a run would read as one bar. It never could: `.mo-cell` is
`overflow:hidden`, so the bleed is laid out and then clipped away.
`getBoundingClientRect` said the segments touched; the paint said otherwise,
and the paint is what you see. The same clip cut the words, because only the
first segment carries them and it is one seventh of the grid wide —
*"חופשה משפחתית בצפון"* became *"חופשה משפח"*.

Neither could be fixed from inside the cell. The per-day chips stay, because
they are what reserves the right height in the right place, but they are now
invisible placeholders and one continuous bar is drawn over the grid on top of
them.

**Also done: stretching from the monthly view itself.** The far dot is the
handle — it already marks the end of the run, which is the thing being moved.
A one-day task gets the same grab point on its chip, so this is not a one-way
door: shorten a run to a single day and there is still something to pull.

A run stops at its own Saturday. `len` is week-relative and the task lives in
one week's record, so the drag clamps there rather than pretending otherwise.

One caveat worth writing down: the bar is split per grid row, so a run crossing
a Saturday would break where the calendar breaks. That path is unexercised —
`wkDayIndex` is week-relative, so a week task cannot currently extend past its
own Saturday. The code is defensive, not tested.

### 4. ~~Stretched bars collide with the day's other tasks~~ — done

The bar was positioned 19px up from the **bottom** of its band, straight
through whatever chips were there, and nothing reserved space for it — so it
was always going to overlap and only looked right when the band was empty.

Now each bar sits at the top of its band, several in one band stack rather
than pile up, and the chips in that band get a matching padding. The count is
per band across the whole week, not per cell: a bar spans days, so the row it
occupies has to be clear in every column it crosses.

Measured with two spans and two chips in one band: bars at 352 and 363, chips
at 374, zero overlapping pairs.

---

## How to read this file

An item here is a description of the problem, not a design. Where the fix is
obvious it says so; where it is not, the first job is to look at what is
actually happening before deciding.

## The closet (2026-09-07)

Four things, and they are not the same size at all. Two are close, one is a
design pass, one is genuinely hard.

### 1. ~~Seasons~~ — done

Both decisions were taken the way this file argued for. A garment carries a
**set** of seasons, not one — a plain tee is summer and a layer in winter — and
the season filters what you are looking at rather than deciding for you: the
row of pills across the bottom of the closet starts on *all year*, and nothing
hides itself because of the date.

### 2. ~~Share the look~~ — done

Built on item 3, exactly as planned: `lookLayout` computes the composition once
and both renderers read those numbers, so the picture that leaves the phone is
the picture that was on it. The share button hands a PNG to
`navigator.share({files})`, falling back to a download.

One thing to keep in mind if this is ever touched: **the letterbox is
invisible.** A box a fixed 1.5× as wide as it is tall, holding a near-square
photograph, is mostly empty — and on a flat ground with no border, nothing
shows you that. A column whose ink was 200px wide claimed 335, and the
accessory placed beside it landed an inch and a half out across nothing. The
box now takes the photograph's own shape, which means the layout has to have
*seen* the photograph; `LOOK_ASPECT` caches that per ref.

### 3. ~~The look summary~~ — done

Route 1 from `Taste library/screenshots/selected-look-flat-lay.md`: keep the
rectangles, size and place them by category, and let the arrangement carry the
body. Nothing outlines a figure and no mannequin is drawn — hat above top above
trousers above shoes, accessories in their own stack beside them — and the eye
assembles one anyway.

The honest scale was already in the app and unused: every `CLOSET_CATS` row
carries an `h` tuned for the picker strips — 44 for a hat, 86 for trousers, 38
for socks. The look reuses those rather than inventing a second set of numbers
that could drift from them.

### 4. ~~Cutting the garment out~~ — done

> אפשרות להעלות צילומים ולחתוך בצורה מדוייקת באופן חופשי את הבגד, AI שמזהה את
> הבגד ומוריד את הרקע שלו. במידה והבגד נחתך שתהיה אפשרות לעשות מחיקה באופן ידני
> ותיקונים.

Three parts, and the middle one is the problem.

**~~Free-hand cropping~~ — done, and it already was.** `cropMode('free')` draws
a lasso and `cropApply` clips to it with `destination-in`, writing a PNG
because "the outside must stay absent". This file simply had not recorded it.

**~~Manual erase and repair~~ — done.** Two brushes over the alpha channel on
the selected garment, with undo. Bring-back returns only what the current
session erased, and that limit is real rather than an oversight: the picture in
the store is the only original there is, because the lasso already threw the
outside away. If that ever needs to change, the fix is to keep the uncropped
photograph beside the cut one, which doubles what the closet stores — worth it
only if someone actually wants it.

**~~Automatic background removal~~ — done, by not doing segmentation.** The
paragraph that used to sit here said it was impossible, and everything it said
is still true: there is no browser API, on-device segmentation needs 5–25 MB of
WASM and weights, and the app's one AI call cannot succeed as written (it sends
`Content-Type` and nothing else — no `x-api-key`, no `anthropic-version` — and a
browser cannot call that endpoint directly anyway; that is still open, and it is
why *שגיאה בבניית התוכנית* is all the workout-plan builder has ever done).

What was wrong was the question. Segmentation is the general problem — find the
subject in any photograph — and the closet does not have the general problem. A
garment is photographed lying on something. The background is one broad, fairly
even colour that touches every edge of the frame, and the garment does not touch
the edge at all. That is a flood fill from the border, and it needs no model.

It will not survive a patterned duvet, and it is not meant to: the brush is
right there, and the whole argument for building the brush first was that an
imperfect automatic result is a starting point when there is something to fix it
with.

So the honest order was **crop → erase → then decide about automatic**, and the
first two are now done. The decision is what is left, and both halves of it have
answers now:

**Is it needed?** Partly. The arrangement reads as a look with plain rectangles,
so the cut-out is not what makes an outfit legible. What it fixes is the ground:
five photographs bring five slightly different off-whites, and a look is tiles
rather than one surface. That matters most in the shared picture, which is the
copy someone who was not there looks at.

**What would it cost?** Unchanged and still the real obstacle — 5–25 MB of WASM
and weights downloaded to a phone, for an app that is one HTML file. The eraser
makes the cheap version viable in the meantime: cut roughly with the lasso, tidy
with the brush, and no model is downloaded at all.

**Item 3 has now answered half of that question.** The arrangement reads as a
look with plain rectangles — the eye assembles a body from the sizes and the
stacking, and no cut-out was needed for that. What the rectangles *do* cost is
the ground: every photograph brings its own background, so a look is five
slightly different off-whites tiled together rather than one surface. That is a
smaller problem than "it does not read as an outfit", and it is the one the
cut-out actually solves. It also raises the stakes on the shared picture, which
is the copy that leaves the phone and gets looked at by someone who was not
there.

## Waiting on a deploy (2026-09-08)

The nutrition internationalisation shipped in the app; two of the three parts
need the Worker redeployed before they do anything:

    cd push-server && npx wrangler deploy

- **the language on every AI route** — the app now sends `lang` on all seven
  calls, and the running Worker ignores an unknown field, so nothing changes
  until it is deployed. Until then `/analyze` still labels a photographed meal
  in Hebrew whoever is looking at it.
- **`/off`**, the Open Food Facts proxy. Until it exists the live shelf returns
  nothing and the food search behaves exactly as it did before.

The case-sensitivity fix and the translated core foods need no deploy and are
already live.

## Foods with no measured row (2026-09-09)

The international core is built on one rule: every number is copied from a
named row of `data/foods.json`, and `tools/build-food-core.mjs` fails rather
than guessing. The rule held for all 41 foods in batch 1 — the Israeli table
turned out to carry natto, nori, miso, shiitake, mung sprouts, celeriac and
bacon already. What it does not carry is a name anyone outside Israel can
read, which is what the core fixes.

These are the ones it genuinely does not have. **None of them may be added by
typing a number.** Each needs a second measured source, and
`build-food-core.mjs` now requires a `src` naming it — `SOURCES` currently
lists only `moh`, so adding one of these means adding a source first.

- **plain firm tofu.** The table has fried tofu (265 kcal), a branded soft tofu
  and a yellow "tofu cheese". The block of firm tofu that most of the world
  means by the word is absent, and it is not close enough to approximate: the
  fried row is twice the energy.
- ~~**ghee**~~ — WRONG, it is there: `חמאה מזוככת, סמנה`, 876 kcal and
  99.5% fat. Filed under its Arabic name, so no search for the English word
  could find it. In the core since batch 3.
- **paneer** — nothing. Not interchangeable with the brined white cheeses.
- **cassava / manioc** — STILL ABSENT. I struck this through when I found
  `טפיוקה, גרגירים, יבש`, but tapioca is extracted cassava STARCH: 358 kcal
  and 0.2 g protein against fresh cassava root’s ~160 and 1.4. Searched six
  ways (קסאווה, קסאבה, קססווה, מניוק, מנדיוקה, יוקה) — no cassava row exists.
  The tapioca entry itself is honest; my framing of it was not.
- **plantain** — still genuinely absent.
- ~~**tempeh**~~ and ~~**seitan**~~ — both there, both found only by searching
  in Hebrew rather than for the English loanword: `טמפה, מזון אינדונזי שורשי`
  and `סייטן, פרוסות בסגנון סלמי`. Seitan needed two entries, not one: the dry
  gluten powder (`גלוטן חיטה, יבש`) is 370 kcal and cooked seitan is 112, and
  naming the powder "seitan flour" left anyone logging seitan 3.3x high.
- **kimchi** is still absent, but `כרוב כבוש מוחמץ` is sauerkraut and is now
  in the core — a different ferment, not a substitute.
- **kimchi**, **polenta**, **paneer** and plain **firm tofu** are not there
  at all. (tempeh and seitan were, and are now in the core.)
- **nori** is fine, but the row it needed was not the obvious one. The first
  attempt named `אצות, עלים להכנת סושי` - "seaweed, leaves for making sushi",
  35 kcal - and called it a nori sheet in ten languages. That row is raw
  laver; a sheet is `אצות, יבשות` at 298. An eight-fold understatement that
  no check could catch, because the row existed and its numbers were copied
  faithfully. **A row that exists is not the same as the right row**, and
  only reading the Hebrew against the English finds the difference.
- ~~**cheddar**~~ — WRONG, it is there: `גבינה צהובה 32% שומן, צ'דר, תנובה`.
  I read "yellow cheese" and stopped; the row says צ'דר in it. In the core
  since batch 3.

**Five times now** a food recorded here as absent turned out to be present
under a name I did not search for — bacon, ghee, cheddar, tempeh and seitan.

I first wrote "nine", counting the whole batch instead of reading this list:
sardines, anchovies and sauerkraut were never on it, and **sardines were
already in the core** as `core:sardine-raw` before I "recovered" them. That
is the same species of mistake as the ones the list is about — asserting from
memory instead of looking — so it is recorded rather than quietly corrected.
The lesson is not about any of those foods. It is that "the table does not have
it" almost always means "I looked for the wrong word", and that the gap this
whole file closes is a NAMING gap. Search the table three ways before adding
anything to this list.

### Atwater is a flag, not a verdict — and I used it as one

I wrote a section here declaring two cocoa rows "wrong" because their energy
did not match 4·protein + 4·carbohydrate + 9·fat, and I rejected a baby-corn
row on the same reasoning. **That test does not do what I asked of it.**
Measured against the core as already shipped: **47 of 241 rows are more than
10% away from it.** Dry lentils are +48%, raspberries +64%, spirulina −27%.
None of those foods is in any doubt.

Two mechanisms, both ordinary:

- **This table stores NET carbohydrate and computes energy from TOTAL.** So
  anything with fibre reads high. `קמח שעורה עם לתת` is USDA barley malt
  flour: 78.3 g carbohydrate less 7.1 g fibre is exactly the 71.2 stored
  here, and the 361 kcal counts the fibre the 71.2 no longer mentions.
- **Not every food uses 4/4/9.** Specific Atwater factors are lower for some
  proteins and starches, which is why USDA’s own dried spirulina is 290 kcal
  against macros implying 395.

So `קקאו, אבקה, ללא חלב מיובש` — 228 / 19.6 / 24.7 / 13.7, the row I called
wrong — is USDA’s unsweetened cocoa powder verbatim, and it is now the cocoa
the core carries. The 24%-fat "breakfast" row I promoted in its place passed
my test only because its carbohydrate happens to be stored as total. **I
picked the atypical row using a test that cannot tell typical from atypical.**

The baby-corn rejection rested on the same reasoning and is therefore not
established either. It may still be wrong — 16.4 g of carbohydrate is high
for canned baby corn against USDA’s 5.2 — but that is an argument from a
second source, which is the only kind that settles it.

**How to apply:** `vet.mjs` still prints the Atwater gap, because a large one
is worth a look. It is never a reason to drop a row on its own. To doubt a
number, compare it with a second measured table, not with arithmetic.

The obvious second source is a national food composition table published as a
bulk download — USDA FoodData Central publishes SR Legacy and Foundation Foods
as public-domain files needing no API key. That is a real piece of work: the
loader, the row matching, and a `src` per row so a reader can be told where a
number came from. It is not a reason to invent one in the meantime.

## Quinoa (2026-09-09)

Found by a 229-word search sweep across Hebrew, English, Arabic, Japanese and
Chinese. 222 of 229 words returned a curated food in the top three; the seven
that did not split the usual way.

Six were the naming lesson again, for the fifth and sixth time — coffee and
courgette were both in the table under words I had not searched for
(`כולל קפה פילטר`, `בהירים`), and sausage under `נקניקיות`. All six are now in
the core, along with an alias so the ordinary Japanese word for a mushroom,
きのこ, reaches the row named マッシュルーム.

**Quinoa is the one that is genuinely absent.** The table's only quinoa is
inside `פריכיות אורז מלא עם קינואה` — a rice cake that happens to contain
some. A rice cake's numbers are not quinoa's, so it is recorded here rather
than approximated, and it joins cassava, plantain, paneer, polenta, kimchi and
plain firm tofu on the list that needs a second measured source.

## The unwrapped-Hebrew count, and what it is worth (2026-09-09)

**Measured with the same checker on both revisions: 209 at HEAD, 172 now.**
That comparison is the only honest one. An earlier note in this file quoted
187, produced by the checker *before* it could see a `_t()` written with
escaped quotes; that number counted three already-wrapped strings and is not
comparable to anything. When a check changes, every baseline it produced
expires with it.

The 172 are not 172 unfinished jobs. Sorting them by whether the LINE PAINTS —
concatenates into an html string, or assigns innerHTML or a placeholder —
leaves **zero**. The same sort at HEAD leaves **26**, and this pass fixed all
of them. What remains is keys, lookups and comparisons:

- The Hebrew keys of `MUSCLE_ROLLUP` match the exercise database's own muscle
  tags (its *values* are `_t()`); the stop-word list the food search folds
  against; the single letters `foodKey` collapses (`יי`→`י`); the qualifier
  words the food matcher compares (`מיובש`, `אבקה`, `קפוא`); `askDateArg`
  comparing an argument against `היום`; and `עברית`, the Hebrew language's own
  name in the picker, which is correct in every locale. Translating any of them
  breaks the thing it exists for — CLAUDE.md's "a list that is compared is
  data", and the check is doing its job by naming them.
- The remainder are short words in contexts the heuristic cannot read. Worth a
  pass, not urgent.

### The three that painted

**The planning screen's `when`** carried three separate defects on two lines,
none visible in Hebrew:

1. `ביום` was one key doing two jobs — the unit on a steps average ("8,240 a
   day") and the preposition before a weekday. English answered the first, so
   a Sunday plan read *"What matters to you a day Sunday?"*. Fixed by making
   the second a whole phrase, `ביום {day}`, which also lets each language place
   its own preposition: German *am*, Japanese trailing *に*, Arabic leading
   *يوم*, French and Portuguese none at all.
2. The next question was glued from a fragment and a variable, which fixes
   Hebrew word order onto ten other languages. Now one key with `{when}`.
3. The ternary between them compared `when` against bare Hebrew and called
   `.replace('ביום ',…)` on it — but `when` was built from `_t()` one line
   above, so both arms were no-ops in every language including Hebrew. Dead
   code that looked like careful handling.

**The copy toast** built `'✓ '+what+' '+_t('הועתק')` — a noun from the caller,
a verb from here, a space welded between. Measured: `✓ the address Copied`,
`✓ la dirección Copiado`, `✓ l'adresse Copié` for a feminine noun.
`find-glued-sentences` reports zero and is not wrong to: the two halves sit on
opposite sides of a function call, a shape it cannot see. Both fragments were
invisible to the template builder as well, so they had simply stayed Hebrew —
and the moment they were answered they became broken grammar in six languages.
Worth remembering: a string that was never translated is not neutral, it is a
bug waiting for its dictionary.

**A context marker on a stored value.** `חברה|קשר` and `כבד|גוף` were put into
`RELATIONSHIP_TYPES` and `RF_BODY`, and those arrays are not labels — their
entries are written into `p.relationship` and into the day's reflection. The
pipe would have been *saved*, then painted raw in the person's header and the
people list, in Hebrew too; and every reflection already holding a plain `כבד`
would have stopped matching its own chip. `LABEL_CTX` + `labelOf` moves the
marker to the display, where rule 3 says it belongs: the stored value never
changes, only the key looked up when it is painted. `build-lang-template` now
reads that map — and keeps asking for a remapped word anyway when something
else calls `_t()` on it directly, which `כבד` does in the RPE legend.

### The day names were the array bug again

*Sunday | Mon | Tue | Wed | Thu | Fri | Saturday* in nine of ten languages —
the ends full, the middle five abbreviated, which is what a pass anchored
between commas leaves behind. Hebrew hid it: ראשון and שבת are the same length
as everything between them, so one array served both the week strip and the
five sites that head a day.

Split into `WK_DAYS` (full) and `WK_SHORT` (the strip), and measured rather
than asserted — with a `Range` over the text node, because `scrollWidth` on a
nowrap cell reports the *cell* width and called every string a fit, "Donnerstag"
included. **A first measurement of the cell was also wrong**, taken by forcing
`.wk-head` to 358px and so swallowing its own `margin-inline-start:36px`. The
real arithmetic is (390 − 28 page padding − 36 margin − 6×3px gap) / 7 =
**44.0px**, and that inverts the conclusion: *Donnerstag* at 47.4px does not
fit with 1.6px to spare, it **overflows by 3.4px**. Portuguese *Segunda-feira*
overflows by 14. Every short label fits — the widest is Hebrew at 23.1px, then
Arabic 20.0, es/it/pt 19.1, zh 18.6, fr 18.1, en 17.7, de 12.3, ja 9.3.

Two conclusions and a warning: the split was more necessary than the first
measurement suggested, "measure it" is not the same as "measure the right
thing", and a number in a write-up is worth exactly as much as the reader's
ability to reproduce it.

**What would still move the count:** give the checker the paints-vs-data split
so it reports the few that matter instead of a total nobody can act on.

## Cross-script food search (2026-09-09)

`tools/test-food-search.mjs` types every core food's own name in all eleven
languages and asks for that food back — 3,366 queries, nothing guessed, since
a food's own name is not a matter of opinion. **At HEAD, 24 fail. Now, none.**
A hand-written list of everyday words follows, in `food-search-probes.json`.

What it found, all one bug seen twice:

    Lauch   -> Garlic          Knoblauch contains it
    Apio    -> Tapioca pearls  tapioca contains it
    Piña    -> Spinach         espinacas contains it
    Sal     -> Salmon          Sel -> Self-raising flour, Mel -> Melancia
    萝卜     -> Carrot juice    胡萝卜 contains it
    卵      -> Egg yolk        卵黄 contains it
    بيض     -> White cabbage   أبيض contains it
    もやし    -> Alfalfa sprouts アルファルファもやし contains it
    Linsen  -> Lentil sprouts  Linsensprossen begins with it

`foodSearch` built its `starts` bucket from `f.s` — the name in the *current*
ui language — so a query in any other script could only fall through to the
`alt` branch, which produces `phrase` or `words` and nothing better. And `alt`
is all eleven names joined end to end, so `phrase` broke its tie on an offset
into that blob: a number that says only which language happens to sit earlier
in the join. The answers looked arbitrary because they were.

`foodNames` keeps the names as names (`f.na`), and two rules go ahead of the
rest: the query IS one of this food's names, then one of its names BEGINS with
the query. A word boundary cannot separate 萝卜 from 胡萝卜 — Chinese has none,
and German compounds have none either — so exactness has to be a bucket rather
than a tiebreak. `foodWhole` was then reading the wrong string too, and now
asks whichever name matched, which is what separates *Linsen, trocken* from
*Linsensprossen*.

Left open on purpose, recorded in the probe file: a query that is a whole
ingredient word prefers the food whose name *begins* with it, so `rice` leads
with rice noodles and `potato` with the baked potato rather than the boiled
one. That is the existing rule working as designed; whether a bare ingredient
word should mean the plainest food is the same undecided question as
"potato" leading with sweet potato.

`ごはん` reached nothing and now does — an `aka` on `core:rice-white`, the same
shape as きのこ and ドリップコーヒー: searched, never displayed, no number
touched. German *Quark* still reaches nothing and is recorded rather than
guessed, because there is no measured row for it.

## The chevrons pointed at the text they were supposed to lead away from (2026-09-09)

This was recorded once before as "noted, undecided". It is decided now, and
the reason it stayed undecided is that it cannot be reasoned about — every
attempt to work it out on paper gave the wrong answer.

`‹` U+2039 and `›` U+203A carry the **Bidi_Mirrored** property, so a browser
draws them flipped when their resolved bidi level is RTL. Which means the
source character does not mean "left" or "right". It means **direction of
travel in reading order**, and the browser does the flipping:

    ‹  U+2039   backward — drawn left in ltr, right in rtl
    ›  U+203A   forward  — drawn right in ltr, left in rtl

Three measurements, in the order they were taken, because two of them were
wrong and it matters why:

1. **A canvas test said U+2039 mirrors in rtl and U+203A does too.** Nonsense
   on its face — `ctx.direction` is not the DOM's bidi resolution.
2. **A DOM test said neither mirrors.** It put the glyphs next to the Latin
   word "rtl", so the neutrals resolved to LTR level and nothing mirrored. A
   test that reads plausibly and answers the wrong question.
3. **Looking at the Hebrew app settled it.** The fitness row's `‹` sits at the
   row's left end and is *drawn pointing right*, back at its own text.

Against the rule, two things were wrong, and the second was wrong in Hebrew
as well — which is unusual here, where Hebrew is normally the direction that
works.

**Six row chevrons** — the trailing mark on a row that opens something — used
`‹`. English drew it at the right end pointing left; Hebrew at the left end
pointing right. Both pointed back at the row's own text. They are `›` now.

**Six paired prev/next controls** used prev=`›`, next=`‹`, which is inverted.
Driven rather than deduced: on the planning day view in English, the button
drawn as a LEFT-pointing chevron moved Wednesday 09/09 *forward* to Thursday
10/09. The file held both conventions — `btnPrev`/`btnNext`, the closet's
stepper and the workout wizard's back/next already used prev=`‹` next=`›` —
and the minority of three was the correct one.

Four of the six emit `[prev][title][next]`, so their sides were already right
and only the glyphs swapped. The week and month headers emit
`[next][title][prev]`, side inverted too, so there the **handlers** swapped
instead: one change fixing glyph and side together without moving markup.

Verified after: reversing the pass returns the file byte for byte (1,275,372
bytes both ways); the game is untouched; the glyph counts move by exactly the
six openers (41/15 → 35/21) because the four glyph swaps cancel and the two
handler swaps change no glyphs. Then driven in both directions: in English the
right-pointing arrow advances a day, in Hebrew the right-pointing arrow goes
back, and the row chevron points away from its text in both.

**Left alone deliberately:** every back button (`‹` before a label) is already
correct in both directions, and so are the five forward marks that already
used `›`. One oddity recorded rather than changed: at `:12517` a back button
puts its chevron *after* the label rather than before it, unlike its fifteen
siblings — a layout inconsistency, not a direction bug.
