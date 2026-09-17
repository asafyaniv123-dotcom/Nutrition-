/* One photograph, and words that say what was made from it.
 *
 *   node tools/test-pic-words-win.mjs [path/to/index.html]
 *
 * THE CASE THAT WAS NEVER COVERED, and therefore broke. A tub of whey plus
 * "סקופ מהאבקה הזאת עם קצת חלב (25 גרם חלבון)" produces an answer that has
 * BOTH shapes in it: a product reading with a panel and a package weight, AND
 * a list of what was actually eaten. picVision had to choose, and it chose the
 * product - so a 30 g scoop was logged as the 900 g tub, the milk disappeared,
 * and the 25 g of protein the person had typed never reached anything.
 *
 * THE RULE UNDER TEST: a packet photographed with NOTHING written is a product
 * - log the package. The same packet photographed WITH words describing a
 * portion is an ingredient - the words say how much, the packet says what a
 * gram is worth. Both halves are asserted here, because fixing the second by
 * breaking the first would pass a test that only looked at one.
 *
 * /vision is stubbed: this is about which branch the app takes, not about the
 * model. The live version of the same case is tools/test-vision-multi.mjs.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8779;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'picwords-'));
if (!fs.existsSync(CHROME)) { console.log('SKIP: no Chrome at ' + CHROME); process.exit(0); }

const app = fs.readFileSync(process.argv[2] || path.join(ROOT, 'dev/index.html'), 'utf8');
const DOT = 'data:image/jpeg;base64,' + 'A'.repeat(800) + '==';

/* exactly the shape the live worker returns for a tub of whey: a product
   reading AND the portion the words described */
const ANSWER = {
  ok: true,
  product_name: 'אבקת חלבון מי גבינה WHEY GOLD',
  brand: null,
  serving: '100g',
  packaged: true,
  estimated: false,
  confidence: 'High',
  cooking_state: 'unspecified',
  meal_type: 'unspecified',
  package_g: 900,
  package_is_guess: false,
  values: { kcal: 380, p: 75, c: 8, f: 5, sod: null },
  items: [
    { name: 'אבקת חלבון מי גבינה WHEY GOLD', grams: 30, from_label: false, per_100g: null,
      stated_by_user: { calories_kcal: null, protein_g: 25, carbohydrates_g: null, fat_g: null } },
    { name: 'חלב', grams: 60, from_label: false, per_100g: null, stated_by_user: null },
  ],
  why: 'stub',
};

const stub = (note) => '<script>(function(){var real=window.fetch;' +
  'window.fetch=function(u,o){' +
  ' if(String(u).indexOf("/vision")>=0)return Promise.resolve({ok:true,json:function(){' +
  '  return Promise.resolve(' + JSON.stringify(ANSWER) + ');}});' +
  ' return real.apply(this,arguments);};})();<\/script>' +
  '<script>setTimeout(function(){try{_addMode="find";_picShots=["' + DOT + '"];' +
  '  picGo(_picShots.slice(),' + JSON.stringify(note) + ');}catch(e){window.__e=String(e&&e.message||e);}' +
  ' setTimeout(function(){fetch("/r",{method:"POST",body:JSON.stringify({' +
  '  e:window.__e||null,' +
  '  rows:(_sayItems||[]).map(function(r){return {q:r.q,amount:r.amount,src:r.src,' +
  '    p:r.food?Math.round((r.food.p||0)*10)/10:null,k:r.food?Math.round(r.food.k||0):null};})' +
  ' })});},2600);},1400);<\/script>';

const results = {};
const types = { '.html': 'text/html', '.json': 'application/json', '.js': 'text/javascript' };
let current = '';
const server = http.createServer((req, res) => {
  const p = req.url.split('?')[0];
  if (p === '/r') {
    let b = '';
    req.on('data', (d) => { b += d; });
    req.on('end', () => { try { results[current] = JSON.parse(b); } catch { results[current] = { raw: b }; } res.writeHead(200); res.end('ok'); });
    return;
  }
  if (p.startsWith('/dev/case-')) {
    /* the LAST </body>: the game ships as a text/html template with one of its
       own, and a first-match replace puts the stub where it never runs */
    const at = app.lastIndexOf('</body>');
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(app.slice(0, at) + stub(current === 'words' ? 'סקופ מהאבקה הזאת עם קצת חלב (25 גרם חלבון)' : '') + app.slice(at));
  }
  const f = path.resolve(ROOT, '.' + (p.endsWith('/') ? p + 'index.html' : p));
  if (!f.startsWith(path.resolve(ROOT))) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('no'); }
    res.writeHead(200, { 'content-type': (types[path.extname(f)] || 'application/octet-stream') + (path.extname(f) === '.html' ? '; charset=utf-8' : '') });
    res.end(d);
  });
});
await new Promise((r) => server.listen(PORT, r));

for (const c of ['words', 'silent']) {
  current = c;
  await new Promise((resolve) => {
    const ch = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run',
      '--no-default-browser-check', '--virtual-time-budget=20000',
      '--user-data-dir=' + TMP + c, '--dump-dom',
      'http://localhost:' + PORT + '/dev/case-' + c + '.html'], { stdio: 'ignore' });
    const t = setTimeout(() => { ch.kill(); resolve(); }, 120000);
    ch.on('exit', () => { clearTimeout(t); resolve(); });
  });
}
server.close();

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

console.log('a packet photographed WITH words - the words decide how much');
const w = (results.words || {}).rows || [];
if ((results.words || {}).e) console.log('  (page threw: ' + results.words.e + ')');
ok(w.length === 2, 'both components are rows (got ' + w.length + ')');
ok((w[0] || {}).amount === 30, 'the scoop is 30 g, not the 900 g tub (got ' + (w[0] || {}).amount + ')');
/* 25 g of protein inside a 30 g scoop is 83.3 per 100 g */
ok(Math.abs(((w[0] || {}).p || 0) - 83.3) < 1,
   'and its protein is the 25 g the person typed (got ' + (w[0] || {}).p + ' per 100 g, expected 83.3)');
ok((w[0] || {}).src === 'said', 'tagged as theirs, not as a label (got ' + (w[0] || {}).src + ')');
/* kcal still comes off the photographed tub: 380 per 100 g */
ok(Math.abs(((w[0] || {}).k || 0) - 380) < 12,
   "the calories still come off the photographed tub (got " + (w[0] || {}).k + ', expected ~380)');
ok((w[1] || {}).amount === 60, 'the milk is 60 g - "a little", not a glass (got ' + (w[1] || {}).amount + ')');

console.log('');
console.log('the same packet photographed SILENTLY is still a product');
const q = (results.silent || {}).rows || [];
ok(q.length === 1, 'one row, the product (got ' + q.length + ')');
ok((q[0] || {}).amount === 900, 'logged as the package, 900 g (got ' + (q[0] || {}).amount + ')');

fs.rmSync(TMP + 'words', { recursive: true, force: true });
fs.rmSync(TMP + 'silent', { recursive: true, force: true });
console.log('');
if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); }
console.log('the words decide how much, the packet decides what it is worth');
