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
 * WHICH FIFTEEN. Not chosen by taste: the first exercise of each of the
 * eighteen muscle groups, which is the primary movement for that group in the
 * order the data already declares. Three of the eighteen have no Hebrew
 * instructions yet, so fifteen remain. 101 lines of the 625 that exist.
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

};
