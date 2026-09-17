# The screen map — what the new line contradicts, counted

Written overnight on 16–17 September 2026, for the design day. The home board
now carries a new visual line and nothing else in the app has heard it. This
document says **where the rest of the app disagrees with it, and how big the
disagreement is** — measured off the stylesheet rather than described from
memory.

It is a **map, not a redesign**. Nothing here has been restyled.

---

## The finding that changes the shape of the work

I expected to write "nine screens, nine passes". The census says otherwise.

    1,486 CSS rules in dev/index.html
      266 of them draw a SURFACE  (a background plus a radius, border or shadow)
      949 are shared vocabulary rather than belonging to any one area

**The redesign is not nine screens. It is a few dozen shared rules that all
nine screens are built out of.** Per-area rule counts, for the areas that have
their own:

| area | rules | radius | border | shadow | drop | loud (α≥.25) | gradient |
|---|---|---|---|---|---|---|---|
| shared | 943 | 240 | 68 | 64 | 58 | 18 | 62 |
| סיום יום | 134 | 32 | 10 | 7 | 7 | 3 | 10 |
| the home board | 87 | 24 | 3 | 33 | 28 | 14 | 28 |
| הארון | 80 | 18 | 7 | 4 | 4 | 0 | 2 |
| תזונה | 61 | 22 | 11 | 2 | 2 | 1 | 4 |
| תכנון זמן | 47 | 14 | 4 | 5 | 5 | 3 | 5 |
| כושר | 45 | 14 | 7 | 1 | 1 | 0 | 5 |
| היומן | 44 | 13 | 6 | 3 | 3 | 0 | 1 |
| chrome | 22 | 12 | 0 | 2 | 2 | 0 | 3 |
| האנשים שלי | 20 | 3 | 3 | 1 | 1 | 0 | 2 |
| תובנות | 3 | 0 | 0 | 0 | 0 | 0 | 0 |

Every number here is what `node tools/css-census.mjs` prints, so it can be
re-run after each pass and the numbers watched going down. **It counts rules,
not uses** - a rule applied once and a rule applied on every screen count the
same.

Two things fall out of that table immediately.

**The home board is already the loudest thing in the app** — 33 shadows and 14
of them at α≥.25, in 87 rules. That is the new line being *more* emphatic than
what it replaces, not less, which is consistent with what the hub measured:
twice the reference's curvature swing.

**תובנות has three rules — AND THAT TURNED OUT TO BE WRONG.** Photographed, it
has a full grid of coloured cards: its appearance is written in inline styles
rather than in the stylesheet, where no census can see it. See *The
photographs* below; the correction is what made the inline-style front visible
at all.

---

## The three contradictions, each with a number

### 1. Drop shadows — "an object on a plate" against "one surface"

    58 shared rules cast a drop shadow
    39 of the file's 122 box-shadow declarations carry an alpha of .25 or more

The hub's whole argument is that there is ONE surface and the light moves
across it. A drop shadow says the opposite: here is a separate object, and
there is a gap under it. The loudest offenders, all shared:

| α | radius | selector |
|---|---|---|
| .90 | 50% | `.td-dot` |
| .80 | 50% | `.hub-dot` |
| .75 | 50% | `.rfd-mark` |
| .55 | 14px | `.wkr-card` |
| .55 | 24px | `.rfd-card` |
| .45 | — | `.swipe-trash.hot` |
| .42 | 50% | `.fab-b` |
| .40 | 3px | `.ch` |
| .40 | 50% | `.vlog-dot` |

For scale: **the hub casts .32 at rest and .25 held**, and the census finds
**25 rules louder than that**. Two of the loudest are not a problem to fix:
`.hcards.nodes .hcard` at .95 and `.hcards.nodes .hhero` at .90 belong to
the עיגולים layout, which is not the one in use - though they are a fair
measure of how emphatic the board's older vocabulary was. The rest are live,
and `.hub-dot` at .80 is one of mine, written the same evening as the hub it
sits on.

### 2. Borders — a hard rim is the opposite of a lit edge

    55 shared rules draw a border
    only 3 rules draw a border AND a drop shadow

That last number is the interesting one: the app has already, accidentally,
split into two dialects. Some components say "I am an object" with a shadow,
others say it with a rim, and almost nothing does both. **They are two
vocabularies for the same sentence**, and the new line replaces both with a
third — an edge you see because the light stops, not because a line was drawn.

### 3. Radii — 34 values where a system has four

    392 border-radius declarations
     34 distinct values

The histogram is the argument:

    56 × 50%      44 × 14px     40 × 12px     28 × 13px     25 × 11px
    24 × 10px     23 × 20px     21 × 9px      20 × 16px     19 × 8px
    10 × 18px      9 × 3px       9 × 4px       8 × 2px       7 × 22px
    …and nineteen more, most of them used once or twice

