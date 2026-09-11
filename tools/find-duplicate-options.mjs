/* Two choices with the same label are one choice.
 *
 *   node tools/find-duplicate-options.mjs [path/to/index.html]
 *
 * WHY THIS EXISTS. The first question of the daily reflection is a five-point
 * mood scale - five faces, five words underneath - and it is the first thing
 * the app asks anybody. Driven in German:
 *
 *     Schwer · Nichts Besonderes · OK · Gut · Sehr gut
 *
 * "Nichts Besonderes" is the answer German also gives to כלום מיוחד, the
 * "nothing in particular" option in a completely different list, and it reads
 * as neutral where the scale needs it to sit BELOW "OK". Looking at the other
 * ten turned one bad word into a class:
 *
 *     es   Difícil · Regular · Bien   · Bien    · Genial      <- 3 and 4 equal
 *     ar   صعب     · لا بأس · لا بأس · جيد     · ممتاز        <- 2 and 3 equal
 *
 * A person is being shown two faces with the same word under them and asked
 * to choose. No amount of reading the Hebrew reveals it, because in Hebrew
 * every step is distinct; it only exists in the answers.
 *
 * WHAT IT CHECKS. Every list in the app whose members are shown as options to
 * pick from - the reflection's scales and word lists, the planner's, the
 * wizard's - mapped through each language's dictionary, looking for two
 * members that come back the same.
 *
 * Both shapes are read, because the file uses both:
 *
 *     var RF_BODY=['אנרגטי','עייף',…];                    bare data, Rule 3
 *     var RF_MOODS;langOn(function(){RF_MOODS=[{…l:_t('קשה')…},…]});
 *
 * WHAT IT DELIBERATELY DOES NOT CHECK. Lists whose Hebrew already repeats a
 * word - that is the author's business and not a translation fault - and
 * single-item lists, which cannot collide.
 */
import fs from 'fs';

const APP = process.argv[2] || 'dev/index.html';
const src = fs.readFileSync(APP, 'utf8');

/* the lists worth checking: a name, and the Hebrew members in order */
const lists = new Map();

/* shape one: var NAME=['a','b',…];  bare Hebrew, translated where drawn */
const bare = /var\s+([A-Z][A-Z0-9_]*)\s*=\s*\[([^\]]*)\]\s*;/g;
let m;
while ((m = bare.exec(src))) {
  const body = m[2];
  const items = [...body.matchAll(/'([^']*)'/g)].map((x) => x[1]);
  if (items.length < 2) continue;
  /* Hebrew members only. A list of CSS paths or English keys is not a set of
     options somebody picks between. */
  if (!items.every((s) => /[֐-׿]/.test(s))) continue;
  lists.set(m[1], items);
}

/* shape two: var NAME;langOn(function(){NAME=[ … _t('x') … ]}); */
const wrapped = /var\s+([A-Z][A-Z0-9_]*)\s*;\s*langOn\(function\(\)\{\s*\1\s*=\s*\[([\s\S]*?)\]\s*;\s*\}\)/g;
while ((m = wrapped.exec(src))) {
  const items = [...m[2].matchAll(/_t\('([^']*)'\)/g)].map((x) => x[1]);
  if (items.length < 2) continue;
  if (!items.every((s) => /[֐-׿]/.test(s))) continue;
  lists.set(m[1], items);
}

const LANGS = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'];
const dict = {};
for (const l of LANGS) dict[l] = JSON.parse(fs.readFileSync('data/lang/' + l + '.json', 'utf8'));

/* the same fold _t does: a key may carry a context after a bar */
const answer = (d, k) => {
  const v = d[k];
  if (typeof v === 'string' && v) return v;
  return k.indexOf('|') > 0 ? k.slice(0, k.indexOf('|')) : k;
};

/* A list drawn through optOnce shows one chip per LABEL rather than one per
   value, so a collapse in it is handled rather than shipped. Detected by
   looking for the call, not by a list kept here - an allow-list would rot
   the moment somebody stopped calling it. */
const handled = new Set(
  [...src.matchAll(/optOnce\(\s*([A-Z][A-Z0-9_]*)\s*\)/g)].map((x) => x[1]));

let found = 0, collapsed = 0;
for (const [name, items] of lists) {
  /* a list whose Hebrew already repeats is the author's business */
  if (new Set(items).size !== items.length) continue;
  for (const l of LANGS) {
    const seen = new Map();
    for (const k of items) {
      const a = answer(dict[l], k);
      if (seen.has(a)) {
        if (handled.has(name)) { collapsed++; continue; }
        found++;
        console.log(name + '  [' + l + ']  ' + JSON.stringify(seen.get(a)) + ' and ' +
          JSON.stringify(k) + ' are both ' + JSON.stringify(a));
      } else seen.set(a, k);
    }
  }
}

console.log('');
console.log(lists.size + ' option lists checked in ' + LANGS.length + ' languages');
if (collapsed) console.log(collapsed + ' collapses in lists drawn through optOnce, which shows one chip per label');
if (found) {
  console.log(found + ' places where two options carry the same label');
  process.exit(1);
}
console.log('every option in every list is distinct');
