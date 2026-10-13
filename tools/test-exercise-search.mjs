/* Type what a person says in a gym, and check the exercise comes back.
 *
 * The functions are LIFTED out of dev/index.html rather than retyped, the way
 * test-food-search.mjs and test-background-fill.mjs lift theirs, so the thing
 * under test is the thing that ships.
 *
 * This exists because the lat pulldown was reported missing and was not: it
 * has been in the list from the first day as `פולי עליון`, filed under
 * `גב רחב`, and no search anyone would actually type could reach it. Reading
 * the table said it was there. Typing the word said it was not, and the person
 * typing the word was right about what mattered.
 *
 *   node tools/test-exercise-search.mjs
 *   node tools/test-exercise-search.mjs --file <path>   another revision's app
 *   node tools/test-exercise-search.mjs --data <path>   ...and its table
 *
 * Both are needed to aim this at an older revision: with --file alone it
 * measures the OLD matcher against TODAY'S table, which is neither revision
 * and quietly reports a number belonging to nothing.
 *
 * Exits non-zero when a word finds nothing, when it finds the wrong movement,
 * or when the table declares a muscle or a piece of equipment the picker has
 * no filter for.
 */
import fs from 'fs';
import vm from 'vm';

const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf('--' + name); return i < 0 ? dflt : argv[i + 1]; };
const FILE = opt('file', 'dev/index.html');
const DATA = opt('data', 'data/exercises.json');

/* ── lift exMatch out of the shipped file ─────────────────────────────── */
const src = fs.readFileSync(FILE, 'utf8');
/* An older revision has neither exTitle nor exRank. Lift what is there and
   stub the rest, or this can never be pointed at the revision that has the
   bug - which is the only way to show it detects anything. */
let a = src.indexOf('function exTitle(e){');
if (a < 0) a = src.indexOf('function exMatch(e,q){');
const b = src.indexOf('function exOpen(){');
if (a < 0 || b < 0 || b <= a) throw new Error('could not lift exTitle/exMatch/exRank');
const UI = opt('ui', 'he');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext('function appLang(){return ' + JSON.stringify(UI) + ';}', ctx);
/* The matcher normalises through foodKey now - the same fold the food table
   uses, so the geresh, the final letters and ten other alphabets are answered
   in one place rather than two that drift. A revision old enough not to have
   it simply runs without it. */
const fk0 = src.indexOf('var HEB_FINALS=');
const fk1 = src.indexOf('function foodSearch', fk0);
if (fk0 >= 0 && fk1 > fk0) vm.runInContext(src.slice(fk0, fk1), ctx);
vm.runInContext(src.slice(a, b), ctx);
if (!/function exTitle/.test(src)) vm.runInContext('function exTitle(e){return e&&e.n||"";}', ctx);
const match = (e, q) => vm.runInContext('exMatch', ctx)(e, q);
/* The picker ranks what it matched, so the test has to rank it too - a probe
   that only checks membership cannot see that the Copenhagen plank was
   coming back ahead of the plank. */
/* A revision without exRank ranked nothing - it filtered in table order - so
   that is what this falls back to, and the comparison stays honest. */
const hasRank = /function exRank/.test(src);
const rank = (e, q) => hasRank ? vm.runInContext('exRank', ctx)(e, q.toLowerCase()) : 0;

const db = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const EX = db.exercises;
/* exKey walks the whole table to inherit a family's words - שראגס is written
   on one shrug of five and פולאפ on one pull-up of seven - so the matcher
   needs the table, not just the row it was handed. */
ctx.__EX = EX;
vm.runInContext('function exAll(){return __EX;}', ctx);

