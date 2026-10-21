/* Beem the helper, walked with real touches.
 *
 *   node tools/test-beem-helper.mjs [--lang he|en|ar] [--h 844]
 *
 * An existing user (the door already passed). Beem must sit in the corner,
 * open the chat on a press, offer the screen's own questions, and run the
 * whole /beem tool loop - answered in the page by a stand-in, so the test
 * needs no server and records exactly what the app sent.
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
const OUT = path.resolve(arg('--out', '.impeccable/mocks/beem-helper-' + LANG + '-' + H));
const PORT = 8798, DBG = 9338;
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

/* /beem is answered here, in the page, until the server carries it: the first
   turn asks for today with get_day the way the model does, the second answers
   from what came back. That walks the WHOLE loop - the phone reading its own
   log and sending it back - and records what the app sent. */
await send('Page.addScriptToEvaluateOnNewDocument', { source: `(function(){
  var real=window.fetch;window.__beemSent=[];
  window.fetch=function(u,o){
    if(String(u).indexOf('/beem')<0)return real.apply(this,arguments);
    var b=JSON.parse(o.body);window.__beemSent.push(b);
    var last=b.messages[b.messages.length-1],c;
    if(typeof last.content==='string')c=[{type:'tool_use',id:'t1',name:'get_day',input:{date:'today'}}];
    else c=[{type:'text',text:'FAKE-ANSWER protein '+(Array.isArray(JSON.parse(last.content[0].content).meals)?'from-log':'no-log')}];
    return new Promise(function(r){setTimeout(function(){r(new Response(JSON.stringify({ok:true,content:c}),{headers:{'content-type':'application/json'}}));},500);});
  };
})();` });

try {
  await send('Page.navigate', { url: `http://localhost:${PORT}/dev/` });
  ok(await waitFor(`!!document.getElementById('bhelp')&&!!document.querySelector('#bhelp canvas')`, 15000), 'Beem sits in the corner, drawn by the kit');
  await sleep(1200); await shot('home');
  const at = await ev(`(function(){var r=document.getElementById('bhelp').getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,dir:document.documentElement.dir||getComputedStyle(document.body).direction};})()`);
  ok(at.w === 60 && (LANG === 'en' ? at.x > 300 : at.x < 30), 'he sits at the inline end - the left in Hebrew and Arabic, the right in English (x=' + Math.round(at.x) + ')');
  await tap('#bhelp'); await sleep(900); await shot('open-home');
  ok(await ev(`document.getElementById('bhs').classList.contains('on')`), 'a press opens the chat');
  ok(await ev(`document.querySelectorAll('#bhs-sug button').length===3`), 'three questions for this screen');
  const greet = await ev(`document.querySelector('#bhs-log .bhs-m').textContent`);
  ok(LANG !== 'he' || /נועה/.test(greet) && /תרצי/.test(greet), 'he greets her by name, in her form (' + greet + ')');
  await tap('.bhs-x'); await sleep(700);
  ok(await ev(`!document.getElementById('bhs').classList.contains('on')&&!document.getElementById('bhelp').classList.contains('away')`), '× closes it and he is back in his corner');
  /* from Nutrition the questions are Nutrition's */
  await tap('#bhelp'); await sleep(700); await tap('.bhs-x'); await sleep(600);
  await ev(`enterModule('nutrition')`); await sleep(1400);
  await tap('#bhelp'); await sleep(900);
  const sug = await ev(`[].map.call(document.querySelectorAll('#bhs-sug button'),function(b){return b.textContent;}).join(' | ')`);
  ok(sug === await ev(`beemHelpSug('nutrition').join(' | ')`), 'from Nutrition, Nutrition\'s questions (' + sug + ')');
  await tap('#bhs-sug button', 1); await sleep(250); await shot('thinking');
  ok(await ev(`!!document.querySelector('#bhs-log .bhs-m.wait')`), 'Beem says he is thinking while it runs');
  ok(await waitFor(`/FAKE-ANSWER/.test(document.getElementById('bhs-log').textContent)`, 6000), 'the answer arrives');
  await sleep(500); await shot('answered');
  const sent = await ev(`JSON.stringify(window.__beemSent.map(function(b){return {s:b.screen,n:b.messages.length,lang:b.lang,form:b.form,name:b.name,today:b.today,res:typeof b.messages[b.messages.length-1].content==='string'?'q':b.messages[b.messages.length-1].content[0].type};}))`);
  const S = JSON.parse(sent);
  ok(S.length === 2 && S[0].s === 'nutrition' && S[1].res === 'tool_result', 'the loop ran: question, then her own log sent back (' + sent + ')');
  ok(S[0].today === (await ev('todayStr()')) && S[0].lang === LANG, 'it sends the app\'s day and language');
  ok(/from-log/.test(await ev(`document.getElementById('bhs-log').textContent`)), 'what went back was read from the log');
  /* typed, with Enter, the way a person sends it */
  await tap('#bhs-q'); await type('?'); await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  ok(await waitFor(`window.__beemSent.length>=3`, 3000), 'typing and Enter sends a question');
  await sleep(1600);
  /* where Beem already lives, the corner is empty */
  await tap('.bhs-x'); await sleep(500);
  await ev(`enterModule('endofday')`); await sleep(1200);
  ok(await ev(`getComputedStyle(document.getElementById('bhelp')).opacity==='0'`), 'in סיום יום, where Beem already is, the corner is empty');
} catch (e) { ok(false, 'walk: ' + e.message); }
ok(threw.length === 0, 'the page threw nothing' + (threw.length ? ': ' + threw.join(' | ') : ''));
ws.close(); chrome.kill(); server.close();
console.log(fails.length ? fails.length + ' FAILED' : 'all passed', '- photos in', OUT);
process.exit(fails.length ? 1 : 0);
