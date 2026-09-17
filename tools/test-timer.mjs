/* The timer, driven against a clock that is made to move.
 *
 *   node tools/test-timer.mjs [path/to/index.html]
 *
 * THE ONE THING THAT MATTERS HERE is that the number comes from the WALL
 * CLOCK and not from a counter. A phone suspends timers the moment the screen
 * locks, so a stopwatch that adds one every second loses the whole rest of a
 * set - and the loss is invisible, because what comes back looks like a
 * perfectly good number. So Date.now is replaced here and moved by hand:
 * eight minutes pass while nothing ticks at all, and the clock has to agree.
 *
 * Pausing is tested the same way. A pause that merely stops the interval
 * still lets wall-clock time accumulate underneath it, and the seconds
 * reappear the moment you resume - which is the bug this shape invites.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8803;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'timer-'));
if (!fs.existsSync(CHROME)) { console.log('SKIP: no Chrome at ' + CHROME); process.exit(0); }
const app = fs.readFileSync(process.argv[2] || path.join(ROOT, 'dev/index.html'), 'utf8');

const DRIVE = `<script>
setTimeout(function(){
  var R={};
  try{
    /* a clock we can move by hand - the whole point of the test */
    var T=1700000000000;
    var realNow=Date.now;
    Date.now=function(){return T;};
    var jump=function(ms){T+=ms;};

    /* COUNTING UP */
    wtMode('up');
    wtStart();
    R.atStart=wtSecs();
    jump(8*60*1000);                 /* eight minutes with no ticks at all */
    R.after8=wtSecs();
    wtPause();
    var atPause=wtSecs();
    jump(5*60*1000);                 /* five minutes in a pocket, paused */
    R.whilePaused=wtSecs();
    R.pauseHeld=(wtSecs()===atPause);
    wtStart();                       /* resume */
    jump(30*1000);
    R.afterResume=wtSecs();          /* 8:00 + 0:30, the paused five lost */
    R.faceAfterResume=wtFace(wtSecs());
    wtReset();
    R.afterReset=wtSecs();
    R.runningAfterReset=wtRunning();

    /* COUNTING DOWN */
    wtSetLen(90);
    wtMode('down');
    wtStart();
    R.downStart=wtSecs();
    jump(60*1000);
    R.downAfter60=wtSecs();
    jump(40*1000);                   /* past zero */
    wtTick();
    R.downAtEnd=wtSecs();
    R.stoppedAtZero=!wtRunning();

    /* the face, and that it never goes negative */
    R.face90=wtFace(90);
    R.face605=wtFace(605);

    Date.now=realNow;
  }catch(e){R.threw=String(e&&e.message||e);}
  fetch('/r',{method:'POST',body:JSON.stringify(R)});
},2000);
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
  if (p === '/dev/t.html') {
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
    '--virtual-time-budget=14000', '--user-data-dir=' + TMP, '--dump-dom',
    'http://localhost:' + PORT + '/dev/t.html'], { stdio: 'ignore' });
  const t = setTimeout(() => { c.kill(); resolve(); }, 120000);
  c.on('exit', () => { clearTimeout(t); resolve(); });
});
server.close();
fs.rmSync(TMP, { recursive: true, force: true });
if (!got) { console.log('FAIL: the page never answered'); process.exit(1); }
if (got.threw) { console.log('FAIL: the page threw: ' + got.threw); process.exit(1); }

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

console.log('counting up, through a locked screen');
ok(got.atStart === 0, 'it starts at zero (got ' + got.atStart + ')');
ok(got.after8 === 480, 'eight minutes pass with no ticks and it knows (got ' + got.after8 + ' s)');
ok(got.pauseHeld === true, 'paused, it holds');
ok(got.whilePaused === 480, 'and five minutes in a pocket do NOT accumulate (got ' + got.whilePaused + ')');
ok(got.afterResume === 510, 'resuming carries on from where it stopped (got ' + got.afterResume + ', expected 510)');
ok(got.faceAfterResume === '8:30', 'which reads 8:30 (got ' + got.faceAfterResume + ')');
ok(got.afterReset === 0, 'reset is zero (got ' + got.afterReset + ')');
ok(got.runningAfterReset === false, 'and stops it');

console.log('');
console.log('counting down');
ok(got.downStart === 90, 'it starts at the length chosen (got ' + got.downStart + ')');
ok(got.downAfter60 === 30, 'and falls (got ' + got.downAfter60 + ' s after a minute)');
ok(got.downAtEnd === 0, 'it stops AT zero rather than going negative (got ' + got.downAtEnd + ')');
ok(got.stoppedAtZero === true, 'and stops itself there');

console.log('');
console.log('the face');
ok(got.face90 === '1:30', '90 seconds is 1:30 (got ' + got.face90 + ')');
ok(got.face605 === '10:05', '605 is 10:05, padded (got ' + got.face605 + ')');

console.log('');
if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); }
console.log('it reads the clock, not a counter');
