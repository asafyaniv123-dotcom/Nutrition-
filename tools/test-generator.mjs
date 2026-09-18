/* The workout generator's selection half, driven in the page.
 *
 *   node tools/test-generator.mjs [path/to/index.html]
 *
 * The note that specified this names one trap by hand: "Sets per muscle
 * should be the band MINUS what is already logged this week, or a Thursday
 * session will prescribe a full week's volume on top of a full week's work."
 * So the assertions that matter are the ones that log a week of work first
 * and then check what the generator asks for on top of it.
 *
 * The other half is the equipment filter, which is what makes "not in a gym"
 * work: with nothing but a mat and your own weight, every exercise that comes
 * back has to be doable with exactly that, and a muscle with nothing
 * available has to SAY so rather than quietly vanish from the session.
 *
 * What is NOT covered: any screen. Nothing calls this yet, by design.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8797;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-'));
if (!fs.existsSync(CHROME)) { console.log('SKIP: no Chrome at ' + CHROME); process.exit(0); }
const app = fs.readFileSync(process.argv[2] || path.join(ROOT, 'dev/index.html'), 'utf8');

const DRIVE = `<script>
setTimeout(function(){exLoad(function(){
  var R={};
  try{
    R.lib=exAll().length;

    /* ── the groups the band covers ── */
    var gs=bandGroups();
    R.groups=gs.length;
    R.noCardio=gs.indexOf('אירובי')<0;
    R.noOther=gs.indexOf('אחר')<0;
    R.hasChest=gs.indexOf('חזה')>=0;

    /* ── an empty week: everything is short by the whole floor ── */
    localStorage.setItem('fit_log','[]');
    var d0=fitDeficit();
    R.emptyAllShort=d0.every(function(x){return x.short===SETS_BAND.lo&&x.done===0;});

    /* ── a week with real work in it ── */
    var day=function(b){var d=new Date();d.setDate(d.getDate()-b);return d.toISOString();};
    var press=[],row=[];
    for(var i=0;i<12;i++)press.push({weight:60,reps:10});   /* 12 sets of chest */
    for(var i=0;i<4;i++)row.push({weight:50,reps:10});      /* 4 sets of back  */
    localStorage.setItem('fit_log',JSON.stringify([
      {date:day(0),name:'a',duration:50,exercises:[
        {name:'לחיצת חזה במוט',sets:press,warm:[]},
        {name:'חתירה במוט',sets:row,warm:[]}]}
    ]));
    var d1=fitDeficit(),by={};
    for(var i=0;i<d1.length;i++)by[d1[i].m]=d1[i];
    R.chestDone=by['חזה']&&by['חזה'].done;
    R.chestShort=by['חזה']&&by['חזה'].short;   /* 12 done, floor 10 -> 0 */
    R.backDone=by['גב']&&by['גב'].done;
    R.backShort=by['גב']&&by['גב'].short;      /* 4 done, floor 10 -> 6 */
    R.firstIsUntouched=d1[0].done===0;         /* furthest behind first */
    R.lastIsChest=d1[d1.length-1].m;

    /* ── the selection, in a gym ── */
    var GYM=['מוט','משקולות יד','מכונה','פולי','ספסל','מתח','משקל גוף','מזרן','פלטה','סמית׳','מוט EZ','מדרגה','גומייה'];
    var rows=genPick({muscles:['גב','חזה'],equip:GYM,sets:{'גב':6,'חזה':0}});
    R.skipsZero=rows.every(function(r){return r.m!=='חזה';});   /* nothing asked of chest */
    R.backRows=rows.filter(function(r){return r.m==='גב';}).length;
    R.backSets=rows.reduce(function(a,r){return a+(r.sets||0);},0);
    R.backFirst=rows[0]&&rows[0].name;          /* the primary movement, by id */

    /* ── emphasis adds work rather than replacing it ── */
    var plain=genPick({muscles:['חזה'],equip:GYM,sets:{'חזה':6}});
    var emph=genPick({muscles:['חזה'],equip:GYM,sets:{'חזה':6},emphasis:'חזה'});
    R.plainSets=plain.reduce(function(a,r){return a+(r.sets||0);},0);
    R.emphSets=emph.reduce(function(a,r){return a+(r.sets||0);},0);

    /* ── not in a gym: a mat and your own weight ── */
    var HOME=['משקל גוף','מזרן'];
    var home=genPick({muscles:['חזה','בטן','ירך אחורית','גב רחב'],equip:HOME,
                      sets:{'חזה':6,'בטן':6,'ירך אחורית':6,'גב רחב':6}});
    R.homeNames=home.filter(function(r){return r.name;}).map(function(r){return r.name;});
    /* every one that came back must need nothing but what was offered */
    var all=exAll(),byName={};
    for(var i=0;i<all.length;i++)byName[all[i].n]=all[i];
    R.homeAllDoable=R.homeNames.every(function(n){
      return (byName[n].q||[]).every(function(q){return HOME.indexOf(q)>=0;});
    });
    /* and a muscle with nothing available says so */
    R.homeNone=home.filter(function(r){return r.none;}).map(function(r){return r.m;});

    /* ── a muscle name that does not survive the rollup ──
       גב רחב folds into גב, so asking for it by name has to reach the same
       exercises rather than coming back as "nothing available". */
    var folded=genPick({muscles:['גב רחב'],equip:GYM,sets:{'גב רחב':6}});
    R.foldedNone=folded.some(function(r){return r.none;});
    R.foldedSets=folded.reduce(function(a,r){return a+(r.sets||0);},0);
    R.foldedNames=folded.filter(function(r){return r.name;}).map(function(r){return r.name;});
    var both=genPick({muscles:['גב','גב רחב'],equip:GYM,sets:{'גב':6}});
    R.bothCount=both.filter(function(r){return r.name;}).length;

    /* ── no exercise appears twice in one session ── */
    var many=genPick({muscles:['גב','גב רחב','טרפז'],equip:GYM,
                      sets:{'גב':9,'גב רחב':9,'טרפז':9}});
    var names=many.filter(function(r){return r.name;}).map(function(r){return r.name;});
    R.dupes=names.length-(new Set(names)).size;

    /* ── a session is not a week ──
       Nothing logged, so every muscle is short by the whole band - and the
       screen still has to propose a session rather than the week. */
    localStorage.setItem('fit_log','[]');
    genOpen();
    var chosen=[];for(var k in _gen.on)if(_gen.on.hasOwnProperty(k))chosen.push(k);
    R.proposed=chosen.length;
    R.proposedShort=chosen.every(function(m){return _gen.on[m]===SETS_BAND.lo;});
    _gen=null;_fitView='home';
    /* and however far behind a muscle is, one session asks for one session */
    var big=genPick({muscles:['חזה'],equip:GYM,sets:{'חזה':20}});
    R.cappedSets=big.reduce(function(a,r){return a+(r.sets||0);},0);
    R.cappedEx=big.length;
    var bigEmph=genPick({muscles:['חזה'],equip:GYM,sets:{'חזה':20},emphasis:'חזה'});
    R.cappedEmph=bigEmph.reduce(function(a,r){return a+(r.sets||0);},0);

    /* ── and out the other end, as a session the screen already speaks ── */
    var w=genToWorkout(many,'size');
    R.wLen=w.length;
    R.wShape=w[0]&&Object.keys(w[0]).sort().join(',');
    R.wReps=w[0]&&w[0].targetReps;              /* size is 6-12 -> 9 */
    R.wNoneDropped=w.length===names.length;
    var wHome=genToWorkout(home,'size');
    R.wHomeNoNone=wHome.every(function(x){return !!x.name;});
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
  if (p === '/dev/g.html') {
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
    'http://localhost:' + PORT + '/dev/g.html'], { stdio: 'ignore' });
  const t = setTimeout(() => { c.kill(); resolve(); }, 120000);
  c.on('exit', () => { clearTimeout(t); resolve(); });
});
server.close();
fs.rmSync(TMP, { recursive: true, force: true });
if (!got) { console.log('FAIL: the page never answered'); process.exit(1); }
if (got.threw) { console.log('FAIL: the page threw: ' + got.threw); process.exit(1); }

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

