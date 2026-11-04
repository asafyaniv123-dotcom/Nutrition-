// Drive stage.html in headless Chrome (GPU off is fine; WebGL via SwiftShader).
// node drive.mjs <exercise.js> <out-prefix> [frames=1] [t0=0]
//   frames=1 -> one still at t0 to <out-prefix>.png
//   frames=N -> N frames t=i/N to <out-prefix>-0000.png ... (a seamless loop: t=1 is never drawn)
// The exercise script defines window.setup() (async) and window.pose(t).
import fs from 'fs'; import http from 'http'; import path from 'path'; import os from 'os';
import { spawn } from 'child_process';
const [SCRIPT, OUT, FR = '1', T0 = '0'] = process.argv.slice(2);
const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const PORT = 8831 + Math.floor(Math.random() * 60), DBG = 9371 + Math.floor(Math.random() * 60);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const f = p === '/exercise.js' ? path.resolve(SCRIPT) : path.join(ROOT, p);
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
});
await new Promise((r) => server.listen(PORT, r));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'r3d-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--remote-debugging-port=' + DBG, '--user-data-dir=' + TMP, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target; for (let i = 0; i < 50 && !target; i++) { await sleep(200); try { target = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') console.log('PAGE THREW: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n').slice(0, 3).join(' | '));
  if (m.method === 'Runtime.consoleAPICalled') console.log('page:', m.params.args.map((a) => a.value ?? a.description).join(' ')); });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 500)); return r.result?.result?.value; };
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/stage.html` });
for (let i = 0; i < 60; i++) { await sleep(250); try { if (await ev('window.ready===true')) break; } catch {} }
await ev(`new Promise(function(res,rej){var s=document.createElement('script');s.type='module';s.src='/exercise.js?'+Date.now();s.onload=res;s.onerror=rej;document.head.appendChild(s);})`);
for (let i = 0; i < 40; i++) { await sleep(100); if (await ev('typeof window.setup==="function"')) break; }
const info = await ev('window.setup()');
if (info) console.log('setup:', typeof info === 'string' ? info : JSON.stringify(info));
const n = +FR;
for (let i = 0; i < n; i++) {
  const t = n === 1 ? +T0 : i / n;
  const url = await ev(`(function(){window.pose(${t});return window.render();})()`);
  const file = n === 1 ? OUT + '.png' : OUT + '-' + String(i).padStart(4, '0') + '.png';
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
}
console.log('frames', n);
ws.close(); chrome.kill(); server.close(); process.exit(0);
