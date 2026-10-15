# Character sheet prompts — the sun

Three prompts for a 3D image generator, one grid per image. They exist because
the generic model-sheet template gets three things wrong about **this**
character, and each wrong answer is a design that was already rejected:

- **He is a sphere with no back.** A turnaround of a sphere has the same
  silhouette from every angle; only the eyes travel across the surface, and from
  behind there is nothing to draw. Left alone, a generator puts a face on the
  back of his head.
- **His blink is not an eyelid.** It is the dark oval itself compressing
  vertically into a thin bar. Eyelids were shown and rejected in as many words.
- **He has no limbs.** "Running" and "jumping" for a limbless sphere are rolling
  and a squash-and-stretch hop. Left alone, a generator grows him legs.

Every number below is measured from the shipped character (`sun-char.js`,
lifted from `sun-final.html`), expressed as a ratio of the body radius so it
survives any output size:

| | value | as a ratio of the body radius |
|---|---|---|
| body radius | 34.2 | 1.00 |
| inner ring (red) | 41 | 1.20 |
| middle ring (orange) | 47.5 | 1.39 |
| outer ring (yellow) | 54 | 1.58 |
| dot diameter | 2.6 | 0.076 |
| dots per ring | 26 | — |
| eye azimuth from centre | ±22° | — |
| eye size | rx 5.4, ry 11.4 | 0.16 × 0.33 |

---

## The character block

Every prompt below starts with this. **Replace the whole block to use a
different character** — nothing else in the prompts names him.

> A friendly sun character. A single smooth sphere with a warm vertical gradient
> running from pale yellow #FCD956 at the top, through amber #F8AE34, to deep
> orange #E5530E at the bottom, with gentle warm darkening at its outer edge and
> one broad soft highlight at the upper left. The surface is soft and matte, not
> glossy or metallic.
>
> It has NO mouth, NO nose, NO eyebrows, NO eyelids, NO arms, NO legs, NO rays
> and NO spikes. Its only facial features are two tall dark-brown vertical oval
> eyes, colour #32200F, set symmetrically about 22 degrees either side of the
> centre of the face. Each eye is about three times taller than it is wide — its
> width is about 0.16 of the sphere's radius and its height about 0.33 — and
> carries one small white catchlight near its upper inner edge.
>
> Floating around the sphere are three concentric rings made of small separate
> round dots: the innermost red #F04A2E, the middle orange #F9913C, the outermost
> yellow #FCD238. Each ring has 26 evenly spaced dots. If the sphere's radius is
> 1.0, the three rings sit at 1.20, 1.39 and 1.58, and each dot is about 0.076
> across. The rings never touch the sphere and never touch one another.

---

## 1 · Turnaround sheet

> [CHARACTER BLOCK]
>
> Produce a character turnaround model sheet as a single image: one horizontal
> row of exactly four views of this same character, evenly spaced, all at the
> same scale and on the same eye level.
>
> From left to right: FRONT view, with both eyes fully visible and symmetrical
> about the centre. THREE-QUARTER view turned 35 degrees to its left, where the
> near eye stays full width and the far eye is compressed to roughly two thirds
> of its width as it approaches the edge of the sphere. PROFILE view turned 90
> degrees, where only ONE eye remains visible, narrowed to a slim oval near the
> edge of the sphere, and the second eye has passed out of sight around the
> curve. BACK view, where NO EYES AT ALL ARE VISIBLE — the sphere is completely
> blank, because both eyes are on the far side.
>
> Critical: this character is a sphere, so its outline is an identical circle in
> all four views. Nothing about the silhouette changes. Only the eyes move
> across the surface, and they narrow as they approach the edge rather than
> sliding off it. The rings of dots stay concentric and unchanged in all four
> views. Do not draw a face on the back view.
>
> Style: clean modern minimalist 3D render, Octane render, smooth matte
> textures, soft diffuse studio lighting from the upper left, gentle ambient
> occlusion, no hard shadows, no reflections. Pure white background. No text, no
> labels, no numbers, no frames, no ground plane.

---

## 2 · Expressions and blink sheet

