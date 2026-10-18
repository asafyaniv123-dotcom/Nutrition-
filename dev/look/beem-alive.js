/* Beem, alive - he answers a finger, keeps her company through the day's
   reflection, wears the streak as light, and knows what time it is.
   Loaded after beem-engine.js and beem-special.js; edits neither (the
   character sheet draws from both). Nothing new is drawn: every reaction is
   a face, a motion or a moment Beem already has. */

/* a script that plays once and then hands him back to life at rest, instead
   of looping - the engine replays a script that reaches its end */
function once(script, tail){
  return {dur: 1e9, ev: script.ev.concat([[script.dur, 'mode',
    Object.assign({idle: 1, breathe: [.014, 3.6], float: 0, spinMul: 1}, tail || {})]])};
}
var IDLE = {dur: 1e9, ev: [[0, 'mode', {breathe: [.014, 3.6], idle: 1}]]};
function byId(list, id){ for (var i = 0; i < list.length; i++) if (list[i][0] === id) return list[i][3]; }

/* ═══════════════════════ 1. touch ═══════════════════════
   FLIGHT is the one piece of physics the engine does not have: thrown, he
   flies under gravity and bounces off the stage's walls and floor, squashing
   on each hit by the speed of it, until friction stops him. While a finger
   holds him, the same state follows the finger on a stiff spring. */
(function(){
  var _step = Beem.prototype.step;
  Beem.prototype.step = function(dt){
    _step.call(this, dt);
    var F = this.flight; if (!F || !F.on) return;
    var h = dt*this.speed, XB = 270, TOP = -270, FLOOR = 205;
    if (F.drag){
      var ax = (F.tx - F.x)*700 - F.vx*48, ay = (F.ty - F.y)*700 - F.vy*48;
      F.vx += ax*h; F.vy += ay*h;
    } else {
      F.vy += 5200*h;
      var onFloor = F.y >= FLOOR - .5;
      if (onFloor) F.vx -= F.vx*Math.min(1, 2.8*h);
    }
    F.x += F.vx*h; F.y += F.vy*h;
    if (!F.drag){
      if (F.x > XB || F.x < -XB){                    // a wall
        F.x = F.x > 0 ? XB : -XB;
        if (Math.abs(F.vx) > 250){ this.sqv += Math.min(4, Math.abs(F.vx)*.0011); F.hits++; }
        F.vx = -F.vx*.62;
      }
      if (F.y < TOP){ F.y = TOP; F.vy = -F.vy*.5; }
      if (F.y > FLOOR){                              // the floor
        F.y = FLOOR;
        if (F.vy > 300){ this.sqv += Math.min(8, F.vy*.0016); F.hits++; F.vy = -F.vy*.5; }
        else F.vy = 0;
      }
      if (F.y >= FLOOR - .5 && Math.abs(F.vx) < 30 && Math.abs(F.vy) < 30){
        F.rest += h;
        if (F.rest > .35){ F.on = false; if (F.onRest) F.onRest(); }
      } else F.rest = 0;
    }
    /* hand the result to the engine: position, and velocity for its stretch.
       Its own spring is made neutral by aiming it where he already is. */
    this.x = F.x; this.y = F.y; this.vx = F.vx; this.vy = F.vy; this.air = false;
    this.tx = F.x - this.lookX*.9; this.ty = F.y;
  };
})();

