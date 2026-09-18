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

'לחיצת חזה על הרצפה': {
  s: ['Lie on the floor under the bar, knees bent or legs straight, whichever is comfortable.',
      'Take the same grip you would for a bench press, bar over your chest.',
      'Lower until the back of your upper arm touches the floor, and stop there.',
      'Press up out of the pause, without bouncing your elbow off the floor.'],
  m: ['Bouncing the elbow off the floor instead of pausing — that loads the elbow joint.',
      'Elbows flared out to 90 degrees — that loads the shoulder joint.',
      'Lifting your hips off the floor to press more.'] },

'לחיצת לנדמיין': {
  s: ['Set one end of a bar into a corner or a landmine sleeve and hold the free end in one hand.',
      'Stand in a short split stance with the bar at your shoulder and your elbow close to your body.',
      'Press forward and up along the diagonal until your arm is straight.',
      'Come back under control until the bar rests at your shoulder again.'],
  m: ['Leaning back to help the press — that loads the lower back.',
      'The elbow drifting outwards instead of staying under your hand.',
      'Turning your hips into the press instead of keeping them facing forward.'] },

'חתירה במוט אחיזה תחתונה': {
  s: ['Take an underhand grip on the bar, palms facing forward, hands about shoulder width.',
      'Soften your knees and hinge forward with a flat back.',
      'Row the bar to your lower stomach, elbows travelling back close to your body.',
      'Lower it under control until your arms are straight.'],
  m: ['A rounded back — the main risk in any barbell row.',
      'Letting the wrist bend back under load — that loads the wrist joint.',
      'Standing up as you pull, in order to move more weight.'] },

'חתירת פנדליי': {
  s: ['Start with the bar on the floor, feet hip width, hinged over until your back is close to parallel.',
      'Grip a little wider than your shoulders, back flat, eyes down.',
      'Pull the bar from the floor to your stomach in one sharp effort, without moving your back.',
      'Put the bar back on the floor and let it settle before the next rep.'],
  m: ['Your torso rising on every rep — that is a regular row.',
      'A rounded lower back the moment the bar leaves the floor.',
      'Chaining reps without the bar stopping, which uses momentum instead of your back.'] },

'חתירת לנדמיין': {
  s: ['Set one end of a bar into a corner and load the other end.',
      'Stand over or beside the bar and hinge forward with a flat back.',
      'Row the end of the bar towards your ribs, elbow close to your body.',
      'Lower it under control until your arm is straight.'],
  m: ['Twisting your torso on every pull instead of keeping it still.',
      'Pulling with the arm alone, with no movement at the shoulder blade.',
      'A rounded back at the bottom of the movement.'] },

'ראק פול': {
  s: ['Set the bar on the safety pins, somewhere between your knee and mid-thigh.',
      'Feet hip width, bar against your shins, hands outside your legs.',
      'Set your back flat and your chest open, then lock your hips and glutes to stand it up.',
      'Lower it under control until the bar rests on the pins again.'],
  m: ['A rounded lower back — the range is short here but the load is heavy.',
      'Leaning back at the lockout, which loads the lower back.',
      'Dropping the bar onto the pins instead of lowering it.'] },

'פוש פרס': {
  s: ['Hold the bar on your upper chest, elbows slightly forward, feet hip width.',
      'Dip at the knees — a short, vertical dip, without leaning forward.',
      'Drive your legs and press the bar overhead in one movement.',
      'Bring the bar back to your chest under control and take it on soft knees.'],
  m: ['Dipping too deep, which turns it into a thruster.',
      'Leaning back to get the bar past your head — that loads the lower back.',
      'Catching the bar on locked legs, so the impact goes through the knee joint.'] },

'פשיטת שורש כף יד': {
  s: ['Sit and rest your forearms on your thighs or a bench, palms facing down.',
      'Let your wrists hang past the edge, bar held overhand.',
      'Raise the back of your hands as far as they will go.',
      'Lower slowly until the forearm is fully stretched.'],
  m: ['Moving the elbow to help — the forearm is meant to stay still.',
      'Too much weight, which cuts the movement down to a few degrees.',
      'Letting it drop instead of lowering it.'] },

'סקוואט עם עצירה': {
  s: ['Bar across your upper traps, feet about shoulder width, toes turned out a little.',
      'Squat down under control, knees tracking over your toes.',
      'Hold the bottom for two or three seconds without letting the tension go.',
      'Stand up out of the pause itself, with no bounce.'],
  m: ['Relaxing at the bottom — the back rounds and the chest drops.',
      'Shifting onto your toes during the pause, so the heel lifts.',
      'Standing up hips-first, ahead of your chest.'] },

'דדליפט רגל ישרה': {
  s: ['Stand with the bar against your thighs, feet hip width, knees almost straight.',
      'Push your hips back and let the bar travel down along your legs.',
      'Go down until you feel the stretch in your hamstrings, without rounding your back.',
      'Come up by driving your hips forward, until you are standing tall.'],
  m: ['Rounding the lower back once the stretch runs out — that is where the rep ends.',
      'Bending the knees on the way down, which turns it into a regular deadlift.',
      'Letting the bar drift away from your legs — that loads the lower back.'] },

