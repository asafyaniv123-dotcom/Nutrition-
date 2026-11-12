// node eq-icons.mjs <dev/index.html> [--sheet out.html] - the equipment icons, duotone: dark outline + soft amber body (class f),
// a rope's amber underlay (class r). Replaces the EQ_ICONS object in place; --sheet writes a standalone preview instead.
import fs from 'node:fs';
const n = (v) => +v.toFixed(2);
const rr = (x, y, w, h, r) => `M${n(x + r)} ${n(y)}H${n(x + w - r)}A${r} ${r} 0 0 1 ${n(x + w)} ${n(y + r)}V${n(y + h - r)}A${r} ${r} 0 0 1 ${n(x + w - r)} ${n(y + h)}H${n(x + r)}A${r} ${r} 0 0 1 ${n(x)} ${n(y + h - r)}V${n(y + r)}A${r} ${r} 0 0 1 ${n(x + r)} ${n(y)}Z`;
const R = (x, y, w, h, r, cls = 'f', extra = '') => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"${extra}/>`;
const P = (d, cls) => `<path${cls ? ` class="${cls}"` : ''} d="${d}"/>`;
const C = (cx, cy, r, cls) => `<circle${cls ? ` class="${cls}"` : ''} cx="${cx}" cy="${cy}" r="${r}"/>`;
const hex = (cx, cy, w, h) => { const a = w / 4; return `M${n(cx - w / 2 + a)} ${n(cy - h / 2)}H${n(cx + w / 2 - a)}L${n(cx + w / 2)} ${n(cy)}L${n(cx + w / 2 - a)} ${n(cy + h / 2)}H${n(cx - w / 2 + a)}L${n(cx - w / 2)} ${n(cy)}Z`; };
const dumbbell = (x0, x1, cy, hw, hh) =>
  P(`M${n(x0 + hw)} ${cy}H${n(x1 - hw)}`) + P(hex(x0 + hw / 2, cy, hw, hh), 'f') + P(hex(x1 - hw / 2, cy, hw, hh), 'f');
const wave = (x0, y, amp, seg, k) => { let d = `M${x0} ${y}`; for (let i = 0; i < k; i++) d += ` q${seg / 2} ${i % 2 ? amp : -amp} ${seg} 0`; return d; };
const bench = P('M3.6 20H20.4') + P('M5.6 14.6V20') + P('M10.8 14.6V20') + P('M17.2 10.8V20') +
  R(3.4, 12.2, 8.6, 2.6, 1.2) + R(10.6, 8.5, 9.2, 2.6, 1.2, 'f', ' transform="rotate(-36 15.2 9.8)"');

