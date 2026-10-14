# cutout-eyes-cloud-1.png · -2.png · -3.png

Three saves of the same character: a soft white cloud-blob on blue, with two
tall rounded-rectangle eyes and **no mouth**. -1 and -3 are the plain version;
-2 is the same creature on a night ground with bigger eyes carrying a
four-point sparkle and a small dot. -2 is the Sora app icon.

## What Asaf said

> זה סגנון מצויין לאיך הפנים של השמש יכולה להראות. רק העיניים אולי יספיקו.
> נותן אווירה קצת של ״מריו״ אני אוהב את הפנים האלה.

Sent 14 October 2026. He is pointing at the FACE, not at the cloud and not at
the rendering.

## What to notice

**THE EYES ARE A HOLE, NOT INK.** They are not two dark shapes drawn on the
body — they are the body's material removed, with the ground showing through,
and the cut has a lit edge on one side and a shadow on the other. That is a
completely different device from painting two ellipses on a face, and it is
most of why this reads as an object rather than as a drawing of one.

**THERE IS NO MOUTH.** Two shapes carry the entire character. This is the
single most useful thing in the reference for us, because a mouth is the first
thing that mushes at small sizes and ours is a 3.4px stroked arc.

**THE EYE IS A STADIUM, NOT A CIRCLE.** Tall, straight-sided, fully rounded at
both ends. That shape is exactly what he means by "מריו" — Nintendo's clouds
and hills use it — and a round dot in the same position does not read the same
way at all. The two eyes are far apart and sit a little BELOW the vertical
centre, which is what makes a blob read as a face rather than as a thing with
two holes in it.

**NO OUTLINE ANYWHERE.** The silhouette is held by the fill meeting the
ground, with a light rim top-left and a soft shadow bottom-right.

**-2 IS THE SAME FACE AWAKE.** Same two eyes, enlarged, with a sparkle inside.
So a second expression is available without a second vocabulary — which is the
same economy as [[lit-when-done]], where state is one device at two strengths.

## Where it applies

**The sun's face.** Ours today (`sunMarkHTML`) is an upright oval eye
`rx=4.1 ry=5`, PLUS a mouth drawn as a 3.4px arc, PLUS two blush ellipses.
Against this reference that is three devices where one would do. The change it
suggests is concrete and costs nothing to try: stadium eyes, no mouth, no
blush.

## The hard part — and it is a real one

**CUT-OUT EYES NEED THE GROUND TO BE DARKER THAN THE BODY.** Here the body is
white and the ground is blue, so a hole reads instantly. Our sun is amber
`#f0a92e` on a near-white ground `#e9e7e3` — a hole punched through it shows
something LIGHTER than the body, which will not read as an eye at all. So the
device has to be translated rather than copied: the eye is a shape cut INTO
the disc, filled with a deeper amber or a brown-grey, with a lit edge on its
upper rim, so it reads as depth rather than as a window. That is the one thing
to get right, and it has to be settled before any image is generated.

**AND THE RENDERING DOES NOT TRANSFER.** These are 3D claymorphic renders —
specular highlights, ambient occlusion, soft shadow catching. The app is flat
SVG with gradients in a single HTML file, and the sun has to breathe, spin its
rays while the app is thinking, and take the app's own tokens. Asked for a
picture in this style we would get something lovely that cannot become any of
that; see [[dont-rebuild-a-render]]. Take the face; leave the material.

Related: [[soft-white-light-inside]] — one material, and the only colour is
light. A cut that catches light on its rim is that language exactly; a painted
black oval is not.
