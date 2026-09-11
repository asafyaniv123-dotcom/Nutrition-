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
 * 62 of the 96 exercises that have instructions, 404 lines of the 625 that
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

/* ── the fifth movement of each group ──────────────────────────────── */

'לחיצת חזה בשיפוע שלילי': {
  s: ['Hook your feet into the decline bench and lie back.',
      'Grip as you would on the flat press, bar over your lower chest.',
      'Lower to the bottom of your chest under control.',
      'Press back up over the same point.'],
  m: ['Sitting up quickly at the end of the set — head-down makes you dizzy.',
      'Lowering to mid-chest instead of the lower chest.',
      'Training alone with a heavy weight and no spotter.'] },

'לחיצת ארנולד': {
  s: ['Start with the dumbbells in front of your chest, palms facing you.',
      'Rotate your hands outwards as you press up.',
      'Finish with palms forward and arms straight.',
      'Return along the same path, rotating back.'],
  m: ['Rotating after the press instead of during it.',
      'A weight so heavy it stops the rotation being clean.'] },

'פולי עליון אחיזה צרה': {
  s: ['A triangle handle, or a grip about shoulder width.',
      'Pull to your upper chest, elbows close to your body.',
      'Pause a moment as the handle reaches your chest.',
      'Return to almost straight arms.'],
  m: ['Leaning far back, which turns it into a row.',
      'Pulling with your hands instead of your elbows.'] },

'חתירת T': {
  s: ['Stand over the bar, torso hinged forward, back flat.',
      'Take the handles and pull towards your stomach.',
      'Shoulder blades draw together at the end of the pull.',
      'Lower under control until your arms are straight.'],
  m: ['Standing up as you pull.',
      'A rounded back — dangerous with heavy weight.',
      'A short range because the weight is too much.'] },

'כפיפת מרפק בפולי': {
  s: ['Low cable, straight bar or rope.',
      'Elbows tucked against your ribs.',
      'Curl to chest height, tension constant throughout.',
      'Return slowly against the cable.'],
  m: ['Leaning back to help.',
      'Elbows drifting backwards at the end.'] },

'לחיצת חזה אחיזה צרה': {
  s: ['Grip about shoulder width — no narrower.',
      'Elbows close to your body throughout.',
      'Lower to your lower chest.',
      'Press up, thinking about straightening the elbow.'],
  m: ['Too narrow a grip, which hurts the wrist.',
      'Elbows flaring, which turns it back into a bench press.'] },

'לחיצת רגליים': {
  s: ['Feet in the middle of the platform, about hip width.',
      'Release the catch and lower to about 90 degrees at the knee.',
      'Lower back stays against the pad the whole way.',
      'Press without forcing your knees locked.'],
  m: ['Going so low your hips lift off the pad — that loads the lower back directly.',
      'Snapping the knees locked at the top.',
      'A short range with far too much weight.'] },

'סווינג קטלבל': {
  s: ['Feet about shoulder width, kettlebell on the floor in front of you.',
      'Hinge your hips back and take hold — back flat.',
      'Send it between your legs, then snap your hips through.',
      'It rises to chest height on the swing, not by lifting with your arms.'],
  m: ['Squatting instead of hinging at the hip — the main mistake.',
      'Lifting with the shoulders rather than the hips.',
      'A rounded back at the bottom of the swing.'] },

'פלאנק': {
  s: ['Elbows under your shoulders, forearms on the floor.',
      'Body in a straight line from head to heels.',
      'Brace your stomach and glutes, and breathe normally.',
      'Hold for a set time rather than to collapse.'],
  m: ['Hips dropping — the signal that the set is over.',
      'Hips high, which turns it into a rest.',
      'Holding your breath.'] },

'מכונת חתירה': {
  s: ['Legs first: drive with the legs, then lean the torso, then pull with the arms.',
      'Return in reverse: arms, torso, legs.',
      'Back flat the whole way.',
      'Breathe in on the return and out on the pull.'],
  m: ['Pulling with the arms before the legs have driven — the order is everything.',
      'A rounded back on the pull.',
      'A fast rhythm with a short range.'] },





