/* Beem's engine - shared by beem-ten.html and the character sheet, so the two
   can never show two different Beems. Everything in it is drawn from the canon
   files (sun-body.png, its eyeless twin beem-body.png, the three rings); nothing
   is redrawn and no asset is written. Moved here unchanged from beem-ten.html,
   except that the reconstruction proof is now data (PROOF) for a page to print. */
(function(){
  var s = document.createElement('style');
  s.textContent =
    '.beem{position:absolute;inset:0}' +
    '.beem .lay{position:absolute;inset:0;will-change:transform}' +
    '.beem img,.beem canvas{position:absolute;inset:0;width:100%;height:100%;display:block}' +
    /* the body squashes onto its CONTACT POINT: the sphere's lowest pixel is
       499.2+237.6 = 737 of 1024 (its centre is not the frame's), 71.97% */
    '.beem .body{transform-origin:49.64% 71.97%}' +
    '.beem .shadow{position:absolute;left:49.64%;top:75%;width:36%;height:5.5%;border-radius:50%;' +
      'background:radial-gradient(closest-side,rgba(120,92,60,.40),rgba(120,92,60,0));' +
      'transform:translateX(-50%);opacity:0;will-change:transform,opacity}';
  document.head.appendChild(s);
})();
/* ═══════════════════════ the canon, and its own eyes ═══════════════════════ */
var ASSET = '../assets/';
/* the sphere's centre is NOT the frame's centre. Fitted to its opacity edge
   over 360 rays: (508.3, 499.2), radius 237.6 - the README's 238. Assuming
   (512,512) put the halo's seam 20px off the rim at the bottom and showed as a
   thin bright arc detached from the body. Note the eyes, at y 499, sit exactly
   on the equator, and the pair is turned a few degrees to the left. */
var VB = 1024, SPH = {x:508.3, y:499.2, r:237.6};
/* README: eye centres x 414 and 589, y 499. Everything below is measured from
   these, so a look of (0,0) puts each eye exactly where the render put it. */
var EYES = [{cx:414, cy:499}, {cx:589, cy:499}];
var RAD = Math.PI / 180;
var LAM0 = EYES.map(function(e){ return Math.asin((e.cx - SPH.x) / SPH.r); });
var MU0  = Math.asin((EYES[0].cy - SPH.y) / SPH.r);
var WIN = {w:150, h:260, top:370};          // the window each eye is lifted from

var EB = null, SPR = [], PROOF = null;
var SCR = document.createElement('canvas'), SW = 280, SH = 380;
SCR.width = SW; SCR.height = SH;
var SG = SCR.getContext('2d');

function load(src){
  return new Promise(function(res, rej){
    var i = new Image(); i.onload = function(){ res(i); }; i.onerror = rej; i.src = ASSET + src;
  });
}
function pixels(img){
  var c = document.createElement('canvas'); c.width = c.height = VB;
  var x = c.getContext('2d', {willReadFrequently:true}); x.drawImage(img, 0, 0);
  return x.getImageData(0, 0, VB, VB).data;
}
function lum(a, i){ return 0.299*a[i] + 0.587*a[i+1] + 0.114*a[i+2]; }

/* UN-BLENDING THE EYES OFF THE BODY.
   The canon pixel S is the eye (colour C, coverage a) over the body B:
       S = a·C + (1-a)·B
   B is known exactly - it is the eyeless twin. The eye's interior (found by
   flood-filling from the window's border over everything that is NOT clearly
   eye) is fully covered, a = 1, and that includes the highlights. Only the
   rim is fractional: its coverage comes from how far it darkened the body
   toward the eye's colour, and C is then SOLVED, so that drawing C at a over
   B returns S. Which is what the proof at the top measures. */
