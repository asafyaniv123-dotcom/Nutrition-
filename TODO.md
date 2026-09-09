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
- **cassava / manioc**, and **plantain** — nothing. Both are staples for a
  large part of the world and both are absent.
- **kimchi**, **polenta**, **tempeh** and **seitan** are not there at all.
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

**Three times now** a food recorded here as absent turned out to be present
under a name I did not search for — bacon, then ghee, then cheddar. The
lesson is not about any of those foods. It is that "the table does not have
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
