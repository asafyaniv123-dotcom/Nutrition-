# dented-sensor-breathing.gif

A fingerprint sensor, rendered as a soft circular DEPRESSION in a matte
blue-grey surface. The fingerprint itself is embossed into the dent in the same
material - no colour, no outline. Below it, one tiny green LED. The whole thing
breathes: the light across the dent shifts slowly, the ridges fade in and back,
and the LED pulses. It never resolves into a state; it just keeps being alive.

## What Asaf said

> ראו את ה-GIF הזה

Sent 16 September 2026, in the middle of arguing about whether the hub should
go INTO the page or bulge OUT of it - which turns out to be the wrong question,
and this is the answer.

## What to notice

**THE DEPTH IS IN THE MOTION, NOT IN THE GRADIENT.** This is the thing worth
taking. Every attempt at the hub today looked fake for the same reason: a
STILL gradient reads as a picture of a curved thing. Here the highlight MOVES
across the surface, and the eye reads curvature from how light travels rather
than from where it sits. That is why this one frame looks real and my frames
did not.

**THE CONTROL IS A DENT IN THE MATERIAL, not an object on it.** Nothing is
drawn: no card, no border, no fill, no shadow under a shape. There is one
surface, and a place where it is pressed in. The affordance IS the dent.

**THE SURFACE HAS GRAIN.** A faint brushed noise across the whole frame. It is
most of why it reads as a real material - a perfectly smooth gradient is
always a screen, and a gradient with grain is a thing.

**THE MOTION IS BREATHING, NOT A TRANSITION.** It has no start and no end
state, and nothing is being reported. It says "on, and waiting" - which is a
completely different sentence from "something happened".

**AND ONE POINT OF COLOUR IN THE ENTIRE FRAME.** A green dot the size of a
full stop, pulsing. Everything else is one hue. Related to
[[lit-when-done]] - the same discipline, where one small light does all the
work because nothing else is competing.

## Where it applies

**סיום יום, at the centre of the home board.** We spent an afternoon on it: he
asked for it recessed, then for it to bulge out, and disliked both because a
static gradient cannot carry either. This says the answer is neither shape - it
is a slow-moving highlight on a grainy surface, and the shape stops mattering
once the light moves.

**And it is the right thing for that particular button to say.** The
reflection is the one thing in the app that waits for you every evening. "On,
and waiting" is exactly its sentence, and a breathing surface says it without a
badge, a count or a nag.

## Decoded, 16 September 2026 - IT INVERTS

Three versions built off this reference all felt wrong, and "אתה צריך ללמוד
את זה" was fair, so it was decoded rather than eyeballed. **The numbers below
are the second measurement**, made in node from the file itself - GIF LZW,
frame disposal, no dependencies - with the per-frame series saved beside this
note as `dented-sensor-breathing.series.json` and the decoder kept as
`tools/measure-gif.mjs`. The first pass was done in a browser and its series
was never saved; **its three figures were all wrong** and are recorded at the
bottom of this section so nobody restores them from memory.

For every frame: the mean luminance of a band above the disc's centre minus a
band below it. With light from above THAT NUMBER IS THE CURVATURE - a bulge is
bright on top and dark below, a dent is the reverse. The disc finds itself, as
the bounding box of every pixel that moves across the loop (700x525 frame,
centre 352,287, r=111).

    top - bottom:   -29.5  ...  +8.0      IT FLIPS SIGN, twice per loop

**The surface does not deepen. It turns inside out** - and the two states are
NOT mirror images. The dent is deep and the bulge is slight, four to one. What
this thing mostly is, is dented; the convex state is a brief release from it.

**The loop, measured:**

    concave, held        1460 ms   (and 280 ms more at the loop's start)
    rising to convex      460 ms
    convex, held         2020 ms
    sinking to concave    740 ms

**IN IS SLOWER THAN OUT.** 740 ms to sink, 460 ms to return - and both are
three to four times slower than the 190 ms I had guessed for our own button.
Softness here is not only low contrast, it is TIME.

**The tonal range is 3.8 levels out of 255. One and a half percent.** Nothing
gets dark; the light only moves. That is what "ממש רך" meant - and it is even
softer than the first measurement claimed.

And at rest the dome is BLANK; the fingerprint appears only once it has
inverted. The pressed state REVEALS rather than merely responds. That is the
one thing deliberately not taken - the hub's label is how you know what it is,
so ours cannot go blank.

**What the first, lost measurement got wrong** — kept as a caution, not as
data: it reported the swing as +21.6 to -37.9 (the direction was right, the
magnitudes were not), the tonal range as eleven levels rather than 3.8, and
the flip as "about twelve frames" - 240 ms, when it is 460 and 740. A number
read off a console and not written down is a number you will misquote.

## What is still open - the held finger

The tap is answered now. The HELD finger is not, and he asked for it the same
evening: a long press should say something of its own - the thin rim colour
travelling around the button, or the centre carried softly further in - because
the gesture it answers is someone who **has not decided where to press yet**.

**And it keeps answering for as long as the finger stays down** - a sustained
response with no completion moment, not a second state reached at 400ms. Which
is the closest thing yet to what this reference actually does: it never
resolves, it just keeps being alive under attention.

That is a different sentence from "something happened", and it is the same
sentence this reference spends its whole loop saying. Whatever gets built has
to stay inside the numbers above: eleven levels, and nothing that arrives as a
second effect on top of the first. The specification, the cancel cases and the
three platform traps are in TODO.md under *A long press is its own state*.

## The hard part

**A continuous animation is not free.** It repaints forever, on a phone, in a
1.25 MB page. A slow transform or background-position loop on ONE element is
cheap; a filter or box-shadow animated on every frame is not, and the
difference is measurable rather than a matter of opinion - it has to be checked
on a real phone, not asserted here.

**Grain is the expensive part visually.** A noise texture is a real image or an
SVG filter, and both cost. An SVG feTurbulence at low opacity over one circle
may be enough; the whole page does not need it.

**And it must know when to stop.** prefers-reduced-motion is not optional for
something that never stops moving.
