/* Beem's special moments - an EXTENSION of beem-engine.js, loaded after it.
   It does not edit the engine (the character sheet draws from that file and
   is not to be touched); it wraps four of Beem's methods and adds what the
   ten special moments need:

     ring transforms  each ring can tilt in 3D, precess, move, scale, fade,
                      blur, come to the front of the body, or be revealed
                      around its circle (a conic mask) like a closing ring
     body light       hue, saturation, brightness, a white-out (the
                      evolution flash) and gold, with a sheen sweeping the
                      sphere - all CSS filters over the canon pixels
     afterimages      rainbow copies of the body trailing behind it
     tweens           an 'fx' verb that eases any of the above over time

   The rule these moments keep: everything is made of Beem's own parts - the
   body, the two eyes, the three rings and light. No props, no particles.
   Duolingo dropped props from Duo's milestone animation for the same reason:
   they "didn't scale and weren't universal". */

/* ── the beads as BEADS, and gold as GOLD ──
   BEADS: a ring tilted as a flat picture flattens every bead into a disc,
   and the beads are spheres - he saw it at once on the gyroscope. So each
   bead is lifted out of its ring layer as its own sprite (connected pixels,
   alpha-weighted centre) and, in bead mode, placed in 3D one by one: it moves
   on the tilted circle but stays ROUND, grows as it comes near and shrinks as
   it goes far, and passes in front of the body or behind it by its own depth.
   Flat, bead mode draws exactly what the ring layer draws.
   GOLD: a hue filter only made the orange redder. Gold is a gradient map -
   every pixel of the body gets the gold of its own brightness, dark ochre in
   the shade to pale gold in the light - laid over the body under the eyes. */
var BEADS = null, GOLD_EB = null;
function extractBeads(img){
  var d = pixels(img), N = VB*VB, lab = new Int32Array(N), out = [], id = 0;
  for (var p0 = 0; p0 < N; p0++){
    if (lab[p0] || d[p0*4+3] < 90) continue;
    id++; var st = [p0], sx = 0, sy = 0, sw = 0, x0 = VB, y0 = VB, x1 = 0, y1 = 0, n = 0;
    lab[p0] = id;
    while (st.length){
      var p = st.pop(), x = p % VB, y = (p / VB) | 0, a = d[p*4+3];
      sx += x*a; sy += y*a; sw += a; n++;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      var nb = [p-1, p+1, p-VB, p+VB];
      for (var k = 0; k < 4; k++){ var q = nb[k];
        if (q >= 0 && q < N && !lab[q] && d[q*4+3] >= 90){ lab[q] = id; st.push(q); } }
    }
    if (n < 40) continue;
    var pad = 6; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
    x1 = Math.min(VB - 1, x1 + pad); y1 = Math.min(VB - 1, y1 + pad);
    var w = x1 - x0 + 1, h = y1 - y0 + 1, c = document.createElement('canvas');
    c.width = w; c.height = h; c.getContext('2d').drawImage(img, x0, y0, w, h, 0, 0, w, h);
    var cx = sx/sw, cy = sy/sw;
    out.push({bx: cx - 512, by: cy - 512, spr: c, ox: cx - x0, oy: cy - y0});
  }
  return out;
}
/* lo/span: which brightness is the darkest shade and how wide the range is.
   The first ramp started at 95 and took the body's lower half to dark brown -
   antique bronze, not gold. The red beads are darker still, so they get a
   lower start of their own. */