const I = {
  'מוט': P('M2 12h2.2') + P('M9.2 12h5.6') + P('M19.8 12H22') +
    R(4.2, 6.6, 2.8, 10.8, 1.2) + R(7.2, 8.6, 2, 6.8, .9) + R(14.8, 8.6, 2, 6.8, .9) + R(17, 6.6, 2.8, 10.8, 1.2),
  'משקולות יד': dumbbell(2.6, 16.6, 8.2, 3.6, 5) + dumbbell(7.4, 21.4, 16, 3.6, 5),
  'מכונה': P('M5.2 21V4.2h13.6V21') + P('M3.4 21h17.2') + C(12, 6.6, 1.3) + P('M12 7.9v4.3') +
    R(9, 12.2, 6, 7.6, 1.1) + P('M9 14.7h6') + P('M9 17.3h6'),
  'פולי': P('M9.2 2.6h5.6') + P('M12 2.6v1.2') + C(12, 6.2, 2.4, 'f') + C(12, 6.2, .5) +
    P('M12 8.6v5') + P('M12 13.6 8.4 18.2h7.2Z') + R(7.6, 18.2, 8.8, 2.4, 1.2),
  'משקל גוף': C(12, 4.6, 2.3, 'f') +
    P('M8.6 8.3H15.4a1.7 1.7 0 0 1 1.65 1.3l1.05 4.9a.95.95 0 0 1-1.86.4L15.2 11.3V20.4a1.1 1.1 0 0 1-2.2 0V15.6h-2V20.4a1.1 1.1 0 0 1-2.2 0V11.3l-1.04 3.6a.95.95 0 0 1-1.86-.4l1.05-4.9A1.7 1.7 0 0 1 8.6 8.3Z', 'f'),
  'מתח': R(2.2, 3, 2, 4.2, .8) + R(19.8, 3, 2, 4.2, .8) + P('M4.2 5.1h15.6') + P('M9.4 5.1l1.8 4.3') + P('M14.6 5.1l-1.8 4.3') +
    C(12, 10.6, 1.7, 'f') + P('M12 12.3v4.4') + P('M12 16.7l-1.5 3.9') + P('M12 16.7l1.5 3.9'),
  'קטלבל': P('M7.8 10.6V7.8a4.2 4.2 0 0 1 8.4 0v2.8h-2.2V7.9a2 2 0 0 0-4 0v2.7Z', 'f') +
    P('M8.68 19.6A6 6 0 1 1 15.32 19.6Z', 'f'),
  'ספסל': bench,
  'ספסל משופע': bench,
  'גומייה': `<g transform="rotate(-18 12 12)">${P(rr(3, 7.2, 18, 9.6, 4.8) + rr(5.6, 9.8, 12.8, 4.4, 2.2), 'f" fill-rule="evenodd')}</g>`,
  'מזרן': R(7, 14.4, 14.4, 2.4, .9) + C(7.4, 12.4, 4.4, 'f') + C(7.4, 12.4, 1.6) + P('M3 16.8h18.4'),
  'מכשיר אירובי': P('M3.9 17.4L18.2 14.8a1.6 1.6 0 0 1 .58 3.15L4.48 20.55a1.6 1.6 0 0 1-.58-3.15Z', 'f') +
    P('M16.8 15.1L15 7') + R(12.2, 4.4, 5.8, 2.7, 1.1) + P('M15.4 9.2H10.8'),
  'סמית׳': P('M5 3.2V21') + P('M19 3.2V21') + P('M5 3.2h14') + P('M3 21h18') +
    P('M3.4 11.1h17.2') +
    R(7, 7.8, 2.2, 6.6, .9) + R(14.8, 7.8, 2.2, 6.6, .9) + P('M3.6 17h3') + P('M17.4 17h3'),
  'מוט EZ': P('M2 12h1.6') + P('M20.4 12H22') + P('M6.2 12h1.4l1.4-1.8 1.8 2.6h2.4l1.8-2.6 1.4 1.8h1.4') +
    R(3.6, 7.2, 2.6, 9.6, 1.1) + R(17.8, 7.2, 2.6, 9.6, 1.1),
  'מוט טרפז': P('M8 5h8l4.4 7-4.4 7H8L3.6 12Z M9.2 7.4h5.6l2.8 4.6-2.8 4.6H9.2L6.4 12Z', 'f" fill-rule="evenodd') +
    R(7.4, 10, 1.6, 4, .7) + R(15, 10, 1.6, 4, .7) + P('M1.6 12h2') + P('M20.4 12h2'),
  'פלטה': P('M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18Z M12 6.6a5.4 5.4 0 1 0 0 10.8a5.4 5.4 0 1 0 0-10.8Z', 'f" fill-rule="evenodd') +
    C(12, 12, 2.1) + P('M12 3.9v1.4') + P('M12 18.7v1.4'),
  'רצועות TRX': P('M8.4 2.4h7.2') + C(12, 4.3, 1.3) + P('M12 5.6 8.2 15.6') + P('M12 5.6l3.8 10') +
    R(8.6, 9.2, 1.8, 1.6, .5, 'f', ' transform="rotate(21 9.5 10)"') + R(13.6, 9.2, 1.8, 1.6, .5, 'f', ' transform="rotate(-21 14.5 10)"') +
    R(5.8, 15.8, 4.6, 2.3, 1.15) + R(13.6, 15.8, 4.6, 2.3, 1.15),
  'מדרגה': P('M4 9.6L8 6H20l-4 3.6Z', 'f') + P('M16 9.6L20 6v9.6l-4 3.6Z', 'f') + R(4, 9.6, 12, 9.6, .8) +
    R(8.2, 12.4, 3.6, 1.6, .8, ''),
  'מזחלת': P('M3.4 19.4H18c1.6 0 2.5-.8 2.9-2.2') + R(4.6, 14.6, 13.4, 2.6, 1) + P('M7.6 14.6V5.6') + P('M15 14.6V5.6') +
    P('M6.2 5.6h2.8') + P('M13.6 5.6h2.8') + R(9.4, 11.4, 4.2, 3.2, .9),
  'חבל קרב': R(2, 8.6, 2.2, 8.8, .9) +
    P(wave(4.2, 9.6, 2.6, 4.4, 4), 'r') + P(wave(4.2, 9.6, 2.6, 4.4, 4)) +
    P(wave(4.2, 15.6, 2.6, 4.4, 4), 'r') + P(wave(4.2, 15.6, 2.6, 4.4, 4)),
  'כדור כוח': C(12, 12, 8.6, 'f') + P('M4.2 9.4c3.8 2.2 11.8 2.2 15.6 0') + P('M4.2 14.6c3.8-2.2 11.8-2.2 15.6 0') +
    P('M12 3.4c-1.6 2.6-1.6 14.6 0 17.2'),
  'כדור פיזיו': C(12, 11.4, 8.2, 'f') + P('M3.9 11.6c4.4 2.4 11.8 2.4 16.2 0') + P('M7.4 6.6a6.4 6.4 0 0 1 3.6-1.7') + P('M6 21.2h12'),
};

