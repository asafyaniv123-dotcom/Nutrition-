/* The one line that says why a faster pace is not offered (26 Nov 2026,
 * tools/patches/pace-floor.mjs), in every shipped language.
 *   node tools/lang-pace-floor.mjs */
import fs from 'fs';
const L = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'];
const K = 'קצב מהיר יותר היה דורש פחות מ־{k} קלוריות ביום, מתחת למינימום הבטוח, ולכן הוא לא מוצע.';
const T = [
  'A faster pace would mean eating fewer than {k} calories a day, below the safe minimum, so it isn’t offered.',
  'Ein schnelleres Tempo hieße weniger als {k} Kalorien am Tag, unter dem sicheren Minimum – deshalb wird es nicht angeboten.',
  'Un ritmo más rápido supondría menos de {k} calorías al día, por debajo del mínimo seguro, así que no se ofrece.',
  'Un rythme plus rapide voudrait dire moins de {k} calories par jour, sous le minimum sûr : il n’est donc pas proposé.',
  'Un ritmo più veloce vorrebbe dire meno di {k} calorie al giorno, sotto il minimo sicuro, quindi non viene proposto.',
  'Um ritmo mais rápido significaria menos de {k} calorias por dia, abaixo do mínimo seguro, por isso não é oferecido.',
  'これより速いペースでは1日{k}キロカロリーを下回り、安全な最低ラインより低くなるため、表示していません。',
  '更快的节奏意味着每天摄入少于 {k} 卡路里，低于安全下限，所以不提供。',
  '更快的節奏意味著每天攝取少於 {k} 卡路里，低於安全下限，所以不提供。',
  'الوتيرة الأسرع تعني أقل من {k} سعرة حرارية في اليوم، وهذا أقل من الحد الأدنى الآمن، لذلك لا تُعرض.',
];
for (let i = 0; i < L.length; i++) {
  const f = 'data/lang/' + L[i] + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  d[K] = T[i];
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('ok');
