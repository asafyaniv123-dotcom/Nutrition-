# tools/3d - the locked pose for the exercise animations

Blender 5.2 + MPFB (installed as a Blender extension, with the MakeHuman system assets pack loaded).
The method and every rule: `.claude/skills/exercise-animation/SKILL.md`.

    blender -b -y --python make-man.py                 # the man (sheet proportions, round glutes, small ears)
    blender -b -y man.blend --python shorts.py         # short tight shorts covering the glutes
    blender -b -y man-shorts.blend --python scene.py --python look.py --python guide.py \
            --python pose-<exercise>.py -- <out-prefix> 0 1   # top, bottom and the empty scene

The .blend files are written to the scratchpad; edit the paths at the end of make-man.py / shorts.py.
