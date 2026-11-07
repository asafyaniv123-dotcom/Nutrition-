// node tools/sheets/review-check.mjs - Serve the repo, open exercise-sheets/review.html in headless Chrome, list card titles and whether every image loaded.
import http from 'http'; import fs from 'fs'; import path from 'path'; import os from 'os'; import { spawn } from 'child_process';
const ROOT = 'C:/Projects/Nutrition-';
const T = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.gif': 'image/gif', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(p, (e, b) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': T[path.extname(p)] || 'application/octet-stream' }); r.end(b); }); });
await new Promise((ok) => srv.listen(8791, ok));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rev-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--remote-debugging-port=9498', '--user-data-dir=' + tmp, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { await sleep(200); try { t = (await (await fetch('http://127.0.0.1:9498/json')).json()).find((x) => x.type === 'page'); } catch {} }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pend = new Map();
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
await send('Page.navigate', { url: 'http://localhost:8791/exercise-sheets/review.html' }); await sleep(4000);
const expr = `[...document.querySelectorAll('article')].map((a) => { a.querySelectorAll('img').forEach((i) => i.loading = 'eager'); return a.querySelector('h2').textContent; }).join('\\n')`;
await send('Runtime.evaluate', { expression: expr }); await sleep(3000);
const r = await send('Runtime.evaluate', { expression: `[...document.querySelectorAll('article')].map((a) => a.querySelector('h2').textContent + ' | imgs ok: ' + [...a.querySelectorAll('img')].every((i) => i.naturalWidth > 0)).join('\\n')` });
console.log(r.result.result.value);
ws.close(); chrome.kill(); srv.close();
