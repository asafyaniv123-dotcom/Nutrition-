---
name: exercise-animation
description: Build one exercise animation for the library (exercise-sheets/) - Asaf's rules for the glowing figure, the locked 3D pose, the static equipment, the active-muscle glow and the checks, in order. Use whenever Asaf sends exercise pictures or a recording, or asks to make, fix or redo an exercise demo.
---

# Exercise animation - the rules, in order

Every rule here was a rejection first. Go through the steps in order for EVERY exercise; do not skip one because
the last exercise did not need it. Talk to Asaf in Hebrew only, every line, and end every result with a link.

## 0. Before anything
- Identify the exercise from his reference. It exists in `data/exercises.json` (find by name) or is added
  (`tools/build-exercises.mjs` row + `exercise-names-3.mjs` + `exercise-howto.mjs` + `exercise-howto-en.mjs`,
  rebuild, prove no existing row changed, `node tools/test-exercise-search.mjs` 118/118).
- Write down the ACTIVE MUSCLES: the PRIMARY one is the library row's first muscle (`m[0]`) - it MUST glow,
  most of all, in every frame. Then the helpers from the reference's red highlight. Decline push-up: CHEST
  first (`m` = חזה), then front shoulders and triceps; pike push-up: shoulders, triceps. x20 was sent with
  the shoulder and triceps lit and the chest dark - Asaf: "the chest is what this exercise works".
- When the camera hides part of the primary muscle (the chest under a push-up), the visible part of it still
  glows - its side and underside between the arm and the floor - and the prompt names it first and says
  "clearly visible".
- Watch the WHOLE recording on a dense contact sheet, not two stills. Note: start pose, end pose, what stays
  still for the whole rep, the equipment and its exact size and height relative to the body.

## 1. Measure the reference - copy it, do not interpret it
- The equipment height, length and position relative to the body come from HIS frames, measured in pixels
  against a body length (e.g. bench top height / shoulder-to-ankle length). Never pick a "reasonable" value.
- Body angle, joint angles at the start and the end, where hands and feet touch: measured from his frames.
- The camera angle matches his.

## 2. Static background FIRST (before designing the figure)
- The equipment and the floor are made ONCE and are pixel-identical in every frame. In the 3D scene the bench,
  box or wall is modelled at the measured size; in the final frames it must not be redrawn per frame:
  generate the empty scene once (or take it from the 3D render) and place each figure on it
  (`tools/sheets/place-on-bg.mjs`, figure generated with `background: transparent`).
- A redrawn bench whose edge doubles in the crossfade is a rejection, however small.

## 3. Pose in 3D (Blender + MPFB, `tools/3d/`)
- `make-man.py` (sheet proportions), `shorts.py` (short, tight), a `pose-<exercise>.py` that IK-pins hands and
  feet to fixed points: they cannot move between frames by construction.
- Render top and bottom (and in-between frames if the rep needs them). Compare side by side with his frames
  at full size before going on. Fix the pose in 3D (free), not with credits.
- The guide render must be SMOOTH: plain material, no curvature/pointiness shading. Every crease the guide
  shows comes back as a wrinkle in the drawing - x20 came out lumpy and "rough" for exactly this reason.
- Shrink the ears and flatten the face in the 3D head (MPFB `ears/` and `head/` targets): the drawing copies
  them from the guide however hard the prompt says "no ears".

## 3b. The method that worked (x20 decline push-up, 7 Nov - "much better")
1. Measure his reference (bench height = feet level with the shoulders at the top; depth at the bottom).
2. `pose-<exercise>.py` renders top, bottom AND the empty scene (man hidden) from the same camera.
3. ONE generation: the empty scene -> the styled empty background (bench drawn once).
4. ONE generation, 21:9, `resolution: 2k`, `background: transparent`: both 3D poses side by side as the guide
   (`hstack` + pad to 21:9) -> both figures drawn together, so the man keeps one size.
