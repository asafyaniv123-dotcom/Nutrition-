/* The morning after a closed night, walked: the moon leaves the corner to
 * the left and is gone before the sun comes in from the right, one sweep of
 * light, and only once a morning.
 *
 *   node tools/test-beem-morning.mjs [--lang he] [--hour 8]
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
const OUT = path.resolve(arg('--out', '.impeccable/mocks/beem-morning-' + LANG + '-' + H));
const PORT = 8800, DBG = 9340;
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
  /* last night was closed - by the summary's own writer, on yesterday's date */
  await ev(`(_rfDate=dayShift(-1),rfSave({moment:'x',done:true}),1)`);
  /* the first open of the morning */
  await send('Page.reload', {});
  ok(await waitFor(`!!document.querySelector('#bhelp canvas')`, 15000), 'the app opens again in the morning');
  /* frame by frame, from inside the page: the outside sampling cannot tell a
     stalled page from a slow question */
  await ev(`(window.__tr=[],(function f(){var e=document.getElementById('bhelp-b');if(e){var m=getComputedStyle(e).transform;__tr.push([Math.round(performance.now()),m==='none'?0:Math.round(+m.split(',')[4])]);}if(__tr.length<900)requestAnimationFrame(f);})(),1)`);
  const seen = [];
  for (let t = 0; t < 46; t++) {
    seen.push(await ev(`(function(){var e=document.getElementById('bhelp-b');if(!e)return '';
      var m=getComputedStyle(e).transform,x=m==='none'?0:+m.split(',')[4];
      return (e.className.indexOf('go')>=0?'go':e.className.indexOf('come')>=0?'come':'-')+':'+Math.round(x)+':'+(document.querySelector('.bhelp-flash')?'F':'');})()`));
    await sleep(100);
    if (t === 16) await shot('moon-leaving');
    if (t === 34) await shot('sun-coming');
  }
  ok(seen.some((s) => s.endsWith('F')), 'one sweep of light crosses the screen');
  const tr = await ev('JSON.stringify(__tr)'); const T = JSON.parse(tr); let gap = 0, gi = 0; for (let i = 1; i < T.length; i++) if (T[i][0] - T[i-1][0] > gap) { gap = T[i][0] - T[i-1][0]; gi = i; }
  const ins = T.filter((p) => p[1] > 5 && p[1] < 60).length;
  console.log('  frames', T.length, 'longest gap', gap + 'ms at x', T[gi - 1] && T[gi - 1][1], '->', T[gi] && T[gi][1], '; frames with the sun on its way in:', ins);
  const out = T.findIndex((p) => p[1] <= -60), back = T.findIndex((p) => p[1] > 5);
  ok(out >= 0 && back > out, 'the moon is all the way out to the left before the sun shows on the right');
  ok(ins >= 8, 'the sun is SEEN sliding in - ' + ins + ' frames between the right edge and its place');
  ok(Math.abs(T[T.length - 1][1]) < 2, 'and it ends in its place');
  await sleep(1500); await shot('morning-done');
  ok(await ev(`_bhelp.sky`) === 'sun' && await ev(`localStorage.getItem('beem_morning')===todayStr()`), 'he is the sun, and the morning is marked done');
  /* opened again the same morning: no second sunrise */
  await send('Page.reload', {}); await waitFor(`!!document.querySelector('#bhelp canvas')`, 15000); await sleep(2000);
  ok(!(await ev(`/go|come/.test(document.getElementById('bhelp-b').className)`)), 'a second open the same morning is quiet');
} catch (e) { ok(false, 'walk: ' + e.message); }
ok(threw.length === 0, 'the page threw nothing' + (threw.length ? ': ' + threw.join(' | ') : ''));
ws.close(); chrome.kill(); server.close();
console.log(fails.length ? fails.length + ' FAILED' : 'all passed', '- photos in', OUT);
process.exit(fails.length ? 1 : 0);
