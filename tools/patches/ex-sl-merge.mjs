// node tools/patches/ex-sl-merge.mjs <exercises.json> <dir-of-<lang>-N.json> [--undo] - the steps (s) and the common mistakes (k)
//   of every exercise, in the nine languages that had only the English (20 Nov). Each was written from the English sl.en, not from
//   the Hebrew. Refuses the whole merge if any exercise disagrees with its English: a missing id, a different count of steps or
//   mistakes, an empty item, a Hebrew letter, the wrong script, or a number in the English that the translation dropped.
//   --undo removes exactly these nine languages again, which must give back the original file byte for byte.
import fs from 'node:fs';
const [F, D] = process.argv.slice(2), undo = process.argv.includes('--undo');
const LANGS = ['de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'];
const raw = fs.readFileSync(F, 'utf8'), J = JSON.parse(raw), EX = J.exercises;
if (undo) {
  let n = 0;
  for (const e of EX) if (e.sl) for (const l of LANGS) if (l in e.sl) { delete e.sl[l]; n++; }
  fs.writeFileSync(F, JSON.stringify(J));
  console.log('removed', n);
  process.exit(0);
}
const SCRIPT = {
  ja: /[぀-ヿ一-鿿]/, 'zh-Hans': /[一-鿿]/, 'zh-Hant': /[一-鿿]/, ar: /[؀-ۿ]/,
};
const FOREIGN = /[぀-ヿ一-鿿؀-ۿ]/;
const bad = [];
const nums = (t) => (t.match(/\d+(?:[.,]\d+)?/g) || []).map((x) => x.replace(',', '.'));
for (const l of LANGS) {
  const T = {};
  for (const f of fs.readdirSync(D).filter((f) => new RegExp('^' + l + '-\\d+\\.json$').test(f)))
    Object.assign(T, JSON.parse(fs.readFileSync(`${D}/${f}`, 'utf8')));
  for (const e of EX) {
    if (!e.sl || !e.sl.en) continue;
    const t = T[e.id], en = e.sl.en;
    if (!t) { bad.push(`${l} ${e.id}: missing`); continue; }
    for (const p of ['s', 'k']) {
      const a = en[p] || [], b = t[p] || [];
      if (a.length !== b.length) { bad.push(`${l} ${e.id}.${p}: ${b.length} items, English has ${a.length}`); continue; }
      b.forEach((x, i) => {
        if (typeof x !== 'string' || !x.trim()) bad.push(`${l} ${e.id}.${p}[${i}]: empty`);
        else if (/[֐-׿]/.test(x)) bad.push(`${l} ${e.id}.${p}[${i}]: Hebrew`);
        else if (SCRIPT[l] && !SCRIPT[l].test(x)) bad.push(`${l} ${e.id}.${p}[${i}]: not in its script: ${x}`);
        else if (!SCRIPT[l] && FOREIGN.test(x)) bad.push(`${l} ${e.id}.${p}[${i}]: foreign script: ${x}`);
        else {
          // a number the English gives (45 degrees, 2 seconds) must survive; Arabic may write it in its own digits
          const have = nums(x.replace(/[٠-٩]/g, (d) => d.charCodeAt(0) - 0x660)).join(' ');
          for (const n of nums(a[i])) if (!(' ' + have + ' ').includes(' ' + n + ' ')) bad.push(`${l} ${e.id}.${p}[${i}]: number ${n} lost: ${x}`);
        }
      });
    }
    e.sl[l] = { s: t.s, k: t.k };
  }
}
if (bad.length) { console.log(bad.slice(0, 60).join('\n')); console.log(`${bad.length} problems - nothing written`); process.exit(1); }
const out = JSON.stringify(J);
fs.writeFileSync(F, out + (raw.endsWith('\n') ? '\n' : ''));
console.log('merged', LANGS.length, 'languages into', EX.filter((e) => e.sl && e.sl.en).length, 'exercises');
