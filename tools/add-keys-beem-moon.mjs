/* "Good night" on the summary's last page, as Beem falls asleep into the moon. */
import fs from 'fs';
const A = { en: ['Good night, {name}.', 'Good night.'], de: ['Gute Nacht, {name}.', 'Gute Nacht.'], es: ['Buenas noches, {name}.', 'Buenas noches.'],
  fr: ['Bonne nuit, {name}.', 'Bonne nuit.'], it: ['Buonanotte, {name}.', 'Buonanotte.'], pt: ['Boa noite, {name}.', 'Boa noite.'],
  ja: ['おやすみ、{name}さん。', 'おやすみ。'], 'zh-Hans': ['晚安，{name}。', '晚安。'], 'zh-Hant': ['晚安，{name}。', '晚安。'], ar: ['تصبح على خير يا {name}.', 'تصبح على خير.'] };
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  d['לילה טוב, {name}.'] = v[0]; d['לילה טוב.'] = v[1];
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('done');
