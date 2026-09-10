/* Builds data/exercises.json - the exercise list the workout screen picks from.
 *
 *   node tools/build-exercises.mjs
 *
 * Why this is written rather than fetched. tools/fetch-exercises.mjs pulls
 * wger's open database, which is the right thing to reach for: free, CC-BY-SA,
 * commercial use allowed, and every exercise carries the muscle it works and
 * the equipment it needs - the structure Hevy organises its library by and
 * that we had no way to do at all.
 *
 * But 22 of its 871 exercises have a Hebrew name, and the list is thick with
 * near-duplicates and junk: "3008 Abdominal Crunch", "Bench Dips On Floor HD",
 * "Bizeps Curls Trifecta", a few entries in Spanish. Dropping 716 of those
 * into a Hebrew app is worse than having no library, because the cost of a
 * library is the scrolling and the benefit is only in the entries you would
 * actually pick.
 *
 * So the taxonomy is wger's - the muscle names, the equipment names, the way
 * an exercise is described - and the list is written: the movements a person
 * doing this actually does, in the words they use for them. לחיצת חזה, not a
 * translation of "bench press". Where wger has the same movement its English
 * name is kept alongside, because half the gym says it in English anyway and
 * it makes the thing searchable both ways.
 *
 * ── The fifth field, and why the library felt empty ──
 *
 * It was reported that the lat pulldown was missing. It was not: it has been
 * in the list from the start, as `פולי עליון`, filed under `גב רחב`. What was
 * missing was any way to reach it. The search matched two strings - the Hebrew
 * name and the English one - as plain substrings, and an Israeli gym does not
 * speak either of them consistently. Measured against the old list:
 *
 *     פול דאון   nothing        סקווט      nothing
 *     פולדאון    nothing        בנץ פרס    nothing
 *     לט פולדאון nothing        לג פרס     nothing
 *     קרל        nothing        ביצפס      nothing
 *
 * So every entry may carry `aka`: the other words people say for it -
 * transliterations, common misspellings, the English said in Hebrew letters,
 * the machine's brand-name. Searched, never displayed, which is the same
 * contract the food table's `aka` already has.
 *
 * That is worth more than the size of the list, and it is why it comes first
 * here. The list did also grow: a gym has a Smith machine, an EZ bar, a
 * pec deck AND a converging press, three ways to hold a pulldown and four
 * angles on a curl, and a library that stops at one of each sends people to
 * type a name by hand.
 */
import fs from 'fs';
import {HOWTO} from './exercise-howto.mjs';
import {NAMES} from './exercise-names.mjs';

const M={
  chest:'חזה', back:'גב', lats:'גב רחב', traps:'טרפז', shoulders:'כתפיים',
  biceps:'יד קדמית', triceps:'יד אחורית', forearm:'אמה',
  quads:'ארבע ראשי', hams:'ירך אחורית', glutes:'ישבן', calves:'תאומים',
  /* The adductor and abductor machines stand in every gym and belong to
     neither the quadriceps nor the glutes. wger separates them and so does
     Garmin; filing the abduction machine under `ישבן` was the one placement
     in the old list that was simply wrong. */
  adduct:'מקרבים', abduct:'מרחיקים',
  abs:'בטן', obliques:'אלכסונים', lower:'גב תחתון', cardio:'אירובי'
};
const Q={
  bar:'מוט', db:'משקולות יד', kb:'קטלבל', cable:'פולי', machine:'מכונה',
  bw:'משקל גוף', bench:'ספסל', bar_pull:'מתח', band:'גומייה', ball:'כדור פיזיו',
  mat:'מזרן', card:'מכשיר אירובי',
  /* Added with the list. A Smith machine is not a barbell and an EZ bar is not
     a straight one - filtering by equipment is only useful if it matches what
     is actually standing in the room. */
  smith:'סמית׳', ez:'מוט EZ', trap:'מוט טרפז', plate:'פלטה',
  trx:'רצועות TRX', box:'מדרגה', sled:'מזחלת', rope:'חבל קרב'
};

/* name, primary muscle, equipment, English name, and the other words for it.
   Ordered within each group from the movement most people build a session
   around to the ones that finish it off. */
