/* Builds data/foods.core.json - the generic foods, named in every language.
 *
 *   node tools/build-food-core.mjs
 *
 * WHY THIS EXISTS. The model already bridges languages when searching: asked
 * for 白米 or "arroz blanco cocido" against Hebrew rows, /match finds the right
 * one. Verified against the live server before any of this was written. So
 * this is not about being able to FIND a food.
 *
 * It is about reading it. The row that comes back is displayed by its Hebrew
 * name, so a Japanese user finds the right rice and then logs אורז לבן into
 * their diary, where it stays. Every meal they have ever eaten, in a script
 * they cannot read. That is what a name per language fixes, and nothing else
 * does.
 *
 * It also buys the two things the bridge cannot: these foods are findable with
 * no network and no server, and instantly, instead of after a 650ms pause and
 * a round trip.
 *
 * NO NUMBER HERE IS INVENTED. Each entry names an exact row in data/foods.json
 * and the energy and macros are copied from it, so every value stays the
 * measured one from the Israeli Ministry of Health table. If a name stops
 * matching a row, this build fails rather than guessing - which is the whole
 * reason the Hebrew name is the key rather than a label.
 *
 * The list is short on purpose and is meant to grow. Adding a food is one
 * entry: the exact Hebrew row, and eleven names.
 */
import fs from 'fs';

const SRC = 'data/foods.json';
const OUT = 'data/foods.core.json';

/* he: the exact name of a row in foods.json. Where that row carries a
   qualifier that changes the numbers - dry rather than cooked, with the skin -
   the other names say so too, because a person choosing between rows is
   choosing between those numbers. */