5. `node tools/sheets/split-fig.mjs <pair> <left> <right>` - cuts at the empty column, each figure WHOLE
   (cropping at the guide's panel edges cut the head off).
6. Seat each figure on the background by its contacts (toes on the bench, hands on the floor): scale and
   offset from the two anchor points (`tools/sheets/anchor-align.mjs` measures them).
7. Add the halo back (a blurred copy of the figure under it): a transparent figure loses its glow.
7b. Match the colour to x19 before compositing: run tone-check on a first composite, then scale the figure's
   channels by approved-mean / ours-mean (`colorchannelmixer=rr=..:gg=..:bb=..` on the rgba figure). x20 came
   out 3 degrees too yellow and passed after rr 0.97, gg 0.915, bb 1.06. Uniform grading only.
8. Framing: if a seated figure runs past the frame (x20's head did), never shift the shot - that pushes
   the equipment out. Extend the background (stretch its plain edge strips right / top), composite on the
   bigger canvas, and scale the whole frame down to 1024: equipment, figure and margins all stay in.
9. check-sheet, tone-check (step 5), gif, review.

## 4. The figure - our character, always the same (the design does not drift)
- The LOOK is the approved exercise frames, not a new interpretation: smooth translucent skin lit from
  inside, yellow-gold (not orange), a bright gold rim and a soft halo, NO wrinkles, NO bumpy or rough texture.
  Primary style reference: an approved frame (x19 job `2b2c3f25-3b27-4735-8b60-2a7bb7cce653`, x13).
  Body reference: the approved character sheet, job `54d6e9b8-b02b-472c-8e93-393483523fd6`
  (`exercise-sheets/character/sheet-2.jpg`). x19 is also the shorts reference.
- Prompt words for the skin: "smooth glowing translucent skin lit from within, soft inner light, no wrinkles,
  no bumps, no rough texture, yellow-gold like image N".
- His word for the look is CLEAN (7 Nov, x20): smooth, soft, clean surfaces - not lumpy, not grainy, no
  speckle. Two things made it lumpy and are not used any more:
  1. `background: transparent` - the model draws a figure alone on transparency noisier, with dotted speckle
     at the edges and on the shorts. Generate on a plain dark background like the approved frames, and lift
     the figure off it by brightness (`tools/sheets/luma-key.mjs`): the figure glows, the ground is dark,
     so the matte is clean and the halo comes along.
  2. A lumpy 3D body - the drawing copies the guide's bulges. Keep the guide man smooth (muscle macro ~0.7).
- Smooth bald head: NO face, NO ears, NO facial details - in every frame, including the bottom one where the
  head turns toward the camera. Barefoot with toes, never shoes. Short, tight shorts ending high on the thigh.
- Body proportions of the sheet: broad shoulders, V-taper, narrow hips, compact glutes, normal head size.
- GLUTES AND SHORTS are part of the look (x20, 7 Nov: "what is this backside?"): the shorts sit smooth and
  tight over round, firm, clean glutes, like the approved frames - no folds, no creases, no bunched fabric,
  no lumpy or saggy seat, a clean hem. Prompt: "smooth tight shorts fitted cleanly over firm rounded glutes,
  no folds or wrinkles in the fabric". The 3D shorts are cut tight and smooth for the same reason.
- Glow: ONLY the active muscles from step 0, clearly brighter, moderate, not blown out, no hot spots.
- Each frame = the 3D render as image 1 (pose, camera, contacts) + the sheet as image 2 (+ x19 for shorts).

## 5. Check before he sees it (`tools/sheets/check-sheet.mjs`)
Fail any one = not sent; fix first (one paid retry per defect, then stop and ask).
1. Pose and angle vs his frames, start and end, full size.
2. Equipment: same size/height as HIS reference, and identical in both our frames (overlay shows no double edge).
3. Hands and feet: same pixels in both frames (zoom both).
4. Head: no face, no ears, same tilt.
5. Glow: the PRIMARY muscle (library `m[0]`) glows clearly and most, in both frames; the helpers glow less;
   nothing else glows; moderate, no bright spot elsewhere. Name the lit muscles in the report to Asaf.
5b. Glutes and shorts: a close crop next to an approved frame - smooth, tight, clean, no folds.
6. Bare feet, short tight shorts, sheet proportions.
7. What is held still through the rep stays still; full range of motion.
8. Whole body and equipment inside the frame with a margin.
9. THE LOOK matches the approved frames: `node tools/sheets/tone-check.mjs exercise-sheets/x19-incline-push-ups/start.jpg <ours...>`
   (hue within 1 degree, saturation within 0.02) AND a side-by-side crop of the same body part next to an
   approved frame, looked at up close - colour, smoothness, rim, halo. The numbers passed x20 while his eye
   saw "more orange and rough"; the crop is what shows it, so the crop is mandatory.

## 6. Deliver
- `node tools/sheets/gif.mjs <start> <end> exercise-sheets/<id>-<slug>`; progress.json status `frames`
  (several attempts: `tries`); check `review.html` in headless Chrome; commit by path; push; wait until the
  page is live (nudge Pages with an empty commit only if it did not build); send the link.
- Report in Hebrew: what passed, every known defect, the cost. End with מחכה לך.
- Approved -> `done`, copy `anim.mp4` to `assets/exdemo/<id>.mp4`, add `<id>:1` to EX_DEMO in `dev/index.html`,
  verify it plays (devcheck), commit, link.

## Money
- Image ~0.5 credit (1k medium). No video models without his explicit yes (motion control is 8 credits).
- Two failures on the same defect: stop and ask. Never spend on a defect already known.