const RAW=[
// ── חזה ──
['לחיצת חזה במוט',M.chest,[Q.bar,Q.bench],'Barbell Bench Press',['בנץ','בנץ פרס','בנצ׳','לחיצת חזה','חזה מוט']],
['לחיצת חזה במשקולות',M.chest,[Q.db,Q.bench],'Dumbbell Bench Press',['בנץ משקולות','דמבל פרס']],
['לחיצת חזה בשיפוע חיובי',M.chest,[Q.bar,Q.bench],'Incline Bench Press',['אינקליין','שיפוע חיובי']],
['לחיצת חזה בשיפוע חיובי במשקולות',M.chest,[Q.db,Q.bench],'Incline Dumbbell Press',['אינקליין משקולות']],
['לחיצת חזה בשיפוע שלילי',M.chest,[Q.bar,Q.bench],'Decline Bench Press',['דקליין']],
['לחיצת חזה בשיפוע שלילי במשקולות',M.chest,[Q.db,Q.bench],'Decline Dumbbell Press',['דקליין משקולות']],
['לחיצת חזה במכונה',M.chest,[Q.machine],'Chest Press Machine',['צ׳סט פרס','מכונת חזה']],
['לחיצת חזה בשיפוע במכונה',M.chest,[Q.machine],'Incline Chest Press Machine',['אינקליין מכונה']],
['לחיצת חזה בסמית׳',M.chest,[Q.smith,Q.bench],'Smith Machine Bench Press',['סמית','smith']],
['לחיצת חזה על הרצפה',M.chest,[Q.bar],'Floor Press',['פלור פרס']],
['לחיצת חזה על הרצפה במשקולות',M.chest,[Q.db],'Dumbbell Floor Press',[]],
['פרפר במשקולות',M.chest,[Q.db,Q.bench],'Dumbbell Fly',['פליי','פלייז']],
['פרפר בשיפוע במשקולות',M.chest,[Q.db,Q.bench],'Incline Dumbbell Fly',[]],
['פרפר בפולי',M.chest,[Q.cable],'Cable Crossover',['קרוסאובר','קייבל פליי']],
['פרפר בפולי מלמטה למעלה',M.chest,[Q.cable],'Low to High Cable Fly',[]],
['פרפר בפולי מלמעלה למטה',M.chest,[Q.cable],'High to Low Cable Fly',[]],
['פרפר במכונה',M.chest,[Q.machine],'Pec Deck',['פק דק','פקדק']],
['שכיבות סמיכה',M.chest,[Q.bw],'Push Ups',['פושאפ','פוש אפ','שכיבות שמיכה']],
['שכיבות סמיכה בשיפוע',M.chest,[Q.bw],'Incline Push Ups',[]],
['שכיבות סמיכה בשיפוע שלילי',M.chest,[Q.bw],'Decline Push Ups',[]],
['שכיבות סמיכה רחבות',M.chest,[Q.bw],'Wide Push Ups',[]],
['מקבילים',M.chest,[Q.bw],'Dips',['דיפס','דיפ']],
['מקבילים במשקל',M.chest,[Q.bw,Q.plate],'Weighted Dips',[]],
['פולאובר',M.chest,[Q.db,Q.bench],'Dumbbell Pullover',['פול אובר']],
['לחיצת לנדמיין',M.shoulders,[Q.bar],'Landmine Press',['לנדמיין']],
['לחיצת פלטה',M.chest,[Q.plate],'Svend Press',[]],
// ── גב רחב ──
['מתח',M.lats,[Q.bar_pull],'Pull Ups',['פולאפ','פול אפ','משיכות']],
['מתח אחיזה תחתונה',M.lats,[Q.bar_pull],'Chin Ups',['צ׳ין אפ','צין אפ']],
['מתח אחיזה רחבה',M.lats,[Q.bar_pull],'Wide Grip Pull Ups',[]],
['מתח אחיזה ניטרלית',M.lats,[Q.bar_pull],'Neutral Grip Pull Ups',[]],
['מתח במשקל',M.lats,[Q.bar_pull,Q.plate],'Weighted Pull Ups',[]],
['מתח בסיוע גומייה',M.lats,[Q.bar_pull,Q.band],'Assisted Pull Ups',[]],
['מתח במכונת סיוע',M.lats,[Q.machine],'Assisted Pull Up Machine',[]],
['פולי עליון',M.lats,[Q.cable],'Lat Pulldown',['פול דאון','פולדאון','לט פולדאון','לאט פולדאון','משיכת פולי עליון','פולי גב']],
['פולי עליון אחיזה צרה',M.lats,[Q.cable],'Close Grip Pulldown',['פולדאון צר']],
['פולי עליון אחיזה רחבה',M.lats,[Q.cable],'Wide Grip Lat Pulldown',['פולדאון רחב']],
['פולי עליון אחיזה תחתונה',M.lats,[Q.cable],'Reverse Grip Pulldown',['פולדאון סופינציה']],
['פולי עליון ביד אחת',M.lats,[Q.cable],'Single Arm Lat Pulldown',[]],
['משיכת פולי בזרוע ישרה',M.lats,[Q.cable],'Straight Arm Pulldown',['סטרייט ארם']],
['משיכת גב במכונה',M.lats,[Q.machine],'Lat Pulldown Machine',[]],
// ── גב ──
['חתירה במוט',M.back,[Q.bar],'Barbell Row',['בנט אובר','חתירת מוט']],
['חתירה במוט אחיזה תחתונה',M.back,[Q.bar],'Reverse Grip Barbell Row',[]],
['חתירת פנדליי',M.back,[Q.bar],'Pendlay Row',['פנדליי']],
['חתירה במשקולת יד',M.back,[Q.db,Q.bench],'Dumbbell Row',['חתירת משקולת','one arm row']],
['חתירה בשתי משקולות',M.back,[Q.db],'Two Arm Dumbbell Row',[]],
['חתירה בתמיכת חזה',M.back,[Q.machine],'Chest Supported Row',[]],
['חתירת סיל',M.back,[Q.db,Q.bench],'Seal Row',['סיל רואו','seal row']],
['חתירה בפולי בישיבה',M.back,[Q.cable],'Seated Cable Row',['חתירת פולי','קייבל רואו']],
['חתירה בפולי ביד אחת',M.back,[Q.cable],'Single Arm Cable Row',[]],
['חתירה בפולי אחיזה רחבה',M.back,[Q.cable],'Wide Grip Cable Row',[]],
['חתירה במכונה',M.back,[Q.machine],'Machine Row',[]],
['חתירה גבוהה במכונה',M.back,[Q.machine],'Machine High Row',[]],
['חתירת T',M.back,[Q.bar],'T-Bar Row',['טי בר','t bar']],
['חתירת לנדמיין',M.back,[Q.bar],'Landmine Row',['מדואוס','meadows row']],
['חתירה הפוכה',M.back,[Q.bw],'Inverted Row',['חתירה אוסטרלית']],
['חתירה ברצועות',M.back,[Q.trx],'TRX Row',[]],
['דדליפט',M.back,[Q.bar],'Deadlift',['דד ליפט','הרמת מת','deadlift']],
['דדליפט במוט טרפז',M.back,[Q.trap],'Trap Bar Deadlift',['הקס בר','hex bar']],
['ראק פול',M.back,[Q.bar],'Rack Pull',['רק פול']],
// ── טרפז ──
['משיכת כתפיים במשקולות',M.traps,[Q.db],'Dumbbell Shrugs',['שראגס','שראג','משיכת כתפיים']],
['משיכת כתפיים במוט',M.traps,[Q.bar],'Barbell Shrugs',[]],
['משיכת כתפיים בפולי',M.traps,[Q.cable],'Cable Shrugs',[]],
['משיכת כתפיים במכונה',M.traps,[Q.machine],'Machine Shrugs',[]],
['הרמת Y',M.traps,[Q.db],'Y Raise',['ווי רייז']],
// ── גב תחתון ──
['הרמת גב',M.lower,[Q.bw],'Hyperextension',['היפרקסטנשן','אקסטנשן גב']],
['הרמת גב במשקל',M.lower,[Q.plate],'Weighted Hyperextension',[]],
['הרמת גב 45 מעלות',M.lower,[Q.machine],'45 Degree Back Extension',[]],
['גוד מורנינג',M.lower,[Q.bar],'Good Morning',['גוד מורנינגס']],
['סופרמן',M.lower,[Q.mat],'Superman',[]],
['בירד דוג',M.lower,[Q.mat],'Bird Dog',[]],
// ── כתפיים ──
['לחיצת כתפיים במוט',M.shoulders,[Q.bar],'Overhead Press',['או אייץ פי','ohp','לחיצה צבאית','מיליטרי פרס']],
['לחיצת כתפיים במשקולות',M.shoulders,[Q.db],'Dumbbell Shoulder Press',['שולדר פרס']],
['לחיצת כתפיים בישיבה',M.shoulders,[Q.db,Q.bench],'Seated Dumbbell Press',[]],
['לחיצת כתפיים במכונה',M.shoulders,[Q.machine],'Machine Shoulder Press',[]],
['לחיצת כתפיים בסמית׳',M.shoulders,[Q.smith],'Smith Machine Shoulder Press',[]],
['לחיצת ארנולד',M.shoulders,[Q.db],'Arnold Press',['ארנולד']],
['פוש פרס',M.shoulders,[Q.bar],'Push Press',[]],
['הרחקת כתף',M.shoulders,[Q.db],'Lateral Raise',['לטרל רייז','הרמות צד','פרפר צד']],
['הרחקת כתף בפולי',M.shoulders,[Q.cable],'Cable Lateral Raise',[]],
['הרחקת כתף במכונה',M.shoulders,[Q.machine],'Machine Lateral Raise',[]],
['הרחקת כתף בהטיה',M.shoulders,[Q.cable],'Leaning Cable Lateral Raise',[]],
['הרמה קדמית',M.shoulders,[Q.db],'Front Raise',['פרונט רייז','הרמה מלפנים']],
['הרמה קדמית בפלטה',M.shoulders,[Q.plate],'Plate Front Raise',[]],
['הרמה קדמית בפולי',M.shoulders,[Q.cable],'Cable Front Raise',[]],
['פרפר הפוך',M.shoulders,[Q.db],'Rear Delt Fly',['ריר דלט','פרפר אחורי']],
['פרפר הפוך במכונה',M.shoulders,[Q.machine],'Reverse Pec Deck',[]],
['פרפר הפוך בפולי',M.shoulders,[Q.cable],'Cable Rear Delt Fly',[]],
['פייס פול',M.shoulders,[Q.cable],'Face Pull',['פייספול']],
['חתירה אנכית',M.shoulders,[Q.bar],'Upright Row',['אפרייט רואו']],
['חתירה אנכית בפולי',M.shoulders,[Q.cable],'Cable Upright Row',[]],
['פתיחת גומייה',M.shoulders,[Q.band],'Band Pull Apart',['פול אפארט']],
['סיבוב חיצוני של הכתף',M.shoulders,[Q.band],'Shoulder External Rotation',['רוטטור']],
['לחיצת כתפיים בעמידת ידיים',M.shoulders,[Q.bw],'Handstand Push Up',['הנדסטנד']],
// ── יד קדמית ──
['כפיפת מרפק במוט',M.biceps,[Q.bar],'Barbell Curl',['קרל','ביצפס','בייספס','כפיפת מרפקים']],
['כפיפת מרפק במוט EZ',M.biceps,[Q.ez],'EZ Bar Curl',['אי זי','ez curl']],
['כפיפת מרפק במשקולות',M.biceps,[Q.db],'Dumbbell Curl',['קרל משקולות']],
['כפיפת פטיש',M.biceps,[Q.db],'Hammer Curl',['האמר קרל','פטיש']],
['כפיפת פטיש בחבל',M.biceps,[Q.cable],'Rope Hammer Curl',[]],
['כפיפה בסקוט',M.biceps,[Q.ez,Q.bench],'Preacher Curl',['פריצ׳ר','סקוט','preacher']],
['כפיפת מרפק בפולי',M.biceps,[Q.cable],'Cable Curl',[]],
['כפיפת מרפק בפולי מאחור',M.biceps,[Q.cable],'Bayesian Curl',[]],
['כפיפת ריכוז',M.biceps,[Q.db],'Concentration Curl',[]],
['כפיפת מרפק בשיפוע',M.biceps,[Q.db,Q.bench],'Incline Curl',[]],
['כפיפת עכביש',M.biceps,[Q.ez,Q.bench],'Spider Curl',['ספיידר קרל']],
['כפיפת מרפק הפוכה',M.biceps,[Q.ez],'Reverse Curl',[]],
['כפיפת זוטמן',M.biceps,[Q.db],'Zottman Curl',[]],
['כפיפת מרפק במכונה',M.biceps,[Q.machine],'Machine Curl',[]],
// ── יד אחורית ──
['פשיטת מרפק בפולי',M.triceps,[Q.cable],'Tricep Pushdown',['פושדאון','טרייספס','טרייסיפס','פוש דאון']],
['פשיטת מרפק בחבל',M.triceps,[Q.cable],'Rope Pushdown',['חבל טרייספס']],
['פשיטת מרפק בפולי ביד אחת',M.triceps,[Q.cable],'Single Arm Pushdown',[]],
['פשיטת מרפק בפולי אחיזה תחתונה',M.triceps,[Q.cable],'Reverse Grip Pushdown',[]],
['סקאל קראשר',M.triceps,[Q.ez,Q.bench],'Skull Crushers',['סקול קראשר','skullcrusher']],
['סקאל קראשר במשקולות',M.triceps,[Q.db,Q.bench],'Dumbbell Skull Crusher',[]],
['פשיטת מרפק מעל הראש',M.triceps,[Q.db],'Overhead Tricep Extension',[]],
['פשיטת מרפק מעל הראש בחבל',M.triceps,[Q.cable],'Overhead Rope Extension',[]],
['לחיצת חזה אחיזה צרה',M.triceps,[Q.bar,Q.bench],'Close Grip Bench Press',['קלוז גריפ']],
['מקבילים לטרייספס',M.triceps,[Q.bw],'Tricep Dips',[]],
['מקבילים על ספסל',M.triceps,[Q.bench],'Bench Dips',[]],
['בעיטת טרייספס',M.triceps,[Q.db],'Tricep Kickback',['קיקבק']],
['בעיטת טרייספס בפולי',M.triceps,[Q.cable],'Cable Kickback',[]],
['שכיבות סמיכה יהלום',M.triceps,[Q.bw],'Diamond Push Ups',['יהלום']],
['פשיטת מרפק במכונה',M.triceps,[Q.machine],'Machine Tricep Extension',[]],
// ── אמה ──
['כפיפת שורש כף יד',M.forearm,[Q.bar],'Wrist Curl',[]],
['פשיטת שורש כף יד',M.forearm,[Q.bar],'Reverse Wrist Curl',[]],
['גלגלת אמות',M.forearm,[Q.plate],'Wrist Roller',[]],
['אחיזת חוואי',M.forearm,[Q.db],'Farmers Carry',['פארמר','הליכת חוואי']],
['תלייה על המוט',M.forearm,[Q.bar_pull],'Dead Hang',[]],
// ── ארבע ראשי ──
['סקוואט',M.quads,[Q.bar],'Barbell Squat',['סקווט','סקאוט','squat']],
['סקוואט קדמי',M.quads,[Q.bar],'Front Squat',['פרונט סקוואט']],
['סקוואט גובלט',M.quads,[Q.db,Q.kb],'Goblet Squat',['גובלט','גובלט קטלבל']],
['סקוואט משקל גוף',M.quads,[Q.bw],'Bodyweight Squat',[]],
['סקוואט בסמית׳',M.quads,[Q.smith],'Smith Machine Squat',[]],
['סקוואט לקופסה',M.quads,[Q.bar,Q.box],'Box Squat',[]],
['סקוואט עם עצירה',M.quads,[Q.bar],'Pause Squat',[]],
['לחיצת רגליים',M.quads,[Q.machine],'Leg Press',['לג פרס','leg press','מכונת רגליים']],
['לחיצת רגליים ברגל אחת',M.quads,[Q.machine],'Single Leg Press',[]],
['האק סקוואט',M.quads,[Q.machine],'Hack Squat',['האק']],
['סקוואט מטוטלת',M.quads,[Q.machine],'Pendulum Squat',[]],
['סקוואט בחגורה',M.quads,[Q.machine],'Belt Squat',[]],
['פשיטת ברך',M.quads,[Q.machine],'Leg Extension',['לג אקסטנשן','אקסטנשן']],
['לאנג׳',M.quads,[Q.db],'Lunges',['לאנג','מספריים','לונג׳']],
['לאנג׳ בהליכה',M.quads,[Q.db],'Walking Lunges',[]],
['לאנג׳ לאחור',M.quads,[Q.db],'Reverse Lunge',[]],
['סקוואט בולגרי',M.quads,[Q.db,Q.bench],'Bulgarian Split Squat',['בולגרי','ספליט סקוואט']],
['עליות מדרגה',M.quads,[Q.db,Q.box],'Step Ups',['סטפ אפ']],
['ירידות מדרגה',M.quads,[Q.box],'Step Downs',[]],
['סקוואט סיסי',M.quads,[Q.bw],'Sissy Squat',[]],
['ישיבת קיר',M.quads,[Q.bw],'Wall Sit',[]],
// ── ירך אחורית ──
['דדליפט רומני',M.hams,[Q.bar],'Romanian Deadlift',['רומני','rdl']],
['דדליפט רומני במשקולות',M.hams,[Q.db],'Dumbbell Romanian Deadlift',[]],
['דדליפט רגל ישרה',M.hams,[Q.bar],'Stiff Leg Deadlift',['דדליפט ישר','סטיף לג']],
['דדליפט על רגל אחת',M.hams,[Q.db],'Single Leg Romanian Deadlift',[]],
['כפיפת ברך בשכיבה',M.hams,[Q.machine],'Lying Leg Curl',['לג קרל','כפיפת רגליים']],
['כפיפת ברך בישיבה',M.hams,[Q.machine],'Seated Leg Curl',[]],
['כפיפת ברך בעמידה',M.hams,[Q.machine],'Standing Leg Curl',[]],
['כפיפה נורדית',M.hams,[Q.bw],'Nordic Curl',['נורדיק']],
['הרמת ירך אחורית',M.hams,[Q.machine],'Glute Ham Raise',['ghr']],
['משיכה בין הרגליים',M.glutes,[Q.cable],'Cable Pull Through',['פול ת׳רו']],
// ── ישבן ──
['היפ ת׳ראסט',M.glutes,[Q.bar,Q.bench],'Hip Thrust',['היפ תראסט','hip thrust','דחיקת אגן']],
['היפ ת׳ראסט במכונה',M.glutes,[Q.machine],'Machine Hip Thrust',[]],
['היפ ת׳ראסט ברגל אחת',M.glutes,[Q.bw],'Single Leg Hip Thrust',[]],
['גשר ישבן',M.glutes,[Q.bw],'Glute Bridge',['ברידג׳']],
['דדליפט סומו',M.glutes,[Q.bar],'Sumo Deadlift',['סומו']],
['סקוואט סומו',M.glutes,[Q.db],'Sumo Squat',[]],
['בעיטת ישבן בפולי',M.glutes,[Q.cable],'Cable Glute Kickback',[]],
['בעיטת ישבן במכונה',M.glutes,[Q.machine],'Machine Glute Kickback',[]],
['סווינג קטלבל',M.glutes,[Q.kb],'Kettlebell Swing',['סווינג','swing']],
['הליכה צידית בגומייה',M.glutes,[Q.band],'Banded Lateral Walk',[]],
['צדפה',M.glutes,[Q.band],'Clamshell',[]],
// ── מקרבים ומרחיקים ──
['קירוב ירך במכונה',M.adduct,[Q.machine],'Hip Adduction Machine',['מקרבים','אדוקטור']],
['קירוב ירך בפולי',M.adduct,[Q.cable],'Cable Hip Adduction',[]],
['פלאנק קופנהגן',M.adduct,[Q.bench],'Copenhagen Plank',[]],
['סקוואט קוזאק',M.adduct,[Q.bw],'Cossack Squat',['קוזאק']],
['הרחקת ירך במכונה',M.abduct,[Q.machine],'Hip Abduction Machine',['מרחיקים','אבדוקטור']],
['הרחקת ירך בפולי',M.abduct,[Q.cable],'Cable Hip Abduction',[]],
// ── תאומים ──
['הרמת עקבים בעמידה',M.calves,[Q.machine],'Standing Calf Raise',['תאומים','קאף רייז']],
['הרמת עקבים בישיבה',M.calves,[Q.machine],'Seated Calf Raise',[]],
['הרמת עקבים בלחיצת רגליים',M.calves,[Q.machine],'Leg Press Calf Raise',[]],
['הרמת עקבים ברגל אחת',M.calves,[Q.db],'Single Leg Calf Raise',[]],
['הרמת עקבים בסמית׳',M.calves,[Q.smith],'Smith Machine Calf Raise',[]],
['הרמת קדמת השוק',M.calves,[Q.bw],'Tibialis Raise',[]],
// ── בטן ──
['כפיפות בטן',M.abs,[Q.mat],'Crunches',['קראנץ','בטן','כפיפות']],
['כפיפות בטן בפולי',M.abs,[Q.cable],'Cable Crunch',[]],
['כפיפות בטן במכונה',M.abs,[Q.machine],'Machine Crunch',[]],
['כפיפות בטן הפוכות',M.abs,[Q.mat],'Reverse Crunch',[]],
['סיטאפ',M.abs,[Q.mat],'Sit Ups',['סיט אפ','בטן מלאה']],
['סיטאפ בשיפוע שלילי',M.abs,[Q.bench],'Decline Sit Ups',[]],
['הרמת רגליים בתלייה',M.abs,[Q.bar_pull],'Hanging Leg Raise',['הרמות רגליים']],
['הרמת ברכיים בתלייה',M.abs,[Q.bar_pull],'Hanging Knee Raise',[]],
['הרמת רגליים בשכיבה',M.abs,[Q.mat],'Lying Leg Raise',[]],
['רגליים למוט',M.abs,[Q.bar_pull],'Toes to Bar',['טוז טו בר']],
['פלאנק',M.abs,[Q.mat],'Plank',['פלנק','קרש']],
['פלאנק עם משקל',M.abs,[Q.plate],'Weighted Plank',[]],
['גלגל בטן',M.abs,[Q.mat],'Ab Wheel',['אב וויל','גלגל']],
['טיפוס הרים',M.abs,[Q.bw],'Mountain Climbers',[]],
['הולו הולד',M.abs,[Q.mat],'Hollow Hold',[]],
['דד באג',M.abs,[Q.mat],'Dead Bug',[]],
['וי אפ',M.abs,[Q.mat],'V Up',[]],
['בעיטות רפרוף',M.abs,[Q.mat],'Flutter Kicks',[]],
['ווקאום',M.abs,[Q.bw],'Stomach Vacuum',[]],
['טורקיש גט אפ',M.abs,[Q.kb],'Turkish Get Up',['טורקיש']],
// ── אלכסונים ──
['פלאנק צידי',M.obliques,[Q.mat],'Side Plank',[]],
['טוויסט רוסי',M.obliques,[Q.mat],'Russian Twist',['טוויסט']],
['כפיפות אופניים',M.obliques,[Q.mat],'Bicycle Crunch',['אופניים בשכיבה']],
['כפיפה צידית',M.obliques,[Q.db],'Dumbbell Side Bend',[]],
['לחיצת פאלוף',M.obliques,[Q.cable],'Pallof Press',['פאלוף']],
['חיתוך עצים בפולי',M.obliques,[Q.cable],'Cable Woodchopper',['וודצ׳ופר']],
['סיבוב לנדמיין',M.obliques,[Q.bar],'Landmine Twist',[]],
['נשיאת מזוודה',M.obliques,[Q.db],'Suitcase Carry',[]],
// ── אירובי ──
['ריצה',M.cardio,[Q.bw],'Running',['ריצת כביש']],
['הליכון',M.cardio,[Q.card],'Treadmill',['טרדמיל']],
['הליכה בשיפוע',M.cardio,[Q.card],'Incline Walk',['הליכה']],
['אופני כושר',M.cardio,[Q.card],'Stationary Bike',['אופניים','ספינינג']],
['אופני התנגדות',M.cardio,[Q.card],'Assault Bike',['אסולט']],
['אליפטיקל',M.cardio,[Q.card],'Elliptical',[]],
['מכונת חתירה',M.cardio,[Q.card],'Rowing Machine',['רואינג','ארגומטר']],
['סקי ארג',M.cardio,[Q.card],'Ski Erg',[]],
['סטפר',M.cardio,[Q.card],'Stair Climber',['מדרגות']],
['קפיצה בחבל',M.cardio,[Q.bw],'Jump Rope',['חבל קפיצה']],
['ברפי',M.cardio,[Q.bw],'Burpees',['ברפיז']],
['קפיצה לקופסה',M.cardio,[Q.box],'Box Jumps',['בוקס ג׳אמפ']],
['דחיפת מזחלת',M.cardio,[Q.sled],'Sled Push',['פרולר','מזחלת']],
['חבלי קרב',M.cardio,[Q.rope],'Battle Ropes',['חבלים']],
['שחייה',M.cardio,[Q.bw],'Swimming',['בריכה']],
// ── מורכבים ──
['קלין אנד פרס',M.shoulders,[Q.bar,Q.kb],'Clean and Press',['קלין']],
['פאוור קלין',M.glutes,[Q.bar],'Power Clean',[]],
['ת׳ראסטר',M.shoulders,[Q.bar],'Thruster',['תראסטר']],
['סנאץ׳',M.shoulders,[Q.bar],'Snatch',['סנאצ']]
];

