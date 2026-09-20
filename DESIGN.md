---
name: Better Me
description: A calm cream-and-violet daily companion, RTL-first, with one screen mid-transplant into a single soft-white material.
colors:
  ink-strong: "#3a3530"
  ink: "#4a4340"
  ink-soft: "#6a6360"
  muted: "#a89e97"
  muted-soft: "#c0b8b0"
  line: "#f0ebe3"
  line-strong: "#ece5da"
  surface: "#f5f0eb"
  panel: "#fbf7f2"
  card: "#ffffff"
  white: "#ffffff"
  violet-50: "#f7f2fb"
  violet-100: "#f0eafa"
  violet-200: "#e8dff5"
  violet-300: "#c9bce0"
  violet-500: "#a690cf"
  violet-700: "#6b5a92"
  terra-100: "#e0c4bb"
  terra-200: "#f3b9a8"
  terra-500: "#e08a72"
  terra-700: "#c2664a"
  green-50: "#eaf5ee"
  green-100: "#d8f0e0"
  green-200: "#bfe0c7"
  green-500: "#8fc79e"
  green-600: "#6fb283"
  green-700: "#4c9a4c"
  amber-500: "#e8c162"
  amber-700: "#a8842e"
  indigo-50: "#e8f0ff"
  indigo-100: "#dde8ff"
  indigo-500: "#4f6ef7"
  indigo-600: "#6274eb"
  indigo-700: "#3d4fd6"
  water-100: "#e8f4fd"
  water-500: "#3a7ca5"
  nu-ground: "#edf0f6"
  nu-channel: "#eaecf3"
  nu-ink: "#3c4254"
  nu-muted: "#6b7288"
  nu-cal: "#fed486"
  nu-pro: "#feae9d"
  nu-carb: "#ace3a6"
  nu-fat: "#b0d0fd"
  nu-water: "#7cb2f0"
typography:
  display:
    fontFamily: "Assistant, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-1px"
  headline:
    fontFamily: "Assistant, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "25px"
    fontWeight: 800
    lineHeight: 1.35
    letterSpacing: "-0.3px"
  title:
    fontFamily: "Assistant, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Assistant, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  body-strong:
    fontFamily: "Assistant, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Assistant, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "10px"
    fontWeight: 800
    lineHeight: 1.35
    letterSpacing: "0.08em"
rounded:
  xs: "8px"
  sm: "11px"
  md: "14px"
  lg: "18px"
  xl: "20px"
  hero: "22px"
  sheet: "22px 22px 0 0"
  round: "50%"
  capsule: "999px"
  nu-panel: "26px"
  nu-channel: "22px"
spacing:
  hair: "2px"
  xs: "4px"
  sm: "7px"
  md: "12px"
  gutter: "14px"
  card: "16px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.violet-500}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "13px 15px"
    typography: "{typography.body-strong}"
  button-confirm:
    backgroundColor: "{colors.green-500}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "13px"
  button-fitness:
    backgroundColor: "{colors.terra-500}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "14px"
  button-quiet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    padding: "13px 16px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted}"
    rounded: "22px"
    padding: "11px 17px"
  chip-on:
    backgroundColor: "{colors.violet-200}"
    textColor: "{colors.violet-700}"
    rounded: "22px"
    padding: "11px 17px"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "12px"
    padding: "11px 12px"
  tab-on:
    backgroundColor: "{colors.violet-500}"
    textColor: "{colors.white}"
    rounded: "11px"
    padding: "7px 4px"
    height: "44px"
  nu-surface:
    backgroundColor: "{colors.nu-ground}"
    textColor: "{colors.nu-ink}"
    rounded: "{rounded.nu-panel}"
    padding: "20px 14px 18px"
  nu-channel:
    backgroundColor: "{colors.nu-channel}"
    rounded: "{rounded.nu-channel}"
    width: "44px"
    height: "188px"
---

# Design System: Better Me

## Overview

**Creative North Star: "The Warm Paper Room"**

