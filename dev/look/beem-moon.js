/* Beem at night: the moon, and his beads the stars. Asaf's idea, 18.10.
   Loaded ONLY by beem-alive.html, after beem-alive.js - the character sheet
   does not load it, so the sheet's night stays exactly as approved until he
   says otherwise. Edits no other file.

   The rule holds: nothing is added to him. The body becomes the moon the way
   it became gold - a gradient map of its own brightness, here to cool silver -
   and each bead becomes a star by the same means: whitened, smaller, and
   twinkling on its own clock, still on its ring so he stays recognisable.
   Stars need a dark sky, so the STAGE darkens around him; that is the
   surroundings, not Beem. */

var MOON_EB = null;
(function(){
  /* a moon value every Beem starts with - a tween from 'undefined' is NaN */
  var _reset = Beem.prototype.reset;
  Beem.prototype.reset = function(){ _reset.call(this); this.fx.body.moon = 0; this.fx.body.sky = 0; };
})();
BEEM_READY.then(function(){
  /* silver by brightness: blue-grey shade, pale body, white light */
  MOON_EB = rampOf(EB, 60, 170, [[0, 92,98,124], [.35, 168,174,194], [.6, 224,226,234], [.85, 245,245,241], [1, 255,255,250]]);
});
function rampOf(src, lo, span, RAMP){
  var c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  var x = c.getContext('2d'); x.drawImage(src, 0, 0);
  var im = x.getImageData(0, 0, c.width, c.height), d = im.data;
  for (var i = 0; i < d.length; i += 4){
    if (!d[i+3]) continue;
    var L = (0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2] - lo)/span;
    L = L < 0 ? 0 : L > 1 ? 1 : L;
    for (var j = 1; j < RAMP.length && RAMP[j][0] < L; j++);
    var A = RAMP[j-1], B = RAMP[Math.min(j, RAMP.length-1)], t = B[0] > A[0] ? (L - A[0])/(B[0] - A[0]) : 0;
    d[i] = A[1] + (B[1]-A[1])*t; d[i+1] = A[2] + (B[2]-A[2])*t; d[i+2] = A[3] + (B[3]-A[3])*t;
  }
  x.putImageData(im, 0, 0); return c;
}
/* each bead's star self, and its own clock: when it turns, how it twinkles,
   how far it strays from the ring. Seeded by its place, so it is the same
   every night. */
function starOf(b, i, j){
  if (b.star) return b.star;
  var r = function(n){ var s = Math.sin((i*97 + j*31 + n*13)*12.9898)*43758.5453; return s - Math.floor(s); };
  b.star = {spr: rampOf(b.spr, 0, 200, [[0, 150,170,214], [.5, 228,234,252], [1, 255,255,255]]),
            thr: r(1)*.75, ph: r(2)*6.28, rate: 1.4 + r(3)*2.4, jit: (r(4) - .5)*26};
  return b.star;
}

