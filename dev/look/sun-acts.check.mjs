// Verify sun-acts.html from the FILE, not from a reimplementation: lift its
// script, stub just enough DOM for the actor, and drive it without needing a
// visible tab. Takes a path so it can be pointed at an older revision.
import fs from 'node:fs';

const PATH = process.argv[2] || 'C:/Projects/Nutrition-/dev/look/sun-acts.html';
const src = fs.readFileSync(PATH, 'utf8');
const code = src.match(/<script>([\s\S]*?)<\/script>/)[1];

// ---- the smallest DOM the page actually touches ----
function el(tag){
  return { tag, style:{setProperty(){}, cssText:''}, children:[], className:'',
    _attrs:{}, _html:'', clientWidth:1200,
    setAttribute(k,v){ this._attrs[k]=v; }, getAttribute(k){ return this._attrs[k]; },
    appendChild(c){ this.children.push(c); return c; }, remove(){},
    addEventListener(){}, querySelectorAll(){ return []; },
    querySelector(sel){ return (this._q && sel in this._q) ? this._q[sel] : null; } };
}
function makeSvg(){
  const s = el('svg');
  s._q = {'.roll': el('g'), '.tilt': el('g'), '.face': el('g')};
  return s;
}
function makeStage(){
  const st = el('div'); st.clientWidth = 1200;
  st._q = {'.spill': el('div'), '.plant': el('div'), '.drops': el('div'),
           '.floor': el('div')};
  return st;
}
function makeActorEl(){
  const a = el('div'); a._q = {'svg': makeSvg()}; return a;
}

global.window = { matchMedia: () => ({matches:false}),
                  requestAnimationFrame: cb => 1 };
global.matchMedia = window.matchMedia;
global.requestAnimationFrame = cb => 1;          // queued and never run on purpose
global.setTimeout = () => 0;
global.document = {
  getElementById: () => el('div'),
  createElement: tag => {
    const e = el(tag);
    Object.defineProperty(e, 'innerHTML', {
      set(v){ e._html = v;
        e._q = {'.stage': makeStage(), '.actor': makeActorEl(), 'button': el('button')}; },
      get(){ return e._html; } });
    return e;
  }
};

// defensive, so the same harness can load an older revision that lacks a name
const P = new Function(code + `
  ;var __g = n => { try { return eval(n); } catch(e){ return undefined; } };
  return {eyeAt, dots, SCENES, Actor, seq, R,
          BALL_PX: __g('BALL_PX') !== undefined ? BALL_PX : R*84/160};`)();

const fail = [];
const ok  = m => console.log('  ok   ' + m);
const bad = m => { fail.push(m); console.log('  FAIL ' + m); };

// ── 1. the turn is a real projection ─────────────────────────────────────
console.log('\n1. the turn is a real projection');
const count = y => (P.eyeAt(-22,y)?1:0) + (P.eyeAt(22,y)?1:0);
// an eye is visible while cos(a+theta) > 0.04, so the pair is gone beyond 109.7
[[0,2],[35,2],[70,1],[90,1],[109,1],[130,0],[180,0],[230,0],[255,1],[290,1],[325,2]]
  .forEach(([y,n]) => count(y)===n
    ? ok(`yaw ${y}\u00b0 -> ${n} eye(s)`)
    : bad(`yaw ${y}\u00b0 -> ${count(y)} eyes, expected ${n}`));
const rxF = 5.4*P.eyeAt(22,0).k, rxS = 5.4*P.eyeAt(22,55).k;
rxF > rxS*1.3 ? ok(`foreshortening real: rx ${rxF.toFixed(2)} front vs ${rxS.toFixed(2)} turned`)
              : bad('no foreshortening');
(P.eyeAt(-22,180)===null && P.eyeAt(22,180)===null)
  ? ok('at 180\u00b0 both eyes are behind the sphere - the spin really goes round')
  : bad('yaw 180 still draws an eye');