'סיבוב לנדמיין': {
  s: ['Set one end of a bar into a corner and hold the free end with both hands.',
      'Feet about shoulder width, arms straight, bar at chest height.',
      'Sweep the bar down to one side, turning through your waist and hips together.',
      'Bring it back to the middle under control, then go to the other side.'],
  m: ['Turning from the lower back alone while the hips stay locked — that loads the spine.',
      'Bending the arms and pulling, instead of turning through your body.',
      'Swinging it fast, which gives up control at the ends.'] },

'ת׳ראסטר': {
  s: ['Bar on your upper chest, elbows forward, feet about shoulder width.',
      'Squat down to full depth while keeping your elbows high.',
      'Stand up and carry straight on into the overhead press — one continuous movement.',
      'Bring the bar back to your chest and go straight into the next squat.'],
  m: ['Pausing between standing up and pressing, which wastes the drive from your legs.',
      'Elbows dropping at the bottom, so the bar rolls forward.',
      'Leaning back to press instead of moving your head out of the way — that loads the lower back.'] },

'לאנג׳ במשקל גוף': {
  s: ['Stand tall, feet hip-width, hands on your hips.',
      'Step forward a comfortable distance and lower your hips straight down.',
      'Go down until both knees are near 90 degrees, torso tall.',
      'Drive back up through the front heel.'],
  m: ['Too short a step, which loads the front knee instead of the hip.',
      'The torso tipping forward and loading the lower back.',
      'Letting the back knee bang into the floor instead of stopping above it.'] },
'לאנג׳ בסמית׳': {
  s: ['Set the bar height so it rests on your traps without stooping to it.',
      'One foot forward, one back, hips under the bar.',
      'Lower your hips straight down until the knees are near 90 degrees.',
      'Drive through the front heel; the bar travels on its rails.'],
  m: ['A front foot too close in, forcing the knee forward — pressure on the knee joint.',
      'Leaning on the bar instead of holding a tall torso under it.',
      'Swapping legs mid-set without racking the bar.'] },
'לאנג׳ במוט': {
  s: ['Rack the bar on your traps as for a squat, elbows under it.',
      'Step forward a comfortable distance and lock the torso tall.',
      'Lower your hips straight down until the knees are near 90 degrees.',
      'Drive back through the front heel, and only then step.'],
  m: ['Stepping and descending in one motion, which loses balance with a loaded back.',
      'A torso tipping forward — with a bar that loads the lower back directly.',
      'Starting at squat weight; one leg carries less than two.'] },
'כפיפת מרפק בגומייה': {
  s: ['Stand on the middle of the band, feet hip-width, an end in each hand.',
      'Elbows pinned to your ribs, palms facing forward.',
      'Bend the elbows until the band is fully stretched.',
      'Return slowly; the resistance is greatest at the very end.'],
  m: ['Letting the band pull your hands back instead of controlling the way down.',
      'Elbows drifting forward, which hands the work to the shoulder.',
      'Standing too close to the anchor, so there is no resistance at the start.'] },
'משיכת כתפיים בגומייה': {
  s: ['Stand on the middle of the band, an end in each hand, arms straight at your sides.',
      'Shoulders relaxed down, eyes forward.',
      'Lift the shoulders straight up toward your ears.',
      'Lower slowly to the end of the range before the next rep.'],
  m: ['Rolling the shoulders in a circle — the movement is up and down only.',
      'Bending the elbows, which turns it into a row rather than a shrug.',
      'Craning the neck forward to help.'] },
'הרחקת ירך בשכיבה על הצד': {
  s: ['Lie on your side, body in one straight line, head supported on your hand.',
      'Bend the bottom leg slightly for balance.',
      'Raise the top leg straight up, foot neutral.',
      'Lower slowly without resting the leg between reps.'],
  m: ['Rolling the hips back, which hands the work to the hip flexors.',
      'Lifting too high and bending sideways at the waist.',
      'Turning the foot up, which takes the muscle out of the movement.'] },
'הרחקת ירך בגומייה': {
  s: ['Put a band above your knees, feet hip-width.',
      'Bend the knees slightly and keep the torso tall.',
      'Push the knees out against the band to the end of the range.',
      'Close slowly — do not let the band snap you back.'],
  m: ['Letting the knees fall inward between reps.',
      'Compensating with the torso instead of opening from the hip.',
      'A band so stiff it shortens the range to a couple of centimetres.'] },
'לחיצת חזה בשיפוע שלילי במשקולות': {
  s: ['Set the bench to a decline and hook your feet under the pads.',
      'Lie back with the dumbbells over your lower chest, palms facing forward.',
      'Lower them to the sides of your lower chest until your elbow is just below shoulder height.',
      'Press back up over the same point, without clashing the dumbbells together.'],
  m: ['Lifting your head off the bench to look — that loads the neck.',
      'Lowering to mid-chest instead of to the lower chest.',
      'Standing up fast at the end of the set with your head still low, which makes you dizzy.'] },