> [CHARACTER BLOCK]
>
> Produce an expression model sheet as a single image: a grid of exactly eight
> views of this same character, in two rows of four, all at the same scale, all
> facing front.
>
> TOP ROW — four expressions, built only from the shape of the two dark eyes,
> since this character has no mouth and no eyebrows:
> 1. CALM — both eyes as full tall ovals, looking straight ahead.
> 2. HAPPY — each eye becomes an upward-curving arc, like a smile turned on its
>    side, drawn as a thick rounded stroke in the same dark brown.
> 3. CURIOUS — both eyes full ovals, both shifted slightly to one side as if
>    glancing, and the whole head tilted about 10 degrees.
> 4. SURPRISED — both eyes widened into larger, rounder shapes with bigger
>    catchlights.
>
> BOTTOM ROW — a four-step blink, and this is the part that must be exact:
> 5. OPEN — the eye at full height.
> 6. THREE-QUARTERS — the same oval compressed vertically to about 70% of its
>    height, keeping its full width.
> 7. HALF — compressed to about 35% of its height, still full width, now a
>    squat lens shape.
> 8. CLOSED — compressed to a thin horizontal bar of the same dark brown, about
>    6% of the original height, with rounded ends and still the full width.
>
> Critical: the blink is the EYE SHAPE ITSELF being squashed vertically. There
> is no eyelid, no lash, no skin flap and no lid sliding down over the eye. The
> dark oval simply flattens in place, as if scaled on its vertical axis only,
> and its width never changes.
>
> Style: clean modern minimalist 3D render, Octane render, smooth matte
> textures, soft diffuse studio lighting from the upper left, no hard shadows.
> Pure white background. No text, no labels, no numbers, no frames.

---

## 3 · Movement and action sheet

> [CHARACTER BLOCK]
>
> Produce an action pose model sheet as a single image: a grid of exactly six
> poses of this same character, in two rows of three, all at the same scale.
>
> 1. ROLLING — moving to the left at speed, the whole body leaning about 12
>    degrees into the direction of travel, the rings of dots rotated as if they
>    have rolled with him, and the face staying upright and level.
> 2. ANTICIPATION — crouched before a jump, the sphere squashed to about 85% of
>    its height and widened to compensate so its volume looks unchanged.
> 3. AIRBORNE — at the top of a jump, the sphere stretched to about 112% of its
>    height and narrowed to compensate, a small soft shadow far below him.
> 4. LANDING — flattened on impact to about 80% of its height, the rings still
>    descending slightly behind him as if they have not caught up yet.
> 5. FLOATING — hovering calmly, perfectly round and undeformed, the three rings
>    drifting at a gentle tilt around him, a soft wide shadow on the ground
>    directly beneath.
> 6. TURNING — caught mid-turn toward his left, the near eye full width, the far
>    eye compressed to about half its width as it nears the edge of the sphere.
>
> Critical: this character has NO ARMS and NO LEGS, so he does not run or walk —
> he rolls, hops and floats. Do not add limbs, feet, hands or a mouth to any
> pose. He changes shape only by squashing and stretching, and when he squashes
> he widens and when he stretches he narrows, so that he always looks like the
> same amount of material. The rings of dots stay separate from the body in
> every pose.
>
> Style: clean modern minimalist 3D render, Octane render, smooth matte
> textures, soft diffuse studio lighting from the upper left, soft contact
> shadows only. Pure white background. No text, no labels, no numbers, no
> frames.

---

## What to expect, honestly

**Four cells in one image is reliable; eight is not.** Image models lose
consistency as the cell count rises — faces drift, scale wanders, cells merge.
Sheet 1 (four cells) should come back usable. Sheets 2 and 3 (eight and six)
will probably need two or three attempts, or splitting into two images of four.
If a sheet comes back muddled, **split it before rewriting it** — the prompt is
usually not the problem.

**Ask for no text.** Every generator garbles labels, and a model sheet with
misspelt labels is worse than one with none.

**A reference image beats all of this.** These prompts describe the character in
words because that is what a bare generator accepts. Where the generator takes a
reference image — `gpt_image_2_5` does — hand it `dev/look/sun-ref.png` as well
and the description becomes a correction rather than a specification. Every
useful result we have had so far came that way.
