/* A run, logged - and kept out of the number it would have corrupted.
 *
 *   node tools/test-cardio.mjs [path/to/index.html]
 *
 * The cardio note is blunt about the trap: "logging a run as a set with
 * kilometres in the weight box and minutes in the reps box feeds now.vol,
 * which is weight x reps - the volume number the whole fitness screen is built
 * around. Recording a run that way would corrupt the strength trend."
 *
 * So the claim under test is not that the boxes work. It is that a logged run
 * is INVISIBLE to fitWeekStats - no volume, no set count, no reps, and nothing
 * in the sets-per-muscle band - while a strength set logged in the same
 * session is counted exactly as it was before. That is asserted against the
 * shipped fitWeekStats, not against a copy of it.
 *
 * What is NOT covered: the weekly kilometres chart, which does not exist yet.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8794;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cardio-'));
if (!fs.existsSync(CHROME)) { console.log('SKIP: no Chrome at ' + CHROME); process.exit(0); }
const app = fs.readFileSync(process.argv[2] || path.join(ROOT, 'dev/index.html'), 'utf8');

const DRIVE = `<script>
/* The library is FETCHED, so wait for it the way the app does - exLoad
   redraws the fitness screen itself when it lands, which is why a run
   drawn a moment too early corrects itself rather than staying wrong. */
setTimeout(function(){exLoad(function(){
  var R={};
  try{
    var u0=APP_UNITS;APP_UNITS='metric';
    R.libSize=exAll().length;
    R.runIsCardio=isCardioEx('ריצה');
    R.pressIsNot=isCardioEx('לחיצת חזה');
    R.unknownIsNot=isCardioEx('משהו שהקלדתי');

    var mk=function(n){return {name:n,sets:[],warm:[],targetReps:10,targetSets:3,ss:null};};
    _fitWorkout={name:'t',date:new Date().toISOString(),currentEx:0,
                 exercises:[mk('ריצה'),mk('לחיצת חזה')]};
    var host=document.createElement('div');
    document.body.appendChild(host);
    var realRender=window.renderFitness;window.renderFitness=function(){};

    /* ── a run: 5.2 km in 27 minutes ── */
    host.innerHTML='<input id="fit-mins" value="27"><input id="fit-dist" value="5.2">';
    logCardio();
    var row=_fitWorkout.exercises[0].sets[0];
    R.row=row;
    R.noWeight=!('weight' in row);
    R.noReps=!('reps' in row);
    R.rowHTML=cardioRowHTML(row);

    /* ── duration alone is enough: burpees have no distance ── */
    _fitWorkout.currentEx=0;
    host.innerHTML='<input id="fit-mins" value="8"><input id="fit-dist" value="">';
    logCardio();
    R.minsOnly=_fitWorkout.exercises[0].sets[1];
    R.minsOnlyHTML=cardioRowHTML(R.minsOnly);

    /* ── and neither is not an entry ── */
    host.innerHTML='<input id="fit-mins" value=""><input id="fit-dist" value="">';
    logCardio();
    R.refusedEmpty=_fitWorkout.exercises[0].sets.length;   /* still 2 */

    /* ── a real strength set beside it, through the real logSet ── */
    _fitWorkout.currentEx=1;_fitPinned=true;
    host.innerHTML='<input id="fit-w" value="60"><input id="fit-r" value="10"><div id="fit-plates"></div>';
    logSet();
    R.strengthSets=_fitWorkout.exercises[1].sets.length;

    /* ── now hand the whole session to the shipped aggregator ── */
    var entry={date:new Date().toISOString(),name:'t',duration:45,
               exercises:JSON.parse(JSON.stringify(_fitWorkout.exercises))};
    localStorage.setItem('fit_log',JSON.stringify([entry]));
    var wk=fitWeekStats(0);
    R.vol=wk.vol;                 /* 60 x 10 = 600, and not a metre more */
    R.sets=wk.sets;               /* 1, the bench press */
    R.reps=wk.reps;               /* 10 */
    R.byMuscle=wk.byMuscle;       /* no אירובי key at all */
    R.hasCardioBand=Object.keys(wk.byMuscle).indexOf('אירובי')>=0;

    /* ── the same session with the run logged the WRONG way, to show what
           this is protecting: km in the weight box, minutes in the reps box ── */
    var bad=JSON.parse(JSON.stringify(entry));
    bad.exercises[0].sets=[{weight:5.2,reps:27}];
    localStorage.setItem('fit_log',JSON.stringify([bad]));
    var wkBad=fitWeekStats(0);
    R.badVol=wkBad.vol;
    R.badSets=wkBad.sets;
    R.badCardioBand=Object.keys(wkBad.byMuscle).indexOf('אירובי')>=0;

    /* ── a whole week of cardio, mixed on purpose ── */
    var day=function(back){var d=new Date();d.setDate(d.getDate()-back);return d.toISOString();};
    var run=function(m,mins){return {name:'ריצה',sets:[{dist:m,mins:mins}],warm:[]};};
    var swim=function(m,mins){return {name:'שחייה',sets:[{dist:m,mins:mins}],warm:[]};};
    var bench=function(){return {name:'לחיצת חזה',sets:[{weight:60,reps:10}],warm:[]};};
    /* Today and yesterday are in this week whatever day it is; a run seven
       days back is not, and that is what makes the comparison a comparison. */
    localStorage.setItem('fit_log',JSON.stringify([
      {date:day(0),name:'a',duration:30,exercises:[run(5000,25),bench()]},
      {date:day(1),name:'b',duration:40,exercises:[run(8000,44),swim(1500,35)]}
    ]));
    var w2=fitWeekStats(0);
    R.ckeys=Object.keys(w2.cardio).sort();
    R.runDist=w2.cardio['ריצה']&&w2.cardio['ריצה'].dist;
    R.runMins=w2.cardio['ריצה']&&w2.cardio['ריצה'].mins;
    R.runN=w2.cardio['ריצה']&&w2.cardio['ריצה'].n;
    R.swimDist=w2.cardio['שחייה']&&w2.cardio['שחייה'].dist;
    R.noBench='לחיצת חזה' in w2.cardio;
    R.noTotal=('total' in w2.cardio)||('dist' in w2.cardio);
    /* and the exclusion, re-asserted against the code that now walks these
       rows rather than skipping them outright */
    R.wkVol=w2.vol;
    R.wkSets=w2.sets;
    R.wkReps=w2.reps;
    R.wkBand=Object.keys(w2.byMuscle).indexOf('אירובי')>=0;

    APP_UNITS=u0;window.renderFitness=realRender;
  }catch(e){R.threw=String(e&&e.message||e);}
  fetch('/r',{method:'POST',body:JSON.stringify(R)});
});},1800);
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
  if (p === '/dev/c.html') {
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
    '--virtual-time-budget=18000', '--user-data-dir=' + TMP, '--dump-dom',
    'http://localhost:' + PORT + '/dev/c.html'], { stdio: 'ignore' });
  const t = setTimeout(() => { c.kill(); resolve(); }, 120000);
  c.on('exit', () => { clearTimeout(t); resolve(); });
});
server.close();
fs.rmSync(TMP, { recursive: true, force: true });
if (!got) { console.log('FAIL: the page never answered'); process.exit(1); }
if (got.threw) { console.log('FAIL: the page threw: ' + got.threw); process.exit(1); }

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

