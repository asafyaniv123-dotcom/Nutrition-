/* Raw or cooked - does the matcher pick the row the person meant?
 *
 *   node tools/test-cooking-state.mjs              the working tree
 *   node tools/test-cooking-state.mjs <file>       another revision's app
 *
 * "189 גרם פילה עוף (משקל לפני בישול)" was answered with cooked chicken: 31 g
 * of protein per 100 g where the raw row says 22.5, which on 189 g is 62 g
 * against 43. The tables were innocent - the right row was there all along -
 * and there were three separate reasons the matcher would not take it:
 *
 *   the GATE was the longest token, and גולמי is longer than both עוף and
 *   חזה while appearing as a word in none of the 7,240 rows, so every
 *   candidate scored -1 and the answer came from the fallback;
 *   the raw row was DOCKED 2500 as a form nobody asked for, because
 *   'לא מבושל' sits in SAY_DERIVED and nobody types that phrase;
 *   and a fried row was neither raw nor cooked, because מטוגן was missing
 *   from SAY_COOKED - so the row furthest from "raw" escaped every penalty.
 *
 * Ranked here exactly as sayResolve ranks: same score function, same gate
 * argument. What is NOT covered is sayResolveAI, which can overrule this list
 * afterwards from the server - that is a separate endpoint and a separate
 * check.
 *
 * The regression half matters as much as the new half. Three of these cases
 * were already right before any of it, and a state rule is exactly the kind
 * of change that fixes one column by breaking another.
 */
import fs from 'fs';
import vm from 'vm';

const FILE = process.argv[2] || 'dev/index.html';
const src = fs.readFileSync(FILE, 'utf8');
const lift = (from, to) => {
  const a = src.indexOf(from), b = src.indexOf(to, a);
  if (a < 0 || b < 0) throw new Error('could not lift ' + from);
  return src.slice(a, b);
};

/* the food core, exactly as test-food-search lifts it, plus the say block */
const code =
  lift('function foodName(f){', 'function foodsLoad(then){') +
  '\n' + lift('var FOOD_STOP=', 'SCANNING A BARCODE').replace(/\/\*[^*]*$/, '') +
  '\n' + lift('var SAY_DERIVED=', 'function sayCandLine(') +
  '\n' + lift('function sayScore(f,q,toks){', 'function sayResolve(it){');

const ctx = { _foods: null, console };
vm.createContext(ctx);
vm.runInContext('function appLang(){return "he";}function langOn(f){f();}function _t(s){return s;}', ctx);
vm.runInContext(code, ctx);

const FILES = ['data/foods.core.json', 'data/foods.json', 'data/foods.off.json'];
const rows = [];
for (const f of FILES) {
  if (!fs.existsSync(f)) continue;
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const r of (Array.isArray(j) ? j : (j.foods || j.rows || Object.values(j)[0]))) rows.push(r);
}
ctx._foods = rows.map((r, k) => Object.assign({}, r, { i: k }));
vm.runInContext('for(var z=0;z<_foods.length;z++){var f=_foods[z];' +
  'if(f.t){f.n=foodName(f);f.alt=foodAlt(f);if(typeof foodNames==="function")f.na=foodNames(f);}' +
  'f.s=foodKey(f.n||"");}', ctx);

/* the same ranking sayResolve does: sayScore(f, foldedQuery, tokens, tokens[0]) */
const best = (q) => vm.runInContext(`(function(){
  var k=foodKey(${JSON.stringify(q)}),t=foodTokens(${JSON.stringify(q)}),out=[];
  for(var i=0;i<_foods.length;i++){var s=sayScore(_foods[i],k,t,t[0]);if(s>=0)out.push({f:_foods[i],s:s});}
  if(!out.length)for(var i=0;i<_foods.length;i++){var s=sayScore(_foods[i],k,t,null);if(s>=0)out.push({f:_foods[i],s:s});}
  out.sort(function(a,b){return b.s-a.s;});
  return out.length?{n:out[0].f.n,k:out[0].f.k,p:out[0].f.p}:null;
})()`, ctx);

/* what the answer has to be true of, rather than which row it has to be:
   naming one row welds the test to today's table */
