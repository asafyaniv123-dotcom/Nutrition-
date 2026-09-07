# Languages

A translation file is `{ "<the Hebrew>": "<the translation>" }`, saved as
`<code>.json` beside this file — `en.json`, `ar.json`, `de.json`.

**The Hebrew string is the key.** That is deliberate:

- the Hebrew build loads no dictionary at all and costs nothing
- a missing translation falls back to real, readable text instead of to a key
  name like `fitness.set.add`
- the extraction is reversible, which is how the whole pass was checked

`_template.json` holds every key with an empty value. Fill the values, save it
as `<code>.json`, and `langLoad('<code>')` picks it up. An empty or missing
value falls back to the Hebrew, so a partial translation is a working app.

## What is not in here yet

- **Plural rules.** Arabic has six forms, Russian three, Hebrew two. Strings
  that embed a count need ICU `plural` syntax and a formatter to go with it.
- **Unit labels.** `ק"ג`, `קק"ל`, `צעדים` are keys like any other, but the
  *number* beside them also has to convert — that part lives in `fmtWeight`.
- **377 strings the extractor refused** rather than guessed at: 176 used as
  lookup keys, 24 as object keys, 8 in comparisons — those are data, not text,
  and translating them would break the program. The rest sit mid-tag across a
  concatenation. See `I18N.md`.
