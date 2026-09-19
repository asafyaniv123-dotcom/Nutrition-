# Figma exports

Drop exports here — `radius.png`, `elevation.png`, `type.png`, `line.png`.
PNG at 2x, or SVG. Say in chat when something new lands and I read it from
here.

This sits inside the Taste library on purpose. **The direction comes from
you.** Two design attempts were built and rejected in a single day because
the direction came from my taste instead; the folder you are standing in
exists because of that. So what follows says what to DRAW and what each thing
is replacing. It does not say what any of it should look like.

---

## Why the vocabulary and not the screens

`node tools/css-census.mjs`, today:

    1,581 CSS rules in dev/index.html
    1,031 of them are shared vocabulary, belonging to no single area

The per-area counts are 3 to 135. **The app is not nine screens with nine
looks. It is a few dozen shared rules that all nine screens are built out
of.** Nine screen mockups would describe the wrong unit of work — and
redrawing screens is what `night-redesign` did before it was rolled back.

And one measurement decides where to start:

| | already tokenised? |
|---|---|
| colour | **yes** — 36 CSS custom properties, `--ink`, `--violet-500`, `--surface` … |
| radius | no |
| elevation | no |
| type | no |
| line | no |

Colour already has a vocabulary and can be changed in one place. The other
four are written out by hand, hundreds of times, with no name for any value.
That is the whole job.

---

## The four to draw

### 1 · Radius — the clearest target in the file

    421 declarations, 34 distinct values
    58x 50%   46x 14px   44x 12px   30x 13px   29x 11px
    29x 10px  26x 20px   23x 9px    21x 16px   19x 8px

Nine values between 8 and 20 px, doing the work of about three. 8, 9, 10, 11,
12, 13, 14 are not seven decisions — they are one decision made seven times by
different hands.

**Draw:** a radius ramp. How many steps, and what they are, is yours. Show a
card, a button, a chip and a pill at each step so the steps are argued about
against real objects rather than against squares.

### 2 · Elevation — 29 rules shout louder than the loudest thing on the home board

    74 shared rules cast a shadow, 67 of them a DROP shadow
    29 rules are louder than the hub's own 0.32
    loudest: .hcards.nodes .hcard 0.95, .td-dot 0.90, .hub-dot 0.80

A drop shadow says *here is a separate object and there is a gap under it*.
Whether the app wants to say that at all is a direction question, and it is
yours.

**Draw:** the levels you want to exist — flat, raised, floating, whatever the
set turns out to be — and what each one is FOR. A level with no job gets used
for decoration, which is how a file arrives at 34 radii.

### 3 · Type — a scale with no scale

    641 declarations, 30 distinct values
    70x 11px  67x 11.5px  62x 12px  60x 10px  51x 13px
    48x 9.5px  48x 10.5px  48x 12.5px

Half-pixel sizes, and 9.5 through 13 covering everything. Six sizes are
probably five too few and thirty are twenty-five too many.

**Draw:** the scale, each step with the role it plays on a real screen —
a number on a card, a label under it, a body line, a section heading. The app
is read at arm's length on a phone, in eleven languages, and Hebrew and
Japanese do not sit on a Latin baseline the same way.

### 4 · Line — 73 rules draw a border

    only 3 rules draw a border AND a drop shadow

The file has already half-decided, by accident, that a rim and a shadow are
alternatives rather than partners. Worth making on purpose.

**Draw:** what a divider is, what an outline is, and whether they are the same
weight.

---

## What happens after an export lands

1. I read it and write the tokens — `--r-card`, `--e-raised`, `--t-body` — as
   names beside the values that already exist.
2. Each pass replaces hand-written values with the token, **one vocabulary at
   a time**, and is proved by REVERSING it: undo the pass and the file has to
   come back byte for byte. A pass that cannot be reversed cleanly is wrong.
3. `node tools/css-census.mjs` after each one — the distinct-value counts are
   the score, and they only ever go down.
4. Nothing about the *appearance* changes until the vocabulary exists. That is
   the lesson from `night-redesign`, and from the two attempts on 5 September
   that this folder was created to prevent.