// ── 2. the roll is derived, not animated ─────────────────────────────────
console.log('\n2. the roll is derived, not animated');
const A1 = new P.Actor(makeActorEl());
A1.s.x = 100; A1.paint();
const rollG = A1.rollG || A1.roll;              // v1 called the field .roll
const got  = parseFloat(rollG.getAttribute('transform').match(/-?[\d.]+/)[0]);
const want = -100 / P.BALL_PX * 180/Math.PI;
Math.abs(got - want) < 0.01
  ? ok(`x=100 -> roll ${got}\u00b0 = -100 / ${P.BALL_PX.toFixed(3)}px, in degrees`)
  : bad(`roll ${got} but distance/radius says ${want.toFixed(2)}`);
got < 0 ? ok('roll is negative: he rolls the way he travels')
        : bad('roll turns against the direction of travel');
A1.el.style.transform.includes('translate(-100.00px')
  ? ok('x=100 paints as translate(-100px): forward is leftwards')
  : bad('forward is not leftwards: ' + A1.el.style.transform);
const handRoll = P.SCENES.filter(s => /rollG|\.roll|\bdeg\b/.test(s.play.toString()));
handRoll.length === 0 ? ok('no scene mentions the roll at all')
                      : bad(handRoll.length + ' scene(s) set the roll by hand');

// ── 3. a scene is a list over six names ──────────────────────────────────
console.log('\n3. a scene is a list over six names');
const NAMES = new Set(['x','y','yaw','sc','tl','op']);
P.SCENES.forEach((S,i) => {
  const stage = makeStage();
  const probe = new P.Actor(makeActorEl());
  try { S.play(probe, stage); ok(`scene ${i+1} "${S.t}" plays without throwing`); }
  catch(e){ bad(`scene ${i+1} threw: ${e.message}`); }
  const props = [...S.play.toString().matchAll(/\bto:\s*\{([^}]*)\}/g)]
    .flatMap(m => [...m[1].matchAll(/([a-z]+)\s*:/g)].map(x => x[1]));
  const strange = [...new Set(props)].filter(p => !NAMES.has(p));
  strange.length === 0 ? ok(`   tweens only ${[...new Set(props)].join(', ')}`)
                       : bad(`scene ${i+1} tweens unknown prop(s): ${strange.join(',')}`);
});

// ── 4. forward, and the light that falls from him ────────────────────────
console.log('\n4. direction, and where the light comes from');
const actorRight = /\.actor\{[^}]*\bright:\s*0/.test(src);
actorRight ? ok('the actor is anchored to the right edge')
           : bad('the actor is anchored left, so a positive x travels backwards');
/360/.test(P.SCENES[1].play.toString())
  ? ok('scene 2 drives yaw to a full 360')
  : bad('scene 2 does not complete the turn');

const water = P.SCENES[3].play.toString();
const mFrom = water.match(/bottom:(\d+)px/);
const mTo   = water.match(/bottom\s*=\s*'(\d+)px'/);
const from = mFrom ? +mFrom[1] : null, to = mTo ? +mTo[1] : null;
const underside = 34 + 42 - P.R * 84/160;       // stage px: his lowest point
const soil = 56;                                // the pot's rim, 34 + (92-72)
(from !== null && to !== null && to < soil && from > to && from <= underside + 5)
  ? ok(`light falls ${from} -> ${to}px: his underside is ${underside.toFixed(1)}, the soil ~${soil}`)
  : bad(`light falls ${from} -> ${to}px, but his underside is ${underside.toFixed(1)} ` +
        `- it has to leave HIM, not rain on him`);

