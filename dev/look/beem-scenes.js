/* Beem with props: one scene per prop, shared by beem-interact.html and the
   character sheet. Needs beem-engine, beem-special and beem-alive first.
   Every name here is new on purpose - the page this came from defined its
   own load(), which shadowed the engine's and kept the beads from loading.

     new PropScene(card, PROP_SCENES[i], all)  card holds a .ps-scene box
     scene.prop('p', img, heightShare, 'front')
     scene.tick(dt)                            every frame
     propImage(name)                           Promise of beem-props/<name>.png
     PROP_H[name]                              the prop's height, as a share of the scene */
(function(){
  var s = document.createElement('style');
  s.textContent =
    '.ps-scene{position:relative;aspect-ratio:1.35;border-radius:14px;overflow:hidden;cursor:pointer;' +
      'box-shadow:inset 2px 3px 7px rgba(176,168,156,.28),inset -2px -2px 6px rgba(255,255,255,.95)}' +
    '.ps-scene .ps-stage{position:absolute;z-index:2}' +
    '.ps-scene .ps-prop{position:absolute;left:0;top:0;transform-origin:50% 100%;will-change:transform;pointer-events:none;z-index:3}' +
    '.ps-scene .ps-floor{position:absolute;left:6%;right:6%;height:1px;background:rgba(176,168,156,.35)}';
  document.head.appendChild(s);
})();
function propImage(name){ return new Promise(function(r){ var i = new Image(); i.onload = function(){ r(i); }; i.src = 'beem-props/' + name + '.png'; }); }
var PROP_H = {dumbbell: .2, glass: .3, ball: .17, gift: .3, clock: .27};
/* ── a scene: a stage for Beem, a floor, and props in px ── */
function PropScene(card, cfg, all){
  var sc = card.querySelector('.ps-scene'), self = this;
  this.el = sc; this.cfg = cfg; this.props = {};
  var st = document.createElement('div'); st.className = 'ps-stage'; sc.appendChild(st);
  var fl = document.createElement('div'); fl.className = 'ps-floor'; sc.appendChild(fl);
  this.b = new Beem(st); all.push(this.b);
  this.layout = function(){
    var W = sc.clientWidth, H = sc.clientHeight, S = H*.78;
    self.W = W; self.H = H; self.S = S; self.k = S/VB;
    self.sx = W*cfg.at - S/2; self.sy = H*.06;
    st.style.left = self.sx + 'px'; st.style.top = self.sy + 'px'; st.style.width = st.style.height = S + 'px';
    self.floor = self.sy + 737*self.k; fl.style.top = self.floor + 'px';
  };
  this.layout(); window.addEventListener('resize', this.layout);
  /* where Beem is, in px */
  this.beem = function(){ var b = self.b, k = self.k;
    return {x: self.sx + (SPH.x + b.x)*k, y: self.sy + (SPH.y + b.y)*k, r: SPH.r*k*b.gate}; };
  this.prop = function(name, img, h, layer, el){
    var e = el || document.createElement('img'); if (!el) e.src = img.src; e.className = 'ps-prop ' + (layer || 'front');
    sc.appendChild(e);
    var p = {el: e, img: img, h: h, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, sq: 0, sqv: 0, s: 1, op: 1, free: false};
    self.props[name] = p; return p;
  };
  this.draw = function(p){
    var hpx = p.h*self.H, w = hpx*p.img.width/p.img.height;
    p.el.style.width = w + 'px'; p.el.style.height = hpx + 'px';
    p.el.style.opacity = p.op;
    p.el.style.transform = 'translate(' + (p.x - w/2).toFixed(1) + 'px,' + (p.y - hpx).toFixed(1) + 'px) rotate(' +
      p.rot.toFixed(2) + 'deg) scale(' + (p.s/(1 - p.sq)).toFixed(3) + ',' + (p.s*(1 - p.sq)).toFixed(3) + ')';
  };
  /* a free prop: gravity, the floor, a little bounce, and its own squash */
  this.physics = function(p, dt){
    p.sqv += (-p.sq*300 - p.sqv*16)*dt; p.sq = Math.max(-.1, Math.min(.35, p.sq + p.sqv*dt));
    if (!p.free) return;
    p.vy += 2600*dt; p.x += p.vx*dt; p.y += p.vy*dt; p.rot += p.vr*dt;
    if (p.y > self.floor){ p.y = self.floor;
      if (p.vy > 160){ p.sqv += Math.min(5, p.vy*.004); p.vy = -p.vy*(p.bounce || .35); p.vr *= .5; }
      else { p.vy = 0; p.vr = 0; }
      p.vx *= .82; p.rot *= .7;
    }
  };
  /* ── THE RINGS ARE BODY TOO (Asaf, 19.10): every bead is a little mass on
     a spring, pushed out of the way when a prop enters its space, wobbling
     and settling back. A push big enough also shakes its whole ring. ── */
  var off = {}, BR = 26;                                   // a bead's own radius, in his units
  this.obstacles = function(){
    var out = [];
    for (var n in self.props){ var p = self.props[n]; if (p.op < .2 || p.s < .2 || p.ghost) continue;
      var hpx = p.h*self.H*p.s, w = hpx*p.img.width/p.img.height;
      /* the prop's own box, inset a little - a circle left the gift's corners
         sitting under the beads */
      var k = self.k, ins = .1;
      out.push({x0: (p.x - w*(.5 - ins) - self.sx)/k - 512, x1: (p.x + w*(.5 - ins) - self.sx)/k - 512,
                y0: (p.y - hpx*(1 - ins) - self.sy)/k - 512, y1: (p.y - hpx*ins - self.sy)/k - 512}); }
    return out;
  };
  this.b.beadHook = function(i, j, x, y){
    var dt = self.bdt || 0, key = i*100 + j, o = off[key] || (off[key] = {x: 0, y: 0, vx: 0, vy: 0});
    o.vx += (-o.x*150 - o.vx*11)*dt; o.vy += (-o.y*150 - o.vy*11)*dt; o.x += o.vx*dt; o.y += o.vy*dt;
    var obs = self.obs || [];
    for (var q = 0; q < obs.length; q++){
      /* inside the box grown by a bead's radius: leave by the nearest side */
      var c = obs[q], bx = x + o.x, by = y + o.y;
      if (bx > c.x0 - BR && bx < c.x1 + BR && by > c.y0 - BR && by < c.y1 + BR){
        var pl = bx - (c.x0 - BR), pr = (c.x1 + BR) - bx, pt = by - (c.y0 - BR), pb = (c.y1 + BR) - by;
        var pen = Math.min(pl, pr, pt, pb), nx = 0, ny = 0;
        if (pen === pl) nx = -1; else if (pen === pr) nx = 1; else if (pen === pt) ny = -1; else ny = 1;
        o.x += nx*pen; o.y += ny*pen; o.vx += nx*pen*6; o.vy += ny*pen*6;
        if (pen > 18) self.b.bv[i] = Math.min(self.b.bv[i] + pen*.004, 1.2);   // the whole ring feels it
      }
    }
    return [x + o.x, y + o.y];
  };
  /* the outer ring's reach in px - a prop meets THIS, not just the body */
  this.reach = function(){ return 400*self.k*self.b.gate; };
  this.restart = function(){ self.t = 0; off = {}; self.b.play(SCENE_IDLE); self.b.fx.beads = 1; cfg.reset(self); };
  this.tick = function(dt){
    self.t += dt; self.bdt = dt; self.obs = self.obstacles(); cfg.update(self, self.t, dt);
    for (var n in self.props){ self.physics(self.props[n], dt); self.draw(self.props[n]); }
    if (self.t > cfg.loop) self.restart();
  };
  sc.addEventListener('click', function(){ self.restart(); });
}
function sceneOnce(sc, key){ if (sc.f[key]) return false; sc.f[key] = 1; return true; }

