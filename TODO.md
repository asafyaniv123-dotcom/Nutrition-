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

### 1. Seasons — the small one

> לחלק את הארון לפי עונות (חורף, קיץ, סתיו, אביב)

A field per garment and a filter over it. Nothing in the app stores a season
today — the only mention of the word is a comment. Two decisions to make when
building it rather than now:

- **A garment can belong to more than one season.** A plain tee is summer and
  a layer in winter, so this is a set and not a single choice.
- **A season is not a date.** The app should not decide it is winter and hide
  half the wardrobe; the season filters what you are *looking at*, and the
  current one is a sensible default rather than a rule.

### 2. Share the look — mostly plumbing that exists

> אפשרות לשתף את הלוק הנבחר ברשתות או בהודעות או בווצאפ לחבר

`navigator.canShare({files:[file]})` is already used to share a backup, so the
hard half — handing a real file to the OS share sheet, which is what puts
WhatsApp and Messages in the list — is proven in this app on this phone.

What is missing is the picture. There is nothing to share until the look can be
drawn to a canvas as one image, which means **this depends on item 3** and
should be built immediately after it, reusing the same layout code.

### 3. The look summary — a design pass, buildable now

> סיכום של הלוק כמו בתמונה בפינטרס

Fully analysed in `Taste library/screenshots/selected-look-flat-lay.md`. Short
version: a saved look renders today as `.cl-fit-row`, a horizontal row of
equal-sized thumbnails in category order. That is a list, not a look.

**Build the arrangement first, without cut-outs.** Size and place each photo by
category — top wide and high, trousers tall and centred, shoes small and low,
accessories in their own column — so the composition carries the body even while
every photo is still a rectangle. If that reads as an outfit, item 4 was never
the point. If it does not, we will know exactly what is missing.

### 4. Cutting the garment out — the hard one

> אפשרות להעלות צילומים ולחתוך בצורה מדוייקת באופן חופשי את הבגד, AI שמזהה את
> הבגד ומוריד את הרקע שלו. במידה והבגד נחתך שתהיה אפשרות לעשות מחיקה באופן ידני
> ותיקונים.

Three parts, and the middle one is the problem.

**Free-hand cropping** is buildable today. The app already runs a crop flow
(`_cropQ`, `cropNext`, `cropThumb`) and already paints to canvas in several
places; a lasso is a path on a canvas and a clip.

**Manual erase and repair** is the same machinery — a brush over the alpha
channel — and is genuinely needed whatever the automatic step turns out to be,
because no cut-out is right every time. Worth building **before** the automatic
step rather than after: with the eraser in place, an imperfect automatic result
becomes a starting point instead of a failure.

**Automatic background removal is not currently possible in this app**, and the
reason is worth writing down rather than discovering later:

- There is no browser API for it. Safari and Chrome do not expose one.
- On-device segmentation needs a real model. The usable ones are 5–25 MB of
  WASM plus weights, downloaded to a phone, for an app that is one HTML file.
- **The app's only AI call does not work.** `fetch('https://api.anthropic.com/v1/messages')`
  in the workout-plan builder sends `Content-Type` and nothing else — no
  `x-api-key`, no `anthropic-version`, and there are zero occurrences of any of
  those headers anywhere in the file. It cannot succeed, and a browser cannot
  call that endpoint directly anyway. Its `.catch` shows *שגיאה בבניית התוכנית*,
  which is what that feature has always done.

So the honest order is: **crop → erase → then decide about automatic.** By the
time the first two are built we will also know whether the arrangement in item 3
needs cut-outs at all, which is the question that decides how much this is worth.