function extract(sImg, bImg){
  var S = pixels(sImg), B = pixels(bImg);
  var eb = document.createElement('canvas'); eb.width = eb.height = VB;
  var ex = eb.getContext('2d'); ex.drawImage(sImg, 0, 0);
  var out = [];
  EYES.forEach(function(E){
    var x0 = E.cx - WIN.w/2, y0 = WIN.top, W = WIN.w, H = WIN.h, N = W*H, p, px, py, i;
    ex.clearRect(x0, y0, W, H); ex.drawImage(bImg, x0, y0, W, H, x0, y0, W, H);
    var strong = new Uint8Array(N), outside = new Uint8Array(N);
    for (p = 0; p < N; p++){ px = p % W; py = (p / W) | 0; i = ((y0+py)*VB + x0+px)*4;
      strong[p] = Math.abs(lum(S,i) - lum(B,i)) > 40 ? 1 : 0; }
    var st = [];
    for (px = 0; px < W; px++) st.push(px, (H-1)*W + px);
    for (py = 0; py < H; py++) st.push(py*W, py*W + W-1);
    while (st.length){ p = st.pop(); if (outside[p] || strong[p]) continue; outside[p] = 1;
      px = p % W; py = (p / W) | 0;
      if (px > 0) st.push(p-1); if (px < W-1) st.push(p+1);
      if (py > 0) st.push(p-W); if (py < H-1) st.push(p+W); }
    var dist = new Uint8Array(N).fill(9);
    for (p = 0; p < N; p++) if (outside[p]) dist[p] = 0;
    for (var pass = 1; pass <= 3; pass++) for (p = 0; p < N; p++) if (dist[p] === 9){
      px = p % W; py = (p / W) | 0; var q = pass - 1;
      if ((px > 0 && dist[p-1] === q) || (px < W-1 && dist[p+1] === q) ||
          (py > 0 && dist[p-W] === q) || (py < H-1 && dist[p+W] === q)) dist[p] = pass; }
    var img = new ImageData(W, H), d = img.data;
    for (p = 0; p < N; p++){
      px = p % W; py = (p / W) | 0; i = ((y0+py)*VB + x0+px)*4;
      var lb = lum(B,i), ls = lum(S,i), a;
      if (dist[p] >= 3) a = 1;
      else if (ls <= lb) a = Math.min(1, (lb - ls) / Math.max(1, lb - 28));
      else a = Math.min(1, (ls - lb) / Math.max(1, 255 - lb));
      if (a < 0.012) continue;
      for (var c = 0; c < 3; c++){ var v = (S[i+c] - (1-a)*B[i+c]) / a;
        d[p*4+c] = v < 0 ? 0 : v > 255 ? 255 : v; }
      d[p*4+3] = Math.round(a * 255);
    }
    var spr = document.createElement('canvas'); spr.width = W; spr.height = H;
    spr.getContext('2d').putImageData(img, 0, 0);
    /* THE CLOSED EYE, without inventing one. The lower half of the eye carries
       no highlight - measured down the centre column, every row from 468 to
       576 is dark - so the eye's own lower half, mirrored onto the top, is the
       same eye with the shine taken out. A blink squashes into THAT. */
    var axis = 503 - y0;
    var dk = document.createElement('canvas'); dk.width = W; dk.height = H;
    var dx = dk.getContext('2d');
    dx.drawImage(spr, 0, axis, W, H - axis, 0, axis, W, H - axis);
    dx.save(); dx.translate(0, 2*axis); dx.scale(1, -1);
    dx.drawImage(spr, 0, axis, W, H - axis, 0, axis, W, H - axis); dx.restore();
    out.push({spr:spr, dark:dk, x0:x0, y0:y0, cx:E.cx - x0, cy:E.cy - y0});
  });
  healHalo(ex);
  EB = eb; SPR = out;

  /* the proof: rebuild the calm face from the parts and compare with the canon */
  var rc = document.createElement('canvas'); rc.width = rc.height = VB;
  var rx = rc.getContext('2d', {willReadFrequently:true});
  rx.drawImage(EB, 0, 0);
  SPR.forEach(function(s){ rx.drawImage(s.spr, s.x0, s.y0); });
  var R = rx.getImageData(0, 0, VB, VB).data, sum = 0, n = 0, worst = 0, esum = 0, en = 0;
  for (var y = 0; y < VB; y++) for (var x = 0; x < VB; x++){
    if (Math.hypot(x - SPH.x, y - SPH.y) > SPH.r - 2) continue;
    var j = (y*VB + x)*4;
    var dd = (Math.abs(R[j]-S[j]) + Math.abs(R[j+1]-S[j+1]) + Math.abs(R[j+2]-S[j+2])) / 3;
    sum += dd; n++; if (dd > worst) worst = dd;
    var inEye = EYES.some(function(e){ return Math.abs(x-e.cx) < 60 && Math.abs(y-e.cy) < 110; });
    if (inEye){ esum += dd; en++; }
  }
  PROOF = {mean: sum/n, eye: esum/en, worst: worst};
}

/* THE GHOSTS IN THE HALO. When the beads were cut out of the render into the
   three ring layers, the glow they sat in stayed in the body layer - with a
   bead-shaped HOLE where every bead had been. While the rings stand still each
   bead covers its own hole, so the sheet looked whole. The moment a ring turns,
   the holes show as pale discs on the glow and the colour seems to leak: that
   is what he saw on the phone. Measured on the layer: at the inner ring's
   radius the MEDIAN coverage around the circle is 0 - more hole than glow.

   The heal works outside the sphere only (from r 246; the face, rim and body
   are never touched). For every radius it takes the glow as it is where no
   bead ever was - the upper end of the coverage around that circle - and lays
   that down as one continuous halo. Bead fragments left at the sphere's edge
   (pure red, not glow) are excluded from it. */
function healHalo(ctx){
  var img = ctx.getImageData(0, 0, VB, VB), d = img.data, RMAX = 730, A = 2048;
  var prof = [];
  for (var r = 234; r <= RMAX; r++){
    var cov = [], col = [];
    for (var k = 0; k < A; k++){
      var t = k / A * Math.PI * 2, px = Math.round(SPH.x + r*Math.cos(t)), py = Math.round(SPH.y + r*Math.sin(t));
      if (px < 0 || py < 0 || px >= VB || py >= VB) continue;
      var i = (py*VB + px)*4;
      var bead = d[i] > 190 && d[i+1] < 120 && d[i+2] < 110 && d[i+3] > 150;   // a red fragment
      if (!bead){ cov.push(d[i+3]); col.push(i); }
    }
    if (!cov.length){ prof[r] = [0,0,0,0]; continue; }
    var sorted = cov.slice().sort(function(a, b){ return a - b; });
    var top = sorted[Math.floor(sorted.length*0.9)], sr = 0, sg = 0, sb = 0, n = 0;
    for (k = 0; k < cov.length; k++) if (cov[k] >= top*0.85 && cov[k] > 0){
      var j = col[k]; sr += d[j]; sg += d[j+1]; sb += d[j+2]; n++; }
    prof[r] = n ? [sr/n, sg/n, sb/n, top] : [0,0,0,0];
  }
  for (var y = 0; y < VB; y++) for (var x = 0; x < VB; x++){
    var rr = Math.hypot(x - SPH.x, y - SPH.y);
    if (rr < 240) continue;
    var w = Math.min(1, (rr - 240) / 6);                // a 6px seam, so the rim stays the render's
    var r0 = Math.min(RMAX - 1, Math.floor(rr)), f = Math.min(1, rr - r0);
    var p0 = prof[r0], p1 = prof[r0 + 1] || p0, q = (y*VB + x)*4;
    var a = (p0[3]*(1-f) + p1[3]*f) * w + d[q+3]*(1 - w);
    for (var c = 0; c < 3; c++){
      var hv = p0[c]*(1-f) + p1[c]*f, ov = d[q+c];
      /* blend in premultiplied terms, then back */
      var pm = hv*(p0[3]*(1-f) + p1[3]*f)*w + ov*d[q+3]*(1 - w);
      d[q+c] = a > 0 ? Math.min(255, pm / a) : 0;
    }
    d[q+3] = a;
  }
  ctx.putImageData(img, 0, 0);
}