console.log('which exercises are a run');
ok(got.libSize > 200, 'the library is loaded (' + got.libSize + ' exercises)');
ok(got.runIsCardio === true, 'ריצה is cardio');
ok(got.pressIsNot === false, 'לחיצת חזה is not');
ok(got.unknownIsNot === false, 'and a name typed by hand is not - the app cannot know it is a run');

console.log('');
console.log('what a logged run actually holds');
ok(got.row && got.row.mins === 27, 'the minutes (got ' + JSON.stringify(got.row) + ')');
ok(got.row && got.row.dist === 5200, '5.2 km stored as 5,200 metres (got ' + (got.row || {}).dist + ')');
ok(got.noWeight, 'NO weight field - the one that would reach now.vol');
ok(got.noReps, 'NO reps field - the other one');
ok(/5\.2/.test(got.rowHTML) && /27/.test(got.rowHTML) && /5:12/.test(got.rowHTML),
   'and the row reads distance, minutes and pace (got ' + got.rowHTML + ')');

console.log('');
console.log('either half alone is an entry, neither is not');
ok(got.minsOnly && got.minsOnly.mins === 8 && !('dist' in got.minsOnly),
   'eight minutes of burpees, no distance asked for (got ' + JSON.stringify(got.minsOnly) + ')');
ok(!/\//.test(got.minsOnlyHTML), 'and no pace, because there is nothing to divide (got ' + got.minsOnlyHTML + ')');
ok(got.refusedEmpty === 2, 'two empty boxes add nothing (got ' + got.refusedEmpty + ' rows)');

console.log('');
console.log('and the aggregate the note was worried about');
ok(got.strengthSets === 1, 'the bench set was logged normally (got ' + got.strengthSets + ')');
ok(got.vol === 600, 'volume is 60x10 and not a metre more (got ' + got.vol + ')');
ok(got.sets === 1, 'one set counted, not three (got ' + got.sets + ')');
ok(got.reps === 10, 'ten reps, not thirty-five (got ' + got.reps + ')');
ok(got.hasCardioBand === false, 'and אירובי never appears in the sets-per-muscle band');

console.log('');
console.log('which is worth something only because the wrong way really does break it');
ok(got.badVol === 740, 'km in the weight box makes volume 600+140 (got ' + got.badVol + ')');
ok(got.badSets === 2, 'and the run counts as a set (got ' + got.badSets + ')');
ok(got.badCardioBand === true, 'and lands in the muscle band it does not belong to');

console.log('');
console.log("the week's cardio, gathered per exercise and never across them");
ok(JSON.stringify(got.ckeys) === JSON.stringify(['ריצה', 'שחייה']),
   'two exercises, kept apart (got ' + JSON.stringify(got.ckeys) + ')');
ok(got.runDist === 13000 && got.runMins === 69 && got.runN === 2,
   'the two runs add up: 13 km in 69 minutes (got ' + got.runDist + 'm / ' + got.runMins + 'min)');
ok(got.swimDist === 1500, 'and the swim stays its own 1,500 m (got ' + got.swimDist + ')');
ok(got.noBench === false, 'the bench press is not in here');
ok(got.noTotal === false, 'and there is NO combined total - a swum kilometre is not a cycled one');

console.log('');
console.log('while the exclusion still holds, against the code that now walks these rows');
ok(got.wkVol === 600, 'volume is still only the bench (got ' + got.wkVol + ')');
ok(got.wkSets === 1, 'one set (got ' + got.wkSets + ')');
ok(got.wkReps === 10, 'ten reps (got ' + got.wkReps + ')');
ok(got.wkBand === false, 'and אירובי is still absent from the muscle band');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('a run is recorded, and the strength numbers never hear about it');