function Touch(b){
  var host = b.host, P = null, taps = [], sulking = 0, lookTimer = null, self = this;
  host.style.touchAction = 'none';
  b.play(IDLE);
  b.flight = {on: false, drag: false, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, rest: 0, hits: 0, onRest: null};

  function units(e){
    var r = host.getBoundingClientRect(), k = r.width/VB;
    return {x: (e.clientX - r.left)/k - SPH.x, y: (e.clientY - r.top)/k - SPH.y, t: performance.now()};
  }
  function onBody(u){ return Math.hypot(u.x - b.x, u.y - b.y) < SPH.r*1.15*b.gate; }
  function later(s, v, a, c){ b.pend.push([b.sT + s, v, a, c]); }
  /* a new reaction owns the face. Without this, the 'back to calm' queued by
     an earlier tap - or by an idle glance - fired a moment into the next
     reaction and wiped it: petting showed calm eyes, sulking a calm face. */
  function fresh(){ b.pend = b.pend.filter(function(q){ return q[1] !== 'face' && q[1] !== 'look'; }); }
  function lookAt(u){
    b.idle = false;
    b.lkX = Math.max(-38, Math.min(38, (u.x - b.x)/7));
    b.lkY = Math.max(-22, Math.min(22, -(u.y - b.y)/9));
    clearTimeout(lookTimer);
    lookTimer = setTimeout(function(){ if (!P){ b.idle = true; b.lkX = 0; b.lkY = 0; } }, 1800);
  }
  this.say = function(){};                         // the page sets this to caption what he does

  host.addEventListener('pointermove', function(e){
    var u = units(e);
    if (!P){ lookAt(u); return; }
    var moved = Math.hypot(u.x - P.u0.x, u.y - P.u0.y);
    P.samples.push(u); while (P.samples.length > 6) P.samples.shift();
    if (P.mode === 'press' && moved > 14 && performance.now() - P.u0.t < 450 && P.body){
      /* DRAG: he comes along, surprised and then delighted */
      P.mode = 'drag'; clearTimeout(P.petTimer); fresh();
      var F = b.flight; F.on = true; F.drag = true; F.x = b.x; F.y = b.y; F.vx = 0; F.vy = 0;
      P.off = {x: b.x - P.u0.x, y: b.y - P.u0.y};
      b.verb('face', 'surprised'); later(.3, 'face', 'happy'); self.say('drag');
    }
    if (P.mode === 'drag'){
      b.flight.tx = Math.max(-270, Math.min(270, u.x + P.off.x));
      b.flight.ty = Math.max(-270, Math.min(205, u.y + P.off.y));
    }
    if (P.mode === 'pet') lookAt(u);               // stroking: the eyes stay shut, the head follows
  });

  host.addEventListener('pointerdown', function(e){
    try { host.setPointerCapture(e.pointerId); } catch (err) {}
    var u = units(e);
    P = {u0: u, mode: 'press', samples: [u], body: onBody(u)};
    if (P.body && !sulking){
      /* PET: a long, still press on him */
      P.petTimer = setTimeout(function(){
        if (!P || P.mode !== 'press') return;
        P.mode = 'pet'; fresh();
        b.verb('face', 'content'); later(.6, 'face', 'closed');
        b.verb('mode', {breathe: [.024, 4.2], spinMul: .5, idle: 0}); self.say('pet');
      }, 450);
    }
  });

  function up(e){
    if (!P) return;
    var u = units(e), mode = P.mode, dur = performance.now() - P.u0.t;
    clearTimeout(P.petTimer);
    if (mode === 'drag'){
      /* THROW: the finger's speed over its last ~100ms becomes his */
      var s = P.samples, a = s[0], z = s[s.length - 1], dt = Math.max(16, z.t - a.t)/1000;
      var F = b.flight; F.drag = false; F.hits = 0; F.rest = 0;
      F.vx = Math.max(-4200, Math.min(4200, (z.x - a.x)/dt));
      F.vy = Math.max(-4200, Math.min(4200, (z.y - a.y)/dt));
      var fast = Math.hypot(F.vx, F.vy) > 1400;
      if (fast){ b.verb('face', 'surprised'); self.say('throw'); }
      F.onRest = function(){
        fresh(); b.verb('face', F.hits > 2 ? 'happy' : 'content');
        if (F.hits > 2){ b.verb('burst', 1); }
        later(1.0, 'face', 'calm'); later(1.1, 'to', 0, 0); later(1.1, 'mode', {idle: 1});
        self.say(F.hits > 2 ? 'landed-fun' : 'landed');
      };
    } else if (mode === 'pet'){
      fresh(); b.verb('face', 'happy'); b.verb('blink');
      b.verb('mode', {breathe: [.014, 3.6], spinMul: 1, idle: 1}); later(1.2, 'face', 'calm');
      self.say('pet-end');
    } else if (dur < 260 && P.body){
      tap();
    }
    P = null;
  }
  host.addEventListener('pointerup', up);
  host.addEventListener('pointercancel', up);

  /* TAP: a giggle. Too many, too fast, and he takes offence - and forgives. */
  function tap(){
    var now = performance.now();
    if (sulking){ b.verb('squash', 1.2); return; }
    fresh();
    taps = taps.filter(function(t){ return now - t < 2600; }); taps.push(now);
    if (taps.length >= 5){
      taps = []; sulking = 1;
      b.verb('face', 'sad'); b.idle = false; b.lkX = (Math.random() < .5 ? -1 : 1)*40; b.lkY = -6;
      b.verb('gate', .93); self.say('sulk');
      setTimeout(function(){
        sulking = 0; b.lkX = 0; b.lkY = 0; b.verb('blink'); b.verb('gate', 1);
        b.verb('face', 'content'); later(.9, 'face', 'calm'); b.idle = true; self.say('forgive');
      }, 2200);
      return;
    }
    b.verb('face', 'happy'); b.verb('squash', 3.2); b.verb('hop', 45); b.verb('burst', .9);
    later(1.0, 'face', 'calm'); self.say('tap');
  }
}

