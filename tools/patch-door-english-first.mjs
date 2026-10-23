/* "The first run should open in English: Welcome to Better Me, get ready to
 * become the best version of yourself - and only then the language screen"
 * (Asaf, 23 Oct). The welcome is the one screen that is not translated: it
 * is the brand's first sentence, said the same way to everyone, before they
 * have been asked which language is theirs. Left to right whatever the
 * phone's language. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`  var a=['lang','hi','name'];`, `  var a=['hi','lang','name'];`);
rep(`  if(step==='hi'){
    return '<div class="dr-hi2"><div class="w">'+_t('ברוכים הבאים ל־')+'</div><div class="n">Better Me</div>'+
      '<p>'+_t('התכוננו להפוך לגרסה הטובה ביותר של עצמכם.')+'</p>'+
      '<div class="l">'+_t('בלי חשבון. הכול נשאר על הטלפון הזה.')+'</div></div>'+
      '<button class="dr-btn" onclick="doorNext()">'+_t('נתחיל')+'</button>';
  }`, `  if(step==='hi'){
    /* ENGLISH FOR EVERYONE, by Asaf's decision: the brand's first sentence,
       before anyone has been asked which language is theirs. The next
       screen asks, and from there every word is theirs. */
    return '<div class="dr-hi2" dir="ltr" lang="en"><div class="w">Welcome to</div><div class="n">Better Me</div>'+   // i18n-exempt: the English welcome is a decision, see above
      '<p>Get ready to become the best version of yourself.</p></div>'+   // i18n-exempt: same
      '<button class="dr-btn" dir="ltr" onclick="doorNext()">Let’s begin</button>';   // i18n-exempt: same
  }`);
/* picking a language keeps you on the language screen, which is now second */
fs.writeFileSync(F, s);
console.log('patched');