'שכיבות סמיכה': {
  s: ['Hands a little wider than your shoulders, body in one straight line from head to heels.',
      'Brace your abs and your glutes — the body is a single plank.',
      'Lower until your chest almost touches, elbows back rather than out to the sides.',
      'Press up without snapping the elbow locked.'],
  m: ['Hips sagging or riding up — the sign that the brace has gone.',
      'Half range, stopping halfway down.',
      'The neck craning forward to "reach" the floor.'] },

'מקבילים': {
  s: ['Take the bars with your arms straight, shoulders down rather than up by your ears.',
      'Lean the torso forward a little to put the work on the chest.',
      'Lower until the elbow is at about 90 degrees.',
      'Press back up without locking out hard.'],
  m: ['Going too deep — the shoulder moves into a range it cannot protect.',
      'Shoulders creeping up towards the ears at the bottom.',
      'Staying bolt upright when the chest is what you are after.'] },

'דדליפט': {
  s: ['Bar over the middle of your foot, feet about hip width.',
      'Grip outside your legs, flat back, chest open, shoulders a little in front of the bar.',
      'Push the floor away with your legs and stand — the bar stays against your shins.',
      'Finish with hips and glutes locked, without leaning back.'],
  m: ['A rounded lower back — end the set there.',
      'Hips rising before the chest, which turns it into a good morning.',
      'The bar drifting away from you and loading the back.'] },

'לאנג׳': {
  s: ['Step forward a comfortable distance, torso tall.',
      'Lower until both knees are at about 90 degrees.',
      'The back knee comes close to the floor without touching.',
      'Drive back through the front heel.'],
  m: ['The front knee travelling well past the toes.',
      'The torso tipping forward and loading the back.',
      'Too short a step, which turns it into a one-legged squat.'] },

'הרחקת כתף': {
  s: ['Dumbbells at your sides, elbow slightly bent and kept that way.',
      'Raise out to the sides, to shoulder height and no further.',
      'Lead with the elbow, not with the hand.',
      'Lower slowly — the useful part is the way down.'],
  m: ['Too much weight, which drags the traps into the work.',
      'Raising above shoulder height.',
      'Swinging from the body instead of moving the shoulder alone.'] },

'לחיצת חזה במכונה': {
  s: ['Set the seat height so the handles sit at mid-chest.',
      'Back and shoulders flat against the pad.',
      'Press forward to almost straight.',
      'Return under control until you feel a light stretch across the chest.'],
  m: ['A seat set too low or too high — the press then runs on a diagonal.',
      'Shoulders lifting off the pad.',
      'Letting it snap back with no braking.'] },

'פרפר במשקולות': {
  s: ['Lie on a flat bench, dumbbells above your chest, elbows slightly bent and fixed there.',
      'Open out to the sides in a wide arc until the chest stretches.',
      'Stop when the elbow is at about shoulder height.',
      'Close along the same arc, without bending the elbow any further.'],
  m: ['Bending the elbow on the way — that turns it into a press.',
      'Going too deep, which loads the shoulder joint.',
      'A weight heavy enough to force you to give up the arc.'] },

'פרפר בפולי': {
  s: ['Set the pulleys high, take a handle in each hand and step forward.',
      'Torso leaning a little forward, elbows slightly bent.',
      'Bring your hands together in front of your chest along an arc.',
      'Return under control until the chest stretches.'],
  m: ['Straightening the elbow, which turns it into a triceps pushdown.',
      'The torso rocking back and forth to give it momentum.',
      'A short range that never reaches the stretch.'] },

'פרפר במכונה': {
  s: ['Set the seat so the handles sit at chest height.',
      'Back against the pad, elbows slightly bent.',
      'Close until the handles almost touch.',
      'Open under control to the stretch, without letting go all at once.'],
  m: ['Opening too far back, past the line of the body.',
      'Shoulders rolling forward as you close.'] },

'שכיבות סמיכה בשיפוע': {
  s: ['Hands on a bench or a step, body in one straight line.',
      'The higher your hands, the easier it is.',
      'Lower your chest to the surface, elbows back.',
      'Press back up without breaking the line.'],
  m: ['Hips sagging because the abs are not braced.',
      'Hands too wide, which loads the shoulder.'] },

