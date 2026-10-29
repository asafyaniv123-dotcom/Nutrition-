/* People in planning (30.10): the reminder that says who, the questions a name
 * can still need, the sheet's section, the evening question and the person
 * page's two new lines. English is the original; every other language is
 * written from it. he-f and he-x answer only the lines that address the reader.
 *
 *   node tools/add-keys-people-plan.mjs
 */
import fs from 'fs';
const K = ['עכשיו, עם {names} · {when}', 'בעוד רבע שעה עם {names} · {when}', 'בעוד חצי שעה עם {names} · {when}',
  'בעוד שעה עם {names} · {when}', 'בעוד {n} דקות עם {names} · {when}', 'זה {name} שלך?', 'כן, זה {name} שלי', 'סתם מילה',
  'יש אצלך כמה בשם {name}. למי התכוונת?', 'אף אחד מהם', 'עם מי', 'איך היה עם {names}?', 'מה שתכתוב יישמר בדף שלהם.',
  'לשמור אצל', 'לא הערב', 'דיברנו היום', 'מסיום היום · {task}'];
const A = {
  en: ['Now, with {names} · {when}', 'In a quarter of an hour, with {names} · {when}', 'In half an hour, with {names} · {when}',
    'In an hour, with {names} · {when}', { one: 'In {n} minute, with {names} · {when}', other: 'In {n} minutes, with {names} · {when}' },
    'Is this {name} from your people?', 'Yes, that’s my {name}', 'Just a word',
    'You have more than one {name}. Which one did you mean?', 'None of them', 'Who it’s with', 'How was it with {names}?',
    'Whatever you write will be kept on their pages.', 'Save to', 'Not tonight', 'Last spoke today', 'From Day’s end · {task}'],
  de: ['Jetzt, mit {names} · {when}', 'In einer Viertelstunde, mit {names} · {when}', 'In einer halben Stunde, mit {names} · {when}',
    'In einer Stunde, mit {names} · {when}', { one: 'In {n} Minute, mit {names} · {when}', other: 'In {n} Minuten, mit {names} · {when}' },
    'Meinst du {name} aus „Meine Menschen“?', 'Ja, das ist {name}', 'Nur ein Wort',
    'Du hast mehr als eine Person namens {name}. Wen meinst du?', 'Keine davon', 'Mit wem', 'Wie war es mit {names}?',
    'Was du schreibst, wird auf ihren Seiten gespeichert.', 'Speichern bei', 'Nicht heute Abend', 'Heute gesprochen', 'Aus dem Tagesabschluss · {task}'],
  es: ['Ahora, con {names} · {when}', 'En un cuarto de hora, con {names} · {when}', 'En media hora, con {names} · {when}',
    'En una hora, con {names} · {when}', { one: 'En {n} minuto, con {names} · {when}', other: 'En {n} minutos, con {names} · {when}' },
    '¿Te refieres a {name}, de Mi gente?', 'Sí, es {name}', 'Solo una palabra',
    'Tienes más de una persona llamada {name}. ¿A quién te refieres?', 'Ninguna', 'Con quién', '¿Qué tal con {names}?',
    'Lo que escribas se guardará en sus páginas.', 'Guardar en', 'Esta noche no', 'Hablamos hoy', 'Del cierre del día · {task}'],
  fr: ['Maintenant, avec {names} · {when}', 'Dans un quart d’heure, avec {names} · {when}', 'Dans une demi-heure, avec {names} · {when}',
    'Dans une heure, avec {names} · {when}', { one: 'Dans {n} minute, avec {names} · {when}', other: 'Dans {n} minutes, avec {names} · {when}' },
    'Tu parles de {name}, de Mes proches ?', 'Oui, c’est {name}', 'Juste un mot',
    'Tu as plusieurs personnes nommées {name}. Laquelle veux-tu dire ?', 'Aucune', 'Avec qui', 'Comment ça s’est passé avec {names} ?',
    'Ce que tu écris sera gardé sur leurs pages.', 'Enregistrer chez', 'Pas ce soir', 'Parlé aujourd’hui', 'Depuis la clôture du jour · {task}'],
  it: ['Ora, con {names} · {when}', 'Tra un quarto d’ora, con {names} · {when}', 'Tra mezz’ora, con {names} · {when}',
    'Tra un’ora, con {names} · {when}', { one: 'Tra {n} minuto, con {names} · {when}', other: 'Tra {n} minuti, con {names} · {when}' },
    'Intendi {name}, delle tue persone?', 'Sì, è {name}', 'Solo una parola',
    'Hai più di una persona di nome {name}. Chi intendevi?', 'Nessuna', 'Con chi', 'Com’è andata con {names}?',
    'Quello che scrivi resterà sulle loro pagine.', 'Salva per', 'Non stasera', 'Sentiti oggi', 'Dalla chiusura del giorno · {task}'],
  pt: ['Agora, com {names} · {when}', 'Em quinze minutos, com {names} · {when}', 'Em meia hora, com {names} · {when}',
    'Em uma hora, com {names} · {when}', { one: 'Em {n} minuto, com {names} · {when}', other: 'Em {n} minutos, com {names} · {when}' },
    'É {name}, da Minha gente?', 'Sim, é {name}', 'Só uma palavra',
    'Você tem mais de uma pessoa chamada {name}. Qual delas?', 'Nenhuma', 'Com quem', 'Como foi com {names}?',
    'O que você escrever fica guardado nas páginas delas.', 'Salvar em', 'Hoje não', 'Conversamos hoje', 'Do fechamento do dia · {task}'],
  ja: ['今、{names}と · {when}', '15分後、{names}と · {when}', '30分後、{names}と · {when}',
    '1時間後、{names}と · {when}', { other: '{n}分後、{names}と · {when}' },
    '「自分の人たち」の{name}さんですか？', 'はい、{name}さんです', 'ただの言葉',
    '{name}という名前の人が複数います。どの人ですか？', 'どれでもない', '一緒にいる人', '{names}とはどうでしたか？',
    '書いたことは、それぞれのページに残ります。', '保存先', '今夜はやめておく', '今日話した', '一日の締めくくりから · {task}'],
  'zh-Hans': ['现在，和{names} · {when}', '一刻钟后，和{names} · {when}', '半小时后，和{names} · {when}',
    '一小时后，和{names} · {when}', { other: '{n}分钟后，和{names} · {when}' },
    '是“我的人”里的{name}吗？', '是的，就是{name}', '只是一个词',
    '你有不止一个叫{name}的人。你指的是哪一位？', '都不是', '和谁', '和{names}在一起怎么样？',
    '你写下的内容会保存在他们的页面上。', '保存到', '今晚不了', '今天聊过', '来自一天的收尾 · {task}'],
  'zh-Hant': ['現在，和{names} · {when}', '一刻鐘後，和{names} · {when}', '半小時後，和{names} · {when}',
    '一小時後，和{names} · {when}', { other: '{n}分鐘後，和{names} · {when}' },
    '是「我的人」裡的{name}嗎？', '是的，就是{name}', '只是一個詞',
    '你有不只一個叫{name}的人。你指的是哪一位？', '都不是', '和誰', '和{names}在一起怎麼樣？',
    '你寫下的內容會保存在他們的頁面上。', '儲存到', '今晚不了', '今天聊過', '來自一天的收尾 · {task}'],
  ar: ['الآن، مع {names} · {when}', 'بعد ربع ساعة، مع {names} · {when}', 'بعد نصف ساعة، مع {names} · {when}',
    'بعد ساعة، مع {names} · {when}',
    { zero: 'بعد {n} دقيقة، مع {names} · {when}', one: 'بعد دقيقة، مع {names} · {when}', two: 'بعد دقيقتين، مع {names} · {when}',
      few: 'بعد {n} دقائق، مع {names} · {when}', many: 'بعد {n} دقيقة، مع {names} · {when}', other: 'بعد {n} دقيقة، مع {names} · {when}' },
    'هل تقصد {name} من أهلك وأصحابك؟', 'نعم، هذا {name}', 'مجرد كلمة',
    'لديك أكثر من شخص باسم {name}. من تقصد؟', 'لا أحد منهم', 'مع من', 'كيف كان الوقت مع {names}؟',
    'ما تكتبه سيُحفظ في صفحاتهم.', 'الحفظ لدى', 'ليس الليلة', 'تواصلنا اليوم', 'من إغلاق اليوم · {task}'],
};
for (const [l, v] of Object.entries(A)) {
  if (v.length !== K.length) throw new Error(l + ' has ' + v.length + ' answers for ' + K.length + ' keys');
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; });
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
/* the feminine and the plural address: only the lines that speak to the reader */
const F = { 'מה שתכתוב יישמר בדף שלהם.': 'מה שתכתבי יישמר בדף שלהם.' };
const X = { 'זה {name} שלך?': 'זה {name} שלכם?', 'יש אצלך כמה בשם {name}. למי התכוונת?': 'יש אצלכם כמה בשם {name}. למי התכוונתם?',
  'מה שתכתוב יישמר בדף שלהם.': 'מה שתכתבו יישמר בדף שלהם.' };
for (const [f, add] of [['data/he-f.json', F], ['data/he-x.json', X]]) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  Object.assign(d, add);
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('done: ' + K.length + ' keys in ' + Object.keys(A).length + ' languages, he-f +' + Object.keys(F).length + ', he-x +' + Object.keys(X).length);
