# The first minute, for the first person who is not us

A real user gets the app on **25 September**. She is a woman, and she has
never seen this app. Everything below was measured against the shipped file,
not guessed, and it is ordered by what she meets first.

The freeze ends on the 23rd. That leaves **two days**, so the order matters
more than the length of the list.

---

## 1 · The app asks her whether she is a man or a woman, and then talks to her as a man

This is the one. Hebrew marks gender on the verb and on the pronoun, so there
is no neutral second person to fall back into — **every instruction the app
gives is addressed to one sex or the other**, and it has already chosen.

Counted over the strings `_t` is actually called with:

| | keys |
|---|---|
| distinct `_t` keys in the app | 1,557 |
| **keys addressing a man** | **203** |
| keys addressing a woman | 7 |

The most frequent are the ones she cannot avoid: **הוסף 29, אתה 28, שמור 16,
כתוב 14, בחר 10, ספר 10, נסה 9, צלם 8, הזן 8, זכור 8**.

What she would read on her first day: *"כתוב במילים שלך"*, *"בחר תמונה
מהגלריה"*, *"נסה שוב"*, *"עדכן את היעדים לפי זה"*, *"בדיוק מה שאתה שורף"*.

**And the app already knows.** The profile carries **זכר / נקבה** as buttons
(`profSet('sex',…)`), because `profileTargets` needs the sex for
Mifflin-St Jeor. So the information is on file and is spent entirely on
arithmetic.

### Two ways to fix it, and the choice is a voice decision

**A · Neutral Hebrew.** Rewrite the 203 into forms with no gender —
infinitive and noun phrasing: *הוסף* → *להוסיף*, *כתוב במילים שלך* → *במילים
שלך*, *נסה שוב* → *לנסות שוב*. No new mechanism, correct for everyone
forever, and the class cannot come back.
*The cost is the app's voice.* Neutral Hebrew reads like a form. For an app
whose spine is an intimate evening reflection, that is a real loss.

**B · Gendered Hebrew, chosen from the profile.** Keep the warmth, write 203
feminine variants, pick by `p.sex`.
*The cost is architectural.* **Hebrew is its own key and carries no
dictionary** — `_t` falls back to its own argument. A gendered Hebrew means
building a Hebrew dictionary that does not exist today, days before a user
lands on it.

**The trap that is worth knowing before either is chosen:** a key is the
Hebrew string itself, so **rewriting the Hebrew changes the key, and every
one of the eleven language files loses its answer** — 203 × 11 = 2,233
translations dropped on the floor. It is avoidable: emit an old-key → new-key
map as part of the rewrite and migrate the eleven files mechanically, so only
the Hebrew changes and nothing else is re-translated. **Do not start the
rewrite without building that map in the same pass.**

**Recommendation: A**, for the 25th, because it needs no new machinery in the
two days available and it cannot be wrong for anyone. B is the better product
and belongs to a calmer week.

**And the same question exists in five other languages** — Spanish, French,
Italian, Portuguese and Arabic all agree adjectives with the person being
addressed. None of them ships on the 25th. Recorded, not scheduled.

---

## 2 · There is no first run

Searched for it: **no welcome screen, no onboarding, no first-run branch
anywhere in the file.** What actually happens is a **2.5-second splash**, and
then she is standing in the nutrition day tab with an empty log and no idea
what any of it is.

She is never asked her name, never told what the app is for, and never shown
the way to the profile that makes the numbers hers.

---

## 3 · On day one she is measured against someone else's body

Until six profile fields are filled — birth date, height, weight, sex,
activity, goal — `profileTargets` returns `null` and the bars run against
**`TARGETS_DEFAULT = 1975 kcal · 155 p · 200 c · 60 f · 3000 ml`**.

**This part the app is already honest about**: `targetsAreGuessed()` exists
precisely to say so, with the comment *"a reader has to be told they are a
starting point rather than a figure worked out for them."*

