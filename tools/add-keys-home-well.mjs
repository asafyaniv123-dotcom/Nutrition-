/* The five strings the home well brought (20 Oct 2026), answered in every
 * shipped language. English is the original; the rest are written from it.
 *   node tools/add-keys-home-well.mjs
 * Rewrites only these keys; every other line of each file is left as it was. */
import fs from 'fs';

const K = {
  now: 'עכשיו|בלו"ז',
  next: 'הבא|בלו"ז',
  done: 'זה הכול להיום בלו"ז',
  notes: 'לזכור: {n}',
  all: 'כל הלו"ז',
};
const A = {
  en: { now: 'Happening now', next: 'Next up', done: "That's everything on today's schedule", notes: 'To remember: {n}', all: 'Full schedule' },
  de: { now: 'Gerade jetzt', next: 'Als Nächstes', done: 'Das war alles, was heute im Plan steht', notes: 'Zu merken: {n}', all: 'Ganzer Tagesplan' },
  es: { now: 'Ahora mismo', next: 'A continuación', done: 'Eso es todo lo que tienes hoy en el horario', notes: 'Para recordar: {n}', all: 'Horario completo' },
  fr: { now: 'En ce moment', next: 'À suivre', done: "C'est tout pour le programme d'aujourd'hui", notes: 'À retenir : {n}', all: 'Tout le programme' },
  it: { now: 'In corso', next: 'Prossimo', done: 'È tutto per il programma di oggi', notes: 'Da ricordare: {n}', all: 'Programma completo' },
  pt: { now: 'Agora', next: 'A seguir', done: 'É tudo o que há na agenda de hoje', notes: 'Para lembrar: {n}', all: 'Agenda completa' },
  ja: { now: '今', next: '次の予定', done: '今日の予定はこれで全部です', notes: '覚えておくこと：{n}', all: '予定をすべて見る' },
  'zh-Hans': { now: '正在进行', next: '下一项', done: '今天的日程就这些了', notes: '要记住：{n}', all: '完整日程' },
  'zh-Hant': { now: '正在進行', next: '下一項', done: '今天的行程就這些了', notes: '要記住：{n}', all: '完整行程' },
  ar: { now: 'الآن', next: 'التالي', done: 'هذا كل ما في جدولك اليوم', notes: 'للتذكّر: {n}', all: 'الجدول كاملًا' },
};

for (const [lang, ans] of Object.entries(A)) {
  const f = `data/lang/${lang}.json`;
  const raw = fs.readFileSync(f, 'utf8');
  const o = JSON.parse(raw);
  for (const [id, key] of Object.entries(K)) o[key] = ans[id];
  /* keep the file's own indentation and trailing newline */
  const indent = (raw.match(/\n([ \t]+)"/) || [, '  '])[1];
  fs.writeFileSync(f, JSON.stringify(o, null, indent) + (raw.endsWith('\n') ? '\n' : ''));
}
console.log('answered ' + Object.keys(K).length + ' keys in ' + Object.keys(A).length + ' languages');
