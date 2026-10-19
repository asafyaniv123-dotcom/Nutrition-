/* Photograph the home screen of dev/index.html at phone size, and measure it.
 *
 *   node tools/shoot-home.mjs [out-dir] [--lang he|en] [--hour 9|21]
 *
 * Built for the home-screen critique of 19 Oct 2026: "tell me why it feels
 * crowded and empty at once" has to start from a picture, not from memory.
 *
 * Drives headless Chrome over the DevTools protocol (Node's own WebSocket),
 * at 390x844 CSS px and DPR 3 - an iPhone 14/15. Two states:
 *   empty - only the door answered; the day has nothing in it
 *   lived - a day plan written through the app's own saveDPlan(), so the
 *           shape is the writer's, not one remembered here
 * Besides the PNGs it writes measure.json: every visible element's box on the
 * first viewport, its text, font size and weight - the numbers the critique
 * quotes. Nothing in dev/ is written.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const args = process.argv.slice(2);
const OUT = path.resolve(args.find((a) => !a.startsWith('--') && !/^\d+$/.test(a) && !/^(he|en)$/.test(a)) || '.impeccable/mocks/home-now');
const LANG = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'he';
const HOUR = args.includes('--hour') ? +args[args.indexOf('--hour') + 1] : 20;
const PORT = 8794, DBG = 9334;
fs.mkdirSync(OUT, { recursive: true });

const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.gif': 'image/gif' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const file = path.resolve(ROOT, '.' + (p.endsWith('/') ? p + 'index.html' : p));
  if (!file.startsWith(path.resolve(ROOT))) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});
await new Promise((r) => server.listen(PORT, r));

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'shoot-home-'));
const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=' + DBG, '--user-data-dir=' + TMP, '--hide-scrollbars',
  '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try { target = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((t) => t.type === 'page'); } catch {}
}
if (!target) { console.log('FAIL: Chrome never opened a debugging port'); process.exit(1); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const evalJS = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
  return r.result?.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data);
  if (m.method === 'Runtime.exceptionThrown') console.log('PAGE THREW: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]); });
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true });
/* The fan, the greeting and the sky all read the hour. Pin it, so the picture
   is the evening - the situation the product is for - and is reproducible. */
const d = new Date(); d.setHours(HOUR, 10, 0, 0);
const SHIFT = d.getTime() - Date.now();
await send('Page.addScriptToEvaluateOnNewDocument', { source: `(function(){
  var S=${SHIFT},R=Date,now=R.now;
  function D(){var a=[].slice.call(arguments);
    if(!(this instanceof D))return new R(now()+S).toString();
    return a.length?new (Function.prototype.bind.apply(R,[null].concat(a)))():new R(now()+S);}
  D.prototype=R.prototype;D.now=function(){return now()+S;};D.UTC=R.UTC;D.parse=R.parse;
  window.Date=D;})();` });

/* Storage before the first line of the app runs: the door answered, a name,
   a language. Raw keys - the dev shim seeds its dev: namespace from them. */
await send('Page.addScriptToEvaluateOnNewDocument', { source: `(function(){try{
  if(sessionStorage.getItem('__seeded'))return;sessionStorage.setItem('__seeded','1');
  localStorage.clear();
  localStorage.setItem('app_onboarded','1');
  localStorage.setItem('greet_name','אסף');
  localStorage.setItem('app_lang',${JSON.stringify(LANG)});
}catch(e){}})();` });

async function load() {
  await send('Page.navigate', { url: `http://localhost:${PORT}/dev/` });
  for (let i = 0; i < 60; i++) {
    await sleep(250);
    try { if (await evalJS(`!!document.getElementById('home-grid')&&document.readyState==='complete'`)) break; } catch {}
  }
  await sleep(2500);
}

const MEASURE = `(function(){
  var vh=innerHeight,out=[];
  var sel='#home-screen *';
  document.querySelectorAll(sel).forEach(function(e){
    var r=e.getBoundingClientRect();
    if(r.width<2||r.height<2||r.bottom<0||r.top>vh*1.6)return;
    var cs=getComputedStyle(e);
    if(cs.visibility==='hidden'||+cs.opacity===0||cs.display==='none')return;
    var own='';e.childNodes.forEach(function(n){if(n.nodeType===3)own+=n.textContent;});
    own=own.trim();
    out.push({tag:e.tagName.toLowerCase(),id:e.id||'',cls:(e.className&&e.className.baseVal===undefined?e.className:'')||'',
      x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),
      text:own.slice(0,60),fs:cs.fontSize,fw:cs.fontWeight,color:cs.color,bg:cs.backgroundColor,
      shadow:cs.boxShadow==='none'?'':'y',radius:cs.borderRadius});
  });
  var tb=document.querySelector('.tabbar'),tr=tb&&tb.getBoundingClientRect();
  return {vh:vh,vw:innerWidth,scrollH:document.documentElement.scrollHeight,
    tabbar:tr?{y:Math.round(tr.top),h:Math.round(tr.height)}:null,els:out};
})()`;