(function(){
  var _paint = Beem.prototype.paint;
  Beem.prototype.paint = function(){
    _paint.call(this);
    var f = this.fx, css = this.host.clientWidth; if (!f || !css) return;
    var mo = f.body.moon || 0, sk = f.body.sky || 0, t = this.t, i;

    /* the night sky - the stage, never Beem. Its own value, so that at dawn
       the sky can lighten while the moon is still setting */
    if (sk > .001 && !this.sky){
      this.sky = document.createElement('div');
      this.sky.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0;' +
        'background:radial-gradient(circle at 50% 46%,#2a3358 0%,#161c36 55%,#0c1024 100%)';
      this.host.insertBefore(this.sky, this.host.firstChild);
    }
    if (this.sky) this.sky.style.opacity = Math.min(1, sk).toFixed(3);
    if (mo <= .01 || !MOON_EB) return;

    /* the moon: the silver map over the body, then the eyes again on top */
    var cx = this.cx, W = this.cv.width, k = W/VB;
    cx.save(); cx.setTransform(1,0,0,1,0,0); cx.globalAlpha = Math.min(1, mo);
    cx.drawImage(MOON_EB, 0, 0, W, W); cx.restore();
    cx.save(); cx.beginPath(); cx.arc(SPH.x*k, SPH.y*k, (SPH.r - 1)*k, 0, Math.PI*2); cx.clip();
    this.eye(cx, 0, k); this.eye(cx, 1, k); cx.restore();

    /* the stars: the bead pass again, each bead turning into its star when
       the night reaches its own threshold - so they come out one by one */
    if (!(f.beads > .5 && BEADS && this.bk)) return;
    var cb = this.bk.getContext('2d'), cf = this.fw.getContext('2d'), Wc = this.bk.width, kp = Wc/VB;
    cb.clearRect(0, 0, Wc, Wc); cf.clearRect(0, 0, Wc, Wc);
    var br = 1 + this.breathe[0]*Math.sin(this.t*2*Math.PI/this.breathe[1]), D = 3*VB, list = [];
    for (i = 0; i < 3; i++){
      var R = f.rings[i], gR = this.rg[i]*(1 + this.burst[i]*.16)*br, rs = this.rsq[i],
          drop = CONTACT*(1 - this.rg[i]) + CONTACT*rs*this.rg[i],
          sa = Math.sin(this.spin[i]*RAD), ca = Math.cos(this.spin[i]*RAD),
          cY = Math.cos(R.tiltY*RAD), sY = Math.sin(R.tiltY*RAD), cX = Math.cos(R.tilt*RAD), sX = Math.sin(R.tilt*RAD),
          cZ = Math.cos(R.prec*RAD), sZ = Math.sin(R.prec*RAD);
      BEADS[i].forEach(function(b, j){
        var s0 = starOf(b, i, j), c = Math.max(0, Math.min(1, (mo - s0.thr)/.25));
        var rr = Math.hypot(b.bx, b.by), q = (rr + s0.jit*c)/rr, bx = b.bx*q, by = b.by*q;
        var x = bx*ca - by*sa, y = bx*sa + by*ca;
        x = x*gR/(1 - rs) + this.rx[i]; y = y*gR*(1 - rs) + this.ry[i] + drop;
        x *= R.sc; y *= R.sc;
        var x1 = x*cY, z1 = -x*sY, y2 = y*cX - z1*sX, z2 = y*sX + z1*cX,
            x3 = x1*cZ - y2*sZ, y3 = x1*sZ + y2*cZ, sp = D/(D - z2);
        list.push({z: z2, X: 512 + (x3 + R.dx)*sp, Y: 512 + (y3 + R.dy)*sp, k: gR*R.sc*sp, b: b, s: s0, c: c, front: R.front > .5});
      }, this);
    }
    list.sort(function(a, b){ return a.z - b.z; });
    list.forEach(function(o){
      var ctx = (o.z > 0 || o.front) ? cf : cb, b = o.b;
      if (o.c < 1){                                   // still a bead
        ctx.globalAlpha = 1 - o.c;
        ctx.drawImage(b.spr, (o.X - b.ox*o.k)*kp, (o.Y - b.oy*o.k)*kp, b.spr.width*o.k*kp, b.spr.height*o.k*kp);
      }
      if (o.c > 0){                                   // a star: smaller, white, twinkling
        var tw = .5 + .5*Math.sin(t*o.s.rate + o.s.ph), ks = o.k*(1 - .5*o.c)*(.85 + .25*tw);
        ctx.globalAlpha = o.c*(.45 + .55*tw);
        ctx.drawImage(o.s.spr, (o.X - b.ox*ks)*kp, (o.Y - b.oy*ks)*kp, o.s.spr.width*ks*kp, o.s.spr.height*ks*kp);
      }
    });
    cb.globalAlpha = 1; cf.globalAlpha = 1;
  };
})();

/* the night: he goes to sleep and becomes the moon, the stars come out one
   by one, the rings almost stop. The moon rises a touch rather than sinking. */
CLOCK.night = {dur: 1e9, ev: [[0, 'face', 'sleepy'], [0, 'mode', {idle: 0, breathe: [.02, 5.4], spinMul: .18}],
  [0, 'fx', {t: 'fx', v: {beads: 1}, d: 0}], [200, 'fx', {t: 'body', v: {moon: 1, sky: 1}, d: 3200}],
  [0, 'to', 0, -12], [1600, 'face', 'closed']]};
/* and the morning after a night: the moon SETS AS THE MOON - stars and all,
   while the sky lightens - and only once it is below the stage does he turn
   back into Beem, for the sunrise to bring him up. The first version turned
   him orange first and then sank him, which spent the image. */
function MOON_MORNING(){
  var sun = byId(SPECIAL_LIST, 'sunrise');
  return once({dur: sun.dur + 1900, ev: [
    [0, 'fx', {t: 'fx', v: {beads: 1}, d: 0}], [0, 'fx', {t: 'body', v: {moon: 1, sky: 1}, d: 0}], [0, 'face', 'closed'],
    [0, 'fx', {t: 'me', v: {ty: 660}, d: 1700, e: 'in'}], [300, 'fx', {t: 'body', v: {sky: 0}, d: 1500}],
    [1800, 'fx', {t: 'body', v: {moon: 0}, d: 0}], [1800, 'fx', {t: 'fx', v: {beads: 0}, d: 0}]
  ].concat(sun.ev.map(function(e){ return [e[0] + 1900].concat(e.slice(1)); }))});
}
