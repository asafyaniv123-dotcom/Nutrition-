// node gt2-lang.mjs <lang-dir> [--undo] - the six keys ON THE CLOCK's second part adds (20 Nov): the end screen, the save, the sound
//   switch, and the sentence read aloud at every rest. Written from the English. The spoken sentence is a sentence a VOICE reads, so
//   each language says it the way a coach would say it out loud there. "Muted" was already a key and is reused.
import fs from 'node:fs';
const D = process.argv[2], undo = process.argv.includes('--undo');
const T = {
  'צליל וקול': { en: 'Sound + voice', de: 'Ton + Stimme', es: 'Sonido + voz', fr: 'Son + voix', it: 'Suoni + voce', pt: 'Som + voz', ja: '音＋音声', 'zh-Hans': '提示音＋语音', 'zh-Hant': '提示音＋語音', ar: 'صوت + كلام' },
  'צלילים בלבד': { en: 'Sounds only', de: 'Nur Töne', es: 'Solo sonidos', fr: 'Sons seulement', it: 'Solo suoni', pt: 'Só sons', ja: '音のみ', 'zh-Hans': '仅提示音', 'zh-Hant': '僅提示音', ar: 'أصوات فقط' },
  'מנוחה. התרגיל הבא: {name}': { en: 'Rest. Next exercise: {name}', de: 'Pause. Nächste Übung: {name}', es: 'Descanso. Siguiente ejercicio: {name}', fr: 'Repos. Exercice suivant : {name}', it: 'Riposo. Prossimo esercizio: {name}', pt: 'Descanso. Próximo exercício: {name}', ja: '休憩。次の種目は{name}です', 'zh-Hans': '休息。下一个动作：{name}', 'zh-Hant': '休息。下一個動作：{name}', ar: 'راحة. التمرين التالي: {name}' },
  'זמן כולל': { en: 'Total time', de: 'Gesamtzeit', es: 'Tiempo total', fr: 'Durée totale', it: 'Tempo totale', pt: 'Tempo total', ja: '合計時間', 'zh-Hans': '总时长', 'zh-Hant': '總時長', ar: 'الوقت الكلي' },
  'לשמור ביומן': { en: 'Save to workout log', de: 'Im Trainingsprotokoll speichern', es: 'Guardar en el registro', fr: 'Enregistrer dans le journal', it: 'Salva nel diario', pt: 'Salvar no registro', ja: 'トレーニング記録に保存', 'zh-Hans': '保存到训练记录', 'zh-Hant': '儲存到訓練紀錄', ar: 'حفظ في سجل التمارين' },
  'נשמר ביומן': { en: 'Saved to your log', de: 'Im Protokoll gespeichert', es: 'Guardado en el registro', fr: 'Enregistré dans le journal', it: 'Salvato nel diario', pt: 'Salvo no registro', ja: '記録に保存しました', 'zh-Hans': '已保存到记录', 'zh-Hant': '已儲存到紀錄', ar: 'حُفظ في السجل' },
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
