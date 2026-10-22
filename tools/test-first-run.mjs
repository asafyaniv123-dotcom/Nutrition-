/* The first run, walked the way a new person walks it.
 *
 *   node tools/test-first-run.mjs [--lang he|en|ar] [--hour 17] [--h 844] [--out dir]
 *
 * A fresh device: storage empty, so the door opens. Every step is answered with
 * a real touch at the centre of the real button and real typing into the real
 * field (Input.insertText), never by calling the step's function - calling it
 * from the console has produced false passes here more than once. Each step is
 * photographed. At the end the page is asked what it SAVED: the name, the form
 * of address, the areas, the reminder hour (kept but not switched on - she
 * answered "not now"), the first summary's mood and moment, and that the tour
 * and the area card each showed once.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const A = process.argv.slice(2), arg = (k, d) => (A.includes(k) ? A[A.indexOf(k) + 1] : d);
const LANG = arg('--lang', 'he'), HOUR = +arg('--hour', 17), H = +arg('--h', 844);
const OUT = path.resolve(arg('--out', '.impeccable/mocks/first-run-' + LANG + '-' + H));
const PORT = 8797, DBG = 9337;
fs.mkdirSync(OUT, { recursive: true });
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const file = path.resolve(ROOT, '.' + (p.endsWith('/') ? p + 'index.html' : p));
  if (!file.startsWith(path.resolve(ROOT))) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }); res.end(data); });
});
await new Promise((r) => server.listen(PORT, r));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'first-run-'));
const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', '--remote-debugging-port=' + DBG, '--user-data-dir=' + TMP,
  '--hide-scrollbars', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) { await sleep(200);
  try { target = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pending = new Map(); const threw = [];
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') threw.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]); });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (x) => { const r = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300)); return r.result?.result?.value; };
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: H, deviceScaleFactor: 3, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true });
const d0 = new Date(); d0.setHours(HOUR, 10, 0, 0);
await send('Page.addScriptToEvaluateOnNewDocument', { source: `(function(){
  var S=${d0.getTime() - Date.now()},R=Date,now=R.now;
  function D(){var a=[].slice.call(arguments);if(!(this instanceof D))return new R(now()+S).toString();
    return a.length?new (Function.prototype.bind.apply(R,[null].concat(a)))():new R(now()+S);}
  D.prototype=R.prototype;D.now=function(){return now()+S;};D.UTC=R.UTC;D.parse=R.parse;window.Date=D;
  try{if(!sessionStorage.getItem('__s')){sessionStorage.setItem('__s','1');localStorage.clear();localStorage.setItem('app_lang',${JSON.stringify(LANG)});}}catch(e){}
})();` });

const fails = []; let n = 0;
const ok = (c, what) => { console.log((c ? '  ok   ' : '  FAIL ') + what); if (!c) fails.push(what); };
async function shot(name) { await sleep(250); const a = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUT, String(++n).padStart(2, '0') + '-' + name + '.png'), Buffer.from(a.result.data, 'base64')); }
/* a real touch at the centre of what is really under the finger */
async function tap(sel, i = 0) {
  const r = await ev(`(function(){var e=document.querySelectorAll(${JSON.stringify(sel)})[${i}];if(!e)return null;
    var b=e.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,t=document.elementFromPoint(x,y);
    return {x:x,y:y,hit:!!t&&(t===e||e.contains(t)),under:t&&(t.id||t.className||t.tagName)};})()`);
  if (!r) { ok(false, 'there is a ' + sel); return false; }
  if (!r.hit) { ok(false, sel + ' is under the finger (found ' + r.under + ')'); return false; }
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  return true;
}
async function type(text) { await send('Input.insertText', { text }); }
async function waitFor(x, ms = 6000) { for (let t = 0; t < ms; t += 150) { if (await ev(x)) return true; await sleep(150); } return false; }

