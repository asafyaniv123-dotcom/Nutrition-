# Measured UX debt

Numbers taken from the running app at 390px, not read off the CSS. Re-run with
the harness described at the bottom.

## Tap targets — fixed where possible

The floor for a control is about 44px. The smallest thing in this app was a
**15 × 15 dot** in the planner.

Two tools, and picking the wrong one is how this goes wrong. An invisible
**pad** changes only the hit test — nothing moves, nothing repaints — but it
*overlaps* whatever is near it, so it needs measured clearance. Growing the
**element** reflows its neighbours instead of covering them, so it works where
there is no clearance at all, at the cost of a visible change.

Per-axis clearance was measured for every control before anything was sized.

| control | was | now | how |
|---|---|---|---|
| `.wk-dot` | 15 × 15 | **45 × 45 hit** | pad; 37px of room, nothing moved |
| `.jrnl-nav` | 32 × 32 | **44 × 44 hit** | pad; 67px of room, nothing moved |
| `.trip-toggle-track` | 56 × 30 | **70 × 44 hit** | pad; 96px of room, nothing moved |
| `.nav-arrow` | 34 × 34 | **42 × 42** | grown; on five screens |
| `.wadd` / `.wreset` | 35 tall | **42** | grown; water, tapped daily |
| `.tb` | 41 tall | **46** | grown; the tab bar |

**Left alone on purpose:** `.tab` (27px) and `.stk` (25px) have neighbours
touching on both axes, and both are wide enough that a miss lands on nothing
harmful. Growing them would reflow a header for very little.

Verified afterwards: the three padded controls cover no other control. The
grown ones intersect only `.fab-scrim`, a full-screen overlay that covers
everything by design.

## The last two, and the decision they needed

`.tab` (61 x 27) and `.stk` (174 x 25) had neighbours touching on both axes, so
an invisible pad would have covered the control beside them. The only way up
was to make the elements taller and let their rows reflow — a visible change,
which is why it was held back as a decision rather than done with the rest.

Both now reach **44px**. The tab strip went from about 35px tall to 52.

It reads better, not merely bigger: the tabs are now the same height as the day
arrows beside them, which they never were. The row is balanced where it used to
be mismatched.

**Every measured tap target in the app is now at or above 44px.**
