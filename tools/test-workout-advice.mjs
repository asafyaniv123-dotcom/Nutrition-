// Every branch of progAdvice, lifted out of the shipped file and run against
// lists whose right answer is known - including the two that must stay quiet,
// because an advice panel that always has something to say is one that stops
// being read.
import fs from 'fs';
import vm from 'vm';

const src = fs.readFileSync('C:/Projects/Nutrition-/dev/index.html', 'utf8');
const db = JSON.parse(fs.readFileSync('C:/Projects/Nutrition-/data/exercises.json', 'utf8'));
function grab(a, b) {
  const i = src.indexOf(a); if (i < 0) throw new Error('not found: ' + a);
  const j = src.indexOf(b, i); if (j < 0) throw new Error('no end: ' + a);
  return src.slice(i, j);
}

let ME = {};
const ctx = { console };
vm.createContext(ctx);
ctx.__EX = db.exercises;
ctx.__me = () => ME;
vm.runInContext(`
function exAll(){return __EX;}
function fitMe(){return __me();}
function _t(s,v){ if(!v)return s; return s.replace(/\\{(\\w+)\\}/g,function(m,k){return v[k]==null?m:v[k];}); }
function esc(s){return String(s);}
`, ctx);
vm.runInContext(grab('var MUSCLE_ROLLUP=', 'function isCardioEx'), ctx);
vm.runInContext(grab('var PROG_SPLITS=', 'function progDayLabel'), ctx);
vm.runInContext(grab('var PROG_PER_SESSION=', 'function progSetsPerSession'), ctx);
vm.runInContext(grab('function progSplitFor', 'function progSetsPerSession'), ctx);
const progAdvice = vm.runInContext('progAdvice', ctx);
const progAdviceHTML = vm.runInContext('progAdviceHTML', ctx);

let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const says = (rows, re) => progAdvice(rows).some((a) => re.test(a.s));
const warns = (rows) => progAdvice(rows).filter((a) => a.t === 'warn').length;

// a beginner three days a week -> Full Body, cap 26, 2-6 per group
ME = { days: 3, exp: 'new' };

console.log('it stays QUIET when there is nothing to say:');
ok(progAdvice([]).length === 0, 'an empty workout says nothing at all');
ok(progAdviceHTML([]) === '', '  and draws nothing, so a caller can append it blind');
ok(progAdvice([{ name: 'סקוואט', sets: 4 }, { name: 'לחיצת חזה במוט', sets: 4 },
                { name: 'חתירה במוט', sets: 4 }]).length === 0,
   'a sane full-body session says nothing');

console.log('\nthe session ceiling, which is the one he asked for:');
const huge = [];
for (let i = 0; i < 10; i++) huge.push({ name: 'סקוואט', sets: 3 });
ok(says(huge, /30 סטים באימון אחד/), '30 sets is reported against the cap of 26');
ok(says(huge, /עד 26/), '  and the number quoted is the notebook\'s, not a guess');
// six days a week and advanced -> ABC, cap 30
ME = { days: 6, exp: 'adv' };
ok(!says(huge, /30 סטים באימון אחד. ההמלצה היא עד/), 'the same 30 sets is fine for ABC, whose cap is 30');
ME = { days: 3, exp: 'new' };

console.log('\nand the ceiling for one muscle group inside it:');
ok(says([{ name: 'סקוואט', sets: 8 }], /8 סטים באימון אחד. ההמלצה היא 2 עד 6/),
   'eight sets of quads is reported against 2-6');
ME = { days: 4, exp: 'mid' };
ok(!says([{ name: 'סקוואט', sets: 8 }], /ההמלצה היא/),
   '  the same eight is inside the band for AB, which is 5-10');
ME = { days: 3, exp: 'new' };

console.log('\na single set, which is below the floor:');
ok(says([{ name: 'סקוואט', sets: 4 }, { name: 'כפיפת מרפק במוט', sets: 1 }], /סט אחד בלבד/),
   'one set of biceps is named');
ok(!says([{ name: 'סקוואט', sets: 4 }, { name: 'כפיפת מרפק במוט', sets: 2 }], /סט אחד בלבד/),
   '  and two sets is not');

console.log('\nlarge groups before small:');
ok(says([{ name: 'כפיפת מרפק במוט', sets: 3 }, { name: 'לחיצת חזה במוט', sets: 3 }],
        /קבוצות גדולות קודם/), 'biceps before chest is reported');
ok(!says([{ name: 'לחיצת חזה במוט', sets: 3 }, { name: 'כפיפת מרפק במוט', sets: 3 }],
         /קבוצות גדולות קודם/), '  and chest before biceps is not');
ok(progAdvice([{ name: 'כפיפת מרפק במוט', sets: 3 }, { name: 'לחיצת חזה במוט', sets: 3 },
               { name: 'חתירה במוט', sets: 3 }])
     .filter((a) => /קבוצות גדולות קודם/.test(a.s)).length === 1,
   '  and it is said once, not once per pair');

console.log('\nit does not fall over on what a person can actually type:');
ok(progAdvice([{ name: 'משהו שהמצאתי', sets: 3 }]).length === 0,
   'an exercise the library has never heard of does not crash it');
ok(progAdvice([{ name: 'סקוואט', sets: 0 }]).length === 0, 'zero sets is not a workout');
ok(progAdvice([{ name: '', sets: 4 }, null]).length === 0, 'a blank row and a null are skipped');
ok(warns([{ name: 'סקוואט', sets: 4 }, { name: 'לחיצת חזה במוט', sets: 4 }]) === 0,
   'nothing is a warning unless a stated ceiling was passed');

console.log(bad ? '\n' + bad + ' FAILED' : '\nthe advice says what the notebook says, and is quiet otherwise');
process.exit(bad ? 1 : 0);
