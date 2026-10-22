/* the goal rows, photographed: a chosen one was only a little more pressed
 * than its neighbours. Pressed AND marked - a check in the area's colour. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const a = `html body.mod-fitness .fq-o .fq-os{font-size:12.5px;font-weight:600;color:var(--nu-muted);line-height:1.4}`;
if (s.split(a).length !== 2) { console.log('anchor'); process.exit(1); }
s = s.replace(a, a + EOL + `html body.mod-fitness .fq-opts .fg-b.fq-o{position:relative;padding-inline-end:48px}
html body.mod-fitness .fq-opts .fg-b.fq-o.on{box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit)}
html body.mod-fitness .fq-opts .fg-b.fq-o.on::after{content:"";position:absolute;inset-inline-end:16px;top:50%;width:22px;height:22px;margin-top:-11px;border-radius:50%;
  background:var(--terra-500) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 12.5 4 4 8-9'/%3E%3C/svg%3E") center/14px no-repeat}`.replace(/\n/g, EOL));
fs.writeFileSync(F, s); console.log('patched');
