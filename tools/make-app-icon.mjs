/* Renders review/app-icon at exactly 1024x1024, device scale 1, and writes it
 * as the iOS AppIcon. Apple refuses an icon with an alpha channel, so the
 * PNG is re-encoded as plain RGB (colour type 2) here. */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import zlib from 'zlib';
import { spawn } from 'child_process';
const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'native/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png';
const PORT = 8801, DBG = 9341;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((req, res) => { const p = decodeURIComponent(req.url.split('?')[0]);
  const fp = path.resolve(ROOT, '.' + (p.endsWith('/') ? p + 'index.html' : p)); fs.readFile(fp, (e, d) => { if (e) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': types[path.extname(fp)] || 'application/octet-stream' }); res.end(d); }); });
await new Promise((r) => server.listen(PORT, r));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'icon-'));
const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', '--remote-debugging-port=' + DBG, '--user-data-dir=' + TMP, '--hide-scrollbars', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { await sleep(200); try { t = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((x) => x.type === 'page'); } catch {} }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pend = new Map(); ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 1024, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: `http://localhost:${PORT}/review/app-icon/` });
for (let i = 0; i < 60; i++) { await sleep(250); const r = await send('Runtime.evaluate', { expression: '!!window.READY', returnByValue: true }); if (r.result?.result?.value) break; }
const a = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1024, height: 1024, scale: 1 } });
ws.close(); chrome.kill(); server.close();
/* decode the RGBA PNG and write it again as RGB */
const png = Buffer.from(a.result.data, 'base64'); fs.writeFileSync('.impeccable/mocks/four/icon-raw.png', png);
let off = 8, w = 0, h = 0, ct = 0; const idat = [];
while (off < png.length) { const len = png.readUInt32BE(off), type = png.toString('latin1', off + 4, off + 8), d = png.subarray(off + 8, off + 8 + len);
  if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; } if (type === 'IDAT') idat.push(d); off += 12 + len; }
const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = ct === 6 ? 4 : 3, stride = w * bpp;
const px = Buffer.alloc(w * h * 3); let prev = Buffer.alloc(stride);
for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)], line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
  for (let x = 0; x < stride; x++) { const A = x >= bpp ? line[x - bpp] : 0, B = prev[x], C = x >= bpp ? prev[x - bpp] : 0;
    const p = A + B - C, pa = Math.abs(p - A), pb = Math.abs(p - B), pc = Math.abs(p - C);
    line[x] = (line[x] + (f === 1 ? A : f === 2 ? B : f === 3 ? (A + B) >> 1 : f === 4 ? (pa <= pb && pa <= pc ? A : pb <= pc ? B : C) : 0)) & 255; }
  for (let x = 0; x < w; x++) for (let c = 0; c < 3; c++) px[(y * w + x) * 3 + c] = line[x * bpp + c];
  prev = line; }
const rows = Buffer.alloc(h * (w * 3 + 1)); for (let y = 0; y < h; y++) { rows[y * (w * 3 + 1)] = 0; px.copy(rows, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3); }
const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(type, 'latin1'), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
fs.writeFileSync(OUT, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(rows, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
const o = fs.readFileSync(OUT); console.log('icon', o.readUInt32BE(16) + 'x' + o.readUInt32BE(20), 'colour type', o[25], '->', OUT);
