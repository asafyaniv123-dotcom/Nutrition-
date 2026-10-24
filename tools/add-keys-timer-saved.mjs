/* Saved timers (24 Oct): the nine strings, in every language, plus the Hebrew
   feminine and plural for the ones that address the person. */
import fs from 'fs';
const K = ['השמורים שלי', 'עוד אין שעונים שמורים. בנה שעון למטה ולחץ "שמור".', 'אפשרויות|שעון', 'לשמור את השעון הזה?',
  'שמירת השעון', 'עדכן את "{name}"', 'שמור כחדש', 'נשמר: {name}', 'שנה שם'];
const A = {
  en: ['My saved timers', 'No saved timers yet. Build one below and tap "Save".', 'Options', 'Save this timer?',
    'Save timer', 'Update "{name}"', 'Save as new', 'Saved: {name}', 'Rename'],
  de: ['Meine gespeicherten Timer', 'Noch keine gespeicherten Timer. Stell unten einen zusammen und tippe auf „Speichern“.', 'Optionen', 'Diesen Timer speichern?',
    'Timer speichern', '„{name}“ aktualisieren', 'Als neu speichern', 'Gespeichert: {name}', 'Umbenennen'],
  es: ['Mis temporizadores', 'Aún no hay temporizadores guardados. Crea uno abajo y toca «Guardar».', 'Opciones', '¿Guardar este temporizador?',
    'Guardar temporizador', 'Actualizar «{name}»', 'Guardar como nuevo', 'Guardado: {name}', 'Cambiar nombre'],
  fr: ['Mes minuteurs', 'Aucun minuteur enregistré pour l’instant. Créez-en un ci-dessous et touchez « Enregistrer ».', 'Options', 'Enregistrer ce minuteur ?',
    'Enregistrer le minuteur', 'Mettre à jour « {name} »', 'Enregistrer comme nouveau', 'Enregistré : {name}', 'Renommer'],
  it: ['I miei timer', 'Nessun timer salvato. Creane uno qui sotto e tocca «Salva».', 'Opzioni', 'Salvare questo timer?',
    'Salva timer', 'Aggiorna «{name}»', 'Salva come nuovo', 'Salvato: {name}', 'Rinomina'],
  pt: ['Meus temporizadores salvos', 'Ainda não há temporizadores salvos. Monte um abaixo e toque em "Salvar".', 'Opções', 'Salvar este temporizador?',
    'Salvar temporizador', 'Atualizar "{name}"', 'Salvar como novo', 'Salvo: {name}', 'Renomear'],
  ja: ['保存したタイマー', '保存したタイマーはまだありません。下で作って「保存」をタップしてください。', 'オプション', 'このタイマーを保存しますか？',
    'タイマーを保存', '「{name}」を更新', '新規として保存', '保存しました：{name}', '名前を変更'],
  'zh-Hans': ['我保存的计时器', '还没有保存的计时器。在下方设置一个，然后点“保存”。', '选项', '保存这个计时器？',
    '保存计时器', '更新“{name}”', '另存为新的', '已保存：{name}', '重命名'],
  'zh-Hant': ['我儲存的計時器', '還沒有儲存的計時器。在下方設定一個，然後點「儲存」。', '選項', '儲存這個計時器？',
    '儲存計時器', '更新「{name}」', '另存為新的', '已儲存：{name}', '重新命名'],
  ar: ['مؤقتاتي المحفوظة', 'لا توجد مؤقتات محفوظة بعد. أنشئ واحدًا في الأسفل واضغط «حفظ».', 'خيارات', 'هل تحفظ هذا المؤقت؟',
    'حفظ المؤقت', 'تحديث «{name}»', 'حفظ كجديد', 'تم الحفظ: {name}', 'إعادة التسمية'],
};
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
const FEM = { 'עוד אין שעונים שמורים. בנה שעון למטה ולחץ "שמור".': 'עוד אין שעונים שמורים. בני שעון למטה ולחצי "שמרי".',
  'עדכן את "{name}"': 'עדכני את "{name}"', 'שמור כחדש': 'שמרי כחדש', 'שנה שם': 'שני שם' };
const PLU = { 'עוד אין שעונים שמורים. בנה שעון למטה ולחץ "שמור".': 'עוד אין שעונים שמורים. בנו שעון למטה ולחצו "שמרו".',
  'עדכן את "{name}"': 'עדכנו את "{name}"', 'שמור כחדש': 'שמרו כחדש', 'שנה שם': 'שנו שם' };
for (const [f, m] of [['data/he-f.json', FEM], ['data/he-x.json', PLU]]) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8')); Object.assign(d, m); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('done');
