/* The movement families (Asaf, 11 Nov): every exercise belongs to exactly one
 * parent - לחיצת חזה holds the bar, the dumbbells, the machine and the Smith -
 * and carries one difficulty and one equipment tag from short closed lists.
 *
 * Read by tools/build-exercises.mjs, which writes the family onto each row as
 * `f`, the difficulty as `lv`, the equipment tag as `eqt` and the finer
 * secondary muscles as `m2`, and the eleven names of every family into the
 * file's `families`. The family's primary muscle REPLACES the row's first
 * muscle - this list is where a movement's muscle is decided now.
 *
 * Columns: Hebrew name, primary muscle, secondary muscles, exercise numbers,
 * then en de es fr it pt ja zh-Hans zh-Hant ar.
 */
export const FAMILY_LANGS = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'];
export const FAMILIES = [
  ['לחיצת חזה', 'חזה', ['כתף קדמית', 'יד אחורית'], '1 2 3 4 5 6 7 8 9 10 11 237 26',
    'Chest Press', 'Brustdrücken', 'Press de pecho', 'Développé pectoral', 'Distensioni per il petto', 'Supino', 'チェストプレス', '卧推', '臥推', 'ضغط الصدر'],
  ['פרפר', 'חזה', ['כתף קדמית'], '12 13 14 15 16 17',
    'Chest Fly', 'Fliegende', 'Aperturas', 'Écarté', 'Croci', 'Crucifixo', 'フライ', '飞鸟', '飛鳥', 'تفتيح الصدر'],
  ['שכיבות סמיכה', 'חזה', ['כתף קדמית', 'יד אחורית', 'בטן'], '18 19 20 21 241 242 248',
    'Push-Up', 'Liegestütz', 'Flexiones', 'Pompes', 'Piegamenti', 'Flexão', '腕立て伏せ', '俯卧撑', '伏地挺身', 'تمرين الضغط'],
  ['מקבילים', 'חזה', ['יד אחורית', 'כתף קדמית'], '22 23',
    'Dip', 'Dips', 'Fondos', 'Dips', 'Dip', 'Paralelas', 'ディップス', '双杠臂屈伸', '雙槓撐體', 'تمرين الغطس'],
  ['חתירה', 'מעוינים וטרפז אמצעי', ['רחב גבי', 'כתף אחורית', 'יד קדמית'], '41 42 43 44 45 46 47 48 49 50 51 52 53 54 256 257 258',
    'Row', 'Rudern', 'Remo', 'Rowing', 'Rematore', 'Remada', 'ロウ', '划船', '划船', 'التجديف'],
  ['חתירה הפוכה', 'מעוינים וטרפז אמצעי', ['רחב גבי', 'יד קדמית', 'בטן'], '55 56',
    'Inverted Row', 'Umgekehrtes Rudern', 'Remo invertido', 'Rowing inversé', 'Rematore inverso', 'Remada invertida', 'インバーテッドロウ', '反向划船', '反向划船', 'التجديف المقلوب'],
  ['פולאובר', 'רחב גבי', ['חזה', 'יד אחורית'], '24 39',
    'Pullover', 'Überzüge', 'Pullover', 'Pull-over', 'Pullover', 'Pullover', 'プルオーバー', '仰卧上拉', '仰臥上拉', 'البول أوفر'],
  ['מתח', 'רחב גבי', ['יד קדמית', 'מעוינים', 'אמה'], '27 28 29 30 31 32 33',
    'Pull-Up', 'Klimmzug', 'Dominadas', 'Tractions', 'Trazioni', 'Barra fixa', '懸垂', '引体向上', '引體向上', 'العقلة'],
  ['פולי עליון', 'רחב גבי', ['יד קדמית', 'מעוינים'], '34 35 36 37 38 40',
    'Lat Pulldown', 'Latziehen', 'Jalón al pecho', 'Tirage vertical', 'Lat machine', 'Puxada', 'ラットプルダウン', '高位下拉', '高位下拉', 'السحب العلوي'],
  ['משיכת כתפיים', 'טרפז עליון', ['אמה'], '60 61 62 63 233',
    'Shrug', 'Shrugs', 'Encogimientos', 'Haussements d’épaules', 'Scrollate', 'Encolhimento', 'シュラッグ', '耸肩', '聳肩', 'هز الكتفين'],
  ['הרמת Y', 'טרפז עליון', ['כתף אחורית', 'טרפז תחתון'], '64',
    'Y Raise', 'Y-Heben', 'Elevación en Y', 'Élévation en Y', 'Alzate a Y', 'Elevação em Y', 'Yレイズ', 'Y字上举', 'Y字上舉', 'رفع Y'],
  ['לחיצת כתפיים', 'כתפיים', ['יד אחורית', 'טרפז עליון'], '25 71 72 73 74 75 76 77 93 243',
    'Shoulder Press', 'Schulterdrücken', 'Press de hombros', 'Développé épaules', 'Lento avanti', 'Desenvolvimento', 'ショルダープレス', '肩推', '肩推', 'ضغط الكتفين'],
  ['הרחקת כתף', 'כתפיים', ['טרפז עליון'], '78 79 80 81',
    'Lateral Raise', 'Seitheben', 'Elevaciones laterales', 'Élévations latérales', 'Alzate laterali', 'Elevação lateral', 'サイドレイズ', '侧平举', '側平舉', 'الرفرفة الجانبية'],
  ['הרמה קדמית', 'כתפיים', ['חזה עליון'], '82 83 84',
    'Front Raise', 'Frontheben', 'Elevaciones frontales', 'Élévations frontales', 'Alzate frontali', 'Elevação frontal', 'フロントレイズ', '前平举', '前平舉', 'الرفع الأمامي'],
  ['פרפר הפוך', 'כתפיים', ['מעוינים', 'טרפז אמצעי'], '85 86 87 91',
    'Reverse Fly', 'Reverse Flys', 'Aperturas invertidas', 'Oiseau', 'Croci inverse', 'Crucifixo invertido', 'リアフライ', '反向飞鸟', '反向飛鳥', 'التفتيح العكسي'],
  ['פייס פול', 'כתפיים', ['מעוינים', 'שרוול מסובב'], '88',
    'Face Pull', 'Face Pulls', 'Face pull', 'Face pull', 'Face pull', 'Face pull', 'フェイスプル', '面拉', '面拉', 'سحب الوجه'],
  ['סיבוב חיצוני של הכתף', 'כתפיים', ['שרוול מסובב'], '92',
    'Shoulder External Rotation', 'Außenrotation der Schulter', 'Rotación externa de hombro', 'Rotation externe de l’épaule', 'Extrarotazione della spalla', 'Rotação externa do ombro', '肩の外旋', '肩外旋', '肩外旋', 'التدوير الخارجي للكتف'],
  ['חתירה אנכית', 'כתפיים', ['טרפז עליון', 'יד קדמית'], '89 90',
    'Upright Row', 'Aufrechtes Rudern', 'Remo al mentón', 'Rowing menton', 'Tirate al mento', 'Remada alta', 'アップライトロウ', '直立划船', '直立划船', 'التجديف العمودي'],
  ['הרמה אולימפית ומשולבת', 'כתפיים', ['ארבע ראשי', 'ישבן', 'טרפז עליון', 'זוקפי גב'], '225 227 228',
    'Olympic & Combined Lifts', 'Olympische und kombinierte Übungen', 'Levantamientos olímpicos y combinados', 'Haltérophilie et mouvements combinés', 'Sollevamenti olimpici e combinati', 'Levantamentos olímpicos e combinados', 'オリンピックリフト・複合種目', '奥举与复合动作', '奧舉與複合動作', 'رفعات أولمبية ومركبة'],
  ['כפיפת מרפק', 'יד קדמית', ['אמה'], '94 95 96 99 100 101 102 103 104 107 232 245',
    'Biceps Curl', 'Bizepscurl', 'Curl de bíceps', 'Curl biceps', 'Curl per bicipiti', 'Rosca bíceps', 'アームカール', '弯举', '彎舉', 'ثني الذراع'],
  ['כפיפת פטיש', 'יד קדמית', ['אמה'], '97 98',
    'Hammer Curl', 'Hammercurl', 'Curl martillo', 'Curl marteau', 'Curl a martello', 'Rosca martelo', 'ハンマーカール', '锤式弯举', '錘式彎舉', 'ثني المطرقة'],
  ['כפיפת מרפק באחיזה עליונה', 'יד קדמית', ['אמה'], '105 106',
    'Overhand Curl', 'Curl im Obergriff', 'Curl en pronación', 'Curl en pronation', 'Curl a presa prona', 'Rosca pronada', 'リバースカール', '反握弯举', '反握彎舉', 'الثني بقبضة علوية'],
  ['פשיטת מרפק בעמידה', 'יד אחורית', [], '108 109 110 111 122',
    'Triceps Pushdown', 'Trizepsdrücken am Kabel', 'Extensión de tríceps en polea', 'Extension triceps à la poulie', 'Pushdown per tricipiti', 'Tríceps na polia', 'プッシュダウン', '三头下压', '三頭下壓', 'دفع الترايسبس للأسفل'],
  ['פשיטת מרפק בשכיבה', 'יד אחורית', [], '112 113 250',
    'Lying Triceps Extension', 'Liegendes Trizepsdrücken', 'Extensión de tríceps tumbado', 'Extension triceps allongé', 'Estensioni per tricipiti da sdraiato', 'Tríceps deitado', 'ライイングエクステンション', '仰卧臂屈伸', '仰臥臂屈伸', 'تمديد الترايسبس مستلقيًا'],
  ['פשיטת מרפק מעל הראש', 'יד אחורית', [], '114 115 244 249',
    'Overhead Triceps Extension', 'Trizepsdrücken über Kopf', 'Extensión de tríceps sobre la cabeza', 'Extension triceps au-dessus de la tête', 'Estensioni sopra la testa', 'Tríceps acima da cabeça', 'オーバーヘッドエクステンション', '过顶臂屈伸', '過頂臂屈伸', 'تمديد الترايسبس فوق الرأس'],
  ['בעיטת טרייספס', 'יד אחורית', ['כתף אחורית'], '119 120',
    'Triceps Kickback', 'Trizeps-Kickback', 'Patada de tríceps', 'Kickback triceps', 'Kickback per tricipiti', 'Tríceps coice', 'キックバック', '三头后踢', '三頭後踢', 'ركلة الترايسبس'],
  ['לחיצה צמודה', 'יד אחורית', ['חזה', 'כתף קדמית'], '116 236 121',
    'Close-Grip Press', 'Enges Drücken', 'Press con agarre cerrado', 'Développé prise serrée', 'Distensioni presa stretta', 'Supino fechado', 'ナロープレス', '窄握推', '窄握推', 'الضغط بقبضة ضيقة'],
  ['מקבילים לטרייספס', 'יד אחורית', ['חזה', 'כתף קדמית'], '117 118',
    'Triceps Dip', 'Trizeps-Dips', 'Fondos de tríceps', 'Dips triceps', 'Dip per tricipiti', 'Mergulho para tríceps', 'トライセプスディップス', '三头臂屈伸', '三頭撐體', 'غطس الترايسبس'],
  ['שורש כף יד', 'אמה', [], '123 124 125',
    'Wrist Work', 'Handgelenkübungen', 'Muñeca', 'Poignets', 'Polsi', 'Punho', '手首', '腕部训练', '腕部訓練', 'تمارين الرسغ'],
  ['אחיזה', 'אמה', ['טרפז עליון', 'רחב גבי'], '126 127',
    'Grip', 'Griffkraft', 'Agarre', 'Préhension', 'Presa', 'Pegada', '握力', '握力', '握力', 'قوة القبضة'],
  ['סקוואט', 'ארבע ראשי', ['ישבן', 'מקרבים', 'זוקפי גב'], '128 129 130 131 132 133 134 139',
    'Squat', 'Kniebeuge', 'Sentadilla', 'Squat', 'Squat', 'Agachamento', 'スクワット', '深蹲', '深蹲', 'القرفصاء'],
  ['לחיצת רגליים', 'ארבע ראשי', ['ישבן', 'מקרבים'], '135 136 137 138',
    'Leg Press', 'Beinpresse', 'Prensa de piernas', 'Presse à cuisses', 'Pressa per gambe', 'Leg press', 'レッグプレス', '腿举', '腿推', 'ضغط الأرجل'],
  ['פשיטת ברך', 'ארבע ראשי', [], '140',
    'Leg Extension', 'Beinstrecken', 'Extensión de piernas', 'Leg extension', 'Leg extension', 'Cadeira extensora', 'レッグエクステンション', '腿屈伸', '腿伸展', 'تمديد الساق'],
  ['לאנג׳', 'ארבע ראשי', ['ישבן', 'ירך אחורית', 'מקרבים'], '141 142 143 144 229 230 231',
    'Lunge', 'Ausfallschritt', 'Zancada', 'Fente', 'Affondo', 'Afundo', 'ランジ', '弓步', '弓步', 'الطعن'],
  ['עליות מדרגה', 'ארבע ראשי', ['ישבן'], '145 146',
    'Step-Up', 'Step-up', 'Subida al cajón', 'Step-up', 'Step-up', 'Subida no banco', 'ステップアップ', '登阶', '登階', 'الصعود على الدرجة'],
  ['סקוואט סיסי', 'ארבע ראשי', [], '147',
    'Sissy Squat', 'Sissy-Kniebeuge', 'Sentadilla sissy', 'Sissy squat', 'Sissy squat', 'Agachamento sissy', 'シシースクワット', '西西深蹲', '西西深蹲', 'قرفصاء سيسي'],
  ['ישיבת קיר', 'ארבע ראשי', ['ישבן'], '148',
    'Wall Sit', 'Wandsitzen', 'Sentadilla en pared', 'Chaise', 'Wall sit', 'Cadeirinha', '空気椅子', '靠墙静蹲', '靠牆靜蹲', 'الجلوس على الحائط'],
  ['דדליפט', 'ירך אחורית', ['ישבן', 'זוקפי גב', 'טרפז עליון', 'אמה'], '57 58',
    'Deadlift', 'Kreuzheben', 'Peso muerto', 'Soulevé de terre', 'Stacco', 'Levantamento terra', 'デッドリフト', '硬拉', '硬舉', 'الرفعة الميتة'],
  ['דדליפט רומני', 'ירך אחורית', ['ישבן', 'זוקפי גב'], '149 150 151 152',
    'Romanian Deadlift', 'Rumänisches Kreuzheben', 'Peso muerto rumano', 'Soulevé de terre roumain', 'Stacco rumeno', 'Stiff romeno', 'ルーマニアンデッドリフト', '罗马尼亚硬拉', '羅馬尼亞硬舉', 'الرفعة الرومانية'],
  ['כפיפת ברך', 'ירך אחורית', ['שוקיים'], '153 154 155 246 156 157',
    'Leg Curl', 'Beinbeugen', 'Curl femoral', 'Leg curl', 'Leg curl', 'Mesa flexora', 'レッグカール', '腿弯举', '腿彎舉', 'ثني الساق'],
  ['היפ ת׳ראסט וגשר ישבן', 'ישבן', ['ירך אחורית'], '159 160 161 162 239 240 251',
    'Hip Thrust & Glute Bridge', 'Hip Thrust und Glute Bridge', 'Hip thrust y puente de glúteos', 'Hip thrust et pont fessier', 'Hip thrust e ponte glutei', 'Elevação pélvica e ponte', 'ヒップスラスト・グルートブリッジ', '臀推与臀桥', '臀推與臀橋', 'دفع الورك وجسر الأرداف'],
  ['סומו', 'ישבן', ['מקרבים', 'ארבע ראשי', 'זוקפי גב'], '163 164',
    'Sumo', 'Sumo', 'Sumo', 'Sumo', 'Sumo', 'Sumô', 'スモウ', '相扑', '相撲', 'السومو'],
  ['בעיטת ישבן', 'ישבן', ['ירך אחורית'], '165 166',
    'Glute Kickback', 'Glute-Kickback', 'Patada de glúteo', 'Kickback fessier', 'Slanci posteriori', 'Coice para glúteos', 'グルートキックバック', '臀部后踢', '臀部後踢', 'ركلة الأرداف'],
  ['ציר ירך דינמי', 'ישבן', ['ירך אחורית', 'זוקפי גב'], '158 167',
    'Dynamic Hip Hinge', 'Dynamisches Hüftbeugen', 'Bisagra de cadera dinámica', 'Charnière de hanche dynamique', 'Hip hinge dinamico', 'Dobradiça de quadril dinâmica', 'ダイナミックヒップヒンジ', '动态髋铰链', '動態髖鉸鏈', 'مفصلة الورك الديناميكية'],
  ['הפעלת ישבן בגומייה', 'ישבן', ['מרחיקים'], '168 169',
    'Banded Glute Activation', 'Po-Aktivierung mit Band', 'Activación de glúteos con banda', 'Activation fessière à l’élastique', 'Attivazione glutei con elastico', 'Ativação de glúteos com elástico', 'バンドでの臀部活性化', '弹力带臀部激活', '彈力帶臀部激活', 'تنشيط الأرداف بالمطاط'],
  ['פאוור קלין', 'ישבן', ['ארבע ראשי', 'ירך אחורית', 'טרפז עליון', 'זוקפי גב'], '226',
    'Power Clean', 'Power Clean', 'Cargada de potencia', 'Épaulé en puissance', 'Power clean', 'Power clean', 'パワークリーン', '高翻', '高翻', 'الكلين القوي'],
  ['קירוב ירך', 'מקרבים', [], '170 171',
    'Hip Adduction', 'Adduktion', 'Aducción de cadera', 'Adduction de hanche', 'Adduzione dell’anca', 'Adução de quadril', 'ヒップアダクション', '髋内收', '髖內收', 'تقريب الفخذ'],
  ['פלאנק קופנהגן', 'מקרבים', ['אלכסונים'], '172',
    'Copenhagen Plank', 'Kopenhagen-Plank', 'Plancha Copenhague', 'Gainage Copenhague', 'Plank Copenaghen', 'Prancha Copenhague', 'コペンハーゲンプランク', '哥本哈根平板支撑', '哥本哈根棒式', 'لوح كوبنهاغن'],
  ['סקוואט קוזאק', 'מקרבים', ['ארבע ראשי', 'ישבן'], '173',
    'Cossack Squat', 'Kosakenkniebeuge', 'Sentadilla cosaca', 'Squat cosaque', 'Squat cosacco', 'Agachamento cossaco', 'コサックスクワット', '哥萨克深蹲', '哥薩克深蹲', 'قرفصاء القوزاق'],
  ['הרחקת ירך', 'מרחיקים', ['ישבן'], '174 175 234 235',
    'Hip Abduction', 'Abduktion', 'Abducción de cadera', 'Abduction de hanche', 'Abduzione dell’anca', 'Abdução de quadril', 'ヒップアブダクション', '髋外展', '髖外展', 'إبعاد الفخذ'],
  ['הרמת עקבים', 'שוקיים', [], '176 177 178 179 180',
    'Calf Raise', 'Wadenheben', 'Elevación de talones', 'Extension des mollets', 'Calf raise', 'Elevação de panturrilha', 'カーフレイズ', '提踵', '提踵', 'رفع الكعبين'],
  ['הרמת קדמת השוק', 'שוקיים', [], '181',
    'Tibialis Raise', 'Tibialis-Heben', 'Elevación de tibial', 'Relevé du tibial', 'Sollevamento del tibiale', 'Elevação do tibial', 'チビアリスレイズ', '胫骨前肌抬起', '脛骨前肌抬起', 'رفع مقدمة الساق'],
  ['כפיפות בטן', 'בטן', [], '182 183 184 186 187 238 252',
    'Crunch', 'Crunches', 'Abdominales', 'Crunch', 'Crunch', 'Abdominal', 'クランチ', '卷腹', '捲腹', 'كرنش البطن'],
  ['הרמת רגליים וברכיים', 'בטן', ['מכופפי ירך'], '185 188 189 190 191 198 199 247 254',
    'Leg & Knee Raises', 'Bein- und Knieheben', 'Elevación de piernas y rodillas', 'Relevés de jambes et de genoux', 'Sollevamenti di gambe e ginocchia', 'Elevação de pernas e joelhos', 'レッグ・ニーレイズ', '举腿与提膝', '舉腿與提膝', 'رفع الأرجل والركبتين'],
  ['פלאנק וייצוב ליבה', 'בטן', ['כתפיים', 'אלכסונים'], '192 193 194 195 196 197 200',
    'Plank & Core Stability', 'Plank und Rumpfstabilität', 'Plancha y estabilidad del core', 'Gainage et stabilité du tronc', 'Plank e stabilità del core', 'Prancha e estabilidade do core', 'プランク・体幹安定', '平板支撑与核心稳定', '棒式與核心穩定', 'اللوح وثبات الجذع'],
  ['טורקיש גט אפ', 'בטן', ['כתפיים', 'ישבן', 'אלכסונים'], '201',
    'Turkish Get-Up', 'Turkish Get-up', 'Levantamiento turco', 'Relevé turc', 'Turkish get-up', 'Levantamento turco', 'ターキッシュゲットアップ', '土耳其起立', '土耳其起立', 'النهوض التركي'],
  ['פלאנק צידי', 'אלכסונים', ['בטן', 'מרחיקים'], '202 255',
    'Side Plank', 'Seitstütz', 'Plancha lateral', 'Gainage latéral', 'Plank laterale', 'Prancha lateral', 'サイドプランク', '侧平板支撑', '側棒式', 'اللوح الجانبي'],
  ['סיבוב גו', 'אלכסונים', ['בטן'], '203 204 207 208',
    'Torso Rotation', 'Rumpfrotation', 'Rotación del tronco', 'Rotation du buste', 'Rotazione del busto', 'Rotação do tronco', '体幹の回旋', '躯干旋转', '軀幹旋轉', 'تدوير الجذع'],
  ['כפיפה צידית', 'אלכסונים', [], '205 253',
    'Side Bend', 'Seitbeuge', 'Flexión lateral', 'Flexion latérale', 'Piegamento laterale', 'Flexão lateral', 'サイドベンド', '侧屈', '側屈', 'الانحناء الجانبي'],
  ['ייצוב נגד סיבוב', 'אלכסונים', ['בטן', 'אמה'], '206 209',
    'Anti-Rotation', 'Anti-Rotation', 'Antirrotación', 'Anti-rotation', 'Antirotazione', 'Antirrotação', 'アンチローテーション', '抗旋转', '抗旋轉', 'مقاومة الدوران'],
  ['ראק פול', 'זוקפי גב', ['טרפז עליון', 'ישבן', 'אמה'], '59',
    'Rack Pull', 'Rack Pull', 'Rack pull', 'Rack pull', 'Rack pull', 'Rack pull', 'ラックプル', '架上硬拉', '架上硬舉', 'السحب من الحامل'],
  ['הרמת גב', 'זוקפי גב', ['ישבן', 'ירך אחורית'], '65 66 67',
    'Back Extension', 'Rückenstrecken', 'Hiperextensiones', 'Extensions lombaires', 'Iperestensioni', 'Extensão lombar', 'バックエクステンション', '背部伸展', '背部伸展', 'تمديد الظهر'],
  ['גוד מורנינג', 'זוקפי גב', ['ירך אחורית', 'ישבן'], '68 259',
    'Good Morning', 'Good Morning', 'Buenos días', 'Good morning', 'Good morning', 'Good morning', 'グッドモーニング', '早安式', '早安式', 'جود مورنينغ'],
  ['ייצוב גב תחתון', 'זוקפי גב', ['ישבן', 'בטן'], '69 70',
    'Lower Back Stability', 'Stabilität des unteren Rückens', 'Estabilidad lumbar', 'Stabilité lombaire', 'Stabilità lombare', 'Estabilidade lombar', '腰の安定', '下背稳定', '下背穩定', 'ثبات أسفل الظهر'],
  ['ריצה והליכה', 'אירובי', ['ארבע ראשי', 'שוקיים'], '210 211 212',
    'Running & Walking', 'Laufen und Gehen', 'Correr y caminar', 'Course et marche', 'Corsa e camminata', 'Corrida e caminhada', 'ランニング・ウォーキング', '跑步与步行', '跑步與步行', 'الجري والمشي'],
  ['אופניים', 'אירובי', ['ארבע ראשי'], '213 214',
    'Cycling', 'Radfahren', 'Ciclismo', 'Vélo', 'Ciclismo', 'Ciclismo', 'サイクリング', '骑行', '騎行', 'ركوب الدراجة'],
  ['מכשירי סיבולת', 'אירובי', [], '215 216 217 218',
    'Cardio Machines', 'Ausdauergeräte', 'Máquinas de cardio', 'Machines cardio', 'Macchine cardio', 'Aparelhos de cardio', '有酸素マシン', '有氧器械', '有氧器材', 'أجهزة الكارديو'],
  ['אימון מטבולי', 'אירובי', [], '219 220 221 222 223',
    'Conditioning', 'Konditionstraining', 'Acondicionamiento', 'Conditionnement', 'Condizionamento', 'Condicionamento', 'コンディショニング', '体能训练', '體能訓練', 'تمارين اللياقة'],
  ['שחייה', 'אירובי', ['רחב גבי', 'כתפיים'], '224',
    'Swimming', 'Schwimmen', 'Natación', 'Natation', 'Nuoto', 'Natação', '水泳', '游泳', '游泳', 'السباحة'],
];

