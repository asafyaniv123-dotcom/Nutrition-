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
      ghosts: 0, cycle: 0, track: -1, tramp: 0, depth: 0
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
    var g = B.gold, w = B.white, hue = B.hue + 6*g, bri = B.bri*(1 + .1*g)*(1 + 1.4*w),
        sat = B.sat*(1 + .6*g)*(1 - .9*w), sep = .25*g;
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
      el.style.filter = R.blur > .05 ? 'blur(' + (R.blur*kc).toFixed(2) + 'px)' : '';
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
   'בזמן שהמתכנן חושב. כל טבעת נוטה על ציר אחר ומסתובבת סביבו בתלת־ממד, כמו ג׳ירוסקופ, והעיניים עוקבות אחריהן. בסוף הן נוחתות חזרה, ובא רגע של "הבנתי".',
   {dur:6400, ev:[[0,'face','thinking'],[0,'mode',{float:20}],
     [0,'fx',{t:'fx',v:{depth:1},d:0}],
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
  ['shell', 'קונכייה',
   'כשאין עדיין כלום במסך. הוא נבהל, והטבעות נסגרות עליו מקדימה כמו קונכייה. מבין החרוזים הוא מציץ ימינה ושמאלה, ואז נפתח בבת אחת וקופץ.',
   {dur:5000, ev:[[0,'face','surprised'],[150,'squash',-1.5],[250,'fx',{t:'rings',v:{front:1},d:0}],
     [250,'fx',{t:'rings',v:{sc:[.8,.55,.36]},d:500,s:60}],[300,'gate',.9],
     [800,'face','closed'],[800,'set',{sv:[60,-50,40]}],
     [1600,'face','calm'],[1700,'look',-20,-4],[2300,'look',18,-4],[2900,'look',0,0],
     [3100,'face','surprised'],[3250,'fx',{t:'rings',v:{sc:1},d:500,e:'back',s:40}],[3250,'gate',1],
     [3250,'burst',1.8],[3300,'face','happy'],[3350,'hop',90],[3800,'fx',{t:'rings',v:{front:0},d:0}],
     [4600,'face','calm']]}],
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
