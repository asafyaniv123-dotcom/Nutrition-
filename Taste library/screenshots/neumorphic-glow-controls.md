# neumorphic-glow-controls.jpg

The same material as `neumorphic-glow-home.jpg`, shown as separate parts: a
vertical slider with a small violet dot in its channel, a large disc with a
violet glow escaping from behind its lower edge, a thin rail, and two rounded
tiles.

## What Asaf said

Sent 20 September 2026 together with `neumorphic-glow-home.jpg`, for the
nutrition tubes.

## What to notice

**THE SLIDER IS THE TUBE WE NEED.** A capsule pressed into the ground, a
channel inside it, and one small coloured dot at the level. It is the same
object as a nutrition tube with the fill replaced by a point - and it proves
the style can carry a value without a coloured bar.

**THE GLOW COMES FROM BEHIND.** The violet light on the disc is not painted on
the surface; it leaks out from behind its edge, brightest where the disc meets
the ground and gone within a few tens of pixels. That is why it reads as light
rather than as a stroke.

**EDGES ARE MADE OF LIGHT, NOT LINES.** There is no border anywhere. Every
shape is defined by a lit edge on one side and a shaded edge on the other.

## Where it applies

The tubes, the hub of the fan, the tab bar, and any control that has a level
or an on/off.

## The hard part

**In CSS this is two inset shadows and one outer glow per element** - cheap
and faithful. The parts that are NOT cheap are the wide soft shadows at low
opacity on many elements at once; that is the same cost that made the paper
skin stall a phone, and it has to be measured rather than assumed.

Related: [[neumorphic-glow-home]], [[neumorphic-calendar]].