/* ── the table has to describe itself honestly ────────────────────────── */
let bad = 0;
const structural = [];
for (const e of EX) {
  for (const m of (e.m || []))
    if (db.muscles.indexOf(m) < 0) structural.push(e.n + ': muscle "' + m + '" has no filter');
  for (const q of (e.q || []))
    if (db.equipment.indexOf(q) < 0) structural.push(e.n + ': equipment "' + q + '" has no filter');
  if (!e.m || !e.m.length) structural.push(e.n + ': no muscle');
  if (!e.q || !e.q.length) structural.push(e.n + ': no equipment');
  if (!e.en) structural.push(e.n + ': no English name');
}
/* an alias may not answer for two movements, or one of them is unreachable */
const owner = {};
for (const e of EX) {
  if (owner[e.n]) structural.push('two exercises called ' + e.n);
  owner[e.n] = e.n;
}
for (const e of EX) for (const k of (e.aka || [])) {
  if (owner[k] && owner[k] !== e.n) structural.push('"' + k + '" is both ' + owner[k] + ' and an alias of ' + e.n);
  owner[k] = e.n;
}
for (const line of structural) console.log('  TABLE  ' + line);
bad += structural.length;

/* ── the words people type ────────────────────────────────────────────────
   Each is [what you type, the exercise it must find first]. Written from the
   words heard in an Israeli gym, which are mostly English said in Hebrew
   letters - which is exactly what the old search could not match. */
const PROBES = [
  ['פול דאון', 'פולי עליון'], ['פולדאון', 'פולי עליון'], ['לט פולדאון', 'פולי עליון'],
  ['lat pulldown', 'פולי עליון'], ['pulldown', 'פולי עליון'],
  ['סקווט', 'סקוואט'], ['סקוואט', 'סקוואט'], ['squat', 'סקוואט'],
  ['בנץ', 'לחיצת חזה במוט'], ['בנץ פרס', 'לחיצת חזה במוט'], ['bench press', 'לחיצת חזה במוט'],
  ['לג פרס', 'לחיצת רגליים'], ['leg press', 'לחיצת רגליים'],
  ['קרל', 'כפיפת מרפק במוט'], ['ביצפס', 'כפיפת מרפק במוט'], ['curl', 'כפיפת מרפק במוט'],
  ['פושדאון', 'פשיטת מרפק בפולי'],
  /* טרייספס names the MUSCLE, not a movement, so any triceps exercise is a
     fair first answer; this only asserts that the word reaches the group at
     all, which it did not before. */
  ['טרייספס', 'מקבילים לטרייספס'],
  ['פושאפ', 'שכיבות סמיכה'], ['push up', 'שכיבות סמיכה'],
  ['דיפס', 'מקבילים'], ['dips', 'מקבילים'],
  ['שראגס', 'משיכת כתפיים במשקולות'], ['shrug', 'משיכת כתפיים במשקולות'],
  ['פולאפ', 'מתח'], ['pull up', 'מתח'],
  ['דדליפט', 'דדליפט'], ['deadlift', 'דדליפט'], ['רומני', 'דדליפט רומני'],
  ['היפ תראסט', 'היפ ת׳ראסט'], ['hip thrust', 'היפ ת׳ראסט'],
  ['לאנג', 'לאנג׳'], ['בולגרי', 'סקוואט בולגרי'],
  /* the seven added on 17/09: the lunge family across the equipment it was
     missing, and one home movement for each muscle that had none */
  ['לאנג׳ בסמית׳', 'לאנג׳ בסמית׳'], ['לאנג׳ במוט', 'לאנג׳ במוט'],
  ['כפיפת מרפק בגומייה', 'כפיפת מרפק בגומייה'], ['משיכת כתפיים בגומייה', 'משיכת כתפיים בגומייה'],
  ['הרחקת ירך בשכיבה על הצד', 'הרחקת ירך בשכיבה על הצד'], ['הרחקת ירך בגומייה', 'הרחקת ירך בגומייה'],
  ['לטרל רייז', 'הרחקת כתף'], ['lateral raise', 'הרחקת כתף'],
  ['פייספול', 'פייס פול'], ['ארנולד', 'לחיצת ארנולד'],
  ['פאלוף', 'לחיצת פאלוף'], ['פלנק', 'פלאנק'], ['פלאנק', 'פלאנק'], ['plank', 'פלאנק'],
  ['קראנץ', 'כפיפות בטן'], ['כפיפות', 'כפיפות בטן'], ['היפ', 'היפ ת׳ראסט'], ['דדליפט ישר', 'דדליפט רגל ישרה'], ['גובלט', 'סקוואט גובלט'],
  ['סווינג', 'סווינג קטלבל'], ['האמר קרל', 'כפיפת פטיש'],
  ['פריצ׳ר', 'כפיפה בסקוט'], ['סקול קראשר', 'סקאל קראשר'],
  ['אבדוקטור', 'הרחקת ירך במכונה'], ['מקרבים', 'קירוב ירך במכונה'],
  ['סמית', 'לחיצת חזה בסמית׳'], ['אי זי', 'כפיפת מרפק במוט EZ'],
  ['פק דק', 'פרפר במכונה'], ['קרוסאובר', 'פרפר בפולי'],
  ['תאומים', 'הרמת עקבים בעמידה'], ['נורדיק', 'כפיפה נורדית'],
  /* REPORTED MISSING ON 13/10, and every one of them is the same shape: the
     words are SPLIT across the stored name, so a matcher comparing the query
     as one literal substring could never answer them however they were
     spelled. "לחיצת חזה מכונה" lost all 34 machine exercises at once, because
     the table spells every one of them "במכונה" and the ב was not typed. */
  ['לאנץ בולגרי', 'סקוואט בולגרי'], ['לאנג׳ בולגרי', 'סקוואט בולגרי'],
  ['מכרע בולגרי', 'סקוואט בולגרי'], ['לאנץ', 'לאנג׳'], ['מכרע', 'לאנג׳'],
  ['לחיצת חזה מכונה', 'לחיצת חזה במכונה'], ['מכונת חזה', 'לחיצת חזה במכונה'],
  ['חתירה מכונה', 'חתירה במכונה'],
  /* like טרייספס above, this names a MUSCLE and a piece of kit rather than a
     movement, and the table holds several that answer it equally well; the
     probe only asserts the pair of words reaches a shoulder machine at all,
     which before today it did not. */
  ['מכונת כתפיים', 'משיכת כתפיים במכונה'],
  /* typed the way a phone writes it, with the straight apostrophe the Hebrew
     keyboard actually produces rather than the geresh the table is written in */
  ["לאנג'", 'לאנג׳'], ["היפ ת'ראסט", 'היפ ת׳ראסט'], ['היפ טראסט', 'היפ ת׳ראסט'],
  /* and in the other order, which a person types as often as not */
  ['press chest', 'לחיצת חזה במכונה'], ['בולגרי סקוואט', 'סקוואט בולגרי'],
  ['שרוגים', 'משיכת כתפיים במשקולות'], ['כתף צדדית', 'הרחקת כתף'],
  ['כתף אחורית', 'פרפר הפוך'],
];

