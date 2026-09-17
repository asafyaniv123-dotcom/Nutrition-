/* The distance formatter, driven in the page rather than reimplemented here.
 *
 *   node tools/test-distance.mjs [path/to/index.html]
 *
 * Distance is stored in METRES and read in kilometres, miles, metres or yards
 * depending on who is reading and how far it is. That is four conversions and
 * a magnitude threshold, which is exactly the shape that ships a silent bug -
 * the app has already shipped a progress chart plotting kilograms under a
 * title saying lb, and a box labelled kg for a reader who chose pounds.
 *
 * Pace is the other half: derived from the two, refusing to answer when either
 * is missing, and carrying seconds that have to be padded by the FORMATTER
 * rather than by a Latin zero - which is only visible in Arabic, so Arabic is
 * what it is driven in.
 *
 * What is NOT covered: any screen. Nothing calls these yet, by design - the
 * cardio note says write the formatter first, and this is the formatter.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8793;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'dist-'));
if (!fs.existsSync(CHROME)) { console.log('SKIP: no Chrome at ' + CHROME); process.exit(0); }
const app = fs.readFileSync(process.argv[2] || path.join(ROOT, 'dev/index.html'), 'utf8');

const DRIVE = `<script>
setTimeout(function(){
  var R={};
  try{
    var u0=APP_UNITS,l0=APP_LOCALE;

    /* ── metric ── */
    APP_UNITS='metric';
    R.mKm      = fmtDist(5250);      /* 5.25, not rounded to 5.3 */
    R.mExact   = fmtDist(5000);      /* a whole 5 prints as 5 */
    R.mUnder   = fmtDist(400);       /* metres, not 0.4 of a kilometre */
    R.mEdgeLo  = fmtDist(999);
    R.mEdgeHi  = fmtDist(1000);
    R.mZero    = fmtDist(0);
    R.mJunk    = fmtDist(null);
    R.mUnit    = distUnit();
    R.mSmall   = distUnitSmall();
    R.mTo      = toDisplayDist(5250);
    R.mFrom    = fromDisplayDist(5.25);
    R.mRound   = fromDisplayDist(toDisplayDist(5250));

    /* ── imperial ── */
    APP_UNITS='imperial';
    R.iMile    = fmtDist(1609.344);
    R.iMiles   = fmtDist(5000);
    R.iUnder   = fmtDist(800);       /* yards */
    R.iEdgeLo  = fmtDist(1609.343);
    R.iUnit    = distUnit();
    R.iSmall   = distUnitSmall();
    R.iFrom    = fromDisplayDist(3.1);
    R.iRound   = fromDisplayDist(toDisplayDist(5000));

    /* ── pace ── */
    APP_UNITS='metric';
    R.pFlat    = fmtPace(5000,25);     /* 5:00 per km */
    R.pHalf    = fmtPace(5000,27.5);   /* 5:30 */
    R.pPad     = fmtPace(5000,25.5);   /* 5:06 - the padded case */
    R.pCarry   = fmtPace(1000,5.99999);/* the seconds round to 60 and carry */
    R.pNoDist  = fmtPace(0,25);
    R.pNoTime  = fmtPace(5000,0);
    R.pNaN     = fmtPace(NaN,25);
    R.pInf     = fmtPace(5000,Infinity);
    R.pUnit    = paceUnit();
    APP_UNITS='imperial';
    R.pMile    = fmtPace(1609.344,8);  /* 8:00 per mile */

    /* ── and the padded zero, where it is actually visible ── */
    APP_UNITS='metric';/* ar-EG, which is what the app's own LANGS table uses - plain 'ar' formats
       in Latin digits under current ICU and would prove nothing. */
    APP_LOCALE='ar-EG';_nfCache={};
    R.arPace   = fmtPace(5000,25.5);
    R.arDist   = fmtDist(5250);
    APP_LOCALE=l0;_nfCache={};APP_UNITS=u0;
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
  if (p === '/dev/d.html') {
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
    'http://localhost:' + PORT + '/dev/d.html'], { stdio: 'ignore' });
  const t = setTimeout(() => { c.kill(); resolve(); }, 120000);
  c.on('exit', () => { clearTimeout(t); resolve(); });
});
server.close();
fs.rmSync(TMP, { recursive: true, force: true });
if (!got) { console.log('FAIL: the page never answered'); process.exit(1); }
if (got.threw) { console.log('FAIL: the page threw: ' + got.threw); process.exit(1); }

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const near = (a, b) => Math.abs(a - b) < 1e-6;

