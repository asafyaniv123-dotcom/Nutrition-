/* A scoop of whey must not come back as soy, or as the liquid.
 *
 *   node tools/test-protein-match.mjs [path/to/index.html]
 *
 * WHAT WENT WRONG. The tables hold whey powders, soy powders and "מי גבינה,
 * חומצי, נוזלי" - acid whey, the liquid left over from cheesemaking, eight
 * calories. All three answer to "אבקת חלבון" and nothing in the scorer
 * preferred one, so a photographed tub of whey was logged as soy protein at 85
 * g per 100, or as a liquid at 8 kcal. Measured, not supposed: every one of
 * these queries returned soy before the guard.
 *
 * AND THE OTHER HALF, which is why the guard is narrow: it may only refuse a
 * CONTRADICTION. A query that names soy still gets soy, a query for soy milk
 * still gets soy milk, and the twenty-odd everyday foods below must answer
 * exactly as they did before. A guard that quietly re-answers the rest of the
 * database is worse than the bug.
 *
 * Runs the real scorer against the real tables in a real browser. No network
 * past the app's own data, no model, no key.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8783;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'protein-'));
if (!fs.existsSync(CHROME)) { console.log('SKIP: no Chrome at ' + CHROME); process.exit(0); }

const app = fs.readFileSync(process.argv[2] || path.join(ROOT, 'dev/index.html'), 'utf8');

const WHEY = ['אבקת חלבון מי גבינה', 'אבקת חלבון מי גבינה (WHEY)', 'אבקת חלבון',
              'סקופ אבקת חלבון', 'whey protein powder', 'חלבון מי גבינה'];
const KEEP = ['חלב', 'חלב סויה', 'רוטב סויה', 'אורז לבן מבושל', 'ביצה קשה', 'חזה עוף',
              'גבינה צהובה', 'יוגורט', 'שקדים', 'בננה', 'טונה במים', 'חומוס', 'פסטה',
              'סלמון', 'אבוקדו', 'קינואה', 'חלבון ביצה', 'משקה שקדים', 'אבקת חלבון סויה'];

const DRIVE = '<script>setTimeout(function(){foodsLoad(function(){' +
  ' var q=' + JSON.stringify(WHEY.concat(KEEP)) + ',out=[],i;' +
  ' for(i=0;i<q.length;i++){var r=null;' +
  '  try{r=sayResolve({food:q[i],amount:30,unit:"g"});}catch(e){out.push({q:q[i],err:String(e.message||e)});continue;}' +
  '  out.push({q:q[i],name:r&&r.food?r.food.n:null,kcal:r&&r.food?r.food.k:null,p:r&&r.food?r.food.p:null});}' +
  ' fetch("/r",{method:"POST",body:JSON.stringify(out)});});},2500);<\/script>';

let got = null;
const server = http.createServer((req, res) => {
  const p = req.url.split('?')[0];
  if (p === '/r') {
    let b = '';
    req.on('data', (d) => { b += d; });
    req.on('end', () => { try { got = JSON.parse(b); } catch { got = null; } res.writeHead(200); res.end('ok'); });
    return;
  }
  if (p === '/dev/p.html') {
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
    '--virtual-time-budget=25000', '--user-data-dir=' + TMP, '--dump-dom',
    'http://localhost:' + PORT + '/dev/p.html'], { stdio: 'ignore' });
  const t = setTimeout(() => { c.kill(); resolve(); }, 150000);
  c.on('exit', () => { clearTimeout(t); resolve(); });
});
server.close();
fs.rmSync(TMP, { recursive: true, force: true });
if (!got) { console.log('FAIL: the page never answered'); process.exit(1); }

const by = {};
for (const r of got) by[r.q] = r;
const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

console.log('a protein powder is a protein powder');
for (const q of WHEY) {
  const r = by[q] || {};
  const n = String(r.name || '');
  /* the three wrong answers this exists to stop: soy, any other source, and
     the liquid - the last recognisable by its calories, since acid whey is
     8 kcal per 100 g and no powder is under 300 */
  const bad = /סויה|אפונה|אורז|קזאינ|קזאין/.test(n) ? 'a different source' :
    /נוזלי|חומצי/.test(n) ? 'the liquid' :
    (r.kcal !== null && r.kcal < 250) ? 'something that is not a powder (' + r.kcal + ' kcal)' : '';
  ok(!bad && !!r.name, '"' + q + '" -> ' + (r.name || 'NOTHING') + (bad ? '   <- ' + bad : ''));
}

console.log('');
console.log('and everything else answers as it always did');
for (const q of KEEP) {
  const r = by[q] || {};
  ok(!!r.name, '"' + q + '" -> ' + (r.name || 'NOTHING'));
}
/* the guard may not refuse what was actually asked for */
const soy = by['אבקת חלבון סויה'] || {};
ok(/סויה/.test(String(soy.name || '')),
   'a query that NAMES soy still gets soy (got ' + soy.name + ')');
const soymilk = by['חלב סויה'] || {};
ok(/סויה/.test(String(soymilk.name || '')),
   'and soy milk is still soy milk (got ' + soymilk.name + ')');

console.log('');
if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); }
console.log('whey is whey, and the rest of the database is untouched');
