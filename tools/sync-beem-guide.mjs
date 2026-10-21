/* push-server/beem-guide.md is the source; the worker carries it inline
 * (a Worker has no files). Run this after editing the guide, then deploy. */
import fs from 'fs';
const F = 'push-server/src/worker.js';
let s = fs.readFileSync(F, 'utf8');
const g = fs.readFileSync('push-server/beem-guide.md', 'utf8').replace(/\r\n/g, '\n').trim();
if (/`|\$\{/.test(g)) { console.log('guide has a backtick or ${'); process.exit(1); }
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const a = s.indexOf('const BEEM_GUIDE = `'), b = s.indexOf('`;', a + 20);
if (a < 0 || b < 0) { console.log('no BEEM_GUIDE'); process.exit(1); }
s = s.slice(0, a) + 'const BEEM_GUIDE = `' + g.replace(/\n/g, EOL) + s.slice(b);
fs.writeFileSync(F, s);
console.log('guide synced', g.length, 'chars');
