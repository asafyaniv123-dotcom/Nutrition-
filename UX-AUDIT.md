# Measured UX debt

Numbers taken from the running app at 390px, not read off the CSS. Re-run with
the harness described at the bottom.

## Tap targets

The research on this is blunt: fitness apps are used **sweaty, one-handed and
in poor light**, roughly half of people drive a phone with one thumb, and the
floor for a control is 44–48px. Sweaty fingers after a set need bigger targets
than a banking app ever has to worry about.

**105 rendered elements come in under 44px.** Most are false positives — a
`<span>` inside a button inherits `cursor:pointer`, and so do SVG children —
so what matters is the real controls, and these recur across screens:

| control | size | where | note |
|---|---|---|---|
| `BUTTON.wk-dot` | **15 × 15** | planning, week | the worst one in the app |
| `BUTTON.fab-i` | **16 × 16** | nutrition | |
| `BUTTON.wk-swatch` | 26 × 26 | planning | colour picker |
| `BUTTON.stk` | 174 × **25** | home | streak line |
| `BUTTON.` (home chip) | 50 × **23** | **every screen** | most-used control in the app |
| `BUTTON.tab` | 61 × **27** | nutrition | |
| `BUTTON.jrnl-nav` | 32 × 32 | journal | |
| `BUTTON.nav-arrow` | 34 × 34 | 5 screens | day navigation, used constantly |
| `BUTTON.wreset` | 33 × 35 | nutrition | water |
| `BUTTON.wadd` | 87 × **35** | nutrition | water |
| `BUTTON.fg-b` | 156 × **36** | fitness | |
| `INPUT.mtin` | 223 × **38** | several | typed into mid-workout |
| `BUTTON.tb` | 137 × **41** | tab bar | marginal |
| `BUTTON.trip-toggle-track` | 56 × **30** | home | |

Height is the failing dimension almost everywhere, which is the cheap kind of
problem: padding, not layout.

**Where to start:** `nav-arrow` at 34×34 and the 23px-tall home chip, because
they are on nearly every screen; then `wk-dot` at 15×15, which is the smallest
thing in the app and sits in the planner where fingers drag.

## Direction

**0 boxes go off-screen in LTR that do not also go off-screen in RTL** — the
app mirrors cleanly after the direction pass.

Worth recording honestly: an earlier run of the same probe reported 42. The
difference is animated elements — the drifting clouds behind the home screen
are at different offsets when each sweep samples them, so they registered as
"new in LTR". The clean run dedupes and finds nothing. The 42 was noise.

The remaining off-screen boxes exist in **both** directions and are intentional:
drifting clouds, and `areas-drawer`, an off-canvas panel parked to the side
until it is opened.

## How to re-run

`dev/_audit.html` builds it: one iframe at 390px, each module visited in RTL
then LTR, measuring `getBoundingClientRect` on every element.

Two things to know. **Keep the tab in the foreground** — Chrome throttles
timers in a hidden tab to about one per minute after five minutes, which turns
a 30-second sweep into ten. And `requestAnimationFrame` never fires at all in a
hidden tab, so the harness avoids it.
