/* Whose daily budget a coach turn is charged to.
 *
 *   node tools/test-coach-buckets.mjs
 */
import { coachBuckets } from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const B = { today: '2026-10-21', ip: '1.2.3.4', cap: 120, ipCap: 400, testCap: 600 };
const keys = (o) => coachBuckets(Object.assign({}, B, o)).map((x) => x.key + '/' + x.cap).join(' ');
ok(keys({ uid: 'ab'.repeat(12) }) === 'co:2026-10-21:u:' + 'ab'.repeat(12) + '/120 co:2026-10-21:n:1.2.3.4/400', 'a device: its own 120, and the network\'s 400 behind it');
ok(keys({}) === 'co:2026-10-21:1.2.3.4/120', 'an app with no id: by network, exactly as before');
ok(keys({ uid: 'not-an-id' }) === 'co:2026-10-21:1.2.3.4/120', 'a malformed id counts as none');
ok(keys({ uid: 'ab'.repeat(12), test: true }) === 'co:test:2026-10-21/600', 'a test run: its own budget, nobody else\'s');
const a = keys({ uid: 'ab'.repeat(12) }).split(' ')[0], b = keys({ uid: 'cd'.repeat(12) }).split(' ')[0];
ok(a !== b, 'two phones on one Wi-Fi do not share a budget');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('a home no longer shares one budget, and tests spend their own');
