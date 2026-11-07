// node tools/sheets/dev-check.mjs <id> [...] - Open dev in headless Chrome, and for each new demo id: build the markup the app builds (exDemoHTML on the
// library's own entry), put it in the page, and wait for the <video> to actually decode a frame.
import http from 'http'; import fs from 'fs'; import path from 'path'; import os from 'os'; import { spawn } from 'child_process';
const ROOT = 'C:/Projects/Nutrition-';
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.mp4': 'video/mp4', '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/json', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2' };
const srv = http.createServer((q, s) => { let f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/^\/Nutrition-/, ''));
  if (f.endsWith(path.sep) || f.endsWith('/')) f = path.join(f, 'index.html');
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); s.end(d); }); });
await new Promise((r) => srv.listen(8994, r));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dev-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--autoplay-policy=no-user-gesture-required', '--remote-debugging-port=9497', '--user-data-dir=' + tmp, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { await sleep(200); try { t = (await (await fetch('http://127.0.0.1:9497/json')).json()).find((x) => x.type === 'page'); } catch {} }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pend = new Map();
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
await send('Runtime.enable'); await send('Page.enable');
await send('Page.navigate', { url: 'http://127.0.0.1:8994/Nutrition-/dev/' });
await sleep(9000);
const ids = process.argv.slice(2);
const expr = `(async()=>{const out=[];const lib=(await (await fetch(liveBase()+'data/exercises.json')).json()).exercises;
for(const id of ${JSON.stringify(ids)}){const e=lib.find(x=>x.id===id);if(!e){out.push(id+' NOT IN LIBRARY');continue;}
const h=exDemoHTML(e,null);if(!h){out.push(id+' no demo markup');continue;}
const d=document.createElement('div');d.innerHTML=h;document.body.appendChild(d);const v=d.querySelector('video');
const ok=await new Promise(r=>{if(v.readyState>=2)return r(true);v.addEventListener('loadeddata',()=>r(true));v.addEventListener('error',()=>r(false));v.load();setTimeout(()=>r(false),8000);});
out.push(id+' '+(ok?'plays '+v.videoWidth+'x'+v.videoHeight+' '+v.duration.toFixed(1)+'s':'FAILED '+v.src));d.remove();}
return out.join('\\n');})()`;
const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
console.log(r.result?.result?.value || JSON.stringify(r.result));
ws.close(); chrome.kill(); srv.close();
