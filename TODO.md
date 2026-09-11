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

## The photograph: identification and the amount

Asked for as *"ולגבי 2 הזיהוי עצמו והכמות"*. Both were real and neither was
a model being stupid.

**Identification.** Twenty ordinary Hebrew photo outputs through `sayResolve`
- the offline matcher, which answers alone when `/match` times out and which
always chooses the sixty candidates `/match` may pick from - and four came
back with a row that is correctly measured and is not the food:

| the words | the row it picked | should be |
|---|---|---|
| אורז לבן | אורז לבן ארוך, סוגת — 347 | 129, cooked |
| חומוס | חומוס יבש — 364 | about 187 |
| תפוח | תפוח עץ, מסוכר — 129 | 52 |
| בננה | בננה, עם קליפה — 57 | 89, the flesh |

Three causes, all of them the scorer knowing less than the app already knew:
it never looked at which FILE a row came from, though `foodSearch` has
preferred `core` since the potato bug; it could not tell the dry ingredient
from the food; and `foodHas` is loose at both ends on purpose, so חלבה
satisfied חלב and תפוחי satisfied תפוח and the length tie-break then
rewarded them for being short.

Fixed by a file tier (core +1200, Open Food Facts -1200), a state penalty
that skips a term the query itself used, and a bonus for carrying the first
token as a WHOLE word. Every step is smaller than one matched word (4000),
so nothing can outrank something the person actually said. Swept over 306
queries built from the core names: 57 rows changed, and not one dropped the
query's own head word.

**Still wrong: חומוס.** It picks `חומוס קלוי, גת` at 370 - roasted chickpeas
as a snack. This is a data gap, not a scoring one: `core` carries the dry,
the roasted, the canned and the flour, and no row for the dip, which is what
the word means on a plate. The online `/match` gets it right (`חומוס, אחלה`,
187), so it is only the offline fallback that is wrong. Worth a core row,
from a measured source rather than a guess.

**The amount.** The photograph always sends grams, and every one of the
panel's five explanations for where a weight came from is painted behind
`row.unit!=='g'`. So the model's guess at the size of a portion arrived as a
bare number in a box, in the same typeface as a weight off a scale, with
nothing to say which it was - the hardest thing the feature does, shown as
the most certain. It now carries `aiG`, shows an הערכה chip on the line, says
so in words when the row is opened, and stops claiming to be an estimate the
moment someone types over it.

**And the model.** `/see` and `/match` run Sonnet; the other five routes stay
on Haiku. Those two are the ones that look at a picture rather than read a
sentence. Two things learned the hard way: Sonnet 5 rejects `temperature`,
and `/match` at 200 tokens truncated mid-object and reported `unreadable`,
which the app treats as "no answer" and silently falls back from. 500 now.
The routes also return the API's own error message beside the status code,
because "the model refused" and "our request is malformed" looked identical
and cost two deploys to tell apart.

## The plural, and the state penalty in eleven languages

Started as "how many foods have the חומוס shape - a word with no generic
row to land on". The answer is **few**: 26 of 235 core head words land on a
preparation nobody asked for, and most of those are right (an apple with its
peel is an apple; dry gluten is only sold dry). The genuinely wrong ones are
listed at the bottom.

Looking for it in other languages is what found the real defects.

### The state penalty was Hebrew-only

`f.s` holds a row's name in the READER's language, so every term in
`SAY_DERIVED` was inert for ten readers in eleven. The same eight foods,
asked for in each language, priced from the same tables:

| | before | after |
|---|---|---|
| lentils | 106 in Hebrew, **338** in eight others | 106 in ten of eleven |
| pasta | 123 in Hebrew, **348** in eight others | 108-123 in seven |

The terms were read out of the core names - every qualifier used three or
more times, per language - rather than written from memory. That is how the
CJK entries came to carry their bracket: Chinese writes 全麦意面（干）, and a
bare 生 would have matched 花生, which is a peanut.

### "bananas" found nothing at all

Driven in the shipped app, in English:

    bananas 0    cucumbers 0    apples 2 (applesauce)    eggs 1 (a brand)
    carrots 1 (frozen peas)     strawberries 2 (frozen)  potatoes 2 (sweet)

`foodHas` is a substring test and the singular is inside the plural but not
the other way round. Hebrew could never show this - עדשים is the same word
in "עדשים" and in "עדשים מונבטים" - so a year of Hebrew testing was blind to
it, and it was hurting the TYPED search more than the photo.

Only the query folds, never the name: `foodKey` is the storage key for every
weight a person has ever corrected, and folding names would orphan all of
them silently.

Three things the fix had to learn the hard way, each caught by measuring:

1. **The tiers compare whole strings.** Getting the plural into `foodHas`
   put "eggs" in the `words` bucket, where the shortest name wins, and the
   shortest name containing "egg" is Eggplant.
2. **The sorts ask about the query.** `foodWhole(f,q)` with q="eggs" is false
   for every row that arrived through the fold, so the rule that exists to
   stop exactly the Eggplant case collapsed to table order - and Eggplant is
   declared first.
3. **A derived form has to be a whole word.** `Linsen` folds to `linse`,
   which is inside `linseed`, and German lentils read in English came back
   as flaxseed. The probe suite caught it: 531 -> 530.

And one regression of mine that the cross-language measurement caught:
swapping `sayScore`'s gate from a plain substring to `foodHas` broke every
compound - 全粒粉パスタ and Vollkornnudeln both lost their food entirely. The
loose test was loose on purpose. It stays, with the fold added on top.

**Still broken and left alone deliberately:** Italian `-o/-a -> -i/-e`
(lenticchie), German `Eier` and `Walnüsse` (irregular), and `-en` is
deliberately NOT stripped because "chicken" would become "chick" and answer
with chickpeas.

### "Rating", beside a calorie count

Found by driving the photo panel in English rather than in Hebrew. The badge
marking a number as estimated is `_t('הערכה')`, and all ten languages
answered it with the appraisal sense - Rating, Bewertung, Voto, 评分, تقييم.
הערכה is both "an estimate" and "an appraisal"; the wrong one was chosen. No
Hebrew test could see it, because the key IS the Hebrew word. All six uses
mean estimate, so there is no second sense to separate - the answers were
simply wrong, and the neighbouring `מעריך…` was already "Estimating…" in all
ten, which is what makes it certain rather than a matter of taste.

### Left open

- **`foodSearch` has no state penalty at all.** Typing חומוס gives
  "חומוס יבש" and פנקייק gives a dry mix. `sayScore` learned this and the
  typed search did not; they are separate rankers and only one was taught.
- **Data gaps, where nothing honest can be done by ranking.** חומוס has no
  generic dip row anywhere - every one is branded; דוחן (millet) and דג לברק
  exist only raw, in both files. Promotable from the tables into core, with
  measured numbers already in them: `דג סלמון אפוי ללא תוספת שומן בבישול`
  (164, p26.5) and `גרעיני דלעת בלי קליפה, לא קלויים, ללא מלח` (559, p30.2).
- **A non-Hebrew reader can only reach the 306 core rows by name.** The
  6,931 rows in the other two files carry Hebrew names for every reader, so
  an English query cannot match them at all. `/match` could bridge it and is
  never asked, because `sayCandidates` finds no candidates to send.

## A short name is not a plainer food

### foodSearch does NOT need the state penalty — measured, not assumed

The previous note said the typed search should learn what `sayScore` learned.
It should not, and the measurement is the reason.

| | words | first result is a state row | …with no plain row anywhere |
|---|---|---|---|
| he | 235 | 30 | 5 |
| en | 244 | 27 | 11 |
| de | 246 | 26 | 17 |

Read the third column: those are foods that **only exist in that state**.
Flour is flour. Icing sugar is powdered. Nori is dried sheets. Millet, sea
bass, tapioca and vital wheat gluten have no other row in either file. A
penalty would demote the correct and only answer, in seventeen German cases.

And where it does fire wrongly, the list rescues it: `Linsen` shows the dry
row and the sprouts, two entries, both visible. The photo path has no list -
it picks one row and prices it - which is exactly why the two want different
rules. Same rows, different job.

Also checked and rejected: rows penalised for a state they say they do NOT
have (`קקאו, אבקה, ללא חלב מיובש`). Twelve to fifteen matches across 7,000
rows, and reading them, nearly all are correct - `ללא` attaches to the fat or
the bones while `לא מבושל` is a genuine separate marker. One real case. Not
worth a rule.

### Two rows promoted into core

Both were selection gaps, not data gaps - the measured generic row was in
`foods.json` and core had never taken it. Numbers copied by the build, as
always; nothing typed.

- `דג סלמון אפוי ללא תוספת שומן בבישול` 164, p26.5 — core had only frozen
  (172) and smoked (117), and a plate of salmon is neither.
- `גרעיני דלעת בלי קליפה, לא קלויים, ללא מלח` 559, p30.2 — core had only the
  in-shell row at 414, which understates the food by a quarter.

core is 308 now, and the probe suite runs 308/308 in every language.

### The tie-break that made the promotion pointless

Adding the baked salmon changed nothing at first: the photo still came back
with smoked, because both are core and `Salmon, smoked` is the shorter name.
`sayScore` broke ties with `1000 - f.s.length`.

`foodSearch` had already met this and decided the other way, in its own
words above the `starts` sort: *"NOT by length. A short name is not a plainer
food… The file it came from is the better answer, and it is already in the
right order."* So the file held both views and only one of them got salmon
right. `sayScore` now uses file order among core rows and length outside it.

Measured over the head word of all 308 core foods before adopting - fifteen
rows moved, eight clear wins, three mild losses:

    בשר עוף   450 roasted chicken SKIN   ->  176 breast, cooked without oil
    חלב 3%     69 GOAT milk              ->   60 cow milk 3%
    דג סלמון  117 smoked                 ->  164 baked
    בשר הודו  189 turkey LIVER           ->  108 turkey breast
    ארטישוק    73 JERUSALEM artichoke    ->   47 artichoke

and across the eleven languages **pasta became 123 everywhere** — it had
been 199 in Spanish and Italian, where it answered with miso PASTE, and 348
in French and Portuguese, where it was the dry row.

**The three losses are all bread**, from the order core declares its bread
rows in: `לחם קל` now finds toasted white bread at 360 rather than light
white bread at 190. Underneath is an older looseness — `foodHas` lets the
two-letter קל match inside קלוי — and length was hiding it by accident
rather than fixing it. Recorded rather than papered over.

### Found by driving German: Spiegelei

A photograph in German named `Spiegelei` and nothing matched, where the
English run resolved the same item to "Egg or omelette, cooked without oil".
core names that row `Ei oder Omelett, ohne Öl gegart`; Spiegelei is a
different word for the same thing and is in no `aka`. The app behaved
correctly — it offered Suchen and Schätzen rather than inventing a number —
but the everyday word for a fried egg should find the fried egg.

`aka` exists on core entries and is used by nine of 308. Filling it with the
common dish words per language is its own pass, and open-ended enough to
want a rule for what belongs there before starting.

## The exercise instructions, and the direction they were painted in

### Counted first

96 of the 228 exercises carry instructions: **384 step lines and 241
mistake lines, 625 in all, about 20,000 characters of Hebrew.** Times the
ten other languages, 6,250 lines. That is not one pass and pretending
otherwise would have produced 6,250 bad lines.

### Where they live, and why not in data/lang

In the exercise data, as `sl` — one file per language under `tools/`,
keyed by the Hebrew name like everything else in this repo.

Not in `data/lang/*.json`, for two reasons that both bite. Those files are
the UI dictionary and load at boot: 625 paragraph-length keys would grow it
by a third and put 20 KB of prose in front of every start, including the
starts that never open the fitness area. And `exercises.json` already
carries a name per language in `t` — the instructions are the same kind of
thing and belong beside them, loaded on demand by `exLoad`.

A file per language is additive: adding Japanese touches nothing that
exists, and two people writing two languages never touch the same file.
The build refuses a language whose line count differs from the Hebrew — they
are shown as a numbered list, and one that silently drops step three is
worse than one nobody wrote — and refuses a name no exercise answers to.

### The slice that is done

**English, 15 exercises, 101 lines.** Not chosen by taste: the first
exercise of each of the eighteen muscle groups, which is the primary
movement for that group in the order the data already declares. Three of the
eighteen have no Hebrew instructions yet, leaving fifteen.

English first because it is the pivot — CLAUDE.md: *"every other language is
written from the English, because a Japanese translator does not read
Hebrew"* — and because it makes a far better fallback than Hebrew for the
other nine.

`node tools/build-exercises.mjs` now prints the number that has to go down:

    instructions in en: 15 of 96   (81 still Hebrew only)

### The defect underneath, which was worth more than the translation

Driven in German: the card said *Bankdrücken mit Langhantel*, the headings
said *So geht's* and *Häufige Fehler*, and then four lines of Hebrew arrived
left-aligned with the full stop of every sentence hanging off the wrong end.
It did not read as untranslated. It read as broken.

`li` carries `unicode-bidi: isolate` from the browser's own stylesheet,
which isolates the run and leaves the paragraph direction as the page's.
The pass that added `unicode-bidi: plaintext` to `.sm-body` and its
neighbours describes this exactly — *"hung the line off the wrong edge"* —
and covered text the person had typed. Text that came from the DATA has the
same problem for anyone not reading Hebrew, and had not been covered.

So `.xd-steps li` and `.xd-miss li` take their direction from their own
first strong character, and the 81 exercises that are still Hebrew now at
least read as Hebrew.

### And the card says which language it is

The chain is the reader's own language, then English, then Hebrew. When
what comes back is not what they are reading, a quiet line says so and names
the language in its own script: *"Was hier steht, ist auf עברית."* It costs
one line and turns "why is this gibberish" into "ah, it is in Hebrew".

### What is left

- **81 exercises still English-less**, 524 lines. Same mechanical slice rule
  can continue: second exercise of each muscle group, then third.
- **Ten languages after that**, 625 lines each once English is complete.
- Three of the eighteen primaries have no Hebrew instructions at all:
  לחיצת לנדמיין, משיכה בין הרגליים, קירוב ירך במכונה.

## Bread, another sixteen exercises, and what an alias is for

### The bread regression, closed

`לחם קל` came back as toasted white bread at 360 where the light one is 190,
and the two rows were **one point apart** — both core, both scoring two
matched words, separated only by the file-order tie-break.

Both scored two because `foodHas` is loose at the trailing edge: `קל` is two
Hebrew letters, so it takes the boundary path, which checks only the
character BEFORE a match. In `לחם לבן קלוי` the `קל` of `קלוי` has a space in
front of it and counts as a hit.

That looseness is deliberate — Hebrew glues prefixes on, and `בצל` has to
find `בצלים` — so the fix rewards the exact word rather than forbidding the
loose one. `sayScore` already did that for the FIRST token at 1500 and gave
the rest nothing, and the rest is exactly where the qualifier lives. 600 for
each of them: over the file-order and length tie-breaks, far under one
matched word.

Swept over all 235 Hebrew core head words: **one row changed**, the intended
one. Checked again over a bread-heavy set against the morning's shipped
build: two moved, `לחם קל` 360 → 190 and `לחם מלא` 243 → 179.

**`לחם מלא` is a data gap, not a ranking one.** Every candidate is tier 0 —
core has no plain wholemeal bread row — so the top seven are branded
products between 179 and 262 separated by single points. Which one wins is a
lottery either way. Recorded rather than tuned.

### English instructions: 31 of 96

Second mechanical slice — the second exercise of each muscle group — 16
exercises, 103 lines, bringing the total to 31 of 96 and 204 lines of 625.
`node tools/build-exercises.mjs` prints it:

    instructions in en: 31 of 96   (65 still Hebrew only)

### What an alias is for, and the guard that was missing

**The rule is a test, not a matter of taste: an alias earns its place only
when the search FAILS without it.** If the everyday word already finds the
right food, an alias adds nothing and risks a collision.

Run against the shipped search first. These returned nothing and were added:

    Spiegelei  Rührei  fried egg  scrambled egg  huevo frito  oeuf au plat
    Haferbrei  porridge  copos de avena  Pellkartoffel

These were tried and NOT added, because they already work: `aubergine`,
`courgette`, `Hüttenkäse`, `flocons`.

