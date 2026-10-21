/* After the first-run rebuild (21 Oct 2026):
 *  1. drop the old door's strings that nothing asks for any more, from every
 *     language file (only those ten, named, never a sweep);
 *  2. answer the new strings in the feminine Hebrew overlay, by hand -
 *     data/he-f.json must never be rebuilt (the builder drops hand answers).
 *   node tools/finish-first-run-lang.mjs */
import fs from 'fs';
const GONE = [
  'אלה יהיו מה שמופיע מסביב לסיום היום. אפשר לשנות בכל רגע.', 'במה בא לך להתרכז?',
  'זה הדבר היחיד שהאפליקציה תעשה מיוזמתה.', 'זה יסומן לך מראש בשאלה הבאה.',
  'זו אפליקציה שעוזרת לעצור בסוף היום ולהסתכל עליו. כל מה שנרשם בה נשאר על הטלפון הזה בלבד.',
  'מה הביא אותך לכאן?', 'מתי להזכיר לך לעצור?', 'נדלג כרגע',
];
const t = JSON.parse(fs.readFileSync('data/lang/_template.json', 'utf8'));
const write = (f, o, raw) => {
  const indent = (raw.match(/\n([ \t]+)"/) || [, '  '])[1];
  fs.writeFileSync(f, JSON.stringify(o, null, indent) + (raw.endsWith('\n') ? '\n' : ''));
};
let dropped = 0;
for (const f of fs.readdirSync('data/lang').filter((x) => x.endsWith('.json') && x !== '_template.json')) {
  const p = 'data/lang/' + f, raw = fs.readFileSync(p, 'utf8'), o = JSON.parse(raw);
  /* the ten named above, plus anything else the template no longer asks for -
     printed, so a surprise would be seen */
  for (const k of Object.keys(o)) if (!(k in t)) { if (!GONE.includes(k)) console.log('  also not asked (' + f + '): ' + k); delete o[k]; dropped++; }
  write(p, o, raw);
}
const F = {
  'בחר כמה שתרצה. מה שתבחר יופיע סביב סיום היום, ואפשר לשנות בכל רגע.': 'בחרי כמה שתרצי. מה שתבחרי יופיע סביב סיום היום, ואפשר לשנות בכל רגע.',
  'את כל זה עושים בשאלון קצר בסוף היום. אני שואל, אתה עונה, וזה הכול.': 'את כל זה עושים בשאלון קצר בסוף היום. אני שואל, את עונה, וזה הכול.',
  'באיזו שעה תרצה שאזכיר לך?': 'באיזו שעה תרצי שאזכיר לך?',
  'ועכשיו, בוא נסכם יחד את היום הראשון שלך. שתי שאלות קטנות.': 'ועכשיו, בואי נסכם יחד את היום הראשון שלך. שתי שאלות קטנות.',
  'בוא': 'בואי',
  'כתוב כאן…': 'כתבי כאן…',
  'רואה איך הבאר התמלאה? כך היא תיראה בכל ערב שתסכם.': 'רואה איך הבאר התמלאה? כך היא תיראה בכל ערב שתסכמי.',
  'כל האזורים שבחרת יושבים עליה. סובב אותה באגודל, ולחיצה על אזור פותחת אותו.': 'כל האזורים שבחרת יושבים עליה. סובבי אותה באגודל, ולחיצה על אזור פותחת אותו.',
  'כל ערב, כשתסכם את היום, היא מתמלאת באור. זה הלב של הכול.': 'כל ערב, כשתסכמי את היום, היא מתמלאת באור. זה הלב של הכול.',
  'השעות מסביב, הדברים שבלו״ז כנקודות צבעוניות, והאור הכתום מראה איפה אתה עכשיו.': 'השעות מסביב, הדברים שבלו״ז כנקודות צבעוניות, והאור הכתום מראה איפה את עכשיו.',
  'התשובות נשמרות ונהיות תמונה של מי שאתה': 'התשובות נשמרות ונהיות תמונה של מי שאת',
};
const hp = 'data/he-f.json', hraw = fs.readFileSync(hp, 'utf8'), h = JSON.parse(hraw);
for (const [k, v] of Object.entries(F)) h[k] = v;
write(hp, h, hraw);
console.log('dropped ' + dropped + ' unasked answers; ' + Object.keys(F).length + ' feminine answers written');
