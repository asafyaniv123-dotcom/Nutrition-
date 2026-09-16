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
את זה" was fair, so I stopped reading it off screenshots caught at random
moments and decoded it: Chrome's ImageDecoder, 250 frames, and for every frame
the mean luminance of the band just above the disc's centre minus the band just
below it. With light from above THAT NUMBER IS THE CURVATURE - a bulge is
bright on top and dark below, a dent is the reverse.

    top - bottom:   +21.6  ...  -37.9      IT FLIPS SIGN

**The surface does not deepen. It turns inside out** - convex at rest, concave
while pressed. That is why every attempt failed: I kept making ONE shape more
so, when the whole effect is that the shape REVERSES. It also retires the
question above - in / out was never a choice between two designs, it is the
two ends of one motion.

**The tonal range is eleven levels out of 255.** Four percent. Nothing ever
gets dark; the light only moves. That is what "ממש רך" meant, and it turns out
not to be a matter of taste but a number - mine was three times too contrasty.

**The flip is fast against the holds** - about twelve of the 250 frames, then
it sits. Quick and eased, never a slow fade, which is also why reading it as a
nine-second idle loop was wrong: the motion is a RESPONSE.

And at rest the dome is BLANK; the fingerprint appears only once it has
inverted. The pressed state REVEALS rather than merely responds. That is the
one thing deliberately not taken - the hub's label is how you know what it is,
so ours cannot go blank.

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
