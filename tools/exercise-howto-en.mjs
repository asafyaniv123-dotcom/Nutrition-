/* The exercise instructions in English.
 *
 * Keyed by the Hebrew name, which is the exercise's identity everywhere in
 * this repo - `n` in exercises.json, the key in HOWTO, the stored id in a
 * logged set. A translation file keyed by anything else would drift the first
 * time a name was reworded.
 *
 * ENGLISH IS THE PIVOT, and that is why it is first. CLAUDE.md: "Write English
 * as the original, not as a translation of the Hebrew… every other language is
 * written from the English, because a Japanese translator does not read
 * Hebrew." So these are written to stand on their own - a person under a bar
 * reading English - while saying the same things in the same order as the
 * Hebrew, because the app shows them as a numbered list and the build refuses
 * a language whose line count differs.
 *
 * WHICH ONES, AND WHY NOT BY TASTE. Taken a slice at a time, mechanically:
 * the first exercise of each of the eighteen muscle groups, then the second,
 * and so on - which is the primary movement for that group in the order the
 * data already declares. Three of the eighteen carry no Hebrew instructions at
 * all, so the first slice was fifteen and the second sixteen.
 *
 * 52 of the 96 exercises that have instructions, 338 lines of the 625 that
 * exist. `node tools/build-exercises.mjs` prints the number that has to go
 * down, so it is never a matter of anyone remembering.
 *
 * The mistakes matter more than the steps. Every site on earth has the steps;
 * what a person actually needs is to be told the thing they are doing wrong
 * while they are doing it.
 */