'פולאובר': {
  s: ['Lie across the bench or along it, one dumbbell in both hands above your chest.',
      'Lower it back over your head in an arc, elbows slightly bent.',
      'Go down until the chest and lats stretch.',
      'Bring it back over your chest along the same arc.'],
  m: ['Going past the stretch — that is load on the shoulder.',
      'Letting the hips drop to reach lower.',
      'A heavy weight in an exercise that is entirely about range.'] },

'פייס פול': {
  s: ['Pulley at face height, rope in both hands.',
      'Pull the rope towards your forehead, elbows high.',
      'Turn your palms outwards at the end of the pull.',
      'Return under control.'],
  m: ['Pulling to the chest instead of to the face.',
      'A heavy weight, which destroys the external rotation.',
      'Low elbows, which turn it into a row.'] },

'הרחקת כתף בפולי': {
  s: ['Stand beside the low pulley, handle in the far hand.',
      'Raise out to the side to shoulder height, elbow slightly bent.',
      'Pause for a moment at the top.',
      'Lower slowly against the cable.'],
  m: ['Leaning away to get higher.',
      'Raising above shoulder height.'] },

'הרמה קדמית': {
  s: ['Dumbbells in front of your thighs, palms facing you.',
      'Raise forward to shoulder height, elbow nearly straight.',
      'Pause for a moment.',
      'Lower slowly.'],
  m: ['Swinging from the lower back.',
      'Raising above shoulder height, which passes the load to the traps.',
      'Both arms at once with a weight that drags the torso backwards.'] },

'פרפר הפוך': {
  s: ['Hinge the torso forward to almost parallel, back flat.',
      'Dumbbells hanging, elbows slightly bent.',
      'Open out to the sides to shoulder height.',
      'Lower under control.'],
  m: ['Pulling with the shoulder blades, which turns it into a row.',
      'The torso rising as you go.',
      'A heavy weight that prevents a clean opening.'] },

'פרפר הפוך במכונה': {
  s: ['Sit facing the machine, chest against the pad.',
      'Take the handles, elbows slightly bent.',
      'Open out to the sides as far as the line of your body.',
      'Return under control.'],
  m: ['Opening past the line of the body.',
      'The chest coming away from the pad.'] },

'חתירה אנכית': {
  s: ['Bar in front of your thighs, hands about shoulder width.',
      'Pull straight up along your body, elbows leading.',
      'Stop when the bar reaches chest height.',
      'Lower under control.'],
  m: ['Too narrow a grip, which rotates the shoulder inwards — that is the pain.',
      'Pulling above chest height.'] },

'קלין אנד פרס': {
  s: ['Kettlebell between your feet, back flat.',
      'Pull it to your shoulder in one movement and let it settle on your forearm.',
      'Press overhead until your arm is straight.',
      'Lower to the shoulder and then to the floor, under control.'],
  m: ['The kettlebell landing on your wrist — the sign of an untidy clean.',
      'Pressing with the back instead of the shoulder.'] },

'כפיפת ריכוז': {
  s: ['Sit down, elbow resting against the inside of your thigh.',
      'Dumbbell hanging from a straight arm.',
      'Curl to shoulder height without moving the elbow.',
      'Lower slowly to straight.'],
  m: ['Lifting the elbow off the thigh to help.',
      'A heavy weight in an exercise whose whole point is isolation.'] },

'כפיפת מרפק בשיפוע': {
  s: ['Sit on a bench set to 45–60 degrees, arms hanging behind the line of your body.',
      'Curl without moving your upper arm.',
      'Pause for a moment at the top.',
      'Lower all the way to straight — the stretch is the whole idea.'],
  m: ['Letting the elbow drift forward, which cancels the stretch.',
      'A partial range that never straightens at the bottom.'] },

'מקבילים לטרייספס': {
  s: ['Stay as upright as you can — that is what moves the load to the triceps.',
      'Lower to 90 degrees at the elbow.',
      'Elbows back and close in, not out to the sides.',
      'Press back up without locking out.'],
  m: ['Leaning forward, which hands it to the chest.',
      'Going too deep.'] },

'בעיטת טרייספס': {
  s: ['Torso hinged forward, upper arm parallel to the floor and held there.',
      'Elbow at 90 degrees to start.',
      'Extend the elbow back until the arm is straight.',
      'Return slowly to 90.'],
  m: ['Swinging the whole arm instead of extending the elbow.',
      'A heavy weight that stops you straightening fully — which is the exercise.'] },