try {
  await send('Page.navigate', { url: `http://localhost:${PORT}/dev/` });
  ok(await waitFor(`!!document.querySelector('#door .dr-btn')`, 12000), 'the door opens on a fresh device');
  await sleep(2600); await shot('welcome');
  ok(await ev(`!!document.querySelector('#dr-beem canvas')`), 'Beem is there from the first frame');
  await tap('#door .dr-btn'); await sleep(1300); await shot('name');
  await tap('#dr-nm'); await type(LANG === 'he' || LANG === 'ar' ? 'נועה' : 'Noa'); await sleep(500); await shot('name-typed');
  await tap('#dr-g2'); await sleep(2000);
  if (LANG === 'he') { await shot('gender'); await tap('.dr-r2', 0); await waitFor(`/at-areas/.test(document.getElementById('dr2').className)`, 6000); }
  await sleep(1600); await shot('areas');
  ok(/בחרי|Pick|اختر/.test(await ev(`document.querySelector('.dr-w2').textContent`)), 'the areas line speaks in her form');
  await tap('.dr-chip', 0); await sleep(300); await tap('.dr-chip', 4); await sleep(600); await shot('areas-picked');
  await tap('#dr-g4'); await sleep(1500); await shot('why');
  await tap('#door .dr-btn'); await sleep(1700); await shot('time');
  await tap('.dr-qk', 0); await sleep(900); await tap('#door .dr-btn'); await sleep(1500); await shot('timeok');
  await tap('#door .dr-btn'); await sleep(1500); await shot('mood');
  await tap('.dr-face', 3); await sleep(1700); await shot('moment');
  await tap('#dr-mo'); await type(LANG === 'he' ? 'ארוחת ערב עם נועם' : 'Dinner with Noam'); await sleep(300);
  await tap('#door .dr-btn'); await sleep(1200);
  const f1 = await ev(`+getComputedStyle(document.querySelector('.dr-well')).getPropertyValue('--drf')`);
  await shot('day1-rising'); await sleep(2000);
  const f2 = await ev(`+getComputedStyle(document.querySelector('.dr-well')).getPropertyValue('--drf')`);
  ok(f1 > 0.2 && f1 < 0.95 && f2 > f1 + 0.1, 'the light rises instead of jumping (' + f1.toFixed(2) + ' then ' + f2.toFixed(2) + ')');
  ok(await waitFor(`document.querySelectorAll('.dr-bloom .dr-bloom-ring.go').length===2`, 1500), 'the light opens from the well when day one is saved');
  ok(await waitFor(`/surprised|happy/.test(_dr.beem&&_dr.beem.faceName)`, 800), 'and Beem is glad of it');
  await sleep(900); await shot('day1-bloom');
  await shot('day1-beads'); await sleep(1800); await shot('day1');
  await tap('#door .dr-btn');
  ok(await ev(`!!document.querySelector('#door .dr-btn[disabled]')&&!!document.querySelector('.at-day1')`), 'day one stays a moment for Beem to smile');
  await sleep(1900); await shot('remind');
  await tap('.dr-later'); await sleep(1500);
  ok(await ev(`!document.getElementById('door')`), 'the door closes');
  ok(await waitFor(`!!document.getElementById('tour')`, 4000), 'Beem\'s tour of home starts');
  await sleep(1200); await shot('tour-1');
  /* a real thumb on the dial's ring, an arc across its top */
  const g = await ev(`(function(){var b=document.querySelector('.hdial').getBoundingClientRect();return {cx:b.left+b.width/2,cy:b.top+b.height/2,r:b.width/2-30,rot:_dialRot,y:scrollY};})()`);
  const pts = [-60, -40, -20, 0, 20].map((a) => ({ x: g.cx + g.r * Math.sin(a * Math.PI / 180), y: g.cy - g.r * Math.cos(a * Math.PI / 180) }));
  /* the most the dial turned while the thumb was on it - with two areas an
     80-degree turn rightly snaps back to the first, so the end state is not
     the evidence */
  await ev(`(window.__turn=0,document.addEventListener('pointermove',function(){__turn=Math.max(__turn,Math.abs(_dialRot));},true),1)`);
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pts[0]] });
  for (const p of pts.slice(1)) { await sleep(40); await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [p] }); }
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(700);
  const g2 = await ev(`({turn:__turn,y:scrollY,tour:!!document.getElementById('tour'),mod:document.body.className})`);
  ok(g2.turn > 30 && g2.y === g.y && g2.tour && /mod-home/.test(g2.mod), 'during the tour a thumb turns the dial, the page stays put (turned ' + Math.round(g2.turn) + ' deg, scroll ' + g.y + ' -> ' + g2.y + ')');
  await shot('tour-1-turned');
  for (let i = 2; i <= 4; i++) { await tap('#tour-n'); await sleep(900); await shot('tour-' + i); }
  await tap('#tour-n'); await sleep(600);
  ok(await ev(`!document.getElementById('tour')`), 'the tour ends');
  await sleep(4200); await shot('home');
  ok(await ev(`document.body.classList.contains('tod-'+homeTod(new Date().getHours()))`), 'after the sand landing, home takes the colour of the hour');
  /* the first time in an area: from the dial itself */
  await tap('.hdisc[data-area="nutrition"] .hdisc-ic'); await sleep(1800);
  ok(await ev(`!!document.querySelector('.aint.on')`), 'the area card rises the first time in nutrition');
  await shot('area-nutrition');
  await tap('.aint-go'); await sleep(700);
  /* what was SAVED */
  const S = await ev(`(function(){var g=function(k){try{return localStorage.getItem(k);}catch(e){return null;}};
    var sum=null;try{sum=JSON.parse(g('sum_'+todayStr())||'null');}catch(e){}
    return {name:g('greet_name'),gender:g('app_gender'),areas:g('home_areas'),rem:g('sum_reminder'),door:g('app_onboarded'),
      v2:g('first_run_v2'),tour:g('home_tour_done'),intro:g('area_intro_seen'),mood:sum&&sum.mood,moment:sum&&sum.moment};})()`);
  ok(S.name === (LANG === 'he' || LANG === 'ar' ? 'נועה' : 'Noa'), 'her name is saved (' + S.name + ')');
  if (LANG === 'he') ok(S.gender === 'f', 'she is addressed in the feminine');
  ok(/nutrition/.test(S.areas || '') && /people/.test(S.areas || '') && /endofday/.test(S.areas || ''), 'her areas are saved, with סיום יום');
  const rem = JSON.parse(S.rem || '{}');
  ok(rem.time === '21:30' && rem.on === false, 'the hour is kept (21:30) and not switched on - she said not now');
  ok(S.mood === 4, 'the first summary has her mood');
  ok(/נועם|Noam/.test(S.moment || ''), 'and her best moment');
  ok(S.door === '1' && S.v2 === '1' && S.tour === '1' && /nutrition/.test(S.intro || ''), 'the door, the tour and the card are each marked done');
  /* a second visit to the same area is quiet */
  await ev(`goHome()`); await sleep(600); await ev(`enterModule('nutrition')`); await sleep(1200);
  ok(!(await ev(`!!document.querySelector('.aint')`)), 'the card does not come back');
} catch (e) { ok(false, 'walk: ' + e.message); }
ok(threw.length === 0, 'the page threw nothing' + (threw.length ? ': ' + threw.join(' | ') : ''));
ws.close(); chrome.kill(); server.close();
console.log(fails.length ? fails.length + ' FAILED' : 'all passed', '- photos in', OUT);
process.exit(fails.length ? 1 : 0);
