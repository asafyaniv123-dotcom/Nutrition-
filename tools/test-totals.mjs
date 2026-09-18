/* Does a meal's protein get counted twice anywhere between the row and the
 * day?
 *
 *   node tools/test-totals.mjs [path/to/index.html]
 *
 * The report was 137.5 g of protein against 744 kcal, which is a real
 * contradiction: 137.5 g of protein is 550 kcal on its own, leaving 194 for
 * everything else. Either the protein is doubled or the calories are not.
 *
 * So this walks the whole chain with figures whose right answer is known by
 * hand, and checks it at every join:
 *
 *   sayAmount        one row -> its own four numbers
 *   sayAdd           the rows -> meals in the day
 *   sumDayTotals     the meals -> the day's four numbers
 *
 * and then checks the ARITHMETIC of the result against itself: 4 kcal per
 * gram of protein and carbohydrate, 9 per gram of fat. That is not a test of
 * the food table - Atwater disagrees with real foods often enough that this
 * project has a note about never concluding from it - but a total whose
 * protein alone exceeds its calories is wrong no matter whose table it came
 * from, and that is the shape being reported.
 *
 * The three row kinds all go in, because they reach sayAmount by different
 * routes: a plain table match scaled by weight, a packet's per-100g panel
 * folded in by picLabelOverlay, and a figure the person stated for the
 * portion itself - which is the one that would double if it were ever treated
 * as per-100g.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8802;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tot-'));
if (!fs.existsSync(CHROME)) { console.log('SKIP: no Chrome at ' + CHROME); process.exit(0); }
const app = fs.readFileSync(process.argv[2] || path.join(ROOT, 'dev/index.html'), 'utf8');

const DRIVE = `<script>
setTimeout(function(){
  var R={};
  try{
    /* ── one row, scaled by its weight ── */
    var chicken={n:'חזה עוף',k:165,p:31,c:0,f:3.6};
    var r1={food:chicken,amount:200,unit:'g',g:1};
    R.a1=sayAmount(r1);            /* 200g of 31/100 -> 62.0, not 124 */

    /* ── a row measured in pieces, where g is what one weighs ── */
    var peach={n:'אפרסק, טרי',k:39,p:0.9,c:9.5,f:0.3};
    var r2={food:peach,amount:1,unit:'unit',g:150};
    R.a2=sayAmount(r2);            /* one peach of 150g */
    R.a2grams=R.a2&&R.a2.grams;

    /* ── a figure the person stated FOR THE PORTION ──
       picLabelOverlay turns it into per-100g on the way in; sayAmount turns
       it back on the way out. If either half forgot, this is where a 25
       becomes a 37.5 or a 16.7. */
    var shake={n:'שייק חלבון',k:0,p:0,c:0,f:0};
    var r3={food:shake,amount:150,unit:'g',g:1};
    var said={basis:'serving',serving_g:150,kcal:200,p:25,c:20,f:2};
    R.overlaid=picLabelOverlay(r3,said,'said');
    R.per100=r3.food&&{k:r3.food.k,p:r3.food.p};
    R.a3=sayAmount(r3);            /* back to 200 kcal and 25 g */

    /* ── and the same stated figure with the weight CORRECTED afterwards ──
       the bug this guards: a stated 25 g must not become 50 because someone
       typed 300 instead of 150 */
    var r4={food:shake,amount:150,unit:'g',g:1};
    picLabelOverlay(r4,said,'said');
    r4.amount=300;
    R.a4=sayAmount(r4);            /* 300g of a 150g portion IS 50 - correct */

    /* ── the whole chain: rows -> meals -> the day ── */
    var d='2099-01-02';
    localStorage.removeItem('day_'+d);
    var realCur=(typeof curDate!=='undefined')?curDate:null;
    curDate=d;
    _sayItems=[r1,r2,r3];
    _sayCat='lunch';
    var realRender=window.render;window.render=function(){};
    var realToast=window.showToast;window.showToast=function(){};
    sayAdd();
    window.render=realRender;window.showToast=realToast;
    var day=loadDay(d);
    R.meals=day.meals.length;
    R.mealP=day.meals.map(function(m){return m.p;});
    var t=sumDayTotals(d,{});
    R.tot=t;
    /* the sum of the rows, computed here rather than read from the app */
    R.handP=Number((R.a1.p+R.a2.p+R.a3.p).toFixed(1));
    R.handK=R.a1.kcal+R.a2.kcal+R.a3.kcal;
    /* and the total's own arithmetic: protein alone cannot exceed the calories */
    R.fromMacros=Math.round(t.p*4+t.c*4+t.f*9);
    curDate=realCur;
  }catch(e){R.threw=String(e&&e.message||e);}
  fetch('/r',{method:'POST',body:JSON.stringify(R)});
},2000);
<\/script>`;

let got = null;
const server = http.createServer((req, res) => {
  const p = req.url.split('?')[0];
  if (p === '/r') {
    let b = '';
    req.on('data', (d) => { b += d; });
    req.on('end', () => { try { got = JSON.parse(b); } catch { got = null; } res.writeHead(200); res.end('ok'); });
    return;
  }
  if (p === '/dev/t.html') {
    const at = app.lastIndexOf('</body>');
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(app.slice(0, at) + DRIVE + app.slice(at));
  }
  const f = path.resolve(ROOT, '.' + (p.endsWith('/') ? p + 'index.html' : p));
  if (!f.startsWith(path.resolve(ROOT))) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end('no'); } res.writeHead(200); res.end(d); });
});
await new Promise((r) => server.listen(PORT, r));
await new Promise((resolve) => {
  const c = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--virtual-time-budget=16000', '--user-data-dir=' + TMP, '--dump-dom',
    'http://localhost:' + PORT + '/dev/t.html'], { stdio: 'ignore' });
  const t = setTimeout(() => { c.kill(); resolve(); }, 120000);
  c.on('exit', () => { clearTimeout(t); resolve(); });
});
server.close();
fs.rmSync(TMP, { recursive: true, force: true });
if (!got) { console.log('FAIL: the page never answered'); process.exit(1); }
if (got.threw) { console.log('FAIL: the page threw: ' + got.threw); process.exit(1); }

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const near = (a, b, e) => Math.abs(a - b) <= (e === undefined ? 0.05 : e);

console.log('one row at a time');
ok(near(got.a1.p, 62), '200 g of a 31 g/100 g chicken is 62 g of protein, not 124 (got ' + got.a1.p + ')');
ok(got.a1.kcal === 330, 'and 330 kcal (got ' + got.a1.kcal + ')');
ok(got.a2grams === 150, 'one peach weighs the 150 g the row says it does (got ' + got.a2grams + ')');
ok(near(got.a2.p, 1.4), 'and carries its own 1.4 g of protein (got ' + got.a2.p + ')');

console.log('');
console.log('a figure stated for the portion, there and back');
ok(got.overlaid === true, 'the stated figure is folded into the row');
ok(near(got.per100.p, 16.7), 'stored per 100 g as 16.7 for a 150 g portion (got ' + got.per100.p + ')');
ok(near(got.a3.p, 25), 'and read back out as the 25 g that was stated (got ' + got.a3.p + ')');
ok(got.a3.kcal === 200, 'with its 200 kcal intact (got ' + got.a3.kcal + ')');
ok(near(got.a4.p, 50, 0.15), 'correcting the weight to 300 g really is 50 g — scaled, not doubled. The .1 is the per-100g value carrying one decimal, not an error (got ' + got.a4.p + ')');

console.log('');
console.log('rows into the day');
ok(got.meals === 3, 'three rows become three meals (got ' + got.meals + ')');
ok(near(got.tot.p, got.handP), 'the day total protein equals the rows added up by hand: ' +
   got.tot.p + ' vs ' + got.handP);
ok(got.tot.kcal === got.handK, 'and the calories too: ' + got.tot.kcal + ' vs ' + got.handK);

console.log('');
console.log('and the total does not contradict itself');
ok(got.tot.p * 4 <= got.tot.kcal + 1,
   'protein alone does not exceed the calories (' + got.tot.p + ' g = ' + Math.round(got.tot.p * 4) +
   ' kcal, of ' + got.tot.kcal + ')');
ok(Math.abs(got.fromMacros - got.tot.kcal) <= Math.max(25, got.tot.kcal * 0.12),
   'and the macros add up to roughly the calories (' + got.fromMacros + ' vs ' + got.tot.kcal + ')');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('nothing is counted twice between a row and the day');
