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
