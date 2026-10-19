/* Ten Beems in ten colours - built on the ORIGINAL's template, not by turning
   the hue wheel (that is what made the green neon: one turn of the wheel at
   full saturation). Loaded after beem-pair.js, whose paint already knows how
   to draw a Beem from a colour set (TINTS); this file only makes the sets.

   THE TEMPLATE, read off the canon:
     body   five rungs by brightness - deep shade, lower, middle, upper, light
            (his own: #d55617 #ed861f #f5a42f #fac047 #fed662) - so every
            colour keeps the same lit top and deep base, and the same rim light
     rings  three rings, deep inside to light outside (his own: red, orange,
            yellow) - so every colour keeps three DIFFERENT rings
   Each bead is mapped by its brightness RELATIVE to its own ring, so its
   shading and its two white highlights survive in any colour. */

var PALETTES = [
  {id: 'red',    he: 'אדום',   body: ['#5e0a12', '#9e1424', '#d6303a', '#f0716a', '#ffd3c8'], rings: ['#9c0619', '#dc2a3a', '#ff8a7e']},
  {id: 'blue',   he: 'כחול',   body: ['#0b1d4f', '#1d3f94', '#3a72d8', '#80b1f2', '#ddebff'], rings: ['#16309e', '#2f7be0', '#86c8ff']},
  {id: 'green',  he: 'ירוק',   body: ['#123d22', '#256f3c', '#459f58', '#91cc85', '#e4f4d4'], rings: ['#0e5f36', '#3a9a4a', '#a8c94e']},
  {id: 'purple', he: 'סגול',   body: ['#2a0f4d', '#532596', '#8853d0', '#bf9aee', '#f1e4ff'], rings: ['#561a9a', '#9a50dc', '#d8a9ff']},
  {id: 'pink',   he: 'ורוד',   body: ['#6b1440', '#b33874', '#e86ea5', '#f6aac9', '#ffe7f1'], rings: ['#b81f64', '#ef5f9b', '#ffb6d2']},
  {id: 'teal',   he: 'טורקיז', body: ['#073f40', '#0f7a77', '#25b0a6', '#82dacd', '#ddfaf4'], rings: ['#007373', '#1fb2a5', '#93e6d7']},
  {id: 'gold',   he: 'זהב',    body: ['#5a3a06', '#9e6a12', '#d6a22d', '#f1cf6c', '#fff4d0'], rings: ['#a8700f', '#e0aa2a', '#fbe07c']},
  {id: 'gray',   he: 'אפור',   body: ['#2f3034', '#57595e', '#8b8d92', '#c3c5c9', '#f3f4f6'], rings: ['#4b4d52', '#8d9096', '#d1d4d8']},
  {id: 'black',  he: 'שחור',   body: ['#0c0c0e', '#1d1e22', '#36383e', '#696c74', '#c8cbd1'], rings: ['#16171a', '#3b3d43', '#80848c']},
  {id: 'white',  he: 'לבן',    body: ['#9a948e', '#cbc6c0', '#e9e6e2', '#f7f5f2', '#ffffff'], rings: ['#bdb6ae', '#e2ddd7', '#fbfaf8']}
];

