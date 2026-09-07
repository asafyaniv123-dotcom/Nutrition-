# selected-look-flat-lay.png

A saved outfit from a styling app: an olive tiger-print tee, brown corduroy
trousers, brown Dr Martens, tortoiseshell sunglasses, a green-strap watch and
five silver rings — every item cut out and floating on a flat grey ground.

## What Asaf said

> מה שאהבתי בזה זה את רעיון התצוגה של הלוק הנבחר. יכול להיות מצויין עבור סיכומי
> הלוקים באזור הארון שלי

## What the layout actually does

**It draws a person without drawing a person.** Tee above trousers above shoes,
at roughly the proportions a body would give them. Nothing outlines a figure and
no mannequin is used, but the eye assembles one anyway. That is the whole trick,
and it is why this reads as *an outfit* rather than *six products*.

**Two zones, and they mean different things.** The garments hold the left as a
single vertical column — the thing you wear. The accessories sit to the right in
their own loose stack — the things you add. Nobody labels the zones; the spacing
does it. Notice the belt is *threaded into* the trousers rather than floating
with the accessories, which is the same rule applied at a smaller scale: it is
worn as part of the trousers, so it lives with them.

**Scale is honest, not uniform.** The tee is large, the rings are tiny, and they
sit at something close to their real relative sizes. A grid of equal thumbnails
would have made a ring as important as a coat.

**The ground does the work.** One flat, slightly warm grey behind everything, no
cards, no borders, no shadows. Every item is cut out, so the only edges on screen
are the clothes' own. That is what lets six photographs sit together without
looking like six photographs.

## Where it applies: the saved looks

`_closetView==='outfits'` renders each saved look as `.cl-fit-row` — **a
horizontal row of equal-sized thumbnails**, one per category, in category order,
with a date and two buttons under it. It is a correct list and it is not a look.
A row says *these five items*; the reference says *this is how it goes together*.

The gap is worth closing precisely because of what the closet is for. You do not
save an outfit to remember which five garments exist; you save it to remember
that they worked.

## The hard part, and it is real

**The app has no cut-outs.** Adding a garment runs a crop flow — `_cropQ`,
`cropNext`, `cropThumb` — so what is stored is a cropped rectangle of a real
photograph, background and all: a shirt on a bed, trousers on a hanger. Stack
those in a body silhouette and you get six grey rectangles in a column, which is
worse than the row we already have, not better.

So this reference cannot be copied. It has to be **translated**, and there are
three honest routes:

1. **Silhouette without cut-outs.** Keep the rectangles but size and place them
   by category — top wide and high, trousers tall and centred, shoes small and
   low — so the *arrangement* carries the body even though each photo is still a
   rectangle. Cheapest, and it gets most of the effect. Rounded corners and a
   single flat ground would do a lot of the rest.
2. **Cut out on the device.** `createImageBitmap` plus a canvas can do a rough
   background removal for a garment shot against a plain surface, and the app
   already paints to canvas in three places. Good results need a real segmentation
   model, which is a large download and a bad fit for a page that loads on a
   phone.
3. **Ask for the cut-out at capture time.** iOS has had subject lifting since 16;
   a photo picked from Photos can already be a cut-out if the person made one.
   That puts work on Asaf rather than on the app, which is the wrong trade for a
   feature meant to be quick.

**Route 1 is the one to try**, and it is worth building before deciding anything
about the other two — if the arrangement alone reads as an outfit, the cut-outs
were never the point.

## For the Hebrew

Nothing here is directional. The garment column and the accessory column are a
composition, not a reading order, so mirroring them in RTL would be optional
rather than required — and probably wrong, since the tee/trousers/shoes stack is
vertical and carries the meaning on its own.

Related: [[dallo-stones-dashboard]] for the same instinct about a quiet ground
doing the work instead of cards.
