# neumorphic-calendar.jpg

A calendar dashboard in near-white: month grid, an events list, a to-do list,
month and year pickers, round social buttons. Everything is the same colour as
everything else and told apart only by soft depth.

## What Asaf said

> כאן אהבתי את הבליטה העדינה. כאילו הם 3d מאוד עדין. שחלק מהמקשים נראים כאילו הם
> יוצאים החוצה וחלק כאילו הם נלחצים פנימה.

He named the mechanic exactly. That distinction — some pushed out, some pressed
in — is not a side effect of the style, it **is** the style.

## What it is, mechanically

Neumorphism (soft UI). The element is **the same colour as its background**, and
two shadows do all the work: a light one up-left, a dark one down-right.

- **Extruded**: both shadows outside.
- **Pressed in**: the same two shadows, `inset`.

One property, two states, and nothing else changes — no colour, no border, no
fill. That is why it feels physical rather than decorated.

## Why it is worth something to this app

**It gives state a body instead of a colour.** The app is full of chosen /
not-chosen moments: a ticked habit, today's cell in the planner, the open
accordion panel, the selected tab, an area card you are inside of. Depth can
carry all of them **without spending a colour** — which is the rule that came
out of [[activity-picker-arc]]: colour should say *which thing*, never *which is
chosen*. This is a way to keep that promise.

**Pressed-in is a genuinely good metaphor for "done".** A ticked habit that
sinks into the page reads as settled in a way a coloured checkmark does not.

## The honest problem

Element and ground are the same colour, so the only thing separating a control
from the page is a soft shadow. That is why this style never became mainstream:
the boundary of a control has an accessibility floor to clear, and a shadow this
gentle does not clear it. It gets worse outdoors in bright light — which is
exactly where a fitness app gets used.

Not a reason to refuse it. A reason to use depth as the **second** cue on top of
a first one that survives sunlight, rather than as the only cue.

## What it would cost this app — measured

**The ground is close but a step too light.** `--surface` is `#f5f0eb`, warm and
flat, which is the right *kind* of ground. But at that lightness the white
highlight has almost nowhere to go; the ground would have to come down a step or
two for the extrusion to read at all.

**The bigger conflict is the cards.** `--card` is `#ffffff` — white cards on a
cream ground. Neumorphism requires the element to be the *same* colour as what
it sits on. Adopting this is not a tweak to the cards; it is giving up white
cards entirely.

**The vocabulary already exists in miniature.** The app has 208 `box-shadow`
declarations, all one-directional warm drop shadows (`rgba(200,180,160,…)` —
already a considered, non-default choice), and 4 `inset` shadows of its own.
One of them, `inset 0 2px 10px rgba(160,140,120,.18)`, is already a pressed-in
well. (14 further insets belong to the game document and are off limits.)

**It is cheaper than glass, not dearer.** Two box-shadows composite without
looking at what is behind them; the app's 11 `backdrop-filter` rules do. On an
older phone that difference is real.

## This is the first contradiction in this folder — leave it standing

Glass wants a photograph behind it and blur to tame it
([[glass-login-over-landscape]], [[liquid-glass-panel]]). Neumorphism wants a
flat matte ground and no blur at all. **They cannot both own the same screen.**

This folder's own rule is that contradictions are welcome and get resolved
later, so this one stays open. But there is a split that would let both be true,
worth writing down while it is obvious:

> **Photograph and glass at the door, flat and soft depth inside.**

The entry screen is a moment — it can afford a picture. The rest of the app is
where the work happens, and work wants a quiet matte surface with controls you
can feel. That also matches what he said at the very beginning: an app with this
many areas has to stay orderly and quiet.
