/* Runs the worker's real request path with a fake KV and a fake upstream, and
 * asserts the meter: a model call is counted with its tokens and install id,
 * a credit failure is named, a non-model host is not counted, and a route
 * that never calls a model writes nothing.
 *
 *   node tools/test-meter.mjs [path-to-worker.js]
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pathToFileURL } from 'url';

const src = process.argv[2] || 'push-server/src/worker.js';
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'meter-')), 'w.mjs');
fs.copyFileSync(src, tmp);

const store = new Map();
const KV = { get: async (k) => store.get(k) ?? null, put: async (k, v) => { store.set(k, v); }, list: async () => ({ keys: [] }), delete: async (k) => store.delete(k) };
let mode = 'ok';
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, init) => {
  const s = String(typeof u === 'string' ? u : u.url);
  if (s.startsWith('https://api.anthropic.com/')) {
    if (mode === 'credit') return new Response(JSON.stringify({ type: 'error', error: { message: 'Your credit balance is too low to access the Anthropic API.' } }), { status: 400, headers: { 'content-type': 'application/json' } });
    return new Response(JSON.stringify({ content: [{ type: 'text', text: '{"items":[]}' }], stop_reason: 'end_turn', usage: { input_tokens: 1200, output_tokens: 80 } }), { headers: { 'content-type': 'application/json' } });
  }
  if (s.startsWith('https://generativelanguage.googleapis.com/')) return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{}' }] } }], usageMetadata: { promptTokenCount: 500, candidatesTokenCount: 40, thoughtsTokenCount: 10 } }), { headers: { 'content-type': 'application/json' } });
  return new Response('{}', { headers: { 'content-type': 'application/json' } });
};
const W = (await import(pathToFileURL(tmp).href)).default;
const env = { SUBS: KV, AI_KEY: 'x', ADMIN_KEY: 'k' };
const call = async (p, body) => {
  const waits = [];
  const ctx = { waitUntil: (p) => waits.push(p) };
  const r = await W.fetch(new Request('https://w.test' + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), env, ctx);
  await Promise.all(waits);
  return r;
};
const uid = 'abcdefabcdefabcdefabcdef';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const day = new Date().toISOString().slice(0, 10);

await call('/parse?u=' + uid, { text: 'two eggs and toast', lang: 'en' });
let rec = JSON.parse(store.get('mt:' + day + ':/parse') || 'null');
ok(rec && rec.t.n >= 1, 'parse counted: ' + JSON.stringify(rec && rec.t));
ok(rec && rec.u[uid] && rec.u[uid].i > 0, 'tokens kept per install');

mode = 'credit';
await call('/parse?u=' + uid, { text: 'an apple', lang: 'en' });
rec = JSON.parse(store.get('mt:' + day + ':/parse') || '{"e":{}}');
ok(rec.e.credit >= 1 && rec.lastCredit, 'credit failure named: ' + JSON.stringify(rec.e));

const before = store.size;
await call('/ping', { uid, day, first: day });
ok(![...store.keys()].some((k) => k.startsWith('mt:') && k.endsWith(':other')), 'a route with no model call writes no meter');

const r = await W.fetch(new Request('https://w.test/admin/cost?days=2', { headers: { Authorization: 'Bearer k' } }), env, { waitUntil() {} });
const j = await r.json();
ok(j.ok && j.days.length === 1 && j.days[0].routes['/parse'], '/admin/cost reads it back');
const r2 = await W.fetch(new Request('https://w.test/admin/cost'), env, { waitUntil() {} });
ok(r2.status === 401, '/admin/cost needs the key');
globalThis.fetch = realFetch;
process.exit(fails ? 1 : 0);
