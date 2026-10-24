# Store listing — Arabic (written from en.md, the original)

Same promise and the same doors as the English, written for an Arabic reader
whose gender the listing does not know.

## App Store

**Name** (30)
Olimei

**Subtitle** (30)
تأمّل يومي

**Promotional text** (170)
كل مساء، بضعة أسئلة لطيفة عن اليوم كما عشته فعلًا: ماذا أكلت، وكيف تحرّكت، ومن رأيت. لا صفحة بيضاء، ولا شيء إلزامي.

**Keywords** (100, comma-separated, no words already in the name or subtitle)
مذكرات,مزاج,امتنان,عادات,طعام,وجبات,تغذية,رياضة,تمارين,لياقة,عناية ذاتية,صحة نفسية,روتين,مساء

**Description** (4000)

معظم الأيام تمضي وتُنسى. Olimei يحفظها.

كل مساء، يطرح عليك Olimei بضعة أسئلة عن يومك. ليست أسئلة عامة، بل أسئلة عن
اليوم الذي عشته فعلًا، مستمدّة مما دوّنته خلال النهار: الغداء الذي تناولته،
والتمرين الذي أدّيته، والصديق الذي اتصلت به. سؤال واحد في كل مرة، ولا استمارة
أبدًا. الإجابة عمّا تشاء، وتخطّي ما لا تشاء، والتوقّف في أي لحظة ثم العودة
لاحقًا: كل ذلك ممكن.

أسبوعًا بعد أسبوع، تتراكم هذه الأمسيات لتصنع ما لا يمنحك إياه أي تطبيق تتبّع:
صورة لحياتك.

لكل أنواع الأيام
• جرّبت كتابة اليوميات فغلبتك الصفحة البيضاء؟ هنا لا بداية من الصفر أبدًا.
• طعامك أو تمارينك قيد المتابعة أصلًا، والمطلوب أكثر من مجرد أرقام.
• أو ببساطة: الرغبة في تذكّر أيامك ومعرفة حالك على حقيقته.

إغلاق اليوم
قلب التطبيق. نظرة هادئة إلى يومك، دقائق قليلة قبل النوم. ملخص قصير أولًا، ثم
جولة أعمق متى شئت.

كل شيء يصبّ في المساء
• التغذية: تسجيل الوجبات بلغتك، من مكتبة أطعمة بُنيت لإحدى عشرة لغة.
• اللياقة: التمارين والمجموعات والتقدّم مع الوقت.
• الخزانة: تصوير ملابسك وتدوين ما ارتديته.
• أهلي وأصحابي: الأشخاص المهمّون في حياتك، ومتى تحدّثتما آخر مرة.
• التخطيط: تنظيم اليوم ساعة بساعة.
• اليوميات: كل ما كتبته، يومًا بيوم.

أسبوعك في جملة واحدة
في نهاية كل أسبوع، مراجعة قصيرة لما كان عليه، تُختتم بجملة واحدة تنتقل معك
إلى الأسبوع التالي.

هذا هو Beem
رفيق صغير على هيئة شمس، يؤنسك في الأمسيات ويحتفي بكل يوم من أيام حضورك.

لك وحدك
تبقى يومياتك على هاتفك. لا حساب، ولا تسجيل.

إحدى عشرة لغة
العربية، English، Español، Deutsch، Français، Italiano، Português، 日本語،
简体中文، 繁體中文 وעברית، كُتبت كل واحدة منها لقرّائها، لا بترجمة آلية.

## Google Play

**Title** (30)
Olimei: تأمّل يومي

**Short description** (80)
بضعة أسئلة لطيفة كل مساء، عن اليوم كما عشته فعلًا.

**Full description** (4000)
Same as the App Store description above.

## Notes

- **Address.** Unvocalised Arabic leaves most second-person forms ambiguous
  in writing (يومك، عشته، أكلت، حياتك), which is how data/lang/ar.json
  addresses the reader too. The forms that would visibly mark gender,
  imperatives (أجب، سجّل، تعرّف) and present-tense verbs (تريد، تبدأ، تحضر),
  were rephrased as verbal nouns: الإجابة… والتخطّي… ممكن, تسجيل الوجبات,
  هنا لا بداية من الصفر. No generic masculine was needed.
- **"When you last spoke"** is تحدّثتما, the dual: the reader and the other
  person, gender-free.
- **Name descriptor:** تأمّل يومي (daily reflection). The search word
  يوميات sits in the subtitle with the promise; مذكرات, its synonym, goes to
  keywords.
- **Subtitle:** "a journal that knows how your day went": يعرف يومك alone
  reads flat in Arabic; كيف مضى keeps the evening, looking-back framing.
- **Beem** stays in Latin letters. He is masculine (رفيق صغير على هيئة شمس,
  "a small companion in the shape of a sun"), since شمس is feminine in Arabic
  and would otherwise turn him into a she. "Celebrates the days you show up"
  became "celebrates every one of your days of showing up" (أيام حضورك),
  avoiding the gendered verb تحضر.
- **Headings** are short sentence phrases; "MEET BEEM" became هذا هو Beem
  ("this is Beem") to avoid the masculine imperative تعرّف.
- **Language list** opens with العربية for this reader, uses the Arabic comma
  ، and keeps every native name.
- **Keywords** avoid every word in the name and subtitle (تأمل، يومي، يوميات)
  and use what Arabic searchers type: مذكرات، مزاج، امتنان، عادات، عناية ذاتية،
  صحة نفسية. The field itself is comma-separated with ASCII commas, as the
  store parses it.
