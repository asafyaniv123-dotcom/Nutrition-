# rocker-switch-toggle.mov

A two-second screen recording of a single control: a photoreal metal paddle
switch sitting in a pill-shaped well in a soft white panel. It is toggled once.

`rocker-switch-toggle-frames.jpg` beside it is a contact sheet of frames #18–#46
— the whole transition — because the clip is HEVC in a QuickTime container and
Chrome's `<video>` refuses to play it. (It decodes fine through WebCodecs, which
is how these frames were pulled; the sheet is here so the folder stays readable
without doing that again.)

## What Asaf said

> כאן אהבתי את הדרך היצירתית שהלחצן נלחץ. מאוד מעניין ומיוחד.

## What it actually does

**Nothing moves.** No element slides, nothing changes position, the pill stays
exactly where it is. The paddle **seesaws about its own centre** — one end rises
out of the well as the other sinks in — and the entire animation is carried by
the highlight travelling across curved metal. You read the tilt from the
*shading*. That is why it feels like an object rather than a graphic.

**The state flips at the halfway point, not at the end.** Read off the frames,
not guessed:

| frames | what is on screen |
|---|---|
| #18–#26 | tilted: left end raised, right end sunk. Indicator dot **grey** |
| #28–#33 | perfectly **flat** — the crease vanishes. Dot turns **green** here |
| #36–#46 | tilted the other way: right end raised, left sunk. Dot green |

**The green arrives while the paddle is level** — at the moment of commitment,
not on settle. The rest of the motion is the object catching up with a decision
already made. That is the whole idea, and it is the part worth stealing: it is
free, it works on any control, and it makes a slow animation feel instant.

**Timing:** about 21 frames of a 58 fps clip, so roughly 360 ms end to end,
with the green landing around 170 ms in.

**One colour in the entire frame.** Everything is grey metal and white panel
except a single small green dot. Same rule as
[[liquid-glass-panel]] and [[neumorphic-calendar]], taken to its limit: colour
appears once, and only to say *on*.

## What connects it to the rest of this folder

The panel is the same soft, matte, near-white ground as
[[neumorphic-calendar]], and the well the paddle sits in is a pressed-in shape
in exactly that vocabulary. That is now two separate references pointing at the
same surface — which is worth noticing, since it stands against the glass ones.

It also belongs with [[activity-picker-arc]]: both are about **physical
feedback**. And the constraint recorded there matters more here — on an iPhone
PWA there is no haptic, so the feeling has to be carried entirely by the eye.
That makes an animation like this *more* valuable in this app than it would be
in a native one, not less.

## What is buildable and what is not

**Not buildable:** the metal. Those specular highlights on a curved brushed
surface are a 3D render. CSS has no way there. A pre-rendered sprite sequence
could fake it, but the app is a single 1.1 MB file with a service worker that
caches nothing by design, so a sprite sheet is an expensive thing to carry.

**Nearly free:** the mechanic. A rocker that pivots is `perspective` plus a
`rotateX` on a pseudo-element — no images, no library, and it composites on the
GPU. The tilt would read as flat-shaded rather than photoreal, which is honest
for this app anyway.

**Completely free, and the actual prize:** flipping the state at the midpoint of
the animation instead of at its end.

## The caution

A 360 ms animation is generous for a control you press once. It is a long time
for one you press six times in a row — and the habit list is exactly that. A
demo always shows a single toggle in isolation, which flatters an animation more
than daily use will.

The likely answer is to keep the midpoint trick everywhere and spend the full
motion only where a toggle is rare and deliberate.