/* A FAMILY ANSWERS, NOT ONE ROW OF IT. The room's word for a movement is
   written on a single row - שראגס on the dumbbell shrug, בנץ on the barbell
   press - so before the key inherited along the name, typing it returned one
   exercise and the other eleven looked missing. The number is the least the
   family may return, not the most. */
const FAMILIES = [
  ['שראגס', 5], ['בנץ', 10], ['פולאפ', 4], ['דיפס', 3], ['סקווט', 8],
  ['לאנץ', 5], ['פול דאון', 4], ['מכונה', 17],
];

/* The same movement asked for in every language it now has a name in. This is
   the whole point of the eleven-name table: measured before it, Kniebeuge,
   スクワット, 深蹲 and sentadilla each returned NOTHING. */
const CROSS = [
  ['Kniebeuge','סקוואט'], ['sentadilla','סקוואט'], ['スクワット','סקוואט'], ['squat','סקוואט'],
  ['Bankdrücken','לחיצת חזה במוט'], ['ベンチプレス','לחיצת חזה במוט'], ['卧推','לחיצת חזה במוט'], ['supino','לחיצת חזה במוט'],
  ['Kreuzheben','דדליפט'], ['デッドリフト','דדליפט'], ['硬拉','דדליפט'], ['peso muerto','דדליפט'], ['stacco','דדליפט'],
  ['Klimmzüge','מתח'], ['懸垂','מתח'], ['引体向上','מתח'], ['dominadas','מתח'],
  ['Latziehen','פולי עליון'], ['ラットプルダウン','פולי עליון'], ['高位下拉','פולי עליון'], ['jalón al pecho','פולי עליון'],
  ['Liegestütze','שכיבות סמיכה'], ['腕立て伏せ','שכיבות סמיכה'], ['俯卧撑','שכיבות סמיכה'], ['pompes','שכיבות סמיכה'],
  ['Beinpresse','לחיצת רגליים'], ['レッグプレス','לחיצת רגליים'], ['腿举','לחיצת רגליים'],
  ['Bizepscurls mit Langhantel','כפיפת מרפק במוט'], ['バーベルカール','כפיפת מרפק במוט'],
  ['Wadenheben stehend','הרמת עקבים בעמידה'], ['站姿提踵','הרמת עקבים בעמידה'],
  ['Unterarmstütz','פלאנק'], ['プランク','פלאנק'], ['平板支撑','פלאנק'], ['gainage','פלאנק'],
  /* OPEN, and the same question as 'rice' in the food probes: 深蹲推举 (the
     thruster) BEGINS with 深蹲 while 杠铃深蹲 (the barbell squat) only
     contains it, and a name that begins with the word outranks one that
     contains it by design. Whether a bare movement word should instead mean
     the plainest exercise is undecided. */
  ['深蹲','סקוואט','open'],
];