'לחיצת חזה על הרצפה במשקולות': {
  s: ['Lie on the floor with the dumbbells on your thighs and roll them to your chest as you lie back.',
      'Knees bent or legs straight, dumbbells over your chest.',
      'Lower until the back of your upper arm touches the floor, and stop there.',
      'Press up out of the pause, without bouncing the elbow.'],
  m: ['Bouncing the elbow off the floor — that loads the elbow joint.',
      'Elbows flared out to the sides instead of about 45 degrees from your body.',
      'Lifting your hips off the floor to press more.'] },

'פרפר בשיפוע במשקולות': {
  s: ['Set the bench to a modest incline and lie back with the dumbbells over your chest.',
      'Palms facing each other, elbows softly bent and held at that angle.',
      'Open your arms out to the sides in a wide arc until you feel the stretch across your chest.',
      'Close along the same arc until the dumbbells are back over your chest.'],
  m: ['Bending and straightening the elbow as you go — that is a press, not a fly.',
      'Opening too far, below the level of the bench — that loads the shoulder joint.',
      'Too much weight, which shrinks the arc down to a small movement.'] },

'חתירה בשתי משקולות': {
  s: ['A dumbbell in each hand, feet hip width, knees softly bent.',
      'Hinge forward with a flat back until your torso is close to parallel with the floor.',
      'Row both dumbbells to your ribs, elbows travelling back close to your body.',
      'Lower them under control until your arms are straight.'],
  m: ['A rounded back — the main risk in any bent-over row.',
      'Standing up as you pull, in order to move more weight.',
      'Pulling with the arms alone, with no movement at the shoulder blades.'] },

'חתירת סיל': {
  s: ['Lie face down on a raised bench with the dumbbells hanging beneath you.',
      'Arms straight down, chest resting on the bench.',
      'Row the dumbbells to your ribs without lifting your chest off the bench.',
      'Lower them under control until your arms are straight.'],
  m: ['Lifting your chest off the bench to help — that is the one thing this exercise exists to prevent.',
      'Kicking with your legs for momentum.',
      'A partial range that never reaches full extension at the bottom.'] },

'הרמת Y': {
  s: ['Hinge forward, or lie face down on an inclined bench, with light dumbbells.',
      'Arms hanging straight down, thumbs pointing up.',
      'Raise your arms forward and up on a diagonal until they form a Y above your head.',
      'Lower them slowly along the same path.'],
  m: ['Too much weight — the lower traps are small, and the movement turns into a pull.',
      'Shoulders rising towards your ears at the top.',
      'Lifting your torso to get the arms higher.'] },

'לחיצת כתפיים בישיבה': {
  s: ['Sit on a bench with a back rest, dumbbells at shoulder height, palms facing forward.',
      'Back against the rest, stomach braced.',
      'Press up until your arms are almost straight, without clashing the dumbbells.',
      'Lower under control until your elbow is level with your shoulder.'],
  m: ['A big arch in the lower back, which turns it into an incline press.',
      'Elbows drifting back behind the line of your body — that loads the shoulder joint.',
      'Snapping the elbow straight at the top.'] },

'כפיפת זוטמן': {
  s: ['A dumbbell in each hand, arms at your sides, palms facing forward.',
      'Curl up with your elbows tucked against your ribs.',
      'At the top, turn your palms over to face down.',
      'Lower slowly in that reversed grip, and turn back at the bottom.'],
  m: ['Dropping fast through the reversed grip — that lowering is the whole exercise.',
      'Swinging the elbow forward to help on the way up.',
      'Choosing the weight for the way up rather than for the way down.'] },

'סקאל קראשר במשקולות': {
  s: ['Lie on a bench with a dumbbell in each hand over your chest, palms facing each other.',
      'Bring your arms back to a slight angle and keep your elbows fixed there.',
      'Bend at the elbow only and lower the dumbbells to the sides of your head.',
      'Straighten the elbow again without moving your upper arm.'],
  m: ['Elbows flaring out to the sides — that loads the elbow joint.',
      'Moving the upper arm, which turns it into a press.',
      'Lowering onto your head instead of past its sides.'] },

'לאנג׳ לאחור': {
  s: ['Stand tall with a dumbbell in each hand at your sides.',
      'Step back with one leg and lower your hips straight down.',
      'Go down until your back knee is close to the floor and your front knee is over your foot.',
      'Drive through your front heel to stand back up.'],
  m: ['The front knee travelling inwards — that loads the knee joint.',
      'Landing on the back knee instead of lowering onto it.',
      'Leaning your torso forward, which shifts the load to the lower back.'] },

