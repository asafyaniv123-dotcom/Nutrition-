/* Two Beems, red and green - for working out together, Asaf's idea of 19.10:
   when two phones connect by QR, each one's Beem leaves its phone and lands
   in the other's, so the connection is SEEN.

   Loaded after beem-engine, beem-special, beem-alive and beem-moon (for
   rampOf); edits none of them. The colours are made the way gold and the moon
   were - a gradient map of his own brightness, body and every bead - so a red
   or green Beem is still the canon render, not a repaint. */

var TINT_RAMPS = {
  red:   [[0, 92,12,22], [.35, 168,26,40], [.6, 222,60,64], [.85, 246,136,124], [1, 255,218,206]],
  green: [[0, 12,70,42], [.35, 28,136,78], [.6, 64,190,112], [.85, 156,228,172], [1, 226,255,236]]
};
var TINTS = {};
BEEM_READY.then(function(){
  (function wait(){
    if (!BEADS) return setTimeout(wait, 60);
    Object.keys(TINT_RAMPS).forEach(function(k){
      var R = TINT_RAMPS[k];
      TINTS[k] = {body: rampOf(EB, 60, 170, R),
                  beads: BEADS.map(function(ring){ return ring.map(function(b){ return rampOf(b.spr, 0, 190, R); }); })};
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
