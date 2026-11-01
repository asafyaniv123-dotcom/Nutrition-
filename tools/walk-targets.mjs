/* The nutrition setup and the targets, walked the way a person walks them.
 *
 *   node tools/walk-targets.mjs [--out dir]
 *
 * Headless Chrome at 390x844 over the DevTools protocol, the repo served
 * locally, dev/ opened at ?go=nutrition (the area's own deep link). Every
 * answer is a real touch on the real button; the wheels are turned with a
 * real mouse wheel over the column, never by setting a value. Five people:
 *
 *   new-he   a man, 25, 173 cm, 68 kg, part of the day on the move, a
 *            regular cut, goal weight 63 kg: the result must say 2,460 and
 *            2,090, protein 150 g, about 15 weeks
 *   new-en   the same man in English with imperial units (5'8", 150 lb)
 *   teen     16 years old: the goal question offers maintaining only, and says why
 *   existing a profile from before 1 Nov (activity 4, a stored 2,705): asked only
 *            the day type, shown "we've updated your targets" with the old
 *            figure, approves, and is never shown it again
 *   nosex    a profile with everything but sex: asked only that
 *
 * Stored shapes are copied from the writers (profSet/profNum write profile_v1,
 * targetsAutoApply writes targets_v1, asetMark writes area_setup_seen).
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const A = process.argv.slice(2), arg = (k, d) => (A.includes(k) ? A[A.indexOf(k) + 1] : d);
const OUT = path.resolve(arg('--out', '.impeccable/mocks/targets'));
const PORT = 8798, DBG = 9338;
fs.mkdirSync(OUT, { recursive: true });
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const file = path.resolve(ROOT, '.' + (p.endsWith('/') ? p + 'index.html' : p));
  if (!file.startsWith(path.resolve(ROOT))) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }); res.end(data); });
});
await new Promise((r) => server.listen(PORT, r));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'walk-targets-'));
const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', '--remote-debugging-port=' + DBG, '--user-data-dir=' + TMP,
  '--hide-scrollbars', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) { await sleep(200);
  try { target = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pending = new Map(); const threw = [];
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') threw.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]); });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (x) => { const r = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300)); return r.result?.result?.value; };
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true });

const fails = [];
const ok = (c, what) => { console.log((c ? '  ok   ' : '  FAIL ') + what); if (!c) fails.push(what); };
let dir = OUT, n = 0;
async function shot(name) { await sleep(300); const a = await send('Page.captureScreenshot', { format: 'png' });
  const f = path.join(dir, String(++n).padStart(2, '0') + '-' + name + '.png'); fs.writeFileSync(f, Buffer.from(a.result.data, 'base64')); return f; }
/* the whole overlay, scrolled: the result screen is taller than the phone */
async function shotFull(name) {
  const h = await ev(`(function(){var o=document.getElementById('as-ov');return o?Math.ceil(o.scrollHeight):844;})()`);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: Math.max(844, h), deviceScaleFactor: 2, mobile: true });
  await sleep(400); const f = await shot(name);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await sleep(200); return f;
}
async function tap(sel, i = 0) {
  const r = await ev(`(function(){var e=document.querySelectorAll(${JSON.stringify(sel)})[${i}];if(!e)return null;e.scrollIntoView({block:'center'});
    var b=e.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,t=document.elementFromPoint(x,y);
    return {x:x,y:y,hit:!!t&&(t===e||e.contains(t)),under:t&&(t.id||t.className||t.tagName)};})()`);
  if (!r) { ok(false, 'there is a ' + sel + '[' + i + ']'); return false; }
  if (!r.hit) { ok(false, sel + ' is under the finger (found ' + r.under + ')'); return false; }
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(350);
  return true;
}
/* turn a wheel column with the mouse wheel until the row reading `want` is in the window */
async function wheelTo(id, want) {
  for (let tries = 0; tries < 6; tries++) {
    const st = await ev(`(function(){var c=document.getElementById(${JSON.stringify(id)});if(!c)return null;var r=[].map.call(c.children,function(d){return d.textContent;});
      var b=c.getBoundingClientRect();return {k:Math.round(c.scrollTop/60),want:r.indexOf(${JSON.stringify(want)}),x:b.left+b.width/2,y:b.top+b.height/2};})()`);
    if (!st || st.want < 0) { ok(false, 'the wheel ' + id + ' has a row ' + want); return false; }
    if (st.k === st.want) return true;
    await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: st.x, y: st.y, deltaX: 0, deltaY: (st.want - st.k) * 60 });
    await sleep(700);
  }
  ok(false, 'the wheel ' + id + ' reached ' + want); return false;
}
const step = () => ev(`_aset?asetKey():'closed'`);
const seed = (lang, items, tag) => send('Page.addScriptToEvaluateOnNewDocument', { source: `(function(){try{
  if(sessionStorage.getItem('__s'+${JSON.stringify(tag)}))return;sessionStorage.setItem('__s'+${JSON.stringify(tag)},'1');localStorage.clear();
  var o=${JSON.stringify(Object.assign({ app_onboarded: '1', greet_name: 'Noam', app_lang: lang }, items))};
  for(var k in o)localStorage.setItem(k,o[k]);}catch(e){}})();` });
