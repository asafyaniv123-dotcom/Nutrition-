/* A woman reading in Arabic, Spanish, French, Italian or Portuguese, still
 * addressed in the masculine.
 *
 * Until 30 Oct the app asked how to address the person only in Hebrew, and
 * only Hebrew had an overlay that was ever loaded. data/gender/<code>.json
 * existed for five more languages - Arabic with 177 forms, the four Romance
 * languages with four to seven - and nothing fetched them, so every one of
 * those readers was "ready", "proud" and "grateful" in the masculine, and an
 * Arabic reader was told اضغط and تريد on almost every screen.
 *
 * Wiring the overlay is half of it. The other half is that an overlay is
 * hand-made, so a key nobody answered falls through to the masculine with no
 * error anywhere: the screen simply reads as the man's. This finds those.
 *
 * WHICH SENTENCES. data/he-f.json and data/he-x.json are, between them,
 * every Hebrew sentence that addresses or describes the person - he-f the
 * ones whose Hebrew changes for a woman, he-x every one that changes for
 * "you" in the plural, which is every sentence spoken TO her. A sentence in
 * neither is about a food, an exercise or the app, and is not judged.
 *
 * WHAT COUNTS AS MASCULINE. A word, per language, that has a feminine twin
 * and only appears in the man's form: in Arabic a masculine imperative
 * (اضغط, اكتب, أضف), a masculine second-person present (تريد, تستطيع) or an
 * adjective about her (مستعد, متأكد); in the Romance languages an adjective
 * or participle that agrees with her (listo, sûr, grato, cansado). A
 * heuristic, so it carries an exemption list, and every exemption says why.
 *
 *     node tools/find-gender-gaps.mjs [root]
 *
 * root defaults to the working tree; point it at an exported older revision
 * (git archive <rev> data | tar -x -C dir) to see what it catches there.
 * Exits non-zero when it finds anything.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.argv[2] || '.';
const R = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const has = p => fs.existsSync(path.join(ROOT, p));

/* An Arabic word ends at a space, punctuation or the end - \b knows only
   Latin letters. */
const AE = '(?=$|[\\s.,،؛؟!:»")\\]…—-])';
const AS = '(?:^|[\\s«"(\\[+·•—-])';
const AR_IMP = ['اضغط', 'اكتب', 'اختر', 'احفظ', 'ابدأ', 'أضف', 'أدخل', 'أعد', 'انتقل', 'اسحب', 'جرّب', 'جرب',
  'سجّل', 'سجل', 'صوّر', 'غيّر', 'حدّد', 'ضع', 'خذ', 'قم', 'كن', 'انظر', 'ارجع', 'افتح', 'اقرأ', 'استخدم',
  'تأكّد', 'تأكد', 'تذكّر', 'اترك', 'أرسل', 'اضبط', 'امسح', 'احذف', 'الصق', 'انسخ', 'خطّط', 'اشرب', 'توقّف',
  'ركّز', 'تنفّس', 'ازفر', 'استمر', 'تابع', 'راجع', 'أكمل', 'ابحث', 'التقط', 'اسأل', 'ابق', 'ابقَ', 'صحّح',
  'اطلب', 'اعرف', 'ارفع', 'اختبر', 'حاول', 'اجعل', 'اقض', 'امش', 'اسمح', 'فكّر', 'لاحظ', 'اكتشف', 'استعد'];
const AR_PRES = ['تريد', 'تستطيع', 'تشعر', 'تحتاج', 'تفضّل', 'تفضل', 'تعرف', 'تكتب', 'تبدأ', 'تختار', 'تضيف',
  'تحفظ', 'ترى', 'تستخدم', 'تنسى', 'تقرأ', 'تأكل', 'تشرب', 'تنام', 'تتمرّن', 'تتمرن', 'تتدرّب', 'تعمل',
  'تفعل', 'تقول', 'تتذكّر', 'تجد', 'تحب', 'تحبّ', 'تبحث', 'تغيّر', 'تسجّل', 'تكمل', 'تنهي', 'ترغب', 'تودّ',
  'تود', 'تضغط', 'تلاحظ', 'تتابع', 'ترفع', 'تجرّب', 'تبني', 'تضع', 'تأخذ', 'تعود', 'تفتح', 'تغلق', 'تلبس',
  'تقصد', 'تقيس', 'تكون', 'تصبح', 'تحاول', 'تملك', 'تبدو'];
const AR_ADJ = ['مستعد', 'مستعدًا', 'متأكد', 'متأكدًا', 'متعب', 'متعبًا', 'فخور', 'فخورًا', 'ممتن', 'ممتنًا',
  'ممتنًّا', 'جاهز', 'جاهزًا', 'مبتدئ', 'متقدم', 'متقدّم', 'عائد'];
const alt = a => a.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const AR_RE = new RegExp(AS + '(?:[وف]?(?:لا )?)(' + alt(AR_IMP) + ')(?:ه|ها|هم|ني)?' + AE + '|' +
  AS + '(?:[وفل]|أ|س|ل|هل )?(' + alt(AR_PRES) + ')(?:ه|ها|هم|ني|نا)?' + AE + '|' +
  AS + '(' + alt(AR_ADJ) + ')' + AE);

/* \b knows only ASCII letters, so "né" never ends at one. Here a letter is a
   letter in any script. Only the MAN's form is listed: "segura" is not a
   gap, "seguro" is. */
const LW = words => new RegExp('(?<!\\p{L})(' + words + ')(?!\\p{L})', 'iu');
/* A participle agrees with her only when she is its subject, and the same
   word is just as often about her body, her day or the app ("Comment ton
   corps s'est-il senti", "Non sono riuscito" in Mip's voice). So a
   participle counts only shortly after a word that puts HER in the clause. */