/* ══ THE GLASS, SECOND WAY (Asaf: "it looks broken"). Repainting water pixels
   in steps left half-painted edges and read as a bug. Now the glass is three
   layers made once from its own render:
     an EMPTY glass - the clear band just above the water, stretched down the
       walls row by row at the glass's own width there, so it is the same
       glass with nothing in it;
     the WATER - the original render, shown only below the current level;
     the SURFACE - the original surface band (its pale ellipse), moved down
       with the level and narrowed to the glass's width at that height.
   The level then moves smoothly, so the water is seen going down. ══ */
function GlassFX(img){
  var W = img.width, H = img.height, c = document.createElement('canvas'); c.width = W; c.height = H;
  var g = c.getContext('2d'); g.drawImage(img, 0, 0);
  var src = g.getImageData(0, 0, W, H), d = src.data, wTop = H, wBot = 0, L = [], R = [];
  /* a row is WATER when most of its middle is saturated blue - a single
     blue pixel is not enough: the glass's own rim is blue too, and counting
     it took the whole glass for water */
  var isW = [];
  for (var y = 0; y < H; y++){ L[y] = -1; R[y] = -1; var wn = 0, cn = 0;
    for (var x = 0; x < W; x++){ var i = (y*W + x)*4;
      if (d[i+3] > 200){ if (L[y] < 0) L[y] = x; R[y] = x; }
      if (x > W*.3 && x < W*.7 && d[i+3] > 200){ cn++;
        var sat = d[i+2] - (d[i] + d[i+1])/2; if (sat > 50 && d[i+2] > 140) wn++; } }
    isW[y] = cn > 8 ? wn/cn : 0; }
  /* MEASURED on this glass, by row: empty glass is saturation ~37, the
     water's SURFACE (its ellipse, seen from above) ~80, the deep water ~90 -
     and between them one pale line, the surface's far edge. So: the water
     starts where blue starts; the surface runs from there to the first
     deep row; and the two move as separate pieces. */
  /* by each row's AVERAGE saturation across the middle (measured: rim 68 for
     one row, empty glass ~37, surface ~80, deep water ~88, then the water's
     bottom edge and the glass base) */
  var sat = [];
  for (y = 0; y < H; y++){ var sn = 0, ss = 0;
    for (var xx = Math.floor(W*.3); xx < W*.7; xx++){ var ii = (y*W + xx)*4; if (d[ii+3] < 200) continue;
      sn++; ss += d[ii+2] - (d[ii] + d[ii+1])/2; }
    sat[y] = sn ? ss/sn : 0; }
  function runFrom(y0, lo, n){ for (var y = y0; y < H - n; y++){ var ok = true;
    for (var q = 0; q < n; q++) if (sat[y + q] <= lo){ ok = false; break; } if (ok) return y; } return -1; }
  wTop = runFrom(Math.floor(H*.1), 60, 8);                  // eight blue rows in a row: the rim is one
  var deep = runFrom(wTop + 10, 84, 8);
  wBot = deep; while (wBot < H - 1 && sat[wBot + 1] > 75) wBot++;
  this.deep = deep;
  if (wTop < 0 || deep < 0) console.warn('GlassFX: no water found');
  this.top = wTop; this.bot = wBot;
  /* the empty glass */
  var emp = document.createElement('canvas'); emp.width = W; emp.height = H;
  var eg = emp.getContext('2d'), ed = g.getImageData(0, 0, W, H), e = ed.data, srcRow = wTop - 12;
  for (y = wTop - 4; y <= wBot; y++){ if (L[y] < 0) continue;
    for (x = L[y]; x <= R[y]; x++){
      var u = (x - L[y])/Math.max(1, R[y] - L[y]), sx = Math.round(L[srcRow] + u*(R[srcRow] - L[srcRow]));
      var o = (y*W + x)*4, s = (srcRow*W + sx)*4;
      e[o] = d[s]; e[o+1] = d[s+1]; e[o+2] = d[s+2]; } }
  eg.putImageData(ed, 0, 0);
  this.empty = emp; this.img = img; this.L = L; this.R = R; this.W = W; this.H = H;
  this.out = document.createElement('canvas'); this.out.width = W; this.out.height = H;
  this.band = this.deep - wTop;                             // the surface, top edge to first deep row
  this.draw(1);
}
GlassFX.prototype.draw = function(level){
  var o = this.out.getContext('2d'), W = this.W, H = this.H, band = this.band;
  var travel = this.bot - this.deep - 16, y = Math.round(this.top + (1 - level)*travel);
  o.clearRect(0, 0, W, H); o.drawImage(this.empty, 0, 0);
  /* the deep water, from just under the surface's new place down */
  o.drawImage(this.img, 0, y + band, W, H - y - band, 0, y + band, W, H - y - band);
  /* the surface, whole - its ellipse and its far edge - moved down and
     narrowed to the glass's width at its new height */
  var t = this.top, mid0 = t + (band >> 1), mid1 = y + (band >> 1);
  var w0 = this.R[mid0] - this.L[mid0], w1 = this.R[mid1] - this.L[mid1];
  if (w0 > 0 && w1 > 0){
    var k = w1/w0, cx1 = (this.L[mid1] + this.R[mid1])/2;
    o.drawImage(this.img, this.L[mid0], t, w0, band, cx1 - w0*k/2, y, w0*k, band);
  }
};