'דדליפט רומני במשקולות': {
  s: ['Stand with a dumbbell in each hand in front of your thighs, feet hip width.',
      'Soften your knees and keep them at that angle throughout.',
      'Push your hips back and lower the dumbbells along your legs until you feel the hamstring stretch.',
      'Come up by driving your hips forward, until you are standing tall.'],
  m: ['Rounding the lower back once the stretch runs out — that is where the rep ends.',
      'Bending the knees further on the way down, which turns it into a squat.',
      'Letting the dumbbells drift away from your legs — that loads the lower back.'] },

'דדליפט על רגל אחת': {
  s: ['Stand on one leg with a dumbbell in the opposite hand.',
      'Soften the knee of the standing leg and keep your hips level.',
      'Hinge forward from the hips and let your free leg rise behind you, in line with your back.',
      'Come up by driving your hips forward, without touching the floor with the free leg.'],
  m: ['The hip of the free leg opening out to the side — it should stay facing the floor.',
      'Rounding the lower back instead of hinging from the hips.',
      'Adding weight before the balance is steady.'] },

'סקוואט סומו': {
  s: ['Stand with your feet wider than your shoulders, toes turned out.',
      'Hold a single dumbbell with both hands in front of you.',
      'Lower straight down with your knees tracking over your toes.',
      'Drive up through your heels until your hips are straight.'],
  m: ['Knees travelling inwards — that loads the knee joint.',
      'Leaning your torso forward instead of going straight down.',
      'Toes and knees pointing in different directions.'] },

'הרמת עקבים ברגל אחת': {
  s: ['Stand on one foot on a step with a dumbbell in the hand on that side.',
      'Hold something steady with your other hand for balance.',
      'Rise up onto the ball of your foot and hold the top for a moment.',
      'Lower slowly until the heel is stretched below the level of the step.'],
  m: ['Fast bouncing, which uses the tendon rather than the muscle.',
      'Bending the knee as you go, to help.',
      'A short range that never drops below the step.'] },

'כפיפה צידית': {
  s: ['Stand tall with a dumbbell in one hand and the other hand on your waist.',
      'Feet hip width, hips still.',
      'Lean your torso towards the dumbbell without turning it.',
      'Come back to upright by squeezing the opposite side.'],
  m: ['Turning your torso as you lean — that loads the spine.',
      'A dumbbell in both hands, which cancels the resistance on one side.',
      'Leaning forward instead of leaning sideways.'] },

'נשיאת מזוודה': {
  s: ['Pick a single dumbbell up from the floor on one side, with a flat back.',
      'Stand tall, shoulders level, the other hand free.',
      'Walk in a straight line with normal steps, without leaning away to the other side.',
      'Set the dumbbell down under control and swap sides.'],
  m: ['Leaning away to balance — that cancels the work the obliques are there to do.',
      'The shoulder on the loaded side dropping.',
      'Dropping the dumbbell at the end instead of setting it down.'] },
'פרפר בפולי מלמטה למעלה': {
  s: ['Set both pulleys low and take a handle in each hand.',
      'Step forward into a split stance, arms down and out, elbows softly bent and fixed there.',
      'Bring your hands up and in until they meet at upper-chest height.',
      'Let them back along the same arc under control, until you feel the stretch across your chest.'],
  m: ['Bending and straightening the elbow as you go — that is a press, not a fly.',
      'Standing up and leaning back to finish the movement — that loads the lower back.',
      'Letting it snap back, which gives up the useful half.'] },

'פרפר בפולי מלמעלה למטה': {
  s: ['Set both pulleys high and take a handle in each hand.',
      'Step forward into a split stance and lean your torso slightly forward.',
      'Bring your hands down and in until they meet in front of your stomach.',
      'Let them back up and out under control until you feel the stretch.'],
  m: ['Bending the elbow as you go, which turns it into a triceps extension.',
      'Pulling with your back instead of closing with your chest.',
      'Elbows opening behind the line of your body at the end of the rep — that loads the shoulder joint.'] },

'פולי עליון אחיזה רחבה': {
  s: ['Set the thigh pad so you are not lifted off the seat.',
      'Take a grip clearly wider than your shoulders, palms facing forward.',
      'Pull the bar to your upper chest with your elbows travelling straight down.',
      'Come back up under control until your shoulder blades open again.'],
  m: ['A grip so wide that the elbow cannot get below shoulder height.',
      'Pulling behind your neck — a shoulder risk with nothing to show for it.',
      'Leaning far back, which turns it into a row.'] },

'פולי עליון אחיזה תחתונה': {
  s: ['Set the thigh pad and take the bar with an underhand grip about shoulder width.',
      'Sit tall, chest open, arms straight overhead.',
      'Pull the bar to your upper chest, elbows travelling down close to your ribs.',
      'Come back up under control until your arms are almost straight.'],
  m: ['Curling with the elbow — this is a back exercise, not a biceps one.',
      'Leaning back to finish the pull.',
      'Letting the wrist bend back under load — that loads the wrist joint.'] },

