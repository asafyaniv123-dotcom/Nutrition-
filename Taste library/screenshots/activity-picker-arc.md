# activity-picker-arc.jpg

A phone screen: activities — Sleep, Skipping, Power Training, Cycling,
Swimming, Tennis, Basketball — riding along a vertical arc, one of them
selected at the centre.

## What Asaf said

> מה שאהבתי כאן זה את האפשרות לבחור באיזה פעילות אתה עושה. חשבתי גם על זה שכשמדפדפים
> בין האפשרויות יהיה מעין קליק קטן ונעים.

Two things: the picker, and a small pleasant click while moving through it.
The second one turns out to be the harder of the two — see the bottom of this
note.

## What the picker actually does

**Selection is a position, not a tap.** There is exactly one selected item and
it is whichever one is at the centre. You do not choose a thing; you bring a
thing to the middle. That removes the whole idea of a wrong tap.

**The fade is a gradient of commitment.** The centre item is at full strength,
its neighbours are grey, and Basketball at the bottom has nearly dissolved. The
list has no visible end — it just stops mattering. Much quieter than a scroll
bar, and it makes a long list feel short.

**Colour is identity, state is everything else.** Every icon keeps its own hue
even while faded — orange for skipping, blue for swimming — so colour tells you
*which* activity, never *which is chosen*. Being chosen is shown three other
ways at once: full opacity, a coloured ring, and a solid label pill instead of
grey text on the curve. This is worth stealing on its own; the app currently
leans on colour to carry both jobs in places.

**The label leaves the curve when selected.** Unselected labels are rotated to
follow the arc; the selected one straightens into a level pill and becomes the
only comfortably readable text on screen. Legibility itself is the selection
cue.

## Where it could apply

It suits a **short, fixed** set — "what kind of session was this" — and the
fitness area has exactly that shape. It does *not* suit the exercise database:
turning an arc to reach a specific lift among hundreds would be far worse than
a search field. Any use of this has to be for choosing a **kind**, never for
finding a **record**.

## For the Hebrew — two real problems

**Rotated Hebrew is worse than rotated Latin.** The unselected labels here are
tilted along the curve, which Latin tolerates. Hebrew has no ascender/descender
rhythm to hold its shape when tilted and gets noticeably harder to read. The
fix is probably to keep every label level and let the *arc* do the curving.

**The arc has a side.** It sits on the right with labels to its left, which is
built for a right thumb reading left-to-right. In RTL the whole thing wants to
mirror. That is cheap to decide now and expensive later — the same direction
question that is still open across the app's 293 physical CSS declarations.

## The click: this is native work

Verified in the code, not assumed. The app already has both halves of this:
`buzz(pattern)` and `cmBuzz(kind)`, three call sites, both wrapped in
`if(navigator.vibrate)`. The comment already sitting above `cmBuzz` says it:
silently absent on iOS Safari, which has never supported the Vibration API.

So on Asaf's phone, **the click already cannot happen** — the code for it is
there and does nothing. It is not a thing to build; it is a thing the platform
withholds, exactly like the custom notification sound
([[notification-sound-is-native-work]]). It arrives for free with the move to
native ([[app-store-goal]]), where it is `UISelectionFeedbackGenerator` — the
API iOS provides for precisely this gesture, a selection changing under a
finger.

**What the web app could do instead**, if the feeling matters before then: the
app already builds sounds from oscillators in Web Audio, so a very short, very
quiet tick is buildable today with machinery that exists. It would be *heard*
rather than *felt*, which is not the same thing and is worse in a quiet room —
but it is honest about being a substitute rather than a broken feature.