console.log('the muscles the band actually covers');
ok(got.lib > 200, 'the library is loaded (' + got.lib + ')');
ok(got.groups > 10, got.groups + ' groups, taken from the library rather than written down again');
ok(got.noCardio && got.noOther, 'and אירובי and אחר are not among them — the band says it does not measure them');
ok(got.hasChest, 'חזה is');

console.log('');
console.log('the deficit, which is the whole point of the note');
ok(got.emptyAllShort === true, 'an empty week leaves every muscle short by the full floor');
ok(got.chestDone === 12 && got.chestShort === 0,
   'twelve sets of chest logged leaves chest asking for NOTHING (got ' + got.chestDone + ' done, ' + got.chestShort + ' short)');
ok(got.backDone === 4 && got.backShort === 6,
   'four sets of back leaves six, not ten (got ' + got.backDone + ' done, ' + got.backShort + ' short)');
ok(got.firstIsUntouched === true, 'the muscle furthest behind is first');
ok(got.lastIsChest === 'חזה', 'and the one you have already done is last (got ' + got.lastIsChest + ')');

console.log('');
console.log('what it picks');
ok(got.skipsZero === true, 'a muscle asking for zero sets gets no exercises at all');
ok(got.backRows === 2, 'six sets of back becomes two exercises (got ' + got.backRows + ')');
ok(got.backSets === 6, 'and six sets in total, not ten (got ' + got.backSets + ')');
ok(got.backFirst === 'מתח',
   'the primary movement comes first, out of the order the data already had — and with גב רחב folded into גב that is the pull-up (got ' + got.backFirst + ')');
