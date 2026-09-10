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
const a = src.indexOf('function exMatch(e,q){');
const b = src.indexOf('function exOpen(){');
if (a < 0 || b < 0 || b <= a) throw new Error('could not lift exMatch/exRank');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(src.slice(a, b), ctx);
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
bad += none + wrong;

const byM = {};
for (const e of EX) byM[e.m[0]] = (byM[e.m[0]] || 0) + 1;
console.log('\n' + EX.length + ' exercises, ' + EX.filter((e) => e.aka).length + ' with aliases, ' +
  EX.filter((e) => e.s).length + ' with instructions');
console.log(db.muscles.map((m) => m + ' ' + (byM[m] || 0)).join(', '));
console.log(PROBES.length + ' gym words: ' + (PROBES.length - none - wrong) + ' found the right movement, ' +
  none + ' found nothing, ' + wrong + ' found the wrong one');
if (structural.length) console.log(structural.length + ' problems in the table itself');
process.exit(bad ? 1 : 0);
