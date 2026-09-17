/* A panel stated PER TUB, and the doubling it caused.
 *
 *   node tools/test-per-tub.mjs [path/to/index.html]
 *
 * A yogurt whose label prints 108 kcal and 20 g of protein FOR THE TUB came
 * out as 216 and 40, with an estimated weight of 40,000 g. Both numbers name
 * the cause: 216 is 108 doubled by a 200 g package, and 40,000 is 200 x 200.
 *
 * THE SEAM IS picServingG. It reads a trailing number and unit - "170g", "250
 * ml" - and a serving written "1 tub", "לגביע", "per pot" has no number in it
 * at all, so it answers 0. Zero means "not a serving", the overlay falls back
 * to treating the figures as PER 100 G, and then the row multiplies them by
 * the package weight. The label was read correctly and the arithmetic after it
 * was not.
 *
 * Both shapes are asserted, because fixing the second by breaking the first is
 * the obvious way to get this wrong: a serving that DOES carry grams must keep
 * working exactly as it does.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8801;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'pertub-'));
if (!fs.existsSync(CHROME)) { console.log('SKIP: no Chrome at ' + CHROME); process.exit(0); }
const app = fs.readFileSync(process.argv[2] || path.join(ROOT, 'dev/index.html'), 'utf8');

/* what the worker answers for a tub whose panel is per tub - the serving
   string carries no grams, which is the whole case */
const perTub = (serving) => ({
  ok: true,
  product_name: 'GO Protein יוגורט חלבון תות',
  brand: 'GO Protein',
  serving: serving,
  packaged: true,
  estimated: false,
  confidence: 'High',
  cooking_state: 'unspecified',
  meal_type: 'snack',
  package_g: 200,
  package_is_guess: false,
  values: { kcal: 108, p: 20, c: 6, f: 0.2, sod: null },
  items: [],
  why: 'stub',
});

const DRIVE = `<script>
var ANS=null;
(function(){var real=window.fetch;
 window.fetch=function(u,o){
  if(String(u).indexOf('/vision')>=0)
    return Promise.resolve({ok:true,json:function(){return Promise.resolve(ANS);}});
  if(String(u).indexOf('/match')>=0||String(u).indexOf('/cross')>=0)
    return Promise.resolve({ok:true,json:function(){return Promise.resolve({ok:true,pick:-1,sure:false});}});
  return real.apply(this,arguments);};})();
setTimeout(function(){
  var R={};
  foodsLoad(function(){
    var shot='data:image/jpeg;base64,'+'A'.repeat(800)+'==';
    var run=function(ans,cb){
      ANS=ans;_sayItems=null;_picShots=[shot];
      picGo([shot],'אכלתי גביע אחד');
      setTimeout(function(){
        var row=(_sayItems||[])[0],a=row?sayAmount(row):null;
        cb(row?{amount:row.amount,unit:row.unit,g:row.g,
                kcal:a?a.kcal:null,p:a?a.p:null,grams:a?a.grams:null,
                name:row.food?row.food.n:null}:null);
      },2600);
    };
    /* 1 - the serving names no grams at all */
    run(${JSON.stringify(null)}||perTubJS('1 גביע'),function(r1){
      R.tub=r1;
      /* 2 - the same label with grams in the serving, which already worked */
      run(perTubJS('200g'),function(r2){
        R.grams=r2;
        fetch('/r',{method:'POST',body:JSON.stringify(R)});
      });
    });
  });
},2200);
<\/script>`;

const inject = DRIVE.replace('perTubJS(\'1 גביע\')', JSON.stringify(perTub('1 גביע')))
  .replace('perTubJS(\'200g\')', JSON.stringify(perTub('200g')))
  .replace('${JSON.stringify(null)}||', '');

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
    return res.end(app.slice(0, at) + inject + app.slice(at));
  }
  const f = path.resolve(ROOT, '.' + (p.endsWith('/') ? p + 'index.html' : p));
  if (!f.startsWith(path.resolve(ROOT))) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end('no'); } res.writeHead(200); res.end(d); });
});
await new Promise((r) => server.listen(PORT, r));
await new Promise((resolve) => {
  const c = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--virtual-time-budget=30000', '--user-data-dir=' + TMP, '--dump-dom',
    'http://localhost:' + PORT + '/dev/t.html'], { stdio: 'ignore' });
  const t = setTimeout(() => { c.kill(); resolve(); }, 150000);
  c.on('exit', () => { clearTimeout(t); resolve(); });
});
server.close();
fs.rmSync(TMP, { recursive: true, force: true });
if (!got) { console.log('FAIL: the page never answered'); process.exit(1); }

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const show = (r) => r ? (r.amount + ' ' + r.unit + '  ' + r.kcal + ' kcal, ' + r.p + ' p, weighs ' + r.grams + ' g') : 'no row';

console.log('a serving written "1 גביע" - no grams anywhere in it');
console.log('  ' + show(got.tub));
ok(got.tub && got.tub.kcal === 108, 'the tub is 108 kcal, not doubled (got ' + (got.tub || {}).kcal + ')');
ok(got.tub && got.tub.p === 20, 'and 20 g of protein (got ' + (got.tub || {}).p + ')');
ok(got.tub && got.tub.grams === 200, 'weighing 200 g, not 40,000 (got ' + (got.tub || {}).grams + ')');

console.log('');
console.log('the same label with grams in the serving - this already worked');
console.log('  ' + show(got.grams));
ok(got.grams && got.grams.kcal === 108, 'still 108 kcal (got ' + (got.grams || {}).kcal + ')');
ok(got.grams && got.grams.p === 20, 'still 20 g of protein (got ' + (got.grams || {}).p + ')');

console.log('');
if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); }
console.log('a serving with no number in it is still one serving');
