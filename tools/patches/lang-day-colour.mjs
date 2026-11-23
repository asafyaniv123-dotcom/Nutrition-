// the three strings of the day's colour (rf-day-colour.mjs), in every language and both Hebrew forms.
// English first: "or" divides two ways to keep the day; the question offers a colour to someone who has no photo.
import fs from 'node:fs';
const T = {
  'או': { en: 'or', de: 'oder', es: 'o', ja: 'または', fr: 'ou', it: 'oppure', pt: 'ou', 'zh-Hans': '或者', 'zh-Hant': '或者', ar: 'أو' },
  'בלי תמונה היום? בחר צבע ליום': {
    en: 'No photo today? Pick a colour for the day',
    de: 'Heute kein Foto? Wähle eine Farbe für den Tag',
    es: '¿Hoy sin foto? Elige un color para el día',
    ja: '今日は写真なし？ 一日の色を選んでください',
    fr: 'Pas de photo aujourd’hui ? Choisis une couleur pour la journée',
    it: 'Niente foto oggi? Scegli un colore per la giornata',
    pt: 'Sem foto hoje? Escolha uma cor para o dia',
    'zh-Hans': '今天没有照片？为这一天选一种颜色',
    'zh-Hant': '今天沒有照片？為這一天選一種顏色',
    ar: 'لا صورة اليوم؟ اختر لونًا لهذا اليوم',
  },
  'צבע {n}': { en: 'Colour {n}', de: 'Farbe {n}', es: 'Color {n}', ja: '色 {n}', fr: 'Couleur {n}', it: 'Colore {n}', pt: 'Cor {n}',
    'zh-Hans': '颜色 {n}', 'zh-Hant': '顏色 {n}', ar: 'اللون {n}' },
};
const HE = { f: { 'בלי תמונה היום? בחר צבע ליום': 'בלי תמונה היום? בחרי צבע ליום' },
             x: { 'בלי תמונה היום? בחר צבע ליום': 'בלי תמונה היום? בחרו צבע ליום' } };
for (const l of ['en', 'de', 'es', 'ja', 'fr', 'it', 'pt', 'zh-Hans', 'zh-Hant', 'ar']) {
  const f = `data/lang/${l}.json`, j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k in T) j[k] = T[k][l];
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
}
for (const v of ['f', 'x']) {
  const f = `data/he-${v}.json`, raw = fs.readFileSync(f, 'utf8'), j = JSON.parse(raw);
  Object.assign(j, HE[v]);
  fs.writeFileSync(f, JSON.stringify(j, null, raw.includes('\n  "') ? 2 : 0) + (raw.endsWith('\n') ? '\n' : ''));
}
console.log('ok');