function goldOf(src, lo, span){
  lo = lo == null ? 60 : lo; span = span || 170;
  var c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  var x = c.getContext('2d'); x.drawImage(src, 0, 0);
  var im = x.getImageData(0, 0, c.width, c.height), d = im.data;
  /* gold by brightness: warm ochre shadow, gold body, pale highlight */
  var RAMP = [[0, 122,80,16], [.3, 186,130,30], [.55, 230,180,54], [.78, 250,219,112], [1, 255,249,224]];
  for (var i = 0; i < d.length; i += 4){
    if (!d[i+3]) continue;
    var L = (0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2] - lo) / span;
    L = L < 0 ? 0 : L > 1 ? 1 : L;
    for (var j = 1; j < RAMP.length && RAMP[j][0] < L; j++);
    var A = RAMP[j-1], B = RAMP[Math.min(j, RAMP.length-1)], t = B[0] > A[0] ? (L - A[0])/(B[0] - A[0]) : 0;
    d[i] = A[1] + (B[1]-A[1])*t; d[i+1] = A[2] + (B[2]-A[2])*t; d[i+2] = A[3] + (B[3]-A[3])*t;
  }
  x.putImageData(im, 0, 0); return c;
}
BEEM_READY.then(function(){
  GOLD_EB = goldOf(EB);
  return Promise.all(['sun-r1.png','sun-r2.png','sun-r3.png'].map(load)).then(function(imgs){
    BEADS = imgs.map(extractBeads);
    BEADS.forEach(function(ring){ ring.forEach(function(b){ b.gold = goldOf(b.spr, 0, 175); }); });
  });
});

var EASE = {
  lin:  function(p){ return p; },
  io:   function(p){ return p < .5 ? 4*p*p*p : 1 - Math.pow(-2*p + 2, 3)/2; },
  out:  function(p){ return 1 - Math.pow(1 - p, 3); },
  in:   function(p){ return p*p*p; },
  back: function(p){ var c = 1.70158; return 1 + (c + 1)*Math.pow(p - 1, 3) + c*Math.pow(p - 1, 2); }
};