'פולי עליון ביד אחת': {
  s: ['Attach a single handle to the high pulley and sit or kneel beneath it.',
      'Hold it in one hand, arm straight overhead, the other hand on your thigh.',
      'Pull the handle towards the ribs on that side, elbow travelling down and back.',
      'Come back up under control until the shoulder blade opens.'],
  m: ['Twisting your torso on every pull instead of keeping it still.',
      'Pulling with the arm alone, with no movement at the shoulder blade.',
      'Leaning your body sideways to add range.'] },

'משיכת פולי בזרוע ישרה': {
  s: ['Stand facing a high pulley and take the bar or rope with straight arms.',
      'Step back, lean your torso slightly forward, stomach braced.',
      'Sweep your hands down in an arc to your thighs without bending your elbow.',
      'Let them back up under control until your arms are in front of your face.'],
  m: ['Bending the elbow as you go — that is a triceps extension.',
      'Standing up and rising on every rep to add force.',
      'Too much weight, which makes a straight arm impossible.'] },

'חתירה בפולי ביד אחת': {
  s: ['Sit facing a low pulley with a single handle, feet on the platform.',
      'Hold it in one hand, arm straight, back upright.',
      'Row the handle to your ribs, elbow travelling back close to your body.',
      'Let it out under control until your arm is straight and the shoulder blade stretches.'],
  m: ['Turning your body back with the pull — that loads the lower back.',
      'Leaning far back instead of pulling with the arm and the shoulder blade.',
      'Pulling too high, to your chest instead of your ribs.'] },

'חתירה בפולי אחיזה רחבה': {
  s: ['Sit facing a low pulley with a long bar, feet on the platform.',
      'Grip wider than your shoulders, palms facing down, back upright.',
      'Row the bar to your lower chest with your elbows out at shoulder height.',
      'Let it out under control until your arms are straight.'],
  m: ['Pulling to your stomach instead of your chest — that is the regular row.',
      'Shoulders rising towards your ears at the end of the pull.',
      'Rocking your torso back and forth to build momentum.'] },

'משיכת כתפיים בפולי': {
  s: ['Stand facing a low pulley and hold a bar or two handles with straight arms.',
      'Step back until the cable is taut, shoulders relaxed and low.',
      'Lift your shoulders straight up towards your ears and hold for a moment.',
      'Lower slowly until your shoulders are all the way down again.'],
  m: ['Rolling the shoulders in a circle — that loads the shoulder joint and adds nothing.',
      'Bending the elbow, which turns it into a pull.',
      'A short range that never returns to a full hang at the bottom.'] },

'הרחקת כתף בהטיה': {
  s: ['Stand beside the pulley post and hold something solid with the near hand.',
      'Lean your body away from it, with a low-pulley handle in the far hand.',
      'Raise that arm out to the side up to shoulder height, elbow softly bent.',
      'Lower slowly until your hand crosses in front of your body.'],
  m: ['Raising above shoulder height — the traps take the work.',
      'Swinging your body to start the movement.',
      'Turning the palm down at the top — that loads the shoulder joint.'] },

'הרמה קדמית בפולי': {
  s: ['Stand with your back to a low pulley, the handle between your legs or at your side.',
      'Arm straight down, stomach braced, feet hip width.',
      'Raise that arm forward to shoulder height.',
      'Lower slowly until the handle returns to your side.'],
  m: ['Leaning your torso back to lift — that loads the lower back.',
      'Raising above shoulder height, which hands the work to the traps.',
      'Bending the elbow, which shortens the arm and the difficulty.'] },

'פרפר הפוך בפולי': {
  s: ['Set two pulleys at chest height and cross the cables — the right one into your left hand and the other way round.',
      'Stand in the middle, arms straight out in front, elbows softly bent.',
      'Open your arms out to the sides and back, to the line of your shoulders.',
      'Let them back under control until your hands cross again.'],
  m: ['Bending the elbow and pulling, which turns it into a row.',
      'Shoulders rising towards your ears as you open.',
      'Standing up and leaning back to open wider.'] },

'חתירה אנכית בפולי': {
  s: ['Stand facing a low pulley and take the bar with a shoulder-width grip.',
      'Arms straight down, bar close to your body.',
      'Pull the bar up along your body to chest height, elbows leading.',
      'Lower it under control until your arms are straight.'],
  m: ['Pulling above shoulder height — that loads the shoulder joint.',
      'Letting the wrists bend under the bar — that loads the wrist joint.',
      'Rocking your body back to help the pull.'] },
'כפיפת פטיש בחבל': {
  s: ['Attach a rope to a low pulley and hold both ends, palms facing each other.',
      'Stand tall with your elbows against your ribs.',
      'Curl up to the top without turning your palms.',
      'Lower slowly until your arms are straight.'],
  m: ['Swinging the elbow forward, which turns it into a pull.',
      'Rocking your body back on the way up.',
      'A partial range that never returns to straight at the bottom.'] },

'כפיפת מרפק בפולי מאחור': {
  s: ['Attach a single handle at shoulder height and turn your back to the pulley.',
      'Step forward until your arm is stretched behind the line of your body.',
      'Bend the elbow and pull the handle forward and up, without moving your upper arm.',
      'Lower slowly until your arm is back behind you, under stretch.'],
  m: ['Bringing the upper arm forward, which cancels the stretch the exercise is built around.',
      'Leaning your torso forward on the way up.',
      'Too much weight, which drags the shoulder back instead of staying at the elbow — that loads the shoulder joint.'] },

