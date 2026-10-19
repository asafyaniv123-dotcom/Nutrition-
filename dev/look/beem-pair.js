/* Two Beems, red and green - for working out together, Asaf's idea of 19.10:
   when two phones connect by QR, each one's Beem leaves its phone and lands
   in the other's, so the connection is SEEN.

   Loaded after beem-engine, beem-special, beem-alive and beem-moon (for
   rampOf); edits none of them. The colours are made the way gold and the moon
   were - a gradient map of his own brightness, body and every bead - so a red
   or green Beem is still the canon render, not a repaint. */

/* HIS COLOURS ARE KEPT. The first version gradient-mapped each Beem to one
   hue, and Asaf saw what that cost: the red, orange and yellow rings became
   one flat green - his variety was gone. Now the red player IS Beem, as he
   is, and the green one is the same picture turned round the colour wheel:
   every pixel keeps its own saturation and lightness and moves by the same
   angle, so the three rings stay three different colours - three greens
   instead of red, orange and yellow. */
var TINT_HUE = {green: 112};
var TINTS = {};
function hueOf(src, deg){
  var c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  var x = c.getContext('2d'); x.drawImage(src, 0, 0);
  var im = x.getImageData(0, 0, c.width, c.height), d = im.data, sh = deg/360;
  for (var i = 0; i < d.length; i += 4){
    if (!d[i+3]) continue;
    var r = d[i]/255, g = d[i+1]/255, b = d[i+2]/255, mx = Math.max(r, g, b), mn = Math.min(r, g, b),
        l = (mx + mn)/2, s = 0, h = 0, dd = mx - mn;
    if (dd){ s = l > .5 ? dd/(2 - mx - mn) : dd/(mx + mn);
      h = mx === r ? (g - b)/dd + (g < b ? 6 : 0) : mx === g ? (b - r)/dd + 2 : (r - g)/dd + 4; h /= 6; }
    h = (h + sh) % 1;
    var q = l < .5 ? l*(1 + s) : l + s - l*s, p = 2*l - q;
    var f = function(t){ t = (t + 1) % 1; return t < 1/6 ? p + (q - p)*6*t : t < .5 ? q : t < 2/3 ? p + (q - p)*(2/3 - t)*6 : p; };
    d[i] = f(h + 1/3)*255; d[i+1] = f(h)*255; d[i+2] = f(h - 1/3)*255;
  }
  x.putImageData(im, 0, 0); return c;
}
BEEM_READY.then(function(){
  (function wait(){
    if (!BEADS) return setTimeout(wait, 60);
    Object.keys(TINT_HUE).forEach(function(k){
      var deg = TINT_HUE[k];
      TINTS[k] = {body: hueOf(EB, deg),
                  beads: BEADS.map(function(ring){ return ring.map(function(b){ return hueOf(b.spr, deg); }); })};
    });
  })();
});

(function(){
  var _paint = Beem.prototype.paint;
  Beem.prototype.paint = function(){
    _paint.call(this);
    var T = this.tint && TINTS[this.tint], f = this.fx;
    if (!T || !f) return;
    /* the body: its colour map over it, then the eyes again on top */
    var cx = this.cx, W = this.cv.width, k = W/VB;
    cx.save(); cx.setTransform(1,0,0,1,0,0); cx.drawImage(T.body, 0, 0, W, W); cx.restore();
    cx.save(); cx.beginPath(); cx.arc(SPH.x*k, SPH.y*k, (SPH.r - 1)*k, 0, Math.PI*2); cx.clip();
    this.eye(cx, 0, k); this.eye(cx, 1, k); cx.restore();
    /* the beads: the same bead pass as the moon's, with this colour's sprites */
    if (!(f.beads > .5 && this.bk)) return;
    var cb = this.bk.getContext('2d'), cf = this.fw.getContext('2d'), Wc = this.bk.width, kp = Wc/VB;
    cb.clearRect(0, 0, Wc, Wc); cf.clearRect(0, 0, Wc, Wc);
    var br = 1 + this.breathe[0]*Math.sin(this.t*2*Math.PI/this.breathe[1]), D = 3*VB, list = [], i;
    for (i = 0; i < 3; i++){
      var Rr = f.rings[i], gR = this.rg[i]*(1 + this.burst[i]*.16)*br, rs = this.rsq[i],
          drop = CONTACT*(1 - this.rg[i]) + CONTACT*rs*this.rg[i],
          sa = Math.sin(this.spin[i]*RAD), ca = Math.cos(this.spin[i]*RAD),
          cY = Math.cos(Rr.tiltY*RAD), sY = Math.sin(Rr.tiltY*RAD), cX = Math.cos(Rr.tilt*RAD), sX = Math.sin(Rr.tilt*RAD),
          cZ = Math.cos(Rr.prec*RAD), sZ = Math.sin(Rr.prec*RAD);
      BEADS[i].forEach(function(b, j){
        var x = b.bx*ca - b.by*sa, y = b.bx*sa + b.by*ca;
        x = x*gR/(1 - rs) + this.rx[i]; y = y*gR*(1 - rs) + this.ry[i] + drop;
        x *= Rr.sc; y *= Rr.sc;
        var x1 = x*cY, z1 = -x*sY, y2 = y*cX - z1*sX, z2 = y*sX + z1*cX,
            x3 = x1*cZ - y2*sZ, y3 = x1*sZ + y2*cZ, sp = D/(D - z2);
        list.push({z: z2, X: 512 + (x3 + Rr.dx)*sp, Y: 512 + (y3 + Rr.dy)*sp, k: gR*Rr.sc*sp, b: b,
                   s: T.beads[i][j], op: Rr.op, front: Rr.front > .5});
      }, this);
    }
    list.sort(function(a, b){ return a.z - b.z; });
    list.forEach(function(o){
      var c = (o.z > 0 || o.front) ? cf : cb;
      c.globalAlpha = Math.max(0, Math.min(1, o.op));
      c.drawImage(o.s, (o.X - o.b.ox*o.k)*kp, (o.Y - o.b.oy*o.k)*kp, o.s.width*o.k*kp, o.s.height*o.k*kp);
    });
    cb.globalAlpha = 1; cf.globalAlpha = 1;
  };
})();

/* the colour lives on the Beem; bead mode must be on for the beads to take
   it, and must survive every play() - which resets all effects */
(function(){
  var _reset = Beem.prototype.reset;
  Beem.prototype.reset = function(){ _reset.call(this); if (this.tint) this.fx.beads = 1; };
})();
function tintBeem(b, name){ b.tint = name; b.fx.beads = 1; }
