# curved-spokes-muted-arcs.jpg

Six white circular nodes around a large raised grey ring with a white disc in
it. Each node is joined to the hub by a **thin curved line**, carries an icon,
and wears a **partial coloured arc on its rim**. The labels and their text sit
outside the nodes, at the edges of the frame.

## What Asaf said

> גם זה

Sent 16 September 2026, immediately after the other four, for the home screen.

## What to notice

**This is the fifth of five and the closest to buildable.** Six nodes is nearer
our nine than any of the others, and unlike the wheel diagrams the nodes are not
slices of anything — they are separate objects that a layout can move.

**The connectors CURVE.** Not radial spokes, not right angles: soft lines that
leave the hub and bend into each node. They read as organic rather than
engineered, and they are what makes six circles into one organism.

**The colour is an ARC on the rim, and only part of it.** Never a fill. Each
node stays white; a stroke covering about a third of its circumference gives it
an identity. Nine of these would still not be a rainbow, which is the objection
every other reference here raises.

**And the palette is muted** — mustard, terracotta, dusty red, plum, violet,
blue-grey. Every one desaturated. This is the direct answer to
[[liquid-glass-panel]], where he said "הצבעים קצת עזים מדי".

**The hub is physically raised.** A thick grey ring with a white disc sitting on
top of it, lit from above. That is "3d מאוד עדין" from [[neumorphic-calendar]],
applied to one object instead of to everything.

## Where it applies

The home board, more directly than any other reference in this folder. Our nine
capsules already sit on an arc around a hub; what they lack is exactly the three
things this has — a connector to the centre, an identity of their own, and a hub
that reads as the centre rather than as the biggest button.

## The hard part

**Curved connectors need SVG.** Nine paths from a hub to nine capsules whose
positions are computed at runtime from `_arcW` — the geometry exists, so the
paths can be generated from the same numbers, but it is a new drawing layer
rather than a CSS change.

**And nine rim arcs on capsules, not circles.** These nodes are circles, so an
arc on the rim is trivial. Ours are 70px capsules with a 999px radius; the
equivalent is a stroke along part of the border, which is harder to place and
easier to get wrong.

Related: [[ring-with-satellite-nodes]] — the same idea with straight connectors
and eight nodes; this one is softer and closer to what our arc already does.
