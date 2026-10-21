/* Writes review/first-run-built/index.html from the photos the walk took
 * (tools/test-first-run.mjs), so the page shows exactly what was driven. */
import fs from 'fs';
const R = 'review/first-run-built';
const CAP = {
  welcome: 'ברוכים הבאים', name: 'בים שואל את השם', 'name-typed': 'השם מוקלד', gender: 'איך לפנות', areas: 'מה חשוב לך',
  'areas-picked': 'נבחרו שניים', why: 'בשביל מה אני כאן', time: 'באיזו שעה', timeok: 'אזכיר לך', mood: 'איך הרגשת',
  moment: 'הרגע הכי טוב', day1: 'היום הראשון', remind: 'להזכיר לך מחר?', 'tour-1': 'הסיור: החוגה', 'tour-2': 'הסיור: הבאר',
  'tour-3': 'הסיור: השפה', 'tour-4': 'הסיור: כותבים', home: 'המסך הראשי', 'area-nutrition': 'פעם ראשונה בתזונה',
};
const row = (d) => fs.readdirSync(R + '/' + d).filter((f) => f.endsWith('.jpg')).sort().map((f) => {
  const k = f.replace(/^\d+-/, '').replace('.jpg', '');
  return `<figure><img loading="lazy" src="${d}/${f}" alt=""><figcaption>${CAP[k] || k}</figcaption></figure>`;
}).join('');
fs.writeFileSync(R + '/index.html', `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>הכניסה החדשה, בנויה באפליקציה</title>
<style>body{margin:0;background:#ece3d4;color:#3a3530;font:16px/1.65 Assistant,"Segoe UI",Arial,sans-serif}
main{max-width:1240px;margin:0 auto;padding:28px 16px 60px}h1{font-size:26px;margin:0 0 6px}h2{font-size:20px;margin:30px 0 8px}
.lead{color:#5f5852;max-width:820px;margin:0 0 10px}.row{display:flex;gap:10px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x mandatory}
figure{margin:0;flex:0 0 200px;scroll-snap-align:start}figure img{width:200px;border-radius:14px;display:block;box-shadow:0 4px 14px rgba(120,90,50,.22)}
figcaption{font-size:13px;font-weight:700;color:#5f5852;text-align:center;margin-top:6px}
ul{max-width:820px;padding-inline-start:22px}li{margin-bottom:6px}</style></head><body><main>
<h1>הכניסה החדשה, בנויה באפליקציה עצמה</h1>
<p class="lead">אלה לא הדמיות. אלה צילומים של האפליקציה האמיתית, שנלקחו בזמן שבדיקה אוטומטית עברה על כל הדרך כמו משתמשת חדשה: מגעים אמיתיים בכפתורים, הקלדה אמיתית של שם ושל רגע, ובסוף בדיקה של מה נשמר. ה־dev עדיין לא השתנה. זה בענף נפרד, ומחכה לאישור שלך.</p>
<ul>
<li>נשמרים: השם, הלשון, האזורים, שעת התזכורת (מכובה אם בחרה "לא עכשיו"), והסיכום הראשון: מצב הרוח והרגע הכי טוב.</li>
<li>הסיור והכרטיסים באזורים מופיעים פעם אחת, ורק למי שנכנסה דרך הכניסה החדשה. מי שכבר משתמש באפליקציה, אתה והמשתמשת הראשונה, לא יראה אותם.</li>
<li>כל המילים מתורגמות ל־11 השפות, כולל ערבית מימין לשמאל, והלשון הנקבית בעברית.</li>
</ul>
<h2>עברית, טלפון גבוה, שעת הזהב</h2><div class="row">${row('he-844')}</div>
<h2>English, טלפון עם שורות דפדפן, ערב</h2><div class="row">${row('en-660')}</div>
<h2>العربية, טלפון עם שורות דפדפן, בוקר</h2><div class="row">${row('ar-660')}</div>
</main></body></html>`);
console.log('page written');
