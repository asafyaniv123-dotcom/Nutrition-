/* The rest of the centring Asaf asked for (23 Oct), found by going through
 * every step's photo: the three points of "why" had their icon at the edge
 * and their words centred in what was left - now the icon sits above its
 * words, all on the centre line; the morning/evening chips sat at the right
 * edge over a centred wheel; the moment box typed from the edge. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`.dr-pts{display:flex;flex-direction:column;gap:14px;margin:20px 0 24px}
.dr-pt{display:flex;align-items:center;gap:14px;font-size:18px;font-weight:700}`,
`.dr-pts{display:flex;justify-content:center;gap:10px;margin:20px 0 24px}
.dr-pt{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:9px;font-size:16.5px;font-weight:800;text-align:center}`);
rep(`.dr-quick{display:flex;gap:10px;margin:0 0 18px}`, `.dr-quick{display:flex;justify-content:center;gap:10px;margin:0 0 18px}`);
rep(`.dr-area{font-size:17px;font-weight:600;line-height:1.5;resize:none}`, `.dr-area{font-size:17px;font-weight:600;line-height:1.5;resize:none;text-align:center}`);
fs.writeFileSync(F, s); console.log('patched');
/* the icon circles, squeezed to ovals once the row became a column */
{ let t = fs.readFileSync(F, 'utf8');
  const a = `.dr-pic svg{`; if (t.split(a).length !== 2) { console.log('anchor2'); process.exit(1); }
  t = t.replace(a, `.dr-pt .dr-pic{flex:none;width:46px}` + EOL + a); fs.writeFileSync(F, t); console.log('patched circles'); }
