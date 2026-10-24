/* The stopwatch and countdown screen (24 Oct): seven strings in every
   language. None addresses the person, so he-f and he-x need nothing. */
import fs from 'fs';
const K = ['הקפה', 'הקפה {n}', 'השהה', 'שעות|גלגלת', 'דקות|גלגלת', 'שניות|גלגלת', 'אחרונים|טיימר'];
const A = {
  en: ['Lap', 'Lap {n}', 'Pause', 'hours', 'min', 'sec', 'Recent'],
  de: ['Runde', 'Runde {n}', 'Pause', 'Std.', 'Min.', 'Sek.', 'Zuletzt'],
  es: ['Vuelta', 'Vuelta {n}', 'Pausa', 'horas', 'min', 's', 'Recientes'],
  fr: ['Tour', 'Tour {n}', 'Pause', 'h', 'min', 's', 'Récents'],
  it: ['Giro', 'Giro {n}', 'Pausa', 'ore', 'min', 's', 'Recenti'],
  pt: ['Volta', 'Volta {n}', 'Pausar', 'horas', 'min', 's', 'Recentes'],
  ja: ['ラップ', 'ラップ{n}', '一時停止', '時間', '分', '秒', '最近'],
  'zh-Hans': ['计次', '计次{n}', '暂停', '小时', '分钟', '秒', '最近'],
  'zh-Hant': ['分圈', '分圈{n}', '暫停', '小時', '分鐘', '秒', '最近'],
  ar: ['لفة', 'لفة {n}', 'إيقاف مؤقت', 'ساعات', 'دقائق', 'ثوانٍ', 'الأخيرة'],
};
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('done');
