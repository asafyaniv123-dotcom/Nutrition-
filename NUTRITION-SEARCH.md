# Why Hebrew searches miss, and what is left to do

Written during the freeze, 15 Sep 2026, on `freeze/prep`. Two repairs are
already committed on this branch; the third and largest is described here and
not built, because it needs measuring against his real queries rather than
against my guesses.

---

## Done on this branch

### 1 · Hebrew final letters (`f0e1301`)

`foodKey` folded Latin accents, Arabic keyboard forms, ligatures and two
Hebrew doublings — but not the five letters Hebrew writes differently at the
end of a word. So **חלבון and חלבוני were unrelated strings** and a search for
protein could not reach a row whose name says protein-of.

Folded now, **on words of four letters or more**. The guard is the whole of
it: folding every final letter was tried, and "שום" became "שומ", a prefix of
"שומן" — garlic returned 577 rows of which 499 were fat.

**And the 309-food suite passed both versions identically.** It asks whether
each query still finds its own food, which is a question about the *winner*. A
fold can flood the candidate list without displacing the top hit. Necessary,
not sufficient — measure in the page as well.

### 2 · Hebrew names for Latin brands (`7a77e64`)

401 rows over 24 brands. `aka` now feeds `f.s`, the folded key, which is never
displayed — so `aka` works for all 6,931 uncurated rows instead of only the
309 that carry `f.t`.

Every spelling was **verified against the same maker already written in
Hebrew in these tables**, not transliterated. 24 passed; 8 were refused
(Milka, Pringles, Heinz, Carrefour, Alfa, Euro, Proud, Green). The method
caught its first error immediately: the tables say **אסם**, not אוסם.

**Measured end to end on his real failed query, "מולר משקה חלבון 25":**

| | token match | what the search returned |
|---|---|---|
| this morning | 1 of 3 | soy drink, almond drink, a protein snack, a Tnuva pudding — his product absent |
| after the fold | 2 of 3 | — |
| after the aliases | **3 of 3** | **12 results, his product first** |

---

## Not done — and it is the bigger lever

Ranking every Latin word in these tables by how many rows carry it puts
**common English nouns far above every brand**:

| | rows | | rows |
|---|---|---|---|
| protein | 134 | yogurt | 52 |
| chocolate | 93 | milk | 35 |
| cheese | 78 | tuna | 30 |
| cream | 58 | rice | 30 |
| bar | 55 | bread | 29 |

A Hebrew speaker typing **חלבון**, **שוקולד**, **גבינה** or **חלב** cannot
reach any row named in English — and there are thousands, far more than the
607 the brand pass could touch.

**The fix is not more per-row aliases.** It is a small bilingual term map —
perhaps fifty pairs — expanded at token level, the way `foodForms` already
expands plurals. Fifty entries would reach more rows than 401 hand-verified
aliases did.

**Why it is not built yet.** It broadens matching across the whole table, and
broadening is exactly what buried garlic this morning while the suite stayed
green. It needs to be measured against queries he has actually typed, and by
23/09 there will be a week of them. Build it then, with the evidence.

---

## Nothing here is merged

`main` has not moved. Merging is his call on 23 Sep.
