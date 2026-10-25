/* A meter on every model call (Asaf, 25 Oct: "it is important that there is a
 * counter"). The credit ran out twice - 18 Sep and 25 Oct - and both times the
 * first sign was a person's error message, with nothing to say what spent it.
 *
 * Every request is now handled by routeRequest with a per-request meter, and
 * inside it `fetch` is the metered one: a call to Anthropic or Gemini is noted
 * (model, tokens in and out, and why it failed), every other host passes
 * straight through. Shadowing the name is deliberate - it is what makes a
 * route added next month counted without anyone remembering to. The two
 * top-level helpers that call a model take the fetch they are handed.
 *
 * Written once per request, after the answer has gone, to ONE KEY PER DAY AND
 * ROUTE (mt:<UTC day>:<route>): never a list(), and a key per route keeps two
 * requests in the same second from overwriting each other's count. Kept 120
 * days. Content-free: a route, a model, numbers, and the random install id. */
import fs from 'fs';
const F = 'push-server/src/worker.js';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* 1. the handler body moves out of the object, behind the meter */
const head = '  async fetch(req, env, ctx) {\n';
const tail = "    return json({ error: 'not found' }, 404);\n  },\n\n  async scheduled(event, env, ctx) {";
const a = s.indexOf(head), b = s.indexOf(tail);
if (a < 0 || b < 0 || s.indexOf(head, a + 1) >= 0) { console.log('handler anchors'); process.exit(1); }
const body = s.slice(a + head.length, b + "    return json({ error: 'not found' }, 404);\n".length);
s = s.slice(0, a) +
`  async fetch(req, env, ctx) {
    const M = meterStart(req);
    try { return await routeRequest(req, env, ctx, M); }
    finally { if (M.calls.length) ctx.waitUntil(meterSave(env, M)); }
  },

  async scheduled(event, env, ctx) {` + s.slice(b + tail.length);
s = s.replace(/\n*$/, '\n') +
`
/* The request handler. Its first line is the meter: every model call below
   goes through it, see meterFetch. */
async function routeRequest(req, env, ctx, M) {
    const fetch = (u, init) => meterFetch(u, init, M);
` + body + '}\n';

/* 2. the two top-level helpers take the fetch they are handed */
rep('async function latinTerm(q, tag, env) {', 'async function latinTerm(q, tag, env, fetch = globalThis.fetch) {');
rep('via = await latinTerm(q, tag, env);', 'via = await latinTerm(q, tag, env, fetch);');
rep('async function labelRecheck(env, dsp, was) {', 'async function labelRecheck(env, dsp, was, fetch = globalThis.fetch) {');
rep('const rc = await labelRecheck(env, dispute, was);', 'const rc = await labelRecheck(env, dispute, was, fetch);');

/* 3. the meter itself */
rep('export default {\n', `/* ── the meter ──
   What the model calls cost, per day and route, and which install asked. */
const METER_ROUTES = ['/parse', '/match', '/cross', '/plan', '/transcribe', '/say', '/route', '/schedule',
  '/beem', '/ask', '/estimate', '/see', '/vision', '/coach', '/week', '/analyze', '/off', '/health'];
function meterStart(req) {
  const url = new URL(req.url);
  const u = url.searchParams.get('u') || '';
  return { route: METER_ROUTES.includes(url.pathname) ? url.pathname : 'other',
    uid: /^[0-9a-f]{24}$/.test(u) ? u : '', dev: url.searchParams.get('d') === '1', calls: [], wait: [] };
}
async function meterFetch(u, init, M) {
  const s = typeof u === 'string' ? u : (u && u.url) || '';
  const prov = s.startsWith('https://api.anthropic.com/') ? 'a' : s.startsWith('https://generativelanguage.googleapis.com/') ? 'g' : '';
  if (!prov) return fetch(u, init);
  let model = '';
  if (prov === 'a') { try { model = String(JSON.parse(init.body).model || ''); } catch {} }
  else { const mm = s.match(/models\\/([^:/?]+)/); model = mm ? mm[1] : ''; }
  const c = { m: model.slice(0, 40) || '?', i: 0, o: 0, e: '' };
  M.calls.push(c);
  let r;
  try { r = await fetch(u, init); } catch (err) { c.e = 'net'; throw err; }
  const type = r.headers.get('content-type') || '';
  if (r.ok) {
    /* a stream is counted as a call; its tokens are in the stream, which
       is the person's, and reading a copy of it would hold it back */
    if (/json/.test(type)) M.wait.push(r.clone().json().then((j) => {
      const a = j && j.usage, g = j && j.usageMetadata;
      if (a) { c.i = (a.input_tokens || 0) + (a.cache_creation_input_tokens || 0) + (a.cache_read_input_tokens || 0); c.o = a.output_tokens || 0; }
      if (g) { c.i = g.promptTokenCount || 0; c.o = (g.candidatesTokenCount || 0) + (g.thoughtsTokenCount || 0); }
    }).catch(() => {}));
  } else {
    c.e = 'http' + r.status;
    M.wait.push(r.clone().text().then((t) => {
      if (/credit balance/i.test(t)) c.e = 'credit';
      else if (r.status === 429 && /quota/i.test(t)) c.e = 'quota';
      else if (r.status === 529 || /overloaded/i.test(t)) c.e = 'overloaded';
    }).catch(() => {}));
  }
  return r;
}
async function meterSave(env, M) {
  await Promise.all(M.wait);
  const key = 'mt:' + new Date().toISOString().slice(0, 10) + ':' + M.route;
  let rec = {};
  try { rec = JSON.parse((await env.SUBS.get(key)) || '{}') || {}; } catch { rec = {}; }
  const add = (o, c) => { o.n = (o.n || 0) + 1; o.i = (o.i || 0) + c.i; o.o = (o.o || 0) + c.o; if (c.e) o.f = (o.f || 0) + 1; };
  rec.t = rec.t || {}; rec.m = rec.m || {}; rec.e = rec.e || {}; rec.u = rec.u || {};
  for (const c of M.calls) {
    add(rec.t, c);
    add(rec.m[c.m] = rec.m[c.m] || {}, c);
    if (c.e) rec.e[c.e] = (rec.e[c.e] || 0) + 1;
    const who = M.uid || (M.dev ? 'dev' : 'anon');
    if (rec.u[who] || Object.keys(rec.u).length < 500) {
      add(rec.u[who] = rec.u[who] || {}, c);
      if (M.dev) rec.u[who].d = true;
    }
  }
  if (rec.e.credit) rec.lastCredit = new Date().toISOString();
  await env.SUBS.put(key, JSON.stringify(rec), { expirationTtl: 120 * 86400 });
}

export default {
`);

/* 4. the read, beside /admin/usage */
rep(`    if (url.pathname === '/admin/corrections' && req.method === 'GET') {`, `    /* the meter, per UTC day and route: what was called, with what, by whom */
    if (url.pathname === '/admin/cost' && req.method === 'GET') {
      if (!adminOk(req, env)) return json({ error: 'not allowed' }, 401);
      const days = Math.max(1, Math.min(60, Number(url.searchParams.get('days')) || 14));
      const out = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        const routes = {};
        await Promise.all(METER_ROUTES.concat('other').map(async (r) => {
          const v = await env.SUBS.get('mt:' + d + ':' + r);
          if (v) { try { routes[r] = JSON.parse(v); } catch {} }
        }));
        if (Object.keys(routes).length) out.push({ day: d, routes });
      }
      return json({ ok: true, days: out });
    }

    if (url.pathname === '/admin/corrections' && req.method === 'GET') {`);

if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
