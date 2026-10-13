/* What the notebook would say about a workout, lifted out of the shipped file
 * and run against lists whose right answer is known.
 *
 * Including the two that must stay QUIET. An advice panel that always has
 * something to say is one that stops being read, so "says nothing" is a case
 * with its own assertions rather than the absence of one.
 *
 * Every rule here is cited to a page of docs/fitness-catalogue.md, because the
 * numbers are the notebook's and not ours, and a number nobody can trace back
 * is a number that drifts.
 *
 *   node tools/test-workout-advice.mjs
 *   node tools/test-workout-advice.mjs --file <path>   another revision
 */
import fs from 'fs';
import vm from 'vm';

const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf('--' + name); return i < 0 ? dflt : argv[i + 1]; };
const FILE = opt('file', 'dev/index.html');
const DATA = opt('data', 'data/exercises.json');

const src = fs.readFileSync(FILE, 'utf8');
const db = JSON.parse(fs.readFileSync(DATA, 'utf8'));
function grab(a, b) {
  const i = src.indexOf(a); if (i < 0) throw new Error('not found: ' + a);
  const j = src.indexOf(b, i); if (j < 0) throw new Error('no end: ' + a);
  return src.slice(i, j);
}

let ME = {}, GOAL = 'size';
const ctx = { console };
vm.createContext(ctx);
ctx.__EX = db.exercises;
ctx.__me = () => ME;
ctx.__goal = () => ({ v: GOAL });
/* The Hebrew key IS the Hebrew text - the app ships no he.json - so a stub
   that fills the holes and picks a plural branch is what the Hebrew build
   actually does, not a simplification of it. */
vm.runInContext(`
function exAll(){return __EX;}
function fitMe(){return __me();}
function fitGoal(){return __goal();}
function exLabel(n){return String(n||'');}
function esc(s){return String(s);}
function _t(s,v){
  if(s&&typeof s==='object')s=s.other;
  if(!v)return s;
  return String(s).replace(/\\{(\\w+)\\}/g,function(m,k){return v[k]==null?m:v[k];});
}
`, ctx);
vm.runInContext(grab('var MUSCLE_ROLLUP=', 'function isCardioEx'), ctx);
vm.runInContext(grab('var PROG_SPLITS=', 'function progDayLabel'), ctx);
vm.runInContext(grab('var PROG_PER_SESSION=', 'function progSetsPerSession'), ctx);
vm.runInContext(grab('function progSplitFor', 'function progSetsPerSession'), ctx);
const progAdvice = vm.runInContext('progAdvice', ctx);
const progAdviceHTML = vm.runInContext('progAdviceHTML', ctx);

let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const said = (rows, o) => progAdvice(rows, o).map((a) => a.s);
const says = (rows, re, o) => said(rows, o).some((s) => re.test(s));

/* a beginner three days a week -> Full Body: cap 26, 2-6 a group (p.140) */
ME = { days: 3, exp: 'new' }; GOAL = 'size';
const SANE = [{ name: 'סקוואט', sets: 4, reps: 10 },
               { name: 'לחיצת חזה במוט', sets: 4, reps: 10 },
               { name: 'חתירה במוט', sets: 4, reps: 10 }];

console.log('it stays QUIET when there is nothing to say:');
ok(progAdvice([]).length === 0, 'an empty workout says nothing at all');
ok(progAdviceHTML([]) === '', '  and draws nothing, so a caller can append it blind');
ok(progAdvice(SANE).length === 0, 'a sane full-body session says nothing');

console.log('\nthe session ceiling, p.140:');
const huge = [];
for (let i = 0; i < 10; i++) huge.push({ name: 'סקוואט', sets: 3, reps: 10 });
ok(says(huge, /30 סטים באימון אחד/), '30 sets is reported against the cap of 26');
ok(says(huge, /עד 26/), '  and the number quoted is the notebook\'s');
ME = { days: 6, exp: 'adv' };
ok(!says(huge, /סטים באימון אחד. ההמלצה היא עד/), 'the same 30 is fine for ABC, whose cap is 30');
ME = { days: 3, exp: 'new' };

console.log('\nthe band for one group inside it, p.140:');
ok(says([{ name: 'סקוואט', sets: 8, reps: 10 }], /8 סטים באימון אחד. ההמלצה היא 2 עד 6/),
   'eight sets of quads is reported against 2-6');
ME = { days: 4, exp: 'mid' };
ok(!says([{ name: 'סקוואט', sets: 8, reps: 10 }], /ההמלצה היא 5 עד 10/),
   '  the same eight is inside AB\'s band of 5-10');
ME = { days: 3, exp: 'new' };

