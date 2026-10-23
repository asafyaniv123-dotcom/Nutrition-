/* ANONYMOUS USAGE, so the first round of testers can be read (Asaf, 23 Oct):
 * did they come back, did they finish an evening, which areas did they open.
 * Nothing they wrote, no name, no food: the install's random id, the app's
 * day, the language, and three counts. Sent at most every 15 minutes, and
 * at once when the evening is summarised. The dev sandbox marks itself, so
 * our own testing can be left out. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };

rep(`function corrItem(m){`, `/* ── USAGE, ANONYMOUS ── one small record per app day: opens, which areas
   were entered, and whether the evening was summarised. */
var USAGE_KEY='usage_day',USAGE_FIRST='usage_first';
function usageNote(what,area){
  if(!SYNC_SERVER)return;
  var day=todayStr(),u=null;
  try{u=JSON.parse(localStorage.getItem(USAGE_KEY)||'null');}catch(e){}
  if(!u||u.day!==day)u={day:day,o:0,a:{},s:false,sent:0};
  var urgent=false;
  if(what==='open')u.o++;
  if(what==='area'&&area&&!u.a[area]){u.a[area]=1;}
  if(what==='sum'&&!u.s){u.s=true;urgent=true;}
  var first='';try{first=localStorage.getItem(USAGE_FIRST)||'';if(!first){first=day;localStorage.setItem(USAGE_FIRST,day);}}catch(e){}
  var now=Date.now(),due=urgent||!u.sent||now-u.sent>15*60000;
  if(due)u.sent=now;
  try{localStorage.setItem(USAGE_KEY,JSON.stringify(u));}catch(e){}
  if(!due)return;
  try{
    fetch(SYNC_SERVER+'/ping',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,
      body:JSON.stringify({uid:installId(),dev:!!window.__DEV__,day:day,first:first,lang:appLang(),
        o:u.o,s:u.s,a:Object.keys(u.a)})}).catch(function(){});
  }catch(e){}
}
document.addEventListener('visibilitychange',function(){if(!document.hidden)try{usageNote('open');}catch(e){}});
window.addEventListener('load',function(){setTimeout(function(){try{usageNote('open');}catch(e){}},1500);});
function corrItem(m){`);
rep(`function enterModule(mod){
  setTimeout(function(){areaIntroMaybe(mod);},450);`, `function enterModule(mod){
  setTimeout(function(){areaIntroMaybe(mod);},450);
  try{usageNote('area',mod);}catch(e){}`);
rep(`function rfFinish(){
  var r=rfSave({done:true});`, `function rfFinish(){
  var r=rfSave({done:true});
  try{if(_rfDate===todayStr())usageNote('sum');}catch(e){}`);
fs.writeFileSync(F, s);
console.log('app patched');

/* ── the server: one key per app day, merged; read back by /admin/usage ── */
const W = 'push-server/src/worker.js';
let w = fs.readFileSync(W, 'utf8');
const WE = w.includes('\r\n') ? '\r\n' : '\n';
const a = `    if (url.pathname === '/admin/corrections' && req.method === 'GET') {`;
if (w.split(a).length !== 2) { console.log('worker anchor'); process.exit(1); }
w = w.replace(a, `    /* ── /ping and /admin/usage ──────────────────────────────────────────
       Anonymous usage: per app day, which installs opened the app, how many
       times, which areas, whether the evening was summarised, and the day
       each install was first seen. ONE KEY PER DAY (pd:<day>), merged, never
       a list() - the same reason as corrd above. Kept 120 days. */
    if (url.pathname === '/ping' && req.method === 'POST') {
      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const uid = String((b && b.uid) || '');
      if (!/^[0-9a-f]{24}$/.test(uid)) return json({ error: 'bad uid' }, 400);
      const day = String((b && b.day) || '');
      const dms = Date.parse(day + 'T12:00:00Z');
      if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(day) || !(Math.abs(dms - Date.now()) < 3 * 86400000)) return json({ error: 'bad day' }, 400);
      const first = /^\\d{4}-\\d{2}-\\d{2}$/.test(String(b.first || '')) ? b.first : day;
      const areas = (Array.isArray(b.a) ? b.a : []).map((x) => String(x).replace(/[^a-z]/g, '').slice(0, 16)).filter(Boolean).slice(0, 12);
      const key = 'pd:' + day;
      let rec = {};
      try { rec = JSON.parse((await env.SUBS.get(key)) || '{}') || {}; } catch { rec = {}; }
      if (!rec[uid] && Object.keys(rec).length >= 2000) return json({ ok: true, kept: false });
      const was = rec[uid] || {};
      rec[uid] = {
        o: Math.max(Number(was.o) || 0, Math.min(500, Number(b.o) || 0)),
        s: !!(was.s || b.s),
        a: Array.from(new Set([...(was.a || []), ...areas])),
        l: String(b.lang || '').slice(0, 8),
        f: first,
        d: b.dev === true,
      };
      await env.SUBS.put(key, JSON.stringify(rec), { expirationTtl: 120 * 86400 });
      return json({ ok: true });
    }
    if (url.pathname === '/admin/usage' && req.method === 'GET') {
      if (!adminOk(req, env)) return json({ error: 'not allowed' }, 401);
      const days = Math.max(1, Math.min(120, Number(url.searchParams.get('days')) || 14));
      const out = [];
      for (let i = 0; i <= days; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        const v = await env.SUBS.get('pd:' + d);
        if (v) { try { out.push({ day: d, ids: JSON.parse(v) }); } catch {} }
      }
      return json({ ok: true, days: out });
    }

` + a);
fs.writeFileSync(W, w);
console.log('worker patched');