/* ═══════════════════════ the ten faces ═══════════════════════
   Every number is an operation on the canon eye, never a new shape:
     s, sx, sy   scale            top, ang   a straight cut from above, tilted
     bot         an arc cut from below - push it far and an oval becomes ∩
     lx, ly      a look, in degrees across the sphere      dy, rot   nudge, tilt
     dark        the eye's own shine-free lower half, for a closed eye        */
var BASE = {s:1, sx:1, sy:1, top:0, ang:0, bot:0, dy:0, rot:0, dark:0, lx:0, ly:0};
var FACES = {
  calm:       {},
  happy:      {bot:.74, dy:-6},
  content:    {bot:.55, sy:.92, dy:-3},
  wink:       [{bot:.24, dy:-3}, {sy:.11, dark:1, dy:4, rot:-7}],
  surprised:  {s:1.22, dy:-12, ly:3},
  curious:    [{lx:16, top:.14, ang:-6, rot:-5}, {lx:16, s:1.06, rot:-5}],
  thinking:   {lx:-13, ly:15, bot:.20},
  determined: {top:.36, ang:17, sy:.97},
  sad:        {top:.30, ang:-26, dy:8, ly:-11, s:.94},
  sleepy:     {top:.56, ang:-3, dy:6},
  closed:     {sy:.09, dark:1, dy:4}
};
function faceOf(name){
  var f = FACES[name], L = Array.isArray(f) ? f[0] : f, R = Array.isArray(f) ? f[1] : f;
  return [Object.assign({}, BASE, L), Object.assign({}, BASE, R)];
}
function smooth(a, b, v){ var t = Math.max(0, Math.min(1, (v - a)/(b - a))); return t*t*(3 - 2*t); }

/* ═══════════════════════ one Beem ═══════════════════════ */
var SPIN = [360/22, 360/30, 360/40];
var LAG = [0.115, 0.072, 0.046];            // per 60fps frame, from beem-soft
var LAGCAP = 90;                             // in 1024 units: 15px at 170px
var G = 8700;                                // gravity, 1024 units / s²
var CONTACT = 225;                           // ring centre (512) to the sphere's lowest point (737)

