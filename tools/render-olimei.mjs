/* The Olimei wordmark as chosen (24 Oct, option B of review/olimei-ideas):
 * Fraunces 700, the last i dotless, the brand sun where its dot was, the sun
 * 0.30 em in radius and risen until its lowest ray clears the stem.
 *   node tools/render-olimei.mjs
 * writes, all cropped to the same box (word + sun) so they line up:
 *   brand/wordmark-olimei.png        ink word, orange sun
 *   brand/wordmark-olimei-light.png  cream word, orange sun (for dark grounds)
 *   assets/brand-name-olimei.png     ink word WITHOUT the sun - the splash
 *                                    draws the word, then the sun lands on it
 * and prints the sun's centre and size as fractions of that box, which the
 * splash uses to place its own sun. */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DBG = 9342, TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'olimei-'));
const page = path.join(TMP, 'w.html');
fs.writeFileSync(page, `<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@24,700&display=block" rel="stylesheet"></head><body>x</body></html>`);
const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', '--remote-debugging-port=' + DBG, '--user-data-dir=' + TMP, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 60 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: 'file:///' + page.replace(/\\/g, '/') });
await sleep(3500);
const r = await send('Runtime.evaluate', { returnByValue: true, awaitPromise: true, expression: `(async function(){
  await document.fonts.load('700 400px Fraunces');
  var px=400,f='700 '+px+'px Fraunces',T='Olimeı',Td='Olimei',I=5,W=2800,H=900,base=640,pad=60;
  function cv(){var c=document.createElement('canvas');c.width=W;c.height=H;var g=c.getContext('2d');g.font=f;g.direction='ltr';g.textAlign='left';g.textBaseline='alphabetic';return [c,g];}
  /* the dot, measured in place inside the i's own column */
  var a=cv(),b=cv();a[1].fillText(Td,pad,base);b[1].fillText(T,pad,base);
  var A=a[1].getImageData(0,0,W,H).data,B=b[1].getImageData(0,0,W,H).data,g0=a[1];
  var xa=pad+g0.measureText(T.slice(0,I)).width-px*.05,xb=pad+g0.measureText(T.slice(0,I)+'i').width+px*.05,yb=base-px*.56,sx=0,sy=0,n=0,x,y,k;
  for(y=0;y<yb;y++)for(x=Math.floor(xa);x<xb;x++){k=(y*W+x)*4+3;if(A[k]>128&&B[k]<40){sx+=x;sy+=y;n++;}}
  var R=.30*px,cx=sx/n,cy=sy/n,low=cy+R,xh=px*.5;if(low>base-xh-px*.04)cy-=low-(base-xh-px*.04);
  var P={n:9,c:19.5,d:5.6,r:33,rot:.5},q=R/(P.r+P.d);
  function sun(g){g.fillStyle='#ff7a1a';g.beginPath();g.arc(cx,cy,P.c*q,0,Math.PI*2);g.fill();
    for(var i=0;i<P.n;i++){var an=(i+P.rot)/P.n*Math.PI*2-Math.PI/2;g.beginPath();g.arc(cx+Math.cos(an)*P.r*q,cy+Math.sin(an)*P.r*q,P.d*q,0,Math.PI*2);g.fill();}}
  function make(ink,withSun){var c=cv();c[1].fillStyle=ink;c[1].fillText(T,pad,base);if(withSun)sun(c[1]);return c[0];}
  /* one box for all three: the ink of the word with the sun */
  var full=make('#2e2925',true),d=full.getContext('2d').getImageData(0,0,W,H).data,x0=W,y0=H,x1=0,y1=0;
  for(y=0;y<H;y++)for(x=0;x<W;x++)if(d[(y*W+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  var OH=240,s=OH/(y1-y0+1),OW=Math.round((x1-x0+1)*s);
  function crop(c){var o=document.createElement('canvas');o.width=OW;o.height=OH;var og=o.getContext('2d');og.imageSmoothingQuality='high';og.drawImage(c,x0,y0,x1-x0+1,y1-y0+1,0,0,OW,OH);return o.toDataURL('image/png');}
  var wbox=x1-x0+1,hbox=y1-y0+1;
  return {ink:crop(full),light:crop(make('#efe6dc',true)),bare:crop(make('#2e2925',false)),w:OW,h:OH,
    sun:{cx:(cx-x0)/wbox,cy:(cy-y0)/hbox,d:(2*(P.r+P.d)*q)/hbox}};})()` });
const v = r.result.result.value;
const put = (f, u) => { fs.writeFileSync(f, Buffer.from(u.split(',')[1], 'base64')); console.log('wrote', f); };
put('brand/wordmark-olimei.png', v.ink);
put('brand/wordmark-olimei-light.png', v.light);
put('assets/brand-name-olimei.png', v.bare);
console.log('box', v.w + 'x' + v.h, 'sun', JSON.stringify(v.sun));
ws.close(); chrome.kill();
