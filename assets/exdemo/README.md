# Exercise demo loops (3 Nov 2026)

One silent 5-second loop per exercise, named by its id in data/exercises.json:
a single correct repetition that starts and ends in the same pose, so it loops
without a jump. A warm glowing amber figure on a warm dark ground (Asaf chose
this over blue, which read as a copy of the ad that inspired it, and over amber
on the light ground). Shown by exDemoHTML() in "איך מבצעים" and on the
library page; EX_DEMO lists the ids that have one. Lives here, not in dev/,
because liveBase() serves dev from the working copy and stable from stable/.

**Form comes first.** Every clip follows the research in
reports/טכניקה נכונה לעשרה תרגילים.md (start and turnaround positions, path,
grip, faults never to show), and is checked frame by frame with ffmpeg before
it lands here.

Made in Higgsfield: a start frame with gpt_image_2_5 (style reference: the squat
frame, job 0737425a; for x1, also two public-domain US Army bench-press photos
as pose references), then seedance_2_0, mode fast, 720p, 5 s, no audio, 1:1,
with that same frame as both start_image and end_image. Re-encoded to 540x540
H.264 CRF 26, about 90-130 KB each.

Redone from the research: x1 (the first had the bar running along the body),
x229 (the first stepped back, then both feet moved; now only the front foot
steps), x71 (was a front view with the plates leaving the frame; now a side
view showing the bar path). x192 (plank) is a hold, so it barely moves.

Six more (3 Nov), from reports/טכניקה נכונה לשישה תרגילים נוספים.md, which
names for each exercise the one part that must stay still - every clip was
checked against it: x34 lat pulldown (torso angle constant, bar in front of
the face), x149 Romanian deadlift (knee angle constant; goes to mid-shin,
deeper than the report's conservative just-below-the-knee), x96 dumbbell curl
(elbows fixed; palms turn up during the lift - the image model would not draw
a palms-forward start), x108 triceps pushdown (upper arms fixed), x135 leg
press (hips stay on the pad, knees not locked), x72 dumbbell shoulder press
(seated against an upright back rest, the report's safest choice). Their
frames were built from the written spec alone: the good references for these
six are CC BY-SA, whose terms would carry over to a close redraw.

## 6 Nov: two poses and a cross-fade

From here on a loop is made the way exercise-sheets/ describes: Asaf sends two
poses (or a screen recording of a reference GIF, read by
tools/sheets/poses-from-video.mjs), each is copied in the app's style and he
approves it, tools/sheets/align.mjs makes the still body identical in both, and
tools/sheets/gif.mjs writes the cycle - 1.0 s on each pose, a 0.6 s cross-fade -
as anim.gif for the review page and anim.mp4 for here. No video model. Twelve so
far: x13 x24 x236 x6 x84 x115 x67 x82 x74 x86 x17 x237.
