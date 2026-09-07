# Asked for, not yet built

Things Asaf has asked for that are not done. Newest first. When one is
finished it moves out of here and into a commit message, not into a "done"
section — git already keeps that.

---

## Planning area (2026-09-07)

Four items, all in תכנון זמן.

### 1. ~~A "now" line in the daily view~~ — done

A hairline at the current hour, offset by the minutes into it, with a dot on
the leading edge so it reads as a time rather than as a border. Only on today.

It repositions itself every minute rather than only at render: a line saying
14:00 at twenty past is worse than no line, because it looks authoritative.
One style write on one element, and the interval takes itself down when the
grid is gone.

### 2. ~~The weekly view will not swipe between weeks~~ — done

It was worse than reported: dead on all three horizons, and dead only *some*
of the time, which is why it read as flaky rather than broken.

`_planMode` stopped describing anything when the accordion put all three
panels on one page. The only thing still setting it is `planGo(mode)`,
reachable from two deep-link shortcuts — so arrive that way and the swipe
works, open planning normally and it does not. Two other features were riding
on the same dead variable: `planRerender()` (seven call sites, no `else`,
repainted nothing) and `dpRail()`, the loose-task rail, which simply never
appeared.

### 3. Stretched tasks in the monthly view — display done, dragging still open

**Done: no breaks, and the text is no longer cut.**

The month was already drawing one chip per day, each bleeding -6px into the
join so a run would read as one bar. It never could: `.mo-cell` is
`overflow:hidden`, so the bleed is laid out and then clipped away.
`getBoundingClientRect` said the segments touched; the paint said otherwise,
and the paint is what you see. The same clip cut the words, because only the
first segment carries them and it is one seventh of the grid wide —
*"חופשה משפחתית בצפון"* became *"חופשה משפח"*.

Neither could be fixed from inside the cell. The per-day chips stay, because
they are what reserves the right height in the right place, but they are now
invisible placeholders and one continuous bar is drawn over the grid on top of
them.

**Still open: stretching a task from the monthly view itself.** The weekly view
has a drag handle; the month has none, so a run can be *seen* there but only
*made* in the week. That is an interaction, not a rendering fix, and it is the
half that is left.

One caveat worth writing down: the bar is split per grid row, so a run crossing
a Saturday would break where the calendar breaks. That path is unexercised —
`wkDayIndex` is week-relative, so a week task cannot currently extend past its
own Saturday. The code is defensive, not tested.

### 4. ~~Stretched bars collide with the day's other tasks~~ — done

The bar was positioned 19px up from the **bottom** of its band, straight
through whatever chips were there, and nothing reserved space for it — so it
was always going to overlap and only looked right when the band was empty.

Now each bar sits at the top of its band, several in one band stack rather
than pile up, and the chips in that band get a matching padding. The count is
per band across the whole week, not per cell: a bar spans days, so the row it
occupies has to be clear in every column it crosses.

Measured with two spans and two chips in one band: bars at 352 and 363, chips
at 374, zero overlapping pairs.

---

## How to read this file

An item here is a description of the problem, not a design. Where the fix is
obvious it says so; where it is not, the first job is to look at what is
actually happening before deciding.
