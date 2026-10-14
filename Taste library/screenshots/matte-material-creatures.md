# matte-material-creatures-1.png · -2.png

Two creatures, sent together. **-1** is a tiny star-fairy in a cream hood with
dusty-blue wings, holding a star that has its own two dot eyes; matte, almost
felted, muted. **-2** is a cloud blob with a blue-to-pink gradient body and two
glossy white eyeballs with large black pupils, on a plain pale ground.

## What Asaf said

> כאן בשניהם אהבתי את המימד והחומר שיש ליצורים האלה.

Sent 14 October 2026. The word is **material**, not shape and not colour.

## What to notice

**NEITHER HAS AN OUTLINE AND BOTH HAVE WEIGHT.** The form is held entirely by
shading: a broad soft light from one side, a gentle darkening where a surface
turns away, and a small contact shadow underneath that sits the creature on
something. No line anywhere.

**THE SURFACE IS MATTE, NOT SHINY** — in -1 completely, in -2 everywhere except
the eyes. There is no sharp specular hit on the body, which is what makes both
read as *soft* rather than as plastic. -1 goes further and reads as felt or
unglazed clay: the highlight is enormous and faint rather than small and
bright.

**THE PALETTE IS MUTED AND NARROW.** -1 is cream and dusty blue and nothing
else. -2 is one gradient across the whole body. Neither uses more than two
hues, which is part of why the material reads at all — a busy palette would
be read as decoration instead of as substance.

**AND THE EYES ARE THE OPPOSITE DEVICE IN EACH.** -1 has two tiny dots and a
nose, almost nothing, and all the character comes from the silhouette and the
material. -2 has large glossy eyeballs that STAND PROUD of the surface, with
white, pupil and a highlight. **This is also the opposite of
[[cutout-eyes-cloud]]**, where the eyes are holes cut INTO the body. Three
references, three different eyes — and the eye is the most identity-defining
decision there is, so it cannot be averaged.

## Where it applies

**The sun's body, not its shape.** Our sun today is a flat disc with a radial
gradient, a white specular ellipse and a drop shadow. It has light on it; it
does not yet have WEIGHT. What these two have and it does not: a contact
shadow, a turning surface, and a highlight that is large and soft rather than
small and bright.

## The hard part — and after six references this is now the question

**EVERY REFERENCE HE HAS SENT IS A 3D RENDER, AND HE HAS NOW SAID OUT LOUD
THAT THE MATERIAL IS THE PART HE LOVES.** Earlier in this folder I wrote "take
the face, leave the material". That is no longer available: the material is the
ask.

Which makes the real decision a technical one rather than an aesthetic one,
and it has to be made before anything is generated:

- **Depth inside SVG.** Radial gradients, an inner shadow, a soft contact
  shadow, a wide faint highlight. Gets a long way toward clay, stays one file,
  keeps breathing, spinning and recolouring. Will not be a render.
- **A rendered PNG for the still places** (splash, welcome, app icon,
  notification badge) with a simpler SVG twin for the 22px loader and the hub.
  Real material where it shows, but TODO already warns that the icon and the
  character must not split into two drawings.
- **Lottie**, which is the only way to get a rich character animation of a
  rendered creature. Already costed in TODO and set aside: ~35KB player plus a
  JSON per animation plus a fetch, against an app that is one file with no
  caching on purpose so it works in a basement gym.

Related: [[dont-rebuild-a-render]] — three CSS versions of an approved image,
three rejections. That is the failure mode this decision exists to avoid.
