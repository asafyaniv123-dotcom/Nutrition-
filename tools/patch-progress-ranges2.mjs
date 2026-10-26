/* the glass's rounded base as one CSS value; the new strings in every language */
import fs from 'fs';
for (const F of ['dev/index.html', 'tools/prg.js', 'tools/patch-progress-ranges.mjs']) {
  let s = fs.readFileSync(F, 'utf8');
  s = s.split(`(o.glass?';border-radius:0 0 '+rad.toFixed(1)+'px '+rad.toFixed(1)+'px':'')`).join(`(o.glass?';border-radius:0 0 var(--r) var(--r);--r:'+rad.toFixed(1)+'px':'')`);
  fs.writeFileSync(F, s);
}
const L = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'];
const T = {
  'שבוע|טווח': ['Week', 'Woche', 'Semana', 'Semaine', 'Settimana', 'Semana', '週', '周', '週', 'أسبوع'],
  'חודש|טווח': ['Month', 'Monat', 'Mes', 'Mois', 'Mese', 'Mês', '月', '月', '月', 'شهر'],
  'שלושה חודשים|טווח': ['3 months', '3 Monate', '3 meses', '3 mois', '3 mesi', '3 meses', '3か月', '3个月', '3個月', '3 أشهر'],
  'שנה|טווח': ['Year', 'Jahr', 'Año', 'Année', 'Anno', 'Ano', '年', '年', '年', 'سنة'],
  'הכל|טווח': ['All', 'Alles', 'Todo', 'Tout', 'Tutto', 'Tudo', 'すべて', '全部', '全部', 'الكل'],
  'כ-{d} בתקופה הזו': ['About {d} in this period', 'Etwa {d} in diesem Zeitraum', 'Unos {d} en este periodo', 'Environ {d} sur cette période', 'Circa {d} in questo periodo', 'Cerca de {d} neste período', 'この期間で約{d}', '这段时间约{d}', '這段時間約{d}', 'نحو {d} في هذه الفترة'],
  'ממוצע של {n} ביום': ['An average of {n} a day', 'Im Schnitt {n} pro Tag', 'Un promedio de {n} al día', 'En moyenne {n} par jour', 'In media {n} al giorno', 'Média de {n} por dia', '1日平均 {n}', '日均 {n}', '日均 {n}', 'بمعدل {n} يوميًا'],
  '{u} · המשקולות הכתומות נוספו בתקופה הזו': ['{u} · the orange plates were added in this period', '{u} · die orangen Scheiben kamen in diesem Zeitraum dazu', '{u} · los discos naranjas se sumaron en este periodo', '{u} · les disques orange ont été ajoutés sur cette période', '{u} · i dischi arancioni sono stati aggiunti in questo periodo', '{u} · as anilhas laranja foram adicionadas neste período', '{u}・オレンジのプレートはこの期間に増えた分', '{u} · 橙色杠铃片是这段时间加上的', '{u} · 橘色槓片是這段時間加上的', '{u} · الأقراص البرتقالية أُضيفت في هذه الفترة'],
};
const DROP = ['{u} · המשקולות הכתומות נוספו ב-8 שבועות', 'השבוע בהיר יותר מהקודם', 'לפני 8 שבועות'];
for (let i = 0; i < L.length; i++) { const f = 'data/lang/' + L[i] + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k of DROP) delete d[k]; for (const k of Object.keys(T)) d[k] = T[k][i]; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); }
console.log('ok');
