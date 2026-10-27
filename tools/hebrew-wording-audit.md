# Hebrew wording audit — dev/index.html

Read-only audit, 2026-10-27. Keys copied byte-for-byte from `data/lang/_template.json`. Ranked worst first:
1–9 are plain errors (grammar, spelling, a non-word); 10–35 are translated-sounding phrases a native speaker would not say;
36–60 are awkward or unclear but understandable. Gender of address is out of scope (handled by he-f / he-x).
Line numbers are the first `_t()` call in `dev/index.html`; "fn" is the enclosing top-level function where one exists.

Note: the reference example ("ספר לי מה יש לך בשבוע, ואבנה לוח שמחזיק את הכול.") is already fixed in dev (commit 0fb7544).

## 1. סיום יום – הגדרות הסיכום
**Why:** "מזג" זכר ("הייתה" שגוי), ו"מזג" = temperament, לא mood

- key: `איך הייתה המזג שלך היום?`
  - where: dev/index.html:11567 (sayCatHTML)
  - proposed: `איך היה מצב הרוח שלך היום?`

## 2. כושר – סיכום אימון
**Why:** "ישימות" אינה מילה; "להתמקד על" = focus on (מילת יחס מתורגמת)

- key: `הישאר על {w}, ישימות על טכניקה`
  - where: dev/index.html:31505 (wCell)
  - proposed: `הישאר על {w}, ושים דגש על טכניקה`
- key: `התמקד על טכניקה`
  - where: dev/index.html:31505 (wCell)
  - proposed: `התמקד בטכניקה`

## 3. כושר – אשף תוכנית
**Why:** חסרה ה"א הידיעה

- key: `מה המטרה עיקרית?`
  - where: dev/index.html:27906 (renderEditProgram)
  - proposed: `מה המטרה העיקרית?`

## 4. סיום יום – בחירת שאלות
**Why:** "יישאל אותך" שגוי (נשאלים על משהו); "הדלקה חוזרת מחזירה" — שם פעולה מתורגם

- key: `מה שתכבה לא ייכלל בסיכום ולא יישאל אותך. שום דבר לא נמחק — הדלקה חוזרת מחזירה גם את מה שכבר כתבת.`
  - where: dev/index.html:41029 (rfSecsOpen)
  - proposed: `מה שתכבה לא ייכלל בסיכום ולא תישאל עליו. שום דבר לא נמחק — כשמדליקים שוב, גם מה שכבר כתבת חוזר.`

## 5. תזונה – פירוק מנה
**Why:** "מתומחר/מתמחר" = priced (calque); "וההכל" — שגיאת כתיב

- key: `כל רכיב מתומחר מהערכים המדודים במאגר. מה שהוערך מסומן. תקן כמות וההכל מתעדכן.`
  - where: dev/index.html:19011 (anCardHTML)
  - proposed: `כל רכיב מחושב לפי הערכים המדודים במאגר. מה שהוערך מסומן. תקן כמות והכל מתעדכן.`
- key: `פירוק מעמיק — מפרק למרכיבים ומתמחר כל אחד מהמאגר`
  - where: dev/index.html:18457 (fdbPaint)
  - proposed: `פירוק מעמיק — מפרק למרכיבים ומחשב כל אחד לפי המאגר`

## 6. תזונה – שמירה לספרייה
**Why:** כתיב חסר ("יישמר"), ונשמרים ב־ ולא ל־

- key: `✓ ישמר לספרייה`
  - where: dev/index.html:19158, 19736 (toggleSaveToLib)
  - proposed: `✓ יישמר בספרייה`

## 7. אנשים – תאריך חשוב
**Why:** אין צירוף כזה; "שנתי" הוא שם תואר

- key: `חוזר בשנתי`
  - where: dev/index.html:38661 (pfield)
  - proposed: `חוזר כל שנה`

## 8. כושר – כשמשהו לא מרגיש נכון
**Why:** "ניסיון" זכר — שני ניסיונות; "ותברר" חסר מושא

- key: `תרגיל שלא מרגיש נכון אחרי שתי ניסיונות — החלף אותו היום ותברר אחר כך.`
  - where: dev/index.html:30388 (exAltWhy)
  - proposed: `תרגיל שלא מרגיש נכון אחרי שני ניסיונות — החלף אותו היום, ותבדוק את זה אחר כך.`