const list=RAW.map(function(r,i){
  const o={id:'x'+(i+1),n:r[0],m:[r[1]],q:r[2]};
  if(r[3])o.en=r[3];
  /* The name in every language. `n` stays the STORED id - the workout log, the
     history and loadKind all key on it - and `t` is what the reader is shown,
     exactly the split the food table uses. */
  if(r[3]){
    const tr=NAMES[r[3]];
    if(!tr)throw new Error(r[3]+': no translations in exercise-names');
    o.t=Object.assign({he:r[0],en:r[3]},tr);
  }
  /* The other words people say for it. Searched, never displayed - the same
     contract the food table's `aka` has, and the reason a lat pulldown that
     was always in the list could not be found by anyone looking for one. */
  if(r[4]&&r[4].length)o.aka=r[4];
  /* How it is done and what goes wrong. Not every exercise has it yet - a
     screen that says nothing is better than one that says something vague. */
  const hw=HOWTO[r[0]];
  if(hw){o.s=hw.s;o.k=hw.m;}
  return o;
});

const LANGS=['he','en','de','es','fr','it','pt','ja','zh-Hans','zh-Hant','ar'];
for(const e of list){
  if(!e.t)throw new Error(e.n+': no names');
  for(const l of LANGS)if(!e.t[l])throw new Error(e.n+': no '+l+' name');
}
// nothing named twice, or the picker shows the same movement in two places
const seen={};
for(const e of list){
  if(seen[e.n])throw new Error('two exercises called '+e.n);
  seen[e.n]=1;
}
// and no alias may collide with a name or another alias, or one word would
// silently answer for two movements
const aseen={};
for(const e of list)for(const a of (e.aka||[])){
  if(seen[a])throw new Error('alias "'+a+'" is already an exercise name');
  if(aseen[a])throw new Error('alias "'+a+'" is on both '+aseen[a]+' and '+e.n);
  aseen[a]=e.n;
}

