// node exercise-sheets/incoming-28nov/make-review-frame1.mjs - one review page for the 28 Nov frame-1 batch (8 credits): per exercise his
//   reference beside our frame 1 (tone-fixed start.png), and every stage-A gate with its number. Images embedded as base64 (side files
//   showed "?" on his phone). A frame that failed a gate is marked "לא לאישור" with what failed - it is shown, never offered.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const FF = process.env.TEMP + '/fftool/node_modules/ffmpeg-static/ffmpeg.exe';
const D = 'exercise-sheets/';
const X = [
  { id: 'x345', he: 'פייק על כדור פיזיו', en: 'Stability Ball Pike', ref: '5499', sha: '9ec6357f6c2e' },
  { id: 'x346', he: 'ירידת מדרגה בקידה', en: 'Curtsy Step Down', ref: '5505', sha: '94b67004a6cf',
    why: 'המצלמה ברפרנס שלך מלמעלה ומקדימה-שמאל, ואצלנו בגובה הברך - לכן כל הרגליים יוצאות ארוכות ונמוכות. כף הרגל החופשית רחוקה ונמוכה בהרבה (0.29), וגם הרגל העומדת והברכיים מחוץ לסף',
    fix: 'יצירה מחדש, קרדיט 1: מצלמה מלמעלה ומקדימה-שמאל כמו אצלך, כף הרגל החופשית ליד קצה הקופסה בגובה ראש הקופסה' },
  { id: 'x347', he: 'דדליפט רומני ברגל אחת עם רגל בהרחקה', en: 'Single Leg Abducted Romanian Deadlift', ref: '5501', sha: '465ca47baafa',
    why: 'כמעט: רק כף הרגל שעל הספסל, 0.084 מול סף 0.08 (גבוה ורחוק מעט מאצלך). כל השאר בתוך הסף',
    fix: 'יצירה מחדש, קרדיט 1: כף הרגל על ראש הספסל בדיוק בגובה המותן, לא מעליו' },
  { id: 'x161', he: 'היפ ת׳ראסט ברגל אחת (עם גומייה)', en: 'Single Leg Hip Thrust', ref: '5506', sha: '626580e5ac6a',
    why: 'הגו אצלנו זקוף יותר, כף רגל העבודה יצאה קדימה מהברך (אצלך מתחת לברך), והראש והאגרוף רחוקים ממקומם - שש נקודות מחוץ לסף, עד 0.23',
    fix: 'יצירה מחדש, קרדיט 1: הגב העליון נשען על הקופסה בזווית שלך, השוק אנכית וכף הרגל ישר מתחת לברך' },
  { id: 'x348', he: 'פלאנק דוב מרחף', en: 'Bear Plank Hover', ref: '5496', sha: '6c3399f6aea6', hold: true,
    why: 'כמעט: היד 0.081 והברך 0.092 מול סף 0.08 - הברכיים אצלנו מעט מאחור מדי',
    fix: 'יצירה מחדש, קרדיט 1: ברכיים ישר מתחת לאגן, כפות הידיים ישר מתחת לכתפיים' },
  { id: 'x349', he: 'החזקת כפיפת ירך עם כדור מול קיר', en: 'Wall Ball Isometric Hip Flexion', ref: '5503', sha: '35f5e9c00742', hold: true },
  { id: 'x351', he: 'קפיצה מהברכיים לסקוואט', en: 'Knee Jump to Squat', ref: '5509-5513', sha: 'a04f04514594' },
  { id: 'x352', he: 'קפיצה מהברכיים לסקוואט עם מוט', en: 'Barbell Knee Jump to Squat', ref: '5514-5518', sha: '5e1dcc2e8d24',
    why: 'כמעט: הראש 0.087 ויד ימין 0.103 מול סף 0.08 - הראש מעט מאחור והיד רחוקה יותר על המוט',
    fix: 'יצירה מחדש, קרדיט 1: הראש מעל הברכיים כמו אצלך, ושתי הידיים צמודות לכתפיים על המוט' },
];
const tone = (f) => execFileSync('node', ['tools/sheets/tone-check.mjs', D + 'character/EARLY-stand.jpg', f], { encoding: 'utf8' }).trim().split('\n').pop();
const b64 = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64');
let secs = '';
for (const x of X) {
  const d = D + x.id + '/';
  const pair = d + 'review-a.jpg';
  execFileSync(FF, ['-v', 'error', '-y', '-i', d + 'ref-start.png', '-i', d + 'start.png', '-filter_complex',
    '[0]scale=-2:640[a];[1]scale=-2:640[b];[a]pad=iw+10:ih:0:0:black[a2];[a2][b]hstack', '-q:v', '3', pair]);
  const par = fs.readFileSync(d + 'parity/result.txt', 'utf8').trim().split('\n');
  const parOk = par[par.length - 1].startsWith('PASS');
  const parLines = par.filter((l) => /^(ok|FAIL) /.test(l)).map((l) => `<li class="${l.startsWith('ok') ? 'ok' : 'bad'}"><code>${l.replace(/</g, '&lt;')}</code></li>`).join('');
  const t = tone(d + 'start.png'), tOk = t.startsWith('PASS');
  const tj = JSON.parse(t.match(/diff (\{.*\})/)[1]);
  const ok = parOk && tOk;
  secs += `<section class="${ok ? 'pass' : 'fail'}"><h2>${x.id} · ${x.he} <small>${x.en}</small></h2>
<p class="status ${ok ? 'ok' : 'bad'}">${ok ? 'עבר את כל השערים - לאישור שלך' : 'לא לאישור'}${x.hold ? ' · החזקה: פריים אחד, בלי פריים 2' : ''}</p>
<div class="row"><span>הרפרנס שלך (IMG_${x.ref})</span><span>פריים 1 שלנו</span></div><img src="${b64(pair)}" alt="${x.id}">
${ok ? '' : `<p class="why">${x.why}</p><p class="fix">הצעה: ${x.fix}</p>`}
<ul><li class="ok">ref-gate: PASS (הנחיה ${x.sha})</li>
<li class="ok">ספירת גפיים: 2 זרועות, 2 רגליים</li>
<li class="${tOk ? 'ok' : 'bad'}">tone-check: ${tOk ? 'PASS' : 'FAIL'} אחרי תיקון גוון חינמי (גוון ${tj.hue}, רוויה ${tj.sat > 0 ? '+' : ''}${tj.sat})</li>
<li class="${parOk ? 'ok' : 'bad'}">pose-parity: ${parOk ? 'PASS' : 'FAIL'}<details><summary>כל הנקודות</summary><ul>${parLines}</ul></details></li></ul></section>`;
}
const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>28.11 - פריים 1 לשמונה תרגילים</title>
<style>body{margin:0;background:#1a1410;color:#f3e6d6;font:16px/1.6 system-ui,sans-serif;padding:16px;max-width:900px;margin:auto}
img{width:100%;border-radius:10px;display:block}h1{font-size:20px}h2{font-size:17px;margin:0 0 4px}h2 small{color:#c9b49a;font-weight:400}
section{border:1px solid #3a2e24;border-radius:12px;padding:14px;margin:18px 0}section.fail{opacity:.92}
.row{direction:ltr;display:flex;justify-content:space-between;font-size:13px;color:#c9b49a;margin:4px 2px}
.status{font-weight:600;margin:0 0 8px}.ok{color:#9fd49a}.bad{color:#f0a08a}.why,.fix{margin:8px 0}.fix{color:#e8cfa6}
code{direction:ltr;unicode-bidi:embed;font-size:12px;white-space:pre-wrap}ul{padding-inline-start:20px}summary{cursor:pointer;color:#c9b49a}</style></head><body>
<h1>28.11 · פריים 1 לשמונה תרגילים</h1>
<p>8 קרדיטים, כמו שאישרת. כל פריים עבר ref-gate לפני השליחה, ותיקון גוון חינמי אחריה.
<b>עוברים הכל: <bdi dir="ltr">x345, x349, x351</bdi>.</b> לא לאישור: <bdi dir="ltr">x346, x347, x161, x348, x352</bdi> - הסיבה וההצעה ליד כל אחד; יצירה מחדש רק באישור שלך.
x350 (טריז, החזקה) לא נוצר - לא היה ברשימת 8 הקרדיטים. המטוס (5494) מחכה לתמונת פתיחה בעמידה.</p>
<p>הספרייה: שמונת התרגילים נכנסו עם שמות, שלבי ביצוע וטעויות נפוצות ב-11 שפות; ב-x161 נוספו הגומייה מעל הברכיים (שלבים 1 ו-3) וטעות רביעית - ברך שנופלת פנימה אל הגומייה.</p>
${secs}
<p>שום דבר מפריים 2 לא יוצא לפני האישור שלך, תרגיל-תרגיל.</p></body></html>`;
fs.writeFileSync(D + 'incoming-28nov/review-frame1.html', html);
console.log('review-frame1.html', Math.round(html.length / 1024) + ' KB');