'האק סקוואט': {
  s: ['Back and shoulders against the pad, feet in the middle of the platform.',
      'Release the catch and lower to 90 degrees at the knee.',
      'Knees tracking in the direction of your toes.',
      'Drive up without snapping into the lock.'],
  m: ['Feet too low on the platform — that is load on the knee.',
      'Hips lifting off the pad at the bottom.'] },

'פשיטת ברך': {
  s: ['Set the pad so it sits just above your ankle.',
      'Back against the seat.',
      'Extend the knee to straight and pause for a moment.',
      'Lower slowly against the weight.'],
  m: ['Kicking out sharply and locking at the end.',
      'Hips lifting off the seat.',
      'Letting it drop back freely.'] },

'לאנג׳ בהליכה': {
  s: ['Step forward and lower until both knees are at 90 degrees.',
      'Drive through the front heel and move into the next step.',
      'Torso tall throughout.',
      'Keep walking in a straight line.'],
  m: ['Short steps, which turn it into a squat.',
      'The torso tipping forward under a heavy weight.',
      'Losing your balance from looking down.'] },

'סקוואט בולגרי': {
  s: ['Back foot up on a bench behind you.',
      'Front foot far enough forward that the knee does not travel far past the toes.',
      'Lower straight down to 90 degrees at the front knee.',
      'Drive through the front heel.'],
  m: ['The front foot too close to the bench — that is the knee pain.',
      'Leaning forward, which hands it entirely to the glute.',
      'Losing balance from an unsteady back foot.'] },

'עליות מדרגה': {
  s: ['Pick a height where your thigh comes to about parallel.',
      'Rise by pushing only through the foot that is on the step.',
      'Do not push off with the lower leg.',
      'Come down slowly on the same leg.'],
  m: ['Hopping off the lower leg — then the working leg is not working.',
      'Dropping down instead of lowering under control.'] },

'גלגל בטן': {
  s: ['Kneel on a mat, wheel under your shoulders.',
      'Brace your abs and glutes — the hips do not drop.',
      'Roll forward as far as you can control.',
      'Pull back with your abs, not with your arms.'],
  m: ['The lower back arching as you roll out — the sign that you went too far.',
      'Pulling with the shoulders instead of the abs.'] },

'טיפוס הרים': {
  s: ['Push-up position, body in one straight line.',
      'Bring one knee to your chest and swap.',
      'The hips stay low and steady.',
      'Keep the rhythm even.'],
  m: ['Hips rising as the speed goes up.',
      'Hands drifting out from under the shoulders.'] },

'ווקאום': {
  s: ['Breathe all the air out.',
      'Draw your stomach in towards your spine.',
      'Hold for 10–20 seconds and breathe normally through your nose.',
      'Release slowly.'],
  m: ['Holding your breath instead of breathing normally.',
      'Squeezing the stomach outwards instead of inwards.'] },

'טורקיש גט אפ': {
  s: ['Lie down, kettlebell in a straight arm above your chest.',
      'Move through elbow, hand, bridge and then to kneeling.',
      'Eyes on the kettlebell the whole way.',
      'Return through the same stages in reverse.'],
  m: ['The arm bending — stop immediately.',
      'Rushing between the stages instead of settling into each one.',
      'A heavy weight before the movement is solid with none.'] },

'קפיצה בחבל': {
  s: ['Elbows in against your body, the turn comes from the wrist.',
      'Low jumps, on the balls of your feet.',
      'Soft knees on landing.',
      'Start with short sets.'],
  m: ['High jumps, which tire you fast and load the shin.',
      'Turning with the whole arm instead of the wrist.'] },

'ברפי': {
  s: ['From a squat, plant your hands and shoot your legs back.',
      'One push-up (or skip it).',
      'Bring your legs back to the squat.',
      'Jump up with your hands overhead.'],
  m: ['Hips sagging during the push-up.',
      'Landing on locked legs.',
      'A rhythm that falls apart after five reps — fewer and cleaner is better.'] },

'סטפר': {
  s: ['Stand tall, do not hang on the handles.',
      'Step through the whole foot rather than just the toes.',
      'Keep the pace even.',
      'Start slow and build.'],
  m: ['Leaning on the rail, which takes away half the effort.',
      'Small fast steps instead of a full range.'] },

};