/* ── DIRECTIONS ── each is CSS + a few DOM moves injected into the running
   page, so a direction is photographed on the real app with the real fan and
   the real data. Nothing is written to dev/index.html. */
const P = 'html body.mod-home ';
const QUIET_TOP = P+'.home-logo,'+P+'.home-sub,'+P+'.home-date{display:none!important}'+
  P+'.greet-w{font-size:24px!important;letter-spacing:-.4px}'+
  P+'.greet-wrap{margin-bottom:0!important}'+
  P+'.v-date{font-size:13px;font-weight:600;color:var(--nu-muted);margin-top:2px}'+
  P+'.v-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:2px}'+
  P+'.v-row .stk{margin:0!important}'+P+'.v-date{margin:0}'+
  P+'.td-cols{min-height:0!important}'+
  P+'.td-when{font-size:0!important}'+P+'.td-when .td-clock{font-size:13px}';
/* the date leaves the card and becomes the headline's second line */
const MOVE_DATE = 'var g=document.querySelector(".greet-wrap"),w=document.querySelector(".td-when"),k=g&&g.querySelector(".stk");'+
  'if(g&&w&&!document.querySelector(".v-date")){var row=document.createElement("div");row.className="v-row";'+
  'var d=document.createElement("div");d.className="v-date";d.textContent=w.childNodes[0].textContent.trim();row.appendChild(d);'+
  'if(k)row.appendChild(k);g.appendChild(row);}';
const VARIANTS = {
  /* A: only subtraction and order. Nothing grows. */
  a: { css: QUIET_TOP +
      P+'.cfan{margin-top:14px!important;margin-bottom:-58px}'+
      P+'.hcmd{margin-top:8px!important}',
    js: MOVE_DATE },
  /* B: the spine is the biggest thing; the streak (a count of finished
     summaries) moves under the hub it counts; the seven glows step back. */
  b: { css: QUIET_TOP + P+'.stk{display:none!important}'+
      P+'.cfan{margin-top:22px!important;margin-bottom:-6px}'+
      P+'.chub{transform:scale(1.24);transform-origin:50% 50%}'+
      P+'.chub-t{font-size:13.5px!important}'+
      P+'.cname{font-size:10.5px!important}'+
      P+'.cray-wedge{opacity:.42!important}'+P+'.cray-wedge.cray-off{opacity:.3!important}'+
      P+'.v-stk{position:absolute;left:50%;transform:translateX(-50%);top:262px;display:flex;align-items:center;gap:5px;'+
        'font-size:12.5px;font-weight:700;color:var(--nu-muted);white-space:nowrap}'+
      P+'.v-stk b{color:var(--nu-ink);font-size:14px}',
    js: MOVE_DATE + 'var f=document.querySelector(".cfan"),k=document.querySelector(".stk");'+
      'if(f&&k&&!document.querySelector(".v-stk")){var x=document.createElement("div");x.className="v-stk";'+
      'x.innerHTML="<span>🔥</span><b>"+k.querySelector(".stk-n").textContent+"</b><span>"+k.querySelector(".stk-w").textContent+"</span>";f.appendChild(x);}' },
  /* C: the day card says one thing - what comes next - and the screen gets
     even air between its four parts. */
  c: { css: QUIET_TOP +
      P+'.cfan{margin-top:48px!important;margin-bottom:-14px}'+
      P+'.cname{font-size:10.5px!important}'+
      P+'.hcmd{margin:0 0 26px!important}'+
      P+'.td-cols{display:none!important}'+
      P+'.td-bar{margin-bottom:14px!important}'+
      P+'.v-next{display:flex;align-items:baseline;gap:10px;font-size:14px;font-weight:800;color:var(--nu-ink)}'+
      P+'.v-next .t{color:var(--nu-muted);font-size:13px;direction:ltr}'+
      P+'.v-next .r{margin-inline-start:auto;font-size:12px;font-weight:700;color:var(--nu-muted)}',
    js: MOVE_DATE + 'var c=document.querySelector(".td-card");if(c&&!document.querySelector(".v-next")){'+
      'var rows=[].slice.call(c.querySelectorAll(".td-row")).filter(function(r){return !r.classList.contains("past");});'+
      'var r=rows[0],n=c.querySelectorAll(".td-note").length,x=document.createElement("div");x.className="v-next";'+
      'x.innerHTML=r?"<span class=t>"+r.querySelector(".td-time").textContent+"</span><span>"+r.querySelector(".td-name").textContent+"</span>"'+
      '+"<span class=r>"+n+" לזכור ›</span>":"";c.appendChild(x);}' },
};
async function variant(k) {
  await load();
  const v = VARIANTS[k];
  await evalJS('(function(){var s=document.createElement("style");s.textContent=' + JSON.stringify(v.css) +
    ';document.head.appendChild(s);' + v.js + '})()');
  await sleep(900);
  await shoot('dir-' + k + '-' + LANG);
}

