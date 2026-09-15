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
