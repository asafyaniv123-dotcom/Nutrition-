# coverflow-carousel.tsx

A row of square cards on a 3D ring. The centre card faces you. Its neighbours
tilt away and recede, and they fade the further out they sit. Drag or flick to
turn the ring and it settles on the nearest card. With `showCaption`, the
centre card's title, subtitle and a few label/value rows sit underneath.

This is the first entry here that is **code rather than a picture**. It came as
a shadcn/React/Tailwind component. The app is one vanilla-JS file, so nothing in
this folder is installed or imported. It is kept so the mechanism can be read.

## What Asaf said

> זה יכול להיות טוב לתצוגת תמונות של השבוע

Sent 19 September 2026.

## What to notice

**THE RAKE EASES OFF WITH DISTANCE.** Tilt and recession both follow
`distance ^ 0.56`, not a straight line. The first neighbour turns 44°, and the
second turns only about half again as much. A linear ramp folds the second card
edge-on and unreadable. This keeps three or four cards on each side legible,
and it is the reason the ring looks like a shelf and not an accordion.

**ONE NUMBER SETS THE SCALE.** Card width is a single CSS length. Spacing,
depth and perspective are all multiples of it, so the same feel holds on a
phone and on a desktop without separate tuning.

**THE LOOP HAS NO COPIES.** Each card's offset is folded to the shorter way
round the ring, and a card fades to nothing just before it jumps from one end
to the other. No cloned nodes, no reordering. That matters for photos, which
are the heaviest thing the app draws.

**IT MOVES WITHOUT RE-RENDERING.** Position is painted straight onto each
card's `transform` every frame. In this app that translates directly: a
`requestAnimationFrame` loop writing `style.transform`, with no `innerHTML`
rebuild while the finger moves.

**A FLICK CARRIES, BUT ONLY SO FAR.** Release velocity carries on for at most
two cards, then an ease-out settle with no spring overshoot. It is calm, and
that fits an evening screen.

## Where it applies

**The week in photos.** The reflection already keeps a photo per day
(`rfPhotoHTML`, `photoGet`) and a photo per flow. Seven days make a ring of
seven, with today in the centre. The caption area is where the day's own words
would sit: the date through `dfmt`, and a line from that evening's reflection.
That is a record, not metadata.

This is a view **to build**, not a skin for one that exists. There is no
screen today that shows a week of photos together.

## The hard parts

**Seven is a small ring.** A card jumps sides at half a turn, which is 3.5 for
seven, so only about three neighbours show on each side and the far ones are
already fading. Probably right for a week, but check it on a phone before
assuming it.

**A day without a photo.** Most weeks will have gaps. The ring needs an honest
empty card (the date, perhaps the day's colour or one line of text), not a
hole and not a stock image.

**RTL.** Left and right are hard-wired in the drag, the arrow keys and the
chevrons. In Hebrew and Arabic, yesterday belongs on the right. Time should
run the way the reader reads, so direction comes from the document.

**Keyboard and screen readers.** It has `aria-roledescription` and arrow keys,
which is a good start. The per-card label `"1 of 7"` is English and says
nothing. It should name the day through `_t`.

**Motion.** Nothing respects `prefers-reduced-motion`. The settle should snap
when that is set.

Related: [[activity-picker-arc]], the other "bring one to the centre" picker in
this library. That one chooses an activity; this one browses a record.
