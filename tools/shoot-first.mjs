/* Photograph every FIRST screen a new person meets, at phone size.
 *
 *   node tools/shoot-first.mjs [out-dir] [--lang he|en] [--gender f|m]
 *
 * A fresh device: storage empty, so the door opens. Each card of the door is
 * photographed and answered the way a person would, and then every area is
 * entered for the first time with nothing in it. 390x844 at DPR 3.
 * Nothing in dev/ is written.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const args = process.argv.slice(2);
const OUT = path.resolve(args.find((a) => !a.startsWith('--') && !/^(he|en|f|m)$/.test(a)) || '.impeccable/mocks/first');
const LANG = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'he';
const GENDER = args.includes('--gender') ? args[args.indexOf('--gender') + 1] : 'f';
const PORT = 8795, DBG = 9335;
fs.mkdirSync(OUT, { recursive: true });

const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.gif': 'image/gif' };
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
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'shoot-first-'));
const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=' + DBG, '--user-data-dir=' + TMP, '--hide-scrollbars',
  '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try { target = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((t) => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') console.log('PAGE THREW: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
});
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const evalJS = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300));
  return r.result?.result?.value;
};
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true });
/* evening, the situation the product is for */
const d = new Date(); d.setHours(20, 10, 0, 0);
const SHIFT = d.getTime() - Date.now();
await send('Page.addScriptToEvaluateOnNewDocument', { source: `(function(){
  var S=${SHIFT},R=Date,now=R.now;
  function D(){var a=[].slice.call(arguments);
    if(!(this instanceof D))return new R(now()+S).toString();
    return a.length?new (Function.prototype.bind.apply(R,[null].concat(a)))():new R(now()+S);}
  D.prototype=R.prototype;D.now=function(){return now()+S;};D.UTC=R.UTC;D.parse=R.parse;window.Date=D;
  try{if(!sessionStorage.getItem('__s')){sessionStorage.setItem('__s','1');localStorage.clear();
    localStorage.setItem('app_lang',${JSON.stringify(LANG)});}}catch(e){}
})();` });

const list = [];
async function shot(name, note) {
  await sleep(700);
  const a = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(a.result.data, 'base64'));
  const words = await evalJS(`(document.body.innerText||'').replace(/\\s+/g,' ').length`);
  list.push({ name, note, words });
  console.log(name.padEnd(22) + String(words).padStart(5) + ' chars  ' + (note || ''));
}

try {
  await send('Page.navigate', { url: `http://localhost:${PORT}/dev/` });
  for (let i = 0; i < 60; i++) { await sleep(250); try { if (await evalJS(`document.readyState==='complete'`)) break; } catch {} }
  await sleep(3500);
  await shot('00-open', 'what opens on a fresh device');
  /* the door, card by card, answered as a person would */
  const steps = await evalJS(`typeof _doorSteps!=='undefined'?_doorSteps.slice():[]`);
  console.log('door cards: ' + steps.join(' → '));
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    await shot(`0${i + 1}-door-${s}`, 'door card ' + (i + 1) + ' of ' + steps.length);
    if (process.env.DOOR_DEBUG) console.log('   ', await evalJS(`(function(){var r=document.querySelector('#door .dr-row')||document.querySelector('#door .dr-go'),d=document.getElementById('door');
      if(!r)return 'none';var c=getComputedStyle(r),dc=getComputedStyle(d);
      return document.body.className+' | door --nu-ground='+dc.getPropertyValue('--nu-ground')+' | row bg='+c.backgroundColor+' color='+c.color+' | in door? '+d.contains(r);})()`));
    if (s === 'hi') await evalJS('doorNext()');
    else if (s === 'gender') await evalJS(`doorGender(${JSON.stringify(GENDER)})`);
    else if (s === 'name') await evalJS(`(function(){var e=document.getElementById('door-name');if(e)e.value='נועה';doorName();})()`);
    else if (s === 'came') await evalJS(`doorCame('nutrition')`);
    else if (s === 'focus') await evalJS(`(function(){['fitness','planning','people'].forEach(function(x){if(_doorPick.indexOf(x)<0)doorToggle(x);});doorAreas();})()`);
    else if (s === 'remind') await evalJS(`doorRemind('21:30')`);
    await sleep(500);
  }
  await shot('10-home-after-door', 'the first home screen');
  /* every area, entered for the first time, nothing in it */
  const areas = await evalJS(`HOME_AREAS.map(function(a){return a.id;})`);
  let k = 11;
  for (const a of areas) {
    await evalJS(`goHome&&goHome()`); await sleep(400);
    await evalJS(`enterModule(${JSON.stringify(a)})`);
    await shot(`${k++}-area-${a}`, 'first visit, empty');
  }
  await evalJS(`goHome&&goHome()`); await sleep(400);
  await evalJS(`openJournalTab()`); await shot(`${k++}-journal`, 'first visit, empty');
  await evalJS(`goHome&&goHome()`); await sleep(400);
  await evalJS(`showMain('me')`); await shot(`${k++}-me`, 'first visit, empty');
  fs.writeFileSync(path.join(OUT, 'list.json'), JSON.stringify(list, null, 1));
} catch (e) {
  console.log('FAIL: ' + e.message);
} finally {
  ws.close(); chrome.kill(); server.close();
}