async function shoot(name) {
  await evalJS('scrollTo(0,0)'); await sleep(400);
  const a = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(a.result.data, 'base64'));
  const full = await evalJS('document.documentElement.scrollHeight');
  const b = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: 390, height: full, scale: 1 } });
  fs.writeFileSync(path.join(OUT, name + '-full.png'), Buffer.from(b.result.data, 'base64'));
  const m = await evalJS(MEASURE);
  fs.writeFileSync(path.join(OUT, name + '-measure.json'), JSON.stringify(m, null, 1));
  console.log(`${name}: ${m.els.length} elements, page ${m.scrollH}px tall`);
}

try {
  await load();
  await shoot('empty-' + LANG);

  /* lived-in: a day plan written by the app's own writer */
  await evalJS(`(function(){
    var date=todayStr(),o=loadDPlan(date);
    function it(id,w,c,h,mn,n){o.items.push({id:id,w:w,c:c,h:h,mn:mn||0,n:n||''});}
    it('s1',_t('אימון')==='אימון'?'אימון כוח':'Strength training','terra',7,30);
    it('s2','פגישה עם נועה','violet',13,0,'להביא את המסמכים של הדירה');
    it('s3','קניות לשבוע','green',18,0,'חלב, ביצים, טחינה');
    it('s4','להתקשר לאמא','water',21,0);
    saveDPlan(date,o);
    renderHomeToday();
  })()`);
  await sleep(800);
  await shoot('lived-' + LANG);
  if (!args.includes('--plain')) for (const k of Object.keys(VARIANTS)) await variant(k);
  /* --ideas: the second round, drawn over what dev ships now */
  if (args.includes('--ideas')) {
    const { IDEAS } = await import('./home-ideas.mjs');
    for (const [k, v] of Object.entries(IDEAS)) {
      await load();
      await evalJS('(function(){var s=document.createElement("style");s.textContent=' + JSON.stringify(v.css) +
        ';document.head.appendChild(s);' + v.js + '})()');
      await sleep(1500);
      await shoot('idea-' + k + '-' + LANG);
    }
  }
  /* --taps: press the streak and the hub where they now sit, with a real
     touch at their centre - what is under the finger is what gets pressed */
  if (args.includes('--taps')) {
    const tap = async (sel) => {
      const r = await evalJS(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;
        var b=e.getBoundingClientRect();var x=b.left+b.width/2,y=b.top+b.height/2,top=document.elementFromPoint(x,y);
        return {x:x,y:y,hit:!!top&&(top===e||e.contains(top))};})()`);
      if (!r) return console.log('  FAIL ' + sel + ' not on the page');
      await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y }] });
      await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await sleep(900);
      return r.hit;
    };
    let hit = await tap('#home-stk .stk');
    console.log((hit && await evalJS(`!!document.getElementById('stk-ov')`) ? '  ok   ' : '  FAIL ') + 'the streak under the hub opens its sheet');
    await evalJS('streakClose()'); await sleep(300);
    hit = await tap('.chub');
    console.log((hit && await evalJS(`currentModule!==null&&currentModule!==undefined`) ? '  ok   ' : '  FAIL ') + 'the hub opens ' + await evalJS('String(currentModule)'));
  }
} catch (e) {
  console.log('FAIL: ' + e.message);
} finally {
  ws.close(); chrome.kill(); server.close();
}
