/* The coloured seam under buttons is not the app's language (Asaf, 24 Oct:
 * "the pink under the buttons is not part of our design"). The approved
 * language is one material where colour is light, never paint
 * (soft-white-light-inside) - a 3px stripe of terracotta, violet or green
 * along the bottom edge is paint. Every such seam goes; the buttons stay
 * raised exactly as they were.
 * And the set you are on was marked by a terracotta outline - paint again.
 * It is raised out of the pressed rows instead, which needs no colour. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const before = s;
const SEAM = /,\s*inset 0 -3px 0 color-mix\(in srgb,var\(--[a-z0-9-]+(?:,#[0-9a-f]{3,6})?\) \d+%,transparent\)/g;
const n = (s.match(SEAM) || []).length;
s = s.replace(SEAM, '');
const cur = `.fx-sc.cur{color:var(--nu-muted);font-weight:700;outline:2px solid color-mix(in srgb,var(--terra-500) 55%,transparent);outline-offset:-2px}`;
if (s.split(cur).length !== 2) { console.log('cur anchor'); process.exit(1); }
s = s.replace(cur, `.fx-sc.cur{color:var(--nu-muted);font-weight:700;box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}`);
fs.writeFileSync(F, s);
console.log('seams removed:', n, ' left:', (s.match(/inset 0 -3px 0 color-mix/g) || []).length, ' bytes', before.length, '->', s.length);
