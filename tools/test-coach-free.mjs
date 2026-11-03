/* The free tier's daily cap on coach messages (3 Nov). OFF unless the
 * server has FREE_COACH_DAILY set: with it unset nothing may change for
 * anyone. Through the real /coach handler with the model's reply faked.
 *
 *   node tools/test-coach-free.mjs [worker.js]
 */
import { pathToFileURL } from 'url';

const workerPath = process.argv[2] || new URL('../push-server/src/worker.js', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const W = await import(pathToFileURL(workerPath).href);
const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

const K = W.coachFreeKey;
if (!K) { console.log('  FAIL coachFreeKey is not exported'); process.exit(1); }
const UID = 'a'.repeat(24);
ok(K({ cap: 0, today: 'd', ip: '1', uid: UID }) === '' && K({ today: 'd', ip: '1', uid: UID }) === '', 'no cap set: no key, nothing counted');
ok(K({ cap: 20, today: 'd', ip: '1', uid: UID }) === 'fc:d:u:' + UID, 'by install id');
ok(K({ cap: 20, today: 'd', ip: '1.2.3.4', uid: 'nope' }) === 'fc:d:n:1.2.3.4', 'an app with no id: by network');
ok(K({ cap: 20, today: 'd', ip: '1', uid: UID, test: true }) === '', 'a test run is never counted');

globalThis.fetch = async (url) => String(url).includes('api.anthropic.com')
  ? new Response(JSON.stringify({ content: [{ type: 'tool_use', id: 't', name: 'reply', input: { photo_count: '', action: 'none', date: '2026-11-03', items: [], message: 'בסדר' } }] }), { status: 200 })
  : new Response('', { status: 404 });
async function run(env, n, uid) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const req = new Request('https://w/coach', { method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '9.9.9.9' },
      body: JSON.stringify({ day: '2026-11-03', lang: 'he', message: 'שאלה ' + i, uid }) });
    const r = await W.default.fetch(req, env, { waitUntil: () => {} });
    out.push([r.status, (await r.json()).error || 'ok']);
  }
  return out;
}
const kvEnv = (extra) => { const kv = new Map(); return Object.assign({ AI_KEY: 'x', SUBS: { get: async (k) => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); } } }, extra); };

let r = await run(kvEnv({}), 6, UID);
ok(r.every((x) => x[0] === 200), 'cap unset: six messages, all answered');
r = await run(kvEnv({ FREE_COACH_DAILY: '' }), 3, UID);
ok(r.every((x) => x[0] === 200), 'cap set to empty: still off');
r = await run(kvEnv({ FREE_COACH_DAILY: '3' }), 5, UID);
ok(JSON.stringify(r) === JSON.stringify([[200, 'ok'], [200, 'ok'], [200, 'ok'], [429, 'free limit'], [429, 'free limit']]), 'cap 3: three answered, then "free limit" - ' + JSON.stringify(r));
const env2 = kvEnv({ FREE_COACH_DAILY: '1' });
await run(env2, 1, UID);
r = await run(env2, 1, 'b'.repeat(24));
ok(r[0][0] === 200, 'another install has its own count');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('the free cap is off until it is set, and says which limit it was when it is');