'פשיטת מרפק בפולי ביד אחת': {
  s: ['Attach a single handle to a high pulley and take it in one hand.',
      'Stand tall with your elbow against your ribs, bent to a right angle.',
      'Straighten the elbow downwards until your arm is fully extended.',
      'Let it back up slowly until your forearm returns to where it started.'],
  m: ['Moving the elbow back and forth — the upper arm should stay put.',
      'Leaning your body forward to push with your bodyweight.',
      'Snapping the elbow straight at the bottom.'] },

'פשיטת מרפק בפולי אחיזה תחתונה': {
  s: ['Attach a straight bar to a high pulley and hold it underhand, palms facing up.',
      'Stand tall with your elbows against your ribs.',
      'Straighten your elbows downwards until your arms are fully extended, without turning your palms.',
      'Let it back up slowly until your forearms are back where they started.'],
  m: ['Letting the wrists bend under load — that loads the wrist joint.',
      'Elbows drifting forward, which turns it into a pull.',
      'Too much weight for this grip, so the hands give out before the muscle does.'] },

'פשיטת מרפק מעל הראש בחבל': {
  s: ['Attach a rope to a low pulley, take both ends and turn your back to it.',
      'Bring your hands overhead with your elbows bent and the rope behind your head.',
      'Straighten your elbows up and forward until your arms are fully extended.',
      'Bend back slowly until you feel the stretch behind your head.'],
  m: ['Elbows flaring out to the sides — that loads the elbow joint.',
      'Arching your lower back to finish the extension.',
      'Letting the upper arm drop, which turns it into a pull.'] },

'בעיטת טרייספס בפולי': {
  s: ['Attach a single handle to a low pulley and hinge forward with a flat back.',
      'Bring your upper arm in line with your back, elbow bent.',
      'Straighten the elbow back until your arm is fully extended, and hold for a moment.',
      'Bend back slowly without letting the upper arm drop.'],
  m: ['The upper arm falling on every rep — the whole exercise depends on it not moving.',
      'Turning the shoulder back to add to the extension.',
      'Too much weight, which forces you to swing.'] },

'משיכה בין הרגליים': {
  s: ['Attach a rope to a low pulley, turn your back to it and pass the rope between your legs.',
      'Step forward until the cable is taut, feet about shoulder width.',
      'Push your hips back with a flat back until you feel the hamstring stretch.',
      'Drive your hips forward to standing and squeeze your glutes.'],
  m: ['Squatting instead of hinging at the hips — the knees take the work.',
      'Pulling with your arms instead of letting your hips make the movement.',
      'Leaning back at the top — that loads the lower back.'] },

'בעיטת ישבן בפולי': {
  s: ['Attach an ankle strap to a low pulley and stand facing it.',
      'Hold the frame, soften the standing knee, stomach braced.',
      'Kick the free leg back until it is in line with your back.',
      'Bring it back slowly until the leg is under your body again.'],
  m: ['Arching the lower back to get the leg higher — that loads the lower back.',
      'Turning your hips out instead of keeping them facing forward.',
      'Bending the knee, which turns it into a leg curl.'] },

'קירוב ירך בפולי': {
  s: ['Attach an ankle strap to a low pulley and stand side-on to it.',
      'The leg nearest the pulley is the working one; hold the frame for balance.',
      'Pull that leg in, across the front of the other one.',
      'Let it back out slowly until you feel the stretch in the groin.'],
  m: ['Turning your hips to add range.',
      'Leaning your body to the other side to balance.',
      'Letting it snap back out — that is where the load is.'] },

'הרחקת ירך בפולי': {
  s: ['Attach an ankle strap to a low pulley and stand side-on to it.',
      'The leg furthest from the pulley is the working one; hold the frame for balance.',
      'Raise that leg out to the side without bending the knee.',
      'Bring it back slowly until your legs almost touch.'],
  m: ['Leaning your torso to the other side to get the leg higher.',
      'Turning your hips so the leg rises forward instead of out to the side.',
      'Too much weight, which turns it into a movement of the whole hip.'] },

'לחיצת פאלוף': {
  s: ['Attach a handle at chest height and stand side-on to the pulley.',
      'Hold it in both hands against your breastbone, feet about shoulder width.',
      'Push your hands straight out until your arms are extended, without letting your body turn.',
      'Bring them back to your chest slowly, still resisting the turn.'],
  m: ['Letting your torso turn towards the pulley — that is the one thing this exercise exists to prevent.',
      'Leaning sideways instead of standing upright.',
      'Holding your breath instead of breathing through it.'] },

