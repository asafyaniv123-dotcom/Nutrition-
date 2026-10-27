/* Drive the planning screen through a list of steps, one browser session.
 *   node tools/audit-plan/drive.mjs <steps.mjs>
 * steps.mjs default-exports [{name, js, wait, shot}] ; each js is evaluated
 * (await-able), its value printed, and a screenshot taken if shot is set.
 * helpers.js is injected before the first step. */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { pathToFileURL } from 'url';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const steps = (await import(pathToFileURL(path.resolve(process.argv[2])).href)).default;
const HELP = fs.readFileSync(path.join(ROOT, 'tools/audit-plan/helpers.js'), 'utf8');
const PORT = 8797 + Math.floor(Math.random() * 50), DBG = 9400 + Math.floor(Math.random() * 50);
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
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
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-plan-'));
const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', '--remote-debugging-port=' + DBG,
  '--user-data-dir=' + TMP, '--hide-scrollbars', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 150 && !target; i++) { await sleep(200);
  try { target = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') console.log('PAGE THREW: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') console.log('CONSOLE ERR: ' + m.params.args.map(a => a.value || a.description).join(' ').slice(0, 200));
});
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: +(process.env.H || 844), deviceScaleFactor: 2, mobile: true });
await send('Page.navigate', { url: `http://localhost:${PORT}/dev/?demo=progress` });
await sleep(+(process.env.BOOT || 6500));
await send('Runtime.evaluate', { expression: HELP });
for (const s of steps) {
  const r = await send('Runtime.evaluate', { expression: s.js, returnByValue: true, awaitPromise: true });
  const v = r.result?.result;
  const ex = r.result?.exceptionDetails;
  console.log('## ' + s.name + ' => ' + (ex ? 'THREW ' + (ex.exception?.description || ex.text).split('\n')[0] : JSON.stringify(v?.value)));
  if (s.wait) await sleep(s.wait);
  if (s.shot) {
    const a = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(s.shot, Buffer.from(a.result.data, 'base64'));
    console.log('   shot ' + s.shot);
  }
}
ws.close(); chrome.kill(); server.close();
process.exit(0);