ok(got.emphSets > got.plainSets,
   'an emphasised muscle gets MORE work, not different work (' + got.plainSets + ' -> ' + got.emphSets + ')');
ok(got.dupes === 0, 'and no exercise appears twice in one session');

console.log('');
console.log('a muscle name that does not survive the rollup');
ok(got.foldedNone === false, 'גב רחב does not come back as "nothing available" — it folds into גב');
ok(got.foldedSets === 6, 'and its sets map is read under the name that was passed (got ' + got.foldedSets + ')');
ok(got.foldedNames.length === 2, 'two exercises, the same as asking for גב (got ' + got.foldedNames.join(', ') + ')');
ok(got.bothCount === 2, 'asking for both גב and גב רחב asks once, not twice (got ' + got.bothCount + ')');

console.log('');
console.log('not in a gym — a mat and your own weight');
ok(got.homeNames.length > 0, got.homeNames.length + ' exercises found with nothing but that');
ok(got.homeAllDoable === true, 'and every one of them needs nothing else: ' + got.homeNames.join(', '));
ok(Array.isArray(got.homeNone), 'a muscle with nothing available is reported rather than dropped' +
   (got.homeNone.length ? ' (' + got.homeNone.join(', ') + ')' : ' (none this time)'));

console.log('');
console.log('a session is not a week');
ok(got.proposed === 3, 'an empty week proposes THREE muscles, not all eleven (got ' + got.proposed + ')');
ok(got.proposedShort === true, 'each carrying its real shortfall, which is the whole band');
ok(got.cappedSets === 6, 'a muscle twenty sets behind is asked for six in one session (got ' + got.cappedSets + ')');
ok(got.cappedEx === 2, 'which is two exercises, not seven (got ' + got.cappedEx + ')');
ok(got.cappedEmph === 9, 'and emphasis adds on top of the cap rather than being swallowed by it (got ' + got.cappedEmph + ')');

console.log('');
console.log('and out as a session the workout screen already speaks');
ok(got.wShape === 'name,plan,sets,ss,targetReps,targetSets,warm',
   'the same shape workoutAddExercise makes (got ' + got.wShape + ')');
ok(got.wReps === 9, 'size is 6-12, so the boxes open on 9 (got ' + got.wReps + ')');
ok(got.wNoneDropped === true, 'and the "nothing available" rows do not become exercises');
ok(got.wHomeNoNone === true, 'nor in the home session');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('it asks for what is missing, with what you actually have');