let none = 0, wrong = 0;
for (const [q, want] of PROBES) {
  const hits = EX.filter((e) => match(e, q))
    .map((e, i) => [e, rank(e, q), i])
    .sort((x, y) => x[1] - y[1] || x[2] - y[2])
    .map((x) => x[0]);
  if (!hits.length) { console.log('  NONE   ' + q.padEnd(16) + ' wanted ' + want); none++; }
  else if (hits[0].n !== want) {
    console.log('  RANK   ' + q.padEnd(16) + ' wanted ' + want + '  got ' + hits[0].n);
    wrong++;
  }
}
for (const [q, want, open] of CROSS) {
  const hits = EX.filter((e) => match(e, q))
    .map((e, i) => [e, rank(e, q), i])
    .sort((x, y) => x[1] - y[1] || x[2] - y[2])
    .map((x) => x[0]);
  if (!hits.length) { console.log('  NONE   ' + q.padEnd(28) + ' wanted ' + want); none++; }
  else if (hits[0].n !== want) {
    console.log('  ' + (open ? 'open ' : 'RANK ') + '  ' + q.padEnd(28) + ' wanted ' + want + '  got ' + hits[0].n);
    if (!open) wrong++;
  }
}
let thin = 0;
for (const [q, least] of FAMILIES) {
  const n = EX.filter((e) => match(e, q)).length;
  if (n < least) { console.log('  THIN   ' + q.padEnd(16) + ' returned ' + n + ', the family has at least ' + least); thin++; }
}
bad += none + wrong + thin;

const byM = {};
for (const e of EX) byM[e.m[0]] = (byM[e.m[0]] || 0) + 1;
console.log('\n' + EX.length + ' exercises, ' + EX.filter((e) => e.aka).length + ' with aliases, ' +
  EX.filter((e) => e.s).length + ' with instructions');
console.log(db.muscles.map((m) => m + ' ' + (byM[m] || 0)).join(', '));
console.log((PROBES.length + CROSS.length) + ' words (' + CROSS.length + ' of them another language): ' + (PROBES.length + CROSS.length - none - wrong) + ' found the right movement, ' +
  none + ' found nothing, ' + wrong + ' found the wrong one');
if (structural.length) console.log(structural.length + ' problems in the table itself');
process.exit(bad ? 1 : 0);
