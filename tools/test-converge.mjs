/* The loop only converges if the terms the second opinion hands back actually
 * resolve to a better row in OUR matcher. Catching the wrong row is half of
 * it; the other half is whether looking again with those words helps.
 *
 * So: take the terms it returned, run the shipped scorer with them, and print
 * what round 2 would have landed on.
 */
import fs from 'fs';
import vm from 'vm';

const src = fs.readFileSync('dev/index.html', 'utf8');
const lift = (a, b) => { const i = src.indexOf(a), j = src.indexOf(b); if (i < 0 || j < 0) throw new Error('lift ' + a); return src.slice(i, j); };
let code = lift('function foodName(f){', 'function foodsLoad(then){');
const c = lift('var FOOD_STOP=', 'SCANNING A BARCODE');
code += c.slice(0, c.lastIndexOf('/*'));
code += lift('function sayCandidates(', 'function sayResolve(');


const ctx = { console, _foods: null };
vm.createContext(ctx);
vm.runInContext('function appLang(){return "he";}function langOn(fn){fn();}', ctx);
vm.runInContext(code, ctx);

const rows = [];
for (const f of ['data/foods.core.json', 'data/foods.json', 'data/foods.off.json']) {
  if (!fs.existsSync(f)) continue;
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const r of (Array.isArray(j) ? j : (j.foods || j.rows || Object.values(j)[0]))) rows.push(r);
}
ctx._foods = rows.map((r, k) => Object.assign({}, r, { i: k }));
vm.runInContext('for(var z=0;z<_foods.length;z++){var f=_foods[z];if(f.t){f.n=foodName(f);f.alt=foodAlt(f);' +
  'if(typeof foodNames==="function")f.na=foodNames(f);}f.s=foodKey(f.n+(f.aka&&f.aka.length?" "+f.aka.join(" "):""));}', ctx);

const best = (q) => vm.runInContext(
  '(function(){var q=foodKey(' + JSON.stringify(q) + '),t=foodTokens(' + JSON.stringify(q) + '),o=[];' +
  'for(var i=0;i<_foods.length;i++){var s=sayScore(_foods[i],q,t,t[0]);if(s>=0)o.push([s,_foods[i]]);}' +
  'o.sort(function(a,b){return b[0]-a[0];});var f=o.length?o[0][1]:null;' +
  'return f?{n:f.n,k:f.k,p:f.p,f:f.f}:null;})()', ctx);

const CASES = [
  { what: 'egg', grams: 50, wrong: 'ביצה שלמה מיובשת', terms: ['ביצה', 'ביצה שלמה', 'ביצים'] },
  { what: 'chicken', grams: 150, wrong: 'בשר עוף, פילה עוף אמיתי/בשומשום, מאמא עוף', terms: ['חזה עוף', 'עוף מבושל', 'חזה עוף בגריל'] },
];

for (const c of CASES) {
  const w = ctx._foods.find(x => x.n === c.wrong);
  console.log('─'.repeat(70));
  console.log(c.what + ', ' + c.grams + ' g');
  console.log('  round 1 picked   ' + Math.round(w.k * c.grams / 100) + ' kcal  ' +
    (w.p * c.grams / 100).toFixed(1) + ' p    ' + w.n.slice(0, 44));
  for (const t of c.terms) {
    const b = best(t);
    if (!b) { console.log('  "' + t + '" -> nothing'); continue; }
    console.log('  "' + t.padEnd(14) + '" -> ' + String(Math.round(b.k * c.grams / 100)).padStart(4) + ' kcal  ' +
      (b.p * c.grams / 100).toFixed(1).padStart(5) + ' p    ' + b.n.slice(0, 44));
  }
}
console.log('─'.repeat(70));