**8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 32.**
Nobody can see the difference between 13px and 14px; those are not decisions,
they are accidents that accumulated. A scale of four or five — say 4 / 10 / 16 /
24 / 50% — absorbs the whole distribution, and the consolidation is mechanical
and reversible, which makes it the cheapest real improvement available.

---

## What that means for the order of work

**First, and it costs an afternoon: the radius scale.** Mechanical, reversible,
provable by reversing the patch (the technique that caught ten corrupted
declarations in the direction pass). It touches 723 declarations — 392 in the
stylesheet and 331 written inline in JS — and changes the app's feel more than
any single screen would.

**Second: pick one dialect for "this is an object" and delete the other.** 58
shadows against 55 borders is not a style, it is two styles. This is a decision
he has to make, not one to be measured — and it is the decision that decides
what every screen looks like afterwards.

**Third: the twenty-three that are louder than the hub.** Every drop shadow
above .32, minus the two that belong to the unused עיגולים layout. That
includes `.hub-dot` at .80, which I wrote.

**Fourth: תובנות — not because it is empty, but because it is inline.** Its
whole appearance is built in JS template strings, so writing the new line there
first tests the pass that actually has to happen across the app, on one screen,
where it is cheap to throw away.

**Not before the 23rd**, and none of it while the freeze is on except as
design work on `design/glass`.

---

## The photographs — and two corrections to everything above

All ten areas were photographed headlessly (`shoot-areas.mjs` in the session
scratchpad; no browser extension, no clicking — the injected script calls the
app's own `enterModule()`, which also reaches the closet, the one area with no
`?go=` route). Two of them overturned claims made higher up this page.

### CORRECTION 1 — "תובנות has three rules" is wrong

It has a full grid of coloured cards with accent bars. The census was not
lying; it was blind. **The area's entire appearance is written in inline
styles inside JS template strings** — `border-radius:20px`,
`box-shadow:0 4px 16px rgba(0,0,0,.06)`, and a background colour taken per
card from `INSIGHTS_CATS`. A stylesheet census cannot see any of it.

That opens a second front, and it is not small:

    1,406 inline style attributes in the app (the game excluded)
      424 of them set something VISUAL rather than layout
      331 inline border-radius declarations — against 392 in the stylesheet
      220 inline borders, 65 inline box-shadows, 402 inline backgrounds

**Forty-six percent of every radius in this app is inline.** A CSS-only pass
reaches barely half the surface, so the radius scale — item one on the list
above — has to be a pass over the JS template strings as well, or it will land
on half the app and look worse than doing nothing. Counting stylesheet and
inline together, the file holds **37 distinct radius values**.

### CORRECTION 2 — the app does not clip, my camera did

The first set of photographs showed every screen cut off down its right edge,
which in an RTL layout is where the text begins. That looked like a serious
bug. It is not one: asked directly, every area reports
`scrollWidth === clientWidth === 512`, and the only elements past the edge are
three decorative `.cloud` divs and an off-canvas drawer header, all deliberate.

Chrome headless had laid the page out at 512 CSS px while cropping the capture
to the 430 I asked for. **A screenshot is a measurement too, and it can be
wrong in exactly the way that makes you file a bug against the app.** The
re-shot set is at the width the page actually used.

### What the pictures show that the census could not

**The app changes worlds when you enter an area.** The board is a dark night
sky; every module is warm cream with white cards on it. That is not a shadow
alpha or a radius, it is two different design languages either side of one tap,
and no rule-count could have surfaced it. Whatever the new line becomes, this
is the decision it has to answer first.

**White card on cream is the house dialect**, and it is everywhere — תזונה's
progress panel, its three macro tiles, the water strip, the ask box; תובנות'
six category cards. Each is an object on a plate. The hub says the opposite:
one surface, curved by light.

**סיום יום opens nearly empty.** The spine of the product is a short card, two
thin rows beneath it, and then ground all the way to the tab bar. Whether that
is restraint or an unfinished screen is his call — but it is the first thing
the eye meets in the area that matters most, and the census said nothing about
it because there is nothing there to count.

---

## What this document does not know

**It read the stylesheet, not the screens.** A rule that draws a border might
be invisible in practice, and a screen can feel wrong for reasons no CSS census
can see — spacing, rhythm, where the eye lands. The headless pipeline built
tonight (`shoot2.mjs` and friends in the session scratchpad) can photograph any
screen without the browser extension, so the next pass should be pictures of
the six main areas, measured the way the hub was measured.

**And it counts rules, not use.** A rule used once and a rule used on every
screen count the same here. Weighting by how often each selector actually
appears in the markup would sharpen the priority order, and has not been done.