'חיתוך עצים בפולי': {
  s: ['Set the pulley high and stand side-on to it, handle in both hands.',
      'Feet wider than your shoulders, arms straight.',
      'Pull the handle diagonally down and across, turning through your waist and hips together.',
      'Let it back up along the same path under control.'],
  m: ['Turning from the lower back alone while the hips stay locked — that loads the spine.',
      'Bending your elbows and pulling with your arms instead of turning through your body.',
      'Letting it snap back up, which gives up control at the top.'] },
'לחיצת חזה בשיפוע במכונה': {
  s: ['Set the seat height so the handles sit at upper-chest level.',
      'Sit with your back against the pad and your feet flat on the floor.',
      'Press forward and up until your arms are almost straight.',
      'Come back under control until your elbow is just behind the line of your body.'],
  m: ['A seat set too low, which turns it into an overhead press — that loads the shoulder joint.',
      'Lifting your back off the pad to press more.',
      'Snapping the elbow straight at the end.'] },

'מתח במכונת סיוע': {
  s: ['Choose an assistance weight — the higher it is, the easier the rep.',
      'Take the bar a little wider than your shoulders and kneel or stand on the pad.',
      'Pull until your chin passes the bar, elbows driving down to your ribs.',
      'Lower slowly until your arms are fully straight.'],
  m: ['Bouncing off the pad to start the pull.',
      'Dropping on the way down — that is where most of the benefit is.',
      'So much assistance that the set ends before your back has worked.'] },

'משיכת גב במכונה': {
  s: ['Set the thigh pad so you are not lifted off the seat.',
      'Take the handles, sit tall, chest open.',
      'Pull the handles to your upper chest, elbows travelling down and back.',
      'Come back up under control until your shoulder blades open.'],
  m: ['Leaning far back, which turns it into a row.',
      'Pulling with your hands instead of leading with your elbows.',
      'Shoulders rising towards your ears at the top.'] },

'חתירה בתמיכת חזה': {
  s: ['Set the pad so your chest rests against it and the handles are within reach.',
      'Feet planted, chest against the pad for the whole set.',
      'Row the handles to your ribs with your elbows travelling back.',
      'Let them out under control until your arms are straight and your shoulder blades stretch.'],
  m: ['Lifting your chest off the pad to pull more — that is the one thing this exercise exists to prevent.',
      'Pulling with the arms alone, with no movement at the shoulder blades.',
      'Shoulders rising towards your ears at the end of the pull.'] },

'חתירה גבוהה במכונה': {
  s: ['Set the seat so the handles are at shoulder height or a little above.',
      'Chest against the pad, overhand grip on the handles.',
      'Pull the handles down and back with your elbows at shoulder height.',
      'Let them out under control until your arms are straight.'],
  m: ['Pulling to your stomach instead of your upper chest — that is the low row.',
      'Tucking your elbows in, which hands the work to the lats.',
      'Rising off the seat to pull more.'] },

'משיכת כתפיים במכונה': {
  s: ['Set the machine so the handles are within reach with straight arms.',
      'Stand or sit tall with your shoulders relaxed and low.',
      'Lift your shoulders straight up towards your ears and hold for a moment.',
      'Lower slowly until they hang completely.'],
  m: ['Rolling the shoulders in a circle — that loads the shoulder joint and adds nothing.',
      'Bending the elbow, which turns it into a pull.',
      'A short range that never returns to a full hang.'] },

'הרמת גב 45 מעלות': {
  s: ['Set the pad so it sits just below your hip bone.',
      'Cross your arms on your chest, body in a straight line from head to heels.',
      'Bend at the hips until you feel the hamstring stretch, without rounding your back.',
      'Come up to the straight line and stop — not past it.'],
  m: ['Rising past the straight line — that loads the lower back.',
      'A pad set too high, which blocks the hips from moving.',
      'Rounding your back on the way down instead of hinging at the hips.'] },

'הרחקת כתף במכונה': {
  s: ['Set the seat so your shoulder joint lines up with the machine pivot.',
      'Sit tall with your forearms or elbows against the pads.',
      'Raise your arms out to the sides up to shoulder height.',
      'Lower slowly until the pads are almost back against your body.'],
  m: ['Raising above shoulder height — the traps take the work.',
      'Rising off the seat to help.',
      'Letting it drop on the way down, which gives up the useful half.'] },

'כפיפת מרפק במכונה': {
  s: ['Set the seat so your elbows rest on the pad in line with the machine pivot.',
      'Take the handles with your arms almost straight.',
      'Curl up to the top without lifting your elbows off the pad.',
      'Lower slowly until your arms are almost straight again.'],
  m: ['Elbows lifting off the pad on the way up.',
      'Rising off the seat to help.',
      'A partial range that never returns to straight at the bottom.'] },

'פשיטת מרפק במכונה': {
  s: ['Set the seat so your elbows line up with the machine pivot.',
      'Sit tall with your back against the pad and take the handles.',
      'Straighten your elbows until your arms are fully extended.',
      'Let them back slowly until the elbow returns to where it started.'],
  m: ['Leaning your body forward to push with your bodyweight.',
      'Elbows drifting off the pad, which turns it into a pull.',
      'Snapping the elbow straight at the end.'] },

