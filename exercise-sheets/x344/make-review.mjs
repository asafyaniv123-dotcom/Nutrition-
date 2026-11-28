// node exercise-sheets/x344/make-review.mjs - builds review.html for x344 (frame 1 approved, frame 2 + loop), every image and the loop embedded
//   as base64 (phones showed "?" for side files)
import fs from 'node:fs';
const d = 'exercise-sheets/x344/';
const b = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(d + f).toString('base64');
const v = (f) => 'data:video/mp4;base64,' + fs.readFileSync(d + f).toString('base64');
const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>x344 - גשר ישבן עם רגליים מוגבהות - לולאה</title>
<style>body{margin:0;background:#1a1410;color:#f3e6d6;font:16px/1.6 system-ui,sans-serif;padding:16px;max-width:900px;margin:auto}
img,video{width:100%;border-radius:10px;display:block}h1{font-size:20px}h2{font-size:17px;margin-top:28px}
.row{direction:ltr;display:flex;justify-content:space-between;font-size:13px;color:#c9b49a;margin:4px 2px}
.pair{direction:ltr;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ok{color:#9fd49a}.bad{color:#f0a08a}ul{padding-inline-start:20px}</style></head><body>
<h1>x344 · גשר ישבן עם רגליים מוגבהות · הלולאה</h1>
<p>פריים 1 אושר בשם (28.11). מחכה לאישור הסופי שלך לפני dev ויציב.</p>
<h2>הלולאה</h2><video src="${v('stagec/anim.mp4')}" autoplay loop muted playsinline></video>
<h2>שני הפריימים</h2><div class="row"><span>פריים 1 (התחלה)</span><span>פריים 2 (סוף)</span></div>
<div class="pair"><img src="${b('stagec/start.jpg')}" alt="start"><img src="${b('stagec/end.jpg')}" alt="end"></div>
<h2>הרפרנס שלך (סוף) מול שלנו</h2><div class="row"><span>הרפרנס</span><span>שלנו</span></div><img src="${b('stage-b-check.jpg')}" alt="ref end vs ours">
<h2>הבדיקות</h2><ul>
<li class="ok">ref-gate פריים 2: PASS (הנחיה e1a99b1c6211)</li>
<li class="ok">contact-check: PASS - ראש 0.6, נעליים על הקופסה 1.3, קופסה 0.2, מזרן 0.5 פיקסלים (סף 6)</li>
<li class="ok">rom-check: PASS - מותן 71% מהמסלול של הרפרנס, ברך 69%, באותו כיוון (16° ו-22°), ונוחת 0.070 מהמקום שלו (סף 0.10). בגובה בלבד האגן עלה 80% ממה שעלה אצלך</li>
<li class="ok">tone-check: PASS בשני הפריימים (רוויה 0.783 / 0.788, hiHue 37.3 / 36.1)</li>
<li class="ok">סוליות נעולות בקוד: הפרש 0.003/255. ספירת גפיים: 2 זרועות, 2 רגליים, הידיים ריקות</li>
<li class="ok">הזרועות: הזרוע העליונה והמרפק נשארו על המזרן; האמות עלו עם המותן כי הידיים מונחות עליו - כמו ברפרנס</li>
<li class="bad">בדיקה 10 (המעבר) - לא עוברת: באמצע המעבר רואים ירך שקופה וחלשה של תנוחת ההתחלה (הפריים למטה). זה מה שהטבלה אומרת לתקן בתנוחת אמצע + gif-seq, שעולה קרדיט נוסף</li>
<li>הגו קצת פחות ישר מאצלך: גו 37° וירך 53°, אצלך 43° ו-51°</li></ul>
<h2>אמצע המעבר (פריים 20)</h2><img src="${b('stagec/mid-f20.jpg')}" alt="mid transition">
<p>קרדיטים: 2 סה״כ (פריים 1 + פריים 2).</p></body></html>`;
fs.writeFileSync(d + 'review.html', html);
console.log('review.html', html.length);
