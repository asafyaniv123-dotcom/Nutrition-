# dallo-stones-dashboard.jpg

A project-management landing page in soft near-white: a widget grid on the left
(clock, project list, a promo card), and a hero on the right holding a stack of
four balanced stones — sage green, glossy orange, dusty pink, speckled cream.

## What Asaf said

> אני אוהב את המנימליזם פה אבל כן את הצבעים ואת האפקט שיש לברק שעל האבנים שנותן
> משהו ריאליסטי בזה.

## This sharpens the colour note rather than reversing it

Twice before the verdict was *"the colours are too strong"*
([[liquid-glass-ui-kit]], [[liquid-glass-panel]]). Here it is *"yes to these
colours"*. That is not a contradiction — the two images differ in a way that
states the rule exactly:

|  | glass kits | this |
|---|---|---|
| where colour sits | **on the controls** — buttons, toggles, fields | **on the objects** — four stones in a photograph |
| what the interface is | tinted throughout | **completely colourless** |
| the palette | saturated violet, teal, electric blue | muted sage, terracotta, dusty pink, cream |

So the rule is not *less saturation*. It is:

> **The interface is grey. Colour belongs to the things the interface is about.**

Count the colour in this image that is not a stone: three status dots, about
six pixels each. Everything else — nav, clock, search, cards, buttons — is one
grey-white.

## And these are colours the app already owns

This matters more than anything else on this page. The stones map almost
one-to-one onto tokens already in the file:

| stone | token already in `dev/index.html` |
|---|---|
| sage green | `--green-500 #8fc79e`, `--green-600 #6fb283` |
| orange | between `--terra-500 #e08a72` and `--amber-500 #e8c162` |
| dusty pink | `--terra-200 #f3b9a8`, `--terra-100 #e0c4bb` |
| speckled cream | `--surface #f5f0eb`, `--panel #fbf7f2` |

Three times now a reference has pulled cool and near-white against this app's
warm ground, and it has been written down as an open tension each time. **This
one closes it in the other direction.** The palette he just approved is not
somewhere the app has to travel to — it is the warm half of what is already
there. What is foreign to it is the cool half: `--violet`, `--indigo`,
`--water`.

## The gloss — and what he has now said three times

The stones read as real because of one thing: a small, hard, bright **specular
highlight** on each curved surface. Not texture, not a drop shadow, not a
gradient — a spot of light.

That is the third reference pointing at the same thing:

- the glass kit: depth from *a light edge and a faint inner glow*
- the rocker switch: the whole animation carried by *a highlight travelling
  across curved metal* ([[rocker-switch-toggle]])
- these stones: *the gloss*

**Light is how he wants realism.** Worth writing plainly, because it is cheap to
honour and easy to get wrong by reaching for texture or heavier shadows instead.

**And it is buildable.** A specular highlight on a rounded shape is a small
blurred white ellipse, or one `radial-gradient` positioned up-left — no assets,
no library. The stones themselves are rendered art; the *effect* he named is a
few lines of CSS.

## The layout is relevant too

A widget grid: a clock, a short project list with counts, a promo card, one
hero. Small tiles, each doing one job, on a shared quiet ground. The app's home
screen is nine areas looking for exactly that treatment — and the promise here
is the same one from the very first entry: an app with a lot in it has to stay
orderly and quiet.

## Where this stands against the glass

This is the **third** neumorphic reference ([[neumorphic-calendar]],
[[rocker-switch-toggle]], this) against **three** glass ones. The soft matte
ground is no longer a single sample — it is a pattern.

The split noted earlier still holds and now has more weight behind it:
photograph and glass at the door, flat and soft depth inside.
