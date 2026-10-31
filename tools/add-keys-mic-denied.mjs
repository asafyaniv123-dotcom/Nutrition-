/* The mic's "no permission" line, in every shipped language (31 Oct). */
import fs from 'fs';
const K = 'אין גישה למיקרופון. אפשר לאשר אותה בהגדרות של הטלפון.';
const V = {
  en: "No access to the microphone. You can allow it in your phone's settings.",
  de: 'Kein Zugriff auf das Mikrofon. Du kannst ihn in den Einstellungen deines Handys erlauben.',
  fr: 'Pas d’accès au micro. Tu peux l’autoriser dans les réglages de ton téléphone.',
  it: 'Nessun accesso al microfono. Puoi consentirlo nelle impostazioni del telefono.',
  es: 'No hay acceso al micrófono. Puedes permitirlo en los ajustes de tu teléfono.',
  pt: 'Sem acesso ao microfone. Você pode permitir nas configurações do celular.',
  ar: 'لا يوجد وصول إلى الميكروفون. يمكن السماح به من إعدادات الهاتف.',
  ja: 'マイクにアクセスできません。スマートフォンの設定で許可できます。',
  'zh-Hans': '无法使用麦克风。可以在手机设置中允许。',
  'zh-Hant': '無法使用麥克風。可以在手機設定中允許。',
};
for (const [l, v] of Object.entries(V)) {
  const f = `data/lang/${l}.json`, d = JSON.parse(fs.readFileSync(f, 'utf8'));
  d[K] = v;
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('answered in ' + Object.keys(V).length + ' languages');
