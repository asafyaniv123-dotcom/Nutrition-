// node gt-lang.mjs <lang-dir> [--undo] - the fifteen keys ON THE CLOCK adds, answered in the ten languages (20 Nov). Written from the
//   English, which is the pivot; the counters follow each language's own existing "שלב/סבב {n} מתוך {total}" so a set reads the
//   way a step and a round already do. Adds only missing keys; --undo removes exactly these keys again.
import fs from 'node:fs';
const D = process.argv[2], undo = process.argv.includes('--undo');
const T = {
  'אימון על זמן': { en: 'Follow-along workout', de: 'Mitmach-Training', es: 'Entreno guiado', fr: 'Séance guidée', it: 'Allenamento guidato', pt: 'Treino guiado', ja: 'ガイド付きワークアウト', 'zh-Hans': '计时跟练', 'zh-Hant': '計時跟練', ar: 'تمرين موجَّه بالمؤقّت' },
  'תרגול על זמן': { en: 'Follow along on the clock', de: 'Nach Zeit mitmachen', es: 'Seguir con temporizador', fr: 'Suivre au chrono', it: 'Segui con il timer', pt: 'Acompanhar no cronômetro', ja: 'タイマーで練習', 'zh-Hans': '计时练习', 'zh-Hant': '計時練習', ar: 'التمرّن مع المؤقّت' },
  'אימון מתועד': { en: 'Logged workout', de: 'Protokolliertes Training', es: 'Entreno registrado', fr: 'Séance enregistrée', it: 'Allenamento registrato', pt: 'Treino registrado', ja: '記録するワークアウト', 'zh-Hans': '记录训练', 'zh-Hant': '記錄訓練', ar: 'تمرين مسجَّل' },
  'סטים, משקל וחזרות, כל סט בתורו': { en: 'Sets, weight and reps, one set at a time', de: 'Sätze, Gewicht und Wiederholungen, Satz für Satz', es: 'Series, peso y repeticiones, serie a serie', fr: 'Séries, charge et répétitions, une série à la fois', it: 'Serie, peso e ripetizioni, una serie alla volta', pt: 'Séries, peso e repetições, uma série de cada vez', ja: 'セット・重量・回数を1セットずつ記録', 'zh-Hans': '组数、重量和次数，一组一组记录', 'zh-Hant': '組數、重量和次數，一組一組記錄', ar: 'المجموعات والوزن والتكرارات، مجموعة تلو الأخرى' },
  'עבודה ומנוחה על שעון, עם ההדגמה': { en: 'Work and rest on a timer, with the demo', de: 'Arbeit und Pause nach Uhr, mit Vorführung', es: 'Trabajo y descanso con temporizador, con la demostración', fr: 'Travail et repos au chrono, avec la démonstration', it: 'Lavoro e riposo a tempo, con la dimostrazione', pt: 'Trabalho e descanso no cronômetro, com a demonstração', ja: 'タイマーで運動と休憩、お手本つき', 'zh-Hans': '按计时器运动和休息，附动作演示', 'zh-Hant': '按計時器運動和休息，附動作示範', ar: 'عمل وراحة على المؤقّت، مع العرض التوضيحي' },
  'עבודה ומנוחה': { en: 'Work and rest', de: 'Arbeit und Pause', es: 'Trabajo y descanso', fr: 'Travail et repos', it: 'Lavoro e riposo', pt: 'Trabalho e descanso', ja: '運動と休憩', 'zh-Hans': '运动与休息', 'zh-Hant': '運動與休息', ar: 'العمل والراحة' },
  'מותאם אישית': { en: 'Custom', de: 'Eigene', es: 'Personalizado', fr: 'Personnalisé', it: 'Personalizzato', pt: 'Personalizado', ja: 'カスタム', 'zh-Hans': '自定义', 'zh-Hant': '自訂', ar: 'مخصَّص' },
  'סטים לכל תרגיל': { en: 'Sets per exercise', de: 'Sätze pro Übung', es: 'Series por ejercicio', fr: 'Séries par exercice', it: 'Serie per esercizio', pt: 'Séries por exercício', ja: '1種目あたりのセット数', 'zh-Hans': '每个动作的组数', 'zh-Hant': '每個動作的組數', ar: 'المجموعات لكل تمرين' },
  'בהמשך': { en: 'Up next', de: 'Als Nächstes', es: 'A continuación', fr: 'Ensuite', it: 'Prossimo', pt: 'A seguir', ja: '次は', 'zh-Hans': '下一个', 'zh-Hant': '下一個', ar: 'التالي' },
  'לדלג על המנוחה': { en: 'Skip rest', de: 'Pause überspringen', es: 'Saltar descanso', fr: 'Passer le repos', it: 'Salta il riposo', pt: 'Pular descanso', ja: '休憩をスキップ', 'zh-Hans': '跳过休息', 'zh-Hant': '跳過休息', ar: 'تخطّي الراحة' },
  'עוד {n} שניות': {
    en: { one: '+{n} second', other: '+{n} seconds' }, de: { one: '+{n} Sekunde', other: '+{n} Sekunden' },
    es: { one: '+{n} segundo', other: '+{n} segundos' }, fr: { one: '+{n} seconde', other: '+{n} secondes' },
    it: { one: '+{n} secondo', other: '+{n} secondi' }, pt: { one: '+{n} segundo', other: '+{n} segundos' },
    ja: { other: '+{n}秒' }, 'zh-Hans': { other: '+{n} 秒' }, 'zh-Hant': { other: '+{n} 秒' },
    ar: { zero: '{n} ثانية إضافية', one: 'ثانية إضافية', two: 'ثانيتان إضافيتان', few: '{n} ثوانٍ إضافية', many: '{n} ثانية إضافية', other: '{n} ثانية إضافية' } },
  'תרגיל {n} מתוך {total}': { en: 'Exercise {n} of {total}', de: 'Übung {n} von {total}', es: 'Ejercicio {n} de {total}', fr: 'Exercice {n} sur {total}', it: 'Esercizio {n} di {total}', pt: 'Exercício {n} de {total}', ja: '{total} 種目中 {n} 種目め', 'zh-Hans': '第 {n} 个动作，共 {total} 个', 'zh-Hant': '第 {n} 個動作，共 {total} 個', ar: 'التمرين {n} من {total}' },
  'סט {n} מתוך {total}': { en: 'Set {n} of {total}', de: 'Satz {n} von {total}', es: 'Serie {n} de {total}', fr: 'Série {n} sur {total}', it: 'Serie {n} di {total}', pt: 'Série {n} de {total}', ja: '{total} セット中 {n} セットめ', 'zh-Hans': '第 {n} 组，共 {total} 组', 'zh-Hant': '第 {n} 組，共 {total} 組', ar: 'المجموعة {n} من {total}' },
  'טעות נפוצה': { en: 'Common mistake', de: 'Häufiger Fehler', es: 'Error habitual', fr: 'Erreur fréquente', it: 'Errore comune', pt: 'Erro comum', ja: 'よくある間違い', 'zh-Hans': '常见错误', 'zh-Hant': '常見錯誤', ar: 'خطأ شائع' },
  'סוף האימון': { en: 'End of workout', de: 'Ende des Trainings', es: 'Fin del entreno', fr: 'Fin de la séance', it: "Fine dell'allenamento", pt: 'Fim do treino', ja: 'ワークアウト終了', 'zh-Hans': '训练结束', 'zh-Hant': '訓練結束', ar: 'نهاية التمرين' },
};
for (const l of ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar']) {
  const f = `${D}/${l}.json`, raw = fs.readFileSync(f, 'utf8'), j = JSON.parse(raw);
  let n = 0;
  for (const [k, v] of Object.entries(T)) {
    if (!v[l]) throw new Error(`${k}: no ${l}`);
    if (undo) { if (k in j && JSON.stringify(j[k]) === JSON.stringify(v[l])) { delete j[k]; n++; } }
    else if (!(k in j)) { j[k] = v[l]; n++; }
  }
  const sorted = Object.fromEntries(Object.keys(j).sort().map((k) => [k, j[k]]));
  const was = Object.keys(JSON.parse(raw)), keepOrder = was.join() === was.slice().sort().join();
  fs.writeFileSync(f, JSON.stringify(keepOrder ? sorted : j, null, 2) + (raw.endsWith('\n') ? '\n' : ''));
  console.log(l, undo ? 'removed' : 'added', n);
}
