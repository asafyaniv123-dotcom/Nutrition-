/* The rest of the fitness paint the audit found:
 *  - the weights row's little bar chart (.exw-sp) - its newest bar was an ink
 *    block; it is lit like a day trained;
 *  - the per-muscle bar's violet fill and the volume bars' green gradient ->
 *    the same light in a channel;
 *  - the progress figures were purple, green and terracotta paint on text;
 *    they are ink, and only the change keeps a colour, because a rise or fall
 *    is the one thing a colour says there. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`html body.mod-fitness .wh-d.on,html body.mod-fitness .wh-key .k-on{`, `html body.mod-fitness .exw-sp i.on,html body.mod-fitness .wh-d.on,html body.mod-fitness .wh-key .k-on{`);
rep(`/* figures in ink; bars as light in a pressed channel; no coloured rule */`, `/* figures in ink; bars as light in a pressed channel; no coloured rule */
html body.mod-fitness #content [style*="background:var(--violet-300)"]{background:var(--terra-500)!important;box-shadow:0 0 6px rgba(224,138,114,.5)}
html body.mod-fitness #content [style*="var(--green-200),var(--green-500)"]{
  background:linear-gradient(180deg,rgba(224,138,114,.18),rgba(224,138,114,.5))!important;box-shadow:0 0 8px rgba(224,138,114,.35)}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
