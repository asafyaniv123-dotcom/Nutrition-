/* Beem becomes the moon when the day is closed, walked.
 *
 *   node tools/test-beem-moon.mjs [--lang he|en|ar] [--hour 22]
 *
 * Closes the day through the summary's own writer and its own last page,
 * then reads where the moon is. The morning is walked by test-beem-morning.
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
const OUT = path.resolve(arg('--out', '.impeccable/mocks/beem-moon-' + LANG + '-' + H));
const PORT = 8799, DBG = 9339;
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
  try{if(!sessionStorage.getItem('__s')){sessionStorage.setItem('__s','1');localStorage.clear();localStorage.setItem('app_lang',${JSON.stringify(LANG)});localStorage.setItem('app_onboarded','1');localStorage.setItem('app_gender','f');localStorage.setItem('greet_name','נועה');}}catch(e){}
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
  ok(await waitFor(`!!document.querySelector('#bhelp canvas')`, 15000), 'Beem is in the corner');
  ok(await ev(`_bhelp.sky`) === 'sun', 'with the day still open, he is the sun');

  /* 1 - closing the day: the summary's own writer and its own last page */
  await ev(`(enterModule('endofday'),_rfDate=todayStr(),rfSave({moment:'x'}),rfFinish(),1)`);
  await sleep(1500); await shot('closed-celebrating');
  ok(!(await ev(`document.body.classList.contains('rf-night')`)), 'first he celebrates - the page is not night yet');
  ok(await waitFor(`document.body.classList.contains('rf-night')`, 9000), 'then the page goes to night');
  await sleep(3600); await shot('closed-moon');
  const sub = await ev(`document.querySelector('.rf-body .rf-sub').textContent`);
  ok(/לילה טוב|Good night|تصبح/.test(sub), 'and says good night (' + sub + ')');
  ok(await ev(`(function(){var c=document.querySelector('#rf-beem canvas');return !!c;})()`), 'the moon is drawn by the kit on that page');

  /* 2 - all night: the corner holds the moon on every screen */
  await ev(`goHome()`); await sleep(1500);
  ok(await ev(`_bhelp.sky`) === 'moon', 'back home, the corner is the moon');
  ok(!(await ev(`document.body.classList.contains('rf-night')`)), 'and the night belongs to the summary only - home keeps its own look');
  await shot('home-moon');
  await ev(`enterModule('nutrition')`); await sleep(1200);
  ok(await ev(`_bhelp.sky`) === 'moon', 'in Nutrition too');
  await shot('nutrition-moon');
} catch (e) { ok(false, 'walk: ' + e.message); }
ok(threw.length === 0, 'the page threw nothing' + (threw.length ? ': ' + threw.join(' | ') : ''));
ws.close(); chrome.kill(); server.close();
console.log(fails.length ? fails.length + ' FAILED' : 'all passed', '- photos in', OUT);
process.exit(fails.length ? 1 : 0);
