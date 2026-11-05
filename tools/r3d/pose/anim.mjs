// Render one repetition of the mannequin as a clip, frame by frame from pose(t) - free, and exact
// to the research's angles, which is what the video model cannot be told in words (Asaf, 5 Nov).
// node tools/r3d/pose/anim.mjs <exercise> <out.mp4> [look=a|glow] [frames=48] [once]
// The rep eases in and out (a smooth start and turn), and the clip is the rep then its reverse,
// so it loops. Needs an exercise whose poses are written as pose(t); calf is the first.
import fs from 'fs'; import http from 'http'; import path from 'path'; import os from 'os';
import { spawn, execFileSync } from 'child_process';
const [EX, OUT, ...FLAGS] = process.argv.slice(2);
const LOOK = (FLAGS.find((a) => a.startsWith('look=')) || 'look=a').slice(5), N = +((FLAGS.find((a) => a.startsWith('frames=')) || 'frames=48').slice(7));
const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const server = http.createServer((req, res) => {
  const f = path.join(DIR, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' }); res.end(d); });
});
await new Promise((r) => server.listen(8997, r));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'anim-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--remote-debugging-port=9496', '--user-data-dir=' + TMP, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target; for (let i = 0; i < 50 && !target; i++) { await sleep(200); try { target = (await (await fetch('http://127.0.0.1:9496/json')).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') console.log('PAGE THREW: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text)); });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 900, height: 900, deviceScaleFactor: 1, mobile: false });
const frames = path.join(TMP, 'f'); fs.mkdirSync(frames);
for (let i = 0; i < N; i++) {
  const t = (1 - Math.cos(Math.PI * i / (N - 1))) / 2;          // ease in and out
  await send('Page.navigate', { url: `http://127.0.0.1:8997/pose.html?ex=${EX}&t=${t.toFixed(4)}&look=${LOOK}&clean=1` });
  for (let k = 0; k < 40; k++) { await sleep(150); const r = await send('Runtime.evaluate', { expression: '!!window.__done', returnByValue: true }); if (r.result?.result?.value) break; }
  const s = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(frames, String(i).padStart(3, '0') + '.png'), Buffer.from(s.result.data, 'base64'));
}
ws.close(); chrome.kill(); server.close();
/* `once`: the rep one way only - the shape a video model takes as a motion reference */
const ONCE = FLAGS.includes('once');
execFileSync(FF, ['-v', 'error', '-y', '-framerate', '24', '-i', path.join(frames, '%03d.png'), '-filter_complex', ONCE ? '[0:v]scale=720:720,format=yuv420p' : '[0:v]scale=540:540,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0,format=yuv420p', '-c:v', 'libx264', '-crf', '24', '-movflags', '+faststart', OUT]);
console.log(OUT, N, 'frames each way');
process.exit(0);
