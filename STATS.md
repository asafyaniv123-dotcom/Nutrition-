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
