# alpine-meadow-morning.jpg

**Asaf's own photograph.** A steep green meadow in the foreground, a dark
forested ridge behind it, hazy mountains beyond, clear morning sky.

> התמונה השנייה ששלחתי לך היא תמונה מקורית שאני צילמתי ומאוד אוהב.

This is the first thing in this folder that is not a reference to somebody
else's work. It is **material** — something that could actually end up in the
app — which is why it lives in its own directory rather than in `screenshots/`.

## What the file is

Read out of the JPEG itself, not guessed:

| | |
|---|---|
| pixels | 4032 × 3024 |
| bytes | 2,842,746 |
| camera | Apple iPhone 14 |
| taken | 2025-06-30, 07:24 |
| EXIF orientation | **6 — rotate 90° CW** |
| GPS | **none** |

**No location is embedded.** Worth stating plainly, since this folder is served
publicly: the file gives away the phone and the morning, not the place.

**It is a portrait photograph stored sideways.** The orientation tag is what
makes it upright, which browsers honour in an `<img>` or a CSS background — but
**not** when a photo is drawn into a `<canvas>`, where it comes out on its side
unless asked otherwise. If this is ever used behind a screen, bake the rotation
in rather than relying on the tag.

## What it is like as a background

**It is bright, and that is the problem to solve.** The sky and the sunlit grass
are near-white in places. White text over it disappears; the reference screen it
was sent with uses white text, which works there because that photo is dusk-dark.
Either the frost has to be heavier than in the reference, or the text goes dark,
or the crop favours the shaded ridge.

**It has one hard edge.** The horizon and the tree line are the only sharp
boundaries in the frame, and a card straddling either of them will look like it
is cut in half. There is a lot of quiet grass to sit over instead.

**It is green and blue.** The app is warm — cream ground, violet accent. This is
now the third time the same tension has come up ([[liquid-glass-ui-kit]],
[[liquid-glass-panel]]). The difference is that those were other people's
palettes and this one is his own photograph, which makes it the stronger claim:
if this picture is the door, the app's colour probably follows it rather than
the other way round.

## If it ever ships

Keep this file as the **master** and never edit it in place. What would ship is
a derivative: rotated, EXIF stripped, cropped to the phone's aspect, and resized
to something like 1200 px wide — a few hundred KB instead of 2.8 MB.

That matters more here than in most apps. The whole app is one 1.1 MB file with
a service worker that caches nothing by design, so an inlined base64 photo would
add its size plus a third again to **every load**. The right shape is a separate
file next to `assets/logo.png`, referenced through `appBase()` the way the
opening sound already is, so the browser caches it once and the app file does not
grow at all.
