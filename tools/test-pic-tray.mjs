/* The tray, the request it sends, and the per-item panels that come back.
 *
 *   node tools/test-pic-tray.mjs
 *
 * WHAT THIS CAN AND CANNOT CHECK. The model half needs a deployed worker and a
 * key, and neither belongs in a test that anyone can run. So /vision is
 * STUBBED here with a canned two-item answer, and what is actually driven is
 * the half that lives in the app: several pictures go into the tray, the send
 * button takes them WITH the sentence, the request carries every one of them,
 * and each returned item's own panel lands on its own row.
 *
 * That last one is the point of the feature. A cheese photographed beside a
 * tomato paste has to end up with the CHEESE's protein on the cheese row - not
 * the tables' average cheese, and not the paste's numbers.
 *
 * It drives the real page in headless Chrome: calling the functions from a
 * console has produced false passes in this project more than once.
 *
 * Needs Chrome. Nothing else - no key, no network, no deploy.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8771;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'pictray-'));

if (!fs.existsSync(CHROME)) {
  console.log('SKIP: no Chrome at ' + CHROME + ' (set CHROME=... to point at one)');
  process.exit(0);
}

/* Takes a path, so it can be pointed at an older revision. A check that has
   never caught anything has not been tested: against the revision before the
   tray, this reports the page threw on _picShots. */
const app = fs.readFileSync(process.argv[2] || path.join(ROOT, 'dev/index.html'), 'utf8');

/* a 1x1 jpeg, big enough to be a data: URL and small enough to inline */
const DOT = 'data:image/jpeg;base64,' + Buffer.from(
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a' +
  'HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAA' +
  'AAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==', 'base64',
).toString('base64');

/* what a worker WOULD answer for a cheese and a tomato paste plus a sentence */
const CANNED = {
  ok: true,
  product_name: 'טוסט גבינה',
  brand: null,
  serving_size_analyzed: '100g',
  is_packaged_product: false,
  is_estimated: true,
  confidence: 'Medium',
  cooking_state: 'unspecified',
  meal_type: 'unspecified',
  package_g: null,
  package_is_guess: false,
  nutritional_values: null,
  items: [
    { name: 'גבינה צהובה', grams: 25, from_label: true,
      per_100g: { calories_kcal: 350, protein_g: 27.5, carbohydrates_g: 1.2, fat_g: 26 } },
    { name: 'רסק עגבניות', grams: 15, from_label: true,
      per_100g: { calories_kcal: 82, protein_g: 4.3, carbohydrates_g: 18.9, fat_g: 0.5 } },
    { name: 'לחם', grams: 30, from_label: false, per_100g: null },
  ],
  why: 'canned',
};

const INJECT = '<script>(function(){' +
  'var real=window.fetch;' +
  'window.__sent=null;' +
  'window.fetch=function(u,o){' +
  '  if(String(u).indexOf("/vision")>=0){' +
  '    try{window.__sent=JSON.parse(o.body);}catch(e){window.__sent={parseError:String(e)};}' +
  '    return Promise.resolve({ok:true,json:function(){return Promise.resolve(' +
  JSON.stringify(CANNED) + ');}});' +
  '  }' +
  '  return real.apply(this,arguments);' +
  '};' +
  '})();<\/script>';