/* One equipment tag per exercise, from Asaf's eight (the Smith machine is the
   app's existing key סמית׳). The row's own kit is the evidence; where it names
   something outside the eight, the nearest of them answers - a plate is a free
   weight, a landmine and the EZ and trap bars are barbells, the cardio
   machines and the sled are machines, everything you carry only your body
   against is bodyweight. */
export const EQT_OF = { 'מוט': 'מוט', 'מוט EZ': 'מוט', 'מוט טרפז': 'מוט', 'משקולות יד': 'משקולות יד', 'פלטה': 'משקולות יד',
  'מכונה': 'מכונה', 'מכשיר אירובי': 'מכונה', 'מזחלת': 'מכונה', 'פולי': 'פולי', 'סמית׳': 'סמית׳', 'קטלבל': 'קטלבל', 'גומייה': 'גומייה',
  'משקל גוף': 'משקל גוף', 'מתח': 'משקל גוף', 'רצועות TRX': 'משקל גוף', 'כדור כוח': 'משקל גוף', 'חבל קרב': 'משקל גוף' };
export const EQT_FIX = { x32: 'גומייה', x23: 'משקל גוף', x31: 'משקל גוף' };   // the band IS the assisted pull-up; a loaded dip is still a dip
export const EQT = ['משקל גוף', 'משקולות יד', 'מוט', 'מכונה', 'פולי', 'סמית׳', 'קטלבל', 'גומייה'];