## 9. שורת הפקודה בבית
**Why:** נקרא "לשמור כ־רגע" = "to save right now"; דו־משמעי

- key: `לשמור כרגע מהיום`
  - where: dev/index.html:45985, 46315 (hcmdPaint)
  - proposed: `לשמור ברגעים של היום`
- key: `לשמור כרגע מהיום?`
  - where: dev/index.html:45999 (hcmdQuestion)
  - proposed: `לשמור ברגעים של היום?`

## 10. Me (המסך האישי) – כותרת
**Why:** מטאפורה מתורגמת ("what the days add up to")

- key: `מה שהימים מצטברים אליו`
  - where: dev/index.html:42636 (renderMe)
  - proposed: `התמונה הגדולה של הימים שלך`

## 11. סיור היכרות – החוגה
**Why:** "the dial’s language is your day" — לא אומר כלום בעברית

- key: `השפה של החוגה היא היום שלך.`
  - where: dev/index.html:43280 (step)
  - proposed: `החוגה הזאת היא היום שלך.`

## 12. לוח חזון
**Why:** calque מילולי של "want to see happen"

- key: `מה אתה רוצה לראות קורה?`
  - where: dev/index.html:39419 (renderVisionBoard)
  - proposed: `מה היית רוצה שיקרה?`
- key: `תמונות ומילים של מה שאתה רוצה לראות קורה`
  - where: dev/index.html:39379 (renderVisionBoard)
  - proposed: `תמונות ומילים של מה שהיית רוצה שיקרה`

## 13. Me – מגמת מצב רוח חודשית
**Why:** "מזג אוויר פנימי" — מטאפורה אנגלית; "כבד יותר מהתחלתו" — תחביר שבור; "נעשו טובים יותר" — מתורגם

- key: `מזג האוויר הפנימי שלך יציב החודש.`
  - where: dev/index.html:40802 (monthCardHTML)
  - proposed: `מצב הרוח שלך היה יציב החודש.`
- key: `החודש היה כבד יותר מהתחלתו.`
  - where: dev/index.html:40804 (monthCardHTML)
  - proposed: `סוף החודש היה כבד יותר מתחילתו.`
- key: `הימים שלך נעשו טובים יותר לאורך החודש.`
  - where: dev/index.html:40803 (monthCardHTML)
  - proposed: `הימים שלך השתפרו במהלך החודש.`

## 14. בית – אזורים (סיום יום)
**Why:** "שיקוף" = צילום רנטגן/שקיפות, לא reflection; וזה לא "ראיון"

- key: `ראיון יומי ושיקוף`
  - where: dev/index.html:42836 (paintSky)
  - proposed: `כמה שאלות בערב, ומבט על היום`

## 15. פרופיל – יעדים
**Why:** "רצפה בטוחה" = safe floor; "החשבון" במקום "החישוב"

- key: `החשבון יצא נמוך מדי, אז היעד הועלה לרצפה בטוחה`
  - where: dev/index.html:11484 (renderProfile)
  - proposed: `החישוב יצא נמוך מדי, אז העליתי את היעד למינימום בטוח`

## 16. פרופיל – יעדים (טוסט)
**Why:** "these are yours now" — סדר מילים אנגלי

- key: `היעדים האלה שלך עכשיו`
  - where: dev/index.html:10636, 10677, 10703 (profSet)
  - proposed: `מעכשיו אלה היעדים שלך`

## 17. תזונה – רמת ודאות של פירוק
**Why:** "פירוק בטוח" נקרא "safe breakdown"; הכוונה לרמת דיוק

- key: `פירוק בטוח`
  - where: dev/index.html:18992 (anCardHTML)
  - proposed: `פירוק מדויק`
- key: `פירוק סביר`
  - where: dev/index.html:18992 (anCardHTML)
  - proposed: `פירוק משוער`
- key: `פירוק גס`
  - where: dev/index.html:18992 (anCardHTML)
  - proposed: `פירוק גס`

## 18. סיום יום – מתוכנן מול בפועל
**Why:** "look like the day you wanted it to be" — מתורגם; "דמה" ספרותי ולא ברור

- key: `עד כמה היום שלך נראה כמו היום שרצית שיהיה?`
  - where: dev/index.html:40203 (renderBackup)
  - proposed: `עד כמה היום שלך היה כמו שתכננת?`
