/* Beem's full-screen moments, the Duolingo kind (Asaf, 24.10): the whole
   screen floods with one colour, Mip does something big in the middle, a
   headline and a line under it, and one button to carry on. What they will be
   used for is not decided; this is the one building block they will all be,
   so that adding one is a call and not a new screen.

     beemScreenShow({
       bg:     '#ff7a1a',          the flood
       ink:    '#fff',             text colour on it
       accent: '#b34a00',          the button's text: the flood, darkened until it reads
       title:  'נראה טוב',          the headline (already translated by the caller)
       sub:    '...',              the line under it, optional
       button: 'המשך',             the one button
       play:   'streak',           a combo or special by id, or a script object
       glow:   7,                  the streak worn as light, optional
       beads:  true,               a burst of Beem's beads behind him
       confetti: true,             confetti drifting down, gently, the whole time
                                   (or an array of colours for its pieces)
       host:   element,            where to draw it; the page by default
       onClose: function(){}
     })  ->  {close: function}

   Needs beem-engine, beem-special and beem-alive (for byId and the lists).
   Loaded raw by the pages under dev/look, and inside beem-app.js for the app,
   where BeemKit.screen calls it. Names are prefixed beemScreen so nothing a
   page declares can shadow them. */
var BEEM_SCREEN_CSS_ON = false;
function beemScreenCss(){
  if (BEEM_SCREEN_CSS_ON) return; BEEM_SCREEN_CSS_ON = true;
  var s = document.createElement('style');
  s.textContent =
    '.bms{position:fixed;inset:0;z-index:9500;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;' +
      'padding:24px 24px calc(28px + env(safe-area-inset-bottom));text-align:center;font-family:inherit;clip-path:circle(0% at 50% 42%);' +
      'transition:clip-path .55s cubic-bezier(.3,.8,.3,1)}' +
    '.bms.in{clip-path:circle(150% at 50% 42%)}' +
    '.bms.out{transition:clip-path .4s cubic-bezier(.6,0,.8,.4);clip-path:circle(0% at 50% 42%)}' +
    '.bms-stage{position:relative;width:min(62vw,260px);height:min(62vw,260px);margin-top:-6vh}' +
    '.bms-t{font-size:clamp(28px,8.4vw,38px);font-weight:800;line-height:1.15;letter-spacing:-.01em;margin-top:12px;opacity:0;transform:translateY(14px);transition:opacity .45s,transform .45s cubic-bezier(.2,.9,.3,1)}' +
    '.bms-s{font-size:clamp(15px,4.3vw,18px);font-weight:600;line-height:1.5;max-width:30ch;opacity:0;transform:translateY(14px);transition:opacity .45s .08s,transform .45s .08s cubic-bezier(.2,.9,.3,1)}' +
    '.bms.show .bms-t,.bms.show .bms-s{opacity:1;transform:none}' +
    '.bms-b{position:absolute;left:24px;right:24px;bottom:calc(28px + env(safe-area-inset-bottom));height:56px;border:none;border-radius:18px;font:inherit;font-size:17px;font-weight:800;cursor:pointer;' +
      'opacity:0;transform:translateY(20px);transition:opacity .4s .25s,transform .4s .25s cubic-bezier(.2,.9,.3,1)}' +
    '.bms.show .bms-b{opacity:1;transform:none}' +
    '.bms-bead{position:absolute;left:50%;top:50%;border-radius:50%;width:var(--s);height:var(--s);margin:calc(var(--s)/-2) 0 0 calc(var(--s)/-2);background:var(--c);opacity:0}' +
    '.bms.show .bms-bead{animation:bmsBurst 1.3s cubic-bezier(.15,.7,.3,1) forwards;animation-delay:var(--d)}' +
    '@keyframes bmsBurst{0%{opacity:0;transform:translate(0,0) scale(.4)}15%{opacity:1}100%{opacity:0;transform:translate(var(--x),var(--y)) scale(1)}}' +
    /* the confetti: each piece falls on the outer element and sways and turns on the inner one */
    /* z-index -1: under the words and the button, still over the flood - .bms is its own stacking context (clip-path) */
    '.bms-cf{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none;opacity:0;transition:opacity .8s}' +
    '.bms.show .bms-cf{opacity:1}' +
    '.bms-cf i{position:absolute;top:-6%;left:var(--l);animation:bmsFall var(--t) linear infinite;animation-delay:var(--d)}' +
    '.bms-cf b{display:block;width:var(--w);height:var(--h);border-radius:var(--r);background:var(--c);animation:bmsSway var(--s) ease-in-out infinite alternate}' +
    '@keyframes bmsFall{to{transform:translateY(calc(var(--H) + 12vh))}}' +
    '@keyframes bmsSway{from{transform:translateX(-14px) rotate(-40deg) rotateY(0)}to{transform:translateX(14px) rotate(50deg) rotateY(160deg)}}' +
    '@media (prefers-reduced-motion:reduce){.bms-cf{display:none}}' +
    '@media (prefers-reduced-motion:reduce){.bms,.bms.out{transition:none;clip-path:none}.bms-bead{display:none}.bms-t,.bms-s,.bms-b{transition:none}}';
  document.head.appendChild(s);
}
function beemScreenShow(o){
  o = o || {};
  beemScreenCss();
  var host = o.host || document.body, inPage = host !== document.body;
  var w = document.createElement('div'); w.className = 'bms'; w.setAttribute('role', 'dialog');
  if (inPage) w.style.position = 'absolute';
  w.style.background = o.bg || '#ff7a1a'; w.style.color = o.ink || '#fff';
  var beads = '';
  if (o.beads !== false){
    /* Beem's own three colours, thrown out from behind him */
    var C = ['#d55617', '#ed861f', '#fac047', '#fed662', '#ffffff'], i, a, d;
    for (i = 0; i < 22; i++){ a = i/22*Math.PI*2 + (i % 2)*.12; d = 110 + (i*37 % 90);
      beads += '<i class="bms-bead" style="--s:' + (8 + i % 4*3) + 'px;--c:' + C[i % C.length] + ';--x:' + Math.round(Math.cos(a)*d) + 'px;--y:' + Math.round(Math.sin(a)*d) + 'px;--d:' + (.35 + (i % 5)*.04) + 's"></i>'; }
  }
  var cf = '';
  if (o.confetti){
    /* light colours that read on any flood, a few of them strips and the rest beads */
    var K = o.confetti.length ? o.confetti : ['#fbf6ee', '#fed662', '#ffffff', '#fac047', '#e2412b', '#ffd9b0'], j;
    for (j = 0; j < 36; j++){ var strip = j % 3 !== 0, t = 7 + (j*1.7 % 6);
      cf += '<i style="--l:' + ((j*37 % 100) + .5) + '%;--t:' + t.toFixed(1) + 's;--d:-' + (j*t/36*1.9 % t).toFixed(1) + 's">' +
        '<b style="--w:' + (strip ? 7 : 8) + 'px;--h:' + (strip ? 13 : 8) + 'px;--r:' + (strip ? '2px' : '50%') + ';--c:' + K[j % K.length] + ';--s:' + (1.4 + (j % 5)*.35).toFixed(2) + 's"></b></i>'; }
    cf = '<div class="bms-cf">' + cf + '</div>';
  }
  w.innerHTML = cf + '<div class="bms-stage">' + beads + '<div class="bms-beem" style="position:absolute;inset:0"></div></div>' +
    '<div class="bms-t"></div>' + (o.sub ? '<div class="bms-s"></div>' : '') +
    '<button class="bms-b"></button>';
  w.querySelector('.bms-t').textContent = o.title || '';
  if (o.sub) w.querySelector('.bms-s').textContent = o.sub;
  var btn = w.querySelector('.bms-b'); btn.textContent = o.button || '';
  /* the button wears the flood's colour on the text's: it is the one way out */
  btn.style.background = o.ink || '#fff'; btn.style.color = o.accent || o.bg || '#ff7a1a';
  host.appendChild(w);
  if (o.confetti) w.querySelector('.bms-cf').style.setProperty('--H', w.offsetHeight + 'px');
  var b = new Beem(w.querySelector('.bms-beem'));
  var s = typeof o.play === 'string' ? (byId(COMBO_LIST, o.play) || byId(SPECIAL_LIST, o.play)) : o.play;
  b.play(s || byId(COMBO_LIST, 'party'));
  if (o.glow && typeof streakGlow === 'function'){
    var L = streakGlow(o.glow), el = w.querySelector('.beem');
    if (el) el.style.filter = 'drop-shadow(0 0 ' + (16 + 26*L).toFixed(0) + 'px rgba(255,230,170,' + (.35 + .45*L).toFixed(2) + '))';
  }
  if (o.run) o.run(b); else beemScreenRun(b, w);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ w.classList.add('in'); }); });
  setTimeout(function(){ w.classList.add('show'); }, 380);
  var done = false;
  function close(){
    if (done) return; done = true;
    w.classList.remove('show'); w.classList.add('out');
    setTimeout(function(){ w.remove(); if (o.onClose) o.onClose(); }, 420);
  }
  btn.onclick = close;
  return {close: close, beem: b};
}
/* a moment draws its own Beem while it is on screen, and stops with it */
function beemScreenRun(b, w){
  var last = null;
  (function tick(now){
    if (!w.isConnected) return;
    var dt = last === null ? .016 : Math.min(.05, (now - last)/1000); last = now;
    var n = Math.ceil(dt/.0167), h = dt/n, i;
    for (i = 0; i < n; i++) b.step(h);
    b.paint();
    requestAnimationFrame(tick);
  })(performance.now());
}
