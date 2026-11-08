// list every exercise link (href + text) on M&S category pages, through one headless Chrome (it passes their challenge)
// node maslinks.mjs <out.json> <category> [category ...]   e.g. biceps triceps shoulders
import fs from 'fs'; import os from 'os'; import path from 'path'; import { spawn } from 'child_process';
const [out, ...cats] = process.argv.slice(2);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mas-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--remote-debugging-port=9520', '--window-size=1300,1800', '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '--user-data-dir=' + tmp, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { await sleep(200); try { t = (await (await fetch('http://127.0.0.1:9520/json')).json()).find((x) => x.type === 'page'); } catch {} }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pend = {};
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (pend[d.id]) { pend[d.id](d.result || d); delete pend[d.id]; } });
const cmd = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await cmd('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.value;
const LIST = String.raw`JSON.stringify([...document.querySelectorAll('a')].filter(a => /\/exercises\/[a-z0-9-]+\.html$/.test(a.href)).map(a => [a.href, a.textContent.trim().replace(/\s+/g, ' ')]))`;
await cmd('Page.enable');
const all = {};
for (const c of cats) {
  await cmd('Page.navigate', { url: 'https://www.muscleandstrength.com/exercises/' + c });
  for (let i = 0; i < 12; i++) { await sleep(2500); const ti = await ev('document.title'); if (ti && !/moment|רגע/i.test(ti)) break; }
  await sleep(1500);
  for (const [h, x] of JSON.parse(await ev(LIST) || '[]')) if (x) all[h] = x;
  console.log(c, Object.keys(all).length);
}
fs.writeFileSync(out, JSON.stringify(all, null, 1));
chrome.kill(); process.exit(0);