var SCENE_IDLE = {dur: 1e9, ev: [[0, 'mode', {breathe: [.014, 3.6], idle: 0}]]};
var PROP_SCENES = [
  {img: 'dumbbell', at: .5, loop: 8.4, t: 'משקולת',
   p: 'הטבעות מתהדקות סביב המשקולת ומרימות אותה מעל הראש. שלוש חזרות: הוא נמעך תחת המשקל בירידה ונמתח בעלייה. בחזרה האחרונה הוא זורח, ומניח אותה.',
   reset: function(s){ s.f = {}; var p = s.props.p; p.free = true; p.x = s.W*.8; p.y = s.floor; p.vx = p.vy = 0; p.rot = 0;
     s.b.verb('look', 26, -10); s.b.verb('face', 'curious'); },
   update: function(s, t){
     var b = s.b, p = s.props.p, B = s.beem();
     if (t > 1 && sceneOnce(s, 'go')){ b.verb('face', 'determined'); b.verb('look', 0, 0); b.verb('to', 260, 0); }
     if (t > 1.9 && sceneOnce(s, 'grab')){ p.free = false; b.fxTween({t: 'rings', v: {sc: .82}, d: 220}); b.verb('to', 0, 0); }
     if (!p.free && t > 1.9){
       /* held: it rides on his head, lagging a touch, and tilts with his motion */
       /* it rests ON THE RINGS, pressing the top beads down, not on the bare body */
       var tx = B.x, ty = B.y - s.reach()*.62; p.x += (tx - p.x)*.35; p.y += (ty - p.y)*.35; p.rot = -b.vx*.004;
     }
     [3.0, 4.2, 5.4].forEach(function(at, i){
       if (t > at && sceneOnce(s, 'rep' + i)){ b.verb('squash', 5.5); b.verb('face', i === 2 ? 'happy' : 'determined');
         s.b.pend.push([b.sT + .35, 'stretch', .08], [b.sT + .75, 'stretch', 0]); if (i === 2) b.verb('burst', 1.8); }
     });
     if (t > 6.6 && sceneOnce(s, 'drop')){ p.free = true; p.vx = 260; p.vy = -380; p.vr = 160;
       b.fxTween({t: 'rings', v: {sc: 1}, d: 400, e: 'back'}); b.verb('face', 'content'); b.verb('hop', 40); }
   }},
  {img: 'glass', at: .4, loop: 9, t: 'כוס מים',
   p: 'הוא נשען אל הכוס והיא נוטה אליו. בכל לגימה המפלס יורד, ובצבע של הכוס עצמה, בלי רנדר של כוס ריקה. אחרי הלגימה האחרונה הוא מרוצה ונושם.',
   reset: function(s){ s.f = {}; s.lv = 1; s.lvShown = 1; var p = s.props.p; p.free = true; p.x = s.W*.74; p.y = s.floor; p.rot = 0;
     s.gfx.draw(1); s.b.verb('look', 24, -6); s.b.verb('face', 'curious'); },
   update: function(s, t){
     var b = s.b, p = s.props.p;
     [1.2, 3.2, 5.2].forEach(function(at, i){
       if (t > at && sceneOnce(s, 'sip' + i)){ b.verb('to', 90, 0); b.verb('face', 'content'); b.verb('look', 30, -4); s.sipAt = t; }
       if (t > at + .5 && sceneOnce(s, 'gulp' + i)){ b.verb('face', 'happy'); b.verb('squash', 1.6);
         s.lv = Math.max(.04, 1 - (i + 1)*.32); }
       if (t > at + 1.2 && sceneOnce(s, 'back' + i)){ b.verb('to', 0, 0); b.verb('face', 'calm'); }
     });
     /* the level follows smoothly - the water is SEEN going down */
     if (Math.abs(s.lvShown - s.lv) > .002){ s.lvShown += (s.lv - s.lvShown)*.07; s.gfx.draw(s.lvShown); }
     var tilt = s.sipAt && t - s.sipAt < 1.2 ? Math.sin(Math.min(1, (t - s.sipAt)/.5)*Math.PI/2)*-22 : 0;
     p.rot += (tilt - p.rot)*.15;
     if (t > 6.8 && sceneOnce(s, 'done')){ b.verb('face', 'content'); b.verb('burst', 1); b.verb('nod', 1, 8); }
   }},
  {img: 'ball', at: .45, loop: 3.6, t: 'כדור',
   p: 'הכדור נזרק אליו מהצד ומקפץ על הרצפה. Mip עוקב אחריו בעיניים, מקבל אותו בגוף ומחזיר אותו בנגיחה. ההתנגשות היא פיזיקה: הכדור נהדף מהכדור שלו.',
   reset: function(s){ s.f = {}; var p = s.props.p; p.free = true; p.bounce = .62; p.x = s.W*1.05; p.y = s.floor - s.H*.55;
     p.vx = -s.W*.55; p.vy = -200; p.vr = -300; s.b.verb('face', 'calm'); },
   update: function(s, t, dt){
     var b = s.b, p = s.props.p, B = s.beem(), r = p.h*s.H/2, cx = p.x, cy = p.y - r;
     /* his eyes follow the ball */
     b.lkX = Math.max(-36, Math.min(36, (cx - B.x)/s.S*90)); b.lkY = Math.max(-22, Math.min(22, -(cy - B.y)/s.S*70)); b.idle = false;
     /* it meets the outer beads first - they scatter (beadHook) - and the
        rebound comes from the whole of him, rings included */
     var dx = cx - B.x, dy = cy - B.y, dist = Math.hypot(dx, dy), R = s.reach()*.82;
     if (dist < R + r && !s.hit){
       s.hit = 1; var nx = dx/dist, ny = dy/dist, vn = p.vx*nx + p.vy*ny;
       if (vn < 0){ p.vx -= 2*vn*nx; p.vy -= 2*vn*ny; }
       p.vy -= 900; p.vx += 120; p.vr = 400;                      // the header
       b.verb('face', 'surprised'); b.verb('squash', 3); b.verb('hop', 60);
       b.pend.push([b.sT + .4, 'face', 'happy'], [b.sT + 1.4, 'face', 'calm']);
     }
     if (dist > R + r + 20) s.hit = 0;
   }},
  {img: 'gift', at: .42, loop: 8, t: 'מתנה',
   p: 'קופסה מופיעה לידו ורועדת פעמיים. הוא סקרן, מתקרב, ואז היא נפתחת בהבזק אור. האור עובר אליו, והוא הופך ל־Mip זהב. לאבני דרך.',
   reset: function(s){ s.f = {}; var p = s.props.p; p.free = false; p.x = s.W*.76; p.y = s.floor; p.rot = 0; p.s = 0; p.op = 1;
     s.b.fxTween({t: 'body', v: {gold: 0}, d: 0}); s.b.verb('face', 'calm'); },
   update: function(s, t){
     var b = s.b, p = s.props.p;
     if (t < .6) p.s = Math.min(1, t/.35*1.08 - Math.max(0, t - .35)*.3);
     else if (p.s !== 1 && t < 1) p.s = 1;
     if (t > .7 && sceneOnce(s, 'see')){ b.verb('look', 30, -6); b.verb('face', 'curious'); }
     [[1.4, 'w1'], [2.3, 'w2']].forEach(function(w){ if (t > w[0] && t < w[0] + .45) p.rot = Math.sin((t - w[0])*44)*9; });
     if (t > 2.8 && sceneOnce(s, 'near')){ b.verb('to', 160, 0); b.verb('face', 'surprised'); }
     if (t > 3.4 && t < 3.75){ p.s = 1 + (t - 3.4)*1.2; p.op = 1 - (t - 3.4)/.35; p.sq = -.1; }
     if (t > 3.4 && sceneOnce(s, 'open')){ p.rot = 0;
       b.fxTween({t: 'body', v: {white: .8}, d: 120}); b.pend.push([b.sT + .14, 'fx', {t: 'body', v: {white: 0, gold: 1}, d: 500, e: 'out'}]);
       b.verb('fx', {t: 'fx', v: {beads: 1}, d: 0}); b.verb('burst', 2.4); b.verb('spin', 220); b.verb('face', 'happy'); b.verb('hop', 120); }
     if (t > 3.8){ p.op = 0; }
     if (t > 4.3 && sceneOnce(s, 'back')) b.verb('to', 0, 0);
     if (t > 6.6 && sceneOnce(s, 'fade')) b.fxTween({t: 'body', v: {gold: 0}, d: 900});
   }},
  {img: 'clock', at: .44, loop: 8, t: 'שעון מעורר',
   p: 'הוא ישן. השעון מצלצל ורועד ומקפץ על הרצפה, והוא קופץ בבהלה. הוא מסתכל עליו, קופץ אליו בנחישות ונוגע בו מהצד, והשעון נמעך ומשתתק. ואז פיהוק מרוצה.',
   reset: function(s){ s.f = {}; var p = s.props.p; p.free = true; p.x = s.W*.8; p.y = s.floor; p.rot = 0; p.vx = 0;
     s.b.play({dur: 1e9, ev: [[0, 'face', 'closed'], [0, 'mode', {breathe: [.022, 4.6], idle: 0}]]}); s.b.fx.beads = 1; },
   update: function(s, t){
     var b = s.b, p = s.props.p, B = s.beem();
     var ringing = t > 1.2 && !s.f.stop;
     if (ringing){ p.rot = Math.sin(t*70)*7; if (p.y >= s.floor - .5 && Math.random() < .08) p.vy = -260; }
     /* a startle that stays in frame - 520 took him out of the top of it */
     if (t > 1.35 && sceneOnce(s, 'jump')){ b.verb('face', 'surprised'); b.verb('launch', 230); }
     if (t > 2.6 && sceneOnce(s, 'look')){ b.verb('look', 30, -10); b.verb('face', 'determined'); }
     /* he hops to the clock's SIDE and pokes it - landing on top of it hid it */
     if (t > 3.3 && sceneOnce(s, 'go')){ var hw = p.h*s.H*.5*p.img.width/p.img.height;
       b.verb('to', (p.x - hw*.55 - s.sx)/s.k - SPH.x - SPH.r*.95, 0); b.verb('launch', 180); }
     if (t > 4.0 && sceneOnce(s, 'stop')){ p.sq = .28; p.sqv = 0; p.rot = 0; p.vx = 30;
       b.verb('squash', 2.5); b.verb('face', 'content'); b.verb('burst', .8); }
     if (s.f.stop && t > 5 && sceneOnce(s, 'yawn')){ b.verb('face', 'sleepy'); b.verb('stretch', .06); b.pend.push([b.sT + .6, 'stretch', 0]);
       b.verb('to', 0, 0); }
     if (s.f.stop && t > 6.2 && sceneOnce(s, 'sleep')) b.verb('face', 'closed');
   }}
];

