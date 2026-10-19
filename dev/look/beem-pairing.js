/* Working out together: two phones pair by QR and their Beems trade places.
   Shared by beem-pair3.html (the three options) and the character sheet
   (option B, the flash - approved by Asaf 19.10). Needs beem-engine,
   beem-special, beem-pair and beem-colors loaded first.

     new BeemPair(host, 'A'|'B'|'C', ALL)   builds two mock phones in host
     pair.tick(now)                          call every frame
     BEEM_PAIR_CSS                           the phones' styles, injected once

   A: a jump high enough to leave the phone, swap measured off-screen
   B: a small jump, rings close, a white flash - the swap is inside the light
   C: shrink to a point, swap there, spring the other out
   None depends on which side the two phones stand. */
var BEEM_PAIR_SPEED = 1;
var BEEM_PAIR_IDLE = {dur: 1e9, ev: [[0, 'mode', {breathe: [.014, 3.6], idle: 1}]]};
(function(){
  var s = document.createElement('style');
  s.textContent =
    '.bp-pair{display:flex;gap:18px;justify-content:center}' +
    '.bp-phone{position:relative;width:min(190px,40vw);aspect-ratio:390/780;border-radius:24px;overflow:hidden;' +
      'background:#e9e7e3;box-shadow:-4px -4px 10px rgba(255,255,255,.95),7px 9px 20px rgba(120,100,80,.24);' +
      'display:flex;flex-direction:column;align-items:center;padding:16px 10px}' +
    '.bp-who{font-size:10px;font-weight:800;letter-spacing:.06em;color:#675f57}' +
    '.bp-st{font-size:11px;font-weight:700;color:#675f57;margin-top:4px;min-height:2.6em;text-align:center;line-height:1.4}' +
    '.bp-st.ok{color:#2f6b45}' +
    '.bp-box{position:relative;width:80%;aspect-ratio:1;margin-top:18px}' +
    '.bp-box .bp-stage{position:absolute;inset:0}' +
    '.bp-qr,.bp-view{position:absolute;inset:14%;border-radius:12px;transition:opacity .35s}' +
    '.bp-qr{background:#e9e7e3;box-shadow:inset 2px 3px 7px rgba(176,168,156,.28),inset -2px -2px 6px rgba(255,255,255,.95);padding:10%}' +
    '.bp-qr canvas{width:100%;height:100%;display:block;opacity:.8;image-rendering:pixelated}' +
    '.bp-view{border:2.5px dashed rgba(103,95,87,.45)}' +
    '.bp-gone{opacity:0}' +
    '@media (max-width:520px){.bp-phone{padding:12px 8px}}';
  document.head.appendChild(s);
})();
function bpQr(c){
  var g = c.getContext('2d'); g.fillStyle = '#433c38';
  for (var y = 0; y < 21; y++) for (var x = 0; x < 21; x++){
    var eye = function(ox, oy){ var u = x - ox, v = y - oy; return u >= 0 && u < 7 && v >= 0 && v < 7 &&
      (u === 0 || u === 6 || v === 0 || v === 6 || (u > 1 && u < 5 && v > 1 && v < 5)); };
    var inEye = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
    if (inEye ? (eye(0,0) || eye(14,0) || eye(0,14)) : ((x*7 + y*13 + x*y) % 5 < 2)) g.fillRect(x, y, 1, 1);
  }
}
function BeemPair(host, kind, ALL){
  host.innerHTML = '<div class="bp-pair">' +
    '<div class="bp-phone"><div class="bp-who">הטלפון של אסף</div><div class="bp-st"></div><div class="bp-box"><div class="bp-qr"><canvas width="21" height="21"></canvas></div><div class="bp-stage"></div></div></div>' +
    '<div class="bp-phone"><div class="bp-who">הטלפון של דנה</div><div class="bp-st"></div><div class="bp-box"><div class="bp-view"></div><div class="bp-stage"></div></div></div></div>';
  bpQr(host.querySelector('canvas'));
  var phones = host.querySelectorAll('.bp-phone'), st = host.querySelectorAll('.bp-st'), boxes = host.querySelectorAll('.bp-box');
  var stages = host.querySelectorAll('.bp-stage'), cover = [host.querySelector('.bp-qr'), host.querySelector('.bp-view')];
  var A = new Beem(stages[0]), B = new Beem(stages[1]); ALL.push(A, B);
  this.beems = [A, B];
  var me = this, T0 = 0, phase = '', T1 = 0, swapped = false, flags = {};
  function both(f){ [A, B].forEach(f); }
  function once1(k){ if (flags[k]) return false; flags[k] = 1; return true; }
  function swap(){ swapped = true; tintBeem(A, 'teal'); tintBeem(B, null); }
  function now(){ return (performance.now() - T0)/1000*BEEM_PAIR_SPEED; }
  this.start = function(){
    T0 = performance.now(); phase = 'wait'; swapped = false; flags = {};
    tintBeem(A, null); tintBeem(B, 'teal'); A.play(BEEM_PAIR_IDLE); B.play(BEEM_PAIR_IDLE);
    cover.forEach(function(c){ c.classList.remove('bp-gone'); });
    st[0].textContent = 'מציג קוד לסריקה'; st[1].textContent = 'סורקת את הקוד…'; st[0].className = st[1].className = 'bp-st';
    stages[0].style.transition = stages[1].style.transition = 'none';
    stages[0].style.transform = stages[1].style.transform = 'scale(.42) translateY(95%)';
  };
  /* A: from the box's centre to the phone's top edge, plus the outer ring,
     plus the most the rings can lag, plus a margin - in his own units */
  function exitHeight(){
    var b = boxes[0].getBoundingClientRect(), p = phones[0].getBoundingClientRect(), k = b.width/VB;
    return (b.top + b.height/2 - p.top)/k + 430 + 90 + 80;
  }
  function offscreen(bm, i){
    var b = boxes[i].getBoundingClientRect(), p = phones[i].getBoundingClientRect(), k = b.width/VB;
    var lowest = Math.max(bm.y, bm.ry[0], bm.ry[1], bm.ry[2]);
    return b.top - p.top + (b.height/2 + (lowest + 430)*k*bm.gate) < -4;
  }
  function land(){
    phase = 'landed'; T1 = now();
    both(function(b){ b.verb('face', 'happy'); b.verb('burst', 1.6); b.verb('spin', 180); });
    st[0].textContent = 'מחוברים! ה־Beem של דנה אצלך'; st[1].textContent = 'מחוברים! ה־Beem של אסף אצלך';
    st[0].className = st[1].className = 'bp-st ok';
  }
  this.tick = function(){
    if (!host.isConnected) return;
    var t = now();
    if (phase === 'wait' && t > 1.6){ phase = 'found';
      st[0].textContent = st[1].textContent = 'מתחברים…';
      cover.forEach(function(c){ c.classList.add('bp-gone'); });
      stages[0].style.transition = stages[1].style.transition = 'transform .45s cubic-bezier(.34,1.56,.64,1)';
      stages[0].style.transform = stages[1].style.transform = 'none';
      both(function(b){ b.verb('face', 'surprised'); b.verb('burst', .7); });
    }
    if (phase === 'found' && t > 2.4){ phase = 'crouch';
      both(function(b){ b.verb('squash', 4); b.verb('face', 'determined'); });
    }
    if (phase === 'crouch' && t > 2.62){ phase = 'go'; T1 = t;
      if (kind === 'A'){ var H = exitHeight(); both(function(b){ b.verb('face', 'happy'); b.verb('launch', H); b.verb('stretch', .06); }); }
      if (kind === 'B'){ both(function(b){ b.verb('face', 'happy'); b.verb('launch', 260); }); }
      if (kind === 'C'){ both(function(b){ b.verb('face', 'happy'); b.verb('spin', 520); b.verb('gate', 0); }); }
    }
    if (phase === 'go'){
      var u = t - T1;
      if (kind === 'A'){
        if (!swapped && offscreen(A, 0) && offscreen(B, 1)){ swap(); both(function(b){ b.verb('stretch', 0); b.verb('face', 'surprised'); }); }
        if (swapped && !A.air && u > .4) land();
        if (!swapped && u > 3){ swap(); land(); }
      }
      if (kind === 'B'){
        if (u > .12 && once1('close')) both(function(b){ b.fxTween({t: 'rings', v: {sc: .25, op: 0}, d: 180, e: 'in'});
          b.fxTween({t: 'body', v: {white: 1}, d: 160}); b.verb('spin', 400); });
        if (u > .32 && once1('swap')) swap();
        if (u > .38 && once1('open')) both(function(b){ b.fxTween({t: 'rings', v: {sc: 1, op: 1}, d: 420, e: 'back'});
          b.fxTween({t: 'body', v: {white: 0}, d: 380, e: 'out'}); b.verb('face', 'surprised'); });
        if (swapped && !A.air && u > .6) land();
      }
      if (kind === 'C'){
        if (u > .5 && A.gate < .03 && once1('swap')){ swap(); both(function(b){ b.verb('gate', 1); b.verb('face', 'surprised'); b.verb('spin', -300); }); }
        if (swapped && u > 1.0) land();
      }
    }
    if (phase === 'landed'){
      var w = t - T1;
      if (w > .7 && once1('l1')) both(function(b){ b.verb('look', 0, 20); b.verb('face', 'curious'); });
      if (w > 1.6 && once1('l2')) both(function(b){ b.verb('look', 0, 0); b.verb('face', 'calm'); });
      if (w > 2.1 && once1('l3')) both(function(b){ b.verb('face', 'happy'); b.verb('nod', 1, 9); });
      if (w > 3.1 && once1('l4')) both(function(b){ b.verb('face', 'content'); });
      if (w > 5) me.start();
    }
  };
  this.retime = function(old){ var t = (performance.now() - T0)/1000*old; T0 = performance.now() - t*1000/BEEM_PAIR_SPEED; };
  this.start();
}
