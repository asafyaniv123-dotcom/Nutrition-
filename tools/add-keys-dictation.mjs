/* The journal mic's label, in every shipped language (31 Oct). */
import fs from 'fs';
const K = 'הכתבה';
const V = {
  en: 'Dictate', de: 'Diktieren', fr: 'Dicter', it: 'Detta', es: 'Dictar', pt: 'Ditar',
  ar: 'إملاء', ja: '音声入力', 'zh-Hans': '语音输入', 'zh-Hant': '語音輸入',
};
for (const [l, v] of Object.entries(V)) {
  const f = `data/lang/${l}.json`, d = JSON.parse(fs.readFileSync(f, 'utf8'));
  d[K] = v;
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('answered in ' + Object.keys(V).length + ' languages');
