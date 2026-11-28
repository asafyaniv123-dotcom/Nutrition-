// node exercise-sheets/x344/make-review.mjs - builds review.html for x344 frame 1, every image embedded as base64 (phones showed "?" for side files)
import fs from 'node:fs';
const d = 'exercise-sheets/x344/';
const b = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(d + f).toString('base64');
const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>x344 - גשר ישבן עם רגליים מוגבהות - פריים 1</title>
<style>body{margin:0;background:#1a1410;color:#f3e6d6;font:16px/1.6 system-ui,sans-serif;padding:16px;max-width:900px;margin:auto}
img{width:100%;border-radius:10px;display:block}h1{font-size:20px}h2{font-size:17px;margin-top:28px}
.row{direction:ltr;display:flex;justify-content:space-between;font-size:13px;color:#c9b49a;margin:4px 2px}
.ok{color:#9fd49a}ul{padding-inline-start:20px}</style></head><body>
<h1>x344 · גשר ישבן עם רגליים מוגבהות · שלב א: פריים ההתחלה</h1>
<p>מחכה לאישור שלך בשם. פריים 2 (הסוף) ייווצר רק אחרי אישור.</p>
<h2>פריים 1</h2><img src="${b('start.jpg')}" alt="frame 1">
<h2>הרפרנס שלך מול שלנו</h2><div class="row"><span>הרפרנס (התחלה)</span><span>שלנו</span></div><img src="${b('stage-a-check.jpg')}" alt="ref vs ours">
<h2>מה יקרה בפריים 2</h2><div class="row"><span>למעלה: התחלה · למטה: סוף (הרפרנס)</span></div><img src="${b('ref-motion.jpg')}" alt="ref motion">
<h2>הבדיקות</h2><ul>
<li class="ok">ref-gate: PASS (הנחיה fe89d4e095fd)</li>
<li class="ok">pose-parity: PASS - ברך 0.054, קרסול 0.066, יד 0.025, כתף 0.032, ראש 0.015 (סף 0.08)</li>
<li class="ok">ספירת גפיים: 2 זרועות (ידיים שלובות על המותן, ריקות), 2 רגליים צמודות, הימנית קרובה למצלמה</li>
<li class="ok">גוון: PASS אחרי תיקון חינמי (רוויה 0.888 → 0.785, hiHue 37.5)</li>
<li>בלי משקולת על האגן, כמו שביקשת. העקבים על הקצה הקדמי של הקופסה, הבהונות למעלה</li>
<li>הזוהר: הישבן (השריר הראשי לפי המשפחה "היפ ת׳ראסט וגשר ישבן"), הירך האחורית מעט</li>
<li>הקופסה כהה ויש עליה תג קטן - הוא מופיע גם ברפרנס</li></ul>
<p>קרדיטים: 1 (פריים 1).</p></body></html>`;
fs.writeFileSync(d + 'review.html', html);
console.log('review.html', html.length);