And four were refused for a better reason. `rocket`, `Rauke`, `Magerquark`
and `Sprudelwasser` all find nothing, and an alias would not help — **core
has no rocket, no quark and no water row at all.** An alias pointing at a
food that does not exist is a different bug wearing the same clothes.
`requesón` and `fromage blanc` were left alone too: neither is cottage
cheese, and guessing at a dairy product is how somebody logs the wrong fat
content every morning for a month.

**The guard.** `tools/build-exercises.mjs` has refused a colliding alias
since the day it was written; `build-food-core.mjs` had the same failure
mode and no check. It has one now, and it earned its keep twice over:

- It fired on its first run, on three real aliases — and **it was wrong**.
  `אגוזים` is nobody's name; it is the generic word for nuts, deliberately
  hung on the walnuts, the cashews and the brazil nuts so the generic word
  offers all three, and `תפוח אדמה` likewise on both potatoes. Sharing an
  alias is a feature. The check now refuses only an alias that is another
  food's NAME.
- Then proved against a revision with the bug: hanging `Banana` on the oats
  fails the build with *"core:oats has the alias \"Banana\", which is the
  NAME of core:banana"*.

### Left open

- **`sayScore` never consults aliases.** `foodSearch` matches against `f.na`
  — every name and alias — while the photo matcher gates on `f.s`, the
  display name alone. Measured on `ביצת עין`: the typed search went from
  nothing to the right egg, and the photo path still returns a **chocolate**
  egg at 549 kcal, exactly as it did before. Pre-existing, and the reason
  adding aliases only half-works.
- German `Eier` still finds nothing — irregular plural, as recorded.
- 65 exercises still have no English instructions, 421 lines.

## The names the photo matcher could not see

`foodSearch` matches against `f.na` and `f.alt` — every one of a food's
eleven names plus its `aka` list — and four of its nine buckets exist for
exactly that. `sayScore` gated on `f.s`, the name being **displayed**, and
nothing else.

### Measured before widening anything

Widening a gate is how a candidate list turns into noise, so the cost came
first. Over the head word of every core food:

| | queries | let more rows through | worst |
|---|---|---|---|
| he | 235 | **0** | — |
| en | 244 | 14 | 2 → 11 |
| de | 246 | 8 | 220 → 274 |

No flood, and the reason is structural: **`f.alt` contains `f.s`** — it is
all eleven names folded together — so for the language being read the gate
was already as wide as it can be. What opens up is only the words that live
in another language's name or in the `aka` list.

And the benefit, on the words a photograph actually produces: **13 resolve
differently, 0 lost an answer.**

    ביצת עין    549 CHOCOLATE egg      ->  162 the egg
    fried egg   265 Tofu, fried        ->  162 the egg
    אגוזים      559 chocolate-coated   ->  654 walnuts
    בקון        nothing                ->  468 bacon
    Spiegelei   nothing                ->  162 the egg
    ごはん        nothing                ->  129 white rice, cooked
    きのこ        nothing                ->   22 mushrooms

The last two are the sharpest: `ごはん` and `きのこ` have been in `aka` since
the core file was written, and the photo matcher had never once used them.

### And the candidate list, which had the same blindness

`sayResolveAI` computes the local answer, then asks `/match` to choose from
`sayCandidates(q,60)` and **replaces** the local food with whatever comes
back. A candidate list that could not see the `aka` list would have handed
the model nothing but chocolate eggs and overwritten the answer that had
just been fixed. Widening one without the other would have been worse than
widening neither.

Name matches stay ahead of alt matches in the list. After: `Spiegelei`,
`ごはん`, `きのこ` and `בקון` each get exactly **one** candidate, the right one.

A row matched under a name the reader cannot see scores 1200 lower — the
same shape `foodSearch` settled on when it put its four alt buckets
underneath its five name buckets.

### Wholemeal bread, and three gaps left alone

`לחם מלא` was a lottery: seven branded rows between 179 and 262 kcal, every
one tier 0, separated by single points, because core had white, dark and
light bread and no wholemeal. Promoted `לחם מחיטה מלאה, ברמן/לחם הארץ`
(228, p10.5) — brands kept in the Hebrew where they identify the row and
dropped from the other ten, the same shape as the milk row. core is 309.

The other three gaps are **not** fixed, each for its own reason:

- **quark** — nothing anywhere in either file. Cannot be done honestly.
- **rocket** — the only row is `סלט עלי רוקט/עלי בייבי, ארוז, שטראוס`, a
  branded bag of mixed baby leaves. Promoting it would put a salad mix
  behind the word for one leaf.
- **water** — rows *do* exist, tap water and unsweetened soda both at 0
  kcal, and it is left out on purpose. The app already tracks water in its
  own place, and a food row would be a second place to log the same glass.

### English instructions: 42 of 96

Third mechanical slice — 11 exercises, 69 lines, 273 of 625.

## Two faces, one word

The daily reflection opens with a five-point mood scale — five faces, five
words underneath — and it is the first thing the app asks anybody. Driven in
German:

    Schwer · Nichts Besonderes · OK · Gut · Sehr gut

"Nichts Besonderes" is neutral, and step two has to sit *below* OK. It is
also the answer German gives to `כלום מיוחד`, which really does mean nothing
in particular, in a different list entirely.

Looking at the other ten turned one bad word into a class:

    es   Difícil · Regular · Bien   · Bien  · Genial     <- 3 and 4 identical
    ar   صعب     · لا بأس · لا بأس · جيد   · ممتاز      <- 2 and 3 identical

**A person is shown two faces with the same word under them and asked to**
**choose.** No amount of reading the Hebrew reveals it — there every step is
distinct (`קשה · לא משהו · בסדר · טוב · מצוין`). It exists only in the
answers, which is why eleven months of Hebrew use never showed it.

### The check that came out of it

`tools/find-duplicate-options.mjs` — the seventh, now in CLAUDE.md's list.
It reads every list in the app whose members are shown as options, in both
shapes the file uses (bare Rule-3 data, and `langOn` + `_t`), maps them
through each dictionary and reports two members that come back the same.

Proved against the dictionaries as they were that morning: **6 findings**,
silent after the fix. 46 lists, 10 languages.

| | was | now |
|---|---|---|
| de `לא משהו` | Nichts Besonderes | Mäßig |
| es `בסדר` | Bien *(= `טוב`)* | Normal |
| ar `לא משהו` | لا بأس *(= `בסדר`)* | متوسط |
| de `מזל` | Glück *(= `אושר`)* | Zufall |
| pt `לילה` | Noite *(= `ערב`)* | Madrugada |
| ja `אירוע` / `פגישה` | 予定 / 予定 | イベント / アポイント |
| ar `אירוע` | موعد *(= `פגישה`)* | حدث |

Both retuned scale keys are used exactly once in the app — checked before
either was touched, because `בסדר` is an ordinary word that could easily
have been an OK button somewhere.

### The collapse that is not a translation fault

Fifteen of the twenty-one findings were `RELATIONSHIP_TYPES`: Hebrew marks
gender on `בן משפחה` / `בת משפחה` and on `בן זוג` / `בת זוג`, and ten
languages cannot tell them apart. Every one of those translations is
**correct**; it is the list that is wrong for them, and the picker drew two
chips saying "Family" and two saying "Partner".

It cannot be fixed in the dictionary without writing something nobody says
("Family (male)"), and it cannot be fixed in the data, because the Hebrew is
what is stored on the person. So it is fixed where it is drawn: `optOnce`
shows one chip per **label** and lights it when *either* value is the stored
one — so a Hebrew user who chose `בת משפחה` still sees their own choice lit
when they read the app in English, and the free-text field keeps the exact
value either way.

It is language-aware for free: German *does* distinguish Partner/Partnerin,
so German loses one chip and keeps thirteen while Hebrew keeps all fourteen.

The check knows about this by **looking for the `optOnce(NAME)` call in the
source** rather than by an allow-list kept in the tool — an allow-list would
rot the moment somebody stopped calling it.

### Not done this tick

English exercise instructions stay at 42 of 96. The tick went to driving an
untouched area instead, and it found a defect class; another predictable
translation slice would not have.

## A subtitle about the wrong noun, and a seam the check could not see

### "Diese Woche — ihn ganz zu sehen"

The planner, opened in German. Two things wrong at once: *ihn/er* is
masculine and *die Woche* is feminine — gender carried straight over from
Hebrew, where השבוע is masculine. And looking at the other nine showed the
gender was the smaller half. **Five of them do not say "week" at all:**

    pt   para ver O DIA inteiro antes de ele começar
    ja   始まる前に一日を丸ごと見るために            "a whole DAY"
    zh   在它开始之前先看到整天 / 一整天             "the whole DAY"
    ar   لترى اليوم كله قبل أن يبدأ                "the whole DAY"
    es   para verLO entero…                        masculine; la semana is not

The card is headed "This week" in all ten, so **the heading and its own**
**subtitle contradicted each other on six screens.** The Hebrew says אותו,
"it", and a translator with no screen in front of them guessed the day —
which is the thing a planner usually talks about. English, French and
Italian were right and were left alone.

Checked the siblings at the same time: the month card says "month" in all
ten, and the day card shows a formatted date rather than a sentence. One
key, not a pattern.

### One sentence, two keys, and the blind spot in the check for that

The people screen, same session:

    _t('התחל להוסיף את האנשים שאתה רוצה לזכור') + '<br>' + _t('ולהיות נוכח בחיים שלהם.')

    Fang an, die Menschen hinzuzufügen, an die du dich erinnern willst
    und in ihrem Leben präsent zu sein.

*willst* wants a finite clause after *und*; *zu sein* is an infinitive. Each
half is a fair rendering of its own key and the pair is not German. Hebrew
survives because the second half opens with ו and reads as a continuation.

That is **Rule 2 exactly** — a sentence is one key — and
`find-glued-sentences.mjs` did not see it. Two reasons, both worth writing
down:

1. It skipped any pair with markup between the fragments, on the grounds
   that markup means two blocks. True of `</div><div>`; **false of `<br>`**,
   which is precisely how one sentence gets laid across two lines.
2. Even with that narrowed, the pair rule wants fragment + **value** +
   fragment, because that is what `agoText` did. It explicitly discards a
   pair with only punctuation between them, since that is what an array of
   labels looks like. This pair has no value at all.

So it got a third shape of its own — and then a discriminator, because the
first cut reported three and two were fine: *"No saved workouts yet." /
"Finish one and save it."* are two finished sentences sharing a block. What
marks a real continuation is the punctuation, the same tell the lone-fragment
rule already uses: a second half opening with the Hebrew ו, or a first half
stopping on a comma or a dash.

Proved against this tick's starting revision: **1 finding, the real one,**
and silent now.

The `<br>` went with the fix. Where a sentence wraps is a decision for the
language and the screen width — German needs two lines here, Chinese needs
one — and hard-coding the break served neither.

### A false clean, worth recording

The first sweep of these screens reported no defects anywhere. It was
scanning the **home page six times**: `goRoute` takes no argument, it reads
`?go=` from the URL, and `goRoute('insights')` silently does nothing. The
screens only opened once the sweep called `enterModule` instead. A clean
result is worth nothing until the thing being measured is on screen.

## Chips that disagree about capitals

Same screen, same shape as last tick. The reflection asks how the day
affected you and offers three chips:

    Zum Besseren · zum Schlechteren · Beides

Two capitalised and one not, in **six languages**. Each answer is defensible
read alone; the row is not. Hebrew has no capitals, so it could only ever
appear on a screen in a language that does.

Two more of the same, found by turning it into a rule:

- the reminder offsets — *At the time · 5 min before · 10 min before ·
  **an** hour before* — where the numeric ones start with a digit and dodge
  the question, in six languages;
- the afternoon: Hebrew writes `אחה״צ` because the full form is long, and
  English and German inherited an abbreviation into a row of whole words —
  *Morning · Lunch · **PM** · Evening · Night*. French *Après-midi* is
  longer than *Afternoon*, so width was never the constraint.

14 answers corrected. `find-duplicate-options.mjs` reads capitals now as
well as duplicates — same lists, second rule — proved against the
dictionaries as they were: **13 findings, silent after.**

### Getting the rule to be worth reading

The first cut reported **32**, and most were noise. Three things had to be
fixed before the number meant anything:

1. **It was reading keys the screen never shows.** `LABEL_CTX` sends one
   stored word to a different dictionary key — `כבד` is *heavy* in a body
   and a *liver* on a plate, so `labelOf` asks for `כבד|גוף`. The check read
   the bare key and reported six languages lower-casing a word that is
   capitalised on screen. This had been wrong for the duplicate rule too,
   since the day it was written.
2. **Not every array is a row of chips.** `GW_STEPS` mixes step labels with
   *"e.g. …"* hints and `RF_STAGE2` holds questions and the fragments that
   continue them; a lower-case member there is prose, not a style slip. Only
   lists whose members are all short count.
3. **Unit symbols are not words.** `g`, `ml` say nothing about
   capitalisation.

After all three: **13 findings in 3 lists, every one real.** A check that
cries wolf is worse than no check, and 32 would have been ignored inside a
week.

### Tried and abandoned: detecting the wrong-noun class

Last tick found a subtitle under "This week" that said *the day* in five
languages. The obvious follow-up — compare the noun in the key against the
noun in the answer, using the app's own words for day/week/month/year —
finds nothing, and checking **why** is the useful part: the Hebrew says
`אותו`, "it". **The key names no noun at all.**

Widening it to "keys whose Hebrew contains a pronoun" gives 70 of 1733, and
nearly all have their antecedent inside the same sentence. Telling those
apart needs the surrounding code, not the dictionary. Recorded as a review
hazard rather than a tool: **a key that points at something outside itself
cannot be answered by a translator who cannot see the screen.**

### No release needed

`dev/index.html` is untouched this tick — the work was dictionaries and
tooling. Both copies share `data/`, so pushing is the release.

## A calendar header that reads S M D M D F S

Found on the Me screen, in German. The seven weekday keys are single Hebrew
letters — `א ב ג ד ה ו ש` — because that is exactly what a Hebrew calendar
prints, and every language answered with a single letter of its own. For two
of them a single letter does not identify a day:

| | header | distinct |
|---|---|---|
| de | S M **D** M **D** F S | **4 of 7** — Mo/Mi both M, Di/Do both D |
| pt | D **S** T **Q** **Q** **S** **S** | **4 of 7** — three S, two Q |
| en | S M T W T F S | 5 of 7 |
| fr / it | D L M M J V S | 6 of 7 |
| es | D L M X J V S | 7 of 7 |
| ja / zh / ar | 日月火水木金土 … | 7 of 7 |

**Why the others are fine matters more than the counts.** English really
does print S M T W T F S, and French and Italian really do print L M M J V S
D — ambiguous and conventional. Spanish uses X for *miércoles* precisely to
avoid the clash. German and Portuguese are the only two where the app
invented an abbreviation nobody uses: German calendars print Mo Di Mi Do Fr
Sa So, Portuguese Dom Seg Ter Qua Qui Sex Sáb. Fixed to those.

### Width was measured, because this file has got that wrong before

Six places paint these letters. The narrowest cell in any of them is not the
calendar at all — it is the streak overlay, which packs **fourteen** days
into one row:

    .stk-d    28.6px    flex 1 1 0%, overflow visible
    .cal-dh   47.1px
    .mo-hd    62px

and in that font "Mi" paints at 9.3px and "Dom" at 18.3px. Both fit the
narrowest cell with room to spare. Confirmed afterwards by walking every
`.cal-dh`, `.mo-hd` and `.stk-d` on screen in Portuguese — the widest
language — and comparing `scrollWidth` against the box: **no overflow**.

Two things that could have gone wrong and did not: the letters are
`auto`-width inside their cells, so measuring the letter rather than the
cell would have reported 4.6px and proved nothing; and the narrowest context
is a fourteen-cell strip that only exists inside an overlay, which a sweep
of the visible page would never have opened.

### Not a check

Distinctness is **not** a rule here — English, French and Italian are
correct at 5 and 6 of 7 — so there is nothing to enforce. It is a
convention question per language, and the finding is the reasoning above
rather than a number to keep at zero.

### Still never opened

The closet, the bullet journal, the habit tracker past its empty state and
the steps screen. The Me screen was opened for the first time this tick and
gave this up immediately; those four are still owed a look.

## Four screens opened, and nothing wrong with them

