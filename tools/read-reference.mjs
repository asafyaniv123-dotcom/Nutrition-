// Read an exercise reference page (ExRx, MuscleWiki and the like) through a real headless
// Chrome: these sites refuse plain fetches with 403, which is how the round-3 research
// ended up without ExRx. Prints the title and the visible text, cut to a size.
// node tools/read-reference.mjs <url> [maxChars]
import fs from 'fs'; import path from 'path'; import os from 'os'; import { spawn } from 'child_process';
const [URL_, MAX = '6000'] = process.argv.slice(2);
const DBG = 9491, TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--remote-debugging-port=' + DBG, '--user-data-dir=' + TMP, '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target; for (let i = 0; i < 50 && !target; i++) { await sleep(200); try { target = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
await send('Page.enable'); await send('Runtime.enable');
await send('Network.enable');
await send('Network.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' });
await send('Page.navigate', { url: URL_ });
await sleep(9000);
const r = await send('Runtime.evaluate', { expression: `JSON.stringify({title:document.title,text:document.body?document.body.innerText:''})`, returnByValue: true });
const v = JSON.parse(r.result.result.value || '{}');
console.log('TITLE:', v.title);
console.log(String(v.text || '').replace(/\n{3,}/g, '\n\n').slice(0, +MAX));
ws.close(); chrome.kill(); process.exit(0);