- key: `כמה זה דמה`
  - where: dev/index.html:40203 (renderBackup)
  - proposed: `כמה זה דומה לתוכנית`

## 19. סיום יום – איך זרם היום
**Why:** "איך זרם" = how did it flow; "עוגנים" + "מה שיישאר ממנו" — מעורפל

- key: `איך זרם היום`
  - where: dev/index.html:40202 (renderBackup)
  - proposed: `איך עבר היום`
- key: `איך זרם היום שלך?`
  - where: dev/index.html:40202 (renderBackup)
  - proposed: `איך עבר עליך היום?`
- key: `כמה עוגנים לפי הסדר. זה גם מה שיישאר ממנו בזיכרון.`
  - where: dev/index.html:40202 (renderBackup)
  - proposed: `כמה נקודות ציון לפי הסדר — ככה תזכור אותו.`

## 20. סיכום יום – כותרות בלוקים
**Why:** "flowchart of the day" — מונח הנדסי

- key: `תרשים זרימת היום`
  - where: dev/index.html:11570 (sayCatHTML)
  - proposed: `מהלך היום`
- key: `זרימת היום`
  - where: dev/index.html:20684, 40318 (summaryBodyHTML)
  - proposed: `מהלך היום`

## 21. סיום יום – משפט / למחר
**Why:** "take away" מתורגם; בעברית משפט "נשאר איתך"

- key: `יש משפט שלקחת איתך היום?`
  - where: dev/index.html:40184 (renderBackup)
  - proposed: `יש משפט שנשאר איתך היום?`
- key: `מה אתה לוקח מהיום הזה למחר?`
  - where: dev/index.html:40208 (renderBackup)
  - proposed: `מה מהיום הזה תרצה לקחת איתך למחר?`
- key: `מה אתה לוקח`
  - where: dev/index.html:40208 (renderBackup)
  - proposed: `מה לוקחים למחר`

## 22. סיכום שבועי (deck)
**Why:** ערבוב סתמי ("לוקחים") וגוף שני ("איתך")

- key: `דבר אחד שלוקחים איתך`
  - where: dev/index.html:42472 (bg)
  - proposed: `דבר אחד לקחת איתך`

## 23. אנשים – מסך ריק
**Why:** "להיות נוכח בחיים שלהם" = be present in their lives

- key: `התחל להוסיף את האנשים שאתה רוצה לזכור ולהיות נוכח בחיים שלהם.`
  - where: dev/index.html:38059 (renderPeopleHome)
  - proposed: `הוסף את האנשים שחשוב לך לזכור ולשמור איתם על קשר.`

## 24. תובנות – תיאור אזור
**Why:** "נהיות תמונה" — מתורגם

- key: `התשובות נשמרות ונהיות תמונה של מי שאתה`
  - where: dev/index.html:43893 (areaIntroText)
  - proposed: `מהתשובות מצטיירת תמונה של מי שאתה`

## 25. סיום יום – תמונת היום
**Why:** "feels like the day" / "tells your day" — מתורגמים

- key: `זה יכול להיות רגע, מקום, אדם, משהו שעשית — או פשוט תמונה שמרגישה כמו היום שעבר עליך.`
  - where: dev/index.html:40182 (renderBackup)
  - proposed: `זה יכול להיות רגע, מקום, אדם, משהו שעשית — או פשוט תמונה שמזכירה לך את היום שעבר עליך.`
- key: `איזו תמונה מספרת את היום שלך?`
  - where: dev/index.html:40182 (renderBackup)
  - proposed: `איזו תמונה הכי מסכמת את היום שלך?`
- key: `התמונה שמספרת את היום`
  - where: dev/index.html:40313 (rfGrow)
  - proposed: `התמונה שמסכמת את היום`

## 26. סיום יום – פתיחה
**Why:** "and it’s yours" / "let’s take a moment" — מתורגמים

- key: `כמה דקות, וזה שלך.`
  - where: dev/index.html:40943, 41137 (renderReflectHome)
  - proposed: `כמה דקות רק בשבילך.`
- key: `בוא ניקח רגע להסתכל על היום שלך.`
  - where: dev/index.html:41136 (renderReflectIntro)
  - proposed: `בוא נעצור רגע ונסתכל על היום שלך.`

## 27. סיום יום – הרגע שהשפיע
**Why:** "changed how you felt" — "את איך ש" מגושם