So the defect is not dishonesty. It is that **nothing invites her to fix it**,
and a stranger's calorie target is a poor first impression of an app whose
whole claim is that it is about her.

---

## 4 · It opens on the wrong thing

The app opens on **תזונה**, the food log. The product's spine is **סיום יום**
— the evening reflection — and everything else supports it.

Her first impression is therefore a calorie counter, which is the one thing
this app has spent months trying not to be.

---

## 5 · What is already right

Worth stating, because it is where the two days do **not** have to go:

- **Language detects from the browser.** `appLang()` reads a stored choice
  first and falls back to `langFromBrowser()`, so an English phone opens in
  English without her doing anything.
- **The guessed targets announce themselves** (§3).
- Eleven languages are answered, and the ten checks are clean.

---

## The two days

1. **The gender pass.** It is the largest, it touches the most screens, and it
   is the one she will notice in the first sentence. Decide A or B first — the
   rest of the work is the same either way.
2. **A first run worth the name.** Her name, the six profile fields in order,
   and a real target before she logs anything. Every field already exists;
   this asks them once, at the right moment, instead of hiding them behind a
   tab called *אישי*.
3. **Open on the evening, or explain the day.** The cheapest version is a
   single line on the empty day that says what the app is for and where the
   evening lives.

Items 2 and 3 are small. **Item 1 is the work**, and it is the one that
decides whether the app sounds like it was built for her or for someone else.

---

# DECIDED: B — gendered address, in every language

*"ב׳ עדיף בכל השפות. אנחנו רוצים לתת למשתמש שלנו כמה שיותר נימה אישית."*

Three things changed once that was the answer, and two of them are good news.

## 1 · The 2,233-translation trap does not apply

It was the argument against rewriting keys, and B rewrites none. **The key
stays exactly the Hebrew string it is today** and gains a second form beside
it. Nothing in the eleven language files is invalidated. The cost estimate in
the section above belonged to A alone.

## 2 · The mechanism already exists, twice over

**`HE` is a Hebrew dictionary, in the file, holding only the keys whose right
answer the fallback cannot produce.** It was built for the dual — *יומיים* is
a category no ternary reaches — and it is the exact precedent gender needs:
Hebrew keeps no full dictionary, and carries only what it must.

So the Hebrew feminine forms go into `HE`, beside the plurals. **No `he.json`,
no new file, no change to how Hebrew loads.**

And `_t` already resolves a value that is an **object of categories**, chosen
at runtime from something the caller knows — that is exactly what
`Intl.PluralRules` does with `vars.n`. Gender is the same shape with a
different selector.

### The change to `_t`, and the collision to avoid

Today **any** object value is read as plural categories. A gendered value is
also an object, so the two would collide. They separate cleanly because the
plural categories are a closed set — `zero one two few many other` — and
`m`/`f` are not in it:

```
if(v&&typeof v==='object'&&(v.m||v.f)) v=v[readerSex()]||v.m||v.f;   // gender first
if(v&&typeof v==='object'){ …Intl.PluralRules exactly as today… }    // then plural
```

Gender outside, plural inside, so a key that needs both nests naturally:
`{m:{one:…,other:…}, f:{one:…,other:…}}`. Existing plural entries are
untouched and keep working, which is what makes this safe to ship.

`readerSex()` must be a **cached variable refreshed like `_lang`**, never a
`localStorage` read — `_t` runs on every render of every screen.

## 3 · Ask her, do not infer her

The profile's **זכר / נקבה** exists so `profileTargets` can run Mifflin-St
Jeor. Reusing it silently for address makes two different questions into one:
how a body is metabolised, and how a person wants to be spoken to.

**Address becomes its own setting**, seeded from `p.sex` when that is already
answered, and asked directly in the first run. One extra stored key, and it is
the difference between an app that assumed and an app that asked — which is
the whole point of choosing B.

---

## What the pass actually covers — measured, and it is not 203

**Two classes, and the address scan only sees the first.**

