/* "Dig deeper" in תובנות (26 Nov 2026, tools/patches/ins-deep.mjs): the
 * questions and the screen's words in every language.
 *   English, he-f and he-x from tools/patches/ins-deep-bank.mjs;
 *   the other nine from tools/patches/ins-deep-<lang>.json (written from the
 *   English, one array per language in the order of ins-deep-in.json).
 *   node tools/lang-ins-deep.mjs */
import fs from 'fs';
import { BANK, UI } from './patches/ins-deep-bank.mjs';
const rows = BANK.map((r) => ({ key: r[2], en: r[1], f: r[3], x: r[4] }))
  .concat(UI.map((r) => ({ key: r[1], en: r[0], f: r[2], x: r[3] })));
const put = (f, fill) => {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  rows.forEach((r, i) => { const v = fill(r, i); if (v != null) d[r.key] = v; });
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
};
put('data/lang/en.json', (r) => r.en);
put('data/he-f.json', (r) => (r.f === '=' ? null : r.f));
put('data/he-x.json', (r) => (r.x === '=' ? null : r.x));
for (const L of ['de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar']) {
  const src = 'tools/patches/ins-deep-' + L + '.json';
  if (!fs.existsSync(src)) { console.log('waiting for', src); continue; }
  const T = JSON.parse(fs.readFileSync(src, 'utf8'));
  if (T.length !== rows.length || T.some((t) => !t || typeof t !== 'string')) { console.log('BAD', src); process.exit(1); }
  put('data/lang/' + L + '.json', (r, i) => T[i]);
}
console.log('ok', rows.length);