(function(){
  var _reset = Beem.prototype.reset, _verb = Beem.prototype.verb,
      _step = Beem.prototype.step, _paint = Beem.prototype.paint;

  Beem.prototype.reset = function(){
    _reset.call(this);
    this.fx = {
      body: {hue:0, sat:1, bri:1, white:0, gold:0},
      rings: [0,1,2].map(function(){ return {tilt:0, tiltY:0, prec:0, precV:0, dx:0, dy:0,
        sc:1, op:1, blur:0, reveal:1, front:0}; }),
      ghosts: 0, cycle: 0, track: -1, tramp: 0, depth: 0, beads: 0, wave: 0
    };
    this.tw = [];
  };

  /* fx: {t: 'body'|'rings'|'r0'..'r2'|'me'|'fx', v: {key: value or [per ring]},
          d: ms, e: ease, s: ms of stagger per ring, delay: ms} */
  Beem.prototype.fxTween = function(spec){
    var f = this.fx, objs;
    if (spec.t === 'body') objs = [f.body];
    else if (spec.t === 'rings') objs = f.rings;
    else if (/^r\d$/.test(spec.t)) objs = [f.rings[+spec.t[1]]];
    else if (spec.t === 'me') objs = [this];
    else objs = [f];
    var self = this, d = (spec.d || 0)/1000;
    objs.forEach(function(o, j){
      for (var k in spec.v){
        var b = Array.isArray(spec.v[k]) ? spec.v[k][j] : spec.v[k];
        /* a new tween on a value replaces any still running on it */
        self.tw = self.tw.filter(function(w){ return !(w.o === o && w.k === k); });
        var t0 = self.sT + ((spec.delay || 0) + (spec.s || 0)*j)/1000;
        if (d <= 0 && t0 <= self.sT) o[k] = b;
        else self.tw.push({o:o, k:k, a:null, b:b, t0:t0, d:d, e:EASE[spec.e || 'io']});
      }
    });
  };

  Beem.prototype.verb = function(v, a, b, c){
    if (v === 'fx') return this.fxTween(a);
    /* set: any of Beem's own numbers at once - a position, a velocity, a spin */
    if (v === 'set'){ for (var k in a) this[k] = Array.isArray(a[k]) ? a[k].slice() : a[k]; return; }
    if (v === 'moves'){                     // a run of targets: [[ms, x, y], ...]
      var o = this.sT, self = this;
      a.forEach(function(m){ self.pend.push([o + m[0]/1000, 'to', m[1], m[2]]); });
      return;
    }
    return _verb.call(this, v, a, b, c);
  };

  Beem.prototype.step = function(dt){
    _step.call(this, dt);
    var t = this.sT, f = this.fx, sp = dt*this.speed;
    for (var i = this.tw.length - 1; i >= 0; i--){
      var w = this.tw[i]; if (t < w.t0) continue;
      if (w.a === null) w.a = w.o[w.k];
      var p = w.d > 0 ? Math.min(1, (t - w.t0)/w.d) : 1;
      w.o[w.k] = w.a + (w.b - w.a)*w.e(p);
      if (p >= 1) this.tw.splice(i, 1);
    }
    f.rings.forEach(function(R){ R.prec += R.precV*sp; });
    /* the eyes follow the edge of a ring as it is drawn around the circle */
    if (f.track >= 0){
      var ang = f.rings[f.track].reveal*Math.PI*2;
      this.lkX = Math.sin(ang)*30; this.lkY = Math.cos(ang)*16;
    }
  };

  var SHEEN = 'position:absolute;inset:0;pointer-events:none;opacity:0;mix-blend-mode:screen;' +
    'background:linear-gradient(115deg,rgba(255,255,255,0) 40%,rgba(255,246,206,.95) 50%,rgba(255,255,255,0) 60%);' +
    'background-size:300% 100%;' +
    /* the sphere only: centre (508.3, 499.2), radius 237.6 of 1024 */
    '-webkit-mask-image:radial-gradient(circle at 49.64% 48.75%,#000 22.9%,transparent 23.2%);' +
    'mask-image:radial-gradient(circle at 49.64% 48.75%,#000 22.9%,transparent 23.2%)';

  Beem.prototype.paint = function(){
    _paint.call(this);
    var f = this.fx, css = this.host.clientWidth; if (!css || !f) return;
    var kc = css/VB, t = this.t, B = f.body, i;

    /* body light: gold is sepia + saturation + a warmer hue + brightness;
       the white-out takes the colour away and pushes the light up, which is
       the evolution silhouette */
    /* the white-out stops at 2.4x: at 5x the body vanished into the page's
       own light ground instead of glowing on it */
    var g = B.gold, w = B.white, hue = B.hue, bri = B.bri*(1 + 1.4*w),
        sat = B.sat*(1 - .9*w), sep = 0;
    if (f.cycle > .001){
      /* the star's palette flicker, 12 a second - WARM steps only. The first
         palette reached +50deg and turned him lime green, which is not Beem */
      var st = Math.floor(t*12) % 4;
      hue += f.cycle*[-24, 0, 12, -10][st]; bri *= 1 + f.cycle*[0, .22, .06, .28][st];
    }
    var plain = Math.abs(hue) < .1 && Math.abs(bri - 1) < .002 && Math.abs(sat - 1) < .002 && sep < .002;
    this.bodyEl.style.filter = plain ? '' : 'sepia(' + sep.toFixed(3) + ') saturate(' + sat.toFixed(3) +
      ') hue-rotate(' + hue.toFixed(1) + 'deg) brightness(' + bri.toFixed(3) + ')';
    this.bodyEl.style.zIndex = 2;
    if (g > .01 && !this.sheen){
      this.sheen = document.createElement('div'); this.sheen.style.cssText = SHEEN;
      this.bodyEl.appendChild(this.sheen);
    }
    /* gold is painted INTO the body canvas, between the body and the eyes:
       the gradient-mapped body at the gold's strength, then the eyes again */
    if (g > .01 && GOLD_EB){
      var cx2 = this.cx, W = this.cv.width, kk = W/VB;
      cx2.save(); cx2.setTransform(1,0,0,1,0,0); cx2.globalAlpha = Math.min(1, g);
      cx2.drawImage(GOLD_EB, 0, 0, W, W); cx2.restore();
      cx2.save(); cx2.beginPath(); cx2.arc(SPH.x*kk, SPH.y*kk, (SPH.r - 1)*kk, 0, Math.PI*2); cx2.clip();
      this.eye(cx2, 0, kk); this.eye(cx2, 1, kk); cx2.restore();
    }
    if (this.sheen){
      this.sheen.style.opacity = (g*.62).toFixed(3);
      this.sheen.style.backgroundPosition = (100 - ((t*.55) % 1)*100).toFixed(1) + '% 0';
    }

    for (i = 0; i < 3; i++){
      var R = f.rings[i], el = this.rings[i], dy = R.dy;
      /* on the trampoline the rings stay on the floor - they stop following
         the body - and dip when he lands */
      if (f.tramp > .001) dy += f.tramp*(Math.max(0, this.sq)*650 - this.ry[i]);
      if (R.tilt || R.tiltY || R.prec || R.dx || dy || R.sc !== 1)
        el.style.transform = 'perspective(' + Math.round(css*3) + 'px) translate(' + (R.dx*kc).toFixed(2) +
          'px,' + (dy*kc).toFixed(2) + 'px) rotateZ(' + R.prec.toFixed(2) + 'deg) rotateX(' +
          R.tilt.toFixed(2) + 'deg) rotateY(' + R.tiltY.toFixed(2) + 'deg) scale(' + R.sc.toFixed(4) + ') ' +
          el.style.transform;
      el.style.opacity = R.op < .999 ? Math.max(0, R.op).toFixed(3) : '';
      /* gold beads: their own brightness kept, the colour taken to gold */
      el.style.filter = (R.blur > .05 ? 'blur(' + (R.blur*kc).toFixed(2) + 'px) ' : '') +
        (g > .01 ? 'sepia(' + g.toFixed(3) + ') saturate(' + (1 + 1.6*g).toFixed(3) + ') hue-rotate(' +
          (-6*g).toFixed(1) + 'deg) brightness(' + (1 + .14*g).toFixed(3) + ')' : '');
      el.style.zIndex = R.front > .5 ? 3 : 1;
      var m = R.reveal < .999 ? 'conic-gradient(#000 ' + (R.reveal*360).toFixed(1) + 'deg,transparent ' +
        (R.reveal*360 + .6).toFixed(1) + 'deg)' : '';
      el.style.webkitMaskImage = m; el.style.maskImage = m;

      /* DEPTH: a tilted ring has a near half and a far half, and the near half
         must pass IN FRONT of the body. Without this the gyroscope's rings
         were thin dashes, half hidden behind him. A copy of the ring sits in
         front of the body showing only its near half; the copy's spin is on an
         inner element, so the half-mask stays put while the beads turn. */
      if (f.depth > .01 && !this.fr){
        var host = this.host.querySelector('.beem'), self = this;
        this.fr = this.rings.map(function(ring){
          var wr = document.createElement('div'); wr.className = 'lay';
          wr.style.zIndex = 4;
          var im = ring.querySelector('img').cloneNode(); im.className = 'lay';
          wr.appendChild(im); host.appendChild(wr); return wr;
        });
      }
      if (this.fr){
        var wr2 = this.fr[i];
        if (f.depth > .01 && (R.tilt || R.tiltY)){
          var base = el.style.transform, cut = base.lastIndexOf(' rotate(');
          wr2.style.transform = base.slice(0, cut);
          wr2.firstChild.style.transform = base.slice(cut + 1);
          wr2.style.opacity = (f.depth*(R.op < .999 ? Math.max(0, R.op) : 1)).toFixed(3);
          wr2.style.filter = el.style.filter;
          /* rotateX(+) tips the top away, so the near half is the bottom one */
          var half = 'linear-gradient(to bottom,transparent 49%,#000 51%)';
          wr2.style.webkitMaskImage = half; wr2.style.maskImage = half;
        } else wr2.style.opacity = 0;
      }
    }

    /* BEAD MODE: the three rings drawn bead by bead in 3D - the same chain
       of transforms the ring layer gets from CSS, worked out per bead, so
       nothing moves differently; only each bead keeps its round shape */
    if (f.beads > .5 && BEADS){
      if (!this.bk){
        var hb = this.host.querySelector('.beem'), mk = function(z){
          var c = document.createElement('canvas'); c.className = 'lay';
          c.style.cssText = 'z-index:' + z + ';pointer-events:none'; hb.appendChild(c); return c; };
        this.bk = mk(1); this.fw = mk(4);
      }
      var Wc = this.cv.width, kp = Wc/VB;
      [this.bk, this.fw].forEach(function(c){ if (c.width !== Wc){ c.width = c.height = Wc; }
        c.getContext('2d').clearRect(0, 0, Wc, Wc); c.style.opacity = 1; });
      var br = 1 + this.breathe[0]*Math.sin(this.t*2*Math.PI/this.breathe[1]), list = [], D = 3*VB;
      for (i = 0; i < 3; i++){
        var Rr = f.rings[i];
        this.rings[i].style.opacity = 0;
        if (this.fr) this.fr[i].style.opacity = 0;
        var gR = this.rg[i]*(1 + this.burst[i]*.16)*br, rs = this.rsq[i],
            drop = CONTACT*(1 - this.rg[i]) + CONTACT*rs*this.rg[i],
            sa = Math.sin(this.spin[i]*RAD), ca = Math.cos(this.spin[i]*RAD),
            cY = Math.cos(Rr.tiltY*RAD), sY = Math.sin(Rr.tiltY*RAD),
            cX = Math.cos(Rr.tilt*RAD), sX = Math.sin(Rr.tilt*RAD),
            cZ = Math.cos(Rr.prec*RAD), sZ = Math.sin(Rr.prec*RAD);
        BEADS[i].forEach(function(b){
          var bx = b.bx, by = b.by;
          if (f.wave > .001){                   // the stadium wave: each bead out and back in turn
            var th = Math.atan2(by, bx) + this.spin[i]*RAD, rr = Math.hypot(bx, by);
            var dsp = f.wave*42*Math.sin(th*4 - this.t*7 - i*.8), q = (rr + dsp)/rr;
            bx *= q; by *= q;
          }
          var x = bx*ca - by*sa, y = bx*sa + by*ca;
          x = x*gR/(1 - rs) + this.rx[i]; y = y*gR*(1 - rs) + this.ry[i] + drop;
          x *= Rr.sc; y *= Rr.sc;
          var x1 = x*cY, z1 = -x*sY;                          // rotateY
          var y2 = y*cX - z1*sX, z2 = y*sX + z1*cX;            // rotateX
          var x3 = x1*cZ - y2*sZ, y3 = x1*sZ + y2*cZ;          // rotateZ (precession)
          var s = D/(D - z2);
          list.push({z: z2, X: 512 + (x3 + Rr.dx)*s, Y: 512 + (y3 + Rr.dy)*s, k: gR*Rr.sc*s, b: b, op: Rr.op,
                     front: Rr.front > .5});
        }, this);
      }
      list.sort(function(a, b){ return a.z - b.z; });
      var cb = this.bk.getContext('2d'), cf = this.fw.getContext('2d');
      list.forEach(function(o){
        var c = (o.z > 0 || o.front) ? cf : cb, sp2 = o.b.spr, a = Math.max(0, Math.min(1, o.op)),
            X0 = (o.X - o.b.ox*o.k)*kp, Y0 = (o.Y - o.b.oy*o.k)*kp, w2 = sp2.width*o.k*kp, h2 = sp2.height*o.k*kp;
        c.globalAlpha = a; c.drawImage(sp2, X0, Y0, w2, h2);
        /* gold beads: the bead's own gradient map, over it at the gold's strength */
        if (g > .01 && o.b.gold){ c.globalAlpha = a*Math.min(1, g); c.drawImage(o.b.gold, X0, Y0, w2, h2); }
      });
    } else if (this.bk){
      this.bk.style.opacity = 0; this.fw.style.opacity = 0;
    }

    /* afterimages: copies of the body, each a few frames behind, each a
       different hue - the rainbow trail of the star */
    if (f.ghosts > .01){
      if (!this.gh){
        this.gh = []; this.hist = [];
        for (i = 0; i < 5; i++){
          var c = document.createElement('canvas'); c.className = 'lay';
          c.style.cssText = 'transform-origin:49.64% 71.97%;z-index:0;pointer-events:none';
          this.host.querySelector('.beem').insertBefore(c, this.rings[0]); this.gh.push(c);
        }
      }
      this.hist.unshift(this.bodyEl.style.transform); if (this.hist.length > 30) this.hist.pop();
      for (i = 0; i < 5; i++){
        var gc = this.gh[i];
        if (gc.width !== this.cv.width){ gc.width = gc.height = this.cv.width;
          gc.getContext('2d').drawImage(EB, 0, 0, gc.width, gc.width); }
        gc.style.transform = this.hist[Math.min(this.hist.length - 1, (i + 1)*4)];
        gc.style.opacity = (f.ghosts*[.42, .3, .2, .13, .07][i]).toFixed(3);
        gc.style.filter = 'hue-rotate(' + ((i + 1)*55) + 'deg) saturate(1.6)';
      }
    } else if (this.gh){
      this.gh.forEach(function(c){ c.style.opacity = 0; }); this.hist = [];
    }
  };
})();

