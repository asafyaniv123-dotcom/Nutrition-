/* The one box routes what is typed - lifted out of the shipped file and run.
 *
 * The rule was written and proved in a scratchpad first. This is the version
 * that actually ships, pulled from dev/index.html, because the thing between
 * the two is a patch script and an editor, and a swallowed backslash turns
 * \s into s without anybody noticing: "כוס קוטג" would still route as a
 * sentence, and "koses" would too.
 *
 * It also asserts the FALL-THROUGH, which is the part that makes the rule
 * safe to be wrong: a name the tables cannot place goes to the model anyway,
 * so the only cost of a misroute is a local search that had already run.
 */
import fs from 'fs';
import vm from 'vm';

const FILE = process.argv[2] || 'dev/index.html';
const src = fs.readFileSync(FILE, 'utf8');

const lift = (a, b) => {
  const i = src.indexOf(a), j = src.indexOf(b, i);
  if (i < 0 || j < 0) throw new Error('could not lift ' + a);
  return src.slice(i, j);
};

const ctx = { console };
vm.createContext(ctx);
vm.runInContext(lift('function sayIsSentence(t){', 'function oneHits('), ctx);
vm.runInContext(lift('function oneHits(q){', 'var _oneAsked'), ctx);
vm.runInContext(lift('function oneGo(){', 'function sayGo('), ctx);

const isSentence = (t) => vm.runInContext('sayIsSentence(' + JSON.stringify(t) + ')', ctx);

/* name = answered by the free local search, no network at all
   sentence = worth a model call */
const CASES = [
  ['בננה', false],
  ['לחם מחמצת', false],
  ['חזה עוף', false],
  ['אבוקדו', false],
  ['יוגורט יווני', false],
  ['קוטג תנובה', false],
  ['לחם מחמצת שיפון', false],
  ['שוקולד מריר', false],
  ['קוטג 5%', true],
  ['Herbalife 24', true],
  ['אכלתי בננה וכוס חלב', true],
  ['2 ביצים', true],
  ['אכלתי פיתה עם חומוס', true],
  ['150 גרם חזה עוף', true],
  ['פנקייק מ- ביצה, גביע קוטג 5%, 4 כפות קמח', true],
  ['כוס קוטג', true],
  ['חזה עוף עם אורז וסלט', true],
  ['שייק מסקופ אחד עם מים', true],
  ['לחם עם גבינה', true],
  ['שתיתי קפה', true],
];

let bad = 0;
for (const [q, want] of CASES) {
  const got = isSentence(q);
  if (got !== want) { bad++; console.log('  BAD  wanted ' + (want ? 'sentence' : 'name') + ', got ' + (got ? 'sentence' : 'name') + '   ' + q); }
}
console.log('  routing: ' + (CASES.length - bad) + ' of ' + CASES.length);

/* ── the fall-through ──
   oneGo asks the model whenever the rule says sentence OR the tables came up
   empty. Both halves are exercised here against a stubbed search, so a name
   the shelf does not carry still reaches the breakdown. */
let asked = null;
const run = (q, hits, ready) => {
  asked = null;
  Object.assign(ctx, {
    _foodsState: ready ? 'ready' : 'loading',
    foodSearch: () => (hits ? [{ id: 'x' }] : []),
    fdbPick: 1,
    fdbPaint: () => {},
    sayGo: () => { asked = q; },
    document: { getElementById: (id) => (id === 'fdb-q' ? { value: q } : null) },
  });
  vm.runInContext('oneGo()', ctx);
  return asked !== null;
};

const check = (what, ok) => { if (!ok) bad++; console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + what); };
check('a name the tables DO carry never leaves the phone ', run('בננה', true, true) === false);
check('a name the tables do NOT carry falls through      ', run('בננה', false, true) === true);
check('a sentence asks even when the search found rows   ', run('אכלתי פיתה עם חומוס', true, true) === true);
check('tables still loading: ask rather than drop it     ', run('בננה', true, false) === true);
check('one character does nothing at all                 ', run('ב', false, true) === false);

console.log(bad ? '\n' + bad + ' FAILED' : '\nthe box routes as designed');
process.exit(bad ? 1 : 0);