console.log('\nAT LEAST TWO SETS OF EVERY EXERCISE, p.138-139 - per EXERCISE:');
ok(says([{ name: 'סקוואט', sets: 4, reps: 10 }, { name: 'פשיטת ברך', sets: 1, reps: 10 }],
        /פשיטת ברך: סט אחד בלבד/),
   'a one-set exercise is named even when its GROUP has five sets');
ok(!says(SANE, /סט אחד בלבד/), '  and a workout with none of them stays quiet');
ok(progAdvice([{ name: 'סקוואט', sets: 1, reps: 10 }, { name: 'לחיצת רגליים', sets: 1, reps: 10 }])
     .filter((a) => /סט אחד בלבד/.test(a.s)).length === 1,
   '  named once, not once per exercise');

console.log('\nreps against the band for the goal, p.137 and p.139:');
GOAL = 'strength';
ok(says([{ name: 'סקוואט', sets: 4, reps: 15 }], /15 חזרות. הטווח למטרה שבחרת הוא 1 עד 6/),
   'fifteen reps is reported when the goal is max strength (1-6)');
GOAL = 'size';
ok(!says([{ name: 'סקוואט', sets: 4, reps: 15 }], /הטווח למטרה שבחרת/),
   '  and the same fifteen is inside hypertrophy\'s 6-30');
ok(!says([{ name: 'סקוואט', sets: 4 }], /הטווח למטרה שבחרת/),
   '  a row with no reps at all is not guessed at');

console.log('\nTEN TO TWENTY SETS A WEEK PER MUSCLE, p.138 - a week, not a session:');
ok(!says(SANE, /בשבוע/), 'not asked at all when no week is known');
ok(says(SANE, /4 סטים בשבוע. הטווח הוא 10 עד 20/, { perWeek: 1 }),
   'four sets once a week is reported against 10-20');
ok(!says([{ name: 'סקוואט', sets: 6, reps: 10 }], /בשבוע/, { perWeek: 2 }),
   '  and six sets twice a week is twelve, which is inside it');
/* The generator's own output puts five groups under the floor at once, so
   this has to be one line naming the worst, not one per group. */
ok(progAdvice([{ name: 'לחיצת חזה במוט', sets: 6, reps: 10 }, { name: 'חתירה במוט', sets: 6, reps: 10 },
               { name: 'לחיצת כתפיים במוט', sets: 4, reps: 10 }, { name: 'כפיפת מרפק במוט', sets: 2, reps: 10 }],
              { perWeek: 2 }).filter((a) => /בשבוע/.test(a.s)).length === 1,
   '  five groups under the floor is still ONE line');
ok(says([{ name: 'לחיצת חזה במוט', sets: 6, reps: 10 }, { name: 'כפיפת מרפק במוט', sets: 2, reps: 10 }],
        /יד קדמית: 4 סטים בשבוע/, { perWeek: 2 }),
   '  and the line names the group that is furthest out');

console.log('\nlarge groups first, and more of them, p.138-140:');
ok(says([{ name: 'כפיפת מרפק במוט', sets: 3, reps: 10 }, { name: 'לחיצת חזה במוט', sets: 3, reps: 10 }],
        /קבוצות גדולות קודם/), 'biceps before chest is reported');
ok(!says([{ name: 'לחיצת חזה במוט', sets: 3, reps: 10 }, { name: 'כפיפת מרפק במוט', sets: 3, reps: 10 }],
         /קבוצות גדולות קודם/), '  and chest before biceps is not');
ok(says([{ name: 'לחיצת חזה במוט', sets: 2, reps: 10 }, { name: 'כפיפת מרפק במוט', sets: 5, reps: 10 }],
        /יותר סטים ל/), 'five sets of biceps against two of chest is reported');
ok(!says(SANE, /יותר סטים ל/), '  and an even spread is not');

console.log('\nsix weeks, p.140:');
ok(!says(SANE, /שבוע הקלה/, { weeks: 5 }), 'nothing at five weeks');
ok(says(SANE, /שבוע 6 בתוכנית — זמן לשבוע הקלה/, { weeks: 6 }), 'at six weeks it says so');

console.log('\nit does not fall over on what a person can actually type:');
ok(progAdvice([{ name: 'משהו שהמצאתי', sets: 3, reps: 10 }]).length === 0,
   'an exercise the library has never heard of does not crash it');
ok(progAdvice([{ name: 'סקוואט', sets: 0 }]).length === 0, 'zero sets is not a workout');
ok(progAdvice([{ name: '', sets: 4 }, null]).length === 0, 'a blank row and a null are skipped');
ok(progAdvice(huge, { perWeek: 3, weeks: 9 }).length <= 5,
   'at most five lines, however much there is to say');

console.log(bad ? '\n' + bad + ' FAILED' : '\nthe advice says what the notebook says, and is quiet otherwise');
process.exit(bad ? 1 : 0);
