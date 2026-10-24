/* The app's door into Beem - the only thing that leaves the closure.
   Part of beem-app.js (built by beem-build.mjs); not loaded on its own.

     BeemKit.ready                      Promise: the canon is loaded and cut
     BeemKit.mount(el, {play, glow})    a live Beem filling `el` (a square box)
         play: 'invite' | 'counted' | 'sun' | 'moon' | a script
         glow: the streak count, worn as light (0 = none)
     BeemKit.streak(days)               the rules of 18.10: days = ['done'|'miss', ...]
                                        for every ENDED app day, oldest first
     BeemKit.glow(beem, count)          change a mounted Beem's light
     BeemKit.screen({bg, ink, accent, title, sub, button, play, glow, onClose})
                                        a full-screen moment, the Duolingo kind
                                        (beem-screen.js); wired to nothing yet

   A mounted Beem whose element leaves the page is dropped by the loop on its
   own, so re-rendering a screen with innerHTML needs no cleanup. */

/* the three approved places (round 2, 19.10) */
var APP_SCRIPTS = {
  /* the summary's invitation: he looks at "נתחיל", nods to it, and breathes */
  invite: {dur: 13600, ev: [[0, 'face', 'content'], [0, 'mode', {breathe: [.016, 4], idle: 0}],
    [600, 'look', 0, -16], [1300, 'nod', 1, 9], [2400, 'look', 0, 0], [3400, 'face', 'calm'],
    [4200, 'fx', {t: 'rings', v: {sc: [1.1, 1.13, 1.16]}, d: 4000, s: 120}], [4200, 'fx', {t: 'me', v: {gT: 1.06}, d: 4000}],
    [8800, 'fx', {t: 'rings', v: {sc: 1}, d: 4200, s: 120}], [8800, 'fx', {t: 'me', v: {gT: 1}, d: 4200}],
    [8900, 'face', 'content'], [9800, 'face', 'closed'], [13100, 'face', 'calm']]},
  /* the end of the summary: the streak's celebration (Golden Beem goes by 'golden') */
  celebrate: {dur: 1e9, ev: byId(COMBO_LIST, 'goal').ev},
  golden: {dur: 1e9, ev: byId(SPECIAL_LIST, 'golden').ev},
  /* the reaction card: a hop, a little light, content */
  react: {dur: 1e9, ev: [[0, 'face', 'happy'], [0, 'mode', {idle: 0}], [200, 'hop', 60], [200, 'burst', 1.2], [1600, 'face', 'content']]},
  /* a target that closed (20.10): bigger than the meal card's hop - two hops
     and a full burst, because it is an achievement and not an action */
  goal: {dur: 1e9, ev: [[0, 'face', 'surprised'], [0, 'mode', {idle: 0}], [250, 'face', 'happy'], [250, 'hop', 75],
    [250, 'burst', 1.7], [1050, 'hop', 45], [1050, 'burst', .9], [2300, 'face', 'content']]},
  /* before the flash of training together: just him, waiting */
  pairIdle: {dur: 1e9, ev: [[0, 'face', 'calm'], [0, 'mode', {breathe: [.014, 3.6], idle: 1}]]},
  /* the Me card: content, and now and then glad of the count */
  counted: {dur: 6000, ev: [[0, 'face', 'content'], [0, 'mode', {breathe: [.014, 3.6], idle: 1}],
    [2400, 'face', 'happy'], [2450, 'hop', 30], [2450, 'burst', .7], [3600, 'face', 'calm']]},
  /* the sky: the sun by day, the moon (beads as stars) by night */
  sun: {dur: 1e9, ev: [[0, 'face', 'calm'], [0, 'mode', {breathe: [.014, 3.6], idle: 1, float: 10}]]},
  moon: {dur: 1e9, ev: [[0, 'face', 'sleepy'], [0, 'mode', {idle: 0, breathe: [.02, 5.4], spinMul: .18}],
    [0, 'fx', {t: 'fx', v: {beads: 1}, d: 0}], [200, 'fx', {t: 'body', v: {moon: 1}, d: 2400}], [1400, 'face', 'closed']]}
};

var LIVE = [], running = false, io = null;
function loop(){
  var last = null;
  requestAnimationFrame(function tick(now){
    var raw = last === null ? .016 : (now - last)/1000; last = now;
    if (!(raw > 0) || raw > .25) raw = .016;
    var dt = Math.min(.1, raw), n = Math.ceil(dt/.0167), h = dt/n;
    for (var i = LIVE.length - 1; i >= 0; i--){
      var b = LIVE[i];
      if (!b.host.isConnected){ if (io) io.unobserve(b.host); LIVE.splice(i, 1); continue; }
      if (!b.visible) continue;
      for (var s = 0; s < n; s++) b.step(h);
      b.paint();
    }
    requestAnimationFrame(tick);
  });
}
function glowOn(b, count){
  var el = b.host.querySelector('.beem'), d = b.host.clientWidth;
  if (!count){ el.style.filter = ''; return; }
  var L = streakGlow(count);
  el.style.filter = 'drop-shadow(0 0 ' + (d*.06 + d*.1*L).toFixed(1) + 'px rgba(255,186,60,' + (.18 + .45*L).toFixed(2) + '))';
}