'לחיצת רגליים ברגל אחת': {
  s: ['Sit in the leg press and place one foot in the middle of the platform.',
      'Keep the other leg out of the way, back and hips against the pad.',
      'Release the catches and lower until your knee is at about a right angle.',
      'Press back through the whole foot, without locking the knee.'],
  m: ['Your hips lifting off the pad at the bottom — that loads the lower back.',
      'The knee travelling inwards — that loads the knee joint.',
      'Pushing with the toes only, so the heel lifts off the platform.'] },

'סקוואט מטוטלת': {
  s: ['Stand in the machine with your shoulders under the pads and your feet on the platform.',
      'Feet about shoulder width, back against the pad.',
      'Release the catches and lower under control, knees tracking over your toes.',
      'Drive up through the whole foot until your hips are straight.'],
  m: ['Your heels lifting off the platform at the bottom.',
      'Knees travelling inwards — that loads the knee joint.',
      'Your back coming away from the pad at the bottom.'] },
'סקוואט בחגורה': {
  s: ['Fasten the belt around your hips and attach it to the load.',
      'Stand on the platforms about shoulder width and hold the handles.',
      'Squat down under control, knees tracking over your toes.',
      'Drive up through the whole foot until your hips are straight.'],
  m: ['Pulling with your arms instead of letting your legs do the work.',
      'A belt sitting on your waist rather than your hips — that loads the lower back.',
      'Knees travelling inwards — that loads the knee joint.'] },

'כפיפת ברך בעמידה': {
  s: ['Set the machine so the pad sits above the Achilles tendon, not on your calf.',
      'Stand tall with your hip against the support and hold the handles.',
      'Curl your knee until your heel comes towards your backside.',
      'Lower slowly until your leg is almost straight.'],
  m: ['Tipping your hips forward to help — that loads the lower back.',
      'A pad sitting high on the calf, which shortens the range.',
      'Letting it drop on the way down, which gives up the useful half.'] },

'הרמת ירך אחורית': {
  s: ['Tuck your feet under the pads and kneel with your knees on the pad.',
      'Body in a straight line from knee to head, hands on your chest.',
      'Lower forward slowly, resisting with your hamstrings.',
      'Pull yourself back up by squeezing the hamstrings, without jerking.'],
  m: ['Rounding your back, or bending at the hips, instead of holding the straight line.',
      'Going down too fast, which turns it into a fall.',
      'Pushing off the floor with your hands on every rep, which hides what the hamstrings can actually do.'] },

'היפ ת׳ראסט במכונה': {
  s: ['Sit in the machine with your back on the pad and the top pad across your hip bones.',
      'Feet on the platform about hip width, knees at a right angle at the top.',
      'Drive your hips up to a straight line from knee to shoulder and squeeze your glutes.',
      'Lower under control, stopping just before the weight settles.'],
  m: ['Arching your lower back at the top instead of squeezing the glutes — that loads the lower back.',
      'A pad sitting on your ribs rather than your hips.',
      'Feet too far out, which hands the work to the hamstrings.'] },

'בעיטת ישבן במכונה': {
  s: ['Set the machine so the pad sits above the knee of the working leg.',
      'Lean forward onto the pads, stomach braced.',
      'Push the leg back until it is in line with your back.',
      'Bring it back slowly until the leg is under your body again.'],
  m: ['Arching the lower back to get the leg higher — that loads the lower back.',
      'Turning your hips out instead of keeping them facing forward.',
      'Swinging it fast, which skips the squeeze.'] },

'קירוב ירך במכונה': {
  s: ['Sit in the machine and rest your thighs against the inner pads.',
      'Set the starting width to a comfortable stretch, not a maximum one.',
      'Bring your legs together until the pads almost touch.',
      'Open slowly back to the stretch, without letting the weight throw you.'],
  m: ['Starting too wide — that loads the groin.',
      'Leaning back and lifting your hips off the seat to close.',
      'Letting it snap open — that is where the risk is.'] },

'הרמת עקבים בלחיצת רגליים': {
  s: ['Sit in the leg press and place the balls of your feet on the edge of the platform.',
      'Legs almost straight but not locked, catches released.',
      'Push the platform away with the balls of your feet as far as it goes, and hold for a moment.',
      'Lower slowly until your calves are fully stretched.'],
  m: ['Bending the knee as you go, which turns it into a short leg press.',
      'A short range that never reaches the stretch at the bottom.',
      'Feet placed too high on the platform, so they slip.'] },

'כפיפות בטן במכונה': {
  s: ['Set the seat so the machine pivot is level with your hip joint.',
      'Hold the handles or pads, back against the rest.',
      'Curl your torso forward from the chest, not from the waist.',
      'Come back slowly to a light stretch, without letting the weight pull you.'],
  m: ['Pulling with your arms instead of contracting your stomach.',
      'Craning your neck forward to reach — that loads the neck.',
      'A short range that never reaches the squeeze at the end.'] }
};
