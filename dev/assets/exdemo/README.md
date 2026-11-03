# Exercise demo loops - pilot (3 Nov 2026)

One silent 5-second loop per exercise, named by its id in data/exercises.json:
a single correct repetition that starts and ends in the same pose, so it loops
without a jump. Warm glowing amber figure on a warm dark ground (Asaf chose this
over blue, which read as a copy of the ad that inspired it, and over orange on
the light ground).

Made in Higgsfield: a start frame with gpt_image_2_5 (style reference: the squat
frame, job 0737425a), then seedance_2_0, mode fast, 720p, 5 s, no audio, 1:1,
with that same frame as both start_image and end_image. Re-encoded to 540x540
H.264 CRF 26, about 90 KB each.

Known: x229 (lunge) - both feet move a little rather than a clean step forward;
x71 (overhead press) - the plates leave the frame at lockout; x192 (plank) is a
hold, so it barely moves. Not wired into the app yet.