**Second person — the app talking to her.** 203 keys.
הוסף 29 · אתה 28 · שמור 16 · כתוב 14 · בחר 10 · נסה 9 · צלם 8 · הזן 8

**First person — her own voice, in options she picks.** 81 more keys, and
**this class lands on the spine**:

- *"על מה אתה אסיר תודה היום?"*
- *"במה אתה הכי גאה היום?"*
- *"אני לא בטוח בטכניקה"*
- *"איך אני רוצה להרגיש {when}?"*

The evening reflection — the product — is masculine from end to end.

### And the count is wrong in both directions, so the set must be READ

A marker is not proof of address. Checked by printing the keys behind the
ambiguous ones:

- **ספר — 13 hits, essentially all nouns.** *המספר למטה*, *ספר המתכונים*,
  *שם הספר*. Not one is the imperative.
- **מוכן — 1 hit, *"הגיבוי מוכן"*.** The backup is ready, not her.
- **מחובר — *"תמיד זמינה, גם כשמחובר מקור"*.** A power source.
- **מלא — both *"מלא את כל הפרטים"* (imperative, real) and *"קרוב ומלא
  רוחב"* (adjective, not her).**

**So: ~284 candidates, a real false-positive rate, and a class the scan
under-counts. Bulk transformation would put feminine verbs where nouns
stand.** Every key gets read. That is the job, and it is why it is the job.

---

## The plan

**Hebrew ships on the 25th. The other five gendered languages follow.**
Spanish, French, Italian, Portuguese and Arabic all agree adjectives with the
person addressed; English, German, Japanese and both Chinese largely do not.
None of the five is what she opens on the 25th, and doing eleven badly is
worse than doing one properly.

1. **Read the ~284 and mark each**: address / her own voice / neither.
2. **Write the feminine form** for the ones that survive, into `HE`.
3. **`_t` + `readerSex()`** — the ten lines above.
4. **Ask it in the first run**, seeded from `p.sex`.
5. **A check**, so this can only go down: `tools/find-gendered-address.mjs`
   already counts it. It becomes a test the day the count is meant to be zero.

Steps 1 and 2 are **data, not app code**, so they are freeze-safe and can be
done now. Step 3 is small and waits for the 23rd.

---

## Verified in the browser, and it found a requirement the count could not

The forms were checked by reading real screens at phone width, not by trusting
204. `_t` was wrapped the way the real change will wrap it, `data/gender/he.json`
loaded over it, and the reflection driven.

**It reads correctly and nothing clips.** *"התחילי סיכום"* sits on its button
at 390px with room to spare.

**And then the thing worth the whole exercise.** The gratitude question did
*not* change. Because:

> **39 collections in this app are built inside `langOn(...)`** — `RF_STAGE1`,
> `RF_STAGE2`, `SUM_SECS`, `WORKOUT_TYPES`, the `SAY_*` lists and 34 more.
> Each calls `_t()` **once, at build time**, and caches the result.

So changing `readerSex()` changes nothing on its own. Every one of those 39
still holds the masculine sentence it was built with, and the evening
reflection is one of them — which means **the single most important screen in
the app would have been the one that did not turn over.**

Proved both directions in the page:

| | `RF_STAGE2`'s gratitude question |
|---|---|
| with the wrapper, before `langRepaint()` | *על מה **אתה אסיר** תודה היום?* |
| after `langRepaint()` | *על מה **את אסירת** תודה היום?* |

`langRepaint()` walks `_langRebuilds`, re-runs all 39, then repaints — it is
already exactly the mechanism a language change uses.

**So the requirement is: setting the reader's address must call
`langRepaint()`, precisely as `langSet` does.** Without that line the feature
is silently half-built, and a count of 204 would have reported success.

The reflection's own four opening questions are genuinely genderless — *מה היה
הרגע הכי טוב שלך היום?*, *איזו תמונה מספרת את היום שלך?* — so the gendered ones
live in the bank behind them, which is where this was found.
