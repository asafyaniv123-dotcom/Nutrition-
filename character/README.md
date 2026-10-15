# The character

**This folder is the one place the sun is defined.** Nothing here is generated
and nothing here should be edited. If the working files break, this is where
they come back from.

    node character/verify.mjs          is the working character still ours?
    node character/verify.mjs --fix    put it back

## Why it exists

`make-faces.mjs` overwrote `dev/assets/sun-body.png`, and every page that draws
that file silently started showing a worse face — including one that had already
been approved. **Nothing shouted.** It was found by reopening a trusted page and
noticing the character had changed underneath.

A copy alone would not have prevented that. The check is the point.

## What is here

| | |
|---|---|
| `sun-source.png` | 1024×1024, transparent. **The render that was chosen** (`sun-30-vol-balanced`). Everything else derives from this one file. |
| `layers/sun-body.png` | the sphere, its rim and its glow |
| `layers/sun-r1.png` | the red ring |
| `layers/sun-r2.png` | the orange ring |
| `layers/sun-r3.png` | the yellow ring |

The four layers exist so the rings can turn, lag and counter-rotate while the
face stays level. Composited back together they are the source: **mean
difference 2.01 / 255**, measured over every pixel.

## The two checks, and what each one actually guards

They guard different things, and it is worth being exact about which:

- **identical** — are the files in `dev/assets/` byte-for-byte the master's?
  This guards **the working copy**, and catches any change to it at all:
  replaced, edited, truncated. It is the one that would have caught today.
- **faithful** — do the four layers in `character/layers/` still composite into
  `sun-source.png`? This guards **the master against itself** — that the thing
  we restore from is still the character, and not four files that have quietly
  stopped adding up.

## The character's real numbers

Measured out of `sun-source.png`, not chosen. Anything that redraws the sun
should match these or be a deliberate change.

| | |
|---|---|
| sphere radius | 238 of 1024 |
| body and glow reach | 245 |
| ring radii | peaks at **278**, **335**, **396**; cuts between them at 245, 311, 365, 430 |
| eye size | **83 × 169** each — 0.349 and 0.710 of the sphere's radius |
| eye centres | x **414** and **589**, y **499**. The pair's centre is 501.5, ten pixels left of the image's |
| eye colour | `rgb(47,24,10)` |
| body colour at its lowest point | `rgb(215,106,39)` in our own drawing; the render is more saturated at `rgb(254,146,15)` |

## Rules

1. **Nothing in here is written by a script.** If a tool wants to change the
   character, it writes to `dev/assets/` and `verify.mjs` reports the drift.
2. **A new character replaces this folder in its own commit**, with nothing else
   in it, so going back is one `git revert`.
3. **Run the check before trusting a page.** A design page that looks wrong is
   usually an asset that moved, not a page that broke.
