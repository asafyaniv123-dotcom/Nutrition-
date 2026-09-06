# Taste library

Screenshots and links that show what the app should feel like. Reference
material, not a plan — this is where a direction gets pointed at before anyone
argues about it in words.

## Why this exists

Two design attempts were built and rejected in a single day (2026-09-05),
because both times the direction came from Claude's own taste rather than from
anything Asaf had pointed at. This folder is the fix: a direction gets shown
first, then built.

## How to add something

**A screenshot** — send it in chat and say where it goes. It lands in
`screenshots/`, named for what it is rather than what the phone called it:
`hevy-workout-log.png`, not `IMG_4471.png`.

**A link** — send it and it gets added to `links.md` with a line on what is
worth looking at in it. A URL on its own stops meaning anything within a week.

**A note about one of them** — say it and it goes next to the thing it is about,
not in a separate file that drifts out of sync.

## What makes an entry useful

The useful part is rarely the whole screen. *"The way the numbers sit under the
bars"* or *"how quiet the empty state is"* is worth more than a whole app's
name, because it survives being applied to a different screen.

Contradictions are welcome and should not be resolved here. Liking two things
that cannot both be true is normal at this stage; the choosing happens later.

## What is not here

No app code. Nothing in this folder is loaded by the app or referenced from it.

## One thing to know

**This repository is published.** GitHub Pages serves the whole of `main`, so
anything in this folder is reachable at
`https://asafyaniv123-dotcom.github.io/Nutrition-/Taste%20library/...` —
verified, not assumed: `release.sh` at the repo root returns 200 over HTTP.

That is fine for screenshots of other people's apps and public links. It is not
the place for anything personal. If it should be private instead, one line in
`.gitignore` keeps it on this machine only — at the cost of it not travelling
with the project.

## What is in here so far

- **liquid-glass-ui-kit.jpg** — translucent pastel controls on a flat grey
  ground. The buttons, and behind them the requirement they serve: an app with
  this many areas has to stay quiet or it starts to weigh on you.
- **liquid-glass-panel.jpg** — the same kit as a whole panel over a blurred
  photograph. Same liking, plus a standing note that the colours are too strong:
  the structure of the palette, not its saturation.
- **activity-picker-arc.jpg** — activities on a curved picker, chosen by
  bringing one to the centre. Also where the "small pleasant click" idea is
  written down, along with why it is native work.
- **glass-login-over-landscape.jpg** — a frosted card over a photograph, sent as
  the idea for the way into the app. Note also records that the app has no
  accounts, so this is about arriving rather than signing in.
- **own photos/alpine-meadow-morning.jpg** — Asaf's own photograph, the first
  thing here that is material rather than reference.
- **neumorphic-calendar.jpg** — soft extruded and pressed-in controls, all one
  colour. The first entry that contradicts the glass ones; the note keeps the
  contradiction open rather than settling it.