function hex(c){ return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function mixW(c, t){ return c.map(function(v){ return Math.round(v + (255 - v)*t); }); }
function mixK(c, t){ return c.map(function(v){ return Math.round(v*(1 - t)); }); }
function lumOf(spr){
  var d = spr.getContext ? spr.getContext('2d').getImageData(0, 0, spr.width, spr.height).data : null, a = [];
  for (var i = 0; d && i < d.length; i += 4) if (d[i+3] > 200) a.push(.299*d[i] + .587*d[i+1] + .114*d[i+2]);
  a.sort(function(x, y){ return x - y; }); return a.length ? a[a.length >> 1] : 128;
}
function buildPalette(P){
  /* the body: his own brightness 60..240 across the five rungs, rim light
     above. Measured on the canon: his DEEPEST body pixel (luminance ~118)
     is still a saturated colour, not a shadow - so it lands on the second
     rung, not the first. The first version put it on the first, and every
     colour came out as a dark marble. */
  var b = P.body.map(hex);
  var body = rampOf(EB, 60, 180, [[0].concat(b[0]), [.3].concat(b[1]), [.62].concat(b[2]),
    [.84].concat(b[3]), [.95].concat(b[4]), [1].concat(mixW(b[4], .5))]);
  /* each ring: its own median brightness is the ring colour; darker pixels go
     to its shade, brighter ones to its light and then to the white highlight */
  var beads = BEADS.map(function(ring, i){
    var base = lumOf(ring[0].spr), c = hex(P.rings[i]), span = Math.min(255, base*1.9);
    var u = base/span;
    return ring.map(function(bd){
      return rampOf(bd.spr, 0, span, [[0].concat(mixK(c, .7)), [u*.6].concat(mixK(c, .3)), [u].concat(c),
        [u + (1 - u)*.45].concat(mixW(c, .45)), [1, 255, 255, 255]]);
    });
  });
  return {body: body, beads: beads};
}
/* ═══ ROUND 2 OF THE COLOURS: keep his LIGHT, change only his hue ═══
   Asaf: everything but the gold and the original was too strong and too dark.
   Why: the palettes above matched his colours number for number (the same
   HSL saturation and lightness), but the eye does not read numbers - at the
   same HSL lightness a blue or a purple is far DARKER to the eye than an
   orange, and at the same saturation far more intense. Gold worked because
   its hue sits next to his own.
   So every pixel is moved in OKLab, a space built on how the eye sees
   brightness: its perceived lightness L is kept EXACTLY as the canon has it,
   only the hue turns, and the colourfulness is scaled down per colour. His
   warm spread (red ring, orange, yellow) becomes a smaller spread around the
   new hue, so the three rings stay three. Gray, black and white keep L too:
   gray is his light without colour, black lowers L, white raises it. */
function srgb2lin(c){ c /= 255; return c <= .04045 ? c/12.92 : Math.pow((c + .055)/1.055, 2.4); }
function lin2srgb(c){ c = c <= .0031308 ? 12.92*c : 1.055*Math.pow(c, 1/2.4) - .055; return Math.max(0, Math.min(255, Math.round(c*255))); }
function toOK(r, g, b){
  r = srgb2lin(r); g = srgb2lin(g); b = srgb2lin(b);
  var l = Math.cbrt(.4122214708*r + .5363325363*g + .0514459929*b),
      m = Math.cbrt(.2119034982*r + .6806995451*g + .1073969566*b),
      s = Math.cbrt(.0883024619*r + .2817188376*g + .6299787005*b);
  return [.2104542553*l + .7936177850*m - .0040720468*s, 1.9779984951*l - 2.4285922050*m + .4505937099*s,
          .0259040371*l + .7827717662*m - .8086757660*s];
}
function fromOK(L, A, B){
  var l = Math.pow(L + .3963377774*A + .2158037573*B, 3), m = Math.pow(L - .1055613458*A - .0638541728*B, 3),
      s = Math.pow(L - .0894841775*A - 1.2914855480*B, 3);
  return [4.0767416621*l - 3.3077115913*m + .2309699292*s, -1.2684380046*l + 2.6097574011*m - .3413193965*s,
          -.0041960863*l - .7034186147*m + 1.7076147010*s];
}
function inGamut(c){ return c[0] >= -1e-4 && c[0] <= 1.0001 && c[1] >= -1e-4 && c[1] <= 1.0001 && c[2] >= -1e-4 && c[2] <= 1.0001; }
/* OK: {hue, chroma (scale), spread (how much of his warm spread survives), Lf (L transform, optional)} */
function okOf(src, O){
  var c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  var x = c.getContext('2d'); x.drawImage(src, 0, 0);
  var im = x.getImageData(0, 0, c.width, c.height), d = im.data, H0 = 58;   // his body's own hue, measured
  for (var i = 0; i < d.length; i += 4){
    if (!d[i+3]) continue;
    var ok = toOK(d[i], d[i+1], d[i+2]), L = ok[0], C = Math.hypot(ok[1], ok[2]), h = Math.atan2(ok[2], ok[1])*180/Math.PI;
    if (O.Lf) L = O.Lf(L);
    var C2 = C*O.chroma, h2 = (O.hue + (h - H0)*O.spread)*Math.PI/180, rgb;
    /* bring an out-of-gamut colour in by lowering its colourfulness, never its light */
    for (var k = 0; k < 12; k++){ rgb = fromOK(L, C2*Math.cos(h2), C2*Math.sin(h2)); if (inGamut(rgb)) break; C2 *= .85; }
    d[i] = lin2srgb(rgb[0]); d[i+1] = lin2srgb(rgb[1]); d[i+2] = lin2srgb(rgb[2]);
  }
  x.putImageData(im, 0, 0); return c;
}
var OK_SET = {
  red:    {hue: 22,  chroma: .78, spread: .62},
  blue:   {hue: 252, chroma: .5,  spread: .62},
  green:  {hue: 145, chroma: .5,  spread: .62},
  purple: {hue: 305, chroma: .52, spread: .62},
  pink:   {hue: 352, chroma: .58, spread: .62},
  teal:   {hue: 192, chroma: .5,  spread: .62},
  gray:   {hue: 58,  chroma: .06, spread: 0},
  black:  {hue: 58,  chroma: .05, spread: 0, Lf: function(L){ return .14 + L*.42; }},
  white:  {hue: 58,  chroma: .05, spread: 0, Lf: function(L){ return .78 + L*.22; }}
};
var COLORS_READY = new Promise(function(res){
  BEEM_READY.then(function(){
    (function wait(){
      if (!BEADS) return setTimeout(wait, 60);
      PALETTES.forEach(function(P){
        var O = OK_SET[P.id];
        TINTS[P.id] = O ? {body: okOf(EB, O), beads: BEADS.map(function(ring){ return ring.map(function(b){ return okOf(b.spr, O); }); })}
                        : buildPalette(P);                    // gold stays as approved
      });
      res();
    })();
  });
});