- key: `משהו ששינה את איך שהרגשת, חשבת או המשכת את היום.`
  - where: dev/index.html:40210 (renderBackup)
  - proposed: `משהו ששינה לך את ההרגשה, את המחשבות או את המשך היום.`

## 28. כושר – חיבור Apple Health
**Why:** "כותבים אל" = write to (API); "לעשות חיבור" מתורגם

- key: `השעון והאפליקציות שלך כותבים אל הבריאות בלאו הכי, אז זה החיבור היחיד שצריך לעשות:`
  - where: dev/index.html:24287 (renderFitStepsSetup)
  - proposed: `השעון והאפליקציות שלך כבר מעדכנים את אפליקציית בריאות, אז רק אותה צריך לחבר:`

## 29. גיבוי
**Why:** "survive the phone" מתורגם; "לא דרכי ולא דרך" — מגושם

- key: `שמור אותו במקום שישרוד את הטלפון`
  - where: dev/index.html:39770 (exportPanel)
  - proposed: `שמור אותו גם מחוץ לטלפון`
- key: `אין דרך לשחזר אותו, לא דרכי ולא דרך אף אחד.`
  - where: dev/index.html:39937 (exportLockedHTML)
  - proposed: `אי אפשר לשחזר אותו — לא אני ולא אף אחד אחר.`

## 30. פרופיל / אונבורדינג
**Why:** "the numbers will be yours" — מתורגם

- key: `תשובה אחת, והמספרים במסך הזה יהיו שלך במקום של מישהו אחר`
  - where: dev/index.html:11094 (fqCardHTML)
  - proposed: `תשובה אחת, והמספרים כאן יותאמו אליך ולא לאדם ממוצע`
- key: `לפני שנתחיל, כמה שאלות קצרות, כדי שהמספרים יהיו שלך.`
  - where: dev/index.html:10945 (asetPaint)
  - proposed: `לפני שנתחיל, כמה שאלות קצרות, כדי שהמספרים יתאימו לך.`

## 31. הגדרות – אזור מוצרים
**Why:** מטאפורת "מדף" לא מובנת; שאלה בלי סימן שאלה

- key: `איזה מדף מחפשים בו מוצרים. לא חייב להיות המקום שבו נולדת.`
  - where: dev/index.html:45042 (renderSettings)
  - proposed: `מאיזו מדינה לחפש מוצרים? לא חייבת להיות זו שבה נולדת.`

## 32. תכנון – בונה הלו״ז
**Why:** "skeleton" מתורגם; "אין מה להוסיף, לבנות" — קטוע

- key: `אשר את השלד`
  - where: dev/index.html:37438 (ansRow)
  - proposed: `אשר את המבנה`
- key: `השלד מאושר, תכנן את הימים`
  - where: dev/index.html:37437 (ansRow)
  - proposed: `המבנה מאושר, עכשיו מתכננים את הימים`
- key: `אין מה להוסיף, לבנות`
  - where: dev/index.html:37125 (plWarmHTML)
  - proposed: `אין מה להוסיף — אפשר לבנות`

## 33. תכנון – סיור/טיפים
**Why:** אותה משפחה כמו "לוח שמחזיק": "מחזיר לוח", "ה־+ מחזיק"

- key: `מספרים לו מה יש השבוע, והוא מחזיר לוח שלם. אחר כך מאשרים מה נכנס.`
  - where: dev/index.html:43349 (areaTourStep)
  - proposed: `מספרים לו מה יש השבוע, והוא בונה לו״ז מלא. אחר כך מאשרים מה נכנס.`
- key: `או לתת למתכנן לבנות.`
  - where: dev/index.html:43349 (areaTourStep)
  - proposed: `או לתת למתכנן לבנות את הלו״ז.`
- key: `ה־+ מחזיק משימות בצד.`
  - where: dev/index.html:43350 (areaTourStep)
  - proposed: `ב־+ שומרים משימות בצד.`

## 34. תכנון – בונה הלו״ז
**Why:** "עוגנים", "כמו שהם וכולל הדרך" — תחביר מתורגם

- key: `טווח: {h}. העוגנים הקבועים, כמו שהם וכולל הדרך: {list}.`
  - where: dev/index.html:37087 (plWarmDone)
  - proposed: `טווח: {h}. הדברים הקבועים, כולל זמן הדרך: {list}.`

