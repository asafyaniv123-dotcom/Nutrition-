/* People in every language (30.10): the card's counted line ("last spoke
 * yesterday / two days ago / five days ago" - one plural key, replacing the
 * glued 'דיברנו' + 'לפני {n} ימים') and the Contact Picker button.
 * English is the original; every other language is written from it.
 *
 *   node tools/add-keys-people-everywhere.mjs
 */
import fs from 'fs';
const K = ['דיברנו לפני {n} ימים', 'לבחור מאנשי הקשר'];
const A = {
  en: [{ one: 'Last spoke yesterday', other: 'Last spoke {n} days ago' }, 'Pick from contacts'],
  de: [{ one: 'Gestern gesprochen', other: 'Vor {n} Tagen gesprochen' }, 'Aus Kontakten wählen'],
  es: [{ one: 'Hablamos ayer', other: 'Hablamos hace {n} días' }, 'Elegir de los contactos'],
  fr: [{ one: 'Parlé hier', other: 'Parlé il y a {n} jours' }, 'Choisir dans les contacts'],
  it: [{ one: 'Sentiti ieri', other: 'Sentiti {n} giorni fa' }, 'Scegli dai contatti'],
  pt: [{ one: 'Conversamos ontem', other: 'Conversamos há {n} dias' }, 'Escolher nos contatos'],
  ja: [{ other: '{n}日前に話した' }, '連絡先から選ぶ'],
  'zh-Hans': [{ other: '{n}天前聊过' }, '从通讯录选择'],
  'zh-Hant': [{ other: '{n}天前聊過' }, '從通訊錄選擇'],
  ar: [{ zero: 'تواصلنا اليوم', one: 'تواصلنا أمس', two: 'تواصلنا قبل يومين', few: 'تواصلنا قبل {n} أيام', many: 'تواصلنا قبل {n} يومًا', other: 'تواصلنا قبل {n} يوم' },
    'اختيار من جهات الاتصال'],
};
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; });
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('done: ' + K.length + ' keys in ' + Object.keys(A).length + ' languages');
