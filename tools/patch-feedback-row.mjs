/* WRITE TO US (31.10) - the first outside testers' one way back to us.
 *
 * A row at the foot of settings, drawn with the same .set-hl button as
 * "Your health", that opens the person's own mail app on a letter to the
 * address on the privacy page. Under a blank space for their words sit four
 * technical lines - which copy (stable or dev) and when it was built, the
 * language, the kind of phone and how the app was opened, the screen size -
 * and nothing the person ever wrote into the app.
 *
 *   node tools/patch-feedback-row.mjs          apply to dev/index.html + the dictionaries
 *   node tools/patch-feedback-row.mjs --undo   reverse it (must return HEAD byte for byte)
 *
 * The dictionaries are written back with the indent they were read with;
 * every one of them round-trips through JSON.parse/stringify unchanged, which
 * was checked before this was written, so --undo returns them exactly too.
 */
import fs from 'fs';
const F = 'dev/index.html';
const UNDO = process.argv.includes('--undo');
const R = String.raw;
const P = [];
const rep = (a, b) => P.push([a, b]);

/* ── 1. the row, last in settings, under the backup ── */
rep(R`  h+='<div id="set-backup"></div>';
  v.innerHTML=h;
  renderBackup();
}
`, R`  h+='<div id="set-backup"></div>';
  /* WRITE TO US. Last, under the backup: it is not a setting, and it should
     not push one down. Same row as "your health", so it reads as part of
     this sheet rather than as a banner laid over it. */
  h+='<button class="set-hl" onclick="fbOpen()"><span><b>'+_t('כתוב לנו')+'</b><i>'+_t('מה מבלבל, מה חסר, מה טוב. אנחנו קוראים כל הודעה.')+'</i></span>'+
     '<em>&#8249;</em></button>';
  v.innerHTML=h;
  renderBackup();
}
/* ── WRITE TO US ──
   A letter the person writes in their own mail app, to the address on the
   privacy page. Below a blank space for their words, four lines that tell us
   WHICH app they were in - the copy and its build, the language, the kind of
   phone and how the app was opened, the screen - and nothing they ever wrote
   into it: no name, no entries, nothing stored.

   The build is the document's own Last-Modified, which Pages sets on every
   deploy: the file carries no version number, and a second one kept by hand
   is a number that goes stale. The subject and the technical lines stay
   English because they are read by us, and one subject keeps every language
   in one thread of the inbox; the sentence above them is the reader's.

   pplOpenExt is what the people sheet opens WhatsApp and the dialer with: in
   the phone shells a non-app address is handed to the system, which is what
   makes mailto: open Mail there rather than nothing. */
var FB_MAIL='hello.betterme.app@gmail.com';   // i18n-exempt: an address
function fbTech(){
  var C=window.Capacitor,nat=!!(C&&C.isNativePlatform&&C.isNativePlatform()),ua=navigator.userAgent||'',m;
  var os=(/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1))?'iOS':/Android/.test(ua)?'Android':'desktop';   // i18n-exempt: read by us, not shown
  if(os==='iOS'&&(m=ua.match(/OS (\d+)[_.](\d+)/)))os+=' '+m[1]+'.'+m[2];
  else if(os==='Android'&&(m=ua.match(/Android (\d+(?:\.\d+)?)/)))os+=' '+m[1];
  var sa=!!((window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true);
  var how=nat?'native shell':sa?'home screen':'browser';   // i18n-exempt: read by us, not shown
  /* with no Last-Modified header (a local server, maybe the shell) the
     browser answers "now", which is not a build: then say nothing */
  var lm=new Date(document.lastModified),lt=lm.getTime();
  var built=(isNaN(lt)||Math.abs(Date.now()-lt)<120000)?'':lm.toISOString().slice(0,16).replace('T',' ')+' UTC';   // i18n-exempt: read by us, not shown
  return ['App: Olimei '+(window.__DEV__?'dev':'stable')+(built?', built '+built:''),   // i18n-exempt: read by us, not shown
    'Language: '+appLang(),   // i18n-exempt: read by us, not shown
    'Platform: '+os+', '+how,   // i18n-exempt: read by us, not shown
    'Screen: '+screen.width+'x'+screen.height+' @'+(window.devicePixelRatio||1)+'x, window '+innerWidth+'x'+innerHeight   // i18n-exempt: read by us, not shown
  ].join('\n');
}
function fbMailUrl(){
  var body='\n\n\n\n————————\n'+_t('מתחת לקו: פרטים טכניים שעוזרים לנו להבין, בלי שום מידע אישי.')+'\n'+fbTech()+'\n';
  return 'mailto:'+FB_MAIL+'?subject='+encodeURIComponent('Olimei feedback')+'&body='+encodeURIComponent(body);   // i18n-exempt: one subject for every language, read by us
}
function fbOpen(){pplOpenExt(fbMailUrl());}
`);

