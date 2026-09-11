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