Better Me is a cream room lit from a violet window. Everything in it is a soft
white card resting on warm paper (`--surface` #f5f0eb), lifted by a shadow that
is not grey but the colour of the paper's own shade (`rgba(200,180,160,…)`) —
so nothing ever looks cut out of the page. Corners are generous (14–22px) and
never sharp; type is Assistant at heavy weights and small sizes, so a screen
reads as a dense, legible, quiet list rather than a poster. Colour is rationed:
each area of the app owns one hue and the rest of the screen stays neutral.

The room has weather. A fixed `.sky` layer sits behind the home screen and Me
with three blurred drifting clouds, repainted six times a day from a fixed
phase table (dawn through night), and after dark it fills with thirty
hand-seeded twinkling stars. Motion exists only where it is cheap — transform
and opacity, never layout — and every animation in the file has a
`prefers-reduced-motion` answer. The app is used at night by a tired person, so
depth is felt rather than announced.

The home hub is the one place that gets to be sculptural: a breathing convex
disc measured off a reference video, with area capsules in frosted glass fanned
around it. Every other screen is flat cards on paper.

A second, incomplete world lives inside this one. The nutrition screen is
mid-redesign into a single soft-white material and is recorded separately
below; it is not yet the app's system and its rules must not leak onto any
other surface.

**Key Characteristics:**
- One warm paper ground, white cards, warm-tinted shadows — never grey ones.
- Violet is the app's voice; terra, green, amber, indigo and water are area voices.
- Heavy type (700/800) at small sizes; almost nothing is regular weight.
- Logical properties throughout — the app is RTL-first and ships eleven languages.
- Depth from soft shadow and gradient, never from borders on cards.
- Motion is compositor-only and always reducible.

## Colors

Warm neutrals carry the whole app; the accents are numbered ramps where 50 is
the faintest wash, 500 the fill and 700 the step dark enough to set as text.

### Primary
- **Dusk Violet** (`violet-500`): the app's own voice. Active tabs, the FAB, the
  primary button, the reflection's progress fill, selected chips and every
  "this is the one" state. It appears as a 135° gradient from `violet-300` to
  `violet-500` in 66 places — the gradient, not the flat fill, is the button.
- **Violet Ink** (`violet-700`): violet that has to be read as text, on a violet wash.
- **Violet Wash** (`violet-50` / `violet-100` / `violet-200`): the pale ground under a
  selected card, the header gradient, the "Home" pill.

### Secondary
- **Clay Terra** (`terra-500`): כושר. Exercise tabs, the resume-workout card,
  rest-time chips, destructive-adjacent affordances (`terra-200` on a delete glyph).
- **Sage Green** (`green-500` / `green-700`): done, saved, growth. Confirm buttons run
  `green-200 → green-500`; the generator's go button runs `green-500 → green-700`.

### Tertiary
- **Honey Amber** (`amber-500` / `amber-700`): attention, and estimate badges
  (`.log-est` on `#f7ecd2`). The home hub's single lit dot is its own amber,
  `#e0a23f`, and means one thing: today's reflection is unwritten.
- **Field Indigo** (`indigo-500`): trips and planning, the only saturated hue in the app.
- **Deep Water** (`water-500`): the intake tracker and the end-of-day card.

### Neutral
- **Warm Paper** (`surface` #f5f0eb): the page itself.
- **Raised Sheet** (`panel` #fbf7f2): a bottom sheet, an input at rest, a sticky footer.
- **Card White** (`card` #ffffff): what sits on the page. Distinct by intent from
  `white`, which is text *on* a colour and must not follow a palette swap.
- **Ink** (`ink` #4a4340 / `ink-strong` #3a3530 / `ink-soft` #6a6360): body, headings, secondary.
- **Muted** (`muted` #a89e97 / `muted-soft` #c0b8b0): labels, captions, empty states, chevrons.
- **Lines** (`line` #f0ebe3 / `line-strong` #ece5da): hairline and true divider. A scrim
  over content is always `rgba(74,67,64,.62)` — warm ink, never black.

### The Sky
Six phases painted from one table onto a fixed layer, each a radial glow over a
165° two-stop gradient: night `#221d38→#171528`, dawn `#fde3cf→#ecd9ee`,
morning `#eaf3fa→#e9ecf4`, day `#dfeaf8→#e4e2f4`, golden `#fddcbd→#f0d3e2`,
dusk `#dccfee→#bfb2da`. Night alone sets `body.night`.

### Named Rules
**The One Hue Per Area Rule.** A screen belongs to exactly one accent. Nutrition
is violet, כושר terra, goals green, trips indigo, water blue. Two accents on one
card means one of them is wrong.

**The Warm Shadow Rule.** Shadows are `rgba(200,180,160,…)` on paper and
`rgba(160,140,120,…)` under a lifted disc. A neutral-grey or black shadow is
never correct in the incumbent world — it reads as a hole in the paper.

**The Reserved Light Rule.** The amber hub dot (#e0a23f) means the day is not yet
closed. It is not a decoration and is not available for "this area was used today".

## Typography

**Display / Body / Label Font:** Assistant (400/600/700/800), with
`-apple-system`, `BlinkMacSystemFont`, `Segoe UI` and then a named CJK and
Arabic fallback chain (`Hiragino Sans`, `Noto Sans JP`, `PingFang SC`,
`Noto Sans TC`, `Noto Sans Arabic`, Meiryo). Nothing else is downloaded.

**Character:** one humanist sans doing every job, separated by weight and size
rather than by family. Assistant carries Hebrew and Latin from the same design,
which is why the app can be RTL-first without a second typeface; the CJK
families are named explicitly so a Japanese line is never set half in Assistant
and half in a browser default.

### Hierarchy
- **Display** (800, 32–40px, line-height 1, letter-spacing −1px): the wordmark
  (`.home-logo` 36px, `.me-logo` 32px) and the single big number on Me
  (`.me-hero-n` 40px). The wordmark is a violet→terra gradient clipped to text.
- **Headline** (800, 19–25px, 1.35, −0.3px): the reflection question (`.rf-q`,
  25px) — the largest reading type in the app, and the spine's whole screen.
- **Title** (800, 13–21px): card and sheet headings; numbers that answer a
  question sit at 21px (`.xd-v`) with `direction:ltr`.
- **Body** (400–700, 11.5–14px, 1.5–1.75): every row, note and explanation.
  Prose sits at 12.5px/1.7; taps and values at 13–15px/700.
- **Label** (700–800, 9–10.5px, letter-spacing 0.04–0.1em, `--muted`): a card's
  own quiet heading and every unit, count and caption.

### Named Rules
**The Heavy-Small Rule.** Weight, not size, makes hierarchy: 456 declarations at
700 and 334 at 800 against 26 at 400–600. New type joins at 700 or 800 unless it
is running prose.

**The Isolated Number Rule.** Any figure, set string, date or export blob is set
`direction:ltr` (and `font-variant-numeric:tabular-nums` where it is a column),
because the paragraph around it is Hebrew or Arabic. A number that inherits the
page direction will place its own punctuation at the wrong end.

**The Plaintext Rule.** Free text the user or the data wrote — journal lines,
exercise steps — is `unicode-bidi:plaintext`, so the run lays out in its own
direction rather than the page's.

## Layout

One column, `max-width:480px`, centred, `padding:0 0 100px`, with content inset
`14px` and a bottom tab bar fixed over it. The phone in portrait is the only
target; there are no breakpoints in the file and none are needed.

The rhythm is small and consistent: cards are `margin-bottom:12px`, card padding
`14–16px`, grid and flex gaps `6–10px`, section headings `margin:14–16px 2px 8px`.
Two-up grids (`1fr 1fr`, gap 8–11px) carry the home areas, the reflection board
and the paired stat cells. The FAB reserves its own room — `#content.has-fab`
adds `padding-bottom:96px` so the floating button never lands on the last meal.

Safe areas are respected everywhere they matter:
`max(24px, calc(env(safe-area-inset-bottom) + 10px))` on the tab bar,
`calc(18px + env(safe-area-inset-bottom))` on every sheet.

### Named Rules
**The Logical Properties Rule.** This is a rule, not a coincidence: 69
`inset-inline-*`, 51 `text-align:start`, 35 `border-inline-*`, 28
`margin-inline`, 14 `padding-inline`. Physical `left`/`right` appears only where
direction is deliberately pinned — the `[dir="rtl"]/[dir="ltr"]` pairs for
LTR-forced values, and the `direction:ltr` tab bar, where the two buttons read
left-to-right as the app's name. Writing `margin-left` or `text-align:right` in
new code is a defect in eleven languages.

**The One Scroller Rule.** A sheet is the scroller (`max-height:88vh;
overflow-y:auto`) and its footer is `position:sticky` against it, so an action
stays reachable however long the list is.

## Elevation & Depth

Hybrid, and the hybrid is the point. Ordinary surfaces are tonal and soft: a
white card on warm paper with one diffuse warm shadow and no border. The home
hub is genuinely sculptural: layered inset and outset shadows that invert on
press, plus a slow travelling highlight. Nothing in the incumbent world uses a
hard-edged or offset shadow.

### Shadow Vocabulary
- **Card rest** (`box-shadow:0 4px 16px rgba(200,180,160,.1)`): the default card lift,
  the single most repeated shadow in the file.
- **Card quiet** (`0 2px 10px rgba(200,180,160,.1)`): denser cards and small tiles.
- **Area tile** (`0 8px 32px rgba(<area hue>,.2)`): a home area card, tinted to its own hue.
- **Floating** (`0 6px 20px rgba(120,96,168,.42)`): the FAB.
- **Dialog** (`0 18px 44px -18px rgba(60,54,50,.5)`): a centred modal.
- **Glass capsule** (`inset 0 1px 0 rgba(255,255,255,.95), 0 8px 20px -10px rgba(96,116,130,.34)`):
  a hub capsule at rest, over `backdrop-filter:blur(14px) saturate(1.45)`.
- **Pressed capsule** (`inset 0 -1px 0 rgba(255,255,255,.9), inset 0 6px 12px -6px rgba(96,116,130,.42), 0 2px 6px -4px rgba(96,116,130,.3)`):
  the same capsule inverted — the highlight leaves the top edge and the shadow turns inward.
- **Convex hub** (`inset 0 24px 42px -28px rgba(255,255,255,.95), inset 0 -26px 44px -28px rgba(84,104,120,.24), 0 16px 32px -22px rgba(84,104,120,.32)`),
  flipping to concave on `:active` over 0.29s `cubic-bezier(.3,.2,.3,.8)`.

### Named Rules
**The Press Inverts Rule.** A pressed surface does not merely darken or shrink; its
light and shadow swap ends. Scale changes are tiny (.994–.97) and the tonal range
stays small — the surface turns inside out, it does not deepen.

**The Transform Replaces Rule.** An element centred by `translateX(-50%)` keeps that
translate first in every `:active` transform. A bare `scale()` throws it its own
half-width sideways; this shipped once, measured at 36px.

## Shapes

Soft rectangles at every scale. The working radii are 10–14px for controls and
rows, 18–22px for cards and sheets, 24–28px for hero surfaces. Sheets are
`22px 22px 0 0` and rise from the bottom edge in all twelve places they appear.
Circles are reserved for things that are objects rather than panels: the FAB
(58px), the hub capsule icons (38px), area icons (46px), avatars and dots.

Borders are not a depth device. A card has none; a *choosable* thing has a
1.5px border that is the selection indicator (`--line-strong` at rest →
`--violet-500` chosen), and a dashed 1.5px border marks a slot waiting to be
filled. Hairlines between rows are `1px solid var(--line)` or `var(--surface)`.

The hub capsule is a true capsule: `border-radius:999px` on a 70px-wide element,
so the ends are semicircles and no corner survives anywhere.

### Named Rules
**The No Border On A Card Rule.** Cards are separated by shadow and ground, never
by a stroke. A border in this system means "you can choose me", and using one for
structure spends the selection signal.

## Components

### Buttons
- **Shape:** softly rounded (12–16px); full-width actions 13–15px padding, min 44–50px tall.
- **Primary:** the violet gradient (`violet-300 → violet-500`, 135°) with `--white`
  text at 800. This is the single most repeated component idiom in the file.
- **Confirm:** the same shape in green (`green-200 → green-500`), used for save and finish.
- **Area primary:** the same shape in the screen's own hue — terra inside כושר.
- **Quiet / Cancel:** `--surface` ground, `--muted` text, no border, same radius.
- **Ghost:** no background, no border, `--muted` 13px/700 — always the escape route
  under a primary, never beside it.
- **Active:** `transform:scale(.92–.97)`; the FAB rotates 135° when its menu opens.

### Chips
- **Style:** `--card` ground, 1.5px `--line-strong` border, 22px radius, 11px 17px
  padding, `--muted` 14px/700.
- **Selected:** violet wash ground (`violet-100 → violet-200`), border `--violet-500`,
  text `#7d63b8`; a numeric chip instead fills with the violet gradient, goes white
  and rises `translateY(-3px)`.
- Filter chips in sheets are flatter (10px radius, `--surface` ground) and carry a
  count in a smaller, lighter `<b>`.

### Cards / Containers
- **Corner Style:** 18–22px; hero and board surfaces 26–32px.
- **Background:** `--card` on `--surface`. Feature cards use a 135–145° two-stop
  gradient in their own hue instead of flat white.
- **Shadow Strategy:** one warm card shadow (see Elevation); area tiles tint theirs.
- **Border:** none.
- **Internal Padding:** 14–16px, 20–24px on a hero.
- A collapsible card is a `<details>`; its `<summary>` suppresses the native marker
  and draws its own 7px chevron that rotates 45°→−135° on open.

### Inputs / Fields
- **Style:** two idioms. A boxed field — 12px radius, 1.5px `--line`/`--line-strong`
  border, `--panel` or `--card` ground, `text-align:start`. And an underlined field —
  no box, `border-bottom:1.5px solid #e4ddd4`, used where the writing is the screen
  (the reflection's 200px-tall `.rf-in` at 17px/1.65).
- **Focus:** border or underline turns `--violet-500`, the ground lightens to
  `--card`, and the browser outline is removed — the colour change is the focus signal.
- Numeric inputs are centred, 800 weight, `direction:ltr`, tabular figures.

### Navigation
- **Top:** a sticky header on a `--line → violet-200` 135° gradient; a centred date
  label (11px `--muted`) over a title (18px/700), then a row of four tabs inside a
  `rgba(255,255,255,.6)` 14px trough. The selected tab takes the violet gradient and
  white text; every tab is `min-height:44px` and ellipsises rather than wraps.
- **Bottom:** a fixed `rgba(250,246,241,.94)` bar with `backdrop-filter:blur(12px)`,
  two 15px/800 destinations and the journal lifted between them as a 52px circle
  pulled `-13px` above the bar. The bar is `direction:ltr` on purpose.
- **Hidden** while a sheet is open (`body.sheet-open .tabbar{display:none}`).

### The Hub (signature)
The home screen's area picker, default layout `fan`. A breathing convex disc
(radial highlight at 40% 24%, static SVG-noise grain at .34 opacity, a highlight
layer drifting on a 14s `hubBreath` loop) with frosted capsules placed around it.
Each capsule is 70px wide, `border-radius:999px`, `backdrop-filter:blur(14px)
saturate(1.45)`, and carries a 38px raised white icon disc and a 9.5px/800 name.
An area's own colour appears only as a 2.5px arc on the capsule's top edge
(`border-top-color:var(--area)`, opacity .72). Alternate layouts (`nodes`,
`rows`) exist behind a picker and each drop the framing board entirely.

### The Reflection (signature)
The product's spine, and the only screen that is typographic rather than
card-based: a 3px progress hairline at the top, one 25px/800 question centred in
the viewport, one answer affordance (mood faces at 46px, chips, a 1:1 numeric
scale, a ladder of full-width rungs, or the underlined writing field), a violet
primary and a ghost escape. Each step enters with a 0.4s `rf-in`. The deeper pass
is a 2-up board of tinted cards which take a `green-500` border and a small green
tick when answered.

## Do's and Don'ts

### Do:
- **Do** put every new colour through the `:root` ramps, and name it for its job.
- **Do** use the violet 135° gradient (`violet-300 → violet-500`) for the one primary
  action on a screen, and the screen's own hue for an area-local primary.
- **Do** write `inset-inline-*`, `text-align:start/end`, `margin-inline`,
  `border-inline-*`. Reach for `left`/`right` only inside an explicit
  `[dir="…"]` pair or a deliberately `direction:ltr` block.
- **Do** set every number, date, weight and set-string `direction:ltr`, and user or
  data prose `unicode-bidi:plaintext`.
- **Do** draw icons as inline SVG with `fill:none; stroke:currentColor;
  stroke-width:1.6–2.2; stroke-linecap:round`, sized 18–25px.
- **Do** give every animation a `@media (prefers-reduced-motion:reduce)` answer, and
  animate only `transform` and `opacity` on anything that loops.
- **Do** respect `env(safe-area-inset-bottom)` on anything fixed to the bottom edge.
- **Do** keep tap targets at 44px or more (`.tab{min-height:44px}` is the floor).

### Don't:
- **Don't** put a border on a card. A border in this system means "selectable".
- **Don't** use a grey or black shadow on the paper ground; shadows are warm
  (`rgba(200,180,160,…)`) or they are wrong.
- **Don't** let a control fall through to a user-agent default colour — an uncoloured
  `<button>` glyph once painted system blue, the only colour on that screen belonging
  to no palette here.
- **Don't** place two accent hues on one card.
- **Don't** spend the amber hub dot on anything but "today's reflection is unwritten".
- **Don't** let a `:active` transform drop a centring `translateX(-50%)`.
- **Don't** carry any `body.mod-nutrition` rule, token or material onto another screen.

---

# In progress: the Nutrition world

> **Not the app's system.** Everything below is scoped to `body.mod-nutrition`,
> which `enterModule` sets and `goHome` clears. It was approved 20 Sep 2026 for
> the nutrition screen only and has not been adopted anywhere else. It is
> recorded here because it ships in `dev/index.html` today, not because it wins.
> Do not blend it with the incumbent world above, and do not extend it to another
> surface without a decision.

## Overview

**Creative North Star: "Soft White, Light Inside"**

One material and nothing else. The ground, the cards, the header, the tab bar,
the buttons and the tab trough are all the same off-white (`--nu-ground`
#edf0f6); what distinguishes them is only whether that surface is raised out of
the page or pressed into it. There are no borders anywhere and no card is
lighter than its page. The only colour on the screen is light glowing inside the
four macro tubes, and the one lit edge that says "begin here".

## Colors

- **The Ground** (`nu-ground` #edf0f6): the one material. Page, panel, control, bar.
- **Lit edge** (`rgba(255,255,255,.95)`): light, always from the top-left.
- **Shade** (`rgba(158,166,188,.42)`, soft `.26`): shadow, always to the bottom-right.
- **Ink / Muted** (`nu-ink` #3c4254 / `nu-muted` #6b7288): a cooler, bluer ink than
  the incumbent's warm `--ink`.
- **Empty channel** (#eaecf3): the unfilled part of a tube — the material, never a
  pale wash of the colour above it.
- **The four fills**, sampled from the approved comp, not chosen by eye:
  calories `nu-cal` #fed486, protein `nu-pro` #feae9d, carbs `nu-carb` #ace3a6,
  fat `nu-fat` #b0d0fd. Water is `nu-water` #7cb2f0.

### Named Rules
**The One Material Rule.** Never a lighter card on a darker page. If an element needs
to be distinct, raise it or press it — do not tint it.

**The Empty Stays Neutral Rule.** A channel's unfilled part is #eaecf3. Tinting it
with a faint version of its own fill was the first thing rejected.

**The Light Comes From One Place Rule.** Highlight top-left, shadow bottom-right, in
every raised shadow; a pressed state swaps both inward.

## Typography

Same Assistant stack, re-ranked. The date becomes the page's headline (30px/800,
letter-spacing −0.6px, `text-align:start`) and the old title drops to a 13px/600
subtitle beneath it. Macro labels lead at 14px/700 `nu-ink` with the value
beneath at 12px/600 `nu-muted` (`direction:ltr; unicode-bidi:isolate`), in the
comp's order — name first, then value against target. The meals heading is
20px/800.

**The Eyebrow Is Removed Rule.** The tube panel's label (`.macro-title`) is
visually hidden, not restyled. The panel is read by its shapes.

## Elevation & Depth

The whole world is elevation; there is no other device.

### Shadow Vocabulary
- **Panel raised** (`-7px -7px 16px var(--nu-lit), 9px 11px 24px var(--nu-shade), inset 1px 1px 0 rgba(255,255,255,.55)`)
- **Control raised** (`-4px -4px 9px var(--nu-lit), 5px 6px 13px var(--nu-shade-soft)`)
- **Pressed / trough** (`inset 3px 4px 8px var(--nu-shade), inset -3px -3px 7px var(--nu-lit)`)
- **Channel pressed** (`inset 3px 5px 9px rgba(150,158,180,.5), inset -3px -3px 7px rgba(255,255,255,.92)`)
- **Fill glow**, per macro (`0 -6px 16px rgba(<fill>,.95), 0 0 22px rgba(<fill>,.55)`):
  brightest at the surface line, and the glow leaves the channel.
- **The write-line** (`… , 0 0 20px 4px rgba(255,226,170,.85), 0 0 42px 10px rgba(255,214,140,.45)`):
  the one lit thing on the screen.
- **Sticky edges** are a shadow collapsed to almost nothing
  (`0 10px 18px -18px var(--nu-shade)`) rather than a border.

## Shapes

Panels 26px, the write-line 22px, the tab trough 16px, tube channels 22px on a
44×188px column, the water bar a 12px-tall 6px-radius channel. Segmented
control: the trough is pressed, the chosen segment is raised out of it.

## Do's and Don'ts

### Do:
- **Do** scope every rule to `body.mod-nutrition`, `html`-prefixed where it must
  outrank `body.night`.
- **Do** keep the header opaque — a see-through sticky header let the list run under
  its own title once already.
- **Do** make a row divider light (`1px solid rgba(255,255,255,.9)` over
  `0 1px 0 rgba(158,166,188,.16)`), not ink.

### Don't:
- **Don't** add a border, a white card, or a second material.
- **Don't** tint an empty channel.
- **Don't** let this world's tokens or shadows appear outside `body.mod-nutrition`.
