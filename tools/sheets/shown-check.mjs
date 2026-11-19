// node tools/sheets/shown-check.mjs <path-under-Nutrition-, e.g. dev/ or ''> - headless Chrome on the real page: open the catalogue the way its
//   button does, read the count on the "all" chip, press the "show" button, count the tiles and check every tile's video loads; type
//   each hidden exercise into the search box; run alternatives for every shown exercise, the generator for every group and every kit,
//   the stretch routines and the cooldown; collect console errors and exceptions the whole time.
import http from 'http'; import fs from 'fs'; import path from 'path'; import os from 'os'; import { spawn } from 'child_process';
const ROOT = 'C:/Projects/Nutrition-', SUB = process.argv[2] || '', PORT = 8995 + (SUB ? 0 : 1), DBG = 9510 + (SUB ? 0 : 1);
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.mp4': 'video/mp4', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2' };
const srv = http.createServer((q, s) => { let f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/^\/Nutrition-/, ''));
  if (f.endsWith(path.sep) || f.endsWith('/')) f = path.join(f, 'index.html');
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); s.end(d); }); });
await new Promise((r) => srv.listen(PORT, r));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shown-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--autoplay-policy=no-user-gesture-required', '--remote-debugging-port=' + DBG, '--user-data-dir=' + tmp, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { await sleep(200); try { t = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((x) => x.type === 'page'); } catch {} }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pend = new Map(), errs = [];
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errs.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 200));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errs.push('console.error ' + m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 200));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errs.push('log ' + m.params.entry.text.slice(0, 160) + ' ' + (m.params.entry.url || ''));
});
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); return r.result?.result?.value ?? r.result?.exceptionDetails?.exception?.description; };
await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable');
await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/Nutrition-/${SUB}` });
await sleep(9000);
const out = await ev(`(async()=>{
  const W=ms=>new Promise(r=>setTimeout(r,ms)), R={};
  exOpen(); await W(2500);
  const chip=[...document.querySelectorAll('#ex-ov .ex-chip')].map(b=>b.textContent); R.chips=chip;
  document.querySelector('#ex-ov .ex-go').click(); await W(1200);
  const tiles=[...document.querySelectorAll('#ex-ov .ex-tile')]; R.tiles=tiles.length;
  const vids=tiles.map(t=>t.querySelector('video')); R.tilesWithVideo=vids.filter(Boolean).length;
  const srcs=[...new Set(vids.filter(Boolean).map(v=>v.getAttribute('data-src')))];
  let bad=[]; for(const s of srcs){const r=await fetch(s);if(!r.ok||(await r.blob()).size<1000)bad.push(s);} R.videoUrls=srcs.length; R.badUrls=bad;
  const has=e=>!!EX_DEMO[exDemoId(e)]; const lib=exAll(), hidden=lib.filter(e=>!has(e)); R.library=lib.length; R.hidden=hidden.map(e=>e.id).join(' ');
  const hid=new Set(hidden.map(e=>e.id)), titles=new Set(hidden.map(e=>exTitle(e)));
  R.hiddenTiles=tiles.filter(t=>titles.has(t.querySelector('.ex-tile-n').textContent)).length;
  // the search box, typed into the way a person types
  let leak=[]; const q=document.getElementById('ex-q');
  for(const e of hidden){ for(const w of [exTitle(e),(e.t&&e.t.en)||'',e.n]){ if(!w)continue; q.value=w; q.dispatchEvent(new Event('input',{bubbles:true})); await W(30);
    const ns=[...document.querySelectorAll('#ex-ov .ex-tile-n')].map(x=>x.textContent); if(ns.includes(exTitle(e)))leak.push(e.id+' via "'+w+'"'); } }
  R.searchLeaks=leak; q.value=''; q.dispatchEvent(new Event('input',{bubbles:true}));
  // muscle and equipment cards: the count each shows against what is shown
  exBackToFilters&&exBackToFilters(); await W(300);
  const shown=(typeof exShown==='function')?exShown():lib.filter(has); R.exShownDefined=typeof exShown==='function'; R.shown=shown.length; R.shownAllDemo=shown.every(e=>EX_DEMO[exDemoId(e)]);
  // alternatives offered for EVERY exercise, shown or hidden, with and without the free-kit rule
  let altBad=[]; for(const e of lib)for(const f of [true,false])for(const a of exAlternatives(e.n,10,f))if(hid.has(a.id))altBad.push(e.id+'->'+a.id);
  R.altLeaks=altBad.length+(altBad.length?' '+altBad.slice(0,8).join(' '):'');
  // the generator, every rolled-up group with every kit
  let genBad=[],genN=0; const groups=bandGroups();
  for(const k of Object.keys(GEN_EQUIP))for(const g of groups){ const rows=genPick({muscles:[g],equip:GEN_EQUIP[k],sets:12})||[];
    for(const r of rows){if(r.none)continue;genN++; const e=r.e||exByName(r.name||r.n); if(!e||hid.has(e.id))genBad.push(k+'/'+g+':'+(r.name||r.n||JSON.stringify(r).slice(0,40)));} }
  R.genRows=genN; R.genLeaks=genBad.length+(genBad.length?' '+genBad.slice(0,6).join(' '):'');
  // stretch routines and the cooldown after a workout of every shown strength row
  let stBad=[]; for(const r of ST_ROUTINES){const p=stPlan(r.ids);for(const n of p.names){const e=exByName(n);if(!e||hid.has(e.id))stBad.push(r.id+':'+n);}}
  const cd=stCooldown(shown.filter(e=>!e.st).slice(0,40).map(e=>({name:e.n,sets:[1,2,3]})))||[];
  for(const c of cd){const e=c.e||c||{};if(e.id&&hid.has(e.id))stBad.push('cooldown:'+e.id);}
  R.stretchLeaks=stBad.length+(stBad.length?' '+stBad.join(' '):''); R.cooldownRows=cd.length;
  // a stored name of a hidden exercise still reads as itself (history is not lost)
  R.historyLabel=exLabel(hidden[0].n)===exTitle(hidden[0]);
  return JSON.stringify(R,null,1);
})()`);
console.log(SUB || '(stable)', out);
console.log('errors:', errs.length ? '\n  ' + errs.join('\n  ') : 0);
ws.close(); chrome.kill(); srv.close();