const LC = (ctx, words) => new RegExp('(?:' + ctx + ')[^.?!;:]{0,24}?(?<!\\p{L})(' + words + ')(?!\\p{L})', 'iu');
const any = (...res) => ({ exec: s => { for (const r of res) { const m = r.exec(s); if (m) return m; } return null; } });
const MARK = {
  ar: AR_RE,
  es: any(LW('listo|seguro|cansado|orgulloso|agradecido|bienvenido|preparado|motivado|contento|avanzado|intermedio|convencido|obligado|tú mismo'),
    LC('estás |eres |quedado |estabas ', 'corto|solo')),
  fr: any(LW('prêt|sûr|fatigué|fier|reconnaissant|bienvenu|débutant|avancé|obligé|essoufflé'),
    LC('tu |t’|t\'|-tu |te ', 'arrêté|resté|né|senti|entraîné|marqué|vidé|quitté|rempli|occupé|touché|convaincu|allé|venu|passé|seul')),
  it: any(LW('pronto|sicuro|stanco|orgoglioso|grato|benvenuto|avanzato|intermedio'),
    LC('sei |ti |eri |essere ', 'allenato|fermato|riuscito|arrivato|nato|sentito|mosso|portato|rimasto|libero|dimenticato|trovato|da solo|passato')),
  pt: any(LW('seguro|cansado|orgulhoso|grato|bem-vindo|avançado|intermediário|você mesmo|si mesmo|definido|seco|obrigado'),
    LC('você |tempo |estar |está |ficar |fica ', 'sozinho')),
};
/* The masculine in MARK is the man's form in the cases above; these are the
   keys where the word is there but is not about her. Each one was read. */
const EXEMPT = {
  /* Arabic writes "you" (m.) and "she/it" with the same present tense, so
     a feminine subject reads exactly like him. Each of these was read: */
  ar: [
    'אם היית צריך לתת ליום הזה ציון — איזה ציון הוא מקבל?',   // تكون: the grade (درجة, f.)
    'הם תרגילים שהקלדת בעצמך, ולכן לא ידוע איזה שריר הם עובדים. בחירה מהספרייה תשייך אותם.', // تعمل: the muscle (عضلة, f.)
    'הסיכום השבועי שלך מוכן',                                  // جاهز: the summary is ready
    'השעון והאפליקציות שלך כבר מעדכנים את אפליקציית בריאות, אז רק אותה צריך לחבר:', // تكتب: her watch and apps
    'זה יכול להיות רגע, מקום, אדם, משהו שעשית — או פשוט תמונה שמזכירה לך את היום שעבר עליך.', // تكون: "it may be"
    'יש עוד שאלות אם בא לך אחת. אפשר גם פשוט לסיים כאן.',    // أن تنهي: تنهيَ and تنهي are one spelling
    'משהו ששינה לך את ההרגשה, את המחשבות או את המשך היום.',  // غيّر: past tense, "something changed"
    'תשובה אחת, והמספרים כאן יותאמו אליך ולא לאדם ממוצע',      // تصبح: the numbers become
  ],
  /* "Listo" / "Pronto" as the interjection "Done" - invariable */
  es: ['סיימת! שמור תוכנית', 'סיימתי', 'סיימנו'],
  pt: ['סיימת! שמור תוכנית', 'סיימתי', 'סיימנו'],
  /* "le jour venu" is the day that comes, not her */
  fr: ['כדי שאדע לברך אותך ביום הזה. אפשר גם בלי.'],
  /* "ti è rimasto": the thing stayed with her - it agrees with qualcosa */
  it: ['משהו ששמעת, קראת או חשבת ולא עזב אותך.'],
};
const masc = (code, s) => {
  const m = MARK[code].exec(s);
  return m ? (m[1] || m[2] || m[3] || m[0]).trim() : null;
};

const F = R('data/he-f.json'), X = has('data/he-x.json') ? R('data/he-x.json') : {};
const T = has('data/lang/_template.json') ? R('data/lang/_template.json') : null;
const cand = [...new Set([...Object.keys(F), ...Object.keys(X)])].filter(k => !T || k in T);

let total = 0;
const lines = [];
for (const code of ['ar', 'es', 'fr', 'it', 'pt']) {
  const L = R('data/lang/' + code + '.json');
  const O = has('data/gender/' + code + '.json') ? R('data/gender/' + code + '.json') : {};
  const ex = new Set(EXEMPT[code] || []);
  const gaps = [];
  for (const k of cand) {
    const v = L[k];
    if (v == null || k in O || ex.has(k)) continue;
    const parts = typeof v === 'string' ? [v] : Object.values(v);
    for (const s of parts) {
      const w = masc(code, s);
      if (w) { gaps.push([w, k, s]); break; }
    }
  }
  total += gaps.length;
  lines.push(code.padEnd(3) + String(gaps.length).padStart(5) + ' gap(s)   overlay holds ' + Object.keys(O).length);
  for (const [w, k, s] of gaps.slice(0, +process.env.GAPS_ALL ? 1e9 : 12))
    lines.push('      [' + w + ']  ' + s.split('\n')[0].slice(0, 70));
  if (gaps.length > 12 && !+process.env.GAPS_ALL) lines.push('      … and ' + (gaps.length - 12) + ' more');
}
console.log(lines.join('\n'));
console.log('\n' + total + ' sentence(s) that address her and still read as the man\'s, across ' + cand.length + ' that address the person.');
process.exit(total ? 1 : 0);
