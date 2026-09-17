/* A product the tables have never heard of is not the nearest thing in them.
 *
 *   node tools/test-no-match.mjs [path/to/index.html]
 *
 * "25 גרם חלבון ממשקה פרומקס של הרבלייף" came back as a cake. Measured end to
 * end, every stage was right except the last: /parse read the product, /match
 * answered -1 - none of these sixty is it - and the app handed back the local
 * guess anyway, because one line treated three situations as one.
 *
 * The three are asserted separately here, because collapsing them is the bug:
 *
 *   an explicit -1   an OPINION about the sixty rows the local scorer ranked.
 *                    Believe it: the row goes unmatched.
 *   a failed request NOT an opinion. The local guess is all there is and it
 *                    stands, exactly as before.
 *   a real pick      unchanged.
 *
 * And the one real number in the sentence - the protein he read off his own
 * packet - has to survive to the screen, because otherwise adding the item by
 * hand means remembering a figure the app already read.
 *
 * /match and /parse are stubbed: this is about what the app does with an
 * answer, not about getting one.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8799;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'nomatch-'));
if (!fs.existsSync(CHROME)) { console.log('SKIP: no Chrome at ' + CHROME); process.exit(0); }
const app = fs.readFileSync(process.argv[2] || path.join(ROOT, 'dev/index.html'), 'utf8');

const DRIVE = `<script>
var MODE='no';
(function(){var real=window.fetch;
 window.fetch=function(u,o){
  var url=String(u);
  if(url.indexOf('/match')>=0){
    if(MODE==='dead')return Promise.reject(new Error('offline'));
    if(MODE==='pick')return Promise.resolve({ok:true,json:function(){return Promise.resolve({ok:true,pick:0,grams:0,sure:true});}});
    return Promise.resolve({ok:true,json:function(){return Promise.resolve({ok:true,pick:-1,sure:false});}});
  }
  return real.apply(this,arguments);};
})();
setTimeout(function(){
  var R={};
  foodsLoad(function(){
    var item={food:'משקה פרומקס הרבלייף',amount:1,unit:'unit',
              stated_by_user:{calories_kcal:null,protein_g:25,carbohydrates_g:null,fat_g:null}};
    var step=function(mode,cb){
      MODE=mode;
      matchCachePut&&matchCachePut(item.food,null);
      try{localStorage.removeItem(MATCH_KEY);}catch(e){}
      sayResolveAll([JSON.parse(JSON.stringify(item))],function(rows){cb(rows[0]);});
    };
    /* what the local scorer alone would have said, for comparison */
    R.localWouldBe=(function(){var l=sayResolve(item);return l&&l.food?l.food.n:null;})();
    step('no',function(row){
      R.noMatchFood=row&&row.food?row.food.n:null;
      R.noMatchSaid=row&&row.said?row.said.protein_g:null;
      R.noMatchSrc=row?row.src:null;
      /* and the panel draws it */
      _sayItems=[row];
      var el=document.createElement('div');el.id='say-body';document.body.appendChild(el);
      sayPaint();
      R.painted=el.innerHTML.indexOf('sr-said')>=0;
      R.paintedNumber=el.innerHTML.indexOf('25')>=0;
      /* A query the local scorer CAN answer, so a silent request has
         something to preserve - with a product it has never heard of both
         paths are null and the test proves nothing. */
      var known={food:'לחם',amount:1,unit:'unit'};
      R.knownLocal=(function(){var l=sayResolve(known);return l&&l.food?l.food.n:null;})();
      MODE='dead';
      try{localStorage.removeItem(MATCH_KEY);}catch(e){}
      sayResolveAll([known],function(rows2){var row2=rows2[0];
        R.deadFood=row2&&row2.food?row2.food.n:null;
        fetch('/r',{method:'POST',body:JSON.stringify(R)});
      });
    });
  });
},2400);
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
  if (p === '/dev/n.html') {
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
    '--virtual-time-budget=30000', '--user-data-dir=' + TMP, '--dump-dom',
    'http://localhost:' + PORT + '/dev/n.html'], { stdio: 'ignore' });
  const t = setTimeout(() => { c.kill(); resolve(); }, 150000);
  c.on('exit', () => { clearTimeout(t); resolve(); });
});
server.close();
fs.rmSync(TMP, { recursive: true, force: true });
if (!got) { console.log('FAIL: the page never answered'); process.exit(1); }

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

console.log('what the local scorer would have offered: ' + got.localWouldBe);
console.log('');
console.log('an explicit "none of these"');
ok(got.noMatchFood === null,
   'the row is left unmatched rather than filled with the rejected guess (got ' + got.noMatchFood + ')');
ok(got.noMatchSaid === 25, 'and it keeps the 25 g he typed (got ' + got.noMatchSaid + ')');
ok(got.painted === true, 'which the panel actually draws');
ok(got.paintedNumber === true, 'with the number in it');

console.log('');
console.log('a request that never came back');
ok(got.deadFood !== null, 'is NOT an opinion - the local guess still stands (got ' + got.deadFood + ')');
ok(got.deadFood === got.knownLocal, 'and it is exactly what the local scorer had (got ' + got.deadFood + ')');

console.log('');
if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); }
console.log('a no is believed, a silence is not');
