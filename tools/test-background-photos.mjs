/* The cut-out against pictures that look like the ones it is actually given.
 *
 * test-background-fill.mjs checks the mask on clean pictures - one even floor
 * and a gentle vignette - and passed while our first user gave up on the
 * automatic cut and lassoed every garment by hand. Her backgrounds: a white
 * sheet, CRUMPLED, its folds shading from white down to mid grey; and in two
 * of three photographs a brown-striped blanket in a corner. This draws those,
 * with the noise a phone adds, around the garments from her own screenshots,
 * and measures two things per picture: how much of the background came off,
 * and how much of the garment was taken with it.
 *
 *   node tools/test-background-photos.mjs                 # the shipped function
 *   node tools/test-background-photos.mjs <file.html>     # any revision of it
 */
import fs from 'fs';
import vm from 'vm';
const FILE = process.argv[2] || 'dev/index.html';
const src = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');
const start = src.indexOf('var BG_TOL=');
const end = src.indexOf('function bgCut(');
if (start < 0 || end < 0 || end <= start) throw new Error('could not lift erBgMask from ' + FILE);
const ctx = {};
vm.createContext(ctx);
vm.runInContext(src.slice(start, end), ctx);
const erBgMask = vm.runInContext('erBgMask', ctx);

const W = 300, H = 400;
// a fixed generator, so every run draws the same pictures
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function sheet(seed, stripes) {
  const R = rng(seed), img = new Float32Array(W * H * 3);
  const folds = [];
  for (let k = 0; k < 9; k++) {
    const a = R() * Math.PI, px = R() * W, py = R() * H;
    folds.push({ nx: -Math.sin(a), ny: Math.cos(a), c: -(-Math.sin(a) * px + Math.cos(a) * py),
                 depth: 45 + R() * 75, width: 4 + R() * 16, sharp: R() < 0.35 });
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let dark = 0;
    for (const f of folds) {
      const d = f.nx * x + f.ny * y + f.c;
      // a fold is a valley of shade with a lit ridge beside it; some are creases
      dark += f.depth * Math.exp(-((d / f.width) ** 2)) * (f.sharp && Math.abs(d) < 1.2 ? 1.25 : 1);
      dark -= 7 * Math.exp(-(((d - f.width * 1.6) / f.width) ** 2));
    }
    let r = 243 - dark, g = 241 - dark, b = 237 - dark * 0.96;
    if (stripes && x < 130 && y > 240) {
      const band = Math.floor((x + y) / 11) % 2;
      if (band) { r = 132 - dark * 0.4; g = 82 - dark * 0.3; b = 60 - dark * 0.25; }
    }
    const i = (y * W + x) * 3;
    img[i] = r; img[i + 1] = g; img[i + 2] = b;
  }
  return img;
}
// a garment is a shape, a colour, a texture, and a slightly soft edge
function wear(img, inside, col, tex, seed) {
  const R = rng(seed), truth = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let cov = 0;
    for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) if (inside(x + sx * 0.5, y + sy * 0.5)) cov++;
    cov /= 4;
    if (!cov) continue;
    if (cov === 1) truth[y * W + x] = 1;
    const t = tex(x, y), i = (y * W + x) * 3;
    for (let c = 0; c < 3; c++) img[i + c] = img[i + c] * (1 - cov) + (col[c] + t + (R() - 0.5) * 10) * cov;
  }
  return truth;
}
function toRGBA(img, seed) {
  const R = rng(seed), d = new Uint8ClampedArray(W * H * 4);
  for (let p = 0; p < W * H; p++) {
    for (let c = 0; c < 3; c++) d[p * 4 + c] = img[p * 3 + c] + (R() - 0.5) * 12;   // sensor noise
    d[p * 4 + 3] = 255;
  }
  return d;
}

const tee = (x, y) => (Math.abs(x - 150) < 95 && y > 70 && y < 130) || (Math.abs(x - 150) < 62 && y >= 130 && y < 320);
const shoe = (x, y) => ((x - 150) / 70) ** 2 + ((y - 210) / 110) ** 2 < 1;
const jeans = (x, y) => (y > 50 && y < 140 && Math.abs(x - 150) < 70) || (y >= 140 && y < 370 && Math.abs(x - 150) < 70 && Math.abs(x - 150) > 8);
const hood = (x, y) => (((x - 150) / 45) ** 2 + ((y - 85) / 40) ** 2 < 1) || (Math.abs(x - 150) < 100 && y > 115 && y < 330);
const tank = (x, y) => (Math.abs(x - 150) < 70 && y > 110 && y < 340) || (Math.abs(x - 150) < 70 && Math.abs(x - 150) > 38 && y > 50 && y <= 110);

const CASES = [
  ['crumpled sheet, black ribbed tee', 11, false, tee, [28, 28, 32], (x) => (x % 4 < 2 ? 6 : -6)],
  ['crumpled sheet, grey suede shoe', 23, false, shoe, [152, 150, 146], () => 0],
  ['crumpled sheet, light jeans', 37, false, jeans, [150, 168, 190], (x, y) => ((x + y) % 5 < 2 ? 8 : -4)],
  ['crumpled + striped, red hoodie', 41, true, hood, [205, 70, 55], () => 0],
  ['crumpled + striped, navy tank', 53, true, tank, [34, 40, 72], (x) => (x % 3 ? 4 : -4)],
];

let fails = 0;
console.log('erBgMask from ' + FILE + '\n');
for (const [name, seed, stripes, inside, col, tex] of CASES) {
  const img = sheet(seed, stripes);
  const truth = wear(img, inside, col, tex, seed + 1);
  const d = toRGBA(img, seed + 2);
  const mask = erBgMask(d, W, H);
  /* the garment's outermost pixel is taken ON PURPOSE - the mask grows one
     pixel to lift the compressor's rim - so eaten counts only what is inside it */
  const core = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const p = y * W + x;
    core[p] = truth[p] && truth[p - 1] && truth[p + 1] && truth[p - W] && truth[p + W] ? 1 : 0; }
  let bg = 0, bgOff = 0, gm = 0, gmEaten = 0;
  for (let p = 0; p < W * H; p++) {
    if (truth[p]) { if (core[p]) { gm++; if (mask && mask[p]) gmEaten++; } }
    else { bg++; if (mask && mask[p]) bgOff++; }
  }
  const off = bgOff / bg, eaten = gmEaten / gm;
  /* the bar: most of the floor gone, almost none of the garment. 85% and not
     more because a grey shoe on a white sheet IS the colour of its shadows,
     and the honest answer there leaves a thin ring of fold for the brush. */
  const ok = off >= 0.85 && eaten <= 0.01;
  if (!ok) fails++;
  console.log((ok ? 'ok    ' : 'FAIL  ') + name.padEnd(34) +
    'background off ' + (off * 100).toFixed(1).padStart(5) + '%   garment eaten ' + (eaten * 100).toFixed(2).padStart(5) + '%');
}
console.log(fails ? '\n' + fails + ' of ' + CASES.length + ' below the bar (85% of the floor off, at most 1% of the garment)' : '\nall at the bar');
process.exit(fails ? 1 : 0);