The closet, the habit tracker, the steps screen and the backup card, all
driven in German for the first time. **No defect found**, and the four
things that looked like one are worth writing down, because three of them
would have been a wrong fix.

### `[object Object]` in the habit tracker — mine, not the app's

The header row read `Tag · [object Object] · [object Object] · +`. It was my
own seed: `loadHabits()` returns an array of **strings** — its default is
`['שתיית מים','אימון','קריאה']` — and I had seeded objects with
`{id,name,emoji}` two ticks ago while guessing at storage shapes. Cleared
the seed and the row reads *Wasser · Training · Lesen*.

The lesson is the one already in this file about the syrup row: **a test
fixture is not evidence.** Seeding storage with a guessed shape produces
bugs that belong to the guess.

### The dress row with no "+ Kleid"

Six rows had an add control and the dress row appeared not to. It is a
`BUTTON.cl-dress` — a **mode toggle**, not a row — and clicking it reveals
the dress row complete with its add control, exactly as the comment above
`CLOSET_CATS` says: *"It starts on ללא and stays out of the way until
something is put in it."* Reading flat `innerText` made a button look like a
row heading.

### "Das Gerät DARF deine Daten löschen"

German *darf* is permission, not possibility, and the warning looked like a
modal-verb slip. The Hebrew is **רשאי** — "is permitted to" — so German is
the one language that renders it faithfully, and Spanish, French, Italian,
Portuguese, Japanese, Chinese and Arabic all chose *can/might* instead. The
string that looked wrong was the only exact one.

### English labels that no check can see

The habit tracker prints `HABIT TRACKER`, `THIS MONTH I WILL`, `NOTES` and
*progress, not perfection* in English on every screen, and the Me screen
prints `VISION BOARD`. None reaches `_t()`.

`find-unwrapped-hebrew` cannot see them — it looks for **Hebrew** that never
reaches `_t()`, and the mirror image has no check. Probed the whole app for
runs of English in emitted text: **seven**, and they split cleanly.

    Better Me · Apple Health · Become the best version of yourself   brand and proper nouns
    HABIT TRACKER · VISION BOARD · THIS MONTH I WILL · progress, not perfection

The second group is a consistent bullet-journal and vision-board motif — the
same deliberate choice as the English splash lines. **Left alone.** It is a
design decision about whether a Japanese or Arabic reader should meet Latin
script in the middle of their screen, and that is the author's call, not an
oversight to correct. Worth knowing it is exactly seven and which four.

### English instructions: 52 of 96

Fourth mechanical slice — 10 exercises, 65 lines, 338 of 625.

## "Search in Hebrew or English"

The exercise picker's search box, in every one of the eleven:

    de   Suche auf Hebräisch oder Englisch
    ja   ヘブライ語または英語で検索
    ar   ابحث بالعبرية أو الإنجليزية

It was true when `exercises.json` held two names per movement. It now holds
**eleven**, plus an `aka` list, and the search matches all of them. So the
sentence is not merely unhelpful — it is wrong, and it **hides a feature**
instead of explaining one. A German reader is told to type a language they
may not have.

Driven in the German app, typing into the real box, before a word was
changed:

    Bankdrücken        ->  Bankdrücken mit Langhantel
    bench press        ->  Bankdrücken mit Langhantel
    développé couché   ->  Bankdrücken mit Langhantel
    סקוואט              ->  Kniebeuge mit Langhantel
    sentadilla         ->  Kniebeuge mit Langhantel
    スクワット            ->  Kniebeuge mit Langhantel

Five languages other than the one being read, every one landing on the right
movement under its German name. "Search in any language" is a statement of
fact. The old key was replaced rather than reworded: it names two languages
in its own Hebrew text.

**Width measured, in the real input, in the longest language.** The input has
413px of room and French — `Cherche dans n'importe quelle langue` — paints
at 220px. The column is capped, so 413px holds from 957px of viewport down
to about 450px; below that it tracks the screen, and French still clears a
phone with room to spare.

### Two things that looked wrong and were not

**A panel half German and half French.** The areas drawer showed a German
title over a French list after switching language inside a module, and
`langRepaint()` does return early for every module — `renderAreasList()` only
runs on the home branch. But the drawer is `translateX(-350px)` with
`offsetParent: null`: **not visible**, and `openAreas()` re-renders it before
showing it. Confirmed by switching language inside fitness and then opening
it: German.

The useful part is why I saw it at all. **`innerText` includes off-screen
elements that are not `display:none`**, so every screen dump this audit has
taken has carried that closed drawer along with it. That is where the
"Was du erfasst" block at the bottom of each dump has been coming from.

### English instructions: 62 of 96

Fifth mechanical slice — 10 exercises, 66 lines, 404 of 625. Thirty-four
exercises left.

## סקוואט, in the middle of a German workout

Driven for the first time: a live session, a set logged, the workout
finished, then the history, weights and numbers views with that data in
them. Four screens showed the **stored Hebrew id** instead of a name the
reader could read.

    1 / 1
    סקוואט                      <- the session chip
    Kniebeuge mit Langhantel    <- the card, ten lines below it

    Verlauf              סקוואט 80kg
    Gewichte verfolgen   סקוואט
    Meine Zahlen         סקוואט
    Zusammenfassung      Vor allem: סקוואט, 640 kg Volumen.

### One root cause under most of it

The first instinct — patch each call site — was wrong. Measured in German
straight after a reload:

    _exState at boot                 idle
    _exState after entering fitness  idle
    _exState on the history screen   idle
    exAll()                          0
    exLabel('סקוואט')                 סקוואט

**`exLoad` is lazy and only the picker ever called it.** The history row
already went through `exLabel`; it had nothing to look the name up in. Four
screens, one cause.

And it fails **silently by design**. `exLabel` promises that *"anything the
library does not know is a name the person typed themselves, and is shown
exactly as they typed it"* — so a library that was never fetched is
indistinguishable from a custom exercise. In Hebrew the fallback IS the
right answer, which is why it survived.

So `renderFitness` asks for the library once, and `exLoad` repaints the
screen when it lands — the same shape as `langOn` redrawing when a
dictionary arrives. The `idle` guard and `exLoad`'s own `ready`
short-circuit mean it asks exactly once and cannot loop.

### And four call sites that were genuinely raw

| | was | now |
|---|---|---|
| session chip | `esc(w.exercises[ei].name)` | `exLabel(…)` |
| summary sentence | `{name:esc(bestEx.name)}` | `exLabel(…)` |
| weights list row | `esc(nm)` | `exLabel(nm)` |
| best-record row | `esc(r.name)` | `exLabel(r.name)` |

The two `esc(nm)` calls in the same block that sit **inside `onclick`** were
left alone: those are the stored id and identify the exercise. Checked by
grep rather than by eye — `esc(wd.name)` and `esc(entry.name)` are a workout
day and a workout, both user-authored, and correct as they are.

### A hardcoded English heading, in the hole with no check

The summary printed `Exercises` among German headings. `תרגילים` has existed
as a key all along, answered in all eleven — it was simply never asked for
there. Nothing could have caught it: `find-unwrapped-hebrew` looks for
**Hebrew** that never reaches `_t()`, and a hardcoded English word is
invisible to it.

**After: every fitness view reports zero Hebrew nodes** — home, history,
weights, numbers and the training plan — on a fresh reload in German.

Also driven and correct: the set logger (80 kg × 8 recorded, PR set), the
plate calculator (20 kg bar + 2×(25+5) = 80, shown as "Pro Seite: 25 + 5 kg"), and the rest-timer chips.

## The lazy-load question, asked of everything else

Last tick, one lazy fetch explained four broken screens. The obvious
follow-up: does any other data file have the same exposure?

**It does not, and the reason is structural.** A fresh reload straight into
each of eight modules, in German, measuring the loader state rather than
guessing:

    nutrition planning endofday journal insights goals people hobbies
    _exState idle · _foodsState idle · exAll 0 · _foods 0    hebrew = 0

Nothing needs either file, because **a logged meal stores its NAME, not an**
**id**. Read from the app's own writer rather than guessed:

    day.meals.push({name: f.n + ' (' + howMuch + ')', kcal, p, c, f, …})

Driven end to end to confirm: searched *Banane* in German, added it, and
read back what landed in storage — `"Banane (100g)"`. The name is captured
in the reader's language at log time, which is exactly what
`build-food-core.mjs` says the core file exists for: *"a Japanese user finds
the right rice and then logs אורז לבן into their diary, where it stays."*

So exercises were the only file looked up by id, and that is fixed.

## "Banane, Banane"

Found while doing the above — the first result for *Banane* in German.

Open Food Facts carries a product name and a brand, and this app glues them
together — *"Skyr, Arla"* — which is right whenever they differ. Very often
they do not: the brand **is** the product name.

Measured against the deployed live endpoint, eight everyday words in four
languages: **seven of seventy-four rows, nearly one in ten.**

    Banane, Banane      Yogurt, Yogurt      Riso, Riso      PAN, PAN
    Leite moça, Leite moça
    Altländer Apfel-Curry Soße, Altländer Apfel-Curry Soße

The **bundled** file has one such row in 3,308, which is why nobody had seen
it: it lives almost entirely in the live search. The row that gave it away
was marked `live:1`, and checking that flag is what pointed at the worker
rather than at the data.

Three sites build that string — the live shelf in the worker and the two
barcode lookups in the app — so all three now drop a brand that repeats the
name, or that the name already ends with (*"Griechischer Joghurt Arla" +
"Arla"*). Nine helper cases checked in node before shipping.

**After, same eight queries against the deployed worker: 0 of 74.**

## "0 g Fett", on a yogurt nobody measured the fat of

The Worker refuses a live shelf row that is missing any of the four numbers,
and says why: *"a missing number defaulted to 0 would show 0 g carbohydrate
on a yogurt — a figure nobody measured, presented beside ones somebody did."*

Both barcode lookups in the app did exactly that. They guarded on the calorie
count alone and then wrote `(nu.proteins_100g || 0)` for each macro.

Measured against 113 real Open Food Facts products that carry a calorie
count, **two are missing a macro**:

    0015000047306  Strawberry           429 kcal, no carbohydrate
    4903019006406  十勝のむヨーグルト    31 kcal, no fat

Small, and not a rounding error — somebody scans that packet and their fat
for the day is wrong by whatever was in it, with nothing on screen to say so.

So `offMacros` reads all four or returns nothing, and both call sites use it.
The honest answer already existed on the screen: `scanNotFound(code, true)`
points at the label photo and manual entry, which read the printed panel —
where the missing number actually is. Its sentence widened from "has no
nutritional values" to "its table is incomplete", which is truer of the old
case too, and was re-answered in eleven languages.

### Measured and NOT changed: the name Open Food Facts gives back

The app asks OFF for `product_name_he` and prefers it, for every reader, and
never asks for the reader’s own language. That reads like a leftover from
when this was a Hebrew app, so it was measured rather than assumed:

| | |
|---|---|
| Israeli shelf, 43 products, German reader | 42 shown a Hebrew name, **1** has a Latin alternative at all |
| 127 products worldwide | `product_name_he` overrode a reader’s own name **0** times |
| German shelf, 60 products | 38 carry `product_name_de`, **7** differ from what is shown |

And those seven are a wash, not an improvement:

    "Joghurt dressing light"  ->  "Rewe"       the brand, entered as the name
    "Brot"  ->  "Brot /// 1x Burger Buns im Eis /// 0,5 x BB frisch"
    "Wurst"  ->  "Knüppelsalami"               genuinely better

`lc=` does not relabel `product_name` either, tested on three products in
four languages. So the change would trade one arbitrary name for another.
**Left alone**, and written down so it is not re-proposed.

## "1 Tag an denen du geschrieben hast"

The journal, driven for the first time with real entries typed into the box,
in German. Three of its sentences were built out of fragments:

    days.length +" "+ (days.length===1?_t("יום"):_t("ימים")) +" "+ _t("שכתבת בהם")
    _t("לא מצאתי") +" \""+ esc(q) +"\" "+ _t("בשום יום.")

The first freezes the relative clause in the plural, so German says *an denen*
over the number 1. The second fixes the word order in Hebrew’s, and no other
language can move the quoted word — German wants it first:

    was   Nicht gefunden "zucchini" an keinem Tag.
    now   An keinem Tag steht „zucchini“.
    was   1 Tag an denen du geschrieben hast
    now   1 Tag, an dem du geschrieben hast

Each language now picks its own quotation marks too — „…“, « … », 「…」 —
which gluing had also made impossible.

## "🔥 3 3 Tage am Stück"

Found by asking where else a plural is chosen by hand. The streak badge on
the home screen had already been converted to a plural key — and the badge
draws the number itself, in its own bold span:

    <span class="stk-n">3</span><span class="stk-w">3 Tage am Stück</span>

Every language, Hebrew included. A plural key needs **no `{n}` hole to
inflect** — `_t` reads the category from `vars.n` either way — so the word
beside a number the layout draws should be numberless and still plural. Two
such keys now exist, for the badge’s two states.

### And six counted sentences that chose their own plural

| screen | was |
|---|---|
| toast, items added | `n===1?"פריט נוסף":"פריטים נוספו"` |
| my numbers, sessions | `now.sessions===1?"אימון":"אימונים"` |
| closet, times worn | `n===1?"פעם":"פעמים"` |
| week summary, workouts | `workouts===1?"אימון":"אימונים"` |
| streak badge + overlay | `st.total===1?"יום שרשמת בו":"ימים שרשמת בהם"` |
| week planner, span length | `_L>1?_L+" ימים":"יום"` |

A ternary has two branches. CLDR gives Hebrew three categories and Arabic
six, so **"2 ימים" can never become "יומיים"** and *2 أيام* can never become
*يومان*. Six new plural keys, answered in eleven languages — and the people
list stopped saying "1 Tage".

One correction while passing: **שרשמת is "recorded", not "wrote".** The
streak counts a day on which anything was logged — a meal, a workout, water,
steps — and every language had it as the journal’s own word. With both keys
now in the same build, one key one meaning had to hold in both directions.

### The check that could not see any of it

`find-glued-sentences` wants a VALUE between the two `_t()` calls, because an
array of labels has only punctuation there. A hand-rolled plural puts the
value **before** both fragments and a ternary between them, so the gap holds
nothing but a colon and every filter throws it away.

A fourth rule, narrowed by what it reported on its first run — the test must
compare against **1** (`_cmCelebrate===2` is a mode flag, not a count) and the
two branches must **begin alike** (`דלג`/`ביטול` is skip versus cancel, not a
singular and a plural). With both, the two false pairs go quiet:

    against HEAD   9 found
    after          0

**And it can finally fail.** This check printed its findings and exited 0, so
nothing it found could ever break a build. The reason was its one permanent
finding: a worked example, `"למשל:\\n200ג עוף..."`, where `200ג` is exactly
what a person would type. A key carrying its own line breaks is an example,
not a sentence cut in half — so it is no longer reported, and the check exits
1 like the other six.

### Open: the other family, 48 sites

Driving *Meine Zahlen* found **"1 Sätze"** — `now.sets + " " + _t("סטים")`.
No ternary, so neither the old rules nor the new one sees it. A scan for "a
count concatenated straight onto a bare Hebrew noun" returns **48**, of which
the inflecting ones are סטים, חזרות, תרגילים, אימונים, שנים, שניות, דקות,
משימות, שאלות, רשומות, משפטים, מנות, פריטים. The rest are unit abbreviations
(גרם, קג, דק) that the units check already governs.

Its own pass: the fix is the same numberless-plural-key shape, the scan needs
its own narrowing, and folding it into this one would have made a change too
big to verify.

## "1 Sätze", and twenty-nine more

The other half of last pass. A hand-rolled plural at least *tries* to
inflect; this shape does not try at all — a count concatenated straight onto
a noun that is its own key, so every language gets the plural form whatever
the number is.

    now.sets + " " + _t("סטים")        ->  "1 Sätze"
    rec.servings + " " + _t("מנות")    ->  "1 Portionen"
    Math.round(_vlSec) + " " + _t("שניות")  ->  "1 Sekunden" on a one-second vlog

**Thirty of them**, measured by the new rule against the revision that had
them. Seventeen nouns: שנים, שניות, דקות, סטים, חזרות, תרגילים, אימונים,
מנות, משימות, שאלות, רשומות, משפטים, פריטים and the rest.

