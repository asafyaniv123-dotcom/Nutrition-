// For each "id:slug", open the M&S exercise page in headless Chrome, autoplay its YouTube or Vimeo video muted inside the page,
// and screenshot the player once a second -> <outRoot>/<id>/NNN.jpg  (YouTube refuses direct playback here; the page works)
// node masgrab.mjs <outRoot> <frames> <intervalMs> id:slug [id:slug ...]   (8 Nov: 120 frames at 250 ms catches the ends of a rep; 1 s missed them)
import fs from 'fs'; import os from 'os'; import path from 'path'; import { spawn } from 'child_process';
const [outRoot, secs, every, ...jobs] = process.argv.slice(2);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mas-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--autoplay-policy=no-user-gesture-required', '--remote-debugging-port=9521', '--window-size=1300,1300', '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '--user-data-dir=' + tmp, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { await sleep(200); try { t = (await (await fetch('http://127.0.0.1:9521/json')).json()).find((x) => x.type === 'page'); } catch {} }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pend = {};
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (pend[d.id]) { pend[d.id](d.result || d); delete pend[d.id]; } });
const cmd = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await cmd('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.value;
await cmd('Page.enable');
for (const job of jobs) {
  const [xid, slug] = job.split(':'); const dir = path.join(outRoot, xid); fs.mkdirSync(dir, { recursive: true });
  await cmd('Page.navigate', { url: 'https://www.muscleandstrength.com/exercises/' + slug + '.html' });
  for (let i = 0; i < 12; i++) { await sleep(2500); const ti = await ev('document.title'); if (ti && !/moment|רגע/i.test(ti)) break; }
  await ev(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Reject/.test(x.innerText)); if(b) b.click();})()`);
  const r = await ev(`(()=>{const f=[...document.querySelectorAll('iframe')].find(x=>/youtube|vimeo/.test(x.src||x.getAttribute('data-src')||'')); if(!f) return ''; f.scrollIntoView(); f.src=(f.getAttribute('data-src')||f.src)+'&autoplay=1&mute=1&muted=1'; const b=f.getBoundingClientRect(); return JSON.stringify({x:b.x+scrollX,y:b.y+scrollY,w:b.width,h:b.height});})()`);
  if (!r) { console.log(xid, 'no video'); continue; }
  const b = JSON.parse(r); await sleep(4000);
  for (let i = 0; i < +secs; i++) {
    const shot = await cmd('Page.captureScreenshot', { format: 'jpeg', quality: 88, clip: { x: b.x, y: b.y, width: b.w, height: b.h, scale: 1 } });
    fs.writeFileSync(path.join(dir, String(i).padStart(3, '0') + '.jpg'), Buffer.from(shot.data, 'base64')); await sleep(+every);
  }
  console.log(xid, 'done');
}
chrome.kill(); process.exit(0);
