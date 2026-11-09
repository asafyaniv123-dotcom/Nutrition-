// node tools/sheets/pose-extract.mjs <photo.png|jpg> <out.json> - the 33 body landmarks of the person in a real photo, from
// Google's MediaPipe Pose Landmarker running in headless Chrome (free, local; the model and library come from their CDN).
// Output: { width, height, landmarks:[{x,y,z,visibility}] } with x,y in pixels and z relative depth (smaller = nearer the
// camera). A hand-drawn skeleton could not say which arm is in front - the model put x4's near arm behind the backrest
// (9 Nov) - and z is what answers that. Use pose-to-openpose.mjs to turn this into a control image.
import http from 'http'; import fs from 'fs'; import path from 'path'; import os from 'os'; import { spawn } from 'child_process';
const [img, out] = process.argv.slice(2);
if (!img || !out) { console.log('usage: pose-extract.mjs <photo> <out.json>'); process.exit(2); }
const VER = '0.10.14';
const page = `<!doctype html><meta charset="utf-8"><pre id="out">pending</pre><script type="module">
import { FilesetResolver, PoseLandmarker } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VER}/vision_bundle.mjs';
const o = document.getElementById('out');
try {
  const fs = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VER}/wasm');
  const lm = await PoseLandmarker.createFromOptions(fs, { baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task', delegate: 'CPU' }, runningMode: 'IMAGE', numPoses: 1 });
  const im = new Image(); im.src = '/img'; await im.decode();
  const r = lm.detect(im);
  const p = (r.landmarks[0] || []).map((l) => ({ x: +(l.x * im.naturalWidth).toFixed(1), y: +(l.y * im.naturalHeight).toFixed(1), z: +l.z.toFixed(4), visibility: +(l.visibility ?? 0).toFixed(3) }));
  o.textContent = JSON.stringify({ width: im.naturalWidth, height: im.naturalHeight, landmarks: p });
} catch (e) { o.textContent = 'ERROR ' + e.message; }
</script>`;
const type = /\.png$/i.test(img) ? 'image/png' : 'image/jpeg';
const srv = http.createServer((q, r) => {
  if (q.url.startsWith('/img')) { r.writeHead(200, { 'content-type': type }); r.end(fs.readFileSync(img)); return; }
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(page);
});
await new Promise((ok) => srv.listen(8794, ok));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pose-'));
// the page loads a model over the network, so wait for its answer over DevTools rather than for a fixed time
const c = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--user-data-dir=' + tmp,
  '--remote-debugging-port=9499', 'http://127.0.0.1:8794/'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { await sleep(200); try { t = (await (await fetch('http://127.0.0.1:9499/json')).json()).find((x) => x.type === 'page'); } catch {} }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const evalJs = (expr) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } })); });
let txt = 'pending';
for (let i = 0; i < 120 && txt === 'pending'; i++) { await sleep(1000); const r = await evalJs("document.getElementById('out')?.textContent || 'pending'"); txt = r.result?.result?.value ?? 'pending'; }
ws.close(); c.kill(); srv.close();
if (!txt.startsWith('{')) { console.log('failed:', txt.slice(0, 300)); process.exit(1); }
fs.writeFileSync(out, txt);
const j = JSON.parse(txt); console.log('ok', j.landmarks.length, 'landmarks', j.width + 'x' + j.height);