let seedId = null;
async function open(lang, items, sub) {
  dir = path.join(OUT, sub); fs.mkdirSync(dir, { recursive: true }); n = 0;
  if (seedId) await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: seedId });
  await send('Page.navigate', { url: 'about:blank' }); await sleep(200);
  await send('Storage.clearDataForOrigin', { origin: `http://localhost:${PORT}`, storageTypes: 'all' });
  seedId = (await seed(lang, items, sub)).result.identifier;
  await send('Page.navigate', { url: `http://localhost:${PORT}/dev/?go=nutrition` });
  /* the splash covers everything for its first three seconds */
  await sleep(500); await waitFor(`document.readyState==='complete'&&!document.getElementById('splash')`, 8000);
}
const waitFor = async (x, ms = 9000) => { for (let t = 0; t < ms; t += 150) { try { if (await ev(x)) return true; } catch {} await sleep(150); } return false; };
const text = (sel) => ev(`(document.querySelector(${JSON.stringify(sel)})||{}).textContent||''`);
const Y = new Date().getFullYear();

async function walkNew(lang, imperial) {
  console.log('\n' + (lang === 'he' ? 'new-he' : 'new-en') + ': a new man, 25, through every question');
  await open(lang, imperial ? { app_units: 'imperial', app_locale: 'en-US' } : {}, 'new-' + lang);
  ok(await waitFor(`!!document.querySelector('#as-ov .as-go')`), 'the setup opens on the first visit');
  await sleep(900); await shot('welcome');
  await tap('.as-go'); ok(await step() === 'sex', 'then: sex'); await shot('sex');
  await tap('.as-o', 0); await tap('.as-go');
  ok(await step() === 'birth', 'a man is not asked about pregnancy: birth year next'); await shot('birth');
  await wheelTo('as-by-0', String(Y - 25));
  ok(/25/.test(await text('#as-by-age')), 'the wheel says the age as it turns (' + await text('#as-by-age') + ')');
  await tap('.as-go'); ok(await step() === 'height', 'height');
  if (imperial) { await wheelTo('as-h-0', '5'); await wheelTo('as-h-1', '8'); } else await wheelTo('as-h-0', '173');
  await shot('height'); await tap('.as-go'); ok(await step() === 'weight', 'weight');
  if (imperial) await wheelTo('as-w-0', '150'); else await wheelTo('as-w-0', await ev(`nfmt(68,{minimumFractionDigits:1,maximumFractionDigits:1})`));
  await shot('weight'); await tap('.as-go'); ok(await step() === 'day', 'a regular day, without workouts');
  await shot('day'); await tap('.as-o', 1); await tap('.as-go');
  ok(await step() === 'goal', 'the goal'); ok(await ev(`document.querySelectorAll('.as-o').length`) === 3, 'three goals offered to an adult');
  await shot('goal'); await tap('.as-o', 0); await tap('.as-go');
  ok(await step() === 'pace', 'the pace of a cut');
  ok(await ev(`document.querySelectorAll('.as-o')[1].classList.contains('on')`), 'regular is chosen already');
  const sub = await ev(`document.querySelectorAll('.as-o')[1].querySelector('span').textContent`);
  ok(/0[.,]3|0[.,]7/.test(sub), 'each pace says its kilos a week (' + sub + ')');
  await shot('pace'); await tap('.as-go');
  ok(await step() === 'tw', 'a goal weight, optional');
  /* a goal weight under BMI 18.5 first: refused, gently */
  if (imperial) await wheelTo('as-tw-0', '115'); else await wheelTo('as-tw-0', await ev(`nfmt(52,{minimumFractionDigits:1,maximumFractionDigits:1})`));
  await tap('.as-go');
  ok(await step() === 'tw' && !!(await ev(`!!document.querySelector('.nq-err')`)), 'a goal weight under BMI 18.5 is not accepted, and it says why');
  await shot('tw-refused');
  if (imperial) await wheelTo('as-tw-0', '139'); else await wheelTo('as-tw-0', await ev(`nfmt(63,{minimumFractionDigits:1,maximumFractionDigits:1})`));
  await tap('.as-go'); ok(await step() === 'train', 'workouts a week');
  await shot('train'); await tap('.as-o', 3); await tap('.as-go');
  if (await step() === 'health') { await tap('.as-o', 1); await tap('.as-go'); }
  ok(await waitFor(`!!document.querySelector('.asg-kc b')`), 'the result screen');
  await sleep(1600);
  const kc = await text('.asg-kc b'), why = await text('.nq-why'), more = await text('.nq-more');
  const want = (n) => ev(`nfmt(${n})`);
  ok(kc === await want(2090), 'the target, large: ' + kc);
  ok(why.includes(await want(2460)) && why.includes(await want(2090)), 'the calculation in words: ' + why);
  ok(await ev(`[].some.call(document.querySelectorAll('.asg-tb b'),function(b){return b.textContent.indexOf(nfmt(150))===0;})`), 'protein 150 g');
  ok(/15/.test(more), 'about 15 weeks to the goal weight: ' + more);
  const f = await shotFull('result'); console.log('       ' + f);
  await tap('.as-go');
  const st = await ev(`(function(){var p=loadProfile();return {open:!!document.getElementById('as-ov'),kcal:TARGETS.kcal,p:TARGETS.p,auto:p.tgAuto,day:p.dayType,goal:p.goal,pace:p.pace,by:p.birthYear,h:p.height,w:p.weight,tw:weighCfg().goal,train:p.trainWeek,wk:weighPoints().length};})()`);
  ok(!st.open && st.kcal === 2090 && st.p === 150 && st.auto === true, 'started: the targets are in force (' + JSON.stringify(st) + ')');
  await sleep(600); await shot('nutrition');
  /* and the bonus is still added on top of it, once */
  const tt = await ev(`(function(){var d=todayStr(),a=actLoad(d);a.strength=true;actSave(d,a);var T=tgtOn(d);return {base:TARGETS.kcal,day:T.kcal,bonus:T.bonus};})()`);
  ok(tt.day === tt.base + tt.bonus && tt.bonus === 200, 'a strength workout adds 200 on top of the target, once (' + JSON.stringify(tt) + ')');
}