function Beem(host){
  host.innerHTML = '<div class="beem"><div class="shadow"></div>' +
    ['r1','r2','r3'].map(function(n){
      return '<div class="lay ring"><img src="' + ASSET + 'sun-' + n + '.png" alt=""></div>'; }).join('') +
    '<div class="lay body"><canvas></canvas></div></div>';
  this.host = host;
  this.rings = [].slice.call(host.querySelectorAll('.ring'));
  this.bodyEl = host.querySelector('.body');
  this.cv = host.querySelector('canvas');
  this.cx = this.cv.getContext('2d');
  this.shadow = host.querySelector('.shadow');
  this.visible = true; this.speed = 1;
  this.reset();
}
Beem.prototype.reset = function(){
  this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.tx = 0; this.ty = 0; this.air = false;
  this.sq = 0; this.sqv = 0; this.st = 0; this.stv = 0; this.stT = 0;
  this.gate = 1; this.gv = 0; this.gT = 1; this.rg = [1,1,1];
  this.rx = [0,0,0]; this.ry = [0,0,0]; this.rsq = [0,0,0];
  this.spin = this.spin || [Math.random()*360, Math.random()*360, Math.random()*360];
  this.sv = [0,0,0]; this.spinAdd = 0; this.spinMul = 1;
  this.burst = [0,0,0]; this.bv = [0,0,0]; this.pend = [];
  this.lookX = 0; this.lookY = 0; this.lvx = 0; this.lvy = 0; this.lkX = 0; this.lkY = 0;
  this.breathe = [0.012, 3.6]; this.float = 0; this.idle = false; this.idleAt = 3 + Math.random()*3;
  this.fp = faceOf('calm'); this.ft = faceOf('calm'); this.faceName = 'calm';
  this.blinkT = -1; this.nextBlink = 1.2 + Math.random()*2.5; this.t = 0; this.st0 = 0;
};
Beem.prototype.play = function(script){
  this.script = script; this.reset(); this.sT = 0; this.fired = 0;
  this.ev = script.ev.slice().sort(function(a, b){ return a[0] - b[0]; });
};
/* the verbs - every moment on the page is a list of these */
Beem.prototype.verb = function(v, a, b, c){
  var self = this;
  switch (v){
    case 'face':  this.ft = faceOf(a); this.faceName = a; break;
    /* a big change of gaze carries a blink - the animator's trick for hiding
       the moment the eyes change direction, and the eyes still lead the body */
    case 'look':  if (Math.hypot(a - this.lkX, b - this.lkY) > 18 && this.blinkT < 0 &&
                      this.faceName !== 'closed') this.blinkT = 0;
                  this.lkX = a; this.lkY = b; break;
    case 'to':    this.tx = a; this.ty = b; break;
    case 'snap':  if ('y' in a){ this.y = a.y; this.ty = a.ty != null ? a.ty : 0; }
                  if ('gate' in a){ this.gate = a.gate; this.gT = a.gate; this.rg = [a.gate,a.gate,a.gate]; }
                  if (a.air){ this.air = true; this.vy = 0; } break;
    case 'gate':  this.gT = a; break;
    case 'mode':  if (a.breathe) this.breathe = a.breathe; if ('float' in a) this.float = a.float;
                  if ('idle' in a) this.idle = !!a.idle; if ('spinAdd' in a) this.spinAdd = a.spinAdd;
                  if ('spinMul' in a) this.spinMul = a.spinMul; break;
    case 'stretch': this.stT = a; break;
    case 'blink': this.blinkT = 0; break;
    case 'burst': [0,1,2].forEach(function(i){ self.pend.push([self.sT + i*0.055, 'kick', a*(1 - i*0.08), i]); }); break;
    case 'spin':  this.sv = [a, -a*0.76, a*0.55]; break;
    case 'squash': this.sqv += a; break;
    /* a hop is three beats: crouch (the anticipation, OPPOSITE the jump),
       launch, and the landing the floor gives back */
    case 'hop':   if (this.air){ this.pend.push([this.sT + 0.05, 'hopWhenDown', a]); break; }
                  this.sqv += 3.4 + a/120;
                  this.pend.push([this.sT + 0.11, 'launch', a]); break;
    case 'launch': this.air = true; this.vy = -Math.sqrt(2*G*a); this.sq = Math.min(this.sq, 0.05); break;
    case 'hopWhenDown': if (this.air) this.pend.push([this.sT + 0.03, 'hopWhenDown', a]);
                        else this.verb('hop', a); break;
    case 'kick':  this.bv[b] += a*6; break;
    case 'nod':   for (var k = 0; k < a; k++){ var o = this.sT + k*0.36;
                    this.pend.push([o, 'look', 0, -b], [o + 0.03, 'to', 0, b*1.4],
                                   [o + 0.18, 'look', 0, b*0.35], [o + 0.21, 'to', 0, -b*0.25]); }
                  this.pend.push([this.sT + a*0.36 + 0.02, 'look', 0, 0], [this.sT + a*0.36 + 0.05, 'to', 0, 0]); break;
    case 'shake': for (k = 0; k < a*2; k++){ var sgn = k % 2 ? -1 : 1, o2 = this.sT + k*0.17;
                    this.pend.push([o2, 'look', b*sgn, 0], [o2 + 0.04, 'to', b*sgn*0.7, 0]); }
                  this.pend.push([this.sT + a*0.34, 'look', 0, 0], [this.sT + a*0.34 + 0.04, 'to', 0, 0]); break;
    case 'wiggle': for (k = 0; k < a; k++) this.pend.push([this.sT + k*0.40, 'hop', b*(k === a-1 ? 1.4 : 1)]); break;
  }
};
Beem.prototype.step = function(dt){
  var self = this, i;
  dt *= this.speed;
  this.t += dt;
  /* the script runs on THIS clock, integrated from dt - so a background tab
     pauses the moment instead of firing every queued event at once */
  if (this.script){
    this.sT += dt;
    while (this.fired < this.ev.length && this.ev[this.fired][0] / 1000 <= this.sT){
      var e = this.ev[this.fired++]; this.verb(e[1], e[2], e[3], e[4]); }
    this.pend.sort(function(a, b){ return a[0] - b[0]; });
    while (this.pend.length && this.pend[0][0] <= this.sT){
      var q = this.pend.shift(); this.verb(q[1], q[2], q[3], q[4]); }
    if (this.sT * 1000 >= this.script.dur) this.play(this.script);
  }

  /* tier two of idle, and never the same loop twice. Duolingo's Lily has 8
     head x 8 body idles combining into 64+ variations, so an idle never reads
     as a loop. Here: a look (random direction and length) combined with one of
     five small acts, or none - every pause is a different pair. */
  if (this.idle){
    this.idleAt -= dt;
    if (this.idleAt <= 0){
      if (this.lkX === 0 && this.lkY === 0){
        var dir = Math.random() < .5 ? -1 : 1, act = Math.floor(Math.random()*6), o = this.sT;
        this.verb('look', dir*(12 + Math.random()*16), -4 + Math.random()*12);
        if (act === 0) this.pend.push([o + 0.25, 'hop', 28]);                         // a tiny settle
        if (act === 1) this.pend.push([o + 0.20, 'spin', 55*dir]);                    // the rings stir
        if (act === 2) this.pend.push([o + 0.10, 'face', 'sleepy'], [o + 0.15, 'stretch', .07],
                                      [o + 0.75, 'stretch', 0], [o + 0.85, 'face', 'calm']);   // a yawn
        if (act === 3) this.pend.push([o + 0.30, 'face', 'curious'], [o + 1.10, 'face', 'calm']);
        if (act === 4) this.pend.push([o + 0.45, 'blink'], [o + 0.70, 'blink']);      // a double take
        this.idleAt = 0.9 + Math.random()*0.8;
      } else { this.verb('look', 0, 0); this.idleAt = 3.0 + Math.random()*3.5; }
    }
  }

  /* the eyes lead: a stiff spring, a touch of overshoot */
  var ax = (this.lkX - this.lookX)*170 - this.lvx*19, ay = (this.lkY - this.lookY)*170 - this.lvy*19;
  this.lvx += ax*dt; this.lvy += ay*dt; this.lookX += this.lvx*dt; this.lookY += this.lvy*dt;

  /* the body follows the path, the look, and gravity when it is in the air */
  var ft = this.float ? this.float*Math.sin(this.t*1.15) : 0;
  var fy = this.float ? this.float*0.62*Math.sin(this.t*2.30 + 0.6) : 0;
  var gx = this.tx + ft + this.lookX*0.9, gy = this.ty + fy;
  var bx = (gx - this.x)*90 - this.vx*10.5;
  this.vx += bx*dt; this.x += this.vx*dt;
  if (this.air){
    this.vy += G*dt; this.y += this.vy*dt;
    if (this.y >= this.ty && this.vy > 0){
      this.y = this.ty;
      if (this.vy > 520){ this.sqv += Math.min(9, this.vy*0.0017); this.vy = -this.vy*0.40; }
      else { this.vy = 0; this.air = false; }
    }
  } else {
    var by = (gy - this.y)*90 - this.vy*10.5;
    this.vy += by*dt; this.y += this.vy*dt;
  }

  this.sqv += (-this.sq*260 - this.sqv*17)*dt;
  this.sq = Math.max(-0.03, Math.min(0.30, this.sq + this.sqv*dt));
  this.stv += ((this.stT - this.st)*140 - this.stv*15)*dt; this.st += this.stv*dt;
  this.gv += ((this.gT - this.gate)*310 - this.gv*21)*dt; this.gate = Math.max(0, this.gate + this.gv*dt);

  for (i = 0; i < 3; i++){
    var kk = 1 - Math.pow(1 - LAG[i], dt*60);
    this.rx[i] += (this.x - this.rx[i])*kk; this.ry[i] += (this.y - this.ry[i])*kk;
    this.rx[i] = this.x - Math.max(-LAGCAP, Math.min(LAGCAP, this.x - this.rx[i]));
    this.ry[i] = this.y - Math.max(-LAGCAP, Math.min(LAGCAP, this.y - this.ry[i]));
    this.rsq[i] += (this.sq - this.rsq[i])*Math.min(1, kk*2.6);
    /* arriving, the rings come after the body; leaving, they go FIRST - a
       ring that outlives the body was a dotted circle left on an empty stage */
    this.rg[i] += (this.gate - this.rg[i])*Math.min(1, kk*(this.gate < this.rg[i] ? 7 : 1.9));
    this.bv[i] += ((0 - this.burst[i])*120 - this.bv[i]*9)*dt; this.burst[i] += this.bv[i]*dt;
    this.spin[i] = (this.spin[i] + (SPIN[i]*this.spinMul + this.sv[i] +
      this.spinAdd*[1,-0.76,0.55][i])*dt) % 360;
    this.sv[i] -= this.sv[i]*0.9*dt;
  }

  this.fp.forEach(function(p, j){
    var T = self.ft[j], k = 1 - Math.exp(-dt/0.06);
    for (var key in T) p[key] += (T[key] - p[key])*k;
  });

  /* blink: never a metronome */
  var shut = this.faceName === 'closed' || this.faceName === 'sleepy';
  this.nextBlink -= dt;
  if (this.nextBlink <= 0 && this.blinkT < 0 && !shut){ this.blinkT = 0;
    this.nextBlink = 2.4 + Math.random()*3.1;
    if (Math.random() < 0.2) this.pend.push([this.sT + 0.27, 'blink']); }
  if (this.blinkT >= 0){ this.blinkT += dt; if (this.blinkT > 0.21) this.blinkT = -1; }
};
Beem.prototype.blinkV = function(){
  var t = this.blinkT; if (t < 0) return 0;
  if (t < 0.07) return (t/0.07)*(t/0.07);
  if (t < 0.10) return 1;
  var u = (t - 0.10)/0.11; return 1 - (1 - (1-u)*(1-u));
};
Beem.prototype.paint = function(){
  var host = this.host, css = host.clientWidth; if (!css) return;
  var dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.min(VB, Math.round(css*dpr));
  if (this.cv.width !== W){ this.cv.width = W; this.cv.height = W; }
  var k = W / VB, kc = css / VB, x = this.cx;
  x.setTransform(1,0,0,1,0,0); x.clearRect(0, 0, W, W);
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  x.drawImage(EB, 0, 0, W, W);
  x.save(); x.beginPath(); x.arc(SPH.x*k, SPH.y*k, (SPH.r - 1)*k, 0, Math.PI*2); x.clip();
  for (var i = 0; i < 2; i++) this.eye(x, i, k);
  x.restore();

  /* capped at 6%: the model sheet already caught the poses turning him into
     an egg, and a stretch that reads as a different shape is not a stretch */
  var sp = Math.hypot(this.vx, this.vy), e = Math.min(0.06, sp*0.00004);
  var ang = sp > 8 ? Math.atan2(this.vy, this.vx)/RAD : 0;
  var br = 1 + this.breathe[0]*Math.sin(this.t*2*Math.PI/this.breathe[1]);
  var sx = (1/(1 - this.sq))/(1 + this.st), sy = (1 - this.sq)*(1 + this.st);
  this.bodyEl.style.transform =
    'translate(' + (this.x*kc).toFixed(2) + 'px,' + (this.y*kc).toFixed(2) + 'px) ' +
    'scale(' + this.gate.toFixed(4) + ') rotate(' + ang.toFixed(2) + 'deg) ' +
    'scale(' + (br*(1 + e)).toFixed(4) + ',' + (br/(1 + e)).toFixed(4) + ') ' +
    'rotate(' + (-ang).toFixed(2) + 'deg) scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')';
  for (i = 0; i < 3; i++){
    var g = this.rg[i]*(1 + this.burst[i]*0.16)*br, rs = this.rsq[i];
    /* ring squash and size act about the CONTACT point, like the body's -
       done by hand so the spin can stay about the centre */
    var drop = CONTACT*(1 - this.rg[i]) + CONTACT*rs*this.rg[i];
    this.rings[i].style.transform =
      'translate(' + (this.rx[i]*kc).toFixed(2) + 'px,' + ((this.ry[i] + drop)*kc).toFixed(2) + 'px) ' +
      'scale(' + (g/(1 - rs)).toFixed(4) + ',' + (g*(1 - rs)).toFixed(4) + ') ' +
      'rotate(' + this.spin[i].toFixed(2) + 'deg)';
  }
  var h = Math.max(0, -this.y), below = Math.max(0, Math.min(1, 1 - this.y/120));
  this.shadow.style.opacity = (Math.max(0.04, 0.46 - h/950)*this.gate*below).toFixed(3);
  this.shadow.style.transform = 'translateX(-50%) scale(' +
    Math.max(0.3, (1 + this.sq*1.5 - h/1500)*this.gate).toFixed(3) + ',1)';
};
/* ONE EYE: the canon sprite, moved across the sphere, scaled, then cut */
Beem.prototype.eye = function(ctx, i, k){
  var p = this.fp[i], s = SPR[i], g = SG;
  var lam = LAM0[i] + (this.lookX + p.lx)*RAD, mu = MU0 - (this.lookY + p.ly)*RAD;
  if (Math.cos(lam) <= 0.02) return;
  var ex = SPH.x + SPH.r*Math.sin(lam), ey = SPH.y + SPH.r*Math.sin(mu) + p.dy;
  var fx = Math.cos(lam)/Math.cos(LAM0[i]), fy = Math.cos(mu)/Math.cos(MU0);
  var b = this.blinkV();
  var sx = p.s*p.sx*fx, sy = Math.max(0.02, p.s*p.sy*fy*(1 - 0.91*b));
  var dark = Math.max(Math.min(1, p.dark), smooth(0.3, 0.75, b), smooth(0.45, 0.2, sy));
  var rot = p.rot*RAD*(i ? -1 : 1);
  g.setTransform(1,0,0,1,0,0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.clearRect(0, 0, SW, SH);
  g.setTransform(1,0,0,1,SW/2,SH/2); g.rotate(rot); g.scale(sx, sy);
  if (dark > 0.001) g.drawImage(s.dark, -s.cx, -s.cy);
  if (dark < 0.999){ g.globalAlpha = 1 - dark; g.drawImage(s.spr, -s.cx, -s.cy); g.globalAlpha = 1; }
  g.setTransform(1,0,0,1,SW/2,SH/2); g.rotate(rot);
  var hw = 41.5*sx + 6, hh = 86*sy;
  g.globalCompositeOperation = 'destination-out';
  if (p.top > 0.002){
    var base = -hh + p.top*2*hh, t = Math.tan(p.ang*RAD)*(i ? -1 : 1);
    g.beginPath(); g.moveTo(-hw*3, -SH); g.lineTo(hw*3, -SH);
    g.lineTo(hw*3, base + t*hw*3); g.lineTo(-hw*3, base - t*hw*3); g.closePath(); g.fill();
  }
  if (p.bot > 0.002){
    g.beginPath(); g.ellipse(0, (2.08 - 2*p.bot)*hh, hw*1.32, hh*1.06, 0, 0, Math.PI*2); g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  ctx.drawImage(SCR, (ex - SW/2)*k, (ey - SH/2)*k, SW*k, SH*k);
};

/* ═══════════════════════ the thirty ═══════════════════════ */
function faceCard(name){
  return {dur:5200, ev:[[0,'mode',{breathe:[.012,3.6]}],[600,'face',name],[4500,'face','calm']]};
}
var FACE_LIST = [
  ['calm','רגוע','המקור עצמו, בלי שום שינוי. כל השאר יוצא ממנו.', {dur:5200, ev:[[0,'mode',{breathe:[.012,3.6]}]]}],
  ['happy','שמח','קשת מלמטה דוחפת את העין לצורת ∩. נשאר החלק העליון שלה, עם הברק.'],
  ['content','מרוצה','אותה קשת של שמח, רק רכה: העין נשארת עבה, כמו חיוך שקט בלי פה.'],
  ['wink','קורץ','עין אחת עצומה לגמרי, פס מוטה קלות. השנייה פתוחה ומחייכת, עם קשת עדינה מלמטה.'],
  ['surprised','מופתע','אותה עין, גדולה ב־22% ומורמת, מבט קל למעלה. הברק גדל איתה.'],
  ['curious','סקרן','מבט הצידה על הכדור, ראש מוטה ב־5°. העין הקרובה גדולה מעט והרחוקה מכווצת מלמעלה.'],
  ['thinking','חושב','מבט למעלה ולצד, 15° ו־13° על הכדור. כיווץ קל מלמטה, של ריכוז.'],
  ['determined','נחוש','חיתוך ישר מלמעלה ב־36%, נוטה ב־17° כלפי פנים. צורת V בלי גבה.'],
  ['sad','עצוב','חיתוך שנוטה ב־26° לכיוון ההפוך, כך שהפינות הפנימיות גבוהות. העיניים קטנות ב־6% ומביטות למטה.'],
  ['sleepy','ישנוני','חיתוך כמעט ישר של 56% מלמעלה. שבור ממצמוץ, והוא לא ממצמץ.']
];
var MOVE_LIST = [
  ['breathe','חיים במנוחה','שתי שכבות של חיים: נשימה של 1.4% כל 3.6 שניות, ומדי פעם מבט לכיוון אקראי יחד עם אחת מחמש פעולות קטנות (קפיצונת, ערבול טבעות, פיהוק, סקרנות, מצמוץ כפול) או בלי פעולה. ככה זה אף פעם לא אותה לולאה.',
    {dur:12000, ev:[[0,'mode',{breathe:[.014,3.6], idle:1}]]}],
  ['float','ריחוף','מסלול בצורת שמונה. הגוף נמתח לכיוון התנועה, והטבעות נגררות אחריו כל אחת בקצב שלה.',
    {dur:9000, ev:[[0,'mode',{breathe:[.008,3.2], float:52}]]}],
  ['hop','קפיצה','כריעה של 110ms, זינוק עם מתיחה, ונחיתה שמועכת לפי המהירות. ההקפצה מחזירה 40%.',
    {dur:2400, ev:[[400,'hop',190]]}],
  ['nod','הנהון','העיניים יורדות קודם והגוף צולל אחריהן. פעמיים.',
    {dur:2400, ev:[[350,'nod',2,15]]}],
  ['shake','שלילה','מבט ימינה ושמאלה על הכדור, והגוף נשען אחרי המבט. מעין "לא" עדין.',
    {dur:2600, ev:[[350,'shake',2,26]]}],
  ['wiggle','התרגשות','שלוש קפיצות קטנות ברצף, האחרונה גבוהה יותר. הטבעות מקבלות דחיפת סיבוב.',
    {dur:2800, ev:[[300,'wiggle',3,70],[1150,'spin',110]]}],
  ['popin','כניסה ויציאה','צמיחה מנקודת המגע עם קפיץ שעובר את היעד. הטבעות מגיעות אחרי הגוף, החיצונית אחרונה.',
    {dur:3000, ev:[[0,'snap',{gate:0}],[200,'gate',1],[2250,'gate',1.08],[2420,'gate',0]]}],
  ['drop','נפילה','נופל מחוץ לבמה עם כבידה אמיתית, וקופץ על הרצפה. הצל מתכהה ומתרחב כשהוא מתקרב.',
    {dur:2800, ev:[[0,'snap',{y:-760, air:1}]]}],
  ['peek','הצצה','עולה מתחתית הבמה עד חצי, מסתכל ימינה ושמאלה, ונעלם חזרה.',
    {dur:3400, ev:[[0,'snap',{y:600, ty:600}],[250,'to',0,330],[900,'look',-26,6],[1550,'look',26,6],[2200,'look',0,0],[2550,'to',0,620]]}],
  ['burst','פרץ אור','התכווצות של 10%, ואז הגוף משתחרר והטבעות נפתחות החוצה אחת אחרי השנייה ומסתחררות.',
    {dur:2800, ev:[[300,'gate',.9],[470,'gate',1],[470,'burst',2.5],[470,'spin',150]]}]
];
var COMBO_LIST = [
  ['wake','בוקר טוב','פתיחת היום הראשונה. ישן ונושם לאט, מתעורר בשני מצמוצים, מתמתח לגובה וקופץ בשמחה.',
    {dur:6200, ev:[[0,'face','closed'],[0,'mode',{breathe:[.022,4.2]}],[0,'snap',{y:26, ty:26}],
      [1700,'face','sleepy'],[2050,'face','calm'],[2060,'blink'],[2380,'blink'],[2500,'to',0,0],
      [2500,'mode',{breathe:[.012,3.6]}],[2750,'stretch',.15],[3250,'stretch',0],
      [3250,'face','happy'],[3300,'hop',130],[4600,'face','calm']]}],
  ['goal','יעד הושג','סגירת יעד יומי. מתכונן בנחישות, קופץ גבוה, ובשיא הקפיצה הטבעות נפתחות והוא שמח. נוחת מרוצה.',
    {dur:4800, ev:[[250,'face','determined'],[700,'hop',240],[1050,'face','happy'],[1050,'burst',2.6],
      [1050,'spin',170],[2300,'face','content'],[3800,'face','calm']]}],
  ['think','חושב','בזמן שהמתכנן בונה את היום. מרחף לאט, מביט למעלה, והטבעות מסתובבות זו נגד זו. בסוף רגע של "אהה!" וקפיצה קטנה.',
    {dur:5800, ev:[[0,'face','thinking'],[0,'mode',{float:24, spinAdd:70}],[3100,'mode',{float:0, spinAdd:0}],
      [3100,'face','surprised'],[3100,'squash',-2.2],[3450,'face','happy'],[3450,'hop',80],[3450,'burst',1.2],
      [4900,'face','calm']]}],
  ['hello','שלום','פתיחה ראשונה של האפליקציה. צומח לבמה בשמחה, קורץ ומהנהן פעם אחת.',
    {dur:4600, ev:[[0,'snap',{gate:0}],[150,'gate',1],[150,'face','happy'],[1000,'face','calm'],
      [1500,'face','wink'],[1900,'face','calm'],[2150,'nod',1,12],[3900,'gate',1.06],[4060,'gate',0]]}],
  ['oops','אופס','כשמשהו לא נשמר. מופתע ונרתע, עצוב ומניע "לא" קטן, ואז מתעשת ומהנהן. בלי להעניש.',
    {dur:5400, ev:[[250,'face','surprised'],[250,'hop',38],[900,'face','sad'],[1000,'shake',2,15],
      [2100,'look',0,-8],[2900,'look',0,0],[3000,'face','calm'],[3150,'nod',1,10],[3600,'face','content'],
      [4800,'face','calm']]}],
  ['streak','רצף נשמר','היום השביעי ברצף. נוחת מלמעלה בנחישות, מהנהן פעמיים, ונפתח באור.',
    {dur:4800, ev:[[0,'snap',{y:-760, air:1}],[0,'face','determined'],[1450,'nod',2,14],[2350,'face','happy'],
      [2350,'burst',1.7],[3800,'face','calm']]}],
  ['night','לילה טוב','אחרי סיום יום. מרוצה, נעשה ישנוני, שוקע מעט, הנשימה מאטה, הטבעות מאטות, והעיניים נעצמות.',
    {dur:6600, ev:[[0,'face','content'],[1300,'face','sleepy'],[1400,'to',0,26],
      [1400,'mode',{breathe:[.022,4.8], spinMul:.45}],[2800,'face','closed'],[2800,'gate',.97],
      [6000,'gate',1],[6000,'to',0,0],[6000,'mode',{breathe:[.012,3.6], spinMul:1}],[6000,'face','calm']]}],
  ['curious','סקרן','משהו חדש במסך. מביט הצידה, ואז לצד השני, ואז ישר אליה. מתקרב, מופתע וקופץ.',
    {dur:5200, ev:[[300,'face','curious'],[1300,'look',-44,2],[2200,'look',0,0],[2200,'face','surprised'],
      [2250,'gate',1.08],[2750,'face','happy'],[2750,'hop',70],[3500,'gate',1],[4100,'face','calm']]}],
  ['comfort','עידוד','אחרי יום קשה. מתחיל איתה למטה, עצוב. מרים את המבט לאט, מתיישר, מהנהן בעדינות וזורח קצת.',
    {dur:6000, ev:[[0,'face','sad'],[0,'snap',{y:22, ty:22}],[0,'mode',{breathe:[.016,4.4]}],
      [1600,'look',0,10],[1900,'to',0,0],[2000,'face','calm'],[2500,'look',0,0],[2600,'nod',1,8],
      [3100,'face','content'],[3200,'burst',.8],[5200,'face','calm'],[5200,'mode',{breathe:[.012,3.6]}]]}],
  ['party','חגיגה','אבן דרך גדולה. שמח ומקפץ שלוש פעמים, פרץ אור עם סחרור, ובסוף קורץ.',
    {dur:5000, ev:[[200,'face','happy'],[200,'wiggle',3,80],[1500,'burst',2.8],[1500,'spin',210],
      [2500,'face','wink'],[2950,'face','happy'],[3900,'face','calm']]}]
];


/* ═══════════════════════ shared wiring ═══════════════════════ */
/* load the canon and cut it; resolves once Beem can be drawn */
var BEEM_READY = Promise.all(['sun-body.png','beem-body.png','sun-r1.png','sun-r2.png','sun-r3.png'].map(load))
  .then(function(imgs){ extract(imgs[0], imgs[1]); });

/* a grid of live cards; returns the entries so a page can wire clicks */
function beemCards(host, list, kind, cls){
  return list.map(function(it, n){
    var d = document.createElement('div'); d.className = cls || 'card';
    d.innerHTML = '<div class="stage"></div><h3>' + it[1] + ' <i>' + (n + 1) + '</i></h3><p>' + it[2] + '</p>';
    host.appendChild(d);
    var b = new Beem(d.querySelector('.stage'));
    var script = it[3] || faceCard(it[0]);
    b.play(script);
    /* staggered, so a grid of faces is never all back at calm in the same beat */
    b.sT = -n*0.37;
    return {el:d, b:b, script:script, t:it[1], p:it[2], kind:kind, n:n + 1};
  });
}

/* one clock for every Beem on the page; off-screen ones stand still */
function beemRun(all){
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){
      all.forEach(function(b){ if (b.host === e.target) b.visible = e.isIntersecting; }); }); });
    all.forEach(function(b){ io.observe(b.host); });
  }
  var last = null;
  requestAnimationFrame(function loop(now){
    var raw = last === null ? 0.016 : (now - last)/1000; last = now;
    if (!(raw > 0) || raw > 0.25) raw = 0.016;
    /* a slow frame is split into small steps rather than clamped away - the
       stiff springs need steps under 17ms to stay stable, and a clamp would
       make a slow phone play every moment in slow motion */
    var dt = Math.min(0.1, raw), n = Math.ceil(dt / 0.0167), h = dt / n;
    all.forEach(function(b){ if (!b.visible) return;
      for (var s = 0; s < n; s++) b.step(h);
      b.paint(); });
    requestAnimationFrame(loop);
  });
}
