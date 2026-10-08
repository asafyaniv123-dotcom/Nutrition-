# The coach's data model

Two halves. The **contract** with the model, which is new, and the **stores**,
most of which already exist and already hold two weeks of a real person's
data. Anything that invents a second place to keep a meal is wrong by
construction.

---

## 1. The contract

### What the app sends — `POST /coach`

```jsonc
{
  "day":     "2026-10-08",        // from todayStr(), never from a clock
  "lang":    "he",                // appLang() — eleven are shipped
  "units":   "metric",            // APP_UNITS
  "targets": { "kcal": 1850, "p": 120, "c": 180, "f": 60 },
  "logged":  [ /* every item already on that day, with its id */ ],
  "left":    { "kcal": 640, "p": 38, "c": 55, "f": 12 },
  "history": [ /* the last few turns, text only, no images */ ],
  "message": "אכלתי סלט עם טונה",
  "images":  [ "data:image/jpeg;base64,..." ]   // compressed, see below
}
```

`left` is sent even though it is derivable, because the model is told never
to compute and must still be able to advise against it.

Images are compressed **before** they leave the phone — longest edge 1024,
JPEG q0.7. A plate photo off a modern camera is 3–4 MB; at that size three of
them in one turn is slower than the answer is worth. The app already does
this for day photos (`canvas.toDataURL('image/jpeg',0.7)` at line 14228) and
the same helper serves here.

### What comes back

```jsonc
{
  "action": "add",
  "date":   "2026-10-08",
  "items": [
    {
      "id":        "c7f3a1",
      "name":      "סלט טונה",
      "quantity":  "קערה, ~250 ג",
      "calories":  310, "protein": 28, "carbs": 9, "fat": 18,
      "assumption":"הנחתי כף מיונז"
    }
  ],
  "question": "היה שמן זית בסלט?",
  "message":  "**סלט טונה** · קערה, ~250 ג\n310 קק״ל · 28 ח · 9 פ · 18 ש"
}
```

The app renders `message`, then appends its own **נשאר להיום** block computed
from the stores. The model's text and the app's numbers never overlap, so
they cannot disagree.

**Except when `action` is `none`.** Nothing was logged, so nothing moved, and
a block repeating the same four figures under an answer about a recipe is
noise — the model was already handed `left` and quotes it where it matters.
The block appears only after `add`, `update` or `delete`.

### The four actions

| action | what the app does |
|---|---|
| `add` | append `items` to `day_<date>.meals` |
| `update` | replace by `id`; an id that is not there is dropped, not appended |
| `delete` | remove by `id` |
| `none` | store nothing — advice, a question, an explanation |

**`update` is the whole reason ids exist.** "אכלתי רק חצי" has to change the
row that is there. The failure mode is logging the meal twice, and it is
silent: the totals just drift.

---

## 2. The stores

### Already there — do not duplicate

| what | key | shape |
|---|---|---|
| a day's food | `day_<YYYY-MM-DD>` | `{meals:[…], water:0}` |
| the day's summary | `sum_<YYYY-MM-DD>` | the evening interview |
| targets | `targets_v1` | `{kcal,p,c,f,water}` |
| who it is about | `profile_v1` | `{sex,birth,height,weight,activity,goal}` |
| weigh-ins | `weights` | the morning scale |
| workouts | `fit_log` | sessions, with sets |

A coach item lands in `day_<date>.meals` beside everything the existing
nutrition screen writes. The rings on the home screen, the macro bars, the
day summary and the weekly review all read that one array and keep working
without being told anything.

### One new store

```
coach_<YYYY-MM-DD>  →  { turns: [ {role, text, imgCount, at} ] }
```

The conversation, per day, text only. Images are not kept: they were 3 MB
each before compression, localStorage has about 5 MB for the whole app, and
the project already moved day photos out to IndexedDB for exactly this
reason. What the picture produced is in `meals`; the picture itself is not
worth the quota.

### One field added to a meal row

```jsonc
{ "id": "c7f3a1", "src": "coach", … }
```

`src` is how the screen knows which rows a correction may touch and which it
may not. Without it, "I only ate half" has no way to tell a coach row from
one typed into the builder.

---

## 3. What this replaces, and what it does not

**The input.** A week of using plain chat instead of the app settled that:
one box, words or a photograph, and the correction said in the same box. The
categories, the picker and the builder are what the chat did not need.

**Not the memory.** The chat was good at the moment and remembered nothing
after it — no targets that move, no weekly weight average, no yesterday, no
day summary. That is the half the app exists for, and all of it is already
built and already full of two weeks of real data.

So: the coach becomes how food gets **in**. Everything downstream of the
meals array stays exactly as it is.

---

## 4. Two things to settle before any screen is drawn

**Protein.** This spec says 2.0–2.2 g/kg. A week ago the ladder was changed
in the opposite direction, on an instruction in this project: 114 g for a
60 kg woman was called nearly double her weight when elite athletes take
2.2, and `PROT_PER_KG` went from `{1.2 … 2.0}` to `{1.0 … 1.8}` with a
1200 kcal floor added underneath. For a 60 kg person 2.0–2.2 is 120–132 g —
more than the 114 that was rejected. Both cannot stand.

**Where it lands.** The prompt and this model are the same either way, which
is why they are written first. After them the two paths stop resembling each
other: a standalone React file needs its own storage, its own day rollover,
its own targets and its own weight history — all of which exist here, hold
real data, and took weeks — while the nutrition area of this app needs its
input replaced and nothing else.