const CORE = [
  { id: 'rice-white',   he: 'אורז לבן, מבושל, עם מלח, ללא תוספת שומן בבישול',
    t: { en: 'White rice, cooked', de: 'Weißer Reis, gekocht', es: 'Arroz blanco, cocido',
         fr: 'Riz blanc, cuit', it: 'Riso bianco, cotto', pt: 'Arroz branco, cozido',
         ja: '白米（炊いたもの）', 'zh-Hans': '白米饭（煮熟）', 'zh-Hant': '白米飯（煮熟）',
         ar: 'أرز أبيض مطبوخ' } },

  { id: 'chicken-breast', he: 'בשר עוף, חזה מטוגן ללא שמן',
    t: { en: 'Chicken breast, cooked without oil', de: 'Hähnchenbrust, ohne Öl gegart',
         es: 'Pechuga de pollo, cocinada sin aceite', fr: 'Blanc de poulet, cuit sans huile',
         it: 'Petto di pollo, cotto senza olio', pt: 'Peito de frango, cozido sem óleo',
         ja: '鶏むね肉（油なしで加熱）', 'zh-Hans': '鸡胸肉（无油烹制）',
         'zh-Hant': '雞胸肉（無油烹製）', ar: 'صدر دجاج مطهو بدون زيت' } },

  { id: 'milk-3',       he: 'חלב 3% שומן, תנובה, טרה, הרדוף, יטבתה',
    t: { en: 'Milk, 3%', de: 'Milch, 3%', es: 'Leche, 3%', fr: 'Lait, 3%',
         it: 'Latte, 3%', pt: 'Leite, 3%', ja: '牛乳 3%', 'zh-Hans': '牛奶 3%',
         'zh-Hant': '牛奶 3%', ar: 'حليب 3%' } },

  { id: 'milk-1',       he: 'חלב 1% שומן, תנובה, טרה, הרדוף, יטבתה',
    t: { en: 'Milk, 1%', de: 'Milch, 1%', es: 'Leche, 1%', fr: 'Lait, 1%',
         it: 'Latte, 1%', pt: 'Leite, 1%', ja: '牛乳 1%', 'zh-Hans': '牛奶 1%',
         'zh-Hant': '牛奶 1%', ar: 'حليب 1%' } },

  { id: 'cottage-5',    he: "גבינת קוטג' 5%, שטראוס",
    t: { en: 'Cottage cheese, 5%', de: 'Hüttenkäse, 5%', es: 'Queso cottage, 5%',
         fr: 'Fromage cottage, 5%', it: 'Fiocchi di latte, 5%', pt: 'Queijo cottage, 5%',
         ja: 'カッテージチーズ 5%', 'zh-Hans': '茅屋奶酪 5%', 'zh-Hant': '茅屋起司 5%',
         ar: 'جبنة قريش 5%' } },

  { id: 'yellow-cheese-5', he: 'גבינה צהובה 5% שומן, עמק',
    t: { en: 'Semi-hard yellow cheese, 5%', de: 'Schnittkäse, 5%', es: 'Queso semiduro, 5%',
         fr: 'Fromage à pâte pressée, 5%', it: 'Formaggio semiduro, 5%',
         pt: 'Queijo amarelo, 5%', ja: 'セミハードチーズ 5%', 'zh-Hans': '半硬质奶酪 5%',
         'zh-Hant': '半硬質起司 5%', ar: 'جبنة صفراء 5%' } },

  { id: 'banana',       he: 'בננה, טריה, בלי קליפה',
    t: { en: 'Banana', de: 'Banane', es: 'Plátano', fr: 'Banane', it: 'Banana',
         pt: 'Banana', ja: 'バナナ', 'zh-Hans': '香蕉', 'zh-Hant': '香蕉', ar: 'موز' } },

  { id: 'apple',        he: 'תפוח עץ, עם קליפה (ללא ליבה)',
    t: { en: 'Apple, with skin', de: 'Apfel, mit Schale', es: 'Manzana, con piel',
         fr: 'Pomme, avec la peau', it: 'Mela, con la buccia', pt: 'Maçã, com casca',
         ja: 'りんご（皮つき）', 'zh-Hans': '苹果（带皮）', 'zh-Hant': '蘋果（帶皮）',
         ar: 'تفاح بالقشر' } },

  { id: 'watermelon',   he: 'אבטיח, טרי',
    t: { en: 'Watermelon', de: 'Wassermelone', es: 'Sandía', fr: 'Pastèque',
         it: 'Anguria', pt: 'Melancia', ja: 'すいか', 'zh-Hans': '西瓜',
         'zh-Hant': '西瓜', ar: 'بطيخ' } },

  { id: 'tomato',       he: 'עגבניה, טריה',
    t: { en: 'Tomato', de: 'Tomate', es: 'Tomate', fr: 'Tomate', it: 'Pomodoro',
         pt: 'Tomate', ja: 'トマト', 'zh-Hans': '番茄', 'zh-Hant': '番茄', ar: 'طماطم' } },

  { id: 'cucumber',     he: 'מלפפון, טרי, עם קליפה',
    t: { en: 'Cucumber, with skin', de: 'Gurke, mit Schale', es: 'Pepino, con piel',
         fr: 'Concombre, avec la peau', it: 'Cetriolo, con la buccia',
         pt: 'Pepino, com casca', ja: 'きゅうり（皮つき）', 'zh-Hans': '黄瓜（带皮）',
         'zh-Hant': '小黃瓜（帶皮）', ar: 'خيار بالقشر' } },

  { id: 'carrot',       he: 'גזר, טרי, בלי קליפה וקצוות',
    t: { en: 'Carrot, peeled', de: 'Karotte, geschält', es: 'Zanahoria, pelada',
         fr: 'Carotte, épluchée', it: 'Carota, sbucciata', pt: 'Cenoura, descascada',
         ja: 'にんじん（皮なし）', 'zh-Hans': '胡萝卜（去皮）', 'zh-Hant': '胡蘿蔔（去皮）',
         ar: 'جزر مقشّر' } },

  { id: 'avocado',      he: 'אבוקדו',
    t: { en: 'Avocado', de: 'Avocado', es: 'Aguacate', fr: 'Avocat', it: 'Avocado',
         pt: 'Abacate', ja: 'アボカド', 'zh-Hans': '牛油果', 'zh-Hant': '酪梨',
         ar: 'أفوكادو' } },

  { id: 'olive-oil',    he: 'שמן זית',
    t: { en: 'Olive oil', de: 'Olivenöl', es: 'Aceite de oliva', fr: "Huile d'olive",
         it: "Olio d'oliva", pt: 'Azeite de oliva', ja: 'オリーブオイル',
         'zh-Hans': '橄榄油', 'zh-Hant': '橄欖油', ar: 'زيت زيتون' } },

  { id: 'butter',       he: 'חמאה, תנובה, טרה',
    t: { en: 'Butter', de: 'Butter', es: 'Mantequilla', fr: 'Beurre', it: 'Burro',
         pt: 'Manteiga', ja: 'バター', 'zh-Hans': '黄油', 'zh-Hant': '奶油',
         ar: 'زبدة' } },

  { id: 'tahini',       he: 'טחינה גולמית, לא מדוללת',
    t: { en: 'Tahini, raw, undiluted', de: 'Tahini, roh, unverdünnt',
         es: 'Tahini, crudo, sin diluir', fr: 'Tahini, cru, non dilué',
         it: 'Tahina, cruda, non diluita', pt: 'Tahine, cru, não diluído',
         ja: '練りごま（生・希釈なし）', 'zh-Hans': '芝麻酱（生，未稀释）',
         'zh-Hant': '芝麻醬（生，未稀釋）', ar: 'طحينة خام غير مخففة' } },

  { id: 'oats',         he: 'שיבולת שועל, קוואקר, רגיל ואינסטנט, לא מבושל',
    t: { en: 'Oats, uncooked', de: 'Haferflocken, ungekocht', es: 'Avena, cruda',
         fr: 'Flocons d’avoine, crus', it: 'Fiocchi d’avena, crudi',
         pt: 'Aveia, crua', ja: 'オートミール（未調理）', 'zh-Hans': '燕麦片（未煮）',
         'zh-Hant': '燕麥片（未煮）', ar: 'شوفان غير مطبوخ' } },

  { id: 'pita',         he: 'פיתה, קלויה',
    t: { en: 'Pita bread', de: 'Pita-Brot', es: 'Pan de pita', fr: 'Pain pita',
         it: 'Pane pita', pt: 'Pão pita', ja: 'ピタパン', 'zh-Hans': '皮塔饼',
         'zh-Hant': '皮塔餅', ar: 'خبز عربي (بيتا)' } },

  { id: 'lentils-dry',  he: 'עדשים יבשים',
    t: { en: 'Lentils, dry', de: 'Linsen, trocken', es: 'Lentejas, secas',
         fr: 'Lentilles, sèches', it: 'Lenticchie, secche', pt: 'Lentilhas, secas',
         ja: 'レンズ豆（乾燥）', 'zh-Hans': '小扁豆（干）', 'zh-Hant': '小扁豆（乾）',
         ar: 'عدس جاف' } },

  { id: 'chickpeas-dry', he: 'חומוס יבש',
    t: { en: 'Chickpeas, dry', de: 'Kichererbsen, trocken', es: 'Garbanzos, secos',
         fr: 'Pois chiches, secs', it: 'Ceci, secchi', pt: 'Grão-de-bico, seco',
         ja: 'ひよこ豆（乾燥）', 'zh-Hans': '鹰嘴豆（干）', 'zh-Hant': '鷹嘴豆（乾）',
         ar: 'حمص جاف' } },
  { id: 'orange',       he: 'תפוז, טרי',
    t: { en: 'Orange', de: 'Orange', es: 'Naranja', fr: 'Orange', it: 'Arancia',
         pt: 'Laranja', ja: 'オレンジ', 'zh-Hans': '橙子', 'zh-Hant': '柳橙', ar: 'برتقال' } },

  { id: 'strawberry',   he: 'תות שדה, טרי',
    t: { en: 'Strawberry', de: 'Erdbeere', es: 'Fresa', fr: 'Fraise', it: 'Fragola',
         pt: 'Morango', ja: 'いちご', 'zh-Hans': '草莓', 'zh-Hant': '草莓', ar: 'فراولة' } },

  { id: 'pear',         he: 'אגס, טרי',
    t: { en: 'Pear', de: 'Birne', es: 'Pera', fr: 'Poire', it: 'Pera',
         pt: 'Pera', ja: '洋なし', 'zh-Hans': '梨', 'zh-Hant': '梨', ar: 'كمثرى' } },

  { id: 'peach',        he: 'אפרסק, טרי',
    t: { en: 'Peach', de: 'Pfirsich', es: 'Melocotón', fr: 'Pêche', it: 'Pesca',
         pt: 'Pêssego', ja: 'もも', 'zh-Hans': '桃子', 'zh-Hant': '桃子', ar: 'دراق (خوخ)' } },

  { id: 'melon',        he: 'מלון כתום, טרי',
    t: { en: 'Cantaloupe melon', de: 'Cantaloupe-Melone', es: 'Melón cantalupo',
         fr: 'Melon cantaloup', it: 'Melone cantalupo', pt: 'Melão cantalupo',
         ja: '赤肉メロン（カンタロープ）', 'zh-Hans': '哈密瓜', 'zh-Hant': '哈密瓜', ar: 'شمام' } },

  { id: 'date-medjool', he: "תמר, מג'הול",
    t: { en: 'Medjool date', de: 'Medjool-Dattel', es: 'Dátil Medjool',
         fr: 'Datte Medjool', it: 'Dattero Medjool', pt: 'Tâmara Medjool',
         ja: 'メジュールデーツ', 'zh-Hans': '帝王椰枣', 'zh-Hant': '帝王椰棗',
         ar: 'تمر مجهول' } },

  { id: 'mango',        he: 'מנגו, טרי',
    t: { en: 'Mango', de: 'Mango', es: 'Mango', fr: 'Mangue', it: 'Mango',
         pt: 'Manga', ja: 'マンゴー', 'zh-Hans': '芒果', 'zh-Hant': '芒果', ar: 'مانجو' } },

  { id: 'lemon',        he: 'לימון, טרי',
    t: { en: 'Lemon', de: 'Zitrone', es: 'Limón', fr: 'Citron', it: 'Limone',
         pt: 'Limão', ja: 'レモン', 'zh-Hans': '柠檬', 'zh-Hant': '檸檬', ar: 'ليمون' } },

  { id: 'pepper-red',   he: 'פלפל אדום, טרי',
    t: { en: 'Red pepper', de: 'Rote Paprika', es: 'Pimiento rojo', fr: 'Poivron rouge',
         it: 'Peperone rosso', pt: 'Pimentão vermelho', ja: '赤パプリカ',
         'zh-Hans': '红甜椒', 'zh-Hant': '紅甜椒', ar: 'فلفل حلو أحمر' } },

  { id: 'sweet-potato', he: 'בטטה טריה, עם קליפה',
    t: { en: 'Sweet potato, with skin', de: 'Süßkartoffel, mit Schale',
         es: 'Boniato, con piel', fr: 'Patate douce, avec la peau',
         it: 'Patata dolce, con la buccia', pt: 'Batata-doce, com casca',
         ja: 'さつまいも（皮つき）', 'zh-Hans': '红薯（带皮）', 'zh-Hant': '地瓜（帶皮）',
         ar: 'بطاطا حلوة بالقشر' } },

  { id: 'aubergine',    he: 'חצילים טריים',
    t: { en: 'Eggplant', de: 'Aubergine', es: 'Berenjena', fr: 'Aubergine',
         it: 'Melanzana', pt: 'Berinjela', ja: 'なす', 'zh-Hans': '茄子',
         'zh-Hant': '茄子', ar: 'باذنجان' } },

  { id: 'cabbage',      he: 'כרוב לבן, טרי',
    t: { en: 'White cabbage', de: 'Weißkohl', es: 'Repollo blanco', fr: 'Chou blanc',
         it: 'Cavolo cappuccio', pt: 'Repolho branco', ja: 'キャベツ',
         'zh-Hans': '圆白菜', 'zh-Hant': '高麗菜', ar: 'ملفوف أبيض' } },

  { id: 'cauliflower',  he: 'כרובית, טריה',
    t: { en: 'Cauliflower', de: 'Blumenkohl', es: 'Coliflor', fr: 'Chou-fleur',
         it: 'Cavolfiore', pt: 'Couve-flor', ja: 'カリフラワー',
         'zh-Hans': '花椰菜', 'zh-Hant': '白花椰菜', ar: 'قرنبيط' } },

  { id: 'broccoli',     he: 'ברוקולי, טרי',
    t: { en: 'Broccoli', de: 'Brokkoli', es: 'Brócoli', fr: 'Brocoli',
         it: 'Broccoli', pt: 'Brócolis', ja: 'ブロッコリー',
         'zh-Hans': '西兰花', 'zh-Hant': '青花菜', ar: 'بروكلي' } },

  { id: 'spinach',      he: 'תרד, טרי',
    t: { en: 'Spinach', de: 'Spinat', es: 'Espinaca', fr: 'Épinard', it: 'Spinaci',
         pt: 'Espinafre', ja: 'ほうれん草', 'zh-Hans': '菠菜', 'zh-Hant': '菠菜',
         ar: 'سبانخ' } },

  { id: 'garlic',       he: 'שום, טרי',
    t: { en: 'Garlic', de: 'Knoblauch', es: 'Ajo', fr: 'Ail', it: 'Aglio',
         pt: 'Alho', ja: 'にんにく', 'zh-Hans': '大蒜', 'zh-Hant': '大蒜', ar: 'ثوم' } },

  { id: 'mushroom',     he: 'פטריות, טריות',
    t: { en: 'Mushrooms', de: 'Champignons', es: 'Champiñones', fr: 'Champignons',
         it: 'Funghi', pt: 'Cogumelos', ja: 'マッシュルーム', 'zh-Hans': '蘑菇',
         'zh-Hant': '蘑菇', ar: 'فطر' } },

  { id: 'corn',         he: 'תירס, טרי',
    t: { en: 'Corn', de: 'Mais', es: 'Maíz', fr: 'Maïs', it: 'Mais',
         pt: 'Milho', ja: 'とうもろこし', 'zh-Hans': '玉米', 'zh-Hant': '玉米',
         ar: 'ذرة' } },

  { id: 'pumpkin',      he: 'דלעת, עם קליפה וגרעינים, טריה',
    t: { en: 'Pumpkin, with skin and seeds', de: 'Kürbis, mit Schale und Kernen',
         es: 'Calabaza, con piel y semillas', fr: 'Potiron, avec peau et graines',
         it: 'Zucca, con buccia e semi', pt: 'Abóbora, com casca e sementes',
         ja: 'かぼちゃ（皮と種つき）', 'zh-Hans': '南瓜（带皮带籽）',
         'zh-Hant': '南瓜（帶皮帶籽）', ar: 'قرع عسلي بالقشر والبذور' } },

  { id: 'beetroot',     he: 'סלק, טרי',
    t: { en: 'Beet', de: 'Rote Bete', es: 'Remolacha', fr: 'Betterave',
         it: 'Barbabietola', pt: 'Beterraba', ja: 'ビーツ', 'zh-Hans': '甜菜根',
         'zh-Hant': '甜菜根', ar: 'شمندر' } },

  { id: 'celery',       he: 'סלרי, כרפס, טרי',
    t: { en: 'Celery', de: 'Staudensellerie', es: 'Apio', fr: 'Céleri',
         it: 'Sedano', pt: 'Aipo', ja: 'セロリ', 'zh-Hans': '西芹',
         'zh-Hant': '西洋芹', ar: 'كرفس' } },

  { id: 'bulgur-dry',   he: 'בורגול, יבש',
    t: { en: 'Bulgur, dry', de: 'Bulgur, trocken', es: 'Bulgur, seco',
         fr: 'Boulgour, sec', it: 'Bulgur, secco', pt: 'Bulgur, seco',
         ja: 'ブルグル（乾燥）', 'zh-Hans': '布格麦（干）', 'zh-Hant': '布格麥（乾）',
         ar: 'برغل جاف' } },

  { id: 'flour-white',  he: 'קמח חיטה לבן',
    t: { en: 'White wheat flour', de: 'Weizenmehl, hell', es: 'Harina de trigo blanca',
         fr: 'Farine de blé blanche', it: 'Farina di grano bianca',
         pt: 'Farinha de trigo branca', ja: '小麦粉（白）',
         'zh-Hans': '白小麦粉', 'zh-Hant': '白小麥粉', ar: 'دقيق قمح أبيض' } },

  { id: 'flour-whole',  he: 'קמח חיטה מלאה',
    t: { en: 'Wholemeal wheat flour', de: 'Weizenvollkornmehl',
         es: 'Harina de trigo integral', fr: 'Farine de blé complète',
         it: 'Farina integrale di grano', pt: 'Farinha de trigo integral',
         ja: '全粒小麦粉', 'zh-Hans': '全麦面粉', 'zh-Hant': '全麥麵粉',
         ar: 'دقيق قمح كامل' } },

  { id: 'white-beans-dry', he: 'שעועית לבנה יבשה',
    t: { en: 'White beans, dry', de: 'Weiße Bohnen, trocken',
         es: 'Alubias blancas, secas', fr: 'Haricots blancs, secs',
         it: 'Fagioli bianchi, secchi', pt: 'Feijão branco, seco',
         ja: '白いんげん豆（乾燥）', 'zh-Hans': '白芸豆（干）',
         'zh-Hant': '白腰豆（乾）', ar: 'فاصوليا بيضاء جافة' } },

  { id: 'beef-brisket', he: 'בשר בקר, חזה, מבושל',
    t: { en: 'Beef brisket, cooked', de: 'Rinderbrust, gegart',
         es: 'Pecho de vacuno, cocido', fr: 'Poitrine de bœuf, cuite',
         it: 'Punta di petto di manzo, cotta', pt: 'Peito bovino, cozido',
         ja: '牛ブリスケット（加熱）', 'zh-Hans': '牛胸肉（熟）',
         'zh-Hant': '牛胸肉（熟）', ar: 'صدر بقر مطبوخ' } },

  { id: 'chicken-thigh-raw', he: 'בשר עוף, ירך, בשר בלבד, לא מבושל',
    t: { en: 'Chicken thigh, meat only, raw', de: 'Hähnchenschenkel, nur Fleisch, roh',
         es: 'Muslo de pollo, solo carne, crudo',
         fr: 'Cuisse de poulet, chair seule, crue',
         it: 'Coscia di pollo, solo carne, cruda',
         pt: 'Coxa de frango, só carne, crua', ja: '鶏もも肉（肉のみ・生）',
         'zh-Hans': '鸡腿肉（仅肉，生）', 'zh-Hant': '雞腿肉（僅肉，生）',
         ar: 'فخذ دجاج، لحم فقط، نيء' } },

  { id: 'salmon-frozen', he: 'דג סלמון, קפוא',
    t: { en: 'Salmon, frozen', de: 'Lachs, gefroren', es: 'Salmón, congelado',
         fr: 'Saumon, surgelé', it: 'Salmone, congelato', pt: 'Salmão, congelado',
         ja: 'サーモン（冷凍）', 'zh-Hans': '三文鱼（冷冻）',
         'zh-Hant': '鮭魚（冷凍）', ar: 'سلمون مجمّد' } },

  { id: 'tuna-raw',     he: 'דג טונה, לא מבושל',
    t: { en: 'Tuna, raw', de: 'Thunfisch, roh', es: 'Atún, crudo', fr: 'Thon, cru',
         it: 'Tonno, crudo', pt: 'Atum, cru', ja: 'まぐろ（生）',
         'zh-Hans': '金枪鱼（生）', 'zh-Hant': '鮪魚（生）', ar: 'تونة نيئة' } },

  { id: 'yogurt-plain-2', he: 'יוגורט טבעי, 2% שומן, מולר',
    t: { en: 'Plain yogurt, 2%', de: 'Naturjoghurt, 2%', es: 'Yogur natural, 2%',
         fr: 'Yaourt nature, 2%', it: 'Yogurt bianco, 2%', pt: 'Iogurte natural, 2%',
         ja: 'プレーンヨーグルト 2%', 'zh-Hans': '原味酸奶 2%',
         'zh-Hant': '原味優格 2%', ar: 'لبن زبادي سادة 2%' } },

  { id: 'cream-cheese-9', he: 'גבינת שמנת 9% שומן, שטראוס',
    t: { en: 'Cream cheese, 9%', de: 'Frischkäse, 9%', es: 'Queso crema, 9%',
         fr: 'Fromage à tartiner, 9%', it: 'Formaggio spalmabile, 9%',
         pt: 'Queijo cremoso, 9%', ja: 'クリームチーズ 9%',
         'zh-Hans': '奶油奶酪 9%', 'zh-Hant': '奶油乳酪 9%', ar: 'جبنة كريمية 9%' } },

  { id: 'peanuts',      he: 'בוטנים, טריים',
    t: { en: 'Peanuts, raw', de: 'Erdnüsse, roh', es: 'Cacahuetes, crudos',
         fr: 'Cacahuètes, crues', it: 'Arachidi, crude', pt: 'Amendoins, crus',
         ja: 'ピーナッツ（生）', 'zh-Hans': '花生（生）', 'zh-Hant': '花生（生）',
         ar: 'فول سوداني نيء' } },

  { id: 'honey',        he: 'דבש',
    t: { en: 'Honey', de: 'Honig', es: 'Miel', fr: 'Miel', it: 'Miele',
         pt: 'Mel', ja: 'はちみつ', 'zh-Hans': '蜂蜜', 'zh-Hant': '蜂蜜',
         ar: 'عسل' } },

  { id: 'sugar-brown',  he: 'סוכר, חום',
    t: { en: 'Brown sugar', de: 'Brauner Zucker', es: 'Azúcar moreno',
         fr: 'Sucre roux', it: 'Zucchero di canna', pt: 'Açúcar mascavo',
         ja: 'ブラウンシュガー', 'zh-Hans': '红糖', 'zh-Hant': '黑糖',
         ar: 'سكر بني' } },

  { id: 'bread-dark',   he: 'לחם אחיד, כהה, פרוס',
    t: { en: 'Dark bread, sliced', de: 'Dunkles Brot, geschnitten',
         es: 'Pan moreno, en rebanadas', fr: 'Pain bis, en tranches',
         it: 'Pane scuro, a fette', pt: 'Pão escuro, fatiado',
         ja: '黒パン（スライス）', 'zh-Hans': '黑面包（切片）',
         'zh-Hant': '黑麵包（切片）', ar: 'خبز داكن مقطّع' } },
  { id: 'grapefruit',   he: 'אשכולית, טריה',
    t: { en: 'Grapefruit', de: 'Grapefruit', es: 'Pomelo', fr: 'Pamplemousse',
         it: 'Pompelmo', pt: 'Toranja', ja: 'グレープフルーツ', 'zh-Hans': '西柚',
         'zh-Hant': '葡萄柚', ar: 'جريب فروت' } },

  { id: 'plum',         he: 'שזיף, טרי',
    t: { en: 'Plum', de: 'Pflaume', es: 'Ciruela', fr: 'Prune', it: 'Prugna',
         pt: 'Ameixa', ja: 'プラム', 'zh-Hans': '李子', 'zh-Hant': '李子',
         ar: 'برقوق (خوخ)' } },

  { id: 'apricot',      he: 'משמש, טרי',
    t: { en: 'Apricot', de: 'Aprikose', es: 'Albaricoque', fr: 'Abricot',
         it: 'Albicocca', pt: 'Damasco', ja: 'あんず', 'zh-Hans': '杏',
         'zh-Hant': '杏桃', ar: 'مشمش' } },

  { id: 'apricot-dried', he: 'משמש, מיובש',
    t: { en: 'Apricot, dried', de: 'Aprikose, getrocknet', es: 'Albaricoque, seco',
         fr: 'Abricot, sec', it: 'Albicocca, secca', pt: 'Damasco, seco',
         ja: 'あんず（乾燥）', 'zh-Hans': '杏干', 'zh-Hant': '杏乾',
         ar: 'مشمش مجفف' } },

  { id: 'pomegranate',  he: 'רימון, חי, כראוי לאכילה',
    t: { en: 'Pomegranate, edible part', de: 'Granatapfel, essbarer Teil',
         es: 'Granada, parte comestible', fr: 'Grenade, partie comestible',
         it: 'Melagrana, parte edibile', pt: 'Romã, parte comestível',
         ja: 'ざくろ（可食部）', 'zh-Hans': '石榴（可食部分）',
         'zh-Hant': '石榴（可食部分）', ar: 'رمان، الجزء الصالح للأكل' } },

  { id: 'fig',          he: 'תאנה, טריה',
    t: { en: 'Fig', de: 'Feige', es: 'Higo', fr: 'Figue', it: 'Fico',
         pt: 'Figo', ja: 'いちじく', 'zh-Hans': '无花果', 'zh-Hant': '無花果',
         ar: 'تين' } },

  { id: 'fig-dried',    he: 'תאנה, מיובשת',
    t: { en: 'Fig, dried', de: 'Feige, getrocknet', es: 'Higo, seco',
         fr: 'Figue, sèche', it: 'Fico, secco', pt: 'Figo, seco',
         ja: 'いちじく（乾燥）', 'zh-Hans': '无花果干', 'zh-Hant': '無花果乾',
         ar: 'تين مجفف' } },

  { id: 'kiwi',         he: 'קיווי, טרי',
    t: { en: 'Kiwi', de: 'Kiwi', es: 'Kiwi', fr: 'Kiwi', it: 'Kiwi',
         pt: 'Kiwi', ja: 'キウイ', 'zh-Hans': '猕猴桃', 'zh-Hant': '奇異果',
         ar: 'كيوي' } },

  { id: 'pineapple',    he: 'אננס, טרי',
    t: { en: 'Pineapple', de: 'Ananas', es: 'Piña', fr: 'Ananas', it: 'Ananas',
         pt: 'Abacaxi', ja: 'パイナップル', 'zh-Hans': '菠萝',
         'zh-Hant': '鳳梨', ar: 'أناناس' } },

  { id: 'raisins',      he: 'צימוקים, ללא חרצנים',
    t: { en: 'Raisins, seedless', de: 'Rosinen, kernlos', es: 'Pasas, sin semillas',
         fr: 'Raisins secs, sans pépins', it: 'Uvetta, senza semi',
         pt: 'Passas, sem sementes', ja: 'レーズン（種なし）',
         'zh-Hans': '葡萄干（无籽）', 'zh-Hant': '葡萄乾（無籽）',
         ar: 'زبيب بدون بذور' } },

  { id: 'green-beans',  he: 'שעועית ירוקה, טריה',
    t: { en: 'Green beans', de: 'Grüne Bohnen', es: 'Judías verdes',
         fr: 'Haricots verts', it: 'Fagiolini', pt: 'Vagem',
         ja: 'いんげん', 'zh-Hans': '四季豆', 'zh-Hant': '四季豆',
         ar: 'فاصوليا خضراء' } },

  { id: 'peas-green',   he: 'אפונה ירוקה, טריה',
    t: { en: 'Green peas', de: 'Grüne Erbsen', es: 'Guisantes', fr: 'Petits pois',
         it: 'Piselli', pt: 'Ervilhas', ja: 'グリーンピース',
         'zh-Hans': '豌豆', 'zh-Hant': '豌豆', ar: 'بازلاء خضراء' } },

  { id: 'peas-dry',     he: 'אפונה יבשה',
    t: { en: 'Peas, dry', de: 'Erbsen, trocken', es: 'Guisantes, secos',
         fr: 'Pois, secs', it: 'Piselli, secchi', pt: 'Ervilhas, secas',
         ja: 'えんどう豆（乾燥）', 'zh-Hans': '豌豆（干）',
         'zh-Hant': '豌豆（乾）', ar: 'بازلاء جافة' } },

  { id: 'radish',       he: 'צנון, טרי',
    t: { en: 'White radish (daikon)', de: 'Rettich (Daikon)', es: 'Rábano blanco (daikon)', fr: 'Radis blanc (daïkon)', it: 'Ravanello bianco (daikon)',
         pt: 'Rabanete branco (daikon)', ja: '大根', 'zh-Hans': '萝卜', 'zh-Hant': '蘿蔔',
         ar: 'فجل أبيض' } },

  { id: 'leek',         he: 'כרישה - פרסה, טריה',
    t: { en: 'Leek', de: 'Lauch', es: 'Puerro', fr: 'Poireau', it: 'Porro',
         pt: 'Alho-poró', ja: 'リーキ', 'zh-Hans': '韭葱', 'zh-Hant': '韭蔥',
         ar: 'كراث' } },

  { id: 'parsley',      he: 'פטרוזיליה, טריה, עלים',
    t: { en: 'Parsley leaves, fresh', de: 'Petersilienblätter, frisch', es: 'Hojas de perejil, frescas',
         fr: 'Feuilles de persil, fraîches', it: 'Foglie di prezzemolo, fresche',
         pt: 'Folhas de salsa, frescas', ja: 'パセリの葉（生）', 'zh-Hans': '欧芹叶（鲜）',
         'zh-Hant': '歐芹葉（鮮）', ar: 'ورق بقدونس طازج' } },

  { id: 'coriander',    he: 'כוסברה, טריה',
    t: { en: 'Coriander, fresh', de: 'Koriander, frisch', es: 'Cilantro, fresco',
         fr: 'Coriandre, fraîche', it: 'Coriandolo, fresco',
         pt: 'Coentro, fresco', ja: 'パクチー（生）', 'zh-Hans': '香菜',
         'zh-Hant': '香菜', ar: 'كزبرة خضراء' } },

  { id: 'dill',         he: 'שמיר, טרי',
    t: { en: 'Dill, fresh', de: 'Dill, frisch', es: 'Eneldo, fresco',
         fr: 'Aneth, frais', it: 'Aneto, fresco', pt: 'Endro, fresco',
         ja: 'ディル（生）', 'zh-Hans': '莳萝', 'zh-Hant': '蒔蘿',
         ar: 'شبت طازج' } },

  { id: 'mint',         he: 'נענע, טרי',
    t: { en: 'Mint, fresh', de: 'Minze, frisch', es: 'Menta, fresca',
         fr: 'Menthe, fraîche', it: 'Menta, fresca', pt: 'Hortelã, fresca',
         ja: 'ミント（生）', 'zh-Hans': '薄荷', 'zh-Hant': '薄荷',
         ar: 'نعناع طازج' } },

  { id: 'olives-green', he: 'זיתים ירוקים',
    t: { en: 'Green olives', de: 'Grüne Oliven', es: 'Aceitunas verdes',
         fr: 'Olives vertes', it: 'Olive verdi', pt: 'Azeitonas verdes',
         ja: 'グリーンオリーブ', 'zh-Hans': '绿橄榄', 'zh-Hant': '綠橄欖',
         ar: 'زيتون أخضر' } },

  { id: 'almonds-blanched', he: 'שקדים מולבנים',
    t: { en: 'Almonds, blanched', de: 'Mandeln, blanchiert',
         es: 'Almendras, peladas', fr: 'Amandes, émondées',
         it: 'Mandorle, pelate', pt: 'Amêndoas, sem pele',
         ja: 'アーモンド（皮なし）', 'zh-Hans': '巴旦木（去皮）',
         'zh-Hant': '杏仁（去皮）', ar: 'لوز مقشّر' } },

  { id: 'walnuts',      he: 'אגוזי מלך, בלי קליפה, לא קלויים, ללא מלח',
    t: { en: 'Walnuts, shelled, unroasted, unsalted',
         de: 'Walnüsse, geschält, ungeröstet, ungesalzen',
         es: 'Nueces, peladas, sin tostar, sin sal',
         fr: 'Noix, décortiquées, non grillées, non salées',
         it: 'Noci, sgusciate, non tostate, non salate',
         pt: 'Nozes, sem casca, não torradas, sem sal',
         ja: 'くるみ（殻なし・生・無塩）',
         'zh-Hans': '核桃仁（未烤，无盐）', 'zh-Hant': '核桃仁（未烤，無鹽）',
         ar: 'جوز مقشور غير محمص وبدون ملح' } },

  { id: 'cashews',      he: 'אגוזי קשיו, טבעיים',
    t: { en: 'Cashews, raw', de: 'Cashewkerne, natur', es: 'Anacardos, crudos',
         fr: 'Noix de cajou, nature', it: 'Anacardi, al naturale',
         pt: 'Castanhas de caju, cruas', ja: 'カシューナッツ（生）',
         'zh-Hans': '腰果（生）', 'zh-Hant': '腰果（生）',
         ar: 'كاجو نيء' } },

  { id: 'sunflower-seeds', he: 'גרעיני חמניות בלי קליפה, קלויים, עם מלח',
    t: { en: 'Sunflower seeds, shelled, roasted, salted',
         de: 'Sonnenblumenkerne, geschält, geröstet, gesalzen',
         es: 'Pipas de girasol, peladas, tostadas, saladas',
         fr: 'Graines de tournesol, décortiquées, grillées, salées',
         it: 'Semi di girasole, sgusciati, tostati, salati',
         pt: 'Sementes de girassol, sem casca, torradas, salgadas',
         ja: 'ひまわりの種（殻なし・ロースト・有塩）',
         'zh-Hans': '葵花籽仁（烤，加盐）', 'zh-Hant': '葵花籽仁（烤，加鹽）',
         ar: 'بذور دوار الشمس مقشورة محمصة مملحة' } },

  { id: 'sesame',       he: 'שומשום, גרעינים מלאים, לא קלוי',
    t: { en: 'Sesame seeds, whole, unroasted',
         de: 'Sesamsamen, ganz, ungeröstet', es: 'Semillas de sésamo, enteras, sin tostar',
         fr: 'Graines de sésame, entières, non grillées',
         it: 'Semi di sesamo, interi, non tostati',
         pt: 'Sementes de gergelim, inteiras, não torradas',
         ja: 'ごま（粒・未焙煎）', 'zh-Hans': '芝麻（整粒，未烤）',
         'zh-Hant': '芝麻（整粒，未烤）', ar: 'بذور سمسم كاملة غير محمصة' } },

  { id: 'pumpkin-seeds', he: 'גרעיני דלעת עם קליפה ללא מלח',
    t: { en: 'Pumpkin seeds, in shell, unsalted',
         de: 'Kürbiskerne, mit Schale, ungesalzen',
         es: 'Pipas de calabaza, con cáscara, sin sal',
         fr: 'Graines de courge, en coque, non salées',
         it: 'Semi di zucca, con guscio, non salati',
         pt: 'Sementes de abóbora, com casca, sem sal',
         ja: 'かぼちゃの種（殻つき・無塩）', 'zh-Hans': '南瓜子（带壳，无盐）',
         'zh-Hant': '南瓜子（帶殼，無鹽）', ar: 'بذور قرع بالقشر بدون ملح' } },

  { id: 'chicken-liver', he: 'כבד עוף, לא מבושל',
    t: { en: 'Chicken liver, raw', de: 'Hühnerleber, roh', es: 'Hígado de pollo, crudo',
         fr: 'Foie de poulet, cru', it: 'Fegato di pollo, crudo',
         pt: 'Fígado de frango, cru', ja: '鶏レバー（生）',
         'zh-Hans': '鸡肝（生）', 'zh-Hant': '雞肝（生）', ar: 'كبد دجاج نيء' } },

  { id: 'sour-cream-9', he: 'שמנת חמוצה 9% שומן, תנובה',
    t: { en: 'Sour cream, 9%', de: 'Saure Sahne, 9%', es: 'Crema agria, 9%',
         fr: 'Crème aigre, 9%', it: 'Panna acida, 9%', pt: 'Creme azedo, 9%',
         ja: 'サワークリーム 9%', 'zh-Hans': '酸奶油 9%',
         'zh-Hant': '酸奶油 9%', ar: 'قشدة حامضة 9%' } },

  { id: 'bulgarian-cheese', he: 'גבינה בולגרית, 24% שומן, שטראוס',
    t: { en: 'Brined white cheese (feta-style), 24%', de: 'Salzlakenkäse, 24%',
         es: 'Queso blanco en salmuera, 24%', fr: 'Fromage en saumure (type feta), 24%',
         it: 'Formaggio bianco in salamoia, 24%',
         pt: 'Queijo branco em salmoura, 24%', ja: 'フェタ風チーズ 24%',
         'zh-Hans': '盐渍白奶酪 24%', 'zh-Hant': '鹽漬白起司 24%',
         ar: 'جبنة بيضاء بالماء المالح 24%' } },

  { id: 'barley-cooked', he: 'גריסי פנינה, מבושלים, ללא תוספת שומן בבישול',
    t: { en: 'Pearl barley, cooked', de: 'Perlgraupen, gekocht',
         es: 'Cebada perlada, cocida', fr: 'Orge perlé, cuit',
         it: 'Orzo perlato, cotto', pt: 'Cevada perolada, cozida',
         ja: '丸麦（炊いたもの）', 'zh-Hans': '珍珠大麦（煮熟）',
         'zh-Hant': '珍珠大麥（煮熟）', ar: 'شعير لؤلؤي مطبوخ' } },

  { id: 'egg-cooked',   he: 'ביצה או חביתה מטוגנת ללא שמן',
    t: { en: 'Egg or omelette, cooked without oil',
         de: 'Ei oder Omelett, ohne Öl gegart',
         es: 'Huevo u omelet, cocinado sin aceite',
         fr: 'Œuf ou omelette, cuit sans huile',
         it: 'Uovo o frittata, cotto senza olio',
         pt: 'Ovo ou omelete, cozido sem óleo',
         ja: '卵・オムレツ（油なしで加熱）', 'zh-Hans': '鸡蛋／煎蛋（无油）',
         'zh-Hant': '雞蛋／煎蛋（無油）', ar: 'بيض أو عجة بدون زيت' } },

  { id: 'egg-white-raw', he: 'ביצה חלבון לא מבושל',
    t: { en: 'Egg white, raw', de: 'Eiklar, roh', es: 'Clara de huevo, cruda',
         fr: "Blanc d'œuf, cru", it: "Albume d'uovo, crudo",
         pt: 'Clara de ovo, crua', ja: '卵白（生）', 'zh-Hans': '蛋清（生）',
         'zh-Hant': '蛋白（生）', ar: 'بياض البيض، نيء' } },

  { id: 'cod-cooked',   he: 'דג בקלה מבושל ללא שמן',
    t: { en: 'Cod, cooked without oil', de: 'Kabeljau, ohne Öl gegart',
         es: 'Bacalao fresco, cocinado sin aceite', fr: 'Cabillaud, cuit sans huile',
         it: 'Merluzzo, cotto senza olio', pt: 'Bacalhau fresco, cozido sem óleo',
         ja: 'たら（油なしで加熱）', 'zh-Hans': '鳕鱼（无油烹制）',
         'zh-Hant': '鱈魚（無油烹製）', ar: 'سمك القد مطهو بدون زيت' } },

  { id: 'edamame',      he: 'פולי סויה, אדממה, קפוא, ללא תרמיל, מבושל',
    t: { en: 'Edamame, shelled, cooked', de: 'Edamame, ausgelöst, gegart',
         es: 'Edamame, sin vaina, cocido', fr: 'Édamamé, écossé, cuit',
         it: 'Edamame, sgusciati, cotti', pt: 'Edamame, sem vagem, cozido',
         ja: '枝豆（さやなし・加熱）', 'zh-Hans': '毛豆仁（熟）',
         'zh-Hant': '毛豆仁（熟）', ar: 'إدامامي مقشّر مطبوخ' } },

  { id: 'coconut-fresh', he: 'קוקוס, בשר, טרי, ללא קליפה',
    t: { en: 'Coconut flesh, fresh', de: 'Kokosnussfleisch, frisch',
         es: 'Pulpa de coco, fresca', fr: 'Chair de coco, fraîche',
         it: 'Polpa di cocco, fresca', pt: 'Polpa de coco, fresca',
         ja: 'ココナッツの果肉（生）', 'zh-Hans': '椰肉（鲜）',
         'zh-Hant': '椰肉（鮮）', ar: 'لب جوز الهند طازج' } },

  { id: 'jam',          he: 'ריבה, כל הטעמים',
    t: { en: 'Jam, any flavour', de: 'Marmelade, alle Sorten',
         es: 'Mermelada, cualquier sabor', fr: 'Confiture, tous parfums',
         it: 'Marmellata, tutti i gusti', pt: 'Geleia, qualquer sabor',
         ja: 'ジャム（味を問わず）', 'zh-Hans': '果酱（各种口味）',
         'zh-Hant': '果醬（各種口味）', ar: 'مربى، بجميع النكهات' } },
];

const LANGS = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'];

const raw = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const rows = raw.foods || raw;
const byName = new Map();
for (const r of rows) byName.set(r.n, r);

const out = [];
const missing = [];
const gaps = [];
for (const c of CORE) {
  const r = byName.get(c.he);
  if (!r) { missing.push(c.he); continue; }
  for (const l of LANGS) if (!c.t[l]) gaps.push(c.id + ' has no ' + l);
  const t = Object.assign({ he: c.he }, c.t);
  out.push({ id: 'core:' + c.id, k: r.k, p: r.p, c: r.c, f: r.f, t });
}

if (missing.length) {
  console.error('These rows are no longer in ' + SRC + ':');
  for (const m of missing) console.error('  ' + m);
  process.exit(1);
}
if (gaps.length) {
  console.error('Missing names:');
  for (const g of gaps) console.error('  ' + g);
  process.exit(1);
}

fs.writeFileSync(OUT, JSON.stringify({ foods: out }, null, 1) + '\n');
console.log(out.length + ' generic foods, ' + (LANGS.length + 1) + ' languages each -> ' + OUT);
console.log('every value copied from ' + SRC + '; nothing invented');
