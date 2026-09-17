/* Drag a plate onto the bar, and it lands on both sides.
 *
 *   node tools/test-bar-loader.mjs [path/to/index.html]
 *
 * WHAT IT DRIVES: the real panel, rendered by the real rackHTML, with REAL
 * pointer events dispatched at real coordinates - pointerdown on a plate,
 * pointermove across the screen, pointerup over the drawing. That is the whole
 * mechanism, and it is the part that cannot be checked by reading the code:
 * HTML5 drag-and-drop does not exist on iOS Safari, so this is hand-rolled on
 * pointer events and either the arithmetic of the drop lands or it does not.
 *
 * WHAT IT DOES NOT COVER, stated rather than implied: the fitness screen
 * around it. Reaching the loader for real needs a workout in progress with an
 * exercise selected, and this mounts the panel on its own with a stand-in for
 * the set's weight field. So it proves the loader works; it does not prove the
 * route to it.
 *
 * Needs Chrome. No network, no key.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8785;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'barload-'));
if (!fs.existsSync(CHROME)) { console.log('SKIP: no Chrome at ' + CHROME); process.exit(0); }
const app = fs.readFileSync(process.argv[2] || path.join(ROOT, 'dev/index.html'), 'utf8');

const DRIVE = `<script>
function ev(el,type,x,y){
  el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0,pointerId:1}));
}
setTimeout(function(){
  var R={};
  try{
    /* the panel, on its own, with a stand-in for the set's weight field */
    var host=document.createElement('div');
    host.style.cssText='position:fixed;inset-block-start:0;inset-inline-start:0;width:360px;background:#fff;z-index:9';
    host.innerHTML='<input id="fit-w" value="">'+
      '<div id="fit-plates"></div>';
    document.body.appendChild(host);
    _rackOpen=true;
    document.getElementById('fit-plates').innerHTML=rackHTML();
    R.bar=bldBar();
    var pal=document.querySelectorAll('.bld-p');
    R.palette=pal.length;

    /* 1. A TAP on the 20 - no movement at all */
    var twenty=null,i;
    for(i=0;i<pal.length;i++)if(pal[i].textContent.trim()==='20')twenty=pal[i];
    R.found20=!!twenty;
    var r0=twenty.getBoundingClientRect();
    ev(twenty,'pointerdown',r0.left+5,r0.top+5);
    ev(document,'pointerup',r0.left+5,r0.top+5);
    R.afterTap=_bld.slice();
    R.fieldAfterTap=document.getElementById('fit-w').value;

    /* 2. A DRAG of the 5 onto the drawing */
    document.getElementById('fit-plates').innerHTML=rackHTML();
    pal=document.querySelectorAll('.bld-p');
    var five=null;
    for(i=0;i<pal.length;i++)if(pal[i].textContent.trim()==='5')five=pal[i];
    var drop=document.getElementById('bld-drop');
    var r1=five.getBoundingClientRect(),r2=drop.getBoundingClientRect();
    ev(five,'pointerdown',r1.left+5,r1.top+5);
    ev(document,'pointermove',r1.left+20,r1.top-10);
    ev(document,'pointermove',(r2.left+r2.right)/2,(r2.top+r2.bottom)/2);
    R.hot=!!document.querySelector('.bld-drop.hot');
    R.ghosts=document.querySelectorAll('.bld-ghost').length;
    ev(document,'pointerup',(r2.left+r2.right)/2,(r2.top+r2.bottom)/2);
    R.afterDrag=_bld.slice();
    R.ghostsAfter=document.querySelectorAll('.bld-ghost').length;

    /* 3. A DRAG that is released somewhere else entirely */
    document.getElementById('fit-plates').innerHTML=rackHTML();
    pal=document.querySelectorAll('.bld-p');
    var ten=null;
    for(i=0;i<pal.length;i++)if(pal[i].textContent.trim()==='10')ten=pal[i];
    var r3=ten.getBoundingClientRect();
    ev(ten,'pointerdown',r3.left+5,r3.top+5);
    ev(document,'pointermove',r3.left+40,r3.top+40);
    ev(document,'pointerup',5,window.innerHeight-5);
    R.afterMiss=_bld.slice();

    /* 4. the same plate twice, and then one taken off */
    document.getElementById('fit-plates').innerHTML=rackHTML();
    bldAdd(5);
    R.afterSecondFive=_bld.slice();
    R.totalTwoFives=bldTotal();
    R.fieldNow=document.getElementById('fit-w').value;
    bldDrop(0);
    R.afterRemove=_bld.slice();
    bldClear();
    R.afterClear=_bld.slice();
    R.fieldCleared=document.getElementById('fit-w').value;
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
  if (p === '/dev/b.html') {
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
    'http://localhost:' + PORT + '/dev/b.html'], { stdio: 'ignore' });
  const t = setTimeout(() => { c.kill(); resolve(); }, 120000);
  c.on('exit', () => { clearTimeout(t); resolve(); });
});
server.close();
fs.rmSync(TMP, { recursive: true, force: true });
if (!got) { console.log('FAIL: the page never answered'); process.exit(1); }
if (got.threw) { console.log('FAIL: the page threw: ' + got.threw); process.exit(1); }

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

console.log('the panel');
ok(got.palette >= 6, 'every plate size is offered (got ' + got.palette + ')');
ok(got.found20 === true, 'including the 20');

console.log('');
console.log('a tap loads a pair');
ok(eq(got.afterTap, [20]), 'one 20 on each side (got ' + JSON.stringify(got.afterTap) + ')');
/* 20 kg bar + 20 a side = 60 */
ok(got.fieldAfterTap === String(got.bar + 40),
   "and the set's weight field says " + (got.bar + 40) + ' (got "' + got.fieldAfterTap + '")');

console.log('');
console.log('a drag onto the drawing');
ok(got.ghosts === 1, 'a plate follows the finger (got ' + got.ghosts + ')');
ok(got.hot === true, 'the bar lights up when the finger is over it');
ok(eq(got.afterDrag, [20, 5]), 'and dropping adds it, heaviest first (got ' + JSON.stringify(got.afterDrag) + ')');
ok(got.ghostsAfter === 0, 'the ghost is cleaned up');

console.log('');
console.log('a drag released somewhere else changes nothing');
ok(eq(got.afterMiss, [20, 5]), 'still ' + JSON.stringify(got.afterMiss));

console.log('');
console.log('two of the same, and taking one off');
ok(eq(got.afterSecondFive, [20, 5, 5]), 'dragging the 5 twice gives two a side (got ' + JSON.stringify(got.afterSecondFive) + ')');
/* bar + 2*(20+5+5) */
ok(got.totalTwoFives === got.bar + 60, 'the total is the bar plus both sides (got ' + got.totalTwoFives + ')');
ok(got.fieldNow === String(got.bar + 60), 'and the field followed it');
ok(eq(got.afterRemove, [5, 5]), 'taking one off removes exactly that one (got ' + JSON.stringify(got.afterRemove) + ')');
ok(eq(got.afterClear, []), 'and stripping it empties the bar');
ok(got.fieldCleared === '', 'which clears the weight field rather than leaving the bar in it');

console.log('');
if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); }
console.log('one drag, one pair, and the weight follows');