const DRIVE = '<script>setTimeout(function(){' +
  'var R={};' +
  'try{' +
  '  _addMode="find";' +
  '  _picShots=[];' +
  /* three pictures in, one taken back out - a tray you cannot remove from is
     a trap, and the removal has to renumber what is left */
  '  _picShots.push("' + DOT + '");_picShots.push("' + DOT + '");_picShots.push("' + DOT + '");' +
  '  R.afterPush=_picShots.length;' +
  '  picDrop(1);' +
  '  R.afterDrop=_picShots.length;' +
  '  R.trayHTML=picShotsHTML().indexOf("shot-x")>=0;' +
  '  var el=document.getElementById("fdb-q");' +
  '  if(el)el.value="עשיתי מזה טוסט - פרוסת גבינה צהובה ומרית רסק עגבניות";' +
  '  oneGo();' +
  '}catch(e){R.threw=String(e&&e.message||e);}' +
  'setTimeout(function(){' +
  '  var sent=window.__sent||{};' +
  '  R.sentImages=Array.isArray(sent.images)?sent.images.length:-1;' +
  '  R.sentImageToo=!!sent.image;' +
  '  R.sentNote=String(sent.note||"");' +
  '  R.rows=(_sayItems||[]).map(function(r){' +
  '    return {q:r.q,amount:r.amount,' +
  '            kcal:r.food?Math.round((r.food.kcal||0)*10)/10:null,' +
  '            p:r.food?Math.round((r.food.p||0)*10)/10:null};});' +
  '  fetch("/result?r="+encodeURIComponent(JSON.stringify(R)));' +
  '},2500);' +
  '},1600);<\/script>';

let result = null;
const types = { '.html': 'text/html', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const [p, q] = req.url.split('?');
  if (p === '/result') {
    try { result = JSON.parse(new URLSearchParams(q).get('r')); } catch { result = { bad: q }; }
    res.writeHead(200); return res.end('ok');
  }
  if (p === '/dev/t.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(app.replace('</body>', INJECT + DRIVE + '</body>'));
  }
  const file = path.resolve(ROOT, '.' + (p.endsWith('/') ? p + 'index.html' : p));
  if (!file.startsWith(path.resolve(ROOT))) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('no'); }
    res.writeHead(200, { 'content-type': (types[path.extname(file)] || 'application/octet-stream') + (path.extname(file) === '.html' ? '; charset=utf-8' : '') });
    res.end(data);
  });
});
await new Promise((r) => server.listen(PORT, r));

await new Promise((resolve) => {
  const c = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run',
    '--no-default-browser-check', '--virtual-time-budget=20000',
    '--user-data-dir=' + TMP, '--dump-dom',
    'http://localhost:' + PORT + '/dev/t.html'], { stdio: 'ignore' });
  const t = setTimeout(() => { c.kill(); resolve(); }, 120000);
  c.on('exit', () => { clearTimeout(t); resolve(); });
});
server.close();

if (!result) { console.log('FAIL: the page never reported back'); process.exit(1); }
if (result.threw) { console.log('FAIL: the page threw: ' + result.threw); process.exit(1); }

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

console.log('the tray');
ok(result.afterPush === 3, 'three pictures go in');
ok(result.afterDrop === 2, 'and one comes back out');
ok(result.trayHTML === true, 'each thumbnail carries its own remove control');

console.log('the request');
ok(result.sentImages === 2, 'every picture in the tray is sent (got ' + result.sentImages + ')');
ok(result.sentImageToo === true, 'and `image` is sent too, so an undeployed worker still answers');
ok(/טוסט/.test(result.sentNote), 'the sentence travels with the pictures');

console.log('the answer');
const rows = result.rows || [];
ok(rows.length === 3, 'three rows came back (got ' + rows.length + ')');
/* 25 g of a 27.5 g/100 g cheese is 6.9 g of protein. The tables' average
   yellow cheese is not that, which is the whole point of the photograph. */
const cheese = rows[0] || {};
ok(cheese.amount === 25, 'the cheese row is 25 g, from the sentence (got ' + cheese.amount + ')');
ok(Math.abs((cheese.p || 0) - 27.5) < 0.6,
   "the cheese row carries the CHEESE PACKET's protein, 27.5/100g (got " + cheese.p + ')');
const paste = rows[1] || {};
ok(Math.abs((paste.p || 0) - 4.3) < 0.6,
   "the paste row carries the PASTE's protein, 4.3/100g (got " + paste.p + ')');
ok(cheese.p !== paste.p, 'and the two rows did not get the same panel');

fs.rmSync(TMP, { recursive: true, force: true });
console.log('');
if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); }
console.log('the tray, the request and the per-item panels all hold');