async function walkTeen() {
  console.log('\nteen: 16 years old');
  await open('he', {}, 'teen');
  ok(await waitFor(`!!document.querySelector('#as-ov .as-go')`), 'the setup opens');
  await sleep(700); await tap('.as-go'); await tap('.as-o', 1); await tap('.as-go');
  ok(await step() === 'preg', 'a woman is asked about pregnancy or breastfeeding');
  await tap('.as-o', 1); await tap('.as-go');
  await wheelTo('as-by-0', String(Y - 16)); await tap('.as-go');
  await wheelTo('as-h-0', '165'); await tap('.as-go');
  await wheelTo('as-w-0', await ev(`nfmt(55,{minimumFractionDigits:1,maximumFractionDigits:1})`)); await tap('.as-go');
  await tap('.as-o', 0); await tap('.as-go');
  ok(await step() === 'goal', 'the goal');
  const labels = await ev(`[].map.call(document.querySelectorAll('.as-o b'),function(b){return b.textContent;})`);
  ok(labels.length === 1 && labels[0] === 'שמירה על המשקל', 'a cut is not offered at all, only maintaining (' + labels.join(' | ') + ')');
  ok(/18/.test(await text('.dr-w2')), 'with a gentle reason: ' + await text('.dr-w2'));
  await shot('goal');
}