/* ONE COLOUR, ON DEMAND. The sheet builds all ten colours at load
   (beem-colors.js, COLORS_READY); the app needs one, and only when two
   phones meet, so the build removes that block and this makes a single
   colour the same way - the same LUT over the body, every bead and each
   full-resolution ring layer. */
var TINT_P = {};
function tintReady(id){
  if (TINT_P[id]) return TINT_P[id];
  return (TINT_P[id] = BEEM_READY.then(function(){
    return Promise.all(['sun-r1.png', 'sun-r2.png', 'sun-r3.png'].map(load));
  }).then(function(ringImgs){
    var RM = RAMP_SET[id], O = OK_SET[id], t = lutOf(RM ? rampPixel(RM) : okPixel(O));
    var T = TINTS[id] = {body: applyLut(EB, t), beads: BEADS.map(function(ring){ return ring.map(function(b){ return applyLut(b.spr, t); }); })};
    return Promise.all(ringImgs.map(function(img){ return ringURL(applyLut(img, t)); })).then(function(u){
      T.ringURL = u;
      return Promise.all(u.map(function(s){ return new Promise(function(r){ var i = new Image(); i.onload = i.onerror = r; i.src = s; }); }));
    });
  }));
}
/* THE FLASH (option B, approved 19.10), on one phone: he crouches, jumps, the
   rings close into a white light, and the Beem that comes out of it is the
   other person's. The timings are beem-pairing.js's kind B. */
function pairFlash(b, id){
  return tintReady(id).then(function(){
    [[0, function(){ b.verb('face', 'surprised'); b.verb('burst', .7); }],
     [800, function(){ b.verb('squash', 4); b.verb('face', 'determined'); }],
     [1020, function(){ b.verb('face', 'happy'); b.verb('launch', 260); }],
     [1140, function(){ b.fxTween({t: 'rings', v: {sc: .25, op: 0}, d: 180, e: 'in'});
       b.fxTween({t: 'body', v: {white: 1}, d: 160}); b.verb('spin', 400); }],
     [1340, function(){ tintBeem(b, id); }],
     [1400, function(){ b.fxTween({t: 'rings', v: {sc: 1, op: 1}, d: 420, e: 'back'});
       b.fxTween({t: 'body', v: {white: 0}, d: 380, e: 'out'}); b.verb('face', 'surprised'); }],
     [1750, function(){ b.verb('face', 'happy'); b.verb('burst', 1.6); b.verb('spin', 180); }],
     [3200, function(){ b.verb('face', 'content'); }]
    ].forEach(function(e){ setTimeout(e[1], e[0]); });
  });
}

window.BeemKit = {
  ready: BEEM_READY,
  mount: function(el, opts){
    opts = opts || {};
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var b = new Beem(el);
    /* A canvas is born 300x150, and the engine resizes it only when its WIDTH
       is wrong - so a box that needs exactly 300 (150px at 2x, as on the door
       of סיום יום) kept the height of 150 and drew Beem stretched and cut in
       half. Zeroing the width makes the first paint size both. Done here, not
       in beem-engine.js, because the engine is the character sheet's. */
    b.cv.width = 0;
    var s =typeof opts.play === 'string' ? APP_SCRIPTS[opts.play] : opts.play;
    b.play(s || APP_SCRIPTS.sun);
    if (opts.glow) glowOn(b, opts.glow);
    if (!io && 'IntersectionObserver' in window)
      io = new IntersectionObserver(function(es){ es.forEach(function(e){
        LIVE.forEach(function(x){ if (x.host === e.target) x.visible = e.isIntersecting; }); }); });
    if (io) io.observe(el);
    LIVE.push(b);
    if (!running){ running = true; loop(); }
    return b;
  },
  glow: glowOn,
  tint: tintReady,
  pair: pairFlash,
  streak: streakState,
  scripts: APP_SCRIPTS,
  /* the app's own scripts by name too, so a moment can play 'invite' or 'sun' */
  screen: function(o){
    o = o || {};
    if (typeof o.play === 'string' && APP_SCRIPTS[o.play]){
      var c = {}, k; for (k in o) c[k] = o[k]; c.play = APP_SCRIPTS[o.play]; o = c; }
    return beemScreenShow(o);
  }
};
