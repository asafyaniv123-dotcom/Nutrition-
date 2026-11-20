// node tools/split-exercises.mjs [--check] - the exercise library as the app downloads it (20 Nov). data/exercises.json stays the
//   one file every tool reads and writes; the app no longer fetches it. It was 2 MB (600 KB on the wire) because the steps of
//   every exercise sat in it in eleven languages, and a phone on LTE waited for all eleven to read one - the generator's empty
//   muscle list on Asaf's phone was that wait. So it is cut in two:
//     data/exercises-core.json     everything but the translated steps (names stay in all eleven: search finds any of them)
//     data/exsteps/<lang>.json     { id: {s, k} } for one language; where a language lacks an exercise the English stands in,
//                                  marked l:'en', which is what exHow() always did with the full file
//   Hebrew needs no steps file: its steps are the core's own s and k.
//   --check writes nothing and fails if any of these is missing or no longer matches data/exercises.json - run it after any
//   tool that edits the library, and release.sh runs it so a stale split cannot reach the phone.
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1'), '..');
const SRC = path.join(ROOT, 'data/exercises.json'), CORE = path.join(ROOT, 'data/exercises-core.json'), DIR = path.join(ROOT, 'data/exsteps');
const check = process.argv.includes('--check');
const J = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const langs = new Set();
for (const e of J.exercises) if (e.sl) for (const l of Object.keys(e.sl)) langs.add(l);
if (!langs.has('en')) throw new Error('no English steps in the library: nothing to fall back on');
const out = new Map();
const core = { ...J, exercises: J.exercises.map((e) => { const c = { ...e }; delete c.sl; return c; }) };
out.set(CORE, JSON.stringify(core) + '\n');
for (const l of [...langs].sort()) {
  const m = {};
  for (const e of J.exercises) {
    const own = e.sl && e.sl[l], x = own || (e.sl && e.sl.en);
    if (x) m[e.id] = own ? { s: x.s, k: x.k } : { s: x.s, k: x.k, l: 'en' };
  }
  out.set(path.join(DIR, l + '.json'), JSON.stringify(m) + '\n');
}
// a steps file for a language the library no longer has is stale too
const extra = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => !out.has(path.join(DIR, f))) : [];
if (check) {
  const bad = [...out].filter(([f, s]) => !fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== s).map(([f]) => path.relative(ROOT, f));
  bad.push(...extra.map((f) => 'data/exsteps/' + f + ' (no such language in the library)'));
  if (bad.length) { console.log('the split library is stale - run node tools/split-exercises.mjs:\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log(`split library matches data/exercises.json (${J.exercises.length} exercises, steps in ${langs.size} languages + Hebrew)`);
} else {
  fs.mkdirSync(DIR, { recursive: true });
  for (const f of extra) fs.unlinkSync(path.join(DIR, f));
  for (const [f, s] of out) fs.writeFileSync(f, s);
  for (const [f, s] of out) console.log(path.relative(ROOT, f).padEnd(28), Buffer.byteLength(s), 'bytes');
}