## 35. כושר – שאלון
**Why:** קטוע עד לא מובן; "למה" נקרא why

- key: `יכול, לא רוצה. עדיף תוכנית שמתקיימת.`
  - where: dev/index.html:11239, 23627 (fitMeWhy)
  - proposed: `כמה אתה באמת יכול, לא כמה היית רוצה. עדיף תוכנית שמחזיקה.`
- key: `למה אתה מכוון?`
  - where: dev/index.html:10737 (fqQuestion)
  - proposed: `מה אתה רוצה להשיג?`

## 36. כושר – הערות תוכנית
**Why:** "יוצאים" בלי נושא; "עשרים דקות" של מה?

- key: `יוצאים בערך {n} סטים לשריר בשבוע, והטווח לגדילה מתחיל ב־{lo}. אימון נוסף או עשרים דקות יסגרו את הפער.`
  - where: dev/index.html:23449 (fitWCaveats)
  - proposed: `זה יוצא בערך {n} סטים לשריר בשבוע, ולגדילה צריך לפחות {lo}. עוד אימון, או עוד עשרים דקות, יסגרו את הפער.`

## 37. כושר – תרגילי "אחר"
**Why:** "לספרייה אין להם שריר" — שבור; "תשבץ" לא ברור

- key: `הם תרגילים שהקלדת בעצמך — לספרייה אין להם שריר. בחירה מהספרייה תשבץ אותם.`
  - where: dev/index.html:24134 (delta)
  - proposed: `הם תרגילים שהקלדת בעצמך, ולכן לא ידוע איזה שריר הם עובדים. בחירה מהספרייה תשייך אותם.`

## 38. כושר – משקל עבודה
**Why:** "יעדכן מעליו" = overwrite

- key: `המספר מתעדכן לבד מכל אימון שתסיים. אפשר גם להקליד אותו — והאימון הבא יעדכן מעליו.`
  - where: dev/index.html:24058 (renderFitWeights)
  - proposed: `המספר מתעדכן לבד מכל אימון שתסיים. אפשר גם להקליד אותו — והאימון הבא יעדכן אותו שוב.`

## 39. כושר – כשנתקעים
**Why:** "נשארת בכל הסטים" לא אומר "לא הגעת לטווח"

- key: `נשארת בכל הסטים: רד למשקל של האימון הקודם.`
  - where: dev/index.html:30377 (exAltWhy)
  - proposed: `לא הגעת לטווח באף סט: חזור למשקל של האימון הקודם.`
- key: `נשארת סט אחד או שניים מתחת: המשך באותו משקל בפעם הבאה.`
  - where: dev/index.html:30376 (exAltWhy)
  - proposed: `בסט אחד או שניים לא הגעת לטווח: המשך באותו משקל בפעם הבאה.`

## 40. כושר – טיפים
**Why:** "קצר את הדרך", "רוב הערך" — מתורגמים; "הבחן" — ספרותי

- key: `צלם את עצמך מהצד. זה קצר את הדרך יותר מכל הסבר.`
  - where: dev/index.html:30387 (exAltWhy)
  - proposed: `צלם את עצמך מהצד. זה יעזור יותר מכל הסבר.`
- key: `שמור על התרגיל המורכב הראשון: הוא רוב הערך של האימון.`
  - where: dev/index.html:30368 (exAltWhy)
  - proposed: `שמור על התרגיל המורכב הראשון: בו נמצאת רוב התועלת של האימון.`
- key: `הבחן בין השניים: שריר שנשרף ומתעייף הוא בסדר. כאב חד, דוקר, או במפרק עצמו — לא.`
  - where: dev/index.html:30350 (exAltWhy)
  - proposed: `חשוב להבדיל: שריר שנשרף ומתעייף זה בסדר. כאב חד, דוקר, או במפרק עצמו — לא.`

## 41. כושר – דף תרגיל, ירידה
**Why:** "חלק מזה" — מזה מה? (part of it)

- key: `בפעם הקודמת עשית {s}. יום פחות טוב זה חלק מזה.`
  - where: dev/index.html:30168 (exDetailHTML)
  - proposed: `בפעם הקודמת עשית {s}. גם ימים פחות טובים הם חלק מהדרך.`

## 42. כושר – שאלון
**Why:** "מהן אני מגיע ל" = derive from; "אכוון אליך" לא טבעי

