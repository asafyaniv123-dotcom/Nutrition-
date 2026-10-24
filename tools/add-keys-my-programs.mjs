/* "התוכניות שלי" - the title of the programs screen behind "from my programs" (24 Oct). */
import fs from 'fs';
const K = 'התוכניות שלי';
const A = { en: 'My programs', de: 'Meine Programme', es: 'Mis programas', fr: 'Mes programmes', it: 'I miei programmi', pt: 'Meus programas',
  ja: 'マイプログラム', 'zh-Hans': '我的计划', 'zh-Hant': '我的計畫', ar: 'برامجي' };
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  d[K] = v; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('done');
