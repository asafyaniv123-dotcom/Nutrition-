/* Shoots a whole page to one PNG (from shoot-lockups.mjs), at 2x, for the decision page.
 *   node marketing/brand/shoot-lockups.mjs <page-under-repo> <out-dir> <prefix>
 * Same CDP pattern as tools/shoot-page.mjs; waits for window.READY (fonts). */
import fs from 'fs'; import http from 'http'; import path from 'path'; import os from 'os'; import { spawn } from 'child_process';
const ROOT = process.cwd(), CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const [PAGE, OUT, PREFIX = 'card'] = process.argv.slice(2); const PORT = 8798, DBG = 9338;
fs.mkdirSync(OUT, { recursive: true });
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((q, s) => { const f = path.resolve(ROOT, '.' + decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); s.end(d); }); });
await new Promise((r) => server.listen(PORT, r));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lockups-'));
const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', '--remote-debugging-port=' + DBG, '--user-data-dir=' + TMP, '--hide-scrollbars', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); let target;
for (let i = 0; i < 50 && !target; i++) { await sleep(200); try { target = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pend = new Map(); ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (x) => (await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true })).result?.result?.value;
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1800, height: 1200, deviceScaleFactor: 2, mobile: false });
await send('Page.navigate', { url: `http://localhost:${PORT}/${PAGE}` });
for (let i = 0; i < 60; i++) { await sleep(250); if (await ev('window.READY===1')) break; }
await sleep(800);
const H = await ev('document.documentElement.scrollHeight');
const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1800, height: H, scale: 1 } });
fs.writeFileSync(path.join(OUT, PREFIX + '.png'), Buffer.from(r.result.data, 'base64')); console.log('shot', H);
chrome.kill(); server.close(); process.exit(0);
