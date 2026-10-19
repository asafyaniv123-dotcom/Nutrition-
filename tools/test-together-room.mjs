/* The /together room end to end, against the worker itself with an in-memory
 * KV - two phones opening, joining, logging and finishing - and the things a
 * phone must not be able to do: write as someone else, join a room that does
 * not exist, crowd a full one.
 *
 *   node tools/test-together-room.mjs
 */
import worker from '../push-server/src/worker.js';

const store = new Map();
const SUBS = {
  get: async (k) => (store.has(k) ? store.get(k) : null),
  put: async (k, v) => { store.set(k, v); },
  list: async () => { throw new Error('list() must not be used by /together'); },
};
const env = { SUBS };
const call = async (path, body, ip = '1.2.3.4') => {
  const r = await worker.fetch(new Request('https://w.test' + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip }, body: JSON.stringify(body) }), env, {});
  return { s: r.status, j: await r.json() };
};
const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

const plan = { name: 'רגליים', exercises: [{ name: 'סקוואט', sets: 3, reps: '8' }, { name: 'לאנג׳', sets: 3, reps: '10' }] };
const a = await call('/together/open', { name: 'אסף', plan });
ok(a.s === 200 && /^[A-Z2-9]{6}$/.test(a.j.code) && a.j.token, 'A opens a room and gets a code and a token');
const b = await call('/together/join', { code: a.j.code.toLowerCase(), name: 'דנה' });
ok(b.s === 200 && b.j.plan.exercises.length === 2 && b.j.plan.exercises[0].name === 'סקוואט', 'B joins - code typed in lower case - and gets the same exercises');
ok(b.j.members.length === 2 && b.j.members.filter((m) => m.me).length === 1 && b.j.members.find((m) => m.me).name === 'דנה', 'B sees both people and knows which one is B');
ok(!JSON.stringify(b.j).includes(a.j.token), 'A\'s token is never handed to B');

await call('/together/sync', { code: a.j.code, token: a.j.token, me: { name: 'אסף', ex: [{ n: 'סקוואט', s: [[80, 8], [80, 8]] }], cur: 0 } });
const bs = await call('/together/sync', { code: a.j.code, token: b.j.token, me: { name: 'דנה', ex: [{ n: 'סקוואט', s: [[40, 10]] }], cur: 0 } });
const seenByB = bs.j.members.find((m) => m.name === 'אסף');
ok(seenByB && seenByB.ex[0].s.length === 2 && seenByB.ex[0].s[0][0] === 80, 'B reads A\'s sets');
const read = await call('/together/sync', { code: a.j.code, token: a.j.token });
ok(read.s === 200 && read.j.members.find((m) => m.name === 'דנה').ex[0].s[0][0] === 40, 'a read without "me" changes nothing and shows the other');

const forged = await call('/together/sync', { code: a.j.code, token: 'notarealtoken123', me: { name: 'אסף', ex: [] } });
ok(forged.s === 403, 'a phone without a token from this room cannot write');
const after = await call('/together/sync', { code: a.j.code, token: b.j.token });
ok(after.j.members.find((m) => m.name === 'אסף').ex[0].s.length === 2, 'and A\'s record is untouched by it');

ok((await call('/together/join', { code: 'ZZZZZZ', name: 'x' })).s === 404, 'a room that does not exist cannot be joined');
for (let i = 0; i < 4; i++) await call('/together/join', { code: a.j.code, name: 'p' + i });
ok((await call('/together/join', { code: a.j.code, name: 'seventh' })).s === 409, 'a seventh person is turned away');

await call('/together/sync', { code: a.j.code, token: a.j.token, me: { name: 'אסף', ex: [], done: true, mins: 52 } });
const fin = await call('/together/sync', { code: a.j.code, token: b.j.token });
ok(fin.j.members.find((m) => m.name === 'אסף').done === true, 'B sees that A has finished');
ok((await call('/together/open', { name: 'x', plan: { exercises: [] } })).s === 400, 'a room cannot be opened with no exercises');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('two phones can train together, and neither can write as the other');