const MUSCLES=[M.chest,M.back,M.lats,M.traps,M.shoulders,M.biceps,M.triceps,M.forearm,
               M.quads,M.hams,M.glutes,M.adduct,M.abduct,M.calves,M.abs,M.obliques,M.lower,M.cardio];
const EQUIP=[Q.bar,Q.db,Q.machine,Q.cable,Q.bw,Q.bar_pull,Q.kb,Q.bench,Q.band,Q.mat,Q.card,Q.ball,
             Q.smith,Q.ez,Q.trap,Q.plate,Q.trx,Q.box,Q.sled,Q.rope];

/* every muscle and every equipment an exercise claims has to be one the app
   knows how to draw a filter for */
for(const e of list){
  for(const m of e.m)if(MUSCLES.indexOf(m)<0)throw new Error(e.n+': unknown muscle '+m);
  for(const q of e.q)if(EQUIP.indexOf(q)<0)throw new Error(e.n+': unknown equipment '+q);
}

fs.writeFileSync('data/exercises.json',JSON.stringify({
  taxonomy:'wger (CC-BY-SA 3.0) - muscle and equipment names',
  url:'https://wger.de',
  note:'the list itself is written for this app, not translated',
  built:new Date().toISOString().slice(0,10),
  muscles:MUSCLES,
  equipment:EQUIP,
  exercises:list
}));
const byM={};for(const e of list)byM[e.m[0]]=(byM[e.m[0]]||0)+1;
const withHow=list.filter(e=>e.s).length;
const withAka=list.filter(e=>e.aka).length;
console.log('exercises: '+list.length+'   with instructions: '+withHow+'   with aliases: '+withAka);
console.log('all in Hebrew: '+list.every(e=>/[֐-׿]/.test(e.n)));
console.log('by muscle: '+MUSCLES.map(m=>m+' '+(byM[m]||0)).join(', '));
console.log('data/exercises.json: '+fs.statSync('data/exercises.json').size+' bytes');