- key: `אפשר לבחור יותר מאחת. מהן אני מגיע לטווח החזרות, למנוחה ולקפיצת המשקל.`
  - where: dev/index.html:11238 (fitMeWhy)
  - proposed: `אפשר לבחור יותר מאחת. לפיהן אקבע את טווח החזרות, את המנוחה ואת הקפיצה במשקל.`
- key: `כאן אתה בונה אימון, עוקב אחרי המשקלים ורואה את ההתקדמות לאורך זמן. כמה שאלות קצרות, ואכוון את זה אליך.`
  - where: dev/index.html:23476 (renderFitWelcome)
  - proposed: `כאן אתה בונה אימון, עוקב אחרי המשקלים ורואה את ההתקדמות לאורך זמן. כמה שאלות קצרות, ואתאים את זה אליך.`

## 43. סיום יום – שאלות
**Why:** "נתראה עם זה" ו"בבנק" (question bank) — מתורגמים

- key: `נשמר. נתראה עם זה כל ערב.`
  - where: dev/index.html:42525 (wkCarryKeep)
  - proposed: `נשמר. נשאל על זה כל ערב.`
- key: `מה שמסומן כאן תישאל עליו כל ערב. השאר נשאר בבנק, ואפשר לפתוח אותו מתי שבא לך. שום דבר לא נמחק.`
  - where: dev/index.html:41064 (rfNightlyOpen)
  - proposed: `מה שמסומן כאן תישאל עליו כל ערב. השאר מחכה בצד, ואפשר לפתוח אותו מתי שבא לך. שום דבר לא נמחק.`

## 44. בית – אזורים
**Why:** חסר "אחרי"; "הדבר שזז" לא ברור (צעדים)

- key: `מעקב דברים שאתה אוהב`
  - where: dev/index.html:42834 (paintSky)
  - proposed: `מעקב אחרי מה שאתה אוהב לעשות`
- key: `הדבר שזז כל יום`
  - where: dev/index.html:23812 (exWeightCommit)
  - proposed: `כמה זזת היום`

## 45. אנשים – התראות
**Why:** "עבר זמן מ" חסר "מאז"; "לעשות את היום" בלי "לו/לה" = make the day

- key: `עבר זמן מ{name}`
  - where: dev/index.html:33354 (pplNudgeNative)
  - proposed: `מזמן לא דיברת עם {name}`
- key: `היום יום ההולדת של {name}. מילה קטנה ממך יכולה לעשות את היום.`
  - where: dev/index.html:38350 (pplBdaySentences)
  - proposed: `היום יום ההולדת של {name}. הודעה קטנה ממך יכולה לשמח מאוד.`
- key: `מילה קטנה ממך יכולה לעשות את היום.`
  - where: dev/index.html:38361 (pplBdayNative)
  - proposed: `הודעה קטנה ממך יכולה לשמח מאוד.`

## 46. תזונה – חיפוש
**Why:** "matches by meaning"; כותרת בלי נושא

- key: `התאמות לפי המשמעות`
  - where: dev/index.html:18389 (fdbPaint)
  - proposed: `תוצאות דומות`
- key: `מכילים את מה שכתבת`
  - where: dev/index.html:18434 (fdbPaint)
  - proposed: `תוצאות שמכילות את מה שכתבת`

## 47. שאל את מיפ – סטטוס כלים
**Why:** ציווי במקום הווה (שורת סטטוס: reading…)

- key: `קרא את היום`
  - where: dev/index.html:18553 (askSay)
  - proposed: `קורא את היום`
- key: `קרא את היעדים שלך`
  - where: dev/index.html:18555 (askSay)
  - proposed: `קורא את היעדים שלך`

## 48. תובנות – שיניתי דעה
**Why:** "מה התקיים" לא מתאים לשינוי דעה

- key: `מה התקיים, מה קרה...`
  - where: dev/index.html:38931 (renderInsEntry)
  - proposed: `מה קרה, מה שכנע אותך...`

## 49. Me – כרטיס העמקה
**Why:** "בהעמקה" כשם מקום — לא ברור

- key: `מתוך התשובות שלך בהעמקה`
  - where: dev/index.html:42708 (meInsights)
  - proposed: `מתוך התשובות שלך לשאלות ההעמקה`

