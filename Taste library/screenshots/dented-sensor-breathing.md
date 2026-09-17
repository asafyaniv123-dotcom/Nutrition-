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

## Measured - IT INVERTS, and here is what by

Decoded with `tools/measure-gif.mjs`, which writes the per-frame series beside
this note. **Read the definition before quoting a number**, because two earlier
attempts at this section quoted figures from a measurement that was never saved
and both were wrong.

**THE DEFINITION.** Bare surface only: the annulus from 0.70R to 0.95R, and
within it the arc within 40 degrees of straight up against the arc within 40
degrees of straight down. Luminance of the upper arc minus the lower one. With
light from above that IS the curvature - a bulge is bright on top and dark
below, a dent the reverse - so **a change of sign means the surface turns
inside out** rather than merely deepening. The annulus matters: a band straight
across the middle works on a bare dome and fails the moment the object carries
a label, which is how our own hub once measured as "never inverts".

**THE REFERENCE:**

    curvature      -13.7 .. +41.4      sign changes twice per loop
    tonal range    2.2 of 255          0.9% - nothing darkens, the light moves
    the flip       ~190 ms             10-90 rise time, SYMMETRIC
    the holds      2.0 s convex, 2.4 s concave
    of a 5.00 s loop, 420 ms is spent moving

**OURS, measured the same way** (headless Chrome, PNG decoded in node - the
pipeline is in the session scratchpad and needs no browser extension):

                        reference     ours
    inverts?            yes           yes, +47.7 -> -64.4
    curvature swing     55            112          TWICE THE REFERENCE
    state change        2.2           3.6
    the flip            190 ms        190 ms  (.29s under our easing curve)

So the shape and the timing are right and **the contrast is about double**.
Scaling every alpha in the two hub rules by 0.55 lands the swing at 66 against
the reference's 55 - that variant is rendered and measured but deliberately not
committed, because it is a visible change to a button he approved.

**HOW THIS WAS GOT WRONG, TWICE** - kept because the failure is instructive and
will otherwise be repeated:

1. **Read off a console and never saved.** The first pass reported the swing as
   +21.6/-37.9, the tonal range as eleven levels, and the flip as "about twelve
   frames". All three were misquoted afterwards; there was no file to check
   them against. **Save the series.**
2. **A threshold is not a measurement.** The second pass timed the flip by when
   the signal left a plateau defined as 10% of the full range - and got 460 ms
   one way and 740 ms the other, an asymmetry that looked like a finding and
   went straight into the app's CSS. The same footage measured on a different
   part of the disc gave 260 and 260. **A number that moves when you change
   where you looked is not a property of the thing.** The 10-90 rise time,
   computed on each transition's own excursion, is 200/180/160 ms wherever you
   sample - so the motion is symmetric, and the asymmetry never existed.
3. And a CSS duration is not a rise time: under `cubic-bezier(.4,0,.2,1)` only
   46% of the duration is the visible 10-90 window, so `.19s` showed 87 ms of
   movement. The hub now uses `.29s cubic-bezier(.3,.2,.3,.8)`, where 65% is
   the window and the movement lands on the measured 190 ms.

At rest the reference's dome is BLANK; the fingerprint appears only once it has
inverted, so the pressed state REVEALS rather than merely responds. That is the
one thing deliberately not taken - the hub's label is how you know what it is.

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