/* Difficulty: machines, cables, the Smith and bands are where a beginner
   starts; free weights are intermediate; the complex and Olympic lifts are
   advanced. Bodyweight answers neither way on its own - a wall push-up and a
   Nordic curl share the tag - so those are named one by one. */
export const LV = ['מתחיל', 'בינוני', 'מתקדם'];
const nums = s => s.split(' ').map(n => 'x' + n);
const EASY = nums('18 19 22 241 242 131 148 162 69 70 181 182 185 186 190 192 196 197 200 202 203 204 210 199 234 229 255 253 254 247 65 211 212 213 214 215 216 217 218 224');
const MID = nums('221 222');
const HARD = nums('225 226 227 228 93 156 157 191 188 201 147 172 31 23 57 129 194 248 198');
export function levelOf(id, eqt) {
  if (MID.includes(id)) return 'בינוני';
  if (HARD.includes(id)) return 'מתקדם';
  if (EASY.includes(id)) return 'מתחיל';
  return ['מכונה', 'פולי', 'סמית׳', 'גומייה'].includes(eqt) ? 'מתחיל' : 'בינוני';
}
export function eqtOf(id, q) { return EQT_FIX[id] || EQT_OF[q.find(x => EQT_OF[x])] || 'משקל גוף'; }
export const familyIds = f => nums(f[3]);
