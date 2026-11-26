/* The "dig deeper" questions of תובנות (Asaf, 26 Nov 2026: level A, a bank
 * written by hand; tone "warm and direct, like the examples").
 *
 * One row per question: [topic, English, Hebrew masculine (the key), Hebrew
 * feminine (he-f), Hebrew plural (he-x)]. '=' means "the same as the key".
 * The topic is INSIGHTS_CATS' id and index, so the ORDER within a topic is
 * data: an entry stores its question's index. Append, never reorder.
 *
 * English is the original; every other language is written from it. */
export const BANK = [
  // self 0 מי אני
  ['self__0', 'What would surprise the people who know you best, if they knew it?', 'מה היה מפתיע אנשים שמכירים אותך טוב, אם היו יודעים?', '=', 'מה היה מפתיע אנשים שמכירים אתכם טוב, אם היו יודעים?'],
  ['self__0', 'Which part of you do you only show when you are alone?', 'איזה חלק בך אתה מראה רק כשאתה לבד?', 'איזה חלק בך את מראה רק כשאת לבד?', 'איזה חלק בכם אתם מראים רק כשאתם לבד?'],
  ['self__0', 'If you described yourself without your job or your roles, what would be left?', 'אם היית מתאר את עצמך בלי העבודה ובלי התפקידים שלך, מה היה נשאר?', 'אם היית מתארת את עצמך בלי העבודה ובלי התפקידים שלך, מה היה נשאר?', 'אם הייתם מתארים את עצמכם בלי העבודה ובלי התפקידים שלכם, מה היה נשאר?'],
  // self 1 מה אני באמת רוצה
  ['self__1', 'If no one would ever see or know, what would you choose?', 'אם אף אחד לא היה רואה ולא יודע, מה היית בוחר?', 'אם אף אחד לא היה רואה ולא יודע, מה היית בוחרת?', 'אם אף אחד לא היה רואה ולא יודע, מה הייתם בוחרים?'],
  ['self__1', 'What do you want that you are embarrassed to say out loud?', 'מה אתה רוצה, שמביך אותך להגיד בקול?', 'מה את רוצה, שמביך אותך להגיד בקול?', 'מה אתם רוצים, שמביך אתכם להגיד בקול?'],
  ['self__1', 'What did you want at fifteen that you still want today?', 'מה רצית בגיל חמש־עשרה, ואתה עדיין רוצה היום?', 'מה רצית בגיל חמש־עשרה, ואת עדיין רוצה היום?', 'מה רציתם בגיל חמש־עשרה, ואתם עדיין רוצים היום?'],
  // self 2 מה חשוב לי
  ['self__2', 'What did you make time for this week, even though you were busy?', 'למה פינית זמן השבוע, למרות שהיית עסוק?', 'למה פינית זמן השבוע, למרות שהיית עסוקה?', 'למה פיניתם זמן השבוע, למרות שהייתם עסוקים?'],
  ['self__2', 'What would you protect first if everything else fell apart?', 'על מה היית שומר קודם, אם כל השאר היה מתפרק?', 'על מה היית שומרת קודם, אם כל השאר היה מתפרק?', 'על מה הייתם שומרים קודם, אם כל השאר היה מתפרק?'],
  ['self__2', 'What do you say matters to you, while your days say otherwise?', 'על מה אתה אומר שזה חשוב לך, אבל הימים שלך אומרים אחרת?', 'על מה את אומרת שזה חשוב לך, אבל הימים שלך אומרים אחרת?', 'על מה אתם אומרים שזה חשוב לכם, אבל הימים שלכם אומרים אחרת?'],
  // self 3 הערכים שלי
  ['self__3', 'When did you last pay a price for something you believe in?', 'מתי בפעם האחרונה שילמת מחיר על משהו שאתה מאמין בו?', 'מתי בפעם האחרונה שילמת מחיר על משהו שאת מאמינה בו?', 'מתי בפעם האחרונה שילמתם מחיר על משהו שאתם מאמינים בו?'],
  ['self__3', 'Which of your values came from home, and which did you choose yourself?', 'איזה ערך קיבלת מהבית, ואיזה בחרת בעצמך?', '=', 'איזה ערך קיבלתם מהבית, ואיזה בחרתם בעצמכם?'],
  ['self__3', 'What would you never do, even for a lot of money?', 'מה לא היית עושה אף פעם, גם בשביל הרבה כסף?', '=', 'מה לא הייתם עושים אף פעם, גם בשביל הרבה כסף?'],
  // self 4 החוזקות שלי
  ['self__4', 'What do people come to you for?', 'בשביל מה אנשים פונים דווקא אליך?', 'בשביל מה אנשים פונים דווקא אלייך?', 'בשביל מה אנשים פונים דווקא אליכם?'],
  ['self__4', 'What comes so easily to you that you forget it is a strength?', 'מה בא לך כל כך בקלות, שאתה שוכח שזו חוזקה?', 'מה בא לך כל כך בקלות, שאת שוכחת שזו חוזקה?', 'מה בא לכם כל כך בקלות, שאתם שוכחים שזו חוזקה?'],
  ['self__4', 'When did you last surprise yourself?', 'מתי בפעם האחרונה הפתעת את עצמך?', '=', 'מתי בפעם האחרונה הפתעתם את עצמכם?'],
  // self 5 החולשות שלי
  ['self__5', 'Which of your weaknesses also protects you from something?', 'איזו חולשה שלך גם מגינה עליך ממשהו?', 'איזו חולשה שלך גם מגינה עלייך ממשהו?', 'איזו חולשה שלכם גם מגינה עליכם ממשהו?'],
  ['self__5', 'What do you keep promising yourself you will change?', 'מה אתה מבטיח לעצמך לשנות, שוב ושוב?', 'מה את מבטיחה לעצמך לשנות, שוב ושוב?', 'מה אתם מבטיחים לעצמכם לשנות, שוב ושוב?'],
  ['self__5', 'What would you easily forgive in someone else, but not in yourself?', 'מה היית סולח לאדם אחר בקלות, אבל לא לעצמך?', 'מה היית סולחת לאדם אחר בקלות, אבל לא לעצמך?', 'מה הייתם סולחים לאדם אחר בקלות, אבל לא לעצמכם?'],
  // self 6 הפחדים שלי
  ['self__6', 'Which fear decides more for you than you would like?', 'איזה פחד מחליט בשבילך יותר ממה שהיית רוצה?', '=', 'איזה פחד מחליט בשבילכם יותר ממה שהייתם רוצים?'],
  ['self__6', 'What is the worst that could happen, and how would you get through it?', 'מה הכי גרוע שיכול לקרות, ואיך היית עובר את זה?', 'מה הכי גרוע שיכול לקרות, ואיך היית עוברת את זה?', 'מה הכי גרוע שיכול לקרות, ואיך הייתם עוברים את זה?'],
  ['self__6', 'Which fear did you inherit from someone else?', 'איזה פחד ירשת ממישהו אחר?', '=', 'איזה פחד ירשתם ממישהו אחר?'],
  // self 7 הדפוסים שלי
  ['self__7', 'What keeps happening to you, with different people?', 'מה קורה לך שוב ושוב, עם אנשים שונים?', '=', 'מה קורה לכם שוב ושוב, עם אנשים שונים?'],
  ['self__7', 'What do you do when you are tired that you would not do when rested?', 'מה אתה עושה כשאתה עייף, שלא היית עושה כשאתה נח?', 'מה את עושה כשאת עייפה, שלא היית עושה כשאת נחה?', 'מה אתם עושים כשאתם עייפים, שלא הייתם עושים כשאתם נחים?'],
  ['self__7', 'What is the first thing you do when something goes wrong?', 'מה הדבר הראשון שאתה עושה כשמשהו משתבש?', 'מה הדבר הראשון שאת עושה כשמשהו משתבש?', 'מה הדבר הראשון שאתם עושים כשמשהו משתבש?'],
  // self 8 דברים שאני משקר לעצמי
  ['self__8', 'What do you tell yourself so you do not have to decide?', 'מה אתה מספר לעצמך, כדי שלא תצטרך להחליט?', 'מה את מספרת לעצמך, כדי שלא תצטרכי להחליט?', 'מה אתם מספרים לעצמכם, כדי שלא תצטרכו להחליט?'],
  ['self__8', 'When this week did you say you were fine, and it was not true?', 'מתי השבוע אמרת שאתה בסדר, וזה לא היה נכון?', 'מתי השבוע אמרת שאת בסדר, וזה לא היה נכון?', 'מתי השבוע אמרתם שאתם בסדר, וזה לא היה נכון?'],
  ['self__8', 'What do you already know, but keep acting as if you do not?', 'מה אתה כבר יודע, אבל ממשיך להתנהג כאילו לא?', 'מה את כבר יודעת, אבל ממשיכה להתנהג כאילו לא?', 'מה אתם כבר יודעים, אבל ממשיכים להתנהג כאילו לא?'],
  // self 9 דברים שאני מגלה על עצמי
  ['self__9', 'What did you notice about yourself this week that you did not know a year ago?', 'מה שמת לב השבוע על עצמך, שלא ידעת לפני שנה?', '=', 'מה שמתם לב השבוע על עצמכם, שלא ידעתם לפני שנה?'],
  ['self__9', 'In which situation are you most yourself?', 'באיזה מצב אתה הכי אתה?', 'באיזה מצב את הכי את?', 'באיזה מצב אתם הכי אתם?'],
  ['self__9', 'What did you once believe about yourself that turned out to be wrong?', 'מה חשבת פעם על עצמך, שהתברר כלא נכון?', '=', 'מה חשבתם פעם על עצמכם, שהתברר כלא נכון?'],

  // emotions 0 פחד
  ['emotions__0', 'What were you afraid of five years ago that no longer scares you? What changed?', 'ממה פחדת לפני חמש שנים, שהיום כבר לא מפחיד אותך? מה השתנה?', '=', 'ממה פחדתם לפני חמש שנים, שהיום כבר לא מפחיד אתכם? מה השתנה?'],
  ['emotions__0', 'What would you do tomorrow if this fear simply disappeared?', 'מה היית עושה מחר, אם הפחד הזה פשוט היה נעלם?', '=', 'מה הייתם עושים מחר, אם הפחד הזה פשוט היה נעלם?'],
  ['emotions__0', 'Where in your body do you feel fear first?', 'איפה בגוף אתה מרגיש את הפחד קודם?', 'איפה בגוף את מרגישה את הפחד קודם?', 'איפה בגוף אתם מרגישים את הפחד קודם?'],
  // emotions 1 עצב
  ['emotions__1', 'When did you last let yourself be sad, without rushing to fix it?', 'מתי בפעם האחרונה הרשית לעצמך להיות עצוב, בלי למהר לתקן את זה?', 'מתי בפעם האחרונה הרשית לעצמך להיות עצובה, בלי למהר לתקן את זה?', 'מתי בפעם האחרונה הרשיתם לעצמכם להיות עצובים, בלי למהר לתקן את זה?'],
  ['emotions__1', 'What sadness are you still carrying that you have never told anyone about?', 'איזה עצב אתה עדיין סוחב, שלא סיפרת עליו לאף אחד?', 'איזה עצב את עדיין סוחבת, שלא סיפרת עליו לאף אחד?', 'איזה עצב אתם עדיין סוחבים, שלא סיפרתם עליו לאף אחד?'],
  ['emotions__1', 'What does your sadness need: company, quiet, or to be heard?', 'מה עוזר לעצב שלך: חברה, שקט, או אוזן קשבת?', '=', 'מה עוזר לעצב שלכם: חברה, שקט, או אוזן קשבת?'],
  // emotions 2 כעס
  ['emotions__2', 'What are you angry about that is really protecting something that matters to you?', 'על מה אתה כועס, שבעצם מגן על משהו שחשוב לך?', 'על מה את כועסת, שבעצם מגן על משהו שחשוב לך?', 'על מה אתם כועסים, שבעצם מגן על משהו שחשוב לכם?'],
  ['emotions__2', 'Who is it easy for you to get angry at, and who can you not get angry at at all?', 'על מי קל לך לכעוס, ועל מי אתה לא מצליח לכעוס בכלל?', 'על מי קל לך לכעוס, ועל מי את לא מצליחה לכעוס בכלל?', 'על מי קל לכם לכעוס, ועל מי אתם לא מצליחים לכעוס בכלל?'],
  ['emotions__2', 'What do you do with anger you did not say out loud?', 'מה אתה עושה עם כעס שלא אמרת בקול?', 'מה את עושה עם כעס שלא אמרת בקול?', 'מה אתם עושים עם כעס שלא אמרתם בקול?'],
  // emotions 3 שמחה
  ['emotions__3', 'What small thing made you happy this week, almost without you noticing?', 'איזה דבר קטן שימח אותך השבוע, כמעט בלי ששמת לב?', '=', 'איזה דבר קטן שימח אתכם השבוע, כמעט בלי ששמתם לב?'],
  ['emotions__3', 'When were you last happy for no reason at all?', 'מתי בפעם האחרונה היית שמח בלי שום סיבה?', 'מתי בפעם האחרונה היית שמחה בלי שום סיבה?', 'מתי בפעם האחרונה הייתם שמחים בלי שום סיבה?'],
  ['emotions__3', 'What stops you from letting yourself be happy?', 'מה עוצר אותך מלהרשות לעצמך לשמוח?', '=', 'מה עוצר אתכם מלהרשות לעצמכם לשמוח?'],
  // emotions 4 אהבה
  ['emotions__4', 'How do you show love without saying it?', 'איך אתה מראה אהבה בלי להגיד אותה?', 'איך את מראה אהבה בלי להגיד אותה?', 'איך אתם מראים אהבה בלי להגיד אותה?'],
  ['emotions__4', 'When did you last feel loved exactly as you are?', 'מתי בפעם האחרונה הרגשת אהוב בדיוק כמו שאתה?', 'מתי בפעם האחרונה הרגשת אהובה בדיוק כמו שאת?', 'מתי בפעם האחרונה הרגשתם אהובים בדיוק כמו שאתם?'],
  ['emotions__4', 'Who do you love and have not told in a long time?', 'את מי אתה אוהב, ולא אמרת לו את זה כבר הרבה זמן?', 'את מי את אוהבת, ולא אמרת לו את זה כבר הרבה זמן?', 'את מי אתם אוהבים, ולא אמרתם לו את זה כבר הרבה זמן?'],
  // emotions 5 בדידות
  ['emotions__5', 'With whom do you feel alone, even when you are together?', 'ליד מי אתה מרגיש לבד, גם כשאתם יחד?', 'ליד מי את מרגישה לבד, גם כשאתם יחד?', 'ליד מי אתם מרגישים לבד, גם כשאתם יחד?'],
  ['emotions__5', 'What is the difference, for you, between being alone and being lonely?', 'מה ההבדל אצלך בין להיות לבד לבין להיות בודד?', 'מה ההבדל אצלך בין להיות לבד לבין להיות בודדה?', 'מה ההבדל אצלכם בין להיות לבד לבין להיות בודדים?'],
  ['emotions__5', 'Who would you call if you had to tell someone something hard tonight?', 'למי היית מתקשר, אם היית צריך לספר למישהו משהו קשה הערב?', 'למי היית מתקשרת, אם היית צריכה לספר למישהו משהו קשה הערב?', 'למי הייתם מתקשרים, אם הייתם צריכים לספר למישהו משהו קשה הערב?'],
  // emotions 6 קנאה
  ['emotions__6', 'Who did you envy recently, and what does it say about what you want?', 'במי קינאת לאחרונה, ומה זה אומר על מה שאתה רוצה?', 'במי קינאת לאחרונה, ומה זה אומר על מה שאת רוצה?', 'במי קינאתם לאחרונה, ומה זה אומר על מה שאתם רוצים?'],
  ['emotions__6', 'What do you have that someone else might envy?', 'מה יש לך, שמישהו אחר אולי מקנא בו?', '=', 'מה יש לכם, שמישהו אחר אולי מקנא בו?'],
  ['emotions__6', 'Is there envy you are ashamed of? What is underneath it?', 'יש קנאה שאתה מתבייש בה? מה יש מתחתיה?', 'יש קנאה שאת מתביישת בה? מה יש מתחתיה?', 'יש קנאה שאתם מתביישים בה? מה יש מתחתיה?'],
  // emotions 7 ביטחון עצמי
  ['emotions__7', 'Where do you feel completely sure of yourself?', 'איפה אתה מרגיש בטוח בעצמך לגמרי?', 'איפה את מרגישה בטוחה בעצמך לגמרי?', 'איפה אתם מרגישים בטוחים בעצמכם לגמרי?'],
  ['emotions__7', 'Whose voice do you hear when you doubt yourself?', 'של מי הקול שאתה שומע כשאתה מטיל ספק בעצמך?', 'של מי הקול שאת שומעת כשאת מטילה ספק בעצמך?', 'של מי הקול שאתם שומעים כשאתם מטילים ספק בעצמכם?'],
  ['emotions__7', 'What would you try if you were sure you would be good at it?', 'מה היית מנסה, אם היית בטוח שתצליח בזה?', 'מה היית מנסה, אם היית בטוחה שתצליחי בזה?', 'מה הייתם מנסים, אם הייתם בטוחים שתצליחו בזה?'],
  // emotions 8 מחשבות
  ['emotions__8', 'Which thought keeps coming back to you this week?', 'איזו מחשבה חוזרת אליך השבוע שוב ושוב?', 'איזו מחשבה חוזרת אלייך השבוע שוב ושוב?', 'איזו מחשבה חוזרת אליכם השבוע שוב ושוב?'],
  ['emotions__8', 'Which of your thoughts would you not say out loud to a friend?', 'איזו מחשבה שלך לא היית אומר בקול לחבר?', 'איזו מחשבה שלך לא היית אומרת בקול לחברה?', 'איזו מחשבה שלכם לא הייתם אומרים בקול לחברים?'],
  ['emotions__8', 'What do you think about just before you fall asleep?', 'על מה אתה חושב רגע לפני שאתה נרדם?', 'על מה את חושבת רגע לפני שאת נרדמת?', 'על מה אתם חושבים רגע לפני שאתם נרדמים?'],
  // emotions 9 איך אני מתמודד עם רגשות
  ['emotions__9', 'What do you do with a feeling you do not want to feel?', 'מה אתה עושה עם רגש שאתה לא רוצה להרגיש?', 'מה את עושה עם רגש שאת לא רוצה להרגיש?', 'מה אתם עושים עם רגש שאתם לא רוצים להרגיש?'],
  ['emotions__9', 'Which feeling is hardest for you to show in front of others?', 'איזה רגש הכי קשה לך להראות מול אחרים?', '=', 'איזה רגש הכי קשה לכם להראות מול אחרים?'],
  ['emotions__9', 'What helps you calm down when everything is too much?', 'מה עוזר לך להירגע, כשהכול יותר מדי?', '=', 'מה עוזר לכם להירגע, כשהכול יותר מדי?'],

  // people 0 אנשים באופן כללי
  ['people__0', 'What do you notice first about someone new?', 'מה אתה שם לב אליו ראשון אצל אדם חדש?', 'מה את שמה לב אליו ראשון אצל אדם חדש?', 'מה אתם שמים לב אליו ראשון אצל אדם חדש?'],
  ['people__0', 'Who in your life makes you a better version of yourself?', 'מי בחיים שלך הופך אותך לגרסה טובה יותר של עצמך?', '=', 'מי בחיים שלכם הופך אתכם לגרסה טובה יותר של עצמכם?'],
  ['people__0', 'What kind of people drain you, and why?', 'אילו אנשים מרוקנים אותך, ולמה?', '=', 'אילו אנשים מרוקנים אתכם, ולמה?'],
  // people 1 חברות
  ['people__1', 'Which of your friends would you call at three in the morning?', 'למי מהחברים שלך היית מתקשר בשלוש לפנות בוקר?', 'למי מהחברים שלך היית מתקשרת בשלוש לפנות בוקר?', 'למי מהחברים שלכם הייתם מתקשרים בשלוש לפנות בוקר?'],
  ['people__1', 'Which friendship have you let fade, and do you miss it?', 'איזו חברות נתת לה לדעוך, ואתה מתגעגע אליה?', 'איזו חברות נתת לה לדעוך, ואת מתגעגעת אליה?', 'איזו חברות נתתם לה לדעוך, ואתם מתגעגעים אליה?'],
  ['people__1', 'What kind of friend are you, really?', 'איזה חבר אתה, באמת?', 'איזו חברה את, באמת?', 'איזה חברים אתם, באמת?'],
  // people 2 אהבה וזוגיות
  ['people__2', 'What did you learn about love from the couples you grew up around?', 'מה למדת על אהבה מהזוגות שגדלת לידם?', '=', 'מה למדתם על אהבה מהזוגות שגדלתם לידם?'],
  ['people__2', 'What do you need from a partner that is hard for you to ask for?', 'מה אתה צריך מבן או בת זוג, שקשה לך לבקש?', 'מה את צריכה מבן או בת זוג, שקשה לך לבקש?', 'מה אתם צריכים מבן או בת זוג, שקשה לכם לבקש?'],
  ['people__2', 'What makes you feel close to someone?', 'מה גורם לך להרגיש קרוב למישהו?', 'מה גורם לך להרגיש קרובה למישהו?', 'מה גורם לכם להרגיש קרובים למישהו?'],
  // people 3 משפחה
  ['people__3', 'What did you get from your family that you want to keep?', 'מה קיבלת מהמשפחה שלך, שאתה רוצה לשמור?', 'מה קיבלת מהמשפחה שלך, שאת רוצה לשמור?', 'מה קיבלתם מהמשפחה שלכם, שאתם רוצים לשמור?'],
  ['people__3', 'What do you want to do differently from the way you were raised?', 'מה אתה רוצה לעשות אחרת ממה שגידלו אותך?', 'מה את רוצה לעשות אחרת ממה שגידלו אותך?', 'מה אתם רוצים לעשות אחרת ממה שגידלו אתכם?'],
  ['people__3', 'Who in your family do you understand better today than you used to?', 'את מי במשפחה אתה מבין היום יותר טוב מפעם?', 'את מי במשפחה את מבינה היום יותר טוב מפעם?', 'את מי במשפחה אתם מבינים היום יותר טוב מפעם?'],
  // people 4 אמון
  ['people__4', 'Who do you trust without thinking twice, and how was that built?', 'על מי אתה סומך בלי לחשוב פעמיים, ואיך זה נבנה?', 'על מי את סומכת בלי לחשוב פעמיים, ואיך זה נבנה?', 'על מי אתם סומכים בלי לחשוב פעמיים, ואיך זה נבנה?'],
  ['people__4', 'When was your trust broken, and what did it change in you?', 'מתי פגעו באמון שלך, ומה זה שינה בך?', '=', 'מתי פגעו באמון שלכם, ומה זה שינה בכם?'],
  ['people__4', 'Who trusts you more than you trust yourself?', 'מי סומך עליך יותר ממה שאתה סומך על עצמך?', 'מי סומך עלייך יותר ממה שאת סומכת על עצמך?', 'מי סומך עליכם יותר ממה שאתם סומכים על עצמכם?'],
  // people 5 גבולות
  ['people__5', 'What did you say yes to this week when you wanted to say no?', 'על מה אמרת כן השבוע, כשרצית להגיד לא?', '=', 'על מה אמרתם כן השבוע, כשרציתם להגיד לא?'],
  ['people__5', 'Which of your boundaries do people cross most often?', 'איזה גבול שלך אנשים חוצים הכי הרבה?', '=', 'איזה גבול שלכם אנשים חוצים הכי הרבה?'],
  ['people__5', 'Whose disappointment do you fear most when you say no?', 'האכזבה של מי הכי מפחידה אותך כשאתה אומר לא?', 'האכזבה של מי הכי מפחידה אותך כשאת אומרת לא?', 'האכזבה של מי הכי מפחידה אתכם כשאתם אומרים לא?'],
  // people 6 קונפליקטים
  ['people__6', 'Which conversation have you been putting off?', 'איזו שיחה אתה דוחה כבר הרבה זמן?', 'איזו שיחה את דוחה כבר הרבה זמן?', 'איזו שיחה אתם דוחים כבר הרבה זמן?'],
  ['people__6', 'In an argument, do you fight, run, or freeze?', 'בוויכוח, אתה נלחם, בורח או קופא?', 'בוויכוח, את נלחמת, בורחת או קופאת?', 'בוויכוח, אתם נלחמים, בורחים או קופאים?'],
  ['people__6', 'What did a fight teach you that you would not have learned otherwise?', 'מה לימד אותך ריב, שלא היית לומד אחרת?', 'מה לימד אותך ריב, שלא היית לומדת אחרת?', 'מה לימד אתכם ריב, שלא הייתם לומדים אחרת?'],
  // people 7 נתינה וקבלה
  ['people__7', 'Which is easier for you, giving or receiving? Why?', 'מה קל לך יותר, לתת או לקבל? למה?', '=', 'מה קל לכם יותר, לתת או לקבל? למה?'],
  ['people__7', 'What did someone give you that you never thanked them for?', 'מה מישהו נתן לך, ולא הודית לו על זה אף פעם?', '=', 'מה מישהו נתן לכם, ולא הודיתם לו על זה אף פעם?'],
  ['people__7', 'When does your giving stop being a gift and become a burden?', 'מתי הנתינה שלך מפסיקה להיות מתנה ונהיית עול?', '=', 'מתי הנתינה שלכם מפסיקה להיות מתנה ונהיית עול?'],
  // people 8 ציפיות מאנשים
  ['people__8', 'What do you expect from people without ever saying it?', 'מה אתה מצפה מאנשים, בלי להגיד את זה אף פעם?', 'מה את מצפה מאנשים, בלי להגיד את זה אף פעם?', 'מה אתם מצפים מאנשים, בלי להגיד את זה אף פעם?'],
  ['people__8', 'Whose expectations of you are you still trying to meet?', 'בציפיות של מי אתה עדיין מנסה לעמוד?', 'בציפיות של מי את עדיין מנסה לעמוד?', 'בציפיות של מי אתם עדיין מנסים לעמוד?'],
  ['people__8', 'Which disappointment came from your expectation, not from the person?', 'איזו אכזבה שלך באה מהציפייה, ולא מהאדם עצמו?', '=', 'איזו אכזבה שלכם באה מהציפייה, ולא מהאדם עצמו?'],
  // people 9 להיפרד מאנשים
  ['people__9', 'Who did you part from, and what did it free in you?', 'ממי נפרדת, ומה זה שחרר בך?', '=', 'ממי נפרדתם, ומה זה שחרר בכם?'],
  ['people__9', 'Is there someone you should let go of, but are still holding on to?', 'יש מישהו שהיית צריך להיפרד ממנו, ואתה עדיין מחזיק?', 'יש מישהו שהיית צריכה להיפרד ממנו, ואת עדיין מחזיקה?', 'יש מישהו שהייתם צריכים להיפרד ממנו, ואתם עדיין מחזיקים?'],
  ['people__9', 'What would you say to someone who left your life, if you could?', 'מה היית אומר למישהו שיצא מהחיים שלך, אם היית יכול?', 'מה היית אומרת למישהו שיצא מהחיים שלך, אם היית יכולה?', 'מה הייתם אומרים למישהו שיצא מהחיים שלכם, אם הייתם יכולים?'],

  // life 0 זמן
  ['life__0', 'What did your time go to this week that you would like back?', 'על מה הלך לך זמן השבוע, שהיית רוצה לקבל בחזרה?', '=', 'על מה הלך לכם זמן השבוע, שהייתם רוצים לקבל בחזרה?'],
  ['life__0', 'When did you last forget to look at the clock? What were you doing?', 'מתי בפעם האחרונה שכחת להסתכל על השעון? מה עשית?', '=', 'מתי בפעם האחרונה שכחתם להסתכל על השעון? מה עשיתם?'],
  ['life__0', 'What are you waiting for the right moment to do?', 'מה אתה מחכה לזמן הנכון כדי לעשות?', 'מה את מחכה לזמן הנכון כדי לעשות?', 'מה אתם מחכים לזמן הנכון כדי לעשות?'],
  // life 1 משמעות
  ['life__1', 'When did you last feel that what you were doing truly mattered?', 'מתי בפעם האחרונה הרגשת שמה שאתה עושה באמת חשוב?', 'מתי בפעם האחרונה הרגשת שמה שאת עושה באמת חשוב?', 'מתי בפעם האחרונה הרגשתם שמה שאתם עושים באמת חשוב?'],
  ['life__1', 'Who would notice if you stopped doing what you do?', 'למי זה היה חסר, אם היית מפסיק לעשות את מה שאתה עושה?', 'למי זה היה חסר, אם היית מפסיקה לעשות את מה שאת עושה?', 'למי זה היה חסר, אם הייתם מפסיקים לעשות את מה שאתם עושים?'],
  ['life__1', 'What gives an ordinary day meaning for you?', 'מה נותן משמעות ליום רגיל אצלך?', '=', 'מה נותן משמעות ליום רגיל אצלכם?'],
  // life 2 אושר
  ['life__2', 'What makes you happy that has nothing to do with success?', 'מה משמח אותך, שאין לו שום קשר להצלחה?', '=', 'מה משמח אתכם, שאין לו שום קשר להצלחה?'],
  ['life__2', 'When did you last feel that nothing was missing?', 'מתי בפעם האחרונה הרגשת ששום דבר לא חסר?', '=', 'מתי בפעם האחרונה הרגשתם ששום דבר לא חסר?'],
  ['life__2', 'After what do you tell yourself you will be happy?', 'אחרי מה אתה אומר לעצמך שתהיה מאושר?', 'אחרי מה את אומרת לעצמך שתהיי מאושרת?', 'אחרי מה אתם אומרים לעצמכם שתהיו מאושרים?'],
  // life 3 סבל
  ['life__3', 'Which hard time made you who you are today?', 'איזו תקופה קשה הפכה אותך למי שאתה היום?', 'איזו תקופה קשה הפכה אותך למי שאת היום?', 'איזו תקופה קשה הפכה אתכם למי שאתם היום?'],
  ['life__3', 'Which pain do you keep going back to, even though it is over?', 'לאיזה כאב אתה חוזר שוב, למרות שהוא נגמר?', 'לאיזה כאב את חוזרת שוב, למרות שהוא נגמר?', 'לאיזה כאב אתם חוזרים שוב, למרות שהוא נגמר?'],
  ['life__3', 'What do you need to hear on a bad day?', 'מה אתה צריך לשמוע ביום רע?', 'מה את צריכה לשמוע ביום רע?', 'מה אתם צריכים לשמוע ביום רע?'],
  // life 4 שינוי
  ['life__4', 'What changed in you this year without you deciding it?', 'מה השתנה בך השנה, בלי שהחלטת על זה?', '=', 'מה השתנה בכם השנה, בלי שהחלטתם על זה?'],
  ['life__4', 'Which change do you want but are not yet ready to pay for?', 'איזה שינוי אתה רוצה, אבל עוד לא מוכן לשלם עליו?', 'איזה שינוי את רוצה, אבל עוד לא מוכנה לשלם עליו?', 'איזה שינוי אתם רוצים, אבל עוד לא מוכנים לשלם עליו?'],
  ['life__4', 'What would you want to stay exactly as it is, no matter what?', 'מה היית רוצה שיישאר בדיוק כמו שהוא, לא משנה מה?', '=', 'מה הייתם רוצים שיישאר בדיוק כמו שהוא, לא משנה מה?'],
  // life 5 בחירה וחופש
  ['life__5', 'Which choice in your life did you not really choose?', 'איזו בחירה בחיים שלך לא באמת בחרת?', '=', 'איזו בחירה בחיים שלכם לא באמת בחרתם?'],
  ['life__5', 'When do you feel most free?', 'מתי אתה מרגיש הכי חופשי?', 'מתי את מרגישה הכי חופשייה?', 'מתי אתם מרגישים הכי חופשיים?'],
  ['life__5', 'What would you do differently if no one were watching?', 'מה היית עושה אחרת, אם אף אחד לא היה מסתכל?', '=', 'מה הייתם עושים אחרת, אם אף אחד לא היה מסתכל?'],
  // life 6 מזל
  ['life__6', 'What luck have you had that you never really gave thanks for?', 'איזה מזל היה לך, שלא באמת הודית עליו?', '=', 'איזה מזל היה לכם, שלא באמת הודיתם עליו?'],
  ['life__6', 'Which bad luck turned out, later on, to be good for you?', 'איזה מזל רע התברר אחר כך כטוב בשבילך?', '=', 'איזה מזל רע התברר אחר כך כטוב בשבילכם?'],
  ['life__6', 'Which chance meeting changed your life?', 'איזה מפגש מקרי שינה לך את החיים?', '=', 'איזה מפגש מקרי שינה לכם את החיים?'],
  // life 7 מוות
  ['life__7', 'What would you want people to say about you that is not true yet?', 'מה היית רוצה שיגידו עליך, שעדיין לא נכון היום?', 'מה היית רוצה שיגידו עלייך, שעדיין לא נכון היום?', 'מה הייתם רוצים שיגידו עליכם, שעדיין לא נכון היום?'],
  ['life__7', 'If you had one year left, what would you stop doing?', 'אם הייתה נשארת לך שנה אחת, מה היית מפסיק לעשות?', 'אם הייתה נשארת לך שנה אחת, מה היית מפסיקה לעשות?', 'אם הייתה נשארת לכם שנה אחת, מה הייתם מפסיקים לעשות?'],
  ['life__7', 'Who would you want beside you at the end?', 'את מי היית רוצה לידך בסוף?', '=', 'את מי הייתם רוצים לידכם בסוף?'],
  // life 8 חרטה
  ['life__8', 'Which of your decisions hurt, and you would still make it again?', 'איזו החלטה שלך כאבה, ובכל זאת היית מקבל אותה שוב?', 'איזו החלטה שלך כאבה, ובכל זאת היית מקבלת אותה שוב?', 'איזו החלטה שלכם כאבה, ובכל זאת הייתם מקבלים אותה שוב?'],
  ['life__8', 'What do you regret not saying?', 'על מה אתה מצטער שלא אמרת?', 'על מה את מצטערת שלא אמרת?', 'על מה אתם מצטערים שלא אמרתם?'],
  ['life__8', 'Which of your regrets can still be put right?', 'איזו חרטה שלך עוד אפשר לתקן?', '=', 'איזו חרטה שלכם עוד אפשר לתקן?'],
  // life 9 מה הופך חיים לטובים
  ['life__9', 'Describe a good ordinary day. What is in it?', 'תאר יום רגיל וטוב. מה יש בו?', 'תארי יום רגיל וטוב. מה יש בו?', 'תארו יום רגיל וטוב. מה יש בו?'],
  ['life__9', 'What do you have today that you once only dreamed of?', 'מה יש לך היום, שפעם רק חלמת עליו?', '=', 'מה יש לכם היום, שפעם רק חלמתם עליו?'],
  ['life__9', 'What makes your life good that money cannot buy?', 'מה הופך את החיים שלך לטובים, שאי אפשר לקנות בכסף?', '=', 'מה הופך את החיים שלכם לטובים, שאי אפשר לקנות בכסף?'],

  // success 0 עבודה
  ['success__0', 'Which part of your work would you do even without pay?', 'איזה חלק בעבודה שלך היית עושה גם בלי שכר?', '=', 'איזה חלק בעבודה שלכם הייתם עושים גם בלי שכר?'],
  ['success__0', 'When do you lose track of time at work?', 'מתי אתה שוכח את הזמן בעבודה?', 'מתי את שוכחת את הזמן בעבודה?', 'מתי אתם שוכחים את הזמן בעבודה?'],
  ['success__0', 'What does your work take from you that it should not?', 'מה העבודה לוקחת ממך, שהיא לא אמורה לקחת?', '=', 'מה העבודה לוקחת מכם, שהיא לא אמורה לקחת?'],
  // success 1 כסף
  ['success__1', 'What do you hope money will give you, that maybe it does not really give?', 'מה אתה מקווה שהכסף ייתן לך, שאולי הוא לא באמת נותן?', 'מה את מקווה שהכסף ייתן לך, שאולי הוא לא באמת נותן?', 'מה אתם מקווים שהכסף ייתן לכם, שאולי הוא לא באמת נותן?'],
  ['success__1', 'What did you learn about money at home?', 'מה למדת על כסף בבית?', '=', 'מה למדתם על כסף בבית?'],
  ['success__1', 'What did you spend money on recently that was completely worth it?', 'על מה הוצאת כסף לאחרונה, וזה היה שווה לגמרי?', '=', 'על מה הוצאתם כסף לאחרונה, וזה היה שווה לגמרי?'],
  // success 2 שאפתנות
  ['success__2', 'Who are you trying to prove something to?', 'למי אתה מנסה להוכיח משהו?', 'למי את מנסה להוכיח משהו?', 'למי אתם מנסים להוכיח משהו?'],
  ['success__2', 'What would be enough for you?', 'מה יהיה מספיק בשבילך?', '=', 'מה יהיה מספיק בשבילכם?'],
  ['success__2', 'Which dream did you give up, and was it right to?', 'על איזה חלום ויתרת, והאם זה היה נכון?', '=', 'על איזה חלום ויתרתם, והאם זה היה נכון?'],
  // success 3 כישלון
  ['success__3', 'Which failure taught you more than any success?', 'איזה כישלון לימד אותך יותר מכל הצלחה?', '=', 'איזה כישלון לימד אתכם יותר מכל הצלחה?'],
  ['success__3', 'What would you try if failing did not matter?', 'מה היית מנסה, אם לכישלון לא הייתה משמעות?', '=', 'מה הייתם מנסים, אם לכישלון לא הייתה משמעות?'],
  ['success__3', 'How do you talk to yourself after you fail?', 'איך אתה מדבר לעצמך אחרי שאתה נכשל?', 'איך את מדברת לעצמך אחרי שאת נכשלת?', 'איך אתם מדברים לעצמכם אחרי שאתם נכשלים?'],
  // success 4 הצלחה
  ['success__4', 'Which success of yours did no one see, though you know you earned it?', 'איזו הצלחה שלך אף אחד לא ראה, אבל אתה יודע שהרווחת?', 'איזו הצלחה שלך אף אחד לא ראה, אבל את יודעת שהרווחת?', 'איזו הצלחה שלכם אף אחד לא ראה, אבל אתם יודעים שהרווחתם?'],
  ['success__4', 'How would you know you had succeeded, without anyone telling you?', 'איך תדע שהצלחת, בלי שאף אחד יגיד לך?', 'איך תדעי שהצלחת, בלי שאף אחד יגיד לך?', 'איך תדעו שהצלחתם, בלי שאף אחד יגיד לכם?'],
  ['success__4', 'Whose definition of success are you living by?', 'לפי ההגדרה של מי להצלחה אתה חי?', 'לפי ההגדרה של מי להצלחה את חיה?', 'לפי ההגדרה של מי להצלחה אתם חיים?'],
  // success 5 משמעת
  ['success__5', 'What do you do even on days you have no energy?', 'מה אתה עושה גם בימים שאין לך כוח?', 'מה את עושה גם בימים שאין לך כוח?', 'מה אתם עושים גם בימים שאין לכם כוח?'],
  ['success__5', 'Where would a little more discipline give you a lot more freedom?', 'איפה קצת יותר משמעת הייתה נותנת לך הרבה יותר חופש?', '=', 'איפה קצת יותר משמעת הייתה נותנת לכם הרבה יותר חופש?'],
  ['success__5', 'Which habit have you built that you are proud of?', 'איזה הרגל בנית, שאתה גאה בו?', 'איזה הרגל בנית, שאת גאה בו?', 'איזה הרגל בניתם, שאתם גאים בו?'],
  // success 6 מוטיבציה
  ['success__6', 'What gets you out of bed on a hard morning?', 'מה מוציא אותך מהמיטה בבוקר קשה?', '=', 'מה מוציא אתכם מהמיטה בבוקר קשה?'],
  ['success__6', 'When did you last do something only because you wanted to?', 'מתי בפעם האחרונה עשית משהו רק כי רצית?', '=', 'מתי בפעם האחרונה עשיתם משהו רק כי רציתם?'],
  ['success__6', 'What used to drive you that no longer does?', 'מה פעם הניע אותך, והיום כבר לא?', '=', 'מה פעם הניע אתכם, והיום כבר לא?'],
  // success 7 יצירתיות
  ['success__7', 'When did you last make something with your hands?', 'מתי בפעם האחרונה יצרת משהו בידיים?', '=', 'מתי בפעם האחרונה יצרתם משהו בידיים?'],
  ['success__7', 'What would you create if no one would ever see it?', 'מה היית יוצר, אם אף אחד לא היה רואה את זה אף פעם?', 'מה היית יוצרת, אם אף אחד לא היה רואה את זה אף פעם?', 'מה הייתם יוצרים, אם אף אחד לא היה רואה את זה אף פעם?'],
  ['success__7', 'Where do your best ideas come to you?', 'איפה מגיעים אליך הרעיונות הכי טובים שלך?', 'איפה מגיעים אלייך הרעיונות הכי טובים שלך?', 'איפה מגיעים אליכם הרעיונות הכי טובים שלכם?'],
  // success 8 השוואה לאחרים
  ['success__8', 'Who do you compare yourself to most, and what does it cost you?', 'למי אתה הכי משווה את עצמך, ומה זה עולה לך?', 'למי את הכי משווה את עצמך, ומה זה עולה לך?', 'למי אתם הכי משווים את עצמכם, ומה זה עולה לכם?'],
  ['success__8', 'In what have you moved forward compared with who you were a year ago?', 'במה התקדמת לעומת מי שהיית לפני שנה?', '=', 'במה התקדמתם לעומת מי שהייתם לפני שנה?'],
  ['success__8', 'Whose life looks easier to you than it really is?', 'החיים של מי נראים לך קלים יותר ממה שהם באמת?', '=', 'החיים של מי נראים לכם קלים יותר ממה שהם באמת?'],
  // success 9 מה באמת שווה את המאמץ
  ['success__9', 'What was hard, and worth every minute?', 'מה היה קשה, ושווה כל דקה?', '=', '='],
  ['success__9', 'What are you putting effort into that you would drop if you were honest?', 'במה אתה משקיע מאמץ, שהיית מוותר עליו אם היית כנה?', 'במה את משקיעה מאמץ, שהיית מוותרת עליו אם היית כנה?', 'במה אתם משקיעים מאמץ, שהייתם מוותרים עליו אם הייתם כנים?'],
  ['success__9', 'What deserves more of your effort than it gets?', 'מה מגיע לו יותר מהמאמץ שלך ממה שהוא מקבל?', '=', 'מה מגיע לו יותר מהמאמץ שלכם ממה שהוא מקבל?'],

  // world 0 החברה
  ['world__0', 'Which social rule do you keep without believing in it?', 'איזה כלל חברתי אתה שומר עליו, בלי להאמין בו?', 'איזה כלל חברתי את שומרת עליו, בלי להאמין בו?', 'איזה כלל חברתי אתם שומרים עליו, בלי להאמין בו?'],
  ['world__0', 'Where do you feel you belong?', 'איפה אתה מרגיש שאתה שייך?', 'איפה את מרגישה שאת שייכת?', 'איפה אתם מרגישים שאתם שייכים?'],
  ['world__0', 'If you could change one thing in the society you live in, what would it be?', 'אם היית יכול לשנות דבר אחד בחברה שאתה חי בה, מה זה היה?', 'אם היית יכולה לשנות דבר אחד בחברה שאת חיה בה, מה זה היה?', 'אם הייתם יכולים לשנות דבר אחד בחברה שאתם חיים בה, מה זה היה?'],
  // world 1 מוסר
  ['world__1', 'When did you do the right thing even though it cost you?', 'מתי עשית את הדבר הנכון, למרות שזה עלה לך?', '=', 'מתי עשיתם את הדבר הנכון, למרות שזה עלה לכם?'],
  ['world__1', 'Where, for you, is the line between a white lie and a lie?', 'איפה עובר אצלך הקו בין שקר לבן לשקר?', '=', 'איפה עובר אצלכם הקו בין שקר לבן לשקר?'],
  ['world__1', 'Which of your views on right and wrong has changed?', 'איזו דעה שלך על טוב ורע השתנתה?', '=', 'איזו דעה שלכם על טוב ורע השתנתה?'],
  // world 2 כוח
  ['world__2', 'Where do you have more power than you use?', 'איפה יש לך יותר כוח ממה שאתה משתמש בו?', 'איפה יש לך יותר כוח ממה שאת משתמשת בו?', 'איפה יש לכם יותר כוח ממה שאתם משתמשים בו?'],
  ['world__2', 'Who has power over you that you have never questioned?', 'למי יש כוח עליך, שלא שאלת עליו שאלות אף פעם?', 'למי יש כוח עלייך, שלא שאלת עליו שאלות אף פעם?', 'למי יש כוח עליכם, שלא שאלתם עליו שאלות אף פעם?'],
  ['world__2', 'How do you behave when you are the stronger one?', 'איך אתה מתנהג כשאתה החזק?', 'איך את מתנהגת כשאת החזקה?', 'איך אתם מתנהגים כשאתם החזקים?'],
  // world 3 פוליטיקה
  ['world__3', 'Which of your positions would be hardest to change?', 'איזו עמדה שלך הכי קשה היה לשנות?', '=', 'איזו עמדה שלכם הכי קשה היה לשנות?'],
  ['world__3', 'When did you last really listen to someone you disagree with?', 'מתי בפעם האחרונה הקשבת באמת למישהו שאתה לא מסכים איתו?', 'מתי בפעם האחרונה הקשבת באמת למישהו שאת לא מסכימה איתו?', 'מתי בפעם האחרונה הקשבתם באמת למישהו שאתם לא מסכימים איתו?'],
  ['world__3', 'What do you care about that no party represents?', 'מה חשוב לך, שאף מפלגה לא מייצגת?', '=', 'מה חשוב לכם, שאף מפלגה לא מייצגת?'],
  // world 4 תרבות
  ['world__4', 'Which book, film or song changed how you see something?', 'איזה סרט, שיר או משהו שקראת שינה לך את המבט על משהו?', '=', 'איזה סרט, שיר או משהו שקראתם שינה לכם את המבט על משהו?'],
  ['world__4', 'What from your culture do you want to pass on?', 'מה מהתרבות שלך אתה רוצה להעביר הלאה?', 'מה מהתרבות שלך את רוצה להעביר הלאה?', 'מה מהתרבות שלכם אתם רוצים להעביר הלאה?'],
  ['world__4', 'What from your culture do you choose not to carry on?', 'מה מהתרבות שלך אתה בוחר לא להמשיך?', 'מה מהתרבות שלך את בוחרת לא להמשיך?', 'מה מהתרבות שלכם אתם בוחרים לא להמשיך?'],
  // world 5 טכנולוגיה
  ['world__5', 'What does your phone take from you, and what does it give?', 'מה הטלפון גוזל ממך, ומה הוא נותן?', '=', 'מה הטלפון גוזל מכם, ומה הוא נותן?'],
  ['world__5', 'What would you do with an hour without a screen?', 'מה היית עושה עם שעה בלי מסך?', '=', 'מה הייתם עושים עם שעה בלי מסך?'],
  ['world__5', 'Which technology really made your life better?', 'איזו טכנולוגיה באמת שיפרה לך את החיים?', '=', 'איזו טכנולוגיה באמת שיפרה לכם את החיים?'],
  // world 6 טבע
  ['world__6', 'When did you last stop to look at the sky?', 'מתי בפעם האחרונה עצרת להסתכל על השמיים?', '=', 'מתי בפעם האחרונה עצרתם להסתכל על השמיים?'],
  ['world__6', 'Which place in nature calms you?', 'איזה מקום בטבע מרגיע אותך?', '=', 'איזה מקום בטבע מרגיע אתכם?'],
  ['world__6', 'What did you notice outside today?', 'מה שמת לב אליו בחוץ היום?', '=', 'מה שמתם לב אליו בחוץ היום?'],
  // world 7 אמונות של אנשים
  ['world__7', 'What do you believe that most people around you do not?', 'במה אתה מאמין, שרוב האנשים סביבך לא?', 'במה את מאמינה, שרוב האנשים סביבך לא?', 'במה אתם מאמינים, שרוב האנשים סביבכם לא?'],
  ['world__7', 'Which belief did you once hold and let go of?', 'באיזו אמונה החזקת פעם, ושחררת?', '=', 'באיזו אמונה החזקתם פעם, ושחררתם?'],
  ['world__7', 'Whose faith seems beautiful to you, even though it is not yours?', 'האמונה של מי נראית לך יפה, גם אם היא לא שלך?', '=', 'האמונה של מי נראית לכם יפה, גם אם היא לא שלכם?'],
  // world 8 איך העולם באמת עובד
  ['world__8', 'What did you learn about the world that no one taught you at school?', 'מה למדת על העולם, שאף אחד לא לימד אותך בבית הספר?', '=', 'מה למדתם על העולם, שאף אחד לא לימד אתכם בבית הספר?'],
  ['world__8', 'What do you think most people get wrong about how things work?', 'במה לדעתך רוב האנשים טועים לגבי איך דברים עובדים?', '=', 'במה לדעתכם רוב האנשים טועים לגבי איך דברים עובדים?'],
  ['world__8', 'What surprised you about being a grown-up?', 'מה הפתיע אותך בלהיות מבוגר?', 'מה הפתיע אותך בלהיות מבוגרת?', 'מה הפתיע אתכם בלהיות מבוגרים?'],
  // world 9 דברים שאני לא מבין
  ['world__9', 'What do you not understand about yourself?', 'מה אתה לא מבין בעצמך?', 'מה את לא מבינה בעצמך?', 'מה אתם לא מבינים בעצמכם?'],
  ['world__9', 'What do other people do that you simply do not get?', 'מה אנשים אחרים עושים, שאתה פשוט לא מבין?', 'מה אנשים אחרים עושים, שאת פשוט לא מבינה?', 'מה אנשים אחרים עושים, שאתם פשוט לא מבינים?'],
  ['world__9', 'What would you ask someone who sees the world the opposite way?', 'מה היית שואל מישהו עם השקפת עולם הפוכה משלך?', 'מה היית שואלת מישהו עם השקפת עולם הפוכה משלך?', 'מה הייתם שואלים מישהו עם השקפת עולם הפוכה משלכם?'],

  // notebook 0 תובנות שאני רוצה לזכור
  ['notebook__0', 'What did you understand this week that you do not want to forget?', 'מה הבנת השבוע, שאתה לא רוצה לשכוח?', 'מה הבנת השבוע, שאת לא רוצה לשכוח?', 'מה הבנתם השבוע, שאתם לא רוצים לשכוח?'],
  ['notebook__0', 'What would you write to yourself for a hard day?', 'מה היית כותב לעצמך ליום קשה?', 'מה היית כותבת לעצמך ליום קשה?', 'מה הייתם כותבים לעצמכם ליום קשה?'],
  ['notebook__0', 'Which sentence someone said to you is still with you?', 'איזה משפט שמישהו אמר לך עדיין איתך?', '=', 'איזה משפט שמישהו אמר לכם עדיין איתכם?'],
  // notebook 1 דברים ששיניתי בהם את דעתי
  ['notebook__1', 'What did you change your mind about this year?', 'על מה שינית את דעתך השנה?', '=', 'על מה שיניתם את דעתכם השנה?'],
  ['notebook__1', 'What made you change your mind: a person, an experience, or time?', 'מה גרם לך לשנות את דעתך: אדם, חוויה, או זמן?', '=', 'מה גרם לכם לשנות את דעתכם: אדם, חוויה, או זמן?'],
  ['notebook__1', 'Which of your opinions would you be ready to change tomorrow?', 'איזו דעה שלך היית מוכן לשנות כבר מחר?', 'איזו דעה שלך היית מוכנה לשנות כבר מחר?', 'איזו דעה שלכם הייתם מוכנים לשנות כבר מחר?'],
  // notebook 2 סתירות שמצאתי בעצמי
  ['notebook__2', 'Where do you say one thing and do another?', 'איפה אתה אומר דבר אחד ועושה דבר אחר?', 'איפה את אומרת דבר אחד ועושה דבר אחר?', 'איפה אתם אומרים דבר אחד ועושים דבר אחר?'],
  ['notebook__2', 'Which two things you want pull in opposite directions?', 'אילו שני דברים שאתה רוצה מושכים לכיוונים הפוכים?', 'אילו שני דברים שאת רוצה מושכים לכיוונים הפוכים?', 'אילו שני דברים שאתם רוצים מושכים לכיוונים הפוכים?'],
  ['notebook__2', 'Which contradiction in yourself have you made peace with?', 'עם איזו סתירה בעצמך השלמת?', '=', 'עם איזו סתירה בעצמכם השלמתם?'],
  // notebook 3 שאלות שאין לי עליהן תשובה
  ['notebook__3', 'Which question keeps you awake?', 'איזו שאלה משאירה אותך ער?', 'איזו שאלה משאירה אותך ערה?', 'איזו שאלה משאירה אתכם ערים?'],
  ['notebook__3', 'Which question are you afraid to answer?', 'על איזו שאלה אתה מפחד לענות?', 'על איזו שאלה את מפחדת לענות?', 'על איזו שאלה אתם מפחדים לענות?'],
  ['notebook__3', 'What would you ask yourself ten years from now?', 'מה היית שואל את עצמך בעוד עשר שנים?', 'מה היית שואלת את עצמך בעוד עשר שנים?', 'מה הייתם שואלים את עצמכם בעוד עשר שנים?'],
  // notebook 4 דברים שאני רוצה לבדוק בחיים
  ['notebook__4', 'What would you try if you knew you could always go back?', 'מה היית מנסה, אם היית יודע שתמיד אפשר לחזור?', 'מה היית מנסה, אם היית יודעת שתמיד אפשר לחזור?', 'מה הייתם מנסים, אם הייתם יודעים שתמיד אפשר לחזור?'],
  ['notebook__4', 'Which place do you want to see before you grow old?', 'איזה מקום אתה רוצה לראות לפני שתזדקן?', 'איזה מקום את רוצה לראות לפני שתזדקני?', 'איזה מקום אתם רוצים לראות לפני שתזדקנו?'],
  ['notebook__4', 'What have you always wanted to learn and keep putting off?', 'מה תמיד רצית ללמוד, ואתה ממשיך לדחות?', 'מה תמיד רצית ללמוד, ואת ממשיכה לדחות?', 'מה תמיד רציתם ללמוד, ואתם ממשיכים לדחות?'],
];

/* the screen's own words */
export const UI = [
  ['Dig deeper', 'חפור עמוק יותר', 'חפרי עמוק יותר', 'חפרו עמוק יותר'],
  ['A deeper question', 'שאלה לעומק', '=', '='],
  ['Answer', 'לענות', '=', '='],
];