// and it must leave him HORIZONTALLY too: a drop that starts 50px away from his
// body appears out of nothing beside the plant, which is what v1 did.
const mStop = water.match(/toX\(st,\s*(\d+)\)/);
const mLeft = water.match(/left:'\s*\+\s*\((\d+)/) || water.match(/left:'\+\((\d+)/)
            || water.match(/left:'\s*\+\s*\((\d+)\s*[-+]/);
const stopC = mStop ? +mStop[1] : null;
const dropL = (water.match(/\+\s*\((\d+)\s*[-+]\s*n\s*\*\s*\d+\)\s*\+\s*\n?\s*'px;bottom/) ||
               water.match(/left:'\s*\+\s*\((\d+)/))
            ? +(water.match(/\((\d+)\s*[-+]\s*n\s*\*\s*\d+\)/)[1]) : null;
const leading = stopC !== null ? stopC - P.R*84/160 : null;   // his forward edge
(dropL !== null && leading !== null && Math.abs(dropL - leading) <= 12)
  ? ok(`the light starts at left ${dropL}, and his leading edge is ${leading.toFixed(0)} ` +
       `- it leaves his body`)
  : bad(`the light starts at left ${dropL} but his leading edge is ` +
        `${leading === null ? '?' : leading.toFixed(0)} - it appears out of nothing`);
/tl:\s*-18/.test(water) ? ok('he tips -18\u00b0: toward the plant, which is ahead of him')
                        : bad('he tips away from the plant');

// ── 5. the socket is behind him, so he leaves it going forward ───────────
console.log('\n5. he comes out of the socket going forward');
/right:70px/.test(P.SCENES[4].build.toString())
  ? ok('the socket sits near the start, not at the far end')
  : bad('the socket is at the far end, so he would walk backwards out of it');
/inside \+ 130/.test(P.SCENES[4].play.toString())
  ? ok('he leaves it forward, x increasing')
  : bad('he does not leave the socket forward');

// ── 6. reduced motion still finishes the story ───────────────────────────
console.log('\n6. reduced motion');
/if \(st\.fire\) st\.fire\(\);[\s\S]{0,80}Object\.assign/.test(code)
  ? ok('the reduced path fires each step, so the plant still grows')
  : bad('the reduced path skips fire(): the plant never grows and no light reaches the door');

// ── 7. he is the SAME character as the approved mark ─────────────────────
// A page that redraws him slightly is how a character ends up with two
// authors. These are read out of sun-final.html rather than written here.
console.log('\n7. the same character as the approved mark');
try {
  const fin = fs.readFileSync('C:/Projects/Nutrition-/dev/look/sun-final.html','utf8');
  const num = (txt, re) => (txt.match(re)||[])[1];
  const pairs = [
    // declared on one line here and on three there, so anchor on the NAME
    ['body radius',  /\bR\s*=\s*([\d.]+)/],
    ['ring radii',   /\bRR\s*=\s*\[([^\]]+)\]/],
    ['ring colours', /\bCOL\s*=\s*\[([^\]]+)\]/],
  ];
  pairs.forEach(([name, re]) => {
    const a = (num(src, re)||'').replace(/\s/g,''), b = (num(fin, re)||'').replace(/\s/g,'');
    a && a === b ? ok(`${name} identical to the approved mark: ${a}`)
                 : bad(`${name} differs: acts "${a}" vs final "${b}"`);
  });
  // the four fills that make the body's material
  const grads = t => [...t.matchAll(/id="'\+k\+'(\w+)"/g)].map(m=>m[1]).sort().join(',');
  grads(src) === grads(fin)
    ? ok(`the same gradients build the body: ${grads(src)}`)
    : bad(`gradients differ: acts ${grads(src)} vs final ${grads(fin)}`);
  // the dot rhythm at this size: 26 dots, 2.6 wide, 6% duty
  (/dots\(r,\s*26,\s*\.06\)/.test(src) && /stroke-width="2\.6"/.test(src))
    ? ok('26 dots at 2.6 wide, 6% duty - variant \u05d0, the one chosen for \u226548px')
    : bad('the dot rhythm is not the chosen variant \u05d0');
  // the blink the page agreed on: 3s then 5s
  /0%,18\.09%/.test(src) && /55\.59%/.test(src)
    ? ok('the 8s blink loop is the approved one (gaps of 3s and 5s)')
    : bad('the blink is not the approved loop');
} catch(e){ bad('could not read sun-final.html: ' + e.message); }

console.log('\n' + PATH);
console.log(fail.length ? fail.length + ' FAILURE(S)' : 'all checks pass');
process.exit(fail.length ? 1 : 0);