## 50. פרופיל – מטרה
**Why:** "תחזוקה" = maintenance (calque)

- key: `לפי מה שסיפרת: חיטוב. קרוב לתחזוקה, עם הרבה חלבון.`
  - where: dev/index.html:10904 (asetGoalWhy)
  - proposed: `לפי מה שסיפרת: חיטוב. קרוב לשמירה על המשקל, עם הרבה חלבון.`
- key: `קרוב לתחזוקה, חלבון גבוה`
  - where: dev/index.html:10591 (loadTargets)
  - proposed: `קרוב לשמירה על המשקל, חלבון גבוה`

## 51. אנשים – סיור
**Why:** "מי שהכי מזמן" חסר פועל

- key: `לפי שם, מקום או תפקיד, או לפי מי שהכי מזמן.`
  - where: dev/index.html:43358 (areaTourStep)
  - proposed: `לפי שם, מקום או תפקיד, או לפי מי שהכי הרבה זמן לא דיברתם.`

## 52. שאל את מיפ – שגיאה
**Why:** "לסגור את זה" = close it out; "יותר ממוקד" כתואר פועל

- key: `לא הצלחתי לסגור את זה. נסה לשאול יותר ממוקד.`
  - where: dev/index.html:18577 (askTurn)
  - proposed: `לא הצלחתי לענות על זה. נסה לשאול שאלה ממוקדת יותר.`

## 53. תזונה – צילום צלחת
**Why:** "הכי קשה לצלם נכון" — לא זה מה שקשה

- key: `כמה יש בצלחת נאמד מהתמונה. זה החלק הכי קשה לצלם נכון — אם המשקל נראה רחוק, תקן אותו.`
  - where: dev/index.html:17974 (sayPaint)
  - proposed: `כמה יש בצלחת נאמד מהתמונה. זה החלק שהכי קשה להעריך מתמונה — אם המשקל נראה רחוק, תקן אותו.`

## 54. תחביבים / אנשים – תיאור אזור
**Why:** "מה מקבל מקום", "ייעלם בין הימים" — מטאפורות מתורגמות

- key: `רואים לאורך שבועות מה מקבל מקום`
  - where: dev/index.html:43889 (areaIntroText)
  - proposed: `רואים לאורך השבועות למה אתה מקדיש זמן`
- key: `מי שחשובים לך, כדי שאף אחד לא ייעלם בין הימים.`
  - where: dev/index.html:43895 (areaIntroText)
  - proposed: `מי שחשובים לך, כדי שלא תאבד קשר עם אף אחד.`

## 55. תכנון – פס שעות
**Why:** סדר מילים הפוך

- key: `על מה הזמן הלך`
  - where: dev/index.html:33001 (renderHabits)
  - proposed: `על מה הלך הזמן`

## 56. כושר – עידוד
**Why:** "שהיה... שלא" — אליפסיס לא טבעי

- key: `עדיף אימון קצר שהיה מאשר אימון מלא שלא.`
  - where: dev/index.html:30361 (exAltWhy)
  - proposed: `עדיף אימון קצר שקרה מאשר אימון מלא שלא קרה.`

## 57. ארון
**Why:** "ייכנס אל" — מליצי

- key: `בגד שתוסיף עכשיו ייכנס אל {season}`
  - where: dev/index.html:25612 (closetSeasonsHTML)
  - proposed: `בגד שתוסיף עכשיו יישמר תחת {season}`

## 58. רצף (streak)
**Why:** סביל ("פוספס") במקום פנייה ישירה; "ו" במקום "אבל"

- key: `אתמול פוספס, ויום החסד שמר על הרצף.`
  - where: dev/index.html:43670, 45472 (beemStreakOpen)
  - proposed: `פספסת אתמול, אבל יום החסד שמר על הרצף.`

## 59. סיום יום – מובן מאליו
**Why:** כותרת־משנה קטועה, לא מובנת

- key: `ולא באמת`
  - where: dev/index.html:40229 (renderBackup)
  - proposed: `ולא אמור להיות`

## 60. ברכות בבית
**Why:** "lit evening" — לא ברכה שאומרים

- key: `ערב מואר`
  - where: dev/index.html:45280 (greetSetName)
  - proposed: `ערב נפלא`
- key: `צהריים מוארים`
  - where: dev/index.html:45276 (greetSetName)
  - proposed: `צהריים נפלאים`
