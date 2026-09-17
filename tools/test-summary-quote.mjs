/* The sentence of the day, in the hollow beside the photograph.
 *
 *   node tools/test-summary-quote.mjs [path/to/index.html]
 *
 * The head of a day summary is capped at six facts because six rows is the
 * height of the picture box - that cap is what keeps the head the same height
 * whether four questions were answered or twenty-six. With one fact answered
 * the facts column is 52px against the photo's 177: measured on 14/09, 125px
 * of empty room sitting under "השיר של היום".
 *
 * So the quote may fill space that ALREADY EXISTS and may never make more, and
 * the three ways to get that wrong are each asserted here:
 *
 *   no photo   - the facts already run full width, there is no hollow
 *   full head  - six facts is the photo's height, there is no room
 *   too long   - it would push the column past the photo, so it stays whole
 *                where it is rather than being cut off at the interesting part
 *
 * And the one that would be worst to miss: when it DOES move up, it has to
 * leave תובנות ומחשבות, or the same sentence is printed twice on one page.
 *
 * Renders the real summaryBodyHTML against a fabricated day. No network.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8791;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'sumq-'));
if (!fs.existsSync(CHROME)) { console.log('SKIP: no Chrome at ' + CHROME); process.exit(0); }
const app = fs.readFileSync(process.argv[2] || path.join(ROOT, 'dev/index.html'), 'utf8');

const QUOTE = 'מי שלא מוכן לעשות את הדבר הקטן, לא יעשה את הגדול';
const LONG = QUOTE + ' ' + QUOTE + ' ' + QUOTE + ' ' + QUOTE + ' ' + QUOTE + ' ' + QUOTE;

const DRIVE = `<script>
setTimeout(function(){
  var R={};
  try{
    var D='2026-09-16';
    /* a tiny photo, so hasPh is true without fetching anything */
    var PH='data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    var mk=function(o){
      var base={mood:4,dayRating:8,song:'שיר',songArtist:'אמן',
                quote:QUOTEV,photo:PH,moment:'רגע'};
      for(var k in o)base[k]=o[k];
      return base;
    };
    var put=function(sum){localStorage.setItem('sum_'+D,JSON.stringify(sum));};
    var body=function(){return summaryBodyHTML(D);};

    /* 1 - a photo and a short head: it goes up */
    window.QUOTEV=${JSON.stringify(QUOTE)};
    put(mk({}));
    var h1=body();
    R.inHead=h1.indexOf('sm2-q')>=0;
    R.timesShort=(h1.split(${JSON.stringify(QUOTE)}).length-1);

    /* 2 - no photo: no hollow to fill */
    put(mk({photo:''}));
    var h2=body();
    R.noPhoto=h2.indexOf('sm2-q')>=0;
    R.timesNoPhoto=(h2.split(${JSON.stringify(QUOTE)}).length-1);

    /* 3 - too long to fit: stays whole, where it was */
    window.QUOTEV=${JSON.stringify(LONG)};
    put(mk({quote:${JSON.stringify(LONG)}}));
    var h3=body();
    R.longInHead=h3.indexOf('sm2-q')>=0;
    R.longWhole=h3.indexOf(${JSON.stringify(LONG)})>=0;

    /* 4 - a full head leaves no room */
    put({mood:4,dayRating:8,bodyFeelings:['אנרגטי'],steps:9000,workoutDone:true,
         song:'שיר',songArtist:'אמן',
         quote:${JSON.stringify(QUOTE)},photo:PH,moment:'רגע'});
    var h4=body();
    /* class="sm2-r" exactly: the bare string also matches the sm2-rule
       divider, which is how five rows first counted as six */
    R.fullHeadRows=(h4.split('class="sm2-r"').length-1);
    R.fullHeadQuote=h4.indexOf('sm2-q')>=0;
    R.rowLabels=(h4.match(/class="sm2-r"><span>[^<]*/g)||[]).map(function(x){return x.split('>').pop();});
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
  if (p === '/dev/q.html') {
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
    'http://localhost:' + PORT + '/dev/q.html'], { stdio: 'ignore' });
  const t = setTimeout(() => { c.kill(); resolve(); }, 120000);
  c.on('exit', () => { clearTimeout(t); resolve(); });
});
server.close();
fs.rmSync(TMP, { recursive: true, force: true });
if (!got) { console.log('FAIL: the page never answered'); process.exit(1); }
if (got.threw) { console.log('FAIL: the page threw: ' + got.threw); process.exit(1); }

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

console.log('a photo and room to spare');
ok(got.inHead === true, 'the sentence moves into the hollow');
ok(got.timesShort === 1, 'and appears exactly ONCE on the page (got ' + got.timesShort + ')');

console.log('');
console.log('no photo, no hollow');
ok(got.noPhoto === false, 'nothing moves - the facts already run full width');
ok(got.timesNoPhoto === 1, 'and it is still on the page, once (got ' + got.timesNoPhoto + ')');

console.log('');
console.log('longer than the gap');
ok(got.longInHead === false, 'it does not go up');
ok(got.longWhole === true, 'and it is still there WHOLE - never cut off at the interesting part');

console.log('');
console.log('a full head');
ok(got.fullHeadRows >= 6, 'six facts fill the height of the picture (got ' + got.fullHeadRows + ')');
ok(got.fullHeadQuote === false, 'so the quote stays out of it');

console.log('');
if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); }
console.log('it fills the room that exists, and never makes more');