/* ── 2. the words, in every language ── */
const K1 = 'כתוב לנו';
const K2 = 'מה מבלבל, מה חסר, מה טוב. אנחנו קוראים כל הודעה.';
const K3 = 'מתחת לקו: פרטים טכניים שעוזרים לנו להבין, בלי שום מידע אישי.';
const W = {
  'data/lang/en.json': ['Write to us', "What's confusing, what's missing, what works. We read every message.", 'Below the line: technical details that help us understand. No personal information.'],
  'data/lang/de.json': ['Schreib uns', 'Was verwirrt, was fehlt, was funktioniert. Wir lesen jede Nachricht.', 'Unter der Linie: technische Angaben, die uns helfen zu verstehen. Keine persönlichen Daten.'],
  'data/lang/fr.json': ['Écris-nous', 'Ce qui est flou, ce qui manque, ce qui marche. Nous lisons chaque message.', 'Sous la ligne : des détails techniques qui nous aident à comprendre. Aucune donnée personnelle.'],
  'data/lang/it.json': ['Scrivici', 'Cosa confonde, cosa manca, cosa funziona. Leggiamo ogni messaggio.', 'Sotto la linea: dettagli tecnici che ci aiutano a capire. Nessun dato personale.'],
  'data/lang/es.json': ['Escríbenos', 'Lo que confunde, lo que falta, lo que funciona. Leemos cada mensaje.', 'Debajo de la línea: datos técnicos que nos ayudan a entender. Ningún dato personal.'],
  'data/lang/pt.json': ['Escreva para a gente', 'O que confunde, o que falta, o que funciona. Lemos todas as mensagens.', 'Abaixo da linha: detalhes técnicos que nos ajudam a entender. Nenhum dado pessoal.'],
  'data/lang/ar.json': ['اكتب لنا', 'ما يربك، وما ينقص، وما ينجح. نقرأ كل رسالة.', 'تحت الخط: تفاصيل تقنية تساعدنا على الفهم، دون أي معلومات شخصية.'],
  'data/lang/ja.json': ['ご意見を送る', 'わかりにくい点、足りない点、良かった点。メッセージはすべて読んでいます。', '線の下は、状況を把握するための技術的な情報です。個人情報は含まれません。'],
  'data/lang/zh-Hans.json': ['给我们写信', '哪里让人困惑，缺了什么，什么好用。每一封我们都会读。', '横线以下是帮助我们了解情况的技术信息，不含任何个人信息。'],
  'data/lang/zh-Hant.json': ['寫信給我們', '哪裡讓人困惑、缺了什麼、什麼好用。每一封我們都會讀。', '橫線以下是幫助我們了解狀況的技術資訊，不含任何個人資訊。'],
  /* the two that address her: only the title does */
  'data/he-f.json': ['כתבי לנו'],
  'data/he-x.json': ['כתבו לנו'],
  'data/gender/ar.json': ['اكتبي لنا'],
};
const KEYS = [K1, K2, K3];

/* ── apply / undo ── */
let s = fs.readFileSync(F, 'utf8');
const before = s;
/* a checkout under core.autocrlf has CRLF in the working copy: match it */
const nl = /\r\n/.test(s) ? (x) => x.replace(/\r?\n/g, '\r\n') : (x) => x;
for (const [a0, b0] of P) {
  const a = nl(a0), b = nl(b0);
  const [from, to] = UNDO ? [b, a] : [a, b];
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error(`anchor found ${n} times, expected 1:\n${from.slice(0, 120)}`); process.exit(1); }
  s = s.replace(from, () => to);
}
for (const [file, vals] of Object.entries(W)) {
  const src = fs.readFileSync(file, 'utf8');
  const ind = src.match(/^\{\r?\n( +)/)[1].length;
  const d = JSON.parse(src);
  vals.forEach((v, i) => {
    const k = KEYS[i];
    if (UNDO) { if (!(k in d)) { console.error(`${file}: ${k} not there to undo`); process.exit(1); } delete d[k]; }
    else { if (k in d) { console.error(`${file}: ${k} already answered`); process.exit(1); } d[k] = v; }
  });
  fs.writeFileSync(file, JSON.stringify(d, null, ind) + (src.endsWith('\n') ? '\n' : ''));
}
fs.writeFileSync(F, s);
console.log((UNDO ? 'undone' : 'applied') + `: ${P.length} edit(s) to ${F}, ${Object.keys(W).length} dictionaries; ${before.length} -> ${s.length} chars`);
