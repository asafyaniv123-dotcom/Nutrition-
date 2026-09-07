# Asked for, not yet built

Things Asaf has asked for that are not done. Newest first. When one is
finished it moves out of here and into a commit message, not into a "done"
section — git already keeps that.

---

## Planning area (2026-09-07)

Four items, all in תכנון זמן.

### 1. A "now" line in the daily view

When the day being shown **is today**, draw a thin horizontal rule across the
grid at the current hour, so the current moment is visible without counting
rows.

Only on today. On any other day there is no "now" to point at, and a line
there would be a lie.

### 2. The weekly view will not swipe between weeks

Sliding left or right does not move to the previous or next week. This is a
**bug**, not a missing feature — the gesture is expected and does nothing.

Worth checking against the day-drag system already on that screen: a task can
be dragged across days there, so a horizontal swipe on the background may be
being swallowed by the same pointer handling.

### 3. Stretched tasks in the monthly view

A task can already be stretched across several days in the weekly view. The
monthly view should be able to do it too.

And in the monthly view specifically:

- **no breaks between days** — a task spanning Sunday to Tuesday should read as
  one continuous bar, not three separate marks
- **the text must not be cut** — it is being clipped now

### 4. Stretched bars collide with the day's other tasks

In the **weekly** view the stretched bar cuts through tasks that are already
there.

Fix: put stretched tasks along the **top** of the day cells, in their own band,
so the day's ordinary tasks keep the space below and nothing overlaps.

---

## How to read this file

An item here is a description of the problem, not a design. Where the fix is
obvious it says so; where it is not, the first job is to look at what is
actually happening before deciding.
