/* The planner sometimes still asked how long it takes to get to work, and when
 * it did not ask it quietly assumed half an hour each way. The person chose a
 * plan without questions: anchors are taken exactly as they stand in their
 * schedule - nothing asked about them, no travel added around them. */
import fs from 'fs';
const F = 'push-server/src/worker.js';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const a = s.indexOf(`   none. Take them as true and frozen.`), b = s.indexOf(`        'STAGE 3 - WHAT ELSE GOES IN is collected`);
if (a < 0 || b < 0) { console.log('anchors'); process.exit(1); }
s = s.slice(0, a) +
`   none. Take them as true and frozen, exactly as they stand in their schedule: ask nothing\\n' +
        '   about them and add no travel around them - the person chose a plan without questions.\\n' +
        '\\n' +
` + s.slice(b);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
