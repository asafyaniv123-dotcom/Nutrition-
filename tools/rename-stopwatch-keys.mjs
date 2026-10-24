/* "סופר למעלה" is not a thing - it is a stopwatch; and "סופר למטה" is a
   countdown (Asaf, 24 Oct). Named the way the phone's own Clock app names
   them, in every language. */
import fs from 'fs';
const MAP = { 'סופר למעלה': 'שעון עצר', 'סופר למטה': 'ספירה לאחור' };
const A = {
  en: ['Stopwatch', 'Countdown'], de: ['Stoppuhr', 'Countdown'], es: ['Cronómetro', 'Cuenta atrás'],
  fr: ['Chronomètre', 'Compte à rebours'], it: ['Cronometro', 'Conto alla rovescia'], pt: ['Cronômetro', 'Contagem regressiva'],
  ja: ['ストップウォッチ', 'カウントダウン'], 'zh-Hans': ['秒表', '倒计时'], 'zh-Hant': ['碼錶', '倒數計時'], ar: ['ساعة الإيقاف', 'العد التنازلي'],
};
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
for (const [a, b] of Object.entries(MAP)) {
  const n = s.split("_t('" + a + "')").length - 1;
  if (n !== 3) { console.log('expected 3 of', a, 'found', n); process.exit(1); }
  s = s.split("_t('" + a + "')").join("_t('" + b + "')");
}
fs.writeFileSync(F, s);
const olds = Object.keys(MAP), news = Object.values(MAP);
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  olds.forEach((k, i) => { delete d[k]; d[news[i]] = v[i]; });
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('renamed');