const args = process.argv.slice(2);
if (args.includes('--sheet')) {
  const out = args[args.indexOf('--sheet') + 1];
  let h = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:18px;background:#e9e7e3;font:13px system-ui;direction:rtl}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.c{display:flex;align-items:center;gap:10px;padding:9px;border-radius:15px;background:#e9e7e3;
box-shadow:-3px -3px 8px rgba(255,255,255,.95),4px 5px 12px rgba(176,168,156,.28)}
.c.on{box-shadow:inset 2px 3px 6px rgba(176,168,156,.44),inset -2px -2px 5px rgba(255,255,255,.95)}
.e{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none;
box-shadow:inset 1px 2px 4px rgba(176,168,156,.44),inset -1px -1px 3px rgba(255,255,255,.95)}
.on .e{box-shadow:inset 1px 2px 4px rgba(176,168,156,.44),inset -1px -1px 3px rgba(255,255,255,.95),inset 0 0 12px rgba(224,138,60,.38)}
svg{width:24px;height:24px;fill:none;stroke:#3d3832;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
.f{fill:#e08a3c;fill-opacity:.22}.on .f{fill-opacity:.85}.r{stroke:#e08a3c;stroke-opacity:.38;stroke-width:3.6}.on .r{stroke-opacity:.85}
b{font-weight:700;color:#3d3832}</style><div class="g">`;
  for (const [k, v] of Object.entries(I)) h += `<div class="c"><span class="e"><svg viewBox="0 0 24 24">${v}</svg></span><b>${k}</b></div><div class="c on"><span class="e"><svg viewBox="0 0 24 24">${v}</svg></span><b>${k}</b></div>`;
  fs.writeFileSync(out, h + '</div>');
  console.log('sheet', out);
} else {
  const f = args[0];
  let s = fs.readFileSync(f, 'utf8');
  const a = s.indexOf('var EQ_ICONS={'), b = s.indexOf('\n};\n', a);
  if (a < 0 || b < 0 || s.indexOf('var EQ_ICONS={', a + 1) >= 0) throw new Error('EQ_ICONS not found once');
  const old = s.slice(a, b + 3);
  const oldKeys = [...old.matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]);
  for (const k of oldKeys) if (!I[k]) throw new Error('no new icon for ' + k);
  const body = Object.keys(I).map((k) => `  '${k}':'${I[k].replace(/'/g, "\\'")}'`).join(',   // i18n-exempt: icon lookup key\n') + '   // i18n-exempt: icon lookup key';
  s = s.slice(0, a) + `var EQ_ICONS={\n${body}\n}` + s.slice(b + 2);
  fs.writeFileSync(f, s);
  console.log('replaced', oldKeys.length, '->', Object.keys(I).length);
}
