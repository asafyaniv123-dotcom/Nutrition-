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
- Write down the ACTIVE MUSCLES from the library row (`m`) and from the reference's red highlight. These, and
  only these, glow. Name them per exercise - decline push-up: upper chest, front shoulders, triceps; pike
  push-up: shoulders, triceps. Seen from this camera a muscle may be hidden: say which visible part glows.
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

## 4. The figure - our character, always the same
- Style reference: the approved character sheet, job `54d6e9b8-b02b-472c-8e93-393483523fd6`
  (`exercise-sheets/character/sheet-2.jpg`). Shorts reference: x19 frame, job `2b2c3f25-...`.
- Smooth bald head: NO face, NO ears, NO facial details - in every frame, including the bottom one where the
  head turns toward the camera. Barefoot with toes, never shoes. Short, tight shorts ending high on the thigh.
- Body proportions of the sheet: broad shoulders, V-taper, narrow hips, compact glutes, normal head size.
- Glow: ONLY the active muscles from step 0, clearly brighter, moderate, not blown out, no hot spots.
- Each frame = the 3D render as image 1 (pose, camera, contacts) + the sheet as image 2 (+ x19 for shorts).

## 5. Check before he sees it (`tools/sheets/check-sheet.mjs`)
Fail any one = not sent; fix first (one paid retry per defect, then stop and ask).
1. Pose and angle vs his frames, start and end, full size.
2. Equipment: same size/height as HIS reference, and identical in both our frames (overlay shows no double edge).
3. Hands and feet: same pixels in both frames (zoom both).
4. Head: no face, no ears, same tilt.
5. Glow on the active muscles only, moderate, no bright spot elsewhere.
6. Bare feet, short tight shorts, sheet proportions.
7. What is held still through the rep stays still; full range of motion.
8. Whole body and equipment inside the frame with a margin.

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
