/* Renders a word in Fraunces 700 to a transparent PNG, cropped tight to the
 * ink - the way assets/brand-name.png was made for "Better Me".
 *   node tools/render-wordmark.mjs <out.png> <text> [height=186] [color=#2e2925]
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
const [OUT, TEXT, HGT = '186', COL = '#2e2925'] = process.argv.slice(2);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DBG = 9341;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'wordmark-'));
const html = `<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@24,700&display=block" rel="stylesheet">
<style>html,body{margin:0;background:transparent}#w{display:inline-block;font-family:Fraunces,serif;font-weight:700;font-size:400px;line-height:1;color:${COL};letter-spacing:-.01em;padding:40px}</style></head>
<body><span id="w">${TEXT}</span></body></html>`;
const page = path.join(TMP, 'w.html');
fs.writeFileSync(page, html);
const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', '--remote-debugging-port=' + DBG, '--user-data-dir=' + TMP, '--hide-scrollbars', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 60 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 2400, height: 700, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
await send('Page.navigate', { url: 'file:///' + page.replace(/\\/g, '/') });
await sleep(3500);
await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
/* the ink's own box: draw the word to a canvas and read where the pixels are */
const r = await send('Runtime.evaluate', { returnByValue: true, awaitPromise: true, expression: `(async function(){
  await document.fonts.load('700 400px Fraunces');
  var c=document.createElement('canvas');c.width=2400;c.height=700;var g=c.getContext('2d');
  g.font='700 400px Fraunces';g.fillStyle=${JSON.stringify(COL)};g.textBaseline='alphabetic';g.fillText(${JSON.stringify(TEXT)},40,500);
  var d=g.getImageData(0,0,2400,700).data,x0=2400,y0=700,x1=0,y1=0,x,y;
  for(y=0;y<700;y++)for(x=0;x<2400;x++)if(d[(y*2400+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  var H=${+HGT},s=H/(y1-y0+1),W=Math.round((x1-x0+1)*s),o=document.createElement('canvas');o.width=W;o.height=H;
  var og=o.getContext('2d');og.imageSmoothingQuality='high';og.drawImage(c,x0,y0,x1-x0+1,y1-y0+1,0,0,W,H);
  return {fam:document.fonts.check('700 40px Fraunces'),w:W,h:H,png:o.toDataURL('image/png')};})()` });
const v = r.result.result.value;
fs.writeFileSync(OUT, Buffer.from(v.png.split(',')[1], 'base64'));
console.log('wrote', OUT, v.w + 'x' + v.h, 'fraunces loaded:', v.fam);
ws.close(); chrome.kill();
