/* the language screen, photographed: Beem had no place on the new first step
 * and sat on its title and list; and the address rows kept their text at the
 * right edge under a centred question. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const a = `.dr2.at-time .dr-beem{left:calc(50% - 58px);top:30px;transform:scale(.5)}`;
if (s.split(a).length !== 2) { console.log('anchor'); process.exit(1); }
s = s.replace(a, a + EOL + `.dr2.at-lang .dr-beem{left:calc(50% - 58px);top:12px;transform:scale(.45)}` + EOL +
  `.dr-r2{text-align:center}`);
fs.writeFileSync(F, s); console.log('patched');
