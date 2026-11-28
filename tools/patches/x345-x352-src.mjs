// node tools/patches/x345-x352-src.mjs - writes Asaf's 28 Nov exercises (x345-x352) into the build's SOURCE files, and the band into x161:
//   rows in build-exercises.mjs, names in exercise-names-3.mjs, Hebrew and English steps in exercise-howto(-en).mjs, families.
//   Run once; it refuses to run twice. The library itself is changed by x345-x352-add.mjs, not by a rebuild.
import fs from 'node:fs';
const rd = (f) => fs.readFileSync(f, 'utf8'), wr = (f, s) => fs.writeFileSync(f, s);
// Line endings are left as they are: core.autocrlf checks some of these files out CRLF and one is mixed. An anchor written with \n
// is tried as written and then with \r\n, and the inserted text takes the ending of the anchor it matched.
const once = (s, a, b, f) => {
  for (const nl of ['\n', '\r\n']) {
    const A = a.replace(/\n/g, nl);
    if (s.split(A).length === 2) return s.replace(A, () => b.replace(/\n/g, nl));
  }
  throw new Error(f + ': anchor not found exactly once: ' + a.slice(0, 60));
};

// ── rows ──
let B = rd('tools/build-exercises.mjs');
if (B.includes("'x345'")) throw new Error('already applied');
const lastRow = "'x344']";
B = once(B, lastRow + '\n];', lastRow + `,
/* x345-x352 from Asaf's 28 Nov photos. x348 and x349 and x350 are holds: one frame, no movement. */
['פייק על כדור פיזיו',[M.abs,M.shoulders],[Q.ball],'Stability Ball Pike',['פייק על כדור','פייק בכדור']],
['ירידת מדרגה בקידה',[M.quads,M.glutes],[Q.box,Q.db],'Curtsy Step Down',['ירידת מדרגה אלכסונית','קרטסי סטפ דאון']],
['דדליפט רומני ברגל אחת עם רגל בהרחקה',[M.hams,M.glutes],[Q.db,Q.bench],'Single Leg Abducted Romanian Deadlift',['דדליפט רגל אחת עם רגל על ספסל']],
['פלאנק דוב מרחף',[M.abs,M.shoulders],[Q.mat],'Bear Plank Hover',['בר פלאנק','דוב מרחף','ברכיים מרחפות']],
['החזקת כפיפת ירך עם כדור מול קיר',[M.abs],[Q.ball],'Wall Ball Isometric Hip Flexion',['ברך לכדור מול קיר']],
['החזקת סקוואט מפוסק על טריז',[M.quads,M.glutes],[Q.bw],'Wedge Split Squat Hold',['ספליט סקוואט איזומטרי','החזקה בעמידה מפוסקת']],
['קפיצה מהברכיים לסקוואט',[M.quads,M.glutes],[Q.mat],'Knee Jump to Squat',['קפיצת ברכיים','ניי ג׳אמפ']],
['קפיצה מהברכיים לסקוואט עם מוט',[M.quads,M.glutes],[Q.bar],'Barbell Knee Jump to Squat',['קפיצת ברכיים עם מוט']]
];`, 'build rows');
// x161: the band above the knees (Asaf, 28 Nov)
B = once(B, "['היפ ת׳ראסט ברגל אחת',M.glutes,[Q.bw],'Single Leg Hip Thrust',[]],", "['היפ ת׳ראסט ברגל אחת',M.glutes,[Q.bw,Q.band],'Single Leg Hip Thrust',[]],", 'x161 row');
wr('tools/build-exercises.mjs', B);

