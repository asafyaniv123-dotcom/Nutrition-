# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

A single-file PWA today. The decided path to the App Store and Google Play is a
native **wrapper** around this same web app (`APPSTORE.md` §5, choice B), so the
design language stays web. Capabilities the web withholds (native push, sound,
haptics, HealthKit) arrive through the wrapper, not through a redesign.

## Users

Any adult, anywhere in the world, who has never seen the app. Not Israelis who
prefer an English UI: a Japanese reader and an American reader are first-class
targets. Asaf is the first user and lives in it daily, but he is not the
audience the design is aimed at.

The situation that matters most is **the evening**: the day is over, the person
is tired, and they open the app to close the day before sleep.

## Product Purpose

**Better Me** turns ordinary days into a personal record of a life. The spine
is **סיום יום** (the end-of-day reflection): a calm, conversational pass over the
day, one question per screen and never a form. Every answer is saved the moment
it is given and nothing is required. The person can stop and resume where they
left off. A short summary comes first; a deeper pass is opt-in, laid out as a
board of cards to pick from.

Everything else (nutrition, fitness, the closet, time planning, people, the
journal, insights) is supporting cast. New work is weighed by whether it
strengthens the evening reflection or the record it builds.

Success, in order: the person uses it every day; the routine feels like a
pleasure rather than a chore; it ships on the App Store.

## Positioning

The evening reflection draws on what was already logged during the day (meals,
training, clothes worn, time, people), so the questions are about *this* day
rather than a generic prompt. Over weeks that becomes a picture of a life, not
a set of separate trackers. It should be closer to a personal journal than to
a dashboard app.

## Operating Context

- Used on a phone, in portrait, installed to the home screen.
- A daily evening reminder brings the person in. It is web push today and must
  become native push inside the wrapper.
- The app's day ends at **04:00**, not midnight. Anything logged after midnight
  belongs to the day the person is still living in.
- A photo per day and per flow anchors the record, aiming at a visual diary and
  later an insights area that finds patterns across days.
- Data stays on the device (`localStorage`). There is no account and no server
  copy; backup is an explicit share/export.

## Capabilities and Constraints

- Areas: סיום יום (reflection), תזונה (nutrition, with an international food
  core), כושר (fitness, six areas; the workout generator is next), הארון (the
  closet, with photo cut-out), תכנון זמן (time), האנשים שלי (people), היומן
  (journal), תובנות (insights, thin today), and a small game. מטרות (goals) was
  removed on 16 Sep 2026 and must not come back through any route.
- **Eleven languages ship**: Hebrew, English, German, Spanish, Japanese, French,
  Italian, Portuguese, Simplified and Traditional Chinese, Arabic. RTL and LTR
  are both first-class. A change that adds a string is not done until every
  language answers it (`CLAUDE.md`).
- English is the pivot language and is written as an original, not a
  translation of the Hebrew. Measured: English is harder than Japanese for
  layout, because Japanese breaks between characters and fits narrow chips that
  English overflows.
- Numbers, dates and units go through `nfmt`, `dfmt` and `fmtWeight`, never
  written by hand.
- One HTML file holding markup, CSS and JS. Do not split it (measured and
  closed). All work goes to `dev/index.html`; the root copy moves only by
  release.
- 36 colour tokens in one `:root` block carry about 82% of colour uses, so a
  palette change is meant to be one edit. The themed worlds (night sky, glass
  wizard, game) stay literal on purpose.

## Brand Commitments

- Name: **Better Me.** (`manifest.json` still says תזונה; that is legacy.)
- **Voice: personal, addressed to one person, in that person's grammatical
  gender, in every language.** Decided: *"ב׳ עדיף בכל השפות. אנחנו רוצים לתת
  למשתמש שלנו כמה שיותר נימה אישית."* Form of address is its own setting, asked
  directly and never inferred from the metabolic sex field. The app never
  speaks to a crowd.
- The reflection's tone is intimate and unhurried: a journal, not an inbox.

## Evidence on Hand

- `Taste library/` holds references Asaf pointed at (`screenshots/`,
  `own photos/`, `links.md`, `figma/`). This is the only source a visual
  direction may come from. Two directions invented without it were built and
  rejected on 5 Sep 2026 (tag `night-redesign`).
- `DESIGN-MAP.md` is a census of where the app's surfaces disagree with the new
  home-board line. `UX-AUDIT.md`, `I18N.md`, `FIRST-RUN.md` and `23-09.md` hold
  measured findings and open decisions.
- No users other than Asaf yet. The first outside tester is planned for late
  September. There are no testimonials, metrics or store listing, and none may
  be invented.

## Product Principles

1. **The evening reflection is the product.** Everything else earns its place
   by feeding it.
2. **Ask, never demand.** One question at a time, nothing required, saved as
   given, resumable.
3. **One person, their language, their grammar.** Every screen explains itself
   to someone who has never seen the app, in any of the eleven languages.
4. **Direction comes from what Asaf pointed at**, not from the designer's
   taste.
5. **Build what survives the move to native.** Avoid workarounds that exist
   only because this is a web page.

## Accessibility & Inclusion

- Full RTL/LTR mirroring. CJK and Arabic scripts are first-class, not a
  fallback.
- Plurals follow `Intl.PluralRules` (Hebrew's dual, Arabic's six categories).
  Options a person chooses between must stay distinct in every language.
- Gendered address is chosen by the person.
- Known open issue (19 Sep 2026, `impeccable detect`): white text on the violet
  primary buttons measures 1.79–2.80:1, and `--muted` (458 uses) measures
  2.32–2.62:1. A contrast standard has not been formally chosen yet.
