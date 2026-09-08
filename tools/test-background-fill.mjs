/* Run the shipped erBgMask against pictures whose right answer is known.
   The function is lifted out of dev/index.html rather than retyped, so the
   thing under test is the thing that ships. */
import fs from 'fs';
import vm from 'vm';

const src = fs.readFileSync('dev/index.html', 'utf8');
const start = src.indexOf('var BG_TOL=');
const end = src.indexOf('function erAuto()');
if (start < 0 || end < 0 || end <= start) throw new Error('could not lift erBgMask');
const code = src.slice(start, end);
const ctx = { };
vm.createContext(ctx);
vm.runInContext(code + '\n;({BG_TOL:BG_TOL,erBgMask:erBgMask})', ctx);
const { erBgMask } = vm.runInContext('({BG_TOL:BG_TOL,erBgMask:erBgMask})', ctx);

const W = 120, H = 160;
function make(bg, garment, opts) {
  opts = opts || {};
  const d = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    let c = bg;
    /* a gentle vignette, the way a bedsheet actually photographs */
    if (opts.shade) {
      const f = 1 - 0.10 * (Math.abs(x - W / 2) / (W / 2) + Math.abs(y - H / 2) / (H / 2));
      c = [bg[0] * f, bg[1] * f, bg[2] * f];
    }
    const inG = x > 30 && x < 90 && y > 30 && y < 130;
    if (inG) c = garment;
    d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
    d[i + 3] = opts.clearBorder ? 0 : 255;
  }
  if (opts.clearBorder) {
    /* everything already transparent, as after a lasso */
    for (let i = 3; i < d.length; i += 4) d[i] = 0;
  }
  return d;
}
function count(mask) { let n = 0; for (let i = 0; i < mask.length; i++) if (mask[i]) n++; return n; }
function garmentEaten(mask) {
  let bad = 0;
  for (let y = 35; y < 125; y++) for (let x = 35; x < 85; x++) if (mask[y * W + x]) bad++;
  return bad;
}
const BG_PX = W * H - 60 * 100;

const cases = [
  ['plain cream bed, brown trousers', [239, 233, 223], [122, 82, 48], {}],
  ['shaded bedsheet',                 [239, 233, 223], [122, 82, 48], { shade: true }],
  ['white floor, black shoe',         [250, 250, 250], [26, 24, 22],  {}],
  ['grey floor, cream shirt',         [140, 140, 138], [236, 230, 220], {}],
];
let fails = 0;
for (const [name, bg, gm, opts] of cases) {
  const mask = erBgMask(make(bg, gm, opts), W, H);
  if (!mask) { console.log('FAIL  ' + name + ': returned null'); fails++; continue; }
  const got = count(mask), eaten = garmentEaten(mask);
  const okBg = got > BG_PX * 0.95, okG = eaten === 0;
  console.log((okBg && okG ? 'ok    ' : 'FAIL  ') + name.padEnd(32) +
              ' background ' + Math.round(got / BG_PX * 100) + '% of ' + BG_PX +
              ', garment pixels eaten: ' + eaten);
  if (!(okBg && okG)) fails++;
}

/* the two shapes that must NOT return a mask or must not creep */
const already = erBgMask(make([239, 233, 223], [122, 82, 48], { clearBorder: true }), W, H);
console.log((already === null ? 'ok    ' : 'FAIL  ') + 'already lassoed -> null (nothing to find)');
if (already !== null) fails++;

/* a garment the same colour as the floor is the case this cannot do, and it
   must fail by eating the garment rather than by pretending - the toast in
   erAuto is what covers it */
const same = erBgMask(make([239, 233, 223], [235, 230, 221], {}), W, H);
console.log('note  garment nearly the floor colour -> ' +
            (same ? Math.round(count(same) / (W * H) * 100) + '% of the frame taken' : 'null'));

console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
process.exit(fails ? 1 : 0);
