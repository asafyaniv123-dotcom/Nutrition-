// the one new string of rf-day-mag.mjs: the title of the card that holds the day's short answers. English first,
// written as the original - the heading over a small card of things the person told the app about the day.
import fs from 'node:fs';
const T = {
  'עוד מהיום': { en: 'More from the day', de: 'Mehr vom Tag', es: 'Más del día', ja: 'この日のほかのこと',
    fr: 'Encore de cette journée', it: 'Altro della giornata', pt: 'Mais do dia', 'zh-Hans': '这一天的其他',
    'zh-Hant': '這一天的其他', ar: 'المزيد من هذا اليوم' },
};
const langs = Object.keys(Object.values(T)[0]);
for (const l of langs) { const f = `data/lang/${l}.json`, j = JSON.parse(fs.readFileSync(f, 'utf8')); for (const k in T) j[k] = T[k][l]; fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n'); }
console.log('ok');
