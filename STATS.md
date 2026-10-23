# סטטיסטיקה — the brief for the statistics session

A session of its own, opened by Asaf on 23 Oct 2026, dedicated to ONE thing:
gathering and reading the data about his users. Read this first, then
CLAUDE.md.

## What exists today

**The app** (`dev/index.html`, released to stable on 23 Oct, commit 289cad1)
sends an anonymous record through `usageNote()`:

- per **app day** (the day ends at 04:00, `todayStr()`), per **install**
  (`installId()`, 24 random hex characters, nothing else about the person);
- `o` opens, `a` the areas entered (`nutrition`, `fitness`, …), `s` whether
  the evening summary was finished, `l` the language, `f` the first day this
  install was seen, `d` true when it came from the dev sandbox;
- at most every 15 minutes, and at once when the summary is finished;
- **never** anything written, eaten, named or photographed. Keep it so: the
  app's promise is that what you write stays on the phone.

**The server** (`push-server/src/worker.js`, deployed 23 Oct, version 3138bb17):

- `POST /ping` merges into ONE KV key per day, `pd:<YYYY-MM-DD>`, kept 120
  days. **Never use `list()`**: the free plan allows 1,000 a day and the
  reminder loop needs them (see the memory note on the KV list limit).
- `GET /admin/usage?days=N` returns the days, behind the `ADMIN_KEY` secret.
- Deploying is Asaf's step: he runs
  `! cd C:/Projects/Nutrition-/push-server && npx wrangler deploy`.

**The page**: `admin/usage.html`, at
https://asafyaniv123-dotcom.github.io/Nutrition-/admin/usage.html. It reads with
the same key as `admin/corrections.html`. It shows totals, a grid of each
install by day (opened / summarised), and which areas are opened.

**Related**: `admin/corrections.html` (what people correct in the food log),
`/corrections` + `corrd:<day>` keys on the server.

## The question that matters

From the planning talk on 23 Oct: the first testers (5 to 10 people, then
12 for Google Play's closed test) are judged by ONE number. **How many of
them summarised at least 4 evenings in their second week.** סיום יום is the
spine of the product; everything else is supporting.

## Ground rules for this session

- This session owns `admin/`, the usage endpoints in the worker, and any
  analysis. **It does not edit `dev/index.html`.** If the app needs to send
  something new, write down exactly what and why, and the app session adds it.
  Two sessions editing one file overwrite each other.
- `git pull --rebase` before every commit. Commit only your own files.
- Answer Asaf in Hebrew.
- Anything new that the app sends must stay anonymous and content-free.
  Ask him before widening what is collected.

## What this session has built (23 Oct)

**`admin/usage.html`** now leads with THE number: of the installs whose
second week is over (today is their day 15 or later), how many closed the
day on at least 4 of days 8–14. Below it: a retention chart by the install's
own day 1..21 (opened / closed, week 2 bracketed), a calendar chart, a grid of
every install by its own days with week 1 / week 2 counts and pass / fail /
"day N", areas, languages. `?demo` draws it on invented data.

- Days are compared as strings the app sent; `dnum()` / `dstr()` do arithmetic
  at UTC noon with `Math.floor`. The first version used `Math.round` on an
  exact .5 and shifted every lookup by a day — the demo looked fine, because
  invented data was shifted the same way. A two-year round trip is the test.
- A fixture with known answers (4 evenings → pass, 3 → fail, week-1 and
  week-3 evenings never count, day 14 → still waiting) passed.
- ✱ beside an id: seen on the first day of the data, so it may be older than
  the data and its "week 2" computed too late. The first tester (since 26 Sep)
  will carry it.

**`push-server/src/worker.js`** — two fixes, NOT deployed yet (Asaf's step):
`/ping` no longer erases a kept language when a ping comes without one, and
keeps the earliest first day; `/admin/usage` also reads tomorrow's UTC key,
because east of UTC the app's day is already tomorrow's date.

**`testers/index.html`** — the agreement every tester signs, at
https://asafyaniv123-dotcom.github.io/Nutrition-/testers/ (`?lang=he|en|de`).
Commitment (`WEEKS` = 3, `EVENINGS` = 4, the day's close first),
confidentiality, an honest account of what reaches us — including the food
corrections, which DO carry food names, and AI requests — and the WhatsApp
group (`WA_LINK`, empty until Asaf sends it). The finger signature is drawn
into a PNG on the phone and shared by the tester; **nothing is uploaded**, so
no name ever sits beside an install id. Change `TERMS_VERSION` with the text.

## Google Play's closed test — what it does and does not check

For a new personal developer account, production access needs a closed test
with at least **12 testers opted in for 14 consecutive days**. Google counts
that itself, from opt-ins to its own test track with Google accounts — our
numbers are never sent to it and cannot help or hurt. It then asks a
questionnaire about the test (how testers were found, what they reported,
what changed). So our data is for US — to know whether the product works —
and the WhatsApp reports are the material for that questionnaire.
A tester counts only if they install the Play build; the PWA does not count.

## Open

- `WA_LINK` in `testers/index.html`.
- Deploy the worker fixes.
- An Android build on Play's closed track does not exist yet.
