/* The placement rule "every activity away from home gets travel" still won
 * over "add no travel around anchors" in two runs of three. The rule now
 * names its exception itself. */
import fs from 'fs';
const F = 'push-server/src/worker.js';
let s = fs.readFileSync(F, 'utf8');
const a = `'- TRAVEL: every activity away from home gets a travel event there and a travel event back.\\n' +`;
if (s.split(a).length !== 2) { console.log('anchor'); process.exit(1); }
s = s.replace(a, `'- TRAVEL: every activity the person ADDED that is away from home gets a travel event there\\n' +
        '  and back, of the length they gave. The fixed anchors get NONE: they are taken exactly as\\n' +
        '  they stand in the schedule - no travel, no getting-ready block before them.\\n' +`);
fs.writeFileSync(F, s);
console.log('ok');
