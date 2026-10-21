/* Answers for the richer fitness questions (21 Oct). English is the original;
 * the experience lines are written as states, not as "I am", so that no
 * language has to pick a gender the person has not told it. */
import fs from 'fs';
const OLD = 'לבנות לי תוכנית, 3 שאלות';
const K = ['בבית, בלי משקולות', 'בחוץ', 'גומיות ומזרן', 'התאמנתי בעבר, ועכשיו חוזר', 'לבנות לי תוכנית אישית',
  'מוטות, מכונות ופולי', 'משקולות יד, ספסל וגומיות', 'מתאמן באופן קבוע כבר כמה שנים', 'מתאמן באופן קבוע, פחות משנתיים',
  'מתח, ספסל ומדרגות בגינה', 'עוד לא התאמנתי באופן קבוע', 'רק משקל הגוף, בכל מקום'];
const A = {
  en: ['At home, no weights', 'Outdoors', 'Bands and a mat', 'Trained before, picking it back up', 'Build me a personal plan',
    'Barbells, machines and cables', 'Dumbbells, a bench and bands', 'Regular training for several years', 'Regular training, under two years',
    'Pull-up bar, benches and steps in the park', 'No regular training yet', 'Just bodyweight, anywhere'],
  de: ['Zu Hause, ohne Gewichte', 'Draußen', 'Bänder und Matte', 'Früher trainiert, jetzt der Wiedereinstieg', 'Erstell mir einen persönlichen Plan',
    'Langhanteln, Maschinen und Kabelzug', 'Kurzhanteln, Bank und Bänder', 'Regelmäßiges Training seit einigen Jahren', 'Regelmäßiges Training, unter zwei Jahren',
    'Klimmzugstange, Bänke und Stufen im Park', 'Noch kein regelmäßiges Training', 'Nur Körpergewicht, überall'],
  es: ['En casa, sin pesas', 'Al aire libre', 'Bandas y esterilla', 'Entrenamiento previo, ahora de vuelta', 'Créame un plan personal',
    'Barras, máquinas y poleas', 'Mancuernas, un banco y bandas', 'Entrenamiento regular desde hace varios años', 'Entrenamiento regular, menos de dos años',
    'Barra de dominadas, bancos y escalones en el parque', 'Aún sin entrenamiento regular', 'Solo peso corporal, en cualquier sitio'],
  fr: ['À la maison, sans poids', 'En extérieur', 'Élastiques et tapis', 'Déjà entraîné·e avant, c’est la reprise', 'Crée-moi un programme personnel',
    'Barres, machines et poulies', 'Haltères, un banc et des élastiques', 'Entraînement régulier depuis plusieurs années', 'Entraînement régulier, moins de deux ans',
    'Barre de traction, bancs et marches au parc', 'Pas encore d’entraînement régulier', 'Juste le poids du corps, n’importe où'],
  it: ['A casa, senza pesi', 'All’aperto', 'Elastici e tappetino', 'Allenamento in passato, ora si riprende', 'Creami un piano personale',
    'Bilancieri, macchine e cavi', 'Manubri, una panca ed elastici', 'Allenamento regolare da diversi anni', 'Allenamento regolare, meno di due anni',
    'Sbarra per trazioni, panchine e gradini al parco', 'Ancora nessun allenamento regolare', 'Solo corpo libero, ovunque'],
  pt: ['Em casa, sem pesos', 'Ao ar livre', 'Elásticos e tapete', 'Já treinei antes, agora é o regresso', 'Cria-me um plano pessoal',
    'Barras, máquinas e polias', 'Halteres, um banco e elásticos', 'Treino regular há vários anos', 'Treino regular, há menos de dois anos',
    'Barra de elevações, bancos e degraus no parque', 'Ainda sem treino regular', 'Só o peso do corpo, em qualquer lado'],
  ja: ['自宅、ウェイトなし', '屋外', 'チューブとマット', '以前やっていて、再開するところ', '自分専用のプランを作って',
    'バーベル、マシン、ケーブル', 'ダンベル、ベンチ、チューブ', '定期的なトレーニング歴が数年', '定期的なトレーニング歴が2年未満',
    '公園の鉄棒、ベンチ、階段', 'まだ定期的にはやっていない', '自重だけ、どこでも'],
  'zh-Hans': ['在家，没有哑铃', '户外', '弹力带和垫子', '以前练过，现在重新开始', '给我做一个个人计划',
    '杠铃、器械和拉力器', '哑铃、凳子和弹力带', '规律训练已有好几年', '规律训练，不到两年',
    '公园里的单杠、长椅和台阶', '还没有规律训练过', '只用自重，随时随地'],
  'zh-Hant': ['在家，沒有啞鈴', '戶外', '彈力帶和墊子', '以前練過，現在重新開始', '幫我做一個個人計畫',
    '槓鈴、器械和拉力器', '啞鈴、長凳和彈力帶', '規律訓練已有好幾年', '規律訓練，不到兩年',
    '公園裡的單槓、長椅和台階', '還沒有規律訓練過', '只用自身體重，隨時隨地'],
  ar: ['في البيت، بلا أثقال', 'في الخارج', 'أحزمة مطاطية وحصيرة', 'تمرين سابق، والآن عودة', 'أنشئ لي خطة شخصية',
    'بارات وأجهزة وكابلات', 'دمبلز ومقعد وأحزمة مطاطية', 'تمرين منتظم منذ عدة سنوات', 'تمرين منتظم، أقل من سنتين',
    'عقلة ومقاعد ودرجات في الحديقة', 'لا تمرين منتظم بعد', 'وزن الجسم فقط، في أي مكان'],
};
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  delete d[OLD];
  K.forEach((k, i) => { d[k] = v[i]; });
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
/* the Hebrew she reads: the three lines that speak in the first person */
const hf = 'data/he-f.json', H = JSON.parse(fs.readFileSync(hf, 'utf8'));
delete H[OLD];
H['התאמנתי בעבר, ועכשיו חוזר'] = 'התאמנתי בעבר, ועכשיו חוזרת';
H['מתאמן באופן קבוע כבר כמה שנים'] = 'מתאמנת באופן קבוע כבר כמה שנים';
H['מתאמן באופן קבוע, פחות משנתיים'] = 'מתאמנת באופן קבוע, פחות משנתיים';
fs.writeFileSync(hf, JSON.stringify(H, null, 2) + '\n');
console.log('answered', K.length, 'keys in', Object.keys(A).length, 'languages');