export const EN = {

'לחיצת חזה במוט': {
  s: ['Lie back on the bench with your eyes under the bar and your feet flat and stable on the floor.',
      'Grip a little wider than your shoulders, wrists stacked straight over your elbows.',
      'Lower the bar to mid-chest as you breathe in, elbows about 45 degrees from your body.',
      'Drive up and breathe out through the hard part.'],
  m: ['Elbows flared to 90 degrees — that loads the shoulder joint.',
      'Bouncing the bar off your chest instead of pausing quietly.',
      'Hips lifting off the bench to help you press more.'] },

'מתח': {
  s: ['Grip slightly wider than your shoulders, palms facing away.',
      'Start from straight arms with your shoulders pulled down and back.',
      'Pull until your chin clears the bar, elbows driving towards your ribs.',
      'Lower slowly and under control to a full hang.'],
  m: ['Swinging your body to build momentum.',
      'Dropping instead of lowering — that throws away the useful half.',
      'A short range that never reaches straight arms at the bottom.'] },

'חתירה במוט': {
  s: ['Feet about hip width, knees slightly bent.',
      'Hinge forward to roughly 45 degrees, back flat.',
      'Pull the bar to your lower stomach, shoulder blades drawing together.',
      'Lower under control until your arms are straight.'],
  m: ['A rounded back — the main risk in this movement.',
      'Standing up as you pull, to move more weight.',
      'Pulling too high, to the chest instead of the stomach.'] },

'משיכת כתפיים במשקולות': {
  s: ['Dumbbells at your sides, arms straight.',
      'Pull your shoulders straight up towards your ears.',
      'Pause for a moment at the top.',
      'Lower slowly until you feel the stretch.'],
  m: ['Rolling the shoulders in a circle — pointless, and it loads the joint.',
      'Bending the elbows, which turns it into a row.',
      'A short range with far too much weight.'] },

'הרמת גב': {
  s: ['Set yourself in the bench with your hips on the pad.',
      'Back flat, hands on your chest or behind your head.',
      'Lower to about 45 degrees and rise back to a straight line.',
      'Do not go past the line of your body at the top.'],
  m: ['Over-extending at the top, which crunches the lower back.',
      'Dropping fast and stopping sharply.',
      'Adding weight behind your head before the movement is clean.'] },

'כפיפת מרפק במוט': {
  s: ['Bar in front of your thighs, underhand grip about shoulder width.',
      'Elbows tucked against your ribs and kept there.',
      'Curl until the bar reaches chest height.',
      'Lower slowly to almost straight.'],
  m: ['Rocking your torso back to get the bar up.',
      'Elbows drifting forward at the end of the movement.',
      'Dropping the bar, which gives away the useful half.'] },

'פשיטת מרפק בפולי': {
  s: ['Stand facing the cable, elbows tucked against your ribs.',
      'Push down until your elbow is fully straight.',
      'Pause a moment at the bottom without forcing the joint locked.',
      'Return to about 90 degrees under control.'],
  m: ['Elbows travelling backwards — that turns it into a row.',
      'Leaning forward to push with your bodyweight.',
      'A short range that never straightens.'] },

'כפיפת שורש כף יד': {
  s: ['Sit with your forearms on your thighs, palms facing up.',
      'Let your wrists hang just past your knees.',
      'Lower the bar until you feel the stretch, then curl it up.',
      'Move slowly — the range is small.'],
  m: ['Moving the whole forearm instead of only the wrist.',
      'Heavy weight on a small muscle — that is how elbows get hurt.'] },

'סקוואט': {
  s: ['Bar across your upper back, feet about shoulder width, toes turned out a little.',
      'Breathe in, brace your stomach, and break at the hip and the knee together.',
      'Descend until your thigh is at least parallel, knees tracking over your toes.',
      'Drive up through the middle of your foot.'],
  m: ['Knees collapsing inwards on the way up.',
      'Heels lifting off the floor — usually a stiff ankle.',
      'The lower back rounding at the bottom, from going deeper than your hips allow.'] },

'דדליפט רומני': {
  s: ['Start standing with the bar at your thighs, knees softly bent and kept there.',
      'Push your hips back and lower the bar down the line of your legs.',
      'Go down until you feel the stretch in your hamstrings — usually mid-shin.',
      'Return by driving your hips forward.'],
  m: ['Bending the knees on the way down — that is an ordinary deadlift.',
      'Going by how low you can reach instead of by the stretch.',
      'A back that rounds at the bottom.'] },

'הרחקת ירך במכונה': {
  s: ['Sit with the pads on the outside of your thighs.',
      'Press your knees outwards against the resistance.',
      'Pause a moment at full opening.',
      'Close slowly — do not let the weight close you.'],
  m: ['Leaning far back to move more weight.',
      'Letting it snap shut with no braking.'] },

'הרמת עקבים בעמידה': {
  s: ['Pads on your shoulders, the balls of your feet on the step, heels in the air.',
      'Lower until your calf is fully stretched.',
      'Rise as high as you can onto your toes.',
      'Pause a moment at the top.'],
  m: ['Short bounces with no range.',
      'Knees bending and hiding the movement.',
      'No pause at the top — the calf barely works.'] },

'כפיפות בטן': {
  s: ['Lie with your knees bent, hands beside your head without pulling.',
      'Curl your chest towards your hips, shoulder blades leaving the floor.',
      'Pause a moment at the top.',
      'Lower slowly without settling all the way down.'],
  m: ['Pulling on your neck with your hands.',
      'Lifting the whole back off the floor — that is a hip flexor movement.',
      'Going fast and without control.'] },

'פלאנק צידי': {
  s: ['Lie on your side with your elbow under your shoulder.',
      'Lift your hips into a straight line from ankle to head.',
      'Hips forward, not rotated.',
      'Hold, then change sides.'],
  m: ['Hips dropping backwards or sagging down.',
      'The shoulder collapsing onto the elbow.'] },

'ריצה': {
  s: ['Start with five minutes of walking or easy running.',
      'Eyes ahead, shoulders loose.',
      'Land underneath your body rather than in front of it.',
      'Finish by walking, not by stopping dead.'],
  m: ['Adding distance too quickly — that is how overuse injuries happen.',
      'Over-striding, landing on the heel out in front of you.'] },

/* ── the second movement of each group ─────────────────────────────── */

'לחיצת חזה במשקולות': {
  s: ['Sit on the bench with the dumbbells on your thighs, then lie back as you bring them up.',
      'Start with the dumbbells over your chest, palms facing forward.',
      'Lower them to the sides of your chest until your elbow is just below shoulder height.',
      'Press up on a slight inward arc, without clashing the dumbbells together.'],
  m: ['Going too deep — that is what makes the front of the shoulder ache.',
      'Finishing the press by banging the dumbbells together, which loses the tension.',
      'Too wide a path, which turns it into a fly.'] },

'לחיצת כתפיים במוט': {
  s: ['Bar on your upper chest, grip a little wider than your shoulders.',
      'Brace your stomach and your glutes — no leaning back.',
      'Press overhead, moving your head slightly forward as the bar passes.',
      'Finish with the bar locked out over the middle of your foot.'],
  m: ['Arching your back to press — that is a standing bench press.',
      'Pressing forward instead of up.',
      'Elbows flaring out to the sides.'] },

'מתח אחיזה תחתונה': {
  s: ['Grip about shoulder width, palms facing you.',
      'Start from straight arms with your shoulders down.',
      'Pull until your chin clears the bar.',
      'Lower under control to a full hang.'],
  m: ['Kicking your legs for momentum.',
      'A partial range that stops halfway.',
      'Elbows flaring out instead of staying close.'] },

'חתירה במשקולת יד': {
  s: ['One knee and one hand on the bench, back flat and parallel to the floor.',
      'Dumbbell in your free hand, arm hanging straight down.',
      'Pull the dumbbell to the side of your stomach, elbow close in.',
      'Lower under control to a full stretch.'],
  m: ['Twisting your torso to lift more.',
      'Pulling out and away rather than in to your side.',
      'A rounded back, usually from a bench that is too low.'] },

'משיכת כתפיים במוט': {
  s: ['Bar in front of you, grip about shoulder width.',
      'Pull your shoulders straight up.',
      'Pause a moment and lower slowly.',
      'Do not roll them and do not bend your elbows.'],
  m: ['Using your legs to give it a bounce.',
      'A short range that never reaches the stretch at the bottom.'] },

'גוד מורנינג': {
  s: ['Bar across your upper back, feet about hip width, knees soft.',
      'Push your hips back and let your torso come forward.',
      'Go down to parallel, or as far as the stretch in your hamstrings allows.',
      'Return by driving your hips forward.'],
  m: ['A rounded back — this movement does not forgive one.',
      'Heavy weight before you own the movement.',
      'Bending the knees, which hides the mobility you do not have.'] },

'כפיפת מרפק במשקולות': {
  s: ['Dumbbells at your sides, elbows tucked against your ribs.',
      'Curl the elbow without moving your upper arm.',
      'Pause at the top without bringing the dumbbell to your shoulder.',
      'Lower slowly to almost straight.'],
  m: ['Elbows drifting forward — then the shoulder takes the work.',
      'Rocking your body to give it momentum.',
      'A partial range that never straightens at the bottom.'] },

'פשיטת מרפק בחבל': {
  s: ['High cable with a rope, elbows tucked against your ribs.',
      'Push down and spread the rope apart at the end.',
      'Pause a moment at full extension.',
      'Return to about 90 degrees under control.'],
  m: ['Elbows travelling backwards.',
      'Leaning forward to push with your bodyweight.'] },

'אחיזת חוואי': {
  s: ['A heavy dumbbell in each hand, at your sides.',
      'Chest open, shoulders back and down.',
      'Walk a set distance or for a set time.',
      'Put them down under control rather than dropping them.'],
  m: ['Shoulders rounding forward under the load.',
      'Walking fast and losing the posture.'] },

'סקוואט קדמי': {
  s: ['Bar on the front of your shoulders, elbows high.',
      'More upright than a back squat.',
      'Descend straight down, elbows staying up.',
      'Drive up without letting the elbows drop.'],
  m: ['Elbows dropping — the bar rolls forward.',
      'Trying to hold the bar in your hands instead of on your shoulders.'] },

'כפיפת ברך בשכיבה': {
  s: ['Lie face down with the pad just above your ankles.',
      'Keep your hips pressed into the bench.',
      'Curl up close to your backside and pause a moment.',
      'Lower slowly to almost straight.'],
  m: ['Hips lifting off the bench — a sign the weight is too heavy.',
      'Letting it drop on the way down.'] },

'היפ ת׳ראסט': {
  s: ['Upper back on the bench, bar padded across the crease of your hips.',
      'Feet close to your backside, shins vertical at the top.',
      'Drive your hips up to a straight line from knee to shoulder.',
      'Squeeze your glutes for a second at the top and lower under control.'],
  m: ['Arching the lower back instead of extending the hip — that is what aches afterwards.',
      'Chin lifting; look forward instead.',
      'A partial range that never reaches the straight line.'] },

'הרמת עקבים בישיבה': {
  s: ['Knees under the pad, the balls of your feet on the step.',
      'Lower until your calf is fully stretched.',
      'Rise as high as you can.',
      'Pause a moment at the top.'],
  m: ['Short bounces with no range.',
      'No pause at the top.'] },

'כפיפות בטן בפולי': {
  s: ['Kneel facing a high cable, rope beside your head.',
      'Curl your chest down towards your knees.',
      'The work is in your stomach, not your arms.',
      'Return slowly against the weight.'],
  m: ['Pulling with your arms instead of curling your torso.',
      'Bending at the hip rather than through the stomach.'] },

'טוויסט רוסי': {
  s: ['Sit with your knees bent and your torso leaning back about 45 degrees.',
      'Back flat, not rounded.',
      'Rotate your torso from side to side.',
      'The rotation comes from your torso, not your arms.'],
  m: ['A rounded back, which loads the lower spine.',
      'Swinging your arms while the torso never turns.'] },

'הליכון': {
  s: ['Start with a few minutes of walking.',
      'A slight incline of 1–2% is closer to running outdoors.',
      'Do not hang on to the handrails.',
      'Finish by slowing down gradually.'],
  m: ['Holding the rails, which lowers the effort and distorts your posture.',
      'Jumping straight to a high speed with no warm-up.'] },

/* ── the third movement of each group ──────────────────────────────── */

'לחיצת חזה בשיפוע חיובי': {
  s: ['Set the bench to about 30 degrees — no more.',
      'Grip as you would on the flat press, bar over your upper chest.',
      'Lower to your collarbone, elbows not fully flared.',
      'Press back up over the same point.'],
  m: ['An incline of 45 degrees or more — the movement becomes a shoulder press.',
      'Lowering to mid-chest instead of the upper chest.'] },

'לחיצת כתפיים במשקולות': {
  s: ['Sit against the backrest with the dumbbells at ear height.',
      'Brace your stomach, elbows slightly forward rather than in line with your body.',
      'Press up to almost straight.',
      'Lower under control back to ear height.'],
  m: ['Arching the lower back to press.',
      'Clashing the dumbbells together at the top.',
      'Going too low, which stretches the shoulder.'] },

'מתח בסיוע גומייה': {
  s: ['Loop a band over the bar and put a knee or a foot in it.',
      'Same grip and same movement as an ordinary pull up.',
      'Pick a band that lets you do six to eight clean reps.',
      'Move to a thinner band once that gets easy.'],
  m: ['A band so strong it does the work for you.',
      'Giving up the slow lower because there is help.'] },

'חתירה בפולי בישיבה': {
  s: ['Feet on the platform, knees slightly bent.',
      'Back flat, hands on the handle, arms straight.',
      'Pull to your lower stomach, shoulder blades drawing together.',
      'Return forward under control without rounding your back.'],
  m: ['Leaning far back, which hands the work to the lower back.',
      'A back that rounds at the end of the return.',
      'Pulling fast and stopping sharply.'] },

'כפיפת פטיש': {
  s: ['Dumbbells at your sides, palms facing your body.',
      'Keep that grip through the whole movement.',
      'Curl the elbow to chest height.',
      'Lower slowly to straight.'],
  m: ['Rotating the wrist on the way up — that is an ordinary curl.',
      'Elbows drifting forward.'] },

'סקאל קראשר': {
  s: ['Lie on the bench with the bar over your chest, arms straight.',
      'Lower the bar towards your forehead by bending the elbow only.',
      'The upper arm stays vertical.',
      'Press back up.'],
  m: ['Letting the upper arm travel back — that turns it into a pullover.',
      'Lowering to your forehead with a weight you cannot control.',
      'Elbows flaring out to the sides.'] },

'סקוואט גובלט': {
  s: ['Hold a dumbbell upright against your chest with both hands.',
      'Feet about shoulder width, toes turned out a little.',
      'Descend straight down, elbows between your knees.',
      'Drive up through the middle of your foot.'],
  m: ['The dumbbell drifting away from your body and pulling you forward.',
      'A partial descent because the weight is too heavy.'] },

'כפיפת ברך בישיבה': {
  s: ['Set the pad above your ankles and the backrest against your thigh.',
      'Keep your back against the rest.',
      'Curl all the way and pause a moment.',
      'Return slowly.'],
  m: ['Leaning forward to help.',
      'A partial range with far too much weight.'] },

'גשר ישבן': {
  s: ['Lie on your back, knees bent, feet close to your backside.',
      'Drive through your heels and lift your hips.',
      'Pause at the top in a straight line from knee to shoulder.',
      'Lower under control without settling all the way down.'],
  m: ['Arching the lower back instead of extending the hip.',
      'Feet too far away — then the hamstrings take it.'] },

'הרמת רגליים בתלייה': {
  s: ['Hang from the bar with your shoulders active rather than slack.',
      'Raise your legs straight, or with the knees bent.',
      'Curl your hips up slightly at the end — that is where the stomach works.',
      'Lower slowly without swinging.'],
  m: ['Swinging your body, which turns it into momentum.',
      'Lifting from the hip alone, with no curl of the pelvis.'] },

'אופני כושר': {
  s: ['Set the saddle height: your knee almost straight at the bottom of the stroke.',
      'Back flat, shoulders loose.',
      'Push through the full circle, not only downwards.',
      'Start and finish on a low resistance.'],
  m: ['A saddle set too low — that is what makes knees ache.',
      'Rocking your hips side to side on a high resistance.'] },

/* ── the fourth movement of each group ─────────────────────────────── */

'לחיצת חזה בשיפוע חיובי במשקולות': {
  s: ['Bench at 30 degrees, dumbbells on your thighs, lie back as you bring them up.',
      'Start over your upper chest, palms facing forward.',
      'Lower to the sides of your chest until your elbow is just below shoulder height.',
      'Press up on a slight inward arc.'],
  m: ['Too steep an incline — the shoulder takes the work.',
      'Going too deep on an incline, which stretches the front of the shoulder.',
      'Clashing the dumbbells at the top and losing the tension.'] },

'לחיצת כתפיים במכונה': {
  s: ['Set the seat so the handles are at shoulder height.',
      'Back against the rest.',
      'Press up to almost straight.',
      'Return under control.'],
  m: ['A seat set too low, forcing an awkward angle.',
      'Snapping the elbows locked at the top.'] },

'פולי עליון': {
  s: ['Set the thigh pad so you cannot lift off the seat.',
      'Grip slightly wider than your shoulders.',
      'Pull the bar to your upper chest, elbows driving down and back.',
      'Return under control to almost straight arms.'],
  m: ['Pulling behind your neck — a shoulder risk with nothing to show for it.',
      'Leaning far back, which turns it into a row.',
      'Pulling with your hands instead of leading with your elbows.'] },

'חתירה במכונה': {
  s: ['Set the seat so the handles are at lower-chest height.',
      'Chest stays against the pad throughout.',
      'Pull the handles back, elbows close to your sides.',
      'Return under control until you feel the stretch in your back.'],
  m: ['Chest coming off the pad to move more weight.',
      'Pulling too high, which turns it into a reverse fly.'] },

'כפיפה בסקוט': {
  s: ['Set the pad so your armpit rests on it.',
      'Upper arms flat along the pad.',
      'Curl to chest height without lifting your elbows.',
      'Lower to almost straight — not a hard lockout.'],
  m: ['Snapping straight at the bottom, which loads the elbow joint.',
      'Elbows lifting off the pad.',
      'A weight so heavy it stops you lowering all the way.'] },

'פשיטת מרפק מעל הראש': {
  s: ['One dumbbell in both hands, overhead.',
      'Elbows close to your head and pointing up.',
      'Lower behind your head by bending the elbow.',
      'Extend back to straight.'],
  m: ['Elbows flaring out, which loses the stretch.',
      'Arching the lower back as you press up.'] },

'סקוואט משקל גוף': {
  s: ['Feet about shoulder width, arms forward for balance.',
      'Break at the hip and the knee together.',
      'Descend at least to parallel.',
      'Rise through the middle of your foot.'],
  m: ['Knees collapsing inwards.',
      'Heels lifting off the floor.',
      'A half descent out of habit.'] },

'דדליפט סומו': {
  s: ['Wide stance, toes out, hands inside your legs.',
      'Flat back, chest open, hips lower than an ordinary deadlift.',
      'Push the floor apart and stand, the bar close to your legs.',
      'Finish with your hips and glutes locked out.'],
  m: ['Knees collapsing inwards on the way up.',
      'A rounded back from trying to sit lower than you can.',
      'The bar drifting away from your shins.'] },

'הרמת רגליים בשכיבה': {
  s: ['Lie down, hands at your sides or under your hips.',
      'Keep your lower back pressed into the floor.',
      'Raise to 90 degrees and lower slowly.',
      'Stop before your back leaves the floor.'],
  m: ['The lower back arching — that is the signal to stop.',
      'Dropping your legs all the way down.'] },

'אליפטיקל': {
  s: ['Stand tall, whole foot on the plate.',
      'Use the handles too, not only your legs.',
      'Hold a steady rhythm.',
      'Add resistance before you add speed.'],
  m: ['Leaning your whole weight on the handles.',
      'A fast rhythm on no resistance — it looks like effort and is not.'] },




};