/* ═══════════════════════ the ten special moments ═══════════════════════ */
var SPECIAL_LIST = [
  ['golden', 'Beem זהב',
   'אבן דרך גדולה ברצף. הטבעות מסתחררות ונסגרות עליו כגולם. מבפנים הוא מאדים, מהבהב בלבן מהר ומהר יותר, והטבעות נפתחות: Beem מזהב, עם ברק שעובר על הכדור.',
   {dur:7000, ev:[[0,'face','calm'],[250,'face','determined'],
     [350,'set',{sv:[280,280,280]}],[350,'fx',{t:'rings',v:{front:1},d:0}],
     [400,'fx',{t:'rings',v:{sc:[.74,.46,.24]},d:850,e:'io',s:90}],[500,'gate',.92],
     [900,'fx',{t:'body',v:{hue:-24,sat:1.45,bri:.95},d:600}],[1500,'face','closed'],
     [1700,'fx',{t:'body',v:{white:1},d:160}],[1880,'fx',{t:'body',v:{white:.15},d:160}],
     [2060,'fx',{t:'body',v:{white:1},d:120}],[2200,'fx',{t:'body',v:{white:.25},d:100}],
     [2320,'fx',{t:'body',v:{white:1},d:80}],[2420,'fx',{t:'body',v:{white:.3},d:60}],
     [2500,'fx',{t:'body',v:{white:1},d:60}],
     [2600,'fx',{t:'fx',v:{beads:1},d:0}],
     [2600,'fx',{t:'body',v:{white:0,hue:0,sat:1,bri:1,gold:1},d:500,e:'out'}],
     [2600,'fx',{t:'rings',v:{sc:1},d:650,e:'back',s:60}],[2600,'burst',2.6],[2600,'gate',1],
     [2650,'face','happy'],[2700,'hop',110],[3300,'fx',{t:'rings',v:{front:0},d:0}],
     [4400,'face','content'],[5700,'fx',{t:'body',v:{gold:0},d:800}],[6100,'face','calm']]}],
  ['tramp', 'טרמפולינה',
   'הטבעות נשכבות מתחתיו ונהיות טרמפולינה. הוא קופץ עליה שלוש פעמים, כל פעם גבוה יותר, והיא שוקעת תחתיו בכל נחיתה. בסוף הן עולות חזרה למקום.',
   {dur:5600, ev:[[0,'face','happy'],
     [0,'fx',{t:'rings',v:{tilt:76,dy:150,sc:[1.05,.98,.92]},d:650,e:'io',s:70}],
     [0,'fx',{t:'fx',v:{tramp:1, depth:1},d:400}],
     [700,'hop',130],[1350,'hop',230],[2150,'hop',360],[2380,'face','surprised'],[2620,'face','happy'],
     [3600,'fx',{t:'fx',v:{tramp:0},d:300}],[3600,'fx',{t:'rings',v:{tilt:0,dy:0,sc:1},d:700,e:'back',s:60}],
     [3700,'face','content'],[5000,'face','calm']]}],
  ['gyro', 'ג׳ירוסקופ',
   'בזמן שהמתכנן חושב. כל טבעת נוטה על ציר אחר ומסתובבת סביבו בתלת־ממד, כמו ג׳ירוסקופ, והעיניים עוקבות אחריהן. כל חרוז נשאר כדור עגול: גדל כשהוא מתקרב, קטן כשהוא מתרחק, ועובר לפניו או מאחוריו. בסוף הטבעות נוחתות חזרה, ובא רגע של "הבנתי".',
   {dur:6400, ev:[[0,'face','thinking'],[0,'mode',{float:20}],
     [0,'fx',{t:'fx',v:{beads:1},d:0}],
     [200,'fx',{t:'rings',v:{tilt:[62,58,66],tiltY:[0,24,-18],sc:[1.08,1.04,1]},d:900,e:'io',s:120}],
     [200,'fx',{t:'rings',v:{precV:[70,-55,40]},d:0}],
     [1400,'look',-14,10],[2600,'look',12,14],[3600,'look',0,15],
     [4200,'fx',{t:'rings',v:{precV:0},d:0}],[4200,'fx',{t:'rings',v:{tilt:0,tiltY:0,sc:1},d:700,e:'back',s:80}],
     [4200,'look',0,0],[4300,'face','surprised'],[4300,'mode',{float:0}],[4650,'face','happy'],
     [4650,'hop',70],[5800,'face','calm']]}],
  ['breath', 'נשימה מודרכת',
   'שתי נשימות בקצב של Apple Breathe, 7 בדקה. בשאיפה הטבעות מתרחבות והוא גדל מעט. בנשיפה הן מתכנסות והעיניים נעצמות. לפני סיום יום.',
   {dur:17800, ev:[[0,'mode',{breathe:[0,3.6], spinMul:.35}],[0,'face','calm'],
     [300,'fx',{t:'rings',v:{sc:[1.1,1.13,1.16]},d:4000,s:120}],[300,'fx',{t:'me',v:{gT:1.06},d:4000}],
     [4900,'fx',{t:'rings',v:{sc:.9},d:4000,s:120}],[4900,'fx',{t:'me',v:{gT:.97},d:4000}],
     [5000,'face','content'],[5900,'face','closed'],
     [9000,'face','calm'],
     [9000,'fx',{t:'rings',v:{sc:[1.1,1.13,1.16]},d:4000,s:120}],[9000,'fx',{t:'me',v:{gT:1.06},d:4000}],
     [13600,'fx',{t:'rings',v:{sc:1},d:4000,s:120}],[13600,'fx',{t:'me',v:{gT:1},d:4000}],
     [13700,'face','content'],[14600,'face','closed'],[17200,'face','calm']]}],
  ['close', 'הטבעת נסגרת',
   'היעד היומי מתמלא. כל טבעת נבנית סביבו חרוז אחרי חרוז, כמו טבעות הפעילות של Apple, והעיניים עוקבות אחרי הקצה. כשהשלישית נסגרת: הבזק, פרץ וקפיצה.',
   {dur:7600, ev:[[0,'fx',{t:'rings',v:{reveal:0},d:0}],[0,'face','calm'],
     [400,'fx',{t:'fx',v:{track:0},d:0}],[400,'fx',{t:'r0',v:{reveal:1},d:1300}],
     [1750,'fx',{t:'fx',v:{track:1},d:0}],[1750,'fx',{t:'r1',v:{reveal:1},d:1300}],
     [3100,'fx',{t:'fx',v:{track:2},d:0}],[3100,'fx',{t:'r2',v:{reveal:1},d:1500}],
     [4600,'fx',{t:'fx',v:{track:-1},d:0}],[4600,'look',0,0],[4600,'face','happy'],
     [4600,'burst',2.8],[4600,'spin',200],[4600,'fx',{t:'body',v:{white:.55},d:90}],
     [4700,'fx',{t:'body',v:{white:0},d:350,e:'out'}],[4650,'hop',170],
     [6200,'face','content'],[7000,'face','calm']]}],
  ['star', 'Beem כוכב',
   'כמו הכוכב של מריו: הצבע שלו מהבהב בין גוונים חמים 12 פעמים בשנייה, הוא טס בזיגזג על הבמה, ושובל של עותקים בצבעי קשת נגרר אחריו.',
   {dur:5600, ev:[[0,'face','determined'],[250,'burst',1.6],[300,'face','happy'],
     [300,'fx',{t:'fx',v:{ghosts:1,cycle:1},d:200}],[300,'set',{sv:[320,320,320]}],
     [350,'moves',[[0,-170,-70],[320,160,-100],[640,-130,40],[960,180,10],[1280,-60,-130],
                   [1600,150,-40],[1920,-170,20],[2240,90,-110],[2560,0,0]]],
     [3700,'fx',{t:'fx',v:{ghosts:0,cycle:0},d:400}],[3800,'face','content'],[3900,'squash',2],
     [5000,'face','calm']]}],
  ['dash', 'ספין־דאש',
   'כמו סוניק: כריעה לצורת אליפסה, הטבעות מסתחררות מהר יותר ויותר עד שהן מיטשטשות, ושיגור החוצה מהבמה. הוא חוזר מהצד השני, מחליק לעצירה ומהנהן.',
   {dur:3900, ev:[[0,'face','determined'],[150,'look',28,0],
     [250,'stretch',-.13],[250,'fx',{t:'rings',v:{blur:9,sc:.9},d:900,e:'in'}],
     [300,'set',{sv:[200,200,200]}],[600,'set',{sv:[420,420,420]}],[900,'set',{sv:[700,700,700]}],
     [1250,'stretch',0],[1250,'set',{vx:7000, tx:1500}],[1250,'face','happy'],
     [1750,'set',{x:-1500, tx:0, vx:5000}],
     [2200,'fx',{t:'rings',v:{blur:0,sc:1},d:500,e:'out'}],[2300,'look',0,0],[2400,'nod',1,10],
     [3400,'face','calm']]}],
  ['halo', 'הילה',
   'אחרי סיום יום שלם. שלוש הטבעות עולות מעל הראש, נוטות ונהיות הילה של שלוש קומות שמתנדנדת איתו. מרוצה, ואז הכול חוזר למקום.',
   {dur:5400, ev:[[0,'face','content'],
     [300,'fx',{t:'rings',v:{tilt:66,dy:[-300,-322,-344],sc:[.56,.63,.7]},d:1000,e:'back',s:110}],
     [350,'hop',40],[1100,'face','happy'],[1100,'mode',{float:14}],[2600,'face','content'],
     [3900,'fx',{t:'rings',v:{tilt:0,dy:0,sc:1},d:800,s:80}],[3900,'mode',{float:0}],[4800,'face','calm']]}],
  ['wave', 'גל חרוזים',
   'חדש, במקום הקונכייה. כל הכבוד קטן: החרוזים יוצאים החוצה וחוזרים אחד אחרי השני, כמו גל באצטדיון, והגל עובר מטבעת לטבעת. הוא מקפץ בקצב, וחוזר למקום.',
   {dur:5200, ev:[[0,'fx',{t:'fx',v:{beads:1},d:0}],[250,'face','happy'],
     [300,'fx',{t:'fx',v:{wave:1},d:600}],[700,'hop',40],[1500,'hop',40],[2300,'hop',60],
     [3300,'fx',{t:'fx',v:{wave:0},d:700}],[3400,'face','content'],[4600,'face','calm']]}],
  ['sunrise', 'זריחה',
   'פתיחת הבוקר. הוא עולה מתחתית הבמה עמום, והאור שלו מתחזק. הטבעות נפרשות סביבו אחת אחרי השנייה, העיניים נפתחות, והוא זורח.',
   {dur:5600, ev:[[0,'set',{y:640, ty:640}],[0,'fx',{t:'rings',v:{sc:0,op:0},d:0}],
     [0,'fx',{t:'body',v:{bri:.55,sat:.6},d:0}],[0,'face','closed'],
     [200,'fx',{t:'me',v:{ty:40},d:2400,e:'out'}],[200,'fx',{t:'body',v:{bri:1,sat:1},d:2600}],
     [1300,'fx',{t:'r0',v:{sc:1,op:1},d:800,e:'back'}],[1750,'fx',{t:'r1',v:{sc:1,op:1},d:800,e:'back'}],
     [2200,'fx',{t:'r2',v:{sc:1,op:1},d:800,e:'back'}],
     [2500,'face','sleepy'],[2900,'face','calm'],[2950,'blink'],
     [3100,'to',0,0],[3300,'face','happy'],[3300,'burst',1.3],[4700,'face','calm']]}]
];