// ── names ──
let N = rd('tools/exercise-names-3.mjs');
const nl = '\n';
N = once(N, nl + '};', nl + [
  `'Stability Ball Pike':{de:'Pike auf dem Gymnastikball',es:'Pike en fitball',fr:'Pike sur ballon de gym',it:'Pike sulla fitball',pt:'Pike na bola suíça',ja:'バランスボール・パイク','zh-Hans':'瑞士球屈体','zh-Hant':'瑞士球屈體',ar:'رفع الحوض على كرة التوازن'},`,
  `'Curtsy Step Down':{de:'Curtsy-Step-down',es:'Bajada de escalón en reverencia',fr:'Descente de marche en révérence',it:'Discesa dal gradino a inchino',pt:'Descida do step em reverência',ja:'カーテシー・ステップダウン','zh-Hans':'屈膝礼下台阶','zh-Hant':'屈膝禮下台階',ar:'النزول عن الدرجة بخطوة الانحناءة'},`,
  `'Single Leg Abducted Romanian Deadlift':{de:'Einbeiniges Rumänisches Kreuzheben mit abgespreiztem Bein',es:'Peso muerto rumano a una pierna con pierna en abducción',fr:'Soulevé de terre roumain unijambe, jambe en abduction',it:'Stacco rumeno su una gamba con gamba abdotta',pt:'Stiff unilateral com perna abduzida',ja:'片脚外転ルーマニアンデッドリフト','zh-Hans':'单腿外展罗马尼亚硬拉','zh-Hant':'單腿外展羅馬尼亞硬舉',ar:'الرفعة الرومانية برجل واحدة والأخرى مبعدة'},`,
  `'Bear Plank Hover':{de:'Bärenstand mit schwebenden Knien',es:'Plancha de oso con rodillas suspendidas',fr:'Gainage de l’ours genoux décollés',it:'Plank dell’orso con ginocchia sollevate',pt:'Prancha do urso com joelhos suspensos',ja:'ベアプランク・ホバー','zh-Hans':'熊爬悬膝支撑','zh-Hant':'熊爬懸膝支撐',ar:'بلانك الدب مع تعليق الركبتين'},`,
  `'Wall Ball Isometric Hip Flexion':{de:'Isometrische Hüftbeugung mit Ball an der Wand',es:'Flexión de cadera isométrica con balón en la pared',fr:'Flexion de hanche isométrique avec ballon au mur',it:'Flessione dell’anca isometrica con palla al muro',pt:'Flexão de quadril isométrica com bola na parede',ja:'ウォールボール・アイソメトリック股関節屈曲','zh-Hans':'靠墙球等长屈髋','zh-Hant':'靠牆球等長屈髖',ar:'ثني الورك الثابت بالكرة على الحائط'},`,
  `'Wedge Split Squat Hold':{de:'Gehaltene Split-Kniebeuge auf dem Keil',es:'Sentadilla búlgara isométrica en cuña',fr:'Fente statique sur cale',it:'Split squat isometrico sul cuneo',pt:'Agachamento afundo isométrico na cunha',ja:'ウェッジ・スプリットスクワット・ホールド','zh-Hans':'楔形板分腿蹲静态保持','zh-Hant':'楔形板分腿蹲靜態保持',ar:'ثبات القرفصاء المنقسمة على الإسفين'},`,
  `'Knee Jump to Squat':{de:'Kniesprung in die Kniebeuge',es:'Salto de rodillas a sentadilla',fr:'Saut à genoux vers squat',it:'Salto dalle ginocchia allo squat',pt:'Salto dos joelhos para agachamento',ja:'ニージャンプ・トゥ・スクワット','zh-Hans':'跪姿跳起成深蹲','zh-Hant':'跪姿跳起成深蹲',ar:'القفز من الركبتين إلى القرفصاء'},`,
  `'Barbell Knee Jump to Squat':{de:'Kniesprung in die Kniebeuge mit Langhantel',es:'Salto de rodillas a sentadilla con barra',fr:'Saut à genoux vers squat à la barre',it:'Salto dalle ginocchia allo squat con bilanciere',pt:'Salto dos joelhos para agachamento com barra',ja:'バーベル・ニージャンプ・トゥ・スクワット','zh-Hans':'杠铃跪姿跳起成深蹲','zh-Hant':'槓鈴跪姿跳起成深蹲',ar:'القفز من الركبتين إلى القرفصاء بالبار'},`,
].join(nl) + nl + '};', 'names');
wr('tools/exercise-names-3.mjs', N);

