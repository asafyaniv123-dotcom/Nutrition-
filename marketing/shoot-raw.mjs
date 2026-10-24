/* Raw screens of the app for the store listing - a first look, to choose
 * which screens tell the story. Drives headless Chrome over CDP, like
 * tools/shoot-home.mjs, at 390x844 DPR 3, at 21:10 (the evening).
 *
 *   node marketing/shoot-raw.mjs [lang]       -> marketing/shots/raw-<lang>/
 *
 * Shoots /dev/, because the demo week (__devDemoWeek) lives only behind the
 * dev guard; the store shots are re-taken once dev and stable are level.
 * Nothing in dev/ is written.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const LANG = process.argv[2] || 'en';
const OUT = path.resolve('marketing/shots/raw-' + LANG);
const PORT = 8797, DBG = 9337;
fs.mkdirSync(OUT, { recursive: true });
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.gif': 'image/gif', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const file = path.resolve(ROOT, '.' + (p.endsWith('/') ? p + 'index.html' : p));
  if (!file.startsWith(path.resolve(ROOT))) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});
await new Promise((r) => server.listen(PORT, r));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'shoot-raw-'));
const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=' + DBG, '--user-data-dir=' + TMP, '--hide-scrollbars',
  '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) { await sleep(200);
  try { target = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
if (!target) { console.log('FAIL: no Chrome'); process.exit(1); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') console.log('PAGE THREW: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]); });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const evalJS = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) return 'THREW ' + JSON.stringify(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text).slice(0, 300);
  return r.result?.result?.value;
};
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true });
const d = new Date(); d.setHours(21, 10, 0, 0);
const SHIFT = d.getTime() - Date.now();
await send('Page.addScriptToEvaluateOnNewDocument', { source: `(function(){
  var S=${SHIFT},R=Date,now=R.now;
  function D(){var a=[].slice.call(arguments);
    if(!(this instanceof D))return new R(now()+S).toString();
    return a.length?new (Function.prototype.bind.apply(R,[null].concat(a)))():new R(now()+S);}
  D.prototype=R.prototype;D.now=function(){return now()+S;};D.UTC=R.UTC;D.parse=R.parse;
  window.Date=D;})();` });
await send('Page.addScriptToEvaluateOnNewDocument', { source: `(function(){try{
  if(sessionStorage.getItem('__seeded'))return;sessionStorage.setItem('__seeded','1');
  localStorage.clear();
  localStorage.setItem('app_onboarded','1');
  localStorage.setItem('greet_name',${JSON.stringify(process.env.NAME || 'Maya')});
  localStorage.setItem('app_lang',${JSON.stringify(LANG)});
}catch(e){}})();` });

async function load() {
  await send('Page.navigate', { url: `http://localhost:${PORT}/dev/` });
  for (let i = 0; i < 80; i++) { await sleep(250);
    try { if (await evalJS(`!!document.getElementById('home-grid')&&document.readyState==='complete'`)) break; } catch {} }
  await sleep(2500);
}
async function shot(name) {
  await sleep(1500);
  const r = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.result.data, 'base64'));
  console.log('shot', name);
}

await load();
console.log('demo week:', await evalJS(`typeof __devDemoWeek==='function'?(Promise.resolve(__devDemoWeek()).then(()=>'ok')):'missing'`));
await load();
await shot('01-home');
for (const m of (process.env.MODS || 'endofday,nutrition,fitness,closet,people,planning,journal,insights').split(',')) {
  console.log(m, await evalJS(`(function(){try{enterModule(${JSON.stringify(m)});return 'ok'}catch(e){return 'ERR '+e.message}})()`));
  await shot('m-' + m);
  await evalJS(`scrollTo(0,0)`);
}
console.log('deck', await evalJS(`(function(){try{var s=weekStartOf(dayShift(-7));wkDeckOpen(s);return s}catch(e){return 'ERR '+e.message}})()`));
await shot('w-deck-0');
for (let i = 1; i < 7; i++) { await evalJS(`try{wkDeckGo(1)}catch(e){}`); await shot('w-deck-' + i); }
chrome.kill(); server.close(); process.exit(0);
