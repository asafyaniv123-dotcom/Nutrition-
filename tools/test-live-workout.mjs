/* Two things a live workout was getting wrong.
 *
 *   node tools/test-live-workout.mjs [path/to/index.html]
 *
 * 1. A SWITCH YOU MADE BY HAND SHOULD STICK. Inside a superset, logging a set
 *    on the second exercise sent the view back to the first. That is right
 *    when the sequence moved you and wrong when you tapped the tab: the app
 *    overruling a decision made on purpose. Nothing was ever misfiled, which
 *    is why it is infuriating rather than alarming, and why it survived a
 *    whole week of use as "annoying" rather than "broken".
 *
 * 2. LAST TIME HAS TO SURVIVE BEING TYPED OVER. The boxes already open holding
 *    last time's numbers, but that reference disappears the moment you type -
 *    which is exactly when you are deciding whether to add 2.5 - and after
 *    your first set today the box holds today's number anyway.
 *
 * Both are driven against a workout built in the page: logSet reads the real
 * inputs and moves the real cursor, and the reference line is rendered from a
 * real workout log. What is NOT covered: getting to that screen through the
 * app's own navigation.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8789;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'livewo-'));
if (!fs.existsSync(CHROME)) { console.log('SKIP: no Chrome at ' + CHROME); process.exit(0); }
const app = fs.readFileSync(process.argv[2] || path.join(ROOT, 'dev/index.html'), 'utf8');

const DRIVE = `<script>
setTimeout(function(){
  var R={};
  try{
    /* a real superset: two exercises sharing one group */
    var mk=function(n){return {name:n,sets:[],warm:[],targetReps:10,targetSets:3,ss:1};};
    _fitWorkout={name:'test',date:new Date().toISOString(),currentEx:0,
                 exercises:[mk('חתירה בכבל'),mk('לחיצת חזה')]};
    R.group=(typeof ssGroup==='function')?ssGroup(0):null;

    /* the inputs logSet reads, and a stand-in for everything it repaints */
    var host=document.createElement('div');
    host.innerHTML='<input id="fit-w" value="40"><input id="fit-r" value="10">'+
                   '<div id="fit-plates"></div>';
    document.body.appendChild(host);
    var realRender=window.renderFitness;
    window.renderFitness=function(){};      /* the screen is not what is under test */

    /* A: the SEQUENCE moves you - unchanged behaviour */
    _fitWorkout.currentEx=0;_fitPinned=false;
    logSet();
    R.afterFirst=_fitWorkout.currentEx;      /* expect 1: on to the partner */
    document.getElementById('fit-w').value='40';
    document.getElementById('fit-r').value='10';
    logSet();
    R.afterSecond=_fitWorkout.currentEx;     /* expect 0: back to the top */

    /* B: YOU move yourself - it must stick */
    _fitWorkout.exercises[0].sets=[];_fitWorkout.exercises[1].sets=[];
    fitGo(1);
    R.pinned=_fitPinned;
    document.getElementById('fit-w').value='50';
    document.getElementById('fit-r').value='8';
    logSet();
    R.afterPinnedLog=_fitWorkout.currentEx;  /* expect 1: stay where you put it */
    R.setsOn1=_fitWorkout.exercises[1].sets.length;
    R.setsOn0=_fitWorkout.exercises[0].sets.length;

    /* and the set is still filed on the exercise you were on */
    R.weightOn1=_fitWorkout.exercises[1].sets.length?_fitWorkout.exercises[1].sets[0].weight:null;

    /* C: last time, as a line that survives typing */
    var log=[{date:new Date(Date.now()-3*86400000).toISOString(),name:'test',
              exercises:[{name:'לחיצת חזה',sets:[{weight:60,reps:10},{weight:60,reps:8},{weight:55,reps:8}]}]}];
    localStorage.setItem('fit_log',JSON.stringify(log));
    R.lineEmpty=exLastLine({name:'אין כזה תרגיל',sets:[]});
    R.line0=exLastLine({name:'לחיצת חזה',sets:[]});
    R.line2=exLastLine({name:'לחיצת חזה',sets:[{},{}]});
    /* D: swapping when nothing is logged, and refusing when something is */
    _fitWorkout={name:'t',date:new Date().toISOString(),currentEx:0,
                 exercises:[mk('חתירה בכבל'),mk('לחיצת חזה'),mk('סקוואט')]};
    /* mk() hands every exercise ss:1, so the third has to be taken OUT of the
       group or removing one still leaves two in it - which is what the first
       run of this actually measured */
    _fitWorkout.exercises[0].ss=1;_fitWorkout.exercises[1].ss=1;_fitWorkout.exercises[2].ss=null;
    var picked=null;window.exPickInto=function(fn){picked=fn;};
    wxSwap(0);
    R.swapOpened=!!picked;
    if(picked)picked('לחיצת כתפיים');
    R.swappedName=_fitWorkout.exercises[0].name;
    _fitWorkout.exercises[0].sets=[{weight:40,reps:10}];
    picked=null;wxSwap(0);
    R.swapRefused=!picked;
    R.nameAfterRefuse=_fitWorkout.exercises[0].name;

    /* E: removing, and what it does to the group and the cursor */
    window.confirm=function(){return true;};
    _fitWorkout.currentEx=2;
    wxRemove(0);
    R.leftAfterRemove=_fitWorkout.exercises.length;
    R.cursorAfterRemove=_fitWorkout.currentEx;
    R.firstNow=_fitWorkout.exercises[0].name;
    R.loneSuper=_fitWorkout.exercises[0].ss;

    /* F: removing the LAST one steps the cursor back */
    _fitWorkout.currentEx=1;
    wxRemove(1);
    R.cursorAtEnd=_fitWorkout.currentEx;
    R.leftAtEnd=_fitWorkout.exercises.length;
    window.renderFitness=realRender;
  }catch(e){R.threw=String(e&&e.message||e);}
  fetch('/r',{method:'POST',body:JSON.stringify(R)});
},2200);
<\/script>`;

let got = null;
const server = http.createServer((req, res) => {
  const p = req.url.split('?')[0];
  if (p === '/r') {
    let b = '';
    req.on('data', (d) => { b += d; });
    req.on('end', () => { try { got = JSON.parse(b); } catch { got = null; } res.writeHead(200); res.end('ok'); });
    return;
  }
  if (p === '/dev/w.html') {
    const at = app.lastIndexOf('</body>');
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(app.slice(0, at) + DRIVE + app.slice(at));
  }
  const f = path.resolve(ROOT, '.' + (p.endsWith('/') ? p + 'index.html' : p));
  if (!f.startsWith(path.resolve(ROOT))) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end('no'); } res.writeHead(200); res.end(d); });
});
await new Promise((r) => server.listen(PORT, r));
await new Promise((resolve) => {
  const c = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--virtual-time-budget=16000', '--user-data-dir=' + TMP, '--dump-dom',
    'http://localhost:' + PORT + '/dev/w.html'], { stdio: 'ignore' });
  const t = setTimeout(() => { c.kill(); resolve(); }, 120000);
  c.on('exit', () => { clearTimeout(t); resolve(); });
});
server.close();
fs.rmSync(TMP, { recursive: true, force: true });
if (!got) { console.log('FAIL: the page never answered'); process.exit(1); }
if (got.threw) { console.log('FAIL: the page threw: ' + got.threw); process.exit(1); }

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

console.log('the superset still walks itself');
ok(Array.isArray(got.group) && got.group.length === 2, 'the two exercises are one group');
ok(got.afterFirst === 1, 'a set on the first sends you to its partner (got ' + got.afterFirst + ')');
ok(got.afterSecond === 0, 'and a set on the partner walks back to the top (got ' + got.afterSecond + ')');

console.log('');
console.log('but a tab you tapped sticks');
ok(got.pinned === true, 'tapping a tab is remembered as yours');
ok(got.afterPinnedLog === 1, 'and logging there LEAVES you there (got ' + got.afterPinnedLog + ')');
ok(got.setsOn1 === 1 && got.setsOn0 === 0, 'with the set filed on that exercise, not the other');
ok(got.weightOn1 === 50, 'and it is the set you actually entered (got ' + got.weightOn1 + ')');

console.log('');
console.log('');
console.log('swapping, and refusing to swap');
ok(got.swapOpened===true,'swapping an empty exercise opens the picker');
ok(got.swappedName==='לחיצת כתפיים','and the name changes (got '+got.swappedName+')');
ok(got.swapRefused===true,'an exercise with sets in it refuses the swap');
ok(got.nameAfterRefuse==='לחיצת כתפיים','and keeps its name (got '+got.nameAfterRefuse+')');

console.log('');
console.log('removing');
ok(got.leftAfterRemove===2,'the exercise goes (got '+got.leftAfterRemove+' left)');
ok(got.cursorAfterRemove===1,'the cursor follows what you were standing on (got '+got.cursorAfterRemove+')');
ok(got.loneSuper===null,'and a superset left with one member is dissolved (got '+JSON.stringify(got.loneSuper)+')');
ok(got.cursorAtEnd===0,'removing the last one steps back rather than off the end (got '+got.cursorAtEnd+')');
ok(got.leftAtEnd===1,'with one left (got '+got.leftAtEnd+')');

console.log('last time, as a line rather than a prefill');
ok(got.lineEmpty === '', 'an exercise you have never done says nothing at all');
ok(/60/.test(got.line0 || ''), 'the first set is compared with last time\'s first (got ' + (got.line0 || '').replace(/<[^>]*>/g, '') + ')');
ok(/55/.test(got.line2 || ''), 'the third with last time\'s third (got ' + (got.line2 || '').replace(/<[^>]*>/g, '') + ')');
ok(/10.*8.*8|10&middot;8|10\u00b78/.test((got.line0 || '').replace(/<[^>]*>/g, '')),
   'and the whole set list is there beside it');

console.log('');
if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); }
console.log('the sequence walks, your own tap sticks, and last time stays put');