// ── Hebrew steps ──
const HE = {
  'פייק על כדור פיזיו': [
    ['היכנס לפלאנק על ידיים ישרות, כפות הידיים מתחת לכתפיים והשוקיים על כדור פיזיו.', 'הדק את הבטן כך שהגוף בקו ישר אחד מהראש ועד העקבים.', 'עם רגליים ישרות, הרם את האגן לכיוון התקרה וגלגל את הכדור אל הידיים עד שהגוף יוצר V הפוך.', 'הורד את האגן לאט חזרה לפלאנק וגלגל את הכדור החוצה.'],
    ['כיפוף הברכיים במקום רגליים ישרות.', 'כתפיים שבורחות אחורה מאחורי כפות הידיים.', 'גב תחתון ששוקע בחזרה לפלאנק.']],
  'ירידת מדרגה בקידה': [
    ['עמוד על רגל אחת על מדרגה נמוכה, משקולת אחת אנכית צמודה לחזה.', 'כופף את ברך הרגל העומדת והורד את הרגל החופשית מאחור ובאלכסון אל מעבר למדרגה, כמו בקידה.', 'גע בעדינות ברצפה בבהונות בלי להעביר אליהן משקל.', 'דחוף דרך העקב של הרגל העומדת וחזור לעמידה.'],
    ['ברך עומדת שנופלת פנימה.', 'נפילה על הרגל החופשית במקום ירידה בשליטה.', 'גו שנוטה הרבה קדימה.']],
  'דדליפט רומני ברגל אחת עם רגל בהרחקה': [
    ['עמוד על רגל אחת ליד ספסל גבוה והנח עליו את כף הרגל השנייה, לצד, ברגל ישרה.', 'החזק משקולת ביד אחת, היד ארוכה מול הירך.', 'כופף מהירך עם גב ישר והורד את המשקולת לאורך הרגל העומדת עד שמרגישים מתיחה בירך האחורית.', 'דחוף את האגן קדימה וחזור לעמידה זקופה, בלי להרים את כף הרגל מהספסל.'],
    ['גב שמתעגל כדי להגיע נמוך יותר.', 'ברך עומדת שמתכופפת לסקוואט.', 'הישענות על הרגל שעל הספסל במקום עבודה של הרגל העומדת.']],
  'פלאנק דוב מרחף': [
    ['עמוד על ארבע: כפות הידיים מתחת לכתפיים, הברכיים מתחת לאגן, הבהונות מקופלות.', 'הדק את הבטן והרם את הברכיים מעט מעל המזרן.', 'החזק עם גב ישר ונשימה רגועה, והברכיים מרחפות.', 'בסיום הורד בעדינות את הברכיים למזרן.'],
    ['אגן שעולה גבוה במקום גב ישר.', 'עצירת הנשימה.', 'ברכיים שזזות קדימה או אחורה.']],
  'החזקת כפיפת ירך עם כדור מול קיר': [
    ['עמוד מול קיר והנח עליו את האמות.', 'הרם ברך אחת לגובה האגן והצמד כדור פיזיו בין הברך לקיר.', 'דחוף את הברך אל הכדור והחזק, בעמידה זקופה על הרגל השנייה.', 'נשום ברצף לאורך ההחזקה, ואז הורד את הרגל לאט והחלף צד.'],
    ['נטייה אחורה במקום עמידה זקופה.', 'כדור שמחליק כי הברך הפסיקה לדחוף.', 'עיגול הגב התחתון כדי להרים את הברך גבוה יותר.']],
  'החזקת סקוואט מפוסק על טריז': [
    ['עמוד בעמידה מפוסקת, בהונות כף הרגל הקדמית על טריז והעקב על הרצפה.', 'הורד את הברך האחורית עד שהיא מרחפת מעל הרצפה, והברך הקדמית מתקדמת מעל הבהונות.', 'החזק בתחתית עם גו זקוף והמשקל על הרגל הקדמית.', 'נשום ברצף, ואז דחוף דרך הרגל הקדמית למעלה והחלף צד.'],
    ['עקב קדמי שמתרומם מהרצפה.', 'הנחת הברך האחורית על הרצפה במקום להחזיק.', 'הטיית הגו קדימה כדי להקל על ההחזקה.']],
  'קפיצה מהברכיים לסקוואט': [
    ['כרע על מזרן כשהשוקיים צמודות אליו, הישבן אל העקבים והידיים מאחור.', 'הנף את הידיים חזק קדימה ודחוף את האגן למעלה כדי להקפיץ את שתי כפות הרגליים אל מתחת לגוף.', 'נחת בסקוואט עמוק, כפות רגליים שטוחות והברכיים מעל הבהונות.', 'זנק ישר למעלה לקפיצה, נחת ברכות וחזור לכריעה לחזרה הבאה.'],
    ['נחיתה על הבהונות במקום על כף רגל שטוחה.', 'ברכיים שנופלות פנימה בנחיתה.', 'קפיצה לפני שהסקוואט יציב.']],
  'קפיצה מהברכיים לסקוואט עם מוט': [
    ['כרע על מזרן עם מוט על הגב העליון, השוקיים צמודות למזרן והישבן אל העקבים.', 'אחוז במוט חזק ודחוף את האגן למעלה בכוח כדי להקפיץ את שתי כפות הרגליים אל מתחת לגוף.', 'נחת בסקוואט עמוק, כפות רגליים שטוחות והחזה זקוף.', 'זנק למעלה לקפיצה, נחת ברכות לסקוואט וחזור לכריעה בשליטה.'],
    ['משקל שאי אפשר לנחות איתו בשליטה.', 'מוט שקופץ על הצוואר בנחיתה.', 'ברכיים שנופלות פנימה בנחיתה.']],
};
let H = rd('tools/exercise-howto.mjs');
const hl = '\n';
const q = (a) => '[' + a.map((x) => "'" + x + "'").join(',') + ']';
const heBlock = Object.entries(HE).map(([k, [s, m]]) => `'${k}':{${hl}  s:${q(s)},${hl}  m:${q(m)}}`).join(',' + hl);
H = once(H, "'דחיפה מהבהונות במקום מהעקבים.']}" + hl + '};', "'דחיפה מהבהונות במקום מהעקבים.']}," + hl + heBlock + hl + '};', 'howto he');
// x161: the band, in step 1 and 3, and the knee that caves into it as a fourth mistake
H = once(H, "'שב על הרצפה עם החלק העליון של הגב נשען על ספסל.'", "'שב על הרצפה עם החלק העליון של הגב נשען על ספסל או על קופסה מרופדת, וגומייה סביב שתי הירכיים ממש מעל הברכיים.'", 'x161 he s1');
H = once(H, "'דחוף את האגן למעלה עד קו ישר בין הברך לכתף וכווץ את הישבן.'", "'דחוף את האגן למעלה עד קו ישר בין הברך לכתף, כווץ את הישבן ודחוף את הברך החוצה נגד הגומייה.'", 'x161 he s3');
H = once(H, "'כף רגל רחוקה מדי, כך שהעבודה עוברת לירך האחורית.']}", "'כף רגל רחוקה מדי, כך שהעבודה עוברת לירך האחורית.','ברך שנופלת פנימה אל הגומייה.']}", 'x161 he k4');
wr('tools/exercise-howto.mjs', H);

