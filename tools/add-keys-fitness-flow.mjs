/* The fitness way in and the reminder's honest answers (22 Oct). */
import fs from 'fs';
const K = ['בלי תוכנית בינתיים', 'ההתראות חסומות בהגדרות הטלפון. אפשר לאפשר אותן שם.', 'כדי לקבל תזכורת בטלפון, צריך להוסיף את האפליקציה למסך הבית.'];
const A = {
  en: ['No plan for now', 'Notifications are blocked in your phone’s settings. You can allow them there.', 'To get a reminder on your phone, add the app to your home screen first.'],
  de: ['Vorerst ohne Plan', 'Mitteilungen sind in den Einstellungen deines Telefons blockiert. Du kannst sie dort erlauben.', 'Um eine Erinnerung auf dem Telefon zu bekommen, füge die App zuerst zum Home-Bildschirm hinzu.'],
  es: ['Sin plan por ahora', 'Las notificaciones están bloqueadas en los ajustes del teléfono. Puedes permitirlas allí.', 'Para recibir un recordatorio en el teléfono, primero añade la app a la pantalla de inicio.'],
  fr: ['Pas de programme pour l’instant', 'Les notifications sont bloquées dans les réglages du téléphone. Tu peux les autoriser là.', 'Pour recevoir un rappel sur ton téléphone, ajoute d’abord l’app à l’écran d’accueil.'],
  it: ['Niente piano per ora', 'Le notifiche sono bloccate nelle impostazioni del telefono. Puoi consentirle lì.', 'Per ricevere un promemoria sul telefono, aggiungi prima l’app alla schermata Home.'],
  pt: ['Sem plano por agora', 'As notificações estão bloqueadas nas definições do telefone. Podes permiti-las lá.', 'Para receber um lembrete no telefone, adiciona primeiro a app ao ecrã principal.'],
  ja: ['今はプランなしで', '通知がスマホの設定でブロックされています。設定から許可できます。', 'スマホでリマインダーを受け取るには、まずアプリをホーム画面に追加してください。'],
  'zh-Hans': ['暂时不要计划', '通知在手机设置中被屏蔽了。可以在那里允许。', '要在手机上收到提醒，请先把应用添加到主屏幕。'],
  'zh-Hant': ['暫時不要計畫', '通知在手機設定中被封鎖了。可以在那裡允許。', '要在手機上收到提醒，請先把應用程式加入主畫面。'],
  ar: ['بدون خطة الآن', 'الإشعارات محظورة في إعدادات الهاتف. يمكنك السماح بها هناك.', 'لتصلك تذكيرات على الهاتف، أضف التطبيق إلى الشاشة الرئيسية أولًا.'],
};
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('done');