Most of those nouns **keep their bare key**, because most are also labels —
a table header, a form field — and a label is not counted. So the counted
sites take a second key, `{n} noun`. Where the layout draws the number
itself, in its own bold card or beside a range, the key stays **numberless**
and still inflects: `_t` selects on `vars.n` whether or not the key prints
it. That is what "Sätze pro Muskel" and "44 Teile" now do.

Left alone deliberately: the unit abbreviations — קק"ל, גרם, קג, דק, ש׳ —
which inflect in none of the eleven and are the units check’s ground, not
this one’s. The compact plan rows keep THEIR abbreviation (חזר → "Whd.",
"rip") but got a plural key of their own, because English still says
"1 rep".

## And seven that were a value glued to a preposition

The new rule kept reporting four sites that are not counted nouns at all,
and it was right to. They are a value and a **preposition**, and the order
is fixed by the language they were written in:

    on.length +" "+ _t("מתוך") +" "+ SUM_SECS.length      "3 von 8"
    _t("עמוד") +" "+ q.page                                "Seite 45"
    s.from +" "+ _t("עד") +" "+ s.to                       a date range
    meal.name +" "+ _t("נוספה")                            "Banane hinzugefügt"

**The old answers say what the gluing had cost.** Japanese had answered
מתוך with `"/"` — a translator working around a word order they were not
allowed to change — and עמוד with `"ページ"`, which the code then printed
*before* the number, where Japanese puts it after. Now:

    עמוד {n}                 ->  45 ページ
    עמוד {n} מתוך {total}    ->  280 ページ中 45 ページ
    {n} מתוך {total}         ->  8 件中 3 件

The book page keeps its styled violet span by passing the span in as the
hole’s value — the layout is untouched and the sentence is still one key.
Arabic finally gets to say *من … إلى …* with a word for "from", which the
old two-fragment shape gave it nowhere to put.

### The fifth rule, and what it had to stop saying

Three narrowings, each from a false positive it reported on its own first
runs:

1. **The noun comes after the number.** All eleven put the count first,
   Japanese and Chinese included — so `_t("שיא")+" "+st.best` is a label and
   a value ("best: 3"), not a counted noun.
2. **Exactly one space between them, or none.** Anything else means they
   are not adjacent: `'+at+')">'+_t("ערוך")` is an onclick argument ending
   just before a button label.
3. **One word.** "steps per day" and "cannot be loaded" are invariant
   however many precede them.

Plus a **closed list of units**, spelled out in the tool rather than hidden
in a helper, with a note that it is a list and lists rot: put a real counted
noun in it and the rule goes quiet about that noun.

    against HEAD   30 found
    after           0

### Driven, not asserted

A book added through the box — *Der Steppenwolf*, 280 pages — two quotes
typed in and the book finished:

    Seite 0 von 280     Seite 147     Seite 12     2026-09-11 · 2 Sätze

and *Meine Zahlen* now says **1 Satz**, the habit month **0 / 33 Tage
geschafft**, the backup **44 Teile**. Ten modules on a fresh reload in
German: zero Hebrew nodes, clean console.

`rec.servings` is whatever was typed into a box, so every shape it can take
was put through `_t`: `1`, `"1"`, `"4"`, `"4-6"`, `""`, `null`. None throws,
and "4-6 Portionen" comes out right — `Intl.PluralRules` answers `other` for
anything it cannot read as a number.

### Still open

The two compact plan rows and the exercise target row were verified through
`_t` rather than on screen — building a two-week plan with exercises in it
is a long path through the wizard, and this pass had already changed enough
to want shipping. Next time the plan is driven, look at
**"3 Sätze × 10 Whd."** and confirm it fits the row.

## 11/9/2026, read on an American screen as the ninth of November

The insights module, driven for the first time with a real entry typed into
the box. The entry saved and rendered correctly — and carried a date the app
had written by hand:

    getDate() + "/" + (getMonth()+1) + "/" + getFullYear()

That is Israel’s order and nobody else’s. With the app in English:

    on screen      11/9/2026
    what en-US wants  9/11/2026

The same eight characters, two months apart. **Twelve other places** wrote a
date the same way — the workout history, the day plan, a memory, the journal
rows, two chart axes.

This is Rule 4’s shape — a format welded into the code instead of coming
from the reader — and **the file had already solved it for times**. `fmtClock`
says in its own comment *"so 17:32 in Hebrew and 5:32 PM in American English"*
and goes through `dfmt`, the cached `Intl.DateTimeFormat` keyed on the
language the app is in. Dates never got the same treatment.

So `fmtDay` and `fmtDayShort`, the second without the year for a chart axis
or a chip where the year is already on screen. Thirteen sites, and every
locale asked what it wants:

    en-US  9/11/2026     ja-JP  2026/9/11     fr-FR  11/09/2026
    de-DE  11.9.2026     ar-EG  ١١‏/٩‏/٢٠٢٦

On screen after: the insight says **9/11/2026** in English, the journal rows
**11.9.26** in German, the workout history **11.9.2026**.

## "٦٤٠ حجم العمل كجم" beside "5 مجموعات"

Found on the Arabic numbers screen. Every number the app formats goes through
`nfmt` — one place, `Intl.NumberFormat` on the app’s language — and in Arabic
that writes ٥ and ٦٤٠. **Every number that went into a `{hole}` did not:**

    nfmt(5)                  ->  ٥
    _t("{n} סטים",{n:5})     ->  5 مجموعات

Two numbering systems on one screen. German had the same split the other way:
`nfmt(20.2)` is *20,2* and a macro dropped into a hole was *20.2*.

One line in `_t` fixes all 148 call sites: **a hole whose value is an actual
number goes through `nfmt`; anything else is untouched.** Checked against
every one of those call sites first — each value is a raw number, an
already-formatted string (`fmtWeight`, `nfmt`), or text (a name, an escaped
query, the book page’s styled span) — and **no key takes a year**, which is
the one number that must not be grouped. The plural category is still chosen
from the raw `vars.n` before any of this.

### And the main screen, which mixed the two

The water line has always gone through `fmtVolume` → `nfmt`, so German got
*3.000 ml*. The macro bars right above it concatenated the number straight
into the markup, so they kept *20.2g*. Older than this pass, and the app’s
busiest screen.

`fmtGrams` for the four display blocks — the bars, the pills under them, the
same bars on the day summary, the profile’s recommended targets — plus the
percentages and the one water button that was still a hardcoded **+1L**
while +250 ml and +500 ml converted for an imperial reader.

    German  1,1g · 20,2g · 0,3g · 1.886 kcal übrig · 3.000 ml
    Arabic  ٥% · ٨٩ · ١٫١g · ١٬٨٨٦ · ٠ / ٣٬٠٠٠ مل · +١٬٠٠٠ مل
    Hebrew  unchanged — 1.1g, 1,886, 3,000 מ"ל

**Not touched: `howMuch` in the food picker.** That string is written into the
meal’s stored NAME — *"Banane (100g)"* — and formatting it per locale would
freeze whichever locale was active into the diary. Storage keeps one form;
only the screen follows the reader.

### A measurement trap, paid for

The macro bars read back as zero height, which looked like a regression. It
is not: **the driven tab is hidden, and Chrome does not run
`requestAnimationFrame` in a hidden tab**, so `animateBars` never fires. The
`data-h` attributes were correct throughout. Anything that animates in reads
as zero when driven this way — check `document.visibilityState` before
believing it.

### Still open: raw numbers outside _t

The meal log row and the food library rows still print `m.p+"p "+m.c+"c"` —
raw numbers AND hardcoded English letters for protein, carbohydrate and fat,
which `find-unwrapped-hebrew` cannot see because they are not Hebrew. Its own
pass: the letters need keys, and the numbers need `nfmt`, and the row is
narrow enough that both together may not fit.

## "1.1p 20.2c 0.3f", in every language

Three rows printed the macro line by hand — the meal log, the food library,
the confirm card — with **p, c and f welded in as English letters**. Nothing
could catch it: `find-unwrapped-hebrew` looks for Hebrew that never reaches
`_t()`, and a hardcoded English letter has no key to be missing.

**Nothing new had to be written.** `{p}ח {c}פ {f}ש` has existed all along,
answered in all eleven, and five other places already use it:

    de  "{p} E {c} K {f} F"        ja  "P{p} C{c} F{f}"
    ar  "بروتين {p} كربوهيدرات {c} دهون {f}"

These three simply never asked. And because `_t` now formats a numeric hole
through `nfmt`, the numbers came right in the same move.

### Measured before choosing

The Arabic and Chinese answers are far longer than "p c f", and the row is
narrow — so it was measured in the real element and font, at the width the
shell caps to, with a long food name in it:

    macro cell   raw 54px   de 59   zh 82   ar 95
    row height       58px      58      58      58
    overflow         none    none    none    none

The cell reflows and the row’s height is set by the photo, so the longest
answer costs nothing. Driven afterwards at a 360px shell:

    de  Vollkornbrot mit Frischkäse | 10:11 | 12,4 E 31,7 K 9,8 F | 268
    ar  Banane (100g) | ٧:٠٦ ص | بروتين ١٫١ كربوهيدرات ٢٠٫٢ دهون ٠٫٣ | ٨٩

No overflow in either. The meal was added through the manual box with **save
to library** on, so the library row and the confirm card were driven too.

## The eighth check: English written into the markup

This bug class has now shipped twice and nothing could see it either time —
the `Exercises` heading in tick 12, and the macro letters today. Both were
found by driving a screen in German and reading it.

`find-hardcoded-english.mjs`, two rules because those two bugs have two
shapes:

| | shape | what it caught |
|---|---|---|
| 1 | text between two tags | `>Exercises</div>` |
| 2 | prose concatenated between two values | `+m.p+'p '+m.c+'c '` |

The second never sits between tags, so the first rule cannot see it.

**Proved against the revisions that have the bugs**, which is the rule here:

    rule 1, against 71ee1e8~1    "Exercises", line 12999
    rule 2, against bf7e84f      'p ' and 'c ', lines 6838 and 6864
    both, against this revision  silent

Two narrowings, each from a false positive it reported on its own first run.
Rule 1 dropped quote characters from what counts as text, which was matching
`prevMax?'` — a comparison, not markup. Rule 2 requires a space or three
letters, because `'w'+w+'d'+dw` is how this file builds a storage key, and a
key is not text.