/* ═══════════════════════ 2. the day's reflection ═══════════════════════ */
var REFLECT = {
  breath: {dur: 9400, ev: [[0, 'mode', {breathe: [0, 3.6], spinMul: .35, idle: 0}], [0, 'face', 'calm'],
    [300, 'fx', {t: 'rings', v: {sc: [1.1, 1.13, 1.16]}, d: 4000, s: 120}], [300, 'fx', {t: 'me', v: {gT: 1.06}, d: 4000}],
    [4900, 'fx', {t: 'rings', v: {sc: 1}, d: 4200, s: 120}], [4900, 'fx', {t: 'me', v: {gT: 1}, d: 4200}],
    [5000, 'face', 'content'], [5900, 'face', 'closed'], [9200, 'face', 'calm']]},
  great: function(){ return byId(COMBO_LIST, 'party'); },
  good: {dur: 3200, ev: [[0, 'face', 'happy'], [150, 'hop', 90], [150, 'burst', 1.2], [1500, 'face', 'content'], [2900, 'face', 'calm']]},
  okay: {dur: 3000, ev: [[0, 'face', 'content'], [300, 'nod', 1, 10], [2600, 'face', 'calm']]},
  hard: function(){ return byId(COMBO_LIST, 'comfort'); },
  /* the worst day gets the slowest answer: he stays down with her first */
  bad: {dur: 7600, ev: [[0, 'face', 'sad'], [0, 'to', 0, 30], [0, 'mode', {breathe: [.02, 5.2], idle: 0, spinMul: .5}],
    [2600, 'look', 0, 10], [3400, 'to', 0, 0], [3500, 'face', 'calm'], [4200, 'look', 0, 0], [4400, 'nod', 1, 7],
    [5200, 'face', 'content'], [7200, 'face', 'calm']]},
  halo: function(){ return byId(SPECIAL_LIST, 'halo'); }
};

/* ═══════════════════════ 3. the streak, worn as light ═══════════════════════ */
var MILESTONES = [7, 30, 100, 365];
function streakGlow(days){ return Math.min(1, Math.log(1 + days)/Math.log(101)); }

/* ═══════════════════════ 4. the clock ═══════════════════════
   The app's day ends at 04:00, so midnight to four is still TONIGHT. */
function phaseOf(min){
  if (min >= 240 && min < 450) return 'morning';
  if (min >= 450 && min < 1110) return 'day';
  if (min >= 1110 && min < 1350) return 'evening';
  return 'night';
}
var CLOCK = {
  morning: function(){ return once(byId(SPECIAL_LIST, 'sunrise')); },
  day: {dur: 1e9, ev: [[0, 'face', 'calm'], [0, 'to', 0, 0], [0, 'mode', {breathe: [.014, 3.6], spinMul: 1, idle: 1}]]},
  evening: {dur: 1e9, ev: [[0, 'face', 'content'], [0, 'fx', {t: 'body', v: {bri: .96}, d: 1500}],
    [0, 'mode', {breathe: [.016, 4.6], spinMul: .7, idle: 1}], [1800, 'face', 'calm']]},
  night: {dur: 1e9, ev: [[0, 'face', 'sleepy'], [0, 'mode', {idle: 0, breathe: [.024, 5.2], spinMul: .35}],
    /* dimmed only a little: at .8 / .85 he went a muddy brown, not asleep */
    [0, 'fx', {t: 'body', v: {bri: .9, sat: .95}, d: 1800}], [0, 'to', 0, 24], [1400, 'face', 'closed']]}
};