async function walkExisting() {
  console.log('\nexisting: a profile from before 1 Nov');
  const prof = { sex: 'm', birth: (Y - 25) + '-03-10', height: 173, weight: 68, activity: 4, goal: 'lose', updatedAt: '2026-10-20T10:00:00.000Z' };
  await open('he', { profile_v1: JSON.stringify(prof), targets_v1: JSON.stringify({ kcal: 2705, p: 140, c: 340, f: 75, water: 2400 }),
    area_setup_seen: JSON.stringify({ nutrition: 1, health: 1 }), app_gender: 'm' }, 'existing');
  ok(await waitFor(`!!document.querySelector('#as-ov .as-go')`), 'the update opens on entering nutrition');
  await sleep(700);
  const s = await ev(`({k:asetKey(),steps:_aset.steps.filter(function(x){return !asetSkip(x);}),upd:_aset.upd})`);
  ok(s.upd && s.k === 'day' && s.steps.join() === 'day', 'asked only what the profile lacks: ' + s.steps.join());
  await shot('day'); await tap('.as-o', 1); await tap('.as-go');
  ok(await waitFor(`!!document.querySelector('.asg-kc b')`), 'then the update screen');
  await sleep(1500);
  ok((await text('.dr-q2')) === 'עדכנו את היעדים שלך', 'titled "' + await text('.dr-q2') + '"');
  const why = await text('.nq-why');
  ok(why.includes(await ev(`nfmt(2705)`)), 'it says what the target was: ' + why);
  ok(await ev(`TARGETS.kcal`) === 2705, 'and nothing has changed before the approval');
  const f = await shotFull('update'); console.log('       ' + f);
  await tap('.as-go');
  ok(await ev(`!document.getElementById('as-ov')&&TARGETS.kcal===2090&&loadProfile().tgAuto===true&&loadProfile().activity===4`), 'approved: 2,090, following her, the old answers kept');
  await send('Page.navigate', { url: `http://localhost:${PORT}/dev/?go=nutrition` });
  await sleep(4000);
  ok(await ev(`!document.getElementById('as-ov')`), 'and the next visit does not show it again');
  /* the profile tab carries the same breakdown, and the goal and pace */
  await ev(`switchTab('profile')`); await sleep(800);
  ok(await ev(`!!document.querySelector('.pf .nq-why')&&document.querySelector('.pf .nq-why').textContent.indexOf(nfmt(2090))>=0`), 'the personal tab shows the same calculation');
  await ev(`document.querySelector('.pf .nq-why').scrollIntoView({block:'center'})`); await shot('profile');
  const paces = await ev(`[].filter.call(document.querySelectorAll('.pf .wg-chip'),function(b){return /קצב/.test(b.textContent);}).length`);
  ok(paces === 3, 'with the pace to change (' + paces + ' chips)');
  await ev(`[].filter.call(document.querySelectorAll('.pf .wg-chip'),function(b){return b.textContent==='קצב עדין';})[0].scrollIntoView({block:'center'})`);
  await tap('.pf .wg-chip', await ev(`[].findIndex.call(document.querySelectorAll('.pf .wg-chip'),function(b){return b.textContent==='קצב עדין';})`));
  await sleep(500);
  ok(await ev(`TARGETS.kcal`) === 2220, 'a gentle pace moves the target at once (' + await ev(`TARGETS.kcal`) + ')');
}

async function walkNoSex() {
  console.log('\nnosex: everything but sex');
  const prof = { birth: (Y - 30) + '-05-01', height: 165, weight: 65, activity: 2, dayType: 'sit', goal: 'lose', updatedAt: '2026-10-20T10:00:00.000Z' };
  await open('he', { profile_v1: JSON.stringify(prof), targets_v1: JSON.stringify({ kcal: 1975, p: 155, c: 200, f: 60, water: 3000 }),
    area_setup_seen: JSON.stringify({ nutrition: 1, health: 1 }) }, 'nosex');
  ok(await waitFor(`!!document.querySelector('#as-ov .as-go')`), 'the update opens');
  await sleep(700);
  const s = await ev(`({k:asetKey(),shown:_aset.steps.filter(function(x){return !asetSkip(x);})})`);
  ok(s.k === 'sex' && s.shown.join() === 'sex', 'asked only for sex: ' + s.shown.join());
  await shot('sex'); await tap('.as-o', 0); await tap('.as-go');
  ok(await waitFor(`!!document.querySelector('.asg-kc b')`), 'then the update screen');
  await sleep(1300); await shotFull('update');
  await tap('.as-go');
  ok(await ev(`loadProfile().sex==='m'&&TARGETS.kcal>0&&loadProfile().tgAuto===true`), 'saved and approved (' + await ev(`TARGETS.kcal`) + ' kcal)');
}

try {
  await walkNew('he', false);
  await walkNew('en', true);
  await walkTeen();
  await walkExisting();
  await walkNoSex();
} catch (e) { ok(false, 'the walk itself: ' + e.message); }
if (threw.length) ok(false, 'the page threw: ' + [...new Set(threw)].join(' | '));
console.log('\n' + (fails.length ? fails.length + ' FAILED' : 'all ok') + '  ->  ' + OUT);
chrome.kill(); server.close(); process.exit(fails.length ? 1 : 0);
