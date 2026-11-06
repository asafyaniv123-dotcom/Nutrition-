# Exercise sheets (5 Nov 2026)

What Mip's model sheet is to Mip, a sheet is to an exercise: the one place every
frame, clip and line of text about it is drawn from. Asaf asked for it on 5 Nov,
after the round-3 frames were made from the pose mannequin.

Open it at https://asafyaniv123-dotcom.github.io/Nutrition-/exercise-sheets/ (it
fetches JSON, so a `file://` open shows nothing).

One folder per exercise, named `<library id>-<slug>`, listed in `sheets.json`:

| file | what it is |
|---|---|
| `sheet.json` | the sheet: camera angle and why, what stays still and what moves, setup, cues, common mistakes, tempo, the research checks measured on the mannequin, sources, open decisions, and the production record (Higgsfield job ids and the exact prompts) |
| `pose-start.jpg`, `pose-end.jpg` | the approved mannequin, `tools/r3d/pose/` with `look=a` - the angles come from here |
| `start.jpg`, `end.jpg` | the Higgsfield frames drawn from the mannequin (gpt_image_2_5) |
| `loop.mp4` | the seedance clip from start to end, played forward then reversed, 540 px |

**A frame or clip that disagrees with its sheet is wrong, not the sheet.** The
cues, mistakes, camera and tempo come from
`research_notes/טכניקה נכונה לעשרה תרגילים - סבב 3/`, each line naming its source.
The `spec` rows are the mannequin's own checks (`tools/r3d/pose/poses*.js`), with
the value measured on the render.

The same files live in Higgsfield, project "Olimei – אנימציות תרגילים", folder
"סבב 3 – מהבובה". The app does not read this folder yet; the clips it ships are in
`assets/exdemo/`, and a clip moves there only after Asaf approves it here.
