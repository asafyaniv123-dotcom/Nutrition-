// node gen-mode-lang.mjs <lang-dir> [--undo] - the one key the generator's new first question adds (20 Nov): logged or on the clock.
//   Written from the English. --undo removes it again.
import fs from 'node:fs';
const D = process.argv[2], undo = process.argv.includes('--undo');
const T = {
  'איך להתאמן הפעם?': { en: 'How do you want to train?', de: 'Wie möchtest du trainieren?', es: '¿Cómo quieres entrenar?', fr: 'Comment veux-tu t’entraîner ?', it: 'Come vuoi allenarti?', pt: 'Como você quer treinar?', ja: 'どのようにトレーニングしますか？', 'zh-Hans': '这次想怎么练？', 'zh-Hant': '這次想怎麼練？', ar: 'كيف تريد أن تتدرّب هذه المرة؟' },
};
for (const l of ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar']) {
  const f = `${D}/${l}.json`, raw = fs.readFileSync(f, 'utf8'), j = JSON.parse(raw);
  let n = 0;
  for (const [k, v] of Object.entries(T)) {
    if (!v[l]) throw new Error(`${k}: no ${l}`);
    if (undo) { if (k in j && JSON.stringify(j[k]) === JSON.stringify(v[l])) { delete j[k]; n++; } }
    else if (!(k in j)) { j[k] = v[l]; n++; }
  }
  const sorted = Object.fromEntries(Object.keys(j).sort().map((k) => [k, j[k]]));
  const was = Object.keys(JSON.parse(raw)), keepOrder = was.join() === was.slice().sort().join();
  fs.writeFileSync(f, JSON.stringify(keepOrder ? sorted : j, null, 2) + (raw.endsWith('\n') ? '\n' : ''));
  console.log(l, undo ? 'removed' : 'added', n);
}