console.log('kilometres, for the reader who chose them');
ok(got.mUnit === 'ק"מ', 'the unit you type in is ק"מ (got ' + got.mUnit + ')');
ok(got.mSmall === 'מטר', 'and short distances are shown in מטר (got ' + got.mSmall + ')');
ok(got.mKm === '5.25 ק"מ', '5,250 m reads 5.25, not rounded to 5.3 (got ' + got.mKm + ')');
ok(got.mExact === '5 ק"מ', 'a whole 5 has no trailing zeros (got ' + got.mExact + ')');
ok(got.mUnder === '400 מטר', '400 m is metres, not 0.4 of a kilometre (got ' + got.mUnder + ')');
ok(got.mEdgeLo === '999 מטר' && got.mEdgeHi === '1 ק"מ',
   'the threshold is exactly a kilometre (got ' + got.mEdgeLo + ' / ' + got.mEdgeHi + ')');
ok(got.mZero === '0 מטר' && got.mJunk === '0 מטר', 'nothing and nonsense both read 0, not NaN');
ok(near(got.mTo, 5.25) && near(got.mFrom, 5250), 'the conversion goes both ways (got ' + got.mTo + ' / ' + got.mFrom + ')');
ok(near(got.mRound, 5250), 'and a round trip returns the metres it started with (got ' + got.mRound + ')');

console.log('');
console.log('miles, for the reader who chose those');
ok(got.iUnit === 'mi' && got.iSmall === 'yd', 'mi and yd, untranslated like lb and ft');
ok(got.iMile === '1 mi', 'a mile is 1 mi (got ' + got.iMile + ')');
ok(got.iMiles === '3.11 mi', '5,000 m is 3.11 miles (got ' + got.iMiles + ')');
ok(got.iUnder === '875 yd', '800 m is 875 yards (got ' + got.iUnder + ')');
ok(got.iEdgeLo === '1,760 yd', 'a millimetre short of a mile is still yards (got ' + got.iEdgeLo + ')');
ok(near(got.iFrom, 4988.9664), '3.1 miles typed is 4,988.97 m stored (got ' + got.iFrom + ')');
ok(near(got.iRound, 5000), 'and the imperial round trip holds too (got ' + got.iRound + ')');

console.log('');
console.log('pace, derived and never typed');
ok(got.pUnit === '/ק"מ', 'the unit is per kilometre (got ' + got.pUnit + ')');
ok(got.pFlat === '⁦5:00 /ק"מ⁩', '25 minutes over 5 km is 5:00 (got ' + got.pFlat + ')');
ok(got.pHalf === '⁦5:30 /ק"מ⁩', '27.5 minutes is 5:30 (got ' + got.pHalf + ')');
ok(got.pPad === '⁦5:06 /ק"מ⁩', 'and six seconds is padded, not 5:6 (got ' + got.pPad + ')');
ok(got.pCarry === '⁦6:00 /ק"מ⁩', 'seconds that round to 60 carry into the minute (got ' + got.pCarry + ')');
ok(got.pNoDist === '' && got.pNoTime === '', 'no distance or no time means no pace, not 0:00');
ok(got.pNaN === '' && got.pInf === '', 'and neither NaN nor Infinity reaches the screen');
ok(got.pMile === '⁦8:00 /mi⁩', 'an imperial reader gets minutes per mile (got ' + got.pMile + ')');

ok(got.pFlat.charCodeAt(0) === 0x2066 && got.pFlat.charCodeAt(got.pFlat.length - 1) === 0x2069,
   'and the whole token is isolated, so the neutral slash cannot be resolved to the far side of the unit in a Hebrew line');

console.log('');
console.log('and the seconds are padded by the formatter, which only Arabic can show');
ok(got.arPace === '\u2066\u0665:\u0660\u0666 /\u05e7"\u05de\u2069',
   'Arabic digits, with an Arabic zero in front of the six (got ' + got.arPace + ')');
ok(got.arDist === '\u0665\u066b\u0662\u0665 \u05e7"\u05de',
   'and an Arabic decimal separator on the distance (got ' + got.arDist + ')');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('metres in, and whatever the reader asked for out');