// ── English steps (mixed line endings: anchor on the last entry's closing) ──
const EN = {
  'פייק על כדור פיזיו': [
    ['Get into a straight-arm plank with your hands under your shoulders and your shins on a stability ball.', 'Brace your core so your body forms one straight line from head to heels.', 'Keeping your legs straight, lift your hips towards the ceiling and roll the ball in towards your hands until your body forms an upside-down V.', 'Lower your hips slowly back to the plank, rolling the ball out again.'],
    ['Bending the knees instead of keeping the legs straight.', 'Letting the shoulders drift back behind the hands.', 'Sagging in the lower back as you return to the plank.']],
  'ירידת מדרגה בקידה': [
    ['Stand on one leg on a low box, holding one dumbbell upright against your chest.', 'Bend the standing knee and lower the free leg behind you and across, past the box, as in a curtsy.', 'Lightly tap the floor with your toes without shifting your weight onto them.', 'Drive through the heel of the standing foot to stand up again.'],
    ['Letting the standing knee cave in.', 'Dropping onto the free foot instead of lowering under control.', 'Leaning the torso far forward.']],
  'דדליפט רומני ברגל אחת עם רגל בהרחקה': [
    ['Stand on one leg beside a high bench and rest the other foot on it, out to the side with the leg straight.', 'Hold a dumbbell in one hand, the arm long in front of your thigh.', 'Hinge at the hip with a flat back and lower the dumbbell along the standing leg until you feel a stretch in the back of the thigh.', 'Drive your hips forward to stand tall again, without lifting the foot off the bench.'],
    ['Rounding the back to reach lower.', 'Bending the standing knee into a squat.', 'Leaning on the leg on the bench instead of working the standing leg.']],
  'פלאנק דוב מרחף': [
    ['Get on all fours: hands under your shoulders, knees under your hips, toes tucked under.', 'Brace your core and lift your knees just off the mat.', 'Hold with a flat back and steady breathing, the knees hovering.', 'To finish, lower your knees gently to the mat.'],
    ['Lifting the hips high instead of keeping the back flat.', 'Holding your breath.', 'Letting the knees drift forward or back.']],
  'החזקת כפיפת ירך עם כדור מול קיר': [
    ['Stand facing a wall and rest your forearms on it.', 'Lift one knee to hip height and pin a stability ball between the knee and the wall.', 'Drive the knee into the ball and hold, standing tall on the other leg.', 'Breathe steadily through the hold, then lower the leg slowly and switch sides.'],
    ['Leaning back instead of standing tall.', 'Letting the ball slip because the knee stops pushing.', 'Rounding the lower back to lift the knee higher.']],
  'החזקת סקוואט מפוסק על טריז': [
    ['Stand in a split stance with the toes of your front foot up on a wedge and the heel on the floor.', 'Lower your back knee until it hovers just above the floor, the front knee travelling forward over the toes.', 'Hold the bottom position with your torso upright and your weight on the front foot.', 'Breathe steadily, then drive up through the front foot and switch sides.'],
    ['Letting the front heel lift off the floor.', 'Resting the back knee on the floor instead of holding.', 'Leaning the torso forward to make the hold easier.']],
  'קפיצה מהברכיים לסקוואט': [
    ['Kneel on a mat with your shins flat on it, hips sitting back towards your heels and arms behind you.', 'Swing your arms forward hard and drive your hips up to pop both feet under you.', 'Land in a deep squat with your feet flat and your knees over your toes.', 'Explode straight up into a jump, land softly, and kneel back down for the next rep.'],
    ['Landing on your toes instead of flat feet.', 'Knees caving in on the landing.', 'Jumping before the squat is stable.']],
  'קפיצה מהברכיים לסקוואט עם מוט': [
    ['Kneel on a mat with a barbell across your upper back, shins flat on the mat and hips sitting back towards your heels.', 'Hold the bar firmly and drive your hips up hard to pop both feet under you.', 'Land in a deep squat with your feet flat and your chest up.', 'Drive up into a jump, land softly into a squat, and kneel back down with control.'],
    ['A load you cannot land with control.', 'The bar bouncing on your neck as you land.', 'Knees caving in on the landing.']],
};
let E = rd('tools/exercise-howto-en.mjs');
const eAnchor = "      'Pushing through the toes instead of the heels.'] }";
const qe = (a) => '[' + a.map((x) => "'" + x.replace(/'/g, "\\'") + "'").join(',\n      ') + ']';
const enBlock = Object.entries(EN).map(([k, [s, m]]) => `  '${k}': {\n  s: ${qe(s)},\n  m: ${qe(m)} }`).join(',\n');
E = once(E, eAnchor, eAnchor + ',\n' + enBlock, 'howto en');
// s3 is word for word in another hip thrust too, so steps 1-3 are one anchor
const x161a = "'Sit on the floor with your upper back resting against a bench.',\n      'One foot on the floor with the knee at a right angle, the other leg lifted.',\n      'Drive your hips up to a straight line from knee to shoulder and squeeze your glutes.'";
E = once(E, x161a, x161a.replace('against a bench.', 'against a bench or a padded box, a band around both thighs just above the knees.').replace('shoulder and squeeze your glutes.', 'shoulder, squeeze your glutes and press the working knee out against the band.'), 'x161 en s1-s3');
E = once(E, "'The foot too far out, which hands the work to the hamstrings.'", "'The foot too far out, which hands the work to the hamstrings.',\n      'The working knee caving in towards the band.'", 'x161 en k4');
wr('tools/exercise-howto-en.mjs', E);

// ── families ──
let F = rd('tools/exercise-families-data.mjs');
const fam = (name, ids, add) => {
  const re = new RegExp("(\\['" + name + "', '[^']+', \\[[^\\]]*\\], ')([0-9 ]+)'");
  const m = F.match(re); if (!m) throw new Error('family ' + name);
  F = F.replace(re, (_, a, b) => a + b + ' ' + add + "'");
};
fam('פלאנק וייצוב ליבה', '', '345 348');
fam('עליות מדרגה', '', '346');
fam('דדליפט רומני', '', '347');
fam('הרמת רגליים וברכיים', '', '349');
fam('לאנג׳', '', '350');
fam('סקוואט', '', '351 352');
wr('tools/exercise-families-data.mjs', F);
console.log('sources written');
