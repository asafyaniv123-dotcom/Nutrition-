// Render pose-guide stills from pose.html in headless Chrome: one PNG per keyframe.
// node tools/r3d/pose/shoot.mjs <exercise> <outdir>     (e.g. bench, hipthrust)
import fs from 'fs'; import http from 'http'; import path from 'path'; import os from 'os';
import { spawn } from 'child_process';
const [EX, OUT] = process.argv.slice(2);
const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
fs.mkdirSync(OUT, { recursive: true });
const server = http.createServer((req, res) => {
  const f = path.join(DIR, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' }); res.end(d); });
});
await new Promise((r) => server.listen(8995, r));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'pose-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--remote-debugging-port=9495', '--user-data-dir=' + TMP, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target; for (let i = 0; i < 50 && !target; i++) { await sleep(200); try { target = (await (await fetch('http://127.0.0.1:9495/json')).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') console.log('PAGE THREW: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text)); });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 900, height: 900, deviceScaleFactor: 1, mobile: false });
for (const kf of [0, 1]) {
  await send('Page.navigate', { url: `http://127.0.0.1:8995/pose.html?ex=${EX}&kf=${kf}` });
  for (let i = 0; i < 40; i++) { await sleep(250); const r = await send('Runtime.evaluate', { expression: '!!window.__done', returnByValue: true }); if (r.result?.result?.value) break; }
  const t = await send('Runtime.evaluate', { expression: "document.getElementById('ang').textContent", returnByValue: true });
  console.log(`kf${kf}:`, String(t.result?.result?.value || '').replace(/\n/g, ' | '));
  const s = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUT, `${EX}-${kf}.png`), Buffer.from(s.result.data, 'base64'));
}
ws.close(); chrome.kill(); server.close(); process.exit(0);
