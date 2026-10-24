/* "+ add set" in the program editor was a cream slab - paint. Raised, in the material. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const a = `html body.mod-fitness .tpl-addex,html body.mod-fitness .tpl-save,html body.mod-fitness .fm-b,`;
if (s.split(a).length !== 2) { console.log('anchor'); process.exit(1); }
s = s.replace(a, `html body.mod-fitness .tb-add,` + a);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