It carries a short list of **English that is meant to stay English** — the
app’s own name, a platform it talks to, and the six paper-spread headings
(HABIT TRACKER, THIS MONTH I WILL, NOTES, VISION BOARD, "progress, not
perfection", "Become the best version of yourself") that are a design choice
rather than an oversight. They are listed **in the tool**, with a note that a
list is the thing that rots, so the decision stays visible rather than being
quietly skipped.

That closes the open item from tick 12 — *"a hardcoded English word is
invisible to find-unwrapped-hebrew"* — with a tool rather than with prose.

## A box labelled kg, for a reader who chose pounds

The plan wizard, built end to end for the first time. **"3 Sätze × 10 Whd."**
fits at 360px with no overflow, which is what this was meant to confirm —
and four other things turned up on the way.

### The unit the box asks for, and the unit it stores

Two inputs in the whole file carried a hardcoded unit, and they were the only
two bare `>kg<` in the markup: the wizard’s starting weight, and the weight
column on the screen where a plan is actually run.

The display half is Rule 4. **The storage half is worse.** `logProgEntry` did

    var weight = parseFloat(wInp.value) || 0;

and everything downstream treats that as kilograms, because `fmtWeight`
converts *from* kg. So an imperial reader typing 135 had **135 kilograms**
recorded and was shown **297.6 lb** back. The line directly above that box
already printed `fmtWeight(lastEntry.weight)`, so the same card showed both
units at once.

The app’s own idiom is written down elsewhere, in a comment that says it:
*"The box shows the display unit, so convert back before storing."* These two
boxes never did it. Driven afterwards, in German with `app_units=imperial`:

    typed 135 into a box labelled lb  ->  stored 61.23496995 kg  ->  "135 lb"

### And six more that printed a stored kilogram raw

Logging one set made the rest of the family visible at once — the PR badge,
the weights-tracking chip, a PR row, and the three numbers on the progress
card. All six now go through `fmtWeight`, which is also why the badge had
read **142.88159655kg**: 315 lb is that many kilograms exactly, and nothing
was rounding it. After: **315 lb**.

## "NaN 🎉 Jetzt trainieren B."

On screen, between workouts, in every language.

    _t('מעולה! סיימנו אימון') +' '+ dayLetter.charCodeAt(0)-65 +' 🎉 '+ …

The left side is already a **string**, so the `-65` is arithmetic on text.
The author meant an index and left out `String.fromCharCode`; the workout
just finished is simply the letter before this one. It was also a glued
sentence — two fragments with a letter welded into each and a full stop on
the end — so it is one key now: **"🎉 Stark — Training A geschafft. Jetzt
Training B."**

### Why the check could not see it: an HTML entity

The pair rule’s gap is `[^;\n]`, because a semicolon ends the statement and a
match must not run past one. **But an entity ends in a semicolon too**, and
this app separates with `&middot;` and `&times;` everywhere — so any sentence
glued across one was invisible. The 🎉 was `&#127881;`.

The rule now reads a copy with the entity’s semicolon masked to a character
nothing else uses, so every offset stays identical and a real
statement-ending semicolon still stops a match. That surfaced four pairs, of
which three were the same false shape:

    _t('מחובר') + (src.last ? ' &middot; ' + _t('סונכרן') + ago : '')

**A second half that may not appear at all is not the second half of a
sentence** — two independent labels sharing a line. A ternary opening inside
the gap is the tell, and with that narrowing:

    against HEAD   1, the NaN line
    after          0

## "תוכנית מסה · 3 Trainings"

The plan’s name is **stored** as the Hebrew it was picked from — which is
right and deliberate: the chips compare against it to know which is selected,
and a plan keeps its identity when the reader changes language. The chip
already translates at display, exactly as Rule 3 asks.

What was missing is the other half. Five places printed the stored value
straight out, so a plan picked as *Aufbauplan* came back as תוכנית מסה on the
summary, the card, the plan screen and the header. Same split `exLabel` makes
for an exercise, same fix: `progLabel` translates a name the list knows and
passes anything else through, because a name someone typed is theirs.

The name box gets one extra care: it is pre-filled with the **label** now, and
if it is saved unchanged the **stored key** is kept — so a plan does not
quietly stop being translatable just because someone looked at the box.

And two save toasts were a name glued to "saved!". One key with a hole, so a
language can put the name where its grammar wants it: *¡{name} guardado!*,
*已保存 {name}！*

## Two question marks that could not move

    _t('כמה') +' '+ unitDef(k).many +'?'
    _t('איך קוראים לאימון') +' '+ dayLetter +'?'

Both read fine in German and can be right in no other language, because the
mark is outside the key. The sibling key `כמה גרם?`, which has always been
whole, shows exactly what that cost:

    es  ¿Cuántos gramos?      an opening mark, at the other end
    fr  Combien de grammes ?  a space before it
    ja  何グラムですか？        a full-width mark
    ar  كم جرامًا؟             a different character entirely

`find-glued-sentences` misses this shape on purpose-built grounds: its pair
rule wants two `_t()` calls and there is one, and its lone-fragment rule looks
for unbalanced punctuation **inside** the key. The mark is on the outside.
Worth a rule of its own next time a third one turns up.

## Eleven translations that were never once read

The recipe editor, opened in German. Two of its nine placeholders were still
in Hebrew:

    #rec-ingredients   למשל:\n200ג עוף\n1 בצל...
    #rec-instructions  למשל:\nחממו שמן במחבת...\nהוסיפו בצל...

Not missing translations. **Every language had answered both**, years of
them, and not one answer was ever reachable:

    the dictionary holds   "למשל:\\n200ג עוף…"   a backslash and an n
    _t is asked for        "למשל:⏎200ג עוף…"    a real line break

`build-lang-template` captures the **source text** between the quotes; the
JS parser has already resolved the escape by the time `_t` is called. Two
different strings, so the lookup missed and `_t` fell back to its own
Hebrew argument — with the German sitting right there in de.json.

And even a hit would have been wrong: the stored *value* carried the literal
backslash too, so a textarea would have printed `Zum Beispiel:\n200 g` on one
line.

**No check could see this.** The template check compares the template against
the language files, and both sides were consistently wrong in the same way.
It is invisible from inside the toolchain and obvious the moment a German
screen is read.

So the extractor resolves the escapes the file uses, and both keys and both
values were migrated in all ten files. `JSON.stringify` writes a real newline
back out as `\n`, so every key still occupies one line and nothing else about
those files changed. Scanned first: **exactly two keys in the app hold an
escape**, and these are they.

    Zum Beispiel:      例:            مثلًا:
    200 g Hähnchen     鶏肉 200g      ٢٠٠ جم دجاج
    1 Zwiebel…         玉ねぎ 1個…     بصلة واحدة…

## An alphabetical index that is not alphabetical

Found in the same screen. Six sorts passed `'he'` to `localeCompare` — the
food library, the recipe A–Z index, three in the people list — while one
other place already passed `APP_LOCALE`, so the idiom existed and six sites
had missed it.

**Measured across all eleven before changing anything**, because most of them
would not care. German, Japanese and Arabic sort identically under `'he'`.
Three do not:

    es       he  ácido avena ñame naranja nuez
             es  ácido avena naranja nuez ñame
    zh-Hans  he  大米 牛奶 苹果 豆腐 香蕉 鸡蛋     codepoint order, no order at all
             zh  大米 豆腐 鸡蛋 牛奶 苹果 香蕉     dà dòu jī niú píng xiāng
    zh-Hant differs again, by stroke rather than by pinyin.

Driven end to end: two recipes added through the box in Spanish, *Naranjada*
and *Ñoquis de calabaza*. The index now reads **Todo · L · N · Ñ**; under the
old collation it was L · Ñ · N.

### Also driven, and correct

A full recipe typed through the UI — *Linsensuppe mit Zitrone*, six
ingredients, four numbered steps, tags, notes — renders entirely in German,
including **🍽 4 Portionen** from the plural key. No Hebrew nodes on the
editor, the detail view or the list.

### Looked at and left alone

The recipes **tab** and the composed-meal **FAB** are both labelled "Rezepte"
in German. They are different features — a recipe book and a meal builder —
and share a word. Not fixed here because the right answer is an editorial
one about what to call the builder, and that is Asaf's to make.

## The name you typed disappears when you add an ingredient

The composed-meal builder, driven for the first time. Type a name, tap **+
Zutat aus der Bibliothek**, and the name vanishes from the box.

    h+='<input id="builder-name" … value="" oninput="builderName=this.value">'

Every re-render redraws the box empty — and there are four paths to one:
the picker toggle, each category chip, adding an ingredient, removing one.
The *variable* keeps the name, so saving still worked; what was wrong is the
gap between what the screen says and what the app holds. Measured, not
guessed: box `""`, `builderName` `"Haferbrei mit Beeren"`.

## "268 kcal/100 g" in the picker, "268 kcal pro Portion" once picked

The same food, the same number, two claims about what it means. A library
entry carries its own basis and every other place asks — the ingredient row
directly below, the library list on the Meine screen. The picker alone said
"/100g" about all of them.

The arithmetic was never wrong: `builderAddIng` copies the basis across, so a
serving-based entry is counted in servings whatever the picker said. What was
wrong is the number a person reads while **choosing** — the one moment the
label is all they have. Both keys already existed, answered in all eleven.

## Three native alert() dialogs

All validation — "give it a name", "add some ingredients", "fill in a name
and a calorie count" — in an app where every other refusal is a toast,
`logProgEntry`'s own "enter a weight" included. A native alert blocks the
page and, on a phone, opens a system dialog with the site's **domain** printed
above the message: not this app's voice, and not what someone who installed
it as an app expects. The wording did not change, so nothing new to translate.

## carote, cipolle, arance, fragole, cetrioli, fichi — all reached nothing

Driving the sentence path in German turned up **Eier** finding no food, which
raised the question of how big the plural gap really is. Measured rather than
assumed, with the shipped search asked in each language:

    German   20 of 22 everyday singular/plural pairs already agreed
    Italian   2 of 18

German was fine: `foodForms` folds the `-n` plural and that is most of them.
**Italian was not handled at all** — it builds its plural with a vowel rather
than an s, so none of the existing rules touched it, and six everyday foods
reached *nothing*. Typing "carote" is simply how a person says they ate
carrots.

Italian is a rule, so it became one: `-e → -a`, `-i → -o` **and** `-i → -e`
(pomodori is a pomodoro, noci are a noce), with the hardening h that belongs
to the plural alone — `fichi → fico`, not `ficho`.

    Italian   2 of 18  ->  12 of 18, and all six NONE cases fixed

The six that remain are singular-side gaps and ties between two rows of the
same food (lenticchia/lenticchie reach lentil-sprouts and lentils-dry), which
are data questions rather than rule ones.

**German's Ei/Eier is an irregular, so it became data.** Stripping `-er` in
general would turn Butter into Butt and Wasser into Wass for nothing; the core
already carries Spiegelei and Rührei as search words for that row, and Eier
joins them. 20 of 22 → 21 of 22.

Both wins are locked into `food-search-probes.json`, so the suite went from
**531/53 to 538/60** with every per-language baseline unchanged — 309/309,
fr 306+3 known, pt 308+1 known.

## And the sentence summary was the only line not in the reader's notation

"266 Kalorien · 5.9 g Eiweiß", an inch above meal rows reading "12,4 E 31,7
K". The calorie count already went through `nfmt`, which is exactly what made
the mismatch visible. Three macros and the per-row calorie badge now do too.

### Driven end to end

A German sentence — *"Ich hatte zwei Eier, eine Scheibe Vollkornbrot mit
Butter und einen großen Apfel"* — parsed into four items, all four matched:

    Ei oder Omelett, ohne Öl gegart · Vollkornbrot · Butter · Apfel, mit Schale
    428 Kalorien · 20,1 g Eiweiß · 34,6 g Kohlenhydrate · 22,3 g Fett

Before this pass the egg row was a manual search and the total read 266.

## The last two native dialogs, found by the tab freezing

The end-of-day reflection, driven end to end in German for the first time —
the mood scale, the body chips, the 1–10 grade, three flow anchors typed in,
the best moment, gratitude, and on into the sixteen-card second stage. All of
it correct, all of it German, and the five mood steps distinct.

Then **Mensch des Tages → + Neue Person** froze the tab. That is the
signature of a `prompt()`, and it was one:

    function rfAddPerson(){ var n = prompt(_t('שם האדם')); … }

A grep found the other: `exWeightEdit` on the weights screen. **This file
already says what it thinks of them**, in a comment about the goals map it
rebuilt for exactly this reason —

> the map could only be filled through prompt() dialogs, one line at a time,
> which is no way to think a goal through

Three `alert()`s became toasts last pass. These two were what remained, and
they are worse: an alert only interrupts, **a prompt is the only way in**. On
a phone it opens a system dialog with the site's domain printed above the
question, in an app somebody installed to feel like an app.

Both are inline now — a field where the chip or the value already sits, Enter
to accept, Escape to drop it. Every string they need already existed and was
answered in eleven languages, so nothing new had to be written.

### And the weight prompt was lying about its units

It offered `String(cur.w)` — the stored **kilograms** — under a label reading
`weightUnit()`, and put whatever was typed back as kilograms again. The row
behind it printed `cw.w` with `weightUnit()` beside it, so a reader on pounds
saw **"80 lb"** for 80 kg.

That is the **third** instance of the bug found in the plan wizard last pass,
and it hid from the `>kg<` grep for a simple reason: **a prompt has no markup
to grep.** Driven after the fix, in German with imperial units:

    the row now reads      176,4 lb     (80 kg, was "80 lb")
    typed 185 into the box  ->  stored 83.91 kg  ->  reads back 185 lb

The prompt's question key is retired in all ten files: a box under a heading
that already names the exercise does not need to repeat it.

### Also driven, and correct

A person created from inside the reflection — Lena — lands in the people
store, is selected, and the follow-up question appears, all without leaving
the page. And the week card said **"Stimmung 4.0"** where every other number
on the screen carries a comma; the two weekly averages now go through `nfmt`.

### The trap, for next time

A `prompt()` freezes the driven tab exactly as `confirm()` does, and
`navigate` cannot recover it — the tab came back on its own a few minutes
later. Grepping for `confirm(` alone was not enough; **grep for `prompt(` and
`alert(` too before clicking anything that adds a record.**

**Correction.** The commit for this pass claimed there were none of any kind
left. That was wrong, and wrong in the way this file keeps warning about: the
check that produced it grepped for `prompt(` and `alert(` and never for
`confirm(`, then the absence of output was read as proof. **Three `confirm()`
calls remain**, all guarding a destructive action:

    8007   delete a workout
    17226  delete a goal and the {n} steps under it
    18925  finished reading the book?

Those are a different argument from the other five. An `alert` only
interrupts and a `prompt` was the only way in; a blocking confirmation before
something irreversible is defensible, and the app has no inline confirm
pattern to move them to — building one is a design decision rather than a
defect fix, and Asaf's to make.

What is NOT defensible is the sentence that said they were gone. A count is
only worth what the pattern behind it asked for.

## „gesund sein" — a quote opened one way and closed another

The goal wizard, opened in German. Its second line reads

    Nicht „gesund sein" — etwas, das du messen … kannst.

German opens with U+201E and closes with U+201C — **the character English
uses to open one** — which is exactly the sort of thing that gets typed as a
straight `"` and never looked at again.

**Seven answers, all German, and every other language clean.** The pattern
behind that count: an answer holding both a typographic quotation mark
(“ ” „ « » 「 」) and a straight `"`. Each of the seven had exactly one of
each, asserted per string rather than assumed, so the pairing was
unambiguous.

    „{what}\" kam einmal vor
    Die Bibliothek ist leer — füge etwas über „Selbst eintragen\" hinzu
    Nicht „gesund sein\" — etwas, das du messen und mit Sicherheit abhaken kannst.
    „{name}\" und seine {n} Schritte löschen?

### The rule now lives in the check that reads those files

The eight checks all read `dev/index.html`; this is a defect in the language
files, so it belongs to `build-lang-template --check`, which already
validates them. It is narrow on purpose — a typographic mark and a straight
one in the **same answer** — so a language that wanted a straight pair
throughout would never trip it.

    against the revision that had them   7, all German
    after                                0

And the exit code was confirmed separately, because the first attempt read
`$?` after a pipe through `tail` and got the pipe's status — the same trap
that produced last pass's wrong claim.

## "Ziel: 2027-03-14"

On the goal map, in German. A goal's target date is **stored** as YYYY-MM-DD,
which is right — it sorts, it compares, and it is what the `<input
type="date">` beside it requires. It was also printed to the reader exactly
as stored.

Thirteen hand-written dates went through `fmtDay` two passes ago. **This one
survived that sweep because it never called `getDate()` at all** — it is a
stored string, not a Date, so the grep that found the others could not see
it. Noon rather than midnight when turning the day key into a Date, the same
thing `fmtDate` does one screen over, because midnight UTC is the previous
day for anyone west of Greenwich. After: **Ziel: 14.3.2027**.

## Driven, and correct

The whole goal wizard end to end in German — the north star, the finish line,
three stations, the first small step, what could go wrong and what to do when
it does — then the map it builds, in both its star and writing views:

    10 km am Stück laufen, ohne zu gehen        0/3
    Nächster Schritt: Drei Monate lang dreimal pro Woche laufen

The file says this map was rebuilt away from `prompt()` dialogs so the whole
shape would be visible and editable in place. It is, and every field of it is
German.

### A measurement trap

Clicking "✦ Sternenkarte" opened the wrong screen, which looked like the map
being unreachable. It was not: the goal **card** carries its own onclick and
the button inside it calls `stopPropagation`, so matching on `innerText`
found the card first. **Match the element that carries the onclick, not an
ancestor whose text contains the label.**

## "Gespeichert &#10003;"

Saving a person in German printed the HTML entity as itself.

`showToast` sets `textContent` **deliberately** — a toast often carries a
name the person typed, and `textContent` is the one thing keeping that out
of the markup. The cost is that an entity in the message is never decoded.

**Twelve toasts**, ten `&#10003;` and two `&#9733;`, showing raw source in
every language. The pattern behind that count: a `showToast(` call carrying
an `&#…;` entity in the same statement. Nothing else in the file assigns
`textContent` from a string holding an entity — checked separately — and one
other line does hold `+' &#10003;'`, at 11541, where it is markup built into
`innerHTML` and right as it stands. The trailing `);` is what tells them
apart.

**The callers changed, not `showToast`.** The file already has the right
idiom in that same function's other callers — `showToast('✓ ' + …)` with the
literal character — and decoding entities inside `showToast` would undo the
protection that is its whole point.

## Two questions, one heading

The person editor asks two different things in a row:

    סוג הקשר           what they are to you   Enger Freund, Familie, Bruder…
    מאיפה אתם מכירים   where you met          Studio, Arbeit, Studium…

**Seven of the eleven printed the same words over both** — de, es, fr, it,
pt and both Chinese — so a reader saw the same question twice with different
chips under each. English was nearly as bad: *"How you know them"* against
*"How you know each other."* Japanese and Arabic already told them apart and
keep what they had.

Rule 5's ground — things a person chooses between must stay
distinguishable — reaching the labels above the choices as well as the
choices themselves. A translation fix: no code, no new keys.

### Measured and rejected: a general rule for this

"Two different Hebrew keys answered with the same string in one language"
sounds like a check. It is not: **99 key pairs** share an answer somewhere,
and the top of that list is deliberate —

    בוקר אור · בוקר בהיר · בוקר טוב · בוקר נפלא   ->  all "Good morning"
    בן משפחה · בת משפחה                           ->  both "Family"

Four Hebrew greetings that vary so a rotating line does not repeat itself,
and a gendered pair the app already draws through `optOnce`. Collapsing in
translation is normal and is the reason the `|context` bar exists. **No rule
added**; the pair was fixed by hand.

## Driven end to end

A whole person record typed through the form in German — name, relationship,
where they met, what they mean, what to ask, a birthday, and a memory on the
timeline:

    Lena Brandt · Enge Freundin
    📅 Geburtstag  21.6. jährlich
    Zeitachse  11.9.2026 · Einsicht

Both dates render through the formatters added two passes ago. No Hebrew
anywhere in the module, and the relationship chips are all distinct.

## An Arabic day board numbered in Latin

The planning module, driven for the first time. In German the day board
header read **11/09** — the hardcoded DD/MM again, three passes after the
thirteen inline dates went through `fmtDay`.

It survived that sweep for a plain reason: **it was behind a helper.**
`wkShort(d)` built the order by hand, so the grep that found
`getDate()+'/'+(getMonth()+1)` could not see it — and one body feeds **five**
call sites: the week range, each of the seven week-strip cells, the opened
day header and the day board. One line changed, all five with it.

The zero padding went too. It was there to keep the week cells aligned, and
Intl pads or does not according to what each language does. Measured at the
width the shell caps to: seven cells at 40px, **no overflow in any of them**.

    de  6.9. – 12.9.      en  9/11 · Swipe to change day

## Then the same screen in Arabic

Four families of Latin digits, on a right-to-left screen where everything
around them was already Arabic-Indic:

    ٠ من ١ موضوعة      the header counted 0 in one system and ١ in the other
    1 2 3 … 30         every cell of the month grid
    سبتمبر 2026        the year
    06:00 … 23:00      eighteen rows of the hour rail

The counter is the interesting one. `placed + ' ' + _t('…{n}…')` — the total
goes through a hole and so through `nfmt`, the placed count is concatenated
raw. **Two numbering systems four words apart**, and Rule 2 as well, since
the fragment could not stand alone. One whole key with both holes fixes the
grammar and the notation together — and Japanese and Chinese immediately used
it to put the total first, which they could not do before.

`dpHH` and `dpHM` build a clock face by hand — zero-pad, colon, zero-pad —
so the rail, the five-minute steps inside an opened hour, the time on a week
chip and the time in a reminder were all Latin whatever the reader used.
Both are display-only: the real values travel beside them as `hour` and
`min`, and the two callers that **look** like storage (a summary card's `at`,
a notification's `when`) are strings being shown, not compared — checked
before touching them. The clock stays 24-hour, which is what it already was;
only the digits follow the reader. `fmtClock` would have brought ص/م with
them and changed the rail's width, and this is a rail rather than a time.

### The year is the one number that must not be grouped

    nfmt(2026)                      ->  ٢٬٠٢٦   and "2,026"
    nfmt(2026,{useGrouping:false})  ->  ٢٠٢٦    and "2026"

Flagged as a risk two passes ago when `_t` learned to format numeric holes —
*"no key takes a year, which is the one number that must not be grouped"* —
and here are the two places that print one outside a hole. Both ask for
grouping off explicitly.

**After: zero Latin digits anywhere on the Arabic planning screen.** The
pattern behind that count: every leaf element under `#content` that is
visible and whose text contains `[0-9]`.

English re-checked in the same place — `September 2026` ungrouped, `06:00`
unchanged, `0 of 1 scheduled`, `9/11` in American order.

## A setting nobody could reach

The settings screen has two sections: language and country. **There is no
units setting** — and `APP_UNITS` drives `fmtWeight`, `weightUnit`,
`toDisplayWeight` and every box in the app that takes a weight.

It has always been **read** and never **written**. The pattern behind that:
`UNITS_KEY` appears four times in the file — its declaration, one
`getItem`, and two comments. No `setItem`.

Which is also why three unit bugs could sit there being found one at a time
over four passes: **nobody could turn the setting on to see them.** A reader
on pounds had no way to say so.

So: a third section, stored the way the language and country are, repainted
the way a language change is — a weight is on half the screens in the app,
and changing the unit should not send anybody home. Driven end to end: the
chip in settings, then the weights screen reading **185 lb**, with no reload.

### The chips name the systems, because the check was right

They first showed the units themselves — `kg · ml` against `lb · fl oz` —
which reads better, because what a person wants to know is what they will
see. But it meant joining two unit keys with a separator, and
`find-units-in-strings` flagged it: **its rule is that a bare unit may stand
alone only when it is not being joined to something else**, and that rule has
caught a real bug before.

Widening a check to let my own code through is how a check rots. The code
changed instead — *Metrisch / Imperial*, 公制 / 英制, متري / إمبراطوري.

(And then it flagged the **comment** I wrote explaining all this, because the
comment quoted the code. Reworded. The check reads the whole file, which is
right.)

## The Arabic sweep, run across everything

Reading the rendered screen for `[0-9]` in Arabic is the cheapest detector
found in this repo: it catches a raw number **wherever it came from** —
behind a helper, inside a percentage, welded to a denominator — because the
evidence is on the screen rather than in a pattern someone guessed.

It found **nine families across four modules**, including two in the habit
tracker, which a German sweep had passed clean twice. German shares the
Latin digits, so it can never show this.

| where | was |
|---|---|
| week counter | `2 من ٧ أيام` — count raw, **the 7 baked into the key** so all eleven wrote it by hand |
| past day | `9.9` — a date built by hand with a dot, so neither the `getDate` grep nor `wkShort` caught it |
| grade badge | `8` |
| grade recap | `٨/10` — the number formatted, its denominator not |
| goal card | `0/3` |
| habit header | `سبتمبر 2026` — a **second** month header, in a different module from the one fixed last pass |
| habit percent | `0%` and the per-habit row |
| habit grid | `1 2 3 … 31`, every day row |
| fitness goal | `6–12 تكرارًا` |

The week counter is the one worth naming: seven is still seven, but it is
**passed** now rather than written into eleven translations, which is what
lets it be ٧ for one reader and 7 for another without anyone typing either.
Japanese and Chinese immediately used the whole key to put the total first.

**After: all ten modules clean in Arabic.** The three things still matching
`[0-9]` are text I typed myself — a German journal entry, a meal name, a goal
title — which must never be reformatted.

### A measurement error, caught before it was reported

Switching the language from inside settings looked like it left the settings
screen in the old language while the app behind it turned over — the one
screen guaranteed to be in front of the reader at that moment. It does not.
`langLoad` fetches the dictionary asynchronously and my first read was 1.2
seconds in, before it landed. At 2 seconds: 言語 / 国 / 単位, then Sprache /
Land / Einheiten. **Wait for the fetch before believing a repaint failed.**

## Two sweeps that found nothing, and why that is the result

The Arabic sweep paid out nine families in one pass, so the same was run in
the other two scripts that can show what German cannot. **Both came back
clean**, and that is worth writing down rather than quietly moving on.

### Hebrew — the source language, and the one on the phone

After twenty passes of changes driven in German and Arabic, the risk is a
key that now renders a placeholder, an empty hole, or a NaN in the language
the app is actually used in. The pattern searched: every visible leaf under
`#content` whose text matches `{word}`, `NaN`, `undefined`, `&#` or
`[object`. **Ten modules, nothing.**

The subtler Hebrew risk is the numberless plural keys, which serve as a bare
label in one place and a counted word in another. Checked both ways:

    label (no vars)   סטים · חזרות · פריטים · ימים בוצעו · ימים ברצף
    counted 1/2/5     סט / סטים / סטים · חזרה / חזרות / חזרות
                      יום בוצע / ימים בוצעו · יום ברצף / ימים ברצף

The bare label falls to `other`, which is the plural — right for a heading —
and the counted forms inflect. Both behaviours from one key, as intended.

### Japanese — for hardcoded Latin and for line breaking

Every visible leaf holding three or more consecutive Latin letters, across
ten modules. Everything returned was either **text I typed myself** (a
German journal entry, a goal title, a person, a workout name) or the four
paper-spread headings already in `find-hardcoded-english`'s allowlist as
Asaf's design choice. **No new hardcoded English.**

`kcal`, `kg` and `ml` show in Japanese and are correct: they are what the ja
file answers, and Japanese labelling uses those Latin symbols. カロリー is
used where the word rather than the symbol is wanted.

Line breaking: Japanese has no spaces, so the question is whether anything
overflows. Measured at the width the shell caps to — every visible leaf whose
`scrollWidth` exceeds its `clientWidth`. **No overflow anywhere.**

The one hit was a **false positive of the detector**: the journal's ‹ and ›
chevrons report 32→38px, but their `overflow` is `visible`, so nothing is
clipped — the glyph simply paints wider than its box. *A `scrollWidth`
reading means nothing unless the overflow is hidden, auto or scroll.* The
detector needs that condition before it is used again.

## "一日を読み返す 2026-09-11"

Found by driving the **AI question box**, which had never been driven. It
works end to end: asked in Japanese, answered in Japanese, with the
arithmetic right and the tool calls labelled in Japanese —

    今日はあと141.5gのたんぱく質を摂ればいいです。目標は155gで、
    現在13.5g摂取しているので、155 - 13.5 = 141.5gが残りです。

But the trace under it printed the day **key**. `askDateArg` turns whatever
the model asked for — "today", "אתמול", a date — into the app's
`YYYY-MM-DD`, which is right for the two callers that look a day up and
wrong for the two that show the trace to the reader.

Same split as everywhere: the stored form sorts and compares, the shown form
follows the reader. One helper, three call sites, noon rather than midnight.
After, asking a two-day question in Japanese:

    読み返す 2026/9/10   読み返す 2026/9/11

and no ISO date left anywhere on the screen.

## The WHO card — a prototype to look at, in dev only

Asked for: *"תעשה שאראה בדיוק במה מדובר ומקסימום נבטל"*. So it is built, it is
in `dev/` only, the root has not moved, and **one `git revert` undoes all of
it**.

### The finding that made it buildable

Every food row in the app carries four numbers — `k p c f`. The MoH table
those rows are built from carries **85 columns**, and `tools/build-foods.mjs`
says so in its own first comment: *turns the ministry’s 85-column table into
the four numbers the app tracks.* Four was a decision, not a limit.

    3,623 foods kept    3,606 carry a sodium    3,336 carry a fibre
    309 core foods        308 carry a sodium      303 carry a fibre

Open Food Facts returns `sodium_100g` and `fiber_100g` **in the same response
the barcode scanner was already asking for**, and both were being discarded.

So four of the WHO’s five daily limits are reachable with nothing invented.
Two are built: sodium and fibre. Saturated fat and trans fat are the same
columns and the same shape. *Free* sugars is the one that is genuinely not
measurable — both sources give total sugars, which is a different number.

### What it shows

    נתרן               1,008mg     עד 2,000mg ליום      ▓▓▓▓▓░░░░░  green
    סיבים תזונתיים       18.4g     לפחות 25g ליום       ▓▓▓▓▓▓▓░░░  amber
    לא נמדד: Banane (100g) · Vollkornbrot mit Frischkäse

`ceil` is the whole of the design: **one bar, read two ways.** A ceiling is
green until it is passed and terracotta after; a floor is amber until it is
reached and green after. A single "diet score" would hide exactly that, which
is why there are two bars and no score.

The third line is the rule the food core is built under, applied to a day:
**a food with no clean row is skipped and named.** A total quietly missing
half the day’s salt is worse than no total. An absent field and a zero are
never allowed to add up to the same number — which is why `qualOf` copies a
field or copies nothing, and never writes a `0`.

### The collision, caught on the first test run

The fields were `na` and `fb` for about ten minutes. `f.na` has been a food
row’s **normalised alternate names** since the search learned eleven
languages, and `tools/test-food-search.mjs` said so immediately:

    TypeError: na.indexOf is not a function

`sod` and `fib`, both asserted free as bare words *and* as fields before the
rename. The name-collision rule is about fields too, not only globals.

### What is carried and what is not

| path | carries |
|---|---|
| food database (the main one) | yes |
| barcode / Open Food Facts | yes |
| favourites, saved per 100 g | yes |
| the live shelf | **no** — the Worker maps OFF’s fields and would have to send them |
| AI estimate, photo, manual | no, and correctly: nobody measured those |

Everything in the "no" column is named on screen rather than counted, so the
gap is visible instead of silent.

### Driven

Real path, real boxes: searched לחם לבן, picked it, added 100 g → 450mg and
1.6g, which is the ministry’s row exactly. Then עדשים at **250 g** → 558mg
and 16.8g, the per-100 numbers times 2.5 to the decimal.

Six languages read off the rendered card. Arabic `١٬٠٠٨mg` and `١٨٫٤g` with
the Arabic decimal mark; German `1.008mg` and `18,4g`; Japanese `1日 2,000mg
まで`. Nothing clipped at 400px in German, the longest of them.

### Still open, if it stays

- The app’s own protein target lands at 1.4–2.2 g/kg where WHO/FAO/UNU’s safe
  level is 0.83. Both are defensible; they are answering different questions,
  and nothing on screen says so yet.
- These are the **adult** figures. WHO’s fruit-and-veg and fibre numbers step
  down by age band, and pregnancy changes the iron story entirely.
- The live shelf needs a Worker change to join in.

## The vlog, driven for the first time

### Getting a camera without a camera

The sheet cannot be driven at all without `getUserMedia`, and a real
permission prompt in an automated tab is a trap. So the sensor was replaced
by **a painted canvas plus a real oscillator**, handed back as a genuine
`MediaStream`. Nothing downstream is stubbed: the canvas pipeline, the
`MediaRecorder`, the countdown, the blob and the save all ran for real.

That is also how the **denied** path was reached — one rejected promise with
`NotAllowedError`, which is exactly what a denial is. It lands correctly:

    אין הרשאה למצלמה. אפשר לאשר אותה בהגדרות האתר.
    אפשר להקליט במצלמה של הטלפון, עד 30 שניות.
    [ הקלט במצלמת הטלפון ]   [ בטל ]

and the fallback is a `capture="user"` file input, which is the right answer.
`NotFoundError` and the generic failure have their own sentences.

**A measurement error, caught before it was reported.** Read through
`textContent`, those two sentences look glued: `…בהגדרות האתר.אפשר להקליט…`.
They are not — there is a `<br>`, and `textContent` drops it. *Use
`innerText` when the question is whether two sentences are separated.*

### Three families of raw digits, all on one screen

Same detector as the planning module: open the sheet in **Arabic** and read
every visible element whose own text nodes match `[0-9]`.

| where | was | is |
|---|---|---|
| zoom badge | `1×` in the markup **and** `2.4×` from `vlogZoomSet` | `١×` · `٢٫٤×` |
| countdown | `30` seeded in the markup, `27` every tick | `٣٠` · `٢٨` |
| preview line | `١١ ثانية · 166KB` | `٩ ثوانٍ · ١٤٧KB` |

The third is the one worth naming. The seconds inflected correctly — they go
through a plural key with a numeric hole, and Arabic picked `ثوانٍ` for nine.
The size **four characters away** stayed Latin because `vlogSize` builds it by
hand. Two numbering systems in one sentence, which is the exact shape the
planning module paid for.

The zoom badge had **two writers** — a hardcoded `1×` in the markup and
`vlogZoomSet`. The seed is gone and `vlogOpen` asks for the label it already
has, so there is one writer now. Both size branches checked in both
languages, and a clip under a kilobyte still reads `١KB` rather than `٠KB`,
which is what the function’s own comment exists to protect.

**After: zero Latin digits anywhere on the Arabic vlog sheet.** German read
clean too — every label and every `aria-label` translated, no Hebrew left.

### And the thing the canvas exists for

Recorded, pressed flip mid-clip, kept recording. `_vlFacing` went
`user` → `environment`, the recorder stayed `recording` straight through, and
one nine-second clip came out the other side. The claim in the header comment
— that the recorder never notices the switch because the canvas never changes
identity — is true, and now has been watched happening.

### A tooling trap

`javascript_tool` refuses a result containing `video/mp4;codecs=avc1` —
a semicolon and an `=` read as query-string data. Return `vlogMime().length`
rather than the string.

## The history tab — a unit bug with a witness two rows above it

The cumulative card draws two reference lines through `fmtWeight`, and then
prints its headline number by hand. In imperial, one card said:

    reference lines   ~1.1 lb      ~2.2 lb         through fmtWeight
    the headline      ~1.99 kg                     by hand

`~'+(cum/7700).toFixed(2)+' '+_t('קג')` — kilograms, unconverted, under a key
that answers **kg in every language**. 1.99 kg is 4.4 lb, so the reader was
shown less than half of the number the card exists to show, in a unit they do
not use, **beside two correctly converted lines**. Now `~4.4 lb`.

`_t('קג')` was also a second spelling of `_t('ק"ג')` — one meaning, two keys,
Rule 1 backwards — and that single call site was its only use. Retired.

### Eight raw numbers on the same screen

The pattern: every visible element under `#content` whose **own text nodes**
match `[0-9]`, in Arabic, on each of the three tabs.

| where | was | is |
|---|---|---|
| y-axis, both charts | `45 578 1110 1643 2175` | `٤٥ ٥٧٨ ١٬١١٠ …` |
| month chart x-axis | `1` `10` | `١` `١٠` |
| the legend | `-- الهدف 1975` | `–– الهدف ١٬٩٧٥` |
| averages | `894` `30g` `7/7` | `٨٩٤` `٣٠g` `٧/٧` |
| card title | `… سبتمبر 2026` | `… سبتمبر ٢٠٢٦` |

**The legend was three bugs in one expression.** `_t('-- יעד')+' '+TARGETS.kcal`:
a fragment with a number glued to it (Rule 2), the number raw (Rule 4), and
two dashes **inside the key**, where no language can move them and where they
land on the wrong side of an RTL phrase. The dashes are a picture of the
dashed reference line, exactly as the sibling entry’s `●` is a picture of the
solid one, so they moved into the markup — and the sentence that remained is
a key the reference label was already using. One key deleted, none added.

### The month list, and the seven copies still out there

The title was `_t('גרעון מצטבר') + ' — ' + mn3[mo2] + ' ' + y2` — a
hand-written list of twelve month names, indexed, with a raw year glued on.
`dfmt` already knows the month name for the reader’s locale, so the list and
the year went together into one whole-sentence key. What that bought:

    he  גרעון מצטבר — ספטמבר 2026
    ar  العجز التراكمي — سبتمبر ٢٠٢٦
    ja  2026年9月の累積赤字

Japanese puts the date first and drops the dash, which the fragment could
never have allowed — and `2026年9月` is a shape no hand-written list of twelve
Hebrew keys was ever going to produce.

**Still open: that same list of twelve `_t()` calls is written out SEVEN more
times** (as `mn`, and once as `MO_NAMES` under `langOn`). Every one of them is
a `dfmt` call. It is a pass of its own and should be taken as one, because it
crosses four areas already marked clean.

### Two traps

**The file mixes line endings.** Splitting on CRLF yields chunks that hold
several logical lines, so a `splice` to delete one line would have taken the
line after it as well. Delete a line by matching its own text.

**`javascript_tool` still RUNS code whose result it blocks.** A call whose
output tripped the "Cookie/query string data" filter had already executed —
the next call found its work done. Do not assume a blocked call was a no-op.

## Four questions, and a bank behind the fifth

Asaf: *"אני רוצה שהמשתמש לא ירגיש כאילו סיכום יום זאת משימה"* — and then the
exact list he wants asked. Ten questions before the app lets you go is a
task. Four is a moment.

    הרגע הכי טוב   ·   תמונת היום   ·   שיר היום   ·   משפט שתפס אותך
    נוסף…

**Nothing was deleted.** Every question that left the queue is still there,
still answerable, still in the summary, and every answer already recorded
still reads back — checked by writing a day in the old ten-question shape and
opening it: the grade came back as `8/10`, the gratitude, the mood, the
moment. What changed is *who has to ask*.

### The shape was already there

The module already had the two halves: a linear queue (`RF_STAGE1`) and a
board of optional cards (`RF_STAGE2`), with a bridge between them asking
*"רוצה להסתכל קצת יותר לעומק?"*. So this is not new machinery — it is eight
questions moving across the line, two moving back, and the bridge changing
from an invitation into a door:

| | before | after |
|---|---|---|
| asked every day | 10 | **4** |
| in the bank | 16 | **21** (22 on a day with a planned workout) |

`song` and `quote` came **up** into the four and left the board, because a
card that opens a question you were already asked reads as a bug even when it
is not. The eight that went down got card titles, subtitles and icons.

### The bridge is now the fifth step

The finish button is the one that looks like the answer, and the bank is
offered underneath it — because the day is already closed by then, and the
bank is an offer rather than a fifth thing being asked.

    נוסף…
    יש עוד שאלות אם בא לך אחת. אפשר גם פשוט לסיים כאן.
    [ סיימתי להיום ]
      הראה לי את השאלות

### The index bug this uncovered

The board walked `RF_STAGE2` **unfiltered** while `rfOpenCard(i)` stored `i`
as `_rfStep` and the step view read `rfSteps()[_rfStep]` — the **filtered**
list. So turning off one section shifted every card after it, and tapping a
card opened a different question.

It was rare before, because only a section toggle could trigger it. It would
have been **routine** now: `workoutDone` is a card, and it drops out of the
list on every rest day. Driven: 21 cards today (no workout planned), tapped
*ציון היום* at index 2, got `dayRating`. One `rfFilter`, both callers.

### Eight icons

`body star wave target dumbbell sunrise hands moon` — same 24-box, same
stroke. `endOfDayMood` moved from `face` to `moon`, because the board now
carries two mood cards and two identical icons is two cards nobody can tell
apart at a glance.

### Answered in eleven, and two pairs kept apart

17 new keys, 8 retired. Two pairs sit on the same board and have to stay
tellable apart — Rule 5 applied to cards rather than chips:

    איך זרם היום / עוגנים לפי הסדר   beside   ציר היום / איך הוא התגלגל
    איך הרגשת / היום, בגדול          beside   איך אתה עכשיו / ברגע הזה

Japanese already answers *ציר היום* with 一日の流れ — literally "the day’s
flow" — so the new flow card could not be 流れ too. It is 節目, the day’s
anchor points, which is what that question actually collects. German checked
on the rendered board: 21 cards, no duplicate titles, nothing clipped.

### Open, and his to decide

- **Per-day or remembered?** The bank adds a question to *today*. Whether
  picking one should make it part of your own nightly four from then on is a
  real fork and he should pick it, not me.
- The board’s subtitles mix capitals in the European languages — a sub that
  continues its title is lowercase, a standalone one is capitalised. That was
  already true before this change and the new ones follow the same principle,
  but 11 lowercase against 10 capitalised is a visible split on one screen.
- `enterModule('reflect')` renders a "module under development" placeholder;
  the real door is **`enterModule('endofday')`**. Driving through the wrong
  one paints the reflection over the nutrition tab strip, which looks exactly
  like a layout bug and is not one.

## Seven lists of twelve month names, and what they were costing

They looked like the *right* shape. `_t('{d} ב{m}', {d: …, m: mn[month]})`
is a whole sentence in one key with the month as a translated value — Rule 2
and Rule 3 both satisfied, and that is why the pattern survived every sweep.

**But a sentence key can only ever be one order, and the order it froze was
the Hebrew one.**

    en answered it "{d} {m}"   ->  Friday, 11 September
    Intl for en-US             ->  Friday, September 11
    fr answered it "{d} {m}", and capitalised Septembre
    Intl for fr-FR             ->  vendredi 11 septembre

American English does not put the day first and French does not capitalise
month names. Eleven translators each answered one key correctly for their
own reading of it; **the key itself could not carry the difference.** No
check could see this either — every language had an answer, so
`--check` was green, and the Hebrew screen was right.

The separator was the same story. `', '` is a Latin comma welded between
two values: Arabic wants `،` and French wants no comma at all. Both arrive
free once Intl formats the whole date.

### And two things the same replacement swept up

Reading the home calendar in Arabic to check the header showed **the day
cells as well**:

    before   ‹سبتمبر 2026›  ح ن ث ر خ ج س  1 2 3 4 5 … 30
    after    ‹سبتمبر ٢٠٢٦›  ح ن ث ر خ ج س  ١ ٢ ٣ ٤ ٥ … ٣٠

A raw year in two calendar headers, and **every day cell of both calendars**
— the same family the planning module’s grid paid for, in two functions that
sweep never read. They came out with the month names because they are in the
same expression.

### What went

| | |
|---|---|
| hand-written month lists | **7 → 0** (six `var mn=`, one `MO_NAMES`) |
| full weekday lists beside them | 3 removed, 1 kept (it is indexed on its own line) |
| keys retired | **13** — the twelve months and `{d} ב{m}` |
| keys added | **0** |

The single-letter weekday strips (`א ב ג ד ה ו ש`) stay: they are a column
header, not a date.

### Driven, before and after, in four languages

    en   Friday, September 11        ·  September 2026
    fr   vendredi 11 septembre
    ar   الجمعة، ١١ سبتمبر            ·  سبتمبر ٢٠٢٦, every cell Arabic-Indic
    he   יום שישי, 11 בספטמבר        ·  ספטמבר 2026

Six screens read: the nutrition day header, both calendars, the habit
tracker header, the journal date line and the home date. **Zero Latin digits
anywhere in Arabic** — the pattern being every visible element whose own text
nodes match `[0-9]`.

### One visible change to Hebrew, which is his to judge

Hebrew gained a word: **שישי → יום שישי**, because that is what `he-IL` calls
Friday and Intl has no option that returns the bare form (`weekday:'short'`
gives *יום ו׳*, which is worse). It is correct Hebrew and it is what the
phone’s own OS says — but it is a change to the screen he reads every day,
so it is worth him seeing rather than discovering.

Width is not the reason to worry: measured in the header’s own font, the
longest of the eleven is Portuguese at **211px in a 368px box**.

## A muscle is a filter, not a door

Asaf, with two screenshots of another app: *"אצלנו זה קצת מסורבל, אין כל כך
הבדל בין השרירים לתחילת התרגילים"*. He is right, and the reason is
structural: **choosing a muscle WAS the navigation.** One tap filtered a
list that was already sitting underneath, so the two halves ran into each
other and you could only ever ask about one muscle at a time.

A filter is a question you finish asking before you get an answer.

    picking           choosing chest + biceps, nothing else on screen
                      [ נקה סינון ]  [ הצג 39 תרגילים ]
    ↓
    reading           ‹ חזה · יד קדמית
                      39 rows

`_exFilter` (a string) became `_exFilters` (a list), and `_exShow` says which
half you are looking at. Typing in the search box still skips the picking
half entirely — a typed word is its own answer.

**Any, not all.** Picking a second muscle should WIDEN what you are shown:
two muscles asked together is "either of these". Chest 25 + biceps 14 gave
39, so those two share no exercise; had it been an AND, the second tap would
have emptied the screen, which is the opposite of what a second tap looks
like it should do.

Switching tab clears the picks, because keeping muscle picks alive under the
equipment tab would apply a filter that nothing on screen is showing.

### The count is the point of the step

It is a **plural key** and it had to be, for two reasons both visible on one
button: the word inflects, and the verb and the number are one sentence, so
a language that wants the count first can only do that if it owns the whole
string. Japanese and Chinese take that option. Arabic uses all six
categories, and zero is a real state here because a filter can exclude
everything:

    ar   لا تمارين مطابقة · اعرض تمرينًا واحدًا · اعرض تمرينين
         اعرض ٥ تمارين · اعرض ١١ تمرينًا · اعرض ٢٢٨ تمرينًا
    en   Show 1 exercise · Show 46 exercises
    ja   {n}件の種目を見る

Two keys added, none retired. The card counts went through `nfmt` while I
was in there — they were raw.

### A double mirror, found by looking

The back chevron pointed the wrong way in Hebrew, so it got
`[dir="rtl"] { transform: scaleX(-1) }`. It still pointed the wrong way.
Then `display:inline-block`, because a transform does nothing to a
non-replaced inline element. **It still pointed the wrong way**, with the
computed transform sitting right there in the inspector saying
`matrix(-1,0,0,1,0,0)`.

`U+2039` is a **bidi-mirrored character**. The browser had already turned it
round for the RTL paragraph, and the CSS turned it back. Two mirrors is
none.

It is an SVG path now — no bidi behaviour, so the direction is decided in
exactly one place. *Three wrong explanations in a row, each one reasoned
from the code; the zoom is what settled it.*

### Driven end to end

Real clicks: a muscle card, the count button, a row, the detail, "choose
this exercise" — the picker handed back **כפיפת שורש כף יד** and closed.
Exercise search still 95/95.

## The label path printed `{p}` at the reader

A nutrition panel is **read**, not queried, so any one line of it can come
back missing. `picFromLabel` had no guard for that, and the barcode path —
the same job, from a different source — has had one from the beginning, with
its reason written out:

> *Open Food Facts often carries the energy of a product and not its macros,
> and `|| 0` turns that into "0 g fat" — a figure nobody measured, sitting
> beside three that somebody did, and counted into the day.*

Same failure, other door. Driven on the real screen, a panel whose protein
line could not be read produced this meal row:

    קרקר מהתווית (100g)     {p}ח 53.6פ 1.7ש     264
                             ^^^

and this day total:  `264 · 0g · 53.6g · 1.7g`.

**Four steps from a missing line to a literal placeholder on a phone:**

    L.p is undefined
    Math.round(undefined * 1)   ->  NaN
    JSON.stringify on save      ->  null
    _t("{p}ח …", {p:null})      ->  hands the hole back, unfilled
    m.p || 0 in the day total   ->  0, because null and a measured zero
                                    are the same thing to ||

Every step is reasonable on its own. `_t` returning the placeholder is
better than printing "null"; `|| 0` is how you sum a sparse list. The bug is
that nothing upstream refused the row.

It refuses now — all four or none, the barcode rule — and **refusing is the
better answer anyway**: `picByTable` then resolves the dish against the food
tables, which is a measured number instead of a half-read one.

`picNum` also takes the two other shapes a photographed number arrives in: a
string, because the panel was printed rather than transmitted, and a
negative, which is a blur across the line and not a food that owes you
protein.

### The line the fix must not cross

Olive oil really is 0 g protein and 0 g carbohydrate. **A measured zero is a
measurement**; an absent one is not. Two of the twelve cases exist only to
hold that line, one of them scaled from a 14 g serving so the zero passes
through the arithmetic as well.

### tools/test-label-panel.mjs

Lifted out of the shipped file rather than retyped, the way the flood-fill
test is. Both numbers, as the rule asks:

    against 5479a3e, the revision with the bug     9/12
    against the fix                               12/12

The three it catches are the two unreadable-line cases and the negative one.
I had written "4 of 12" in the file’s own header before running it; the run
said three. Corrected there.

### The rest of the photo path was already right

| branch | driven with | result |
|---|---|---|
| oversized | a real 2400×1600 PNG, 90KB | 900×600 JPEG, 7KB, aspect kept |
| unreadable | ten bytes in a file called `broken.jpg` | refused, *לא הצלחתי לקרוא את התמונה.* on screen |
| no server | `SYNC_SERVER` blanked | *הצילום דורש חיבור לשרת.* on screen |

Both error branches clear the busy flags, so the card does not sit spinning.
The photo card swept in Arabic is clean — no Latin digits and no Hebrew, the
pattern being every visible element whose own text nodes match `[0-9]` or
the Hebrew block.

### A tooling note

`await img.decode()` never resolves in the driven tab — it is hidden, and
decoding waits for a rendering step that never comes, the same family as
`requestAnimationFrame` not firing. Use `onload` and read `naturalWidth` in
a later call.

## A set doubled the moment it was logged

The weight box in a workout is labelled with `weightUnit()`. An imperial
reader types **135** meaning pounds. `logSet` stored that 135 unconverted,
and the row underneath read it back through `fmtWeight`:

    typed into a box labelled (lb)   135
    stored                           135          <- should be 61.23 kg
    the row then said                297.6 lb     <- should be 135 lb

`saveEditSet` — the function that CORRECTS a set — has always converted,
with a comment saying why. So correcting a set fixed what logging it broke,
and the two paths had disagreed from the start.

### Why it never showed

The prefill has the same fault in the opposite direction: `exPrefill`
returns the stored number and the box printed it raw. Log 135 → store 135 →
prefill 135. **The round trip inside one workout looks perfectly
consistent.** It only breaks where a stored weight meets `fmtWeight` — the
set row, the history, the PRs, the volume — and by then it is a number in a
list rather than the thing you just typed.

### The exception that had to survive the fix

`barWeight()` reads `BAR_STEPS[APP_UNITS]` and returns **45** for a pound
bar. The plate maths speaks the reader’s unit on purpose — you load pound
plates on a pound bar — so `setPlates` must keep getting the box number, not
kilograms. `logSet` now carries two:

    shown  = what the box says, in the unit its label claims  -> setPlates
    weight = what gets stored, always kilograms               -> the set

Driven: 135 into a box labelled lb → stored 61.235 kg → row reads 135 lb →
plates read *45 lb bar, 45 a side*, which is 135. All three agree.

**In metric every conversion is the identity**, so nothing changes for the
app as it is actually used — checked on the same path: 60 in, 60 stored, 60
shown, 60 prefilled, 20 kg bar and 20 a side. That is also why this survived
this long.

The template editor had the same shape — column headed `weightUnit()`,
`tplSet` storing raw — and is fixed with it, so plan weights and logged
weights are the same kind of number.

## The progress chart plotted kilograms under a title saying lb

Same card, two behaviours, exactly like the cumulative-deficit card in the
history tab. The summary numbers under the chart go through `fmtWeight`; the
chart above them was drawn from raw `pts[].weight`:

    before   axis 48 53 58 63   ·   dots 52.5 57.5   ·   summary 115.7 lb
    after    axis 111 118 125 132 ·  dots 115.7 126.8 ·  summary 115.7 lb

It plots display units now, so scale, gridlines, dot labels and title agree,
and every printed number goes through `nfmt` — the axis had been Latin
digits on an Arabic screen. Volume is weight × reps, so converting the
weight factor converts the product: an imperial reader wants pound-reps.

**After, in Arabic:** `٤٨ ٥٣ ٥٨ ٦٣ · ٢٧/٨ · ٥٢٫٥ · ٩٧٣ · ١٬٠١٠`, and zero
Latin digits on the screen — the pattern being every visible element whose
own text nodes match `[0-9]`.

### A wrong guess, caught by looking

The x-axis read `27.8` and `10.9`, which I took for a hand-built `D.M` date
of the kind the calendars were full of. It is `fmtDayShort` — Intl’s correct
Hebrew short date, which uses dots. Nothing to fix. (In Arabic it renders
`٢٧/٨`, which also settles the one real worry: on a chart whose other labels
are weights, a dotted date could be read as a decimal.)

## Two smaller things on the same screen

The exercise chips and the chart title printed the **stored** name, so an
Arabic reader got Hebrew on a screen that is otherwise Arabic. `exLabel`
exists for exactly this and is used in seventeen other places; it translates
a library exercise and falls back to the stored string for anything else.
Now: *سكوات بالبار*, *ضغط الصدر بالبار* — and the chart title with them.

And a name that lied: `best1RM` computed `Math.max(weight)`. The card’s title
says *weight increase*, so the **screen** was honest and only the variable
was not — but `e1rm()` is a real function a few hundred lines up, and a name
claiming 1RM while returning a top weight is how somebody later fixes the
wrong one. Renamed `topW`.

**Worth asking Asaf:** a heaviest-weight line ignores reps, so 60×10 → 62.5×3
reads as progress when it may be the opposite. `e1rm()` would say otherwise.
Changing what the chart plots is a product decision, not a defect fix, so it
is not made here.

## The AI answered in millilitres under a card saying fl oz

The payloads handed to the model are careful in a way worth naming: **every
field carries its unit in its name** — `protein_g`, `fat_g`, `serving_g`,
`basis:"per 100g"`. That is what lets an answer come back in the right unit
without anyone having agreed a convention first, and it is why the box has
been right about grams and calories all along.

Water was the single exception, and the single figure in those payloads that
changes with the reader’s settings. Measured, not guessed — an imperial
reader, one live question:

    the water card, same screen   42 / 101 fl oz
    handed to the model           water_ml: 3000
    the answer that came back     "You have 1750 ml of water left today.
                                   You’ve logged 1250 ml so far and your
                                   target is 3000 ml."

Three numbers in a unit the app does not use, in one sentence, directly
under a card saying otherwise. The model could not have done better: it
answered exactly what it was given.

Water follows the same rule as its neighbours now — converted, and named for
what it is (`water_fl_oz` / `water_ml`). Asked again:

    "You have 59 fl oz of water left today. You’ve logged 42 fl oz so far
     and your target is 101 fl oz."

and the card beside it still says `42 / 101 fl oz`. The payload now carries
the same two numbers the screen does. **In metric it is byte-for-byte the
old payload**, which is why this never showed.

### What was already right, which is also a result

The rendering side has **no numbers of its own at all**, so there was nothing
to sweep: the trace is built from whole-sentence keys through `askDateShow`,
and the answer is the model’s text, escaped, with only `**bold**` and line
breaks converted. That is correct and deliberate — reformatting a model’s
numbers would be inventing them.

The trace in Arabic, all four tool shapes, zero Latin digits:

    أعِد قراءة اليوم ١١/٩/٢٠٢٦
    قرأ من ٥/٩/٢٠٢٦ إلى ١١/٩/٢٠٢٦
    اقرأ أهدافك
    بحث في قاعدة البيانات: أرز

and in English the date reads `9/11/2026`, American order.

### The shape to remember

This is the third unit bug in three passes, and all three are the same
sentence: **a number crossed a boundary without its unit.** Into a box
(`logSet`), onto a chart (`pts[].weight`), into a model (`water_ml`). The
app already knows the cure in two of the three places — `fromDisplayWeight`
at an input, `fmtWeight` at a label, a `_g` suffix in a payload — so the
question to ask of any new code is not "is this converted" but **"what is
the unit of this number, and does the thing receiving it know?"**

## The workout summary: the same sentence, a fourth time

    the hero stat, imperial     1930   labelled "lb נפח"
    what it should say          4,255

Volume is the sum of weight × reps. The sum was taken over **kilograms** and
the label named the reader’s unit — wrong by 2.2×, in the headline number of
the screen, in the same table as weights that convert correctly through
`fmtWeight` three rows below.

Fourth pass running, and the same sentence every time: **a number crossed a
boundary without its unit.** Into a box, onto a chart, into a model, and now
into a label. One helper (`volDisp`) and three call sites — the hero, the
bars, the closing card — plus the history row, which had the same fault.

### And 25 raw numbers on one screen

The pattern: every visible element under `#content` whose **own** text nodes
match `[0-9]`, in Arabic. **25 → 0.**

| what | was |
|---|---|
| three hero stats | `7` `8.3` `1930` |
| every set index and rep count | fourteen of them |
| the RPE legend | `<6` `6-7.4` `7.5-8.9` `9+` |
| the volume bars | `1377.5` `552.5` `0` |
| the rep-range line | `6–12` |
| the history duration | `52 دقيقة` |

The rep-range line is the seven-month-lists shape in miniature: **three
copies of one expression**, one fixed a pass ago, one fixed here, and a third
on another screen that the first two greps never reached.

The duration was a count glued to a noun that cannot inflect — and the plural
key `{n} דקות` already existed and was already in use elsewhere. One key
retired (`דק`), and Arabic gets its dual back: *دقيقتان* for two minutes.

### `BW`

A bodyweight set printed the English initials **BW** in a Hebrew app.
`find-hardcoded-english` could not see it because the string is assembled in
JS rather than sitting between two tags, which is exactly the blind spot that
check documents. `משקל גוף` already existed as a key and answers *Bodyweight*
in English, so it cost nothing.

The comparison table two cards up still said `0 kg` for the same sets — "you
lifted nothing" rather than "you did press-ups". The two now agree.

### The check caught my own regression, in the same pass

Localising the RPE legend produced `nfmt(6) + _t('קל')`, and
`find-glued-sentences` flagged it immediately: **a count printed beside a
noun that cannot inflect.** That is the bug the rule exists for, and the fact
that this one is a legend rather than a count is not something a pattern can
see.

Widening the check was not an option — that is how a check rots, and this is
the second time this session the answer was to change the code instead. The
range and its name are two things; they are two elements now, and the markup
carries the space that the string used to.

## The rack was stored without saying which plates

A disc size is a display number. **20 means a 20 kg plate to one reader and
a 20 lb plate to another, and those are not the same disc** — so the list of
plates your gym owns cannot be stored as bare numbers. It was.

Driven, metric then imperial:

    chosen in metric   [25, 20, 10, 5, 2.5]     kilogram discs
    stored as          [25,20,10,5,2.5]         no unit anywhere
    read in imperial   [25, 10, 5, 2.5]         pound discs

The 20 vanished because no 20 lb plate exists, and the four that survived
changed meaning. Worse than the dropped plate: the imperial reader was now
being told **their gym has no 45s and no 35s** — the two plates every
imperial gym has — so every loading suggestion would be assembled out of
discs they do not own, which is the exact failure `plateSet`’s own comment
says it exists to prevent.

It carries its unit now. A rack chosen in the other system is not applied at
all, which is the honest answer: nobody has said what this gym has *in this
unit*, so the answer is "everything" until they do. The old bare shape is
read as metric, because imperial arrived after it did.

Checked all three ways: the legacy array still applies in metric and is
ignored in imperial; a rack chosen in imperial survives a round trip through
metric and back; and metric sees its own full rack untouched.

**This is the unit bug in STORED DATA rather than on a screen**, which is
the version that does not heal when you fix the display.

## Six more raw numbers, and the volume label twice more

The workout screen, swept in Arabic — every visible element whose own text
nodes match `[0-9]`. **6 → 0.**

    ١٣٢٫٣ lb × 8      the weight converted and formatted, the reps beside
                      it raw, in the same row
    مجموعة 1          a translated word with a number glued to it
    1 / 2             the position counter, both numbers raw

`סט {n}` is a new key and deliberately **not** a plural one: it is an
ordinal label, "set 3", not a count of three sets. Japanese and Chinese put
the number first (`{n}セット目`, `第 {n} 组`), which is the argument for the
whole sentence being one key.

The rep box in the inline editor stays unformatted, and now says why: an
`<input type=number>` cannot hold `١٣٢٫٣` or a grouped string. That comment
exists so the next sweep does not "fix" it.

And the volume label turned up **twice more** — the strongest-lift line on
the stats screen (`Math.round(li.e.v)` beside `weightUnit()`) and the weekly
volume stat (`855 حجم العمل lb`, which is 855 kilogram-reps). Both now read
`١٬٨٨٥ lb` and `١٦٧٫٦ lb · ١٣٢٫٣ lb×٨`.

**Sixth site of one bug.** Found this time by grepping the LABEL — `{u} נפח`
— rather than by finding it on a screen, which is what the "grep for its
siblings" rule is for.

## The rest timer

`Math.floor(left/60)+':'+(left%60<10?'0':'')+(left%60)` — a clock face built
by hand, the family the planning module’s hour rail paid for. `nfmt` with
`minimumIntegerDigits:2` does the pad in the reader’s own digits: **١:٣٠**.

Grepping for siblings found one other minutes-and-seconds expression, in the
reminder scheduler — and it is a **sort key compared as a string**, so it
must stay zero-padded ASCII. Left alone, and the comment in the timer now
says so, because it is exactly the shape a later sweep would "fix".

## What was already right

`plateSetAll()` returns `[45,35,25,10,5,2.5]` in imperial and
`[25,20,15,10,5,2.5,1.25]` in metric, `barWeight()` returns 45 for a pound
bar, and `plateSplit` works in whatever it is handed. Driven: **225 lb on a
45 lb bar gives 45 + 45 a side**, which is right. The plate maths is the one
place in the app where display units are correct on purpose, and it is.

## The box opened on a number the reader had never seen

    the weights row showed    132.3 lb
    tapping it opened a box on 132.28

A trailing digit out of nowhere — and pressing the tick without touching it
stored **a different weight than the one displayed**.

`edWeightVal` exists for precisely this and says so in its own comment:

> *A converted weight is a long float — 30.86471670588286 lb — and nobody
> can edit that. Round it the way `fmtWeight` rounds it, so the box holds
> the number that was on the row a moment ago.*

`fmtWeight` gives imperial **one** decimal. These three boxes rounded to
two, by hand:

    the exercise-weight editor
    the wizard’s base-weight box
    the programme weight placeholder

**Three copies again.** Found by grepping the expression rather than the
screen — the same rule that turned up two extra volume labels last pass and
the third rep-range line before that. In metric both roundings give two
decimals, so all three were invisible until the unit changed.

## The template chain, verified rather than assumed

The weight column was fixed for units two passes ago but nothing around it
had been driven. Whole chain, in imperial, end to end:

    stored plan            60 kg
    editor column header   lb
    the box shows          132.3
    typed 145, saved       stored 65.771 kg
    started the workout    the set box opened on 145 lb

A programme weight typed in pounds reaches the bar as the same number of
pounds. **Nothing to fix**, which is worth writing down: five passes of unit
bugs make it tempting to assume the next screen has one too.

The exercise-weight editor converts on **both** sides as well
(`fromDisplayWeight` in, `toDisplayWeight` out) — only its rounding was
wrong, which is why the number was nearly right and therefore easy to miss.

## One raw number left on those screens

The template editor’s set-index column printed `1 2 3` raw. The pattern:
every visible element whose own text nodes match `[0-9]`, in Arabic, across
the editor and both weekly-plan screens — **that was the only one**, and the
exercise names beside it already go through the label function (*ضغط الصدر
بالبار*).

The `<input>` values are excluded from that sweep on purpose: an
`<input type=number>` cannot hold `١٣٢٫٣`.

## Two supersets a hundred seconds apart became one

`ssJoin` took a group id from the clock:

    var id = exs[i].ss != null ? exs[i].ss : (Date.now() % 100000);

**That cycles every hundred seconds.** And `ssGroup` finds a group’s members
by ID rather than by adjacency, so two supersets created an exact multiple
of 100s apart merge into one.

Driven with the clock stubbed to two instants exactly 100,000 ms apart:

    ss ids        [0, 0, 0, 0]
    ssGroup(0)    [0, 1, 2, 3]     should be [0, 1]
    ssNextIn(1)   2                should be null - b ends its pair
    ssLabel(0)    A/4              should be A/2

What that does to a session: logging a set on the second exercise sends you
to the **third**, which belongs to the other superset, and rest never starts
because `ssIsLastIn` is false. The session silently reorders itself and
nothing on screen says why.

A group id only has to be unique **within one workout** — `ss` is set to
null both when a session is saved and when one is restored, so an id never
leaves the session it was made in. One more than the largest id in use
cannot collide with anything, and needs no clock. After: ids `[1,1,2,2]`,
the groups separate, `ssNextIn(1)` null.

The odds were long — the two joins have to land on the same millisecond
modulo 100,000 — but the failure is silent, and the fix is one line.

### And the label

`A/2` printed the count raw: `مجموعة مركّبة A/2` on an Arabic screen where
everything else had been fixed. The **letter** stays Latin in every language,
the way `RPE` and `kcal` do — it is gym notation — and the count follows the
reader: `A/٢`. That was the only raw number left on the superset screen, the
pattern being every visible non-input element whose own text nodes match
`[0-9]`.

## What the supersets do, verified

The header comment claims a specific cycle. Driven, with a real pair:

    set on A   ->  currentEx 0 -> 1,  rest NOT started
    set on B   ->  currentEx 1 -> 0,  rest started

Which is exactly what a superset is: no rest between the pair, rest after
it, and back to the top rather than wherever the last set happened to land.
The claim in the code is true.

## Three rows of numbers you choose between, in Latin

The programme wizard asks three questions by putting the **value on the**
**button**: how many days a week, how many sets, how many reps. All three
rows printed the value raw, so an Arabic reader chose between `1 2 3 4 5 6 7`
on a screen that is otherwise entirely Arabic.

    ١ ٢ ٣ ٤ ٥ ٦ ٧     ·     ١ ٢ ٣ ٤ ٥ ٦     ·     ٥ ٦ ٨ ١٠ ١٢ ١٥ ٢٠

The value inside the `onclick` stays raw on purpose — that is code, not
text.

## The Arabic minute was the only one not abbreviated

The rest chips read `٢ دقيقة` — and Arabic’s dual for two minutes is
*دقيقتان*, so that looked like a missing plural. It is not. The key is
`{n} דק׳`, an **abbreviation**, and abbreviations do not inflect.

What was actually wrong is narrower and clearer once every language is laid
side by side:

    en  {n}s / {n} min      ja  {n}秒 / {n}分
    de  {n} s / {n} Min     zh  {n} 秒 / {n} 分钟
    ar  {n} ث / {n} دقيقة   <- abbreviated the second, spelled the minute out

**Arabic alone answered an abbreviation key with a full word**, and a full
word is what made the missing inflection visible. `{n} د`, matching its own
`{n} ث`. One word, one file, no new key, no code change.

## What I nearly reported, and why I did not

Mid-flow the wizard showed:

    🎉 מעולה! סיימנו אימון @. עכשיו אימון A.

`@` is char 64 — `String.fromCharCode(64 + curDayIdx)` with `curDayIdx` at
zero. The banner is guarded on `_wiz.days.length > 0` but the letter comes
from `curDayIdx`, so the two can disagree.

They cannot disagree **through the app**: every day-name pick does the push
and the increment in one statement. I had hand-built `_wiz` with
`days.length = 1` and `curDayIdx = 0` to skip ahead, and that state is
unreachable. Driven properly from the first step: *"סיימנו אימון A. עכשיו
אימון B."*

**Seeded state can manufacture a bug the app cannot reach.** Worth the two
minutes it cost to check, and worth remembering next time a shortcut through
a multi-step flow produces something startling.

## The wizard chain, verified

Driven through its own steps, in imperial, first click to last:

    typed 135 into a box labelled lb
    stored  baseWeight 61.235 kg
    the programme view’s box shows 135 again

And the programme is written to `fit_programs` with every weight in
kilograms. Nothing to fix — the chain was already right, including the
`edWeightVal` rounding fixed one pass ago, which is what makes the last line
read 135 rather than 135.28.

## Date.now() as an identity, checked across the file

After the superset collision, every `Date.now()` used as an id: meal pushes,
composed meals, goal sub-items, person memories, vision-board items, the
programme id. **None of them can collide**, and the distinction is worth
naming because it is what made the superset different:

> `Date.now()` as an id is fine. `Date.now() % N` is not — the modulo is
> what turned "never" into "every hundred seconds".

The two batch writers (`sayAdd`, the vision board) already disambiguate with
`+ i`. Everything else is one write per tap, and two taps cannot land in the
same millisecond. `deleteMeal` does filter by id, so a collision **would** be
silent and destructive — which is why it was worth checking rather than
assuming.