const CASES = [  // an optional 5th field is a word the NAME must contain
  // the report, in the words a person actually writes
  ['חזה עוף חי',              'raw',    [100, 130], [20, 25]],
  ['חזה עוף גולמי',           'raw',    [100, 130], [20, 25]],
  ['חזה עוף לפני בישול',      'raw',    [100, 130], [20, 25]],
  ['פילה עוף לפני בישול',     'raw',    [100, 130], [20, 25], 'עוף'],
  // and the phrase the tables use, which was the only one that worked before
  ['חזה עוף לא מבושל',        'raw',    [100, 130], [20, 25]],
  // other foods, so the rule is not a chicken rule
  ['סלמון חי',                'raw',    [100, 200], [17, 25]],
  ['בשר בקר טחון לפני בישול', 'raw',    [200, 280], [15, 22]],
  // REGRESSION: these were right before and must stay right
  ['חזה עוף מבושל',           'cooked', [140, 200], [25, 35]],
  ['חזה עוף',                 'any',    [140, 200], [25, 35]],
];

let bad = 0;
console.log('\n  query                        picked                                          kcal   p');
for (const [q, want, kR, pR, mustHave] of CASES) {
  const r = best(q);
  /* an older revision has no sayAskState at all - that IS the bug, so the
     probe reports it rather than crashing on it */
  const ask = vm.runInContext('typeof sayAskState==="function"?sayAskState(' + JSON.stringify(q) + '):"(no such rule)"', ctx);
  const okState = want === 'any' || ask === want;
  const okK = r && r.k >= kR[0] && r.k <= kR[1];
  const okP = r && r.p >= pR[0] && r.p <= pR[1];
  /* the food itself, not only its numbers: פילה עוף returned TURKEY whose
     values happen to sit inside the range, and it PASSED. A test that is
     satisfied by the wrong food is worse than one that fails. */
  const okFood = !mustHave || (r && r.n.indexOf(mustHave) >= 0);
  const ok = okState && okK && okP && okFood;
  if (!ok) bad++;
  console.log('  ' + (ok ? 'ok  ' : 'BAD ') + q.padEnd(26) +
    String(r ? r.n : '(none)').slice(0, 46).padEnd(48) +
    String(r ? r.k : '-').padStart(4) + '  ' + String(r ? r.p : '-').padStart(5) +
    (ok ? '' : '   want ' + kR.join('-') + ' kcal, ' + pR.join('-') + ' p' +
      (okState ? '' : ', state ' + want + ' got "' + ask + '"') +
      (okFood ? '' : ', the name must contain "' + mustHave + '"')));
}

/* the two vocabularies, asserted against the tables rather than assumed -
   a word list is the thing that rots */
console.log('');
const wordRows = (w) => rows.filter((r) => new RegExp('(^|[ ,(\\-])' + w + '([ ,)\\-]|$)').test(r.n || '')).length;
const say = (what, ok, detail) => { if (!ok) bad++; console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + what + (detail ? '   ' + detail : '')); };
say('fried counts as cooked                ', vm.runInContext('sayCooked("בשר עוף, חזה מטוגן ללא שמן")', ctx));
say('and מטוגן really is table vocabulary  ', wordRows('מטוגן') > 100, wordRows('מטוגן') + ' rows');
say('טרי stayed OUT of the raw words       ', !vm.runInContext('typeof SAY_RAWQ!=="undefined"&&SAY_RAWQ.indexOf("טרי")>=0', ctx),
  'it is a word in ' + wordRows('טרי') + ' rows and means fresh');
say('מבושל stayed OUT of the state tokens  ', !vm.runInContext('typeof SAY_STATET!=="undefined"&&!!SAY_STATET["מבושל"]', ctx),
  'a word in ' + wordRows('מבושל') + ' rows, and a good gate');
say('a bare query asks for no state        ', vm.runInContext('typeof sayAskState==="function"&&sayAskState("חזה עוף")===""', ctx));

console.log(bad ? '\n' + bad + ' FAILED' : '\nthe state decides which row, and never which food');
process.exit(bad ? 1 : 0);
