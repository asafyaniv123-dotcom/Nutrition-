// fal.ai from the exercise tools (9 Nov) - the queue API with Node's own fetch, no dependency (tools/ has none).
//   import { falRun, falSubmit, falWait } from './fal.mjs'
//   node tools/sheets/fal.mjs status <endpoint-id> <request-id>   - read a job's state without submitting anything
// The key lives in .env at the repo root (FAL_KEY=..., git-ignored: the site is public via Pages) and is never printed,
// logged, put in a URL or passed on a command line. One submit = one billable job: falSubmit is never retried, and the
// caller keeps the request id so a lost response is resumed with falWait, not paid for twice.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const QUEUE = 'https://queue.fal.run';

function key() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY;
  let s = '';
  try { s = fs.readFileSync(path.join(ROOT, '.env'), 'utf8'); } catch { throw new Error('fal: .env not readable - FAL_KEY state unknown'); }
  const line = s.split(/\r?\n/).find((l) => /^\s*FAL_KEY\s*=/.test(l));
  const v = line && line.replace(/^\s*FAL_KEY\s*=\s*/, '').trim().replace(/^['"]|['"]$/g, '');
  if (!v) throw new Error('fal: FAL_KEY absent from .env');
  return v;
}
const auth = () => ({ Authorization: 'Key ' + key() });
// status and result URLs come back from fal; only ever send the key to fal's own origin
const onFal = (u) => { const h = new URL(u).hostname; if (h !== 'fal.run' && !h.endsWith('.fal.run') && !h.endsWith('.fal.ai')) throw new Error('fal: refusing non-fal URL ' + h); return u; };

async function call(url, init = {}) {
  const r = await fetch(onFal(url), { ...init, headers: { ...auth(), ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...(init.headers || {}) } });
  const text = await r.text(); let body; try { body = JSON.parse(text); } catch { body = text; }
  if (!r.ok) { const e = new Error(`fal ${r.status}: ${typeof body === 'string' ? body.slice(0, 300) : JSON.stringify(body).slice(0, 300)}`); e.status = r.status; e.body = body; throw e; }
  return body;
}

// submit once; returns { request_id, status_url, response_url } - store the id before doing anything else
export async function falSubmit(endpoint, input) {
  const j = await call(`${QUEUE}/${endpoint}`, { method: 'POST', body: JSON.stringify(input) });
  return { request_id: j.request_id, status_url: onFal(j.status_url), response_url: onFal(j.response_url) };
}

export async function falStatus(job) { return call(job.status_url + (job.status_url.includes('?') ? '&' : '?') + 'logs=1'); }

// poll until COMPLETED, then fetch the result; a 403 (exhausted balance, lock) is reported, never retried
export async function falWait(job, { every = 3000, timeout = 20 * 60e3, onStatus } = {}) {
  const t0 = Date.now();
  for (;;) {
    const s = await falStatus(job);
    if (onStatus) onStatus(s);
    if (s.status === 'COMPLETED') return call(job.response_url);
    if (Date.now() - t0 > timeout) throw new Error(`fal: ${job.request_id} still ${s.status} after ${timeout / 1000}s - resume with falWait, do not resubmit`);
    await new Promise((r) => setTimeout(r, every));
  }
}

export async function falRun(endpoint, input, opts) {
  const job = await falSubmit(endpoint, input);
  if (opts && opts.onSubmit) opts.onSubmit(job);
  return { job, result: await falWait(job, opts) };
}

// a local image as a data URI - fal's image inputs accept these, so nothing private goes through a third-party host
export function dataUri(file) {
  const ext = path.extname(file).slice(1).toLowerCase(), mime = ext === 'jpg' ? 'image/jpeg' : 'image/' + ext;
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [cmd, endpoint, id] = process.argv.slice(2);
  if (cmd === 'status' && endpoint && id) {
    const base = `${QUEUE}/${endpoint}/requests/${id}`;
    falStatus({ status_url: base + '/status' }).then((s) => console.log(JSON.stringify(s)), (e) => { console.log(e.message); process.exit(1); });
  } else console.log('usage: node tools/sheets/fal.mjs status <endpoint-id> <request-id>');
}
