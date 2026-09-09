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

/* Where a row's numbers were measured. Every entry names one, and the build
   refuses an entry that names none or names something not listed here.

   It used to be implicit - every entry pointed at a row in foods.json, so
   there was only one possible answer. The core now has to admit foods that
   table does not carry, and the moment there are two possible answers,
   "where did this number come from" stops being answerable by reading the
   file. An entry that forgets to say is exactly what a hurried edit would
   produce, so that is what this fails on. */
const SOURCES = {
  /* The Israeli Ministry of Health table, already in data/foods.json. The
     numbers are copied from the named row, never retyped. */
  moh: 'Israeli Ministry of Health food composition table',
};

/* he: the exact name of a row in foods.json.

   A QUALIFIER IS CARRIED INTO ALL ELEVEN when it does either of two jobs, and
   dropped when it does neither:

     it separates sibling rows - "without oil" picks one chicken breast out of
     two, "organic" picks one soy drink out of nine, "dry" one lentil row from
     the cooked one; or

     it carries a word people use to name the food - "white or red" onion
     separates nothing, both colours being one row, but dropping it makes "red
     onion" and "white onion" return NOTHING AT ALL, because no other language's
     name contains those words for foodAlt to rescue.

   קפוא on the edamame does neither - both edamame rows are frozen, and nobody
   types "frozen edamame" to mean it - so it is dropped. Measured, not argued:
   the onion experiment showed absence from all forty results, not demotion. */
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
    t: { en: 'Whole wheat (wholemeal) flour', de: 'Weizenvollkornmehl',
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

  { id: 'yogurt-plain-2', he: 'יוגורט טבעי, 2.8% שומן , מולר',
    t: { en: 'Plain yogurt, 2.8%', de: 'Naturjoghurt, 2,8%', es: 'Yogur natural, 2,8%',
         fr: 'Yaourt nature, 2,8%', it: 'Yogurt bianco, 2,8%', pt: 'Iogurte natural, 2,8%',
         ja: 'プレーンヨーグルト 2.8%', 'zh-Hans': '原味酸奶 2.8%',
         'zh-Hant': '原味優格 2.8%', ar: 'لبن زبادي سادة 2.8%' } },

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
    /* Split peas, matching the cooked entry: 341/24.5/34.9/1.2 is USDA
       "peas, split, mature seeds, raw" to the decimal. */
    t: { en: 'Split peas, dry', de: 'Schälerbsen, trocken', es: 'Guisantes, secos',
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
    aka: ['אגוזים'],
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
    aka: ['אגוזים'],
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
  { id: 'potato-baked',  he: 'תפוחי אדמה, אפויים, עם מלח, קליפה נאכלה, ללא תוספת שומן',
    aka: ['תפוח אדמה'],
    t: { en: 'Potato, baked with skin, no added fat',
         de: 'Kartoffel, mit Schale gebacken, ohne Fettzugabe',
         es: 'Patata, asada con piel, sin grasa añadida',
         fr: 'Pomme de terre, cuite au four avec la peau, sans matière grasse',
         it: 'Patata, al forno con la buccia, senza grassi aggiunti',
         pt: 'Batata, assada com casca, sem gordura adicionada',
         ja: 'じゃがいも（皮つき・焼き・油なし）',
         'zh-Hans': '土豆（带皮烤，无额外油脂）',
         'zh-Hant': '馬鈴薯（帶皮烤，無額外油脂）',
         ar: 'بطاطا (بطاطس) مشوية بالقشر بدون دهون مضافة' } },

  { id: 'potato-boiled', he: 'תפוחי אדמה, מבושלים, ללא קליפה, עם מלח, ללא תוספת שומן',
    aka: ['תפוח אדמה'],
    t: { en: 'Potato, boiled and peeled, no added fat',
         de: 'Kartoffel, geschält gekocht, ohne Fettzugabe',
         es: 'Patata, hervida y pelada, sin grasa añadida',
         fr: 'Pomme de terre, bouillie et épluchée, sans matière grasse',
         it: 'Patata, lessata e sbucciata, senza grassi aggiunti',
         pt: 'Batata, cozida e descascada, sem gordura adicionada',
         ja: 'じゃがいも（皮なし・ゆで・油なし）',
         'zh-Hans': '土豆（去皮水煮，无额外油脂）',
         'zh-Hant': '馬鈴薯（去皮水煮，無額外油脂）',
         ar: 'بطاطا (بطاطس) مسلوقة مقشّرة بدون دهون مضافة' } },

  { id: 'pasta-whole-cooked', he: 'אטריות/פסטה, חיטה מלאה, מבושלות עם מלח, ללא תוספת שמן בבישול',
    t: { en: 'Whole wheat (wholemeal) pasta, cooked', de: 'Vollkornnudeln, gekocht',
         es: 'Pasta integral, cocida', fr: 'Pâtes complètes, cuites',
         it: 'Pasta integrale, cotta', pt: 'Massa integral, cozida',
         ja: '全粒粉パスタ（ゆで）', 'zh-Hans': '全麦意面（煮熟）',
         'zh-Hant': '全麥義大利麵（煮熟）', ar: 'معكرونة قمح كامل مطبوخة' } },

  { id: 'pasta-whole-dry', he: 'אטריות/פסטה, חיטה מלאה, לא מבושלות',
    t: { en: 'Whole wheat (wholemeal) pasta, dry', de: 'Vollkornnudeln, trocken',
         es: 'Pasta integral, seca', fr: 'Pâtes complètes, crues',
         it: 'Pasta integrale, cruda', pt: 'Massa integral, crua',
         ja: '全粒粉パスタ（乾燥）', 'zh-Hans': '全麦意面（干）',
         'zh-Hant': '全麥義大利麵（乾）', ar: 'معكرونة قمح كامل جافة' } },

  { id: 'turkey-breast', he: 'בשר הודו, חזה, לבן, מבושל',
    t: { en: 'Turkey breast, cooked', de: 'Putenbrust, gegart',
         es: 'Pechuga de pavo, cocida', fr: 'Blanc de dinde, cuit',
         it: 'Petto di tacchino, cotto', pt: 'Peito de peru, cozido',
         ja: '七面鳥むね肉（加熱）', 'zh-Hans': '火鸡胸肉（熟）',
         'zh-Hant': '火雞胸肉（熟）', ar: 'صدر ديك رومي مطبوخ' } },

  { id: 'beef-mince-cooked', he: 'בשר בקר, טחון, מבושל',
    t: { en: 'Ground beef (minced), cooked', de: 'Rinderhackfleisch, gegart',
         es: 'Carne picada de vacuno, cocida', fr: 'Bœuf haché, cuit',
         it: 'Carne macinata di manzo, cotta', pt: 'Carne moída bovina, cozida',
         ja: '牛ひき肉（加熱）', 'zh-Hans': '牛肉末（熟）',
         'zh-Hant': '牛絞肉（熟）', ar: 'لحم بقر مفروم مطبوخ' } },

  { id: 'beef-mince-raw', he: 'בשר בקר, טחון, לא מבושל',
    t: { en: 'Ground beef (minced), raw', de: 'Rinderhackfleisch, roh',
         es: 'Carne picada de vacuno, cruda', fr: 'Bœuf haché, cru',
         it: 'Carne macinata di manzo, cruda', pt: 'Carne moída bovina, crua',
         ja: '牛ひき肉（生）', 'zh-Hans': '牛肉末（生）',
         'zh-Hant': '牛絞肉（生）', ar: 'لحم بقر مفروم نيء' } },

  { id: 'veal-steak',   he: 'בשר עגל, סטייק, מבושל',
    t: { en: 'Veal steak, cooked', de: 'Kalbssteak, gegart',
         es: 'Filete de ternera, cocido', fr: 'Steak de veau, cuit',
         it: 'Bistecca di vitello, cotta', pt: 'Bife de vitela, cozido',
         ja: '仔牛ステーキ（加熱）', 'zh-Hans': '小牛肉排（熟）',
         'zh-Hant': '小牛肉排（熟）', ar: 'ستيك عجل مطبوخ' } },

  { id: 'duck-roasted', he: 'בשר ברווז, צלוי, נאכל עם עור',
    t: { en: 'Duck, roasted, with skin', de: 'Ente, gebraten, mit Haut',
         es: 'Pato, asado, con piel', fr: 'Canard, rôti, avec la peau',
         it: 'Anatra, arrosto, con la pelle', pt: 'Pato, assado, com pele',
         ja: '鴨（ロースト・皮ごと）', 'zh-Hans': '鸭肉（烤，连皮）',
         'zh-Hant': '鴨肉（烤，連皮）', ar: 'بط مشوي بالجلد' } },

  { id: 'sardine-raw',  he: 'דג סרדין, לא מבושל',
    t: { en: 'Sardine, raw', de: 'Sardine, roh', es: 'Sardina, cruda',
         fr: 'Sardine, crue', it: 'Sardina, cruda', pt: 'Sardinha, crua',
         ja: 'いわし（生）', 'zh-Hans': '沙丁鱼（生）',
         'zh-Hant': '沙丁魚（生）', ar: 'سردين نيء' } },

  { id: 'mackerel-smoked', he: 'דג מקרל, מעושן',
    t: { en: 'Mackerel, smoked', de: 'Makrele, geräuchert', es: 'Caballa, ahumada',
         fr: 'Maquereau, fumé', it: 'Sgombro, affumicato', pt: 'Cavala, defumada',
         ja: 'さば（燻製）', 'zh-Hans': '烟熏鲭鱼', 'zh-Hant': '煙燻鯖魚',
         ar: 'ماكريل مدخّن' } },

  { id: 'tilapia-cooked', he: 'דג אמנון-מושט, מבושל',
    t: { en: 'Tilapia, cooked', de: 'Tilapia, gegart', es: 'Tilapia, cocida',
         fr: 'Tilapia, cuit', it: 'Tilapia, cotta', pt: 'Tilápia, cozida',
         ja: 'ティラピア（加熱）', 'zh-Hans': '罗非鱼（熟）',
         'zh-Hant': '吳郭魚（熟）', ar: 'بلطي مطبوخ' } },

  { id: 'sea-bass-raw', he: 'דג לברק, לא מבושל',
    t: { en: 'Sea bass, raw', de: 'Wolfsbarsch, roh', es: 'Lubina, cruda',
         fr: 'Bar (loup de mer), cru', it: 'Branzino, crudo', pt: 'Robalo, cru',
         ja: 'スズキ（生）', 'zh-Hans': '鲈鱼（生）', 'zh-Hant': '鱸魚（生）',
         ar: 'قاروص نيء' } },

  { id: 'egg-yolk-raw', he: 'ביצה חלמון לא מבושל',
    t: { en: 'Egg yolk, raw', de: 'Eigelb, roh', es: 'Yema de huevo, cruda',
         fr: "Jaune d'œuf, cru", it: "Tuorlo d'uovo, crudo",
         pt: 'Gema de ovo, crua', ja: '卵黄（生）', 'zh-Hans': '蛋黄（生）',
         'zh-Hant': '蛋黃（生）', ar: 'صفار بيض نيء' } },

  { id: 'lettuce-romaine', he: 'חסה ערבית, חסה מסולסלת ESCAROLE Romaine',
    t: { en: 'Romaine lettuce', de: 'Römersalat', es: 'Lechuga romana',
         fr: 'Laitue romaine', it: 'Lattuga romana', pt: 'Alface romana',
         ja: 'ロメインレタス', 'zh-Hans': '罗马生菜',
         'zh-Hant': '蘿蔓生菜', ar: 'خس روماني' } },

  { id: 'pepper-green', he: 'פלפל ירוק, טרי',
    t: { en: 'Green pepper', de: 'Grüne Paprika', es: 'Pimiento verde',
         fr: 'Poivron vert', it: 'Peperone verde', pt: 'Pimentão verde',
         ja: 'ピーマン', 'zh-Hans': '青甜椒', 'zh-Hant': '青甜椒',
         ar: 'فلفل حلو أخضر' } },

  { id: 'goat-milk-4', he: 'חלב עזים 4% שומן',
    t: { en: 'Goat milk, 4%', de: 'Ziegenmilch, 4%', es: 'Leche de cabra, 4%',
         fr: 'Lait de chèvre, 4%', it: 'Latte di capra, 4%',
         pt: 'Leite de cabra, 4%', ja: 'ヤギミルク 4%', 'zh-Hans': '山羊奶 4%',
         'zh-Hant': '山羊奶 4%', ar: 'حليب ماعز 4%' } },

  { id: 'ricotta-9',    he: 'גבינת ריקוטה פרסקה 9% שומן, גד',
    t: { en: 'Ricotta, 9%', de: 'Ricotta, 9%', es: 'Ricotta, 9%',
         fr: 'Ricotta, 9%', it: 'Ricotta, 9%', pt: 'Ricota, 9%',
         ja: 'リコッタ 9%', 'zh-Hans': '里科塔奶酪 9%',
         'zh-Hant': '瑞可達起司 9%', ar: 'ريكوتا 9%' } },

  { id: 'halloumi-25',  he: 'גבינת חלומי 25% שומן, המחלבה',
    t: { en: 'Halloumi, 25%', de: 'Halloumi, 25%', es: 'Halloumi, 25%',
         fr: 'Halloumi, 25%', it: 'Halloumi, 25%', pt: 'Halloumi, 25%',
         ja: 'ハルーミ 25%', 'zh-Hans': '哈罗米奶酪 25%',
         'zh-Hant': '哈羅米起司 25%', ar: 'حلوم 25%' } },

  { id: 'mozzarella-22', he: 'גבינת מוצרלה 22% שומן, טרה',
    t: { en: 'Mozzarella, 22%', de: 'Mozzarella, 22%', es: 'Mozzarella, 22%',
         fr: 'Mozzarella, 22%', it: 'Mozzarella, 22%', pt: 'Muçarela, 22%',
         ja: 'モッツァレラ 22%', 'zh-Hans': '马苏里拉奶酪 22%',
         'zh-Hant': '莫札瑞拉起司 22%', ar: 'موتزاريلا 22%' } },

  { id: 'soy-drink',    he: 'משקה סויה אורגני בטעם טבעי',
    t: { en: 'Soy milk, organic, plain', de: 'Sojadrink, bio, natur', es: 'Bebida de soja, ecológica, natural',
         fr: 'Boisson au soja, bio, nature', it: 'Bevanda di soia, biologica, al naturale',
         pt: 'Bebida de soja, orgânica, natural', ja: '豆乳（オーガニック・プレーン）',
         'zh-Hans': '有机豆奶（原味）', 'zh-Hant': '有機豆漿（原味）',
         ar: 'مشروب صويا عضوي سادة' } },

  { id: 'almond-drink', he: 'משקה שקדים, אלפרו',
    t: { en: 'Almond milk', de: 'Mandeldrink', es: 'Bebida de almendras',
         fr: 'Boisson aux amandes', it: 'Bevanda di mandorle',
         pt: 'Bebida de amêndoa', ja: 'アーモンドミルク',
         'zh-Hans': '杏仁奶', 'zh-Hant': '杏仁奶', ar: 'مشروب لوز' } },

  { id: 'peanut-butter', he: 'חמאת בוטנים',
    t: { en: 'Peanut butter', de: 'Erdnussbutter', es: 'Mantequilla de cacahuete',
         fr: 'Beurre de cacahuète', it: 'Burro di arachidi',
         pt: 'Manteiga de amendoim', ja: 'ピーナッツバター',
         'zh-Hans': '花生酱', 'zh-Hant': '花生醬', ar: 'زبدة الفول السوداني' } },

  { id: 'orange-juice', he: 'מיץ תפוזים, סחוט טרי',
    t: { en: 'Orange juice, freshly squeezed',
         de: 'Orangensaft, frisch gepresst', es: 'Zumo de naranja, recién exprimido',
         fr: "Jus d'orange, fraîchement pressé", it: "Succo d'arancia, appena spremuto",
         pt: 'Suco de laranja, espremido na hora', ja: 'オレンジジュース（搾りたて）',
         'zh-Hans': '鲜榨橙汁', 'zh-Hant': '鮮榨柳橙汁',
         ar: 'عصير برتقال طازج' } },

  { id: 'maple-syrup',  he: 'סירופ מייפל, 100% מייפל, כולל קרם מייפל',
    t: { en: 'Maple syrup, 100%', de: 'Ahornsirup, 100%', es: 'Sirope de arce, 100%',
         fr: "Sirop d'érable, 100%", it: "Sciroppo d'acero, 100%",
         pt: 'Xarope de bordo, 100%', ja: 'メープルシロップ 100%',
         'zh-Hans': '枫糖浆 100%', 'zh-Hant': '楓糖漿 100%',
         ar: 'شراب القيقب 100%' } },

  { id: 'corn-oil',     he: 'שמן תירס',
    t: { en: 'Corn oil', de: 'Maiskeimöl', es: 'Aceite de maíz', fr: 'Huile de maïs',
         it: 'Olio di mais', pt: 'Óleo de milho', ja: 'コーン油',
         'zh-Hans': '玉米油', 'zh-Hant': '玉米油', ar: 'زيت ذرة' } },

  { id: 'sunflower-oil', he: 'שמן חמניות',
    t: { en: 'Sunflower oil', de: 'Sonnenblumenöl', es: 'Aceite de girasol',
         fr: 'Huile de tournesol', it: 'Olio di girasole',
         pt: 'Óleo de girassol', ja: 'ひまわり油', 'zh-Hans': '葵花籽油',
         'zh-Hant': '葵花油', ar: 'زيت دوار الشمس' } },

  { id: 'vinegar',      he: 'חומץ',
    t: { en: 'Vinegar', de: 'Essig', es: 'Vinagre', fr: 'Vinaigre',
         it: 'Aceto', pt: 'Vinagre', ja: '酢', 'zh-Hans': '醋',
         'zh-Hant': '醋', ar: 'خل' } },

  { id: 'vinegar-balsamic', he: 'חומץ בלסמי',
    t: { en: 'Balsamic vinegar', de: 'Balsamico-Essig', es: 'Vinagre balsámico',
         fr: 'Vinaigre balsamique', it: 'Aceto balsamico',
         pt: 'Vinagre balsâmico', ja: 'バルサミコ酢', 'zh-Hans': '意大利黑醋',
         'zh-Hant': '巴薩米克醋', ar: 'خل بلسمي' } },
  { id: 'onion',        he: 'בצל לבן או אדום, טרי',
    t: { en: 'Onion, white or red', de: 'Zwiebel, weiß oder rot',
         es: 'Cebolla, blanca o roja', fr: 'Oignon, blanc ou rouge',
         it: 'Cipolla, bianca o rossa', pt: 'Cebola, branca ou roxa',
         ja: '玉ねぎ（白または赤）', 'zh-Hans': '洋葱（白或红）',
         'zh-Hant': '洋蔥（白或紅）', ar: 'بصل أبيض أو أحمر' } },

  { id: 'spring-onion', he: 'בצל ירוק, טרי',
    t: { en: 'Green onion (scallion, spring onion)', de: 'Frühlingszwiebel', es: 'Cebolleta',
         fr: 'Oignon nouveau', it: 'Cipollotto', pt: 'Cebolinha',
         ja: '青ねぎ', 'zh-Hans': '青葱', 'zh-Hant': '青蔥',
         ar: 'بصل أخضر' } },

  { id: 'bread-white',  he: "לחם לבן, ברמן, אנג'ל, דוידוביץ, אילת",
    t: { en: 'White bread', de: 'Weißbrot', es: 'Pan blanco',
         fr: 'Pain blanc', it: 'Pane bianco', pt: 'Pão branco',
         ja: '食パン（白）', 'zh-Hans': '白面包', 'zh-Hant': '白麵包',
         ar: 'خبز أبيض' } },
  /* ── batch 1: what the first 123 had no room for ──────────────────────
     East Asia, the pulses and sprouts, and the European cured meats. Every
     one already had a row; none of them had a readable name. */

  { id: 'natto', he: 'נאטו (פולי סויה מותססים)',
    t: { en: 'Natto (fermented soybeans)', de: 'Natto (fermentierte Sojabohnen)',
         es: 'Natto (soja fermentada)', fr: 'Natto (soja fermenté)',
         it: 'Natto (soia fermentata)', pt: 'Natto (soja fermentada)',
         ja: '納豆', 'zh-Hans': '纳豆', 'zh-Hant': '納豆', ar: 'ناتو (فول صويا مخمّر)' } },

  /* Nori in every language that has a word for it, because that is what is
     printed on the packet - "seaweed leaves for sushi" is what the Hebrew row
     calls it and what nobody would ever type. */
  /* The DRIED row, 298 kcal. This first named `אצות, עלים להכנת סושי` at 35
     kcal - raw laver - and called it a nori sheet in ten languages, which is
     an eight-fold understatement of the thing on the packet. Nothing in the
     build could have caught it: the row existed, the numbers were copied,
     the spelling was right. Only asking "is this row that food" finds it. */
  { id: 'nori', he: 'אצות, יבשות',
    t: { en: 'Nori seaweed, dried sheets', de: 'Nori-Algen, getrocknete Blätter',
         es: 'Alga nori seca en láminas', fr: 'Algue nori séchée en feuilles',
         it: 'Alga nori essiccata in fogli', pt: 'Alga nori seca em folhas',
         ja: '焼きのり・干し海苔', 'zh-Hans': '海苔片（干）', 'zh-Hant': '海苔片（乾）',
         ar: 'أعشاب نوري مجففة' } },

  { id: 'seaweed-fresh', he: 'אצות, טריות',
    t: { en: 'Seaweed, fresh', de: 'Algen, frisch', es: 'Algas frescas',
         fr: 'Algues fraîches', it: 'Alghe fresche', pt: 'Algas frescas',
         ja: '生わかめ・海藻', 'zh-Hans': '新鲜海藻', 'zh-Hant': '新鮮海藻',
         ar: 'أعشاب بحرية طازجة' } },

  { id: 'spirulina', he: 'אצות, ספירולינה, מיובש',
    t: { en: 'Spirulina, dried', de: 'Spirulina, getrocknet', es: 'Espirulina seca',
         fr: 'Spiruline séchée', it: 'Spirulina essiccata', pt: 'Espirulina seca',
         ja: 'スピルリナ（乾燥）', 'zh-Hans': '螺旋藻（干）', 'zh-Hant': '螺旋藻（乾）',
         ar: 'سبيرولينا مجففة' } },

  { id: 'miso-paste', he: 'מיסו, מחית פולי סויה מרוכז',
    t: { en: 'Miso paste', de: 'Miso-Paste', es: 'Pasta de miso', fr: 'Pâte de miso',
         it: 'Pasta di miso', pt: 'Pasta de missô', ja: '味噌', 'zh-Hans': '味噌',
         'zh-Hant': '味噌', ar: 'معجون ميسو' } },

  { id: 'soy-sauce', he: 'רוטב סויה',
    t: { en: 'Soy sauce', de: 'Sojasauce', es: 'Salsa de soja', fr: 'Sauce soja',
         it: 'Salsa di soia', pt: 'Molho de soja', ja: '醤油', 'zh-Hans': '酱油',
         'zh-Hant': '醬油', ar: 'صلصة صويا' } },

  { id: 'soy-sauce-low-salt', he: 'רוטב סויה מופחת נתרן',
    t: { en: 'Soy sauce, reduced salt', de: 'Sojasauce, salzreduziert',
         es: 'Salsa de soja baja en sal', fr: 'Sauce soja allégée en sel',
         it: 'Salsa di soia a ridotto contenuto di sale', pt: 'Molho de soja com menos sal',
         ja: '減塩醤油', 'zh-Hans': '减盐酱油', 'zh-Hant': '減鹽醬油',
         ar: 'صلصة صويا قليلة الملح' } },

  /* Dry and cooked are separate rows and separate foods on the plate - 364
     kcal against 108 - so both are carried and both say which they are. */
  { id: 'rice-noodles-dry', he: 'אטריות אורז, יבשות',
    t: { en: 'Rice noodles, dry', de: 'Reisnudeln, trocken', es: 'Fideos de arroz secos',
         fr: 'Nouilles de riz sèches', it: 'Noodles di riso secchi',
         pt: 'Macarrão de arroz seco', ja: 'ビーフン（乾）', 'zh-Hans': '米粉（干）',
         'zh-Hant': '米粉（乾）', ar: 'شعيرية أرز جافة' } },

  { id: 'rice-noodles-cooked', he: 'אטריות אורז, מבושלות',
    t: { en: 'Rice noodles, cooked', de: 'Reisnudeln, gekocht', es: 'Fideos de arroz cocidos',
         fr: 'Nouilles de riz cuites', it: 'Noodles di riso cotti',
         pt: 'Macarrão de arroz cozido', ja: 'ビーフン（ゆで）', 'zh-Hans': '米粉（煮熟）',
         'zh-Hant': '米粉（煮熟）', ar: 'شعيرية أرز مطبوخة' } },

  { id: 'napa-cabbage', he: 'כרוב סיני, טרי',
    t: { en: 'Napa cabbage (Chinese leaf), fresh', de: 'Chinakohl, frisch',
         es: 'Col china fresca', fr: 'Chou chinois frais', it: 'Cavolo cinese fresco',
         pt: 'Couve chinesa fresca', ja: '白菜', 'zh-Hans': '大白菜', 'zh-Hant': '大白菜',
         ar: 'ملفوف صيني طازج' } },

  { id: 'napa-cabbage-cooked', he: 'כרוב סיני, מבושל, ללא תוספת שומן',
    t: { en: 'Napa cabbage, cooked without fat', de: 'Chinakohl, ohne Fett gegart',
         es: 'Col china cocida sin grasa', fr: 'Chou chinois cuit sans matière grasse',
         it: 'Cavolo cinese cotto senza grassi', pt: 'Couve chinesa cozida sem gordura',
         ja: '白菜（油なしで加熱）', 'zh-Hans': '大白菜（无油烹煮）',
         'zh-Hant': '大白菜（無油烹煮）', ar: 'ملفوف صيني مطبوخ بدون دهن' } },

  { id: 'mung-bean-sprouts', he: 'נבטי מש, נבטים סיניים, טרי',
    t: { en: 'Mung bean sprouts, fresh', de: 'Mungbohnensprossen, frisch',
         es: 'Brotes de soja verde (frescos)', fr: 'Germes de haricot mungo frais',
         it: 'Germogli di fagiolo mungo freschi', pt: 'Brotos de feijão-moyashi frescos',
         ja: 'もやし', 'zh-Hans': '绿豆芽', 'zh-Hant': '綠豆芽',
         ar: 'براعم فول المونج طازجة' } },

  /* SOYBEAN sprouts, not the cooked form of the mung ones above. Boiling
     cannot take 30 kcal to 46 and 0.2 g of fat to 2.0 - that is a different
     bean, and the fat is what says which. Only the Japanese had it right
     (豆もやし is specifically soy); the other nine said plain bean sprouts. */
  { id: 'soybean-sprouts-cooked', he: 'נבטי שעועית, טריים, מבושלים, ללא תוספת שומן, עם מלח',
    t: { en: 'Soybean sprouts, cooked without fat', de: 'Sojabohnensprossen, ohne Fett gegart',
         es: 'Brotes de soja cocidos sin grasa', fr: 'Germes de soja cuits sans matière grasse',
         it: 'Germogli di soia cotti senza grassi', pt: 'Brotos de soja cozidos sem gordura',
         ja: '豆もやし（油なしで加熱）', 'zh-Hans': '黄豆芽（无油烹煮）',
         'zh-Hant': '黃豆芽（無油烹煮）', ar: 'براعم فول الصويا مطبوخة بدون دهن' } },

  { id: 'alfalfa-sprouts', he: 'נבטים, אלפלפה, טריים',
    /* The only alfalfa row in the table, and nobody names the food "fresh
       alfalfa sprouts". The qualifier separates nothing, so it goes. */
    t: { en: 'Alfalfa sprouts', de: 'Alfalfasprossen', es: 'Brotes de alfalfa',
         fr: 'Germes de luzerne', it: 'Germogli di erba medica', pt: 'Brotos de alfafa',
         ja: 'アルファルファもやし', 'zh-Hans': '苜蓿芽', 'zh-Hant': '苜蓿芽',
         ar: 'براعم البرسيم' } },

  { id: 'snow-peas', he: 'אפונה סינית, טריה',
    t: { en: 'Snow peas (mangetout), fresh', de: 'Zuckerschoten, frisch',
         es: 'Tirabeques frescos', fr: 'Pois gourmands frais',
         it: 'Taccole fresche', pt: 'Ervilhas-tortas frescas',
         ja: 'さやえんどう', 'zh-Hans': '荷兰豆', 'zh-Hant': '荷蘭豆',
         ar: 'بازلاء صينية طازجة' } },

  /* Fried, and it says so: 265 kcal against a plain block's 130. The table has
     no plain firm tofu row - recorded in TODO.md rather than approximated. */
  { id: 'tofu-fried', he: 'טופו מטוגן בשמן סויה',
    t: { en: 'Tofu, fried', de: 'Tofu, frittiert', es: 'Tofu frito', fr: 'Tofu frit',
         it: 'Tofu fritto', pt: 'Tofu frito', ja: '揚げ豆腐', 'zh-Hans': '炸豆腐',
         'zh-Hant': '炸豆腐', ar: 'توفو مقلي' } },

  { id: 'shiitake-dried', he: 'פטריות שיטאקי, מיובשות',
    t: { en: 'Shiitake mushrooms, dried', de: 'Shiitake-Pilze, getrocknet',
         es: 'Setas shiitake secas', fr: 'Champignons shiitake séchés',
         it: 'Funghi shiitake secchi', pt: 'Cogumelos shiitake secos',
         ja: '干し椎茸', 'zh-Hans': '干香菇', 'zh-Hant': '乾香菇',
         ar: 'فطر شيتاكي مجفف' } },

  { id: 'shiitake-cooked', he: 'פטריות שיטאקי, מיובשות, מבושלות',
    t: { en: 'Shiitake mushrooms, rehydrated and cooked',
         de: 'Shiitake-Pilze, eingeweicht und gegart',
         es: 'Setas shiitake rehidratadas y cocidas',
         fr: 'Champignons shiitake réhydratés et cuits',
         it: 'Funghi shiitake reidratati e cotti',
         pt: 'Cogumelos shiitake hidratados e cozidos',
         ja: '干し椎茸（戻して加熱）', 'zh-Hans': '香菇（泡发后煮熟）',
         'zh-Hant': '香菇（泡發後煮熟）', ar: 'فطر شيتاكي منقوع ومطبوخ' } },

  { id: 'rice-parboiled', he: 'אורז לבן, להכנה מהירה (parboiled), מבושל, ללא תוספת מלח',
    t: { en: 'Parboiled rice, cooked', de: 'Parboiled-Reis, gekocht',
         es: 'Arroz vaporizado, cocido', fr: 'Riz étuvé, cuit',
         it: 'Riso parboiled, cotto', pt: 'Arroz parboilizado, cozido',
         ja: 'パーボイルドライス（炊いたもの）', 'zh-Hans': '蒸谷米（煮熟）',
         'zh-Hant': '蒸穀米（煮熟）', ar: 'أرز مسلوق مسبقًا، مطبوخ' } },

  { id: 'millet-dry', he: 'דוחן, לא מבושל',
    t: { en: 'Millet, dry', de: 'Hirse, ungekocht', es: 'Mijo crudo', fr: 'Millet cru',
         it: 'Miglio crudo', pt: 'Painço cru', ja: 'キビ（乾燥）',
         'zh-Hans': '小米（生）', 'zh-Hant': '小米（生）', ar: 'دخن غير مطبوخ' } },

  { id: 'lima-beans', he: 'שעועית לימה, טריה',
    t: { en: 'Lima beans (butter beans), fresh', de: 'Limabohnen, frisch',
         es: 'Habas de Lima frescas', fr: 'Haricots de Lima frais',
         it: 'Fagioli di Lima freschi', pt: 'Feijão-de-lima fresco',
         ja: 'ライマメ（生）', 'zh-Hans': '利马豆（鲜）', 'zh-Hant': '利馬豆（鮮）',
         ar: 'فاصولياء ليما طازجة' } },

  { id: 'red-kidney-beans-dry', he: 'שעועית אדומה יבשה',
    t: { en: 'Red kidney beans, dry', de: 'Rote Kidneybohnen, getrocknet',
         es: 'Alubias rojas secas', fr: 'Haricots rouges secs',
         it: 'Fagioli rossi secchi', pt: 'Feijão vermelho seco',
         ja: '赤いんげん豆（乾燥）', 'zh-Hans': '红芸豆（干）', 'zh-Hant': '紅芸豆（乾）',
         ar: 'فاصولياء حمراء جافة' } },

  { id: 'lentil-sprouts', he: 'עדשים, מונבטים טריים',
    t: { en: 'Lentil sprouts, fresh', de: 'Linsensprossen, frisch',
         es: 'Brotes de lenteja frescos', fr: 'Germes de lentille frais',
         it: 'Germogli di lenticchia freschi', pt: 'Brotos de lentilha frescos',
         ja: 'レンズ豆のスプラウト', 'zh-Hans': '扁豆芽', 'zh-Hant': '扁豆芽',
         ar: 'براعم عدس طازجة' } },

  { id: 'green-peas-in-pod', he: 'אפונה ירוקה, טריה, עם תרמילים',
    /* Same trap as the corn: 31 kcal against shelled peas' 81, because the
       pod is in the weight. */
    t: { en: 'Green peas, weighed in the pod', de: 'Grüne Erbsen, mit Schote gewogen',
         es: 'Guisantes, pesados con la vaina',
         fr: 'Petits pois, pesés en cosse',
         it: 'Piselli, pesati con il baccello',
         pt: 'Ervilhas, pesadas com a vagem',
         ja: 'グリーンピース（さや込みの重さ）', 'zh-Hans': '青豌豆（连荚称重）',
         'zh-Hant': '青豌豆（連莢秤重）', ar: 'بازلاء خضراء موزونة بقرونها' } },

  { id: 'chestnuts-roasted', he: 'ערמונים קלויים ללא קליפה',
    t: { en: 'Chestnuts, roasted and peeled', de: 'Esskastanien, geröstet und geschält',
         es: 'Castañas asadas y peladas', fr: 'Châtaignes grillées et épluchées',
         it: 'Castagne arrostite e sbucciate', pt: 'Castanhas assadas e descascadas',
         ja: '焼き栗（皮なし）', 'zh-Hans': '烤栗子（去壳）', 'zh-Hant': '烤栗子（去殼）',
         ar: 'كستناء محمصة ومقشرة' } },

  { id: 'chestnuts-boiled', he: 'ערמונים מבושלים, ללא קליפה',
    t: { en: 'Chestnuts, boiled and peeled', de: 'Esskastanien, gekocht und geschält',
         es: 'Castañas cocidas y peladas', fr: 'Châtaignes bouillies et épluchées',
         it: 'Castagne lessate e sbucciate', pt: 'Castanhas cozidas e descascadas',
         ja: 'ゆで栗（皮なし）', 'zh-Hans': '水煮栗子（去壳）', 'zh-Hant': '水煮栗子（去殼）',
         ar: 'كستناء مسلوقة ومقشرة' } },

  { id: 'okra-fresh', he: 'במיה, ללא גבעול, טריה',
    t: { en: 'Okra, fresh', de: 'Okra, frisch', es: 'Okra (quimbombó) fresca',
         fr: 'Gombo frais', it: 'Okra fresca', pt: 'Quiabo fresco',
         ja: 'オクラ', 'zh-Hans': '秋葵', 'zh-Hant': '秋葵', ar: 'بامية طازجة' } },

  { id: 'okra-frozen', he: 'במיה, קפואה, לא מבושלת',
    t: { en: 'Okra, frozen, uncooked', de: 'Okra, tiefgekühlt, ungegart',
         es: 'Okra congelada, cruda', fr: 'Gombo surgelé, cru',
         it: 'Okra surgelata, cruda', pt: 'Quiabo congelado, cru',
         ja: 'オクラ（冷凍・未加熱）', 'zh-Hans': '秋葵（冷冻，未烹煮）',
         'zh-Hant': '秋葵（冷凍，未烹煮）', ar: 'بامية مجمدة غير مطبوخة' } },

  { id: 'artichoke-heart', he: 'ארטישוק, חי, ללא עלים וגבעול',
    t: { en: 'Artichoke heart, raw', de: 'Artischockenherz, roh',
         es: 'Corazón de alcachofa crudo', fr: 'Cœur d’artichaut cru',
         it: 'Cuore di carciofo crudo', pt: 'Coração de alcachofra cru',
         ja: 'アーティチョークの芯（生）', 'zh-Hans': '洋蓟心（生）',
         'zh-Hant': '朝鮮薊心（生）', ar: 'قلب الخرشوف نيء' } },

  { id: 'jerusalem-artichoke', he: 'ארטישוק ירושלמי, טרי',
    t: { en: 'Jerusalem artichoke (sunchoke), fresh', de: 'Topinambur, frisch',
         es: 'Tupinambo fresco', fr: 'Topinambour frais',
         it: 'Topinambur fresco', pt: 'Tupinambo fresco',
         ja: '菊芋', 'zh-Hans': '菊芋', 'zh-Hant': '菊芋', ar: 'طرطوفة طازجة' } },

  { id: 'leek-cooked', he: 'כרישה, מבושלת ללא מלח',
    t: { en: 'Leek, cooked without salt', de: 'Lauch, ohne Salz gegart',
         es: 'Puerro cocido sin sal', fr: 'Poireau cuit sans sel',
         it: 'Porro cotto senza sale', pt: 'Alho-poró cozido sem sal',
         ja: 'リーキ（無塩でゆで）', 'zh-Hans': '韭葱（无盐煮）',
         'zh-Hant': '韭蔥（無鹽煮）', ar: 'كرّاث مطبوخ بدون ملح' } },

  { id: 'celeriac-cooked', he: 'סלרי, כרפס, שורש, מבושל, עם מלח CELERIAC',
    t: { en: 'Celeriac (celery root), cooked', de: 'Knollensellerie, gegart',
         es: 'Apionabo cocido', fr: 'Céleri-rave cuit',
         it: 'Sedano rapa cotto', pt: 'Aipo-rábano cozido',
         ja: 'セロリアック（根セロリ・加熱）', 'zh-Hans': '根芹菜（煮熟）',
         'zh-Hant': '根芹菜（煮熟）', ar: 'جذر الكرفس مطبوخ' } },

  { id: 'pumpkin-cooked', he: 'דלעת, מבושלת, עם מלח, ללא תוספת שומן בבישול',
    t: { en: 'Pumpkin, cooked without fat', de: 'Kürbis, ohne Fett gegart',
         es: 'Calabaza cocida sin grasa', fr: 'Potiron cuit sans matière grasse',
         it: 'Zucca cotta senza grassi', pt: 'Abóbora cozida sem gordura',
         ja: 'かぼちゃ（油なしで加熱）', 'zh-Hans': '南瓜（无油烹煮）',
         'zh-Hant': '南瓜（無油烹煮）', ar: 'قرع عسلي مطبوخ بدون دهن' } },

  { id: 'sweetcorn-canned', he: 'תירס, משומר, מתוק',
    t: { en: 'Sweet corn, canned', de: 'Zuckermais, aus der Dose',
         es: 'Maíz dulce en conserva', fr: 'Maïs doux en conserve',
         it: 'Mais dolce in scatola', pt: 'Milho doce em lata',
         ja: 'スイートコーン（缶詰）', 'zh-Hans': '甜玉米罐头',
         'zh-Hant': '甜玉米罐頭', ar: 'ذرة حلوة معلبة' } },

  { id: 'corn-on-the-cob', he: 'תירס, טרי, קלח וגרעינים',
    /* 31 kcal against plain corn's 86, because the cob is in the 100 g. Said
       out loud in every language: the two sit side by side in one search,
       and someone who cut the kernels off first would otherwise undercount
       by 55 kcal per 100 g with nothing on screen to explain it. */
    t: { en: 'Corn on the cob, weighed with the cob', de: 'Maiskolben, mit Kolben gewogen',
         es: 'Mazorca de maíz, pesada con el zuro',
         fr: 'Épi de maïs, pesé avec la rafle',
         it: 'Pannocchia di mais, pesata con il torsolo',
         pt: 'Espiga de milho, pesada com o sabugo',
         ja: 'とうもろこし（軸込みの重さ）', 'zh-Hans': '带棒玉米（连棒称重）',
         'zh-Hant': '帶棒玉米（連棒秤重）', ar: 'كوز ذرة موزون مع القالب' } },

  { id: 'black-olives', he: 'זיתים שחורים',
    t: { en: 'Black olives', de: 'Schwarze Oliven', es: 'Aceitunas negras',
         fr: 'Olives noires', it: 'Olive nere', pt: 'Azeitonas pretas',
         ja: 'ブラックオリーブ', 'zh-Hans': '黑橄榄', 'zh-Hant': '黑橄欖',
         ar: 'زيتون أسود' } },

  /* The row that made the whole batch necessary. A photograph of an English
     breakfast said "בקון"; the table files it under "pork, cutlet/bacon,
     fresh or smoked or salted, cooked", and nothing matched. */
  { id: 'bacon', he: 'בשר חזיר, קוטלט/בייקון, לפנ אם טרי, מעושן או מומלח, מבושל',
    /* The row says בייקון, foodKey folds that to ביקון, and everyone - the
       vision model included - writes בקון. One missing yod. */
    aka: ['בקון'],
    t: { en: 'Bacon, cooked', de: 'Bacon, gebraten', es: 'Bacon (panceta) cocinado',
         fr: 'Bacon cuit', it: 'Bacon cotto', pt: 'Bacon cozido',
         ja: 'ベーコン（加熱済み）', 'zh-Hans': '培根（熟）', 'zh-Hant': '培根（熟）',
         ar: 'لحم خنزير مقدد مطهو' } },

  { id: 'brie-camembert-25', he: 'גבינת ברי/קממבר/בושרון 25% שומן, מחלב צאן , מעודנת',
    /* Sheep's milk is carried: the table has a Tnuva COW-milk brie at 25% too,
       and מחלב צאן is the only thing separating the two rows. */
    t: { en: "Brie or camembert, sheep's milk, 25%", de: 'Brie oder Camembert, Schafsmilch, 25%',
         es: 'Brie o camembert de leche de oveja, 25%',
         fr: 'Brie ou camembert au lait de brebis, 25%',
         it: 'Brie o camembert di latte di pecora, 25%',
         pt: 'Brie ou camembert de leite de ovelha, 25%',
         ja: 'ブリー／カマンベール（羊乳）25%', 'zh-Hans': '布里／卡门贝尔奶酪（绵羊奶）25%',
         'zh-Hant': '布里／卡門貝爾乳酪（綿羊奶）25%', ar: 'جبن بري أو كاممبير من حليب الغنم 25%' } },

  { id: 'sour-cream-15', he: 'שמנת חמוצה 15% שומן, טרה, תנובה',
    t: { en: 'Sour cream, 15%', de: 'Saure Sahne, 15%', es: 'Crema agria, 15%',
         fr: 'Crème aigre, 15%', it: 'Panna acida, 15%', pt: 'Creme azedo, 15%',
         ja: 'サワークリーム 15%', 'zh-Hans': '酸奶油 15%', 'zh-Hant': '酸奶油 15%',
         ar: 'قشدة حامضة 15%' } },

  /* ── batch 2: the Levant, the store cupboard, and the offal ───────────── */

  { id: 'chickpeas-canned', he: 'חומוס, גרגירים משומרים',
    t: { en: 'Chickpeas, canned', de: 'Kichererbsen, aus der Dose', es: 'Garbanzos en conserva',
         fr: 'Pois chiches en conserve', it: 'Ceci in scatola', pt: 'Grão-de-bico em lata',
         ja: 'ひよこ豆（缶詰）', 'zh-Hans': '鹰嘴豆罐头', 'zh-Hant': '鷹嘴豆罐頭',
         ar: 'حمص معلب' } },

  { id: 'chickpeas-roasted', he: 'חומוס קלוי, גת',
    t: { en: 'Roasted chickpeas', de: 'Geröstete Kichererbsen', es: 'Garbanzos tostados',
         fr: 'Pois chiches grillés', it: 'Ceci tostati', pt: 'Grão-de-bico torrado',
         ja: 'ローストひよこ豆', 'zh-Hans': '烤鹰嘴豆', 'zh-Hant': '烤鷹嘴豆',
         ar: 'قضامة (حمص محمص)' } },

  /* Whole sesame is what separates this from the tahini already in the core. */
  { id: 'tahini-wholegrain', he: 'טחינה גולמית, שומשום מלא, לא מדוללת',
    t: { en: 'Tahini, wholegrain sesame, raw, undiluted',
         de: 'Tahini aus ungeschältem Sesam, roh, unverdünnt',
         es: 'Tahine de sésamo integral, crudo, sin diluir',
         fr: 'Tahini de sésame complet, cru, non dilué',
         it: 'Tahini di sesamo integrale, crudo, non diluito',
         pt: 'Tahine de gergelim integral, cru, não diluído',
         ja: '練りごま（全粒・生・希釈なし）', 'zh-Hans': '全粒芝麻酱（生，未稀释）',
         'zh-Hant': '全粒芝麻醬（生，未稀釋）', ar: 'طحينة من السمسم الكامل، خام وغير مخففة' } },

  { id: 'tahini-green', he: 'טחינה ירוקה, טחינה ירוקה חריפה בלאדי',
    t: { en: 'Green tahini sauce', de: 'Grüne Tahini-Sauce', es: 'Salsa de tahine verde',
         fr: 'Sauce tahini verte', it: 'Salsa tahini verde', pt: 'Molho de tahine verde',
         ja: 'グリーン練りごまソース', 'zh-Hans': '青芝麻酱',
         'zh-Hant': '青芝麻醬', ar: 'طحينة خضراء' } },

  { id: 'dates-fresh-pitted', he: 'תמרים לחים, ללא גלעין',
    t: { en: 'Dates, fresh, pitted', de: 'Datteln, frisch, entsteint',
         es: 'Dátiles frescos sin hueso', fr: 'Dattes fraîches dénoyautées',
         it: 'Datteri freschi denocciolati', pt: 'Tâmaras frescas sem caroço',
         ja: 'デーツ（生・種なし）', 'zh-Hans': '鲜椰枣（去核）',
         'zh-Hant': '鮮椰棗（去核）', ar: 'تمر طازج منزوع النوى' } },

  /* Weighed WITH the stone - 249 kcal against the pitted row's 282, so the
     stone is 11.7% of the weight, not the third I first wrote here.

     The pitted row is deliberately NOT the one taken: at 282 it sits within
     2% of the Medjool date already in the core, and a second generic entry
     that close is the celery-stalk mistake again. This row measures a
     different thing - a bowl of dates you have not taken the stones out of
     - and says so in all eleven. */
  { id: 'dates-dried', he: 'תמרים מיובשים, עם גלעין',
    t: { en: 'Dates, dried, weighed with the stone',
         de: 'Datteln, getrocknet, mit Stein gewogen',
         es: 'Dátiles secos, pesados con el hueso',
         fr: 'Dattes séchées, pesées avec le noyau',
         it: 'Datteri secchi, pesati con il nocciolo',
         pt: 'Tâmaras secas, pesadas com o caroço',
         ja: 'デーツ（乾燥・種込みの重さ）', 'zh-Hans': '干椰枣（连核称重）',
         'zh-Hant': '乾椰棗（連核秤重）', ar: 'تمر مجفف موزون مع النوى' } },

  { id: 'pine-nuts', he: 'צנוברים',
    t: { en: 'Pine nuts', de: 'Pinienkerne', es: 'Piñones', fr: 'Pignons de pin',
         it: 'Pinoli', pt: 'Pinhões', ja: '松の実', 'zh-Hans': '松子',
         'zh-Hant': '松子', ar: 'صنوبر' } },

  { id: 'sesame-hulled', he: 'גרעיני שומשום קלופים',
    t: { en: 'Sesame seeds, hulled', de: 'Sesamsamen, geschält',
         es: 'Semillas de sésamo peladas', fr: 'Graines de sésame décortiquées',
         it: 'Semi di sesamo decorticati', pt: 'Sementes de gergelim descascadas',
         ja: 'むきごま', 'zh-Hans': '去皮芝麻', 'zh-Hant': '去皮芝麻',
         ar: 'بذور سمسم مقشورة' } },

  { id: 'brazil-nuts', he: 'אגוזי ברזיל, טבעיים',
    aka: ['אגוזים'],
    /* The qualifier goes: the only sibling row is brazil-nut butter, so
       "plain" separates nothing, which is the rule. */
    t: { en: 'Brazil nuts', de: 'Paranüsse', es: 'Nueces de Brasil',
         fr: 'Noix du Brésil', it: 'Noci del Brasile',
         pt: 'Castanhas-do-pará', ja: 'ブラジルナッツ',
         'zh-Hans': '巴西坚果', 'zh-Hant': '巴西堅果',
         ar: 'جوز برازيلي' } },

  { id: 'almonds-roasted-salted', he: 'שקדים קלויים עם מלח',
    t: { en: 'Almonds, roasted and salted', de: 'Mandeln, geröstet und gesalzen',
         es: 'Almendras tostadas con sal', fr: 'Amandes grillées et salées',
         it: 'Mandorle tostate e salate', pt: 'Amêndoas torradas e salgadas',
         ja: 'アーモンド（ロースト・有塩）', 'zh-Hans': '烤杏仁（加盐）',
         'zh-Hant': '烤杏仁（加鹽）', ar: 'لوز محمص ومملح' } },

  { id: 'watermelon-seeds', he: 'גרעיני אבטיח עם קליפה, ללא מלח',
    t: { en: 'Watermelon seeds, in the shell, unsalted',
         de: 'Wassermelonenkerne, in der Schale, ungesalzen',
         es: 'Pipas de sandía con cáscara, sin sal',
         fr: 'Graines de pastèque en coque, non salées',
         it: 'Semi di anguria con guscio, non salati',
         pt: 'Sementes de melancia com casca, sem sal',
         ja: 'すいかの種（殻つき・無塩）', 'zh-Hans': '西瓜子（带壳，无盐）',
         'zh-Hant': '西瓜子（帶殼，無鹽）', ar: 'بذور بطيخ بقشرها، بدون ملح' } },

  { id: 'beef-liver-steamed', he: 'כבד בקר, מאודה',
    t: { en: 'Beef liver, steamed', de: 'Rinderleber, gedämpft',
         es: 'Hígado de ternera al vapor', fr: 'Foie de bœuf, cuit à la vapeur',
         it: 'Fegato di manzo, al vapore', pt: 'Fígado bovino, no vapor',
         ja: '牛レバー（蒸し）', 'zh-Hans': '牛肝（蒸）', 'zh-Hant': '牛肝（蒸）',
         ar: 'كبد بقري مطهو بالبخار' } },

  { id: 'beef-liver-raw', he: 'כבד בקר, לא מבושל',
    t: { en: 'Beef liver, raw', de: 'Rinderleber, roh', es: 'Hígado de ternera crudo',
         fr: 'Foie de bœuf, cru', it: 'Fegato di manzo, crudo',
         pt: 'Fígado bovino, cru', ja: '牛レバー（生）', 'zh-Hans': '牛肝（生）',
         'zh-Hant': '牛肝（生）', ar: 'كبد بقري نيء' } },

  { id: 'chicken-liver-steamed', he: 'כבד עוף, מאודה',
    t: { en: 'Chicken liver, steamed', de: 'Hühnerleber, gedämpft',
         es: 'Hígado de pollo al vapor', fr: 'Foie de poulet, cuit à la vapeur',
         it: 'Fegato di pollo, al vapore', pt: 'Fígado de frango, no vapor',
         ja: '鶏レバー（蒸し）', 'zh-Hans': '鸡肝（蒸）', 'zh-Hant': '雞肝（蒸）',
         ar: 'كبد دجاج مطهو بالبخار' } },

  { id: 'tongue-cooked', he: 'לשון, מבושל',
    t: { en: 'Tongue, cooked (any animal)', de: 'Zunge, gekocht', es: 'Lengua cocida',
         fr: 'Langue, cuite', it: 'Lingua, cotta', pt: 'Língua cozida',
         ja: '舌肉（ゆで）', 'zh-Hans': '口条（熟）', 'zh-Hant': '口條（熟）',
         ar: 'لسان مطبوخ' } },

  { id: 'beef-tongue-raw', he: 'לשון בקר, לא מבושלת',
    t: { en: 'Beef tongue, raw', de: 'Rinderzunge, roh', es: 'Lengua de ternera cruda',
         fr: 'Langue de bœuf, crue', it: 'Lingua di manzo, cruda',
         pt: 'Língua bovina, crua', ja: '牛タン（生）', 'zh-Hans': '牛舌（生）',
         'zh-Hant': '牛舌（生）', ar: 'لسان بقري نيء' } },

  { id: 'herring-pickled', he: 'דג הרינג, כבוש',
    t: { en: 'Herring, pickled', de: 'Hering, eingelegt', es: 'Arenque en escabeche',
         fr: 'Hareng mariné', it: 'Aringa marinata', pt: 'Arenque em conserva',
         ja: 'にしんの酢漬け', 'zh-Hans': '腌鲱鱼', 'zh-Hant': '醃鯡魚',
         ar: 'رنجة مخللة' } },

  { id: 'mackerel-pickled', he: 'דג מקרל, כבוש',
    t: { en: 'Mackerel, pickled', de: 'Makrele, eingelegt', es: 'Caballa en escabeche',
         fr: 'Maquereau mariné', it: 'Sgombro marinato', pt: 'Cavala em conserva',
         ja: 'さばの酢漬け', 'zh-Hans': '腌鲭鱼', 'zh-Hant': '醃鯖魚',
         ar: 'ماكريل مخلل' } },

  /* Brazilian Portuguese calls only olive oil azeite; every other oil is óleo.
     The two therefore do not share a word, and that is the language being
     right rather than the pair being broken. */
  { id: 'sesame-oil', he: 'שמן שומשום',
    t: { en: 'Sesame oil', de: 'Sesamöl', es: 'Aceite de sésamo', fr: 'Huile de sésame',
         it: 'Olio di sesamo', pt: 'Óleo de gergelim', ja: 'ごま油',
         'zh-Hans': '芝麻油', 'zh-Hant': '芝麻油', ar: 'زيت سمسم' } },

  { id: 'coconut-oil', he: 'שמן קוקוס',
    t: { en: 'Coconut oil', de: 'Kokosöl', es: 'Aceite de coco', fr: 'Huile de coco',
         it: 'Olio di cocco', pt: 'Óleo de coco', ja: 'ココナッツオイル',
         'zh-Hans': '椰子油', 'zh-Hant': '椰子油', ar: 'زيت جوز الهند' } },

  { id: 'mustard', he: 'חרדל, מוכן לאכילה',
    t: { en: 'Mustard, prepared', de: 'Tafelsenf', es: 'Mostaza preparada',
         fr: 'Moutarde préparée', it: 'Senape pronta', pt: 'Mostarda pronta',
         ja: 'マスタード', 'zh-Hans': '芥末酱', 'zh-Hant': '芥末醬',
         ar: 'خردل جاهز' } },

  { id: 'ketchup', he: 'קטשופ עגבניות',
    t: { en: 'Tomato ketchup', de: 'Tomatenketchup', es: 'Kétchup de tomate',
         fr: 'Ketchup de tomate', it: 'Ketchup di pomodoro', pt: 'Ketchup de tomate',
         ja: 'トマトケチャップ', 'zh-Hans': '番茄酱', 'zh-Hant': '番茄醬',
         ar: 'كاتشب طماطم' } },

  { id: 'mayonnaise', he: 'מיונז רגיל',
    t: { en: 'Mayonnaise, full fat', de: 'Mayonnaise, klassisch', es: 'Mayonesa entera',
         fr: 'Mayonnaise entière', it: 'Maionese classica', pt: 'Maionese tradicional',
         ja: 'マヨネーズ（全脂）', 'zh-Hans': '蛋黄酱（全脂）',
         'zh-Hant': '美乃滋（全脂）', ar: 'مايونيز كامل الدسم' } },

  { id: 'salt', he: 'מלח',
    t: { en: 'Salt', de: 'Salz', es: 'Sal', fr: 'Sel', it: 'Sale', pt: 'Sal',
         ja: '塩', 'zh-Hans': '盐', 'zh-Hant': '鹽', ar: 'ملح' } },

  { id: 'icing-sugar', he: 'סוכר, אבקה',
    t: { en: 'Icing sugar (powdered)', de: 'Puderzucker', es: 'Azúcar glas',
         fr: 'Sucre glace', it: 'Zucchero a velo', pt: 'Açúcar de confeiteiro',
         ja: '粉砂糖', 'zh-Hans': '糖粉', 'zh-Hant': '糖粉', ar: 'سكر بودرة' } },

  { id: 'cream-cheese-35', he: 'גבינת שמנת 35% שומן, כולל פילדלפיה',
    t: { en: 'Cream cheese, 35%', de: 'Frischkäse, 35%', es: 'Queso crema, 35%',
         fr: 'Fromage à tartiner, 35%', it: 'Formaggio spalmabile, 35%',
         pt: 'Queijo cremoso, 35%', ja: 'クリームチーズ 35%',
         'zh-Hans': '奶油奶酪 35%', 'zh-Hant': '奶油乳酪 35%', ar: 'جبنة كريمية 35%' } },

  { id: 'bulgarian-cheese-3', he: 'גבינה בולגרית 3% שומן, מעודנת, גד',
    /* Word for word the convention core:bulgarian-cheese already uses at 24%.
       Two names for one cheese is worse than either name. */
    t: { en: 'Brined white cheese (feta-style), 3%', de: 'Salzlakenkäse, 3%',
         es: 'Queso blanco en salmuera, 3%', fr: 'Fromage en saumure (type feta), 3%',
         it: 'Formaggio bianco in salamoia, 3%', pt: 'Queijo branco em salmoura, 3%',
         ja: 'フェタ風チーズ 3%', 'zh-Hans': '盐渍白奶酪 3%',
         'zh-Hant': '鹽漬白起司 3%', ar: 'جبنة بيضاء بالماء المالح 3%' } },

  { id: 'yogurt-plain-3', he: 'יוגורט 3% שומן תנובה',
    t: { en: 'Plain yogurt, 3%', de: 'Naturjoghurt, 3%', es: 'Yogur natural, 3%',
         fr: 'Yaourt nature, 3%', it: 'Yogurt bianco, 3%', pt: 'Iogurte natural, 3%',
         ja: 'プレーンヨーグルト 3%', 'zh-Hans': '原味酸奶 3%',
         'zh-Hant': '原味優格 3%', ar: 'لبن زبادي سادة 3%' } },

  { id: 'yogurt-plain-7', he: 'יוגורט 7%,תנובה',
    t: { en: 'Plain yogurt, 7%', de: 'Naturjoghurt, 7%', es: 'Yogur natural, 7%',
         fr: 'Yaourt nature, 7%', it: 'Yogurt bianco, 7%', pt: 'Iogurte natural, 7%',
         ja: 'プレーンヨーグルト 7%', 'zh-Hans': '原味酸奶 7%',
         'zh-Hant': '原味優格 7%', ar: 'لبن زبادي سادة 7%' } },

  { id: 'blueberries', he: 'אוכמניות, טריות',
    t: { en: 'Blueberries, fresh', de: 'Heidelbeeren, frisch', es: 'Arándanos frescos',
         fr: 'Myrtilles fraîches', it: 'Mirtilli freschi', pt: 'Mirtilos frescos',
         ja: 'ブルーベリー（生）', 'zh-Hans': '蓝莓（鲜）', 'zh-Hant': '藍莓（鮮）',
         ar: 'توت أزرق طازج' } },

  { id: 'raspberries', he: 'פטל אדום, טרי',
    t: { en: 'Raspberries, fresh', de: 'Himbeeren, frisch', es: 'Frambuesas frescas',
         fr: 'Framboises fraîches', it: 'Lamponi freschi', pt: 'Framboesas frescas',
         ja: 'ラズベリー（生）', 'zh-Hans': '树莓（鲜）', 'zh-Hant': '覆盆子（鮮）',
         ar: 'توت العليق الأحمر طازج' } },

  { id: 'lime', he: 'ליים, טרי',
    t: { en: 'Lime, fresh', de: 'Limette, frisch', es: 'Lima fresca', fr: 'Citron vert frais',
         it: 'Lime fresco', pt: 'Limão-taiti fresco', ja: 'ライム',
         'zh-Hans': '青柠', 'zh-Hant': '青檸', ar: 'ليمون أخضر طازج' } },

  { id: 'pineapple-dried', he: 'אננס, מיובש',
    t: { en: 'Pineapple, dried', de: 'Ananas, getrocknet', es: 'Piña seca',
         fr: 'Ananas séché', it: 'Ananas essiccato', pt: 'Abacaxi seco',
         ja: 'ドライパイナップル', 'zh-Hans': '菠萝干', 'zh-Hant': '鳳梨乾',
         ar: 'أناناس مجفف' } },

  { id: 'pineapple-canned', he: 'אננס, מבושל או משומר, במיץ',
    t: { en: 'Pineapple, canned in juice', de: 'Ananas, in Saft eingelegt',
         es: 'Piña en conserva, en su jugo', fr: 'Ananas en conserve, au jus',
         it: 'Ananas in scatola, al succo', pt: 'Abacaxi em conserva, no próprio suco',
         ja: 'パイナップル（果汁漬け缶詰）', 'zh-Hans': '菠萝罐头（原汁）',
         'zh-Hant': '鳳梨罐頭（原汁）', ar: 'أناناس معلب في عصيره' } },

  /* Cantaloupe is already in the core, so this one says which melon it is in
     every language rather than being a second "melon". */
  { id: 'honeydew-melon', he: 'מלון ירוק, דבש, טרי',
    t: { en: 'Honeydew melon', de: 'Honigmelone', es: 'Melón verde (honeydew)',
         fr: 'Melon vert (honeydew)', it: 'Melone verde (honeydew)',
         pt: 'Melão verde (honeydew)', ja: 'ハネデューメロン',
         'zh-Hans': '白兰瓜（蜜瓜）', 'zh-Hant': '白蘭瓜（蜜瓜）',
         ar: 'شمام عسلي أخضر' } },

  { id: 'prunes', he: 'שזיף, מיובש, לא מבושל',
    t: { en: 'Prunes (dried plums)', de: 'Backpflaumen (Trockenpflaumen)',
         es: 'Ciruelas pasas', fr: 'Pruneaux', it: 'Prugne secche',
         pt: 'Ameixas secas', ja: 'プルーン（乾燥）', 'zh-Hans': '西梅干',
         'zh-Hant': '西梅乾', ar: 'برقوق مجفف' } },

  { id: 'peaches-dried', he: 'אפרסק, מיובש, לא מבושל',
    t: { en: 'Peaches, dried', de: 'Pfirsiche, getrocknet', es: 'Melocotones secos',
         fr: 'Pêches séchées', it: 'Pesche essiccate', pt: 'Pêssegos secos',
         ja: 'ドライピーチ', 'zh-Hans': '桃干', 'zh-Hant': '桃乾',
         ar: 'دراق مجفف' } },

  { id: 'rosemary-fresh', he: 'רוזמרין, טרי',
    t: { en: 'Rosemary, fresh', de: 'Rosmarin, frisch', es: 'Romero fresco',
         fr: 'Romarin frais', it: 'Rosmarino fresco', pt: 'Alecrim fresco',
         ja: 'ローズマリー（生）', 'zh-Hans': '迷迭香（鲜）',
         'zh-Hant': '迷迭香（鮮）', ar: 'إكليل الجبل طازج' } },

  { id: 'tea-brewed', he: 'תה, עלים, לא ממותק',
    t: { en: 'Tea, brewed, unsweetened', de: 'Tee, aufgebrüht, ungesüßt',
         es: 'Té infusionado, sin azúcar', fr: 'Thé infusé, non sucré',
         it: 'Tè in infusione, non zuccherato', pt: 'Chá, sem açúcar',
         ja: 'お茶（浸出液・無糖）', 'zh-Hans': '茶（无糖）', 'zh-Hant': '茶（無糖）',
         ar: 'شاي مُحضَّر بدون سكر' } },

  { id: 'herbal-tea', he: 'תה, צמחים',
    t: { en: 'Herbal tea', de: 'Kräutertee', es: 'Infusión de hierbas',
         fr: 'Tisane', it: 'Tisana', pt: 'Chá de ervas', ja: 'ハーブティー',
         'zh-Hans': '花草茶', 'zh-Hant': '花草茶', ar: 'شاي أعشاب' } },

  /* ── batch 3: breads, flours, cuts and fish ───────────────────────────── */

  /* Filed as "Indian pita", which no Indian reader would ever type. */
  { id: 'chapati', he: 'פיתה הודית, צ\'פאטי',
    t: { en: 'Chapati (Indian flatbread)', de: 'Chapati (indisches Fladenbrot)',
         es: 'Chapati (pan plano indio)', fr: 'Chapati (pain plat indien)',
         it: 'Chapati (pane piatto indiano)', pt: 'Chapati (pão achatado indiano)',
         ja: 'チャパティ', 'zh-Hans': '恰帕提（印度薄饼）', 'zh-Hant': '恰帕提（印度薄餅）',
         ar: 'تشباتي (خبز هندي)' } },

  { id: 'druze-flatbread', he: 'פיתה דרוזית',
    t: { en: 'Druze flatbread (markook)', de: 'Drusisches Fladenbrot (Markook)',
         es: 'Pan plano druso (markook)', fr: 'Pain plat druze (markouk)',
         it: 'Pane piatto druso (markook)', pt: 'Pão achatado druso (markook)',
         ja: 'ドゥルーズ風薄焼きパン', 'zh-Hans': '德鲁兹薄饼',
         'zh-Hant': '德魯茲薄餅', ar: 'خبز مرقوق درزي' } },

  { id: 'yemeni-saluf', he: 'פיתה תימנית, סאלוף',
    t: { en: 'Yemeni saluf flatbread', de: 'Jemenitisches Saluf-Fladenbrot',
         es: 'Pan plano yemení (saluf)', fr: 'Pain plat yéménite (saluf)',
         it: 'Pane piatto yemenita (saluf)', pt: 'Pão achatado iemenita (saluf)',
         ja: 'イエメン風サルーフ（薄焼きパン）', 'zh-Hans': '也门萨鲁夫薄饼',
         'zh-Hant': '葉門薩魯夫薄餅', ar: 'خبز صلوف يمني' } },

  { id: 'chickpea-flour', he: 'קמח חומוס',
    t: { en: 'Chickpea flour (gram flour, besan)', de: 'Kichererbsenmehl',
         es: 'Harina de garbanzo', fr: 'Farine de pois chiches',
         it: 'Farina di ceci', pt: 'Farinha de grão-de-bico',
         ja: 'ひよこ豆粉（ベサン）', 'zh-Hans': '鹰嘴豆粉',
         'zh-Hant': '鷹嘴豆粉', ar: 'دقيق الحمص' } },

  { id: 'rye-flour', he: 'קמח שיפון בינוני',
    t: { en: 'Rye flour, medium', de: 'Roggenmehl, mittel', es: 'Harina de centeno media',
         fr: 'Farine de seigle, moyenne', it: 'Farina di segale, media',
         pt: 'Farinha de centeio, média', ja: 'ライ麦粉（中挽き）',
         'zh-Hans': '黑麦粉（中度研磨）', 'zh-Hant': '黑麥粉（中度研磨）',
         ar: 'دقيق الجاودار، متوسط' } },

  { id: 'self-raising-flour', he: 'קמח חיטה תופח',
    t: { en: 'Self-raising wheat flour', de: 'Weizenmehl mit Backtriebmittel',
         es: 'Harina de trigo leudante', fr: 'Farine de blé avec levure incorporée',
         it: 'Farina di grano autolievitante', pt: 'Farinha de trigo com fermento',
         ja: '小麦粉（ベーキングパウダー入り）', 'zh-Hans': '自发小麦粉',
         'zh-Hant': '自發小麥粉', ar: 'دقيق قمح ذاتي التخمير' } },

  { id: 'malted-barley-flour', he: 'קמח שעורה עם לתת',
    t: { en: 'Malted barley flour', de: 'Gerstenmalzmehl', es: 'Harina de cebada malteada',
         fr: 'Farine d’orge maltée', it: 'Farina d’orzo maltato',
         pt: 'Farinha de cevada maltada', ja: '麦芽大麦粉',
         'zh-Hans': '麦芽大麦粉', 'zh-Hant': '麥芽大麥粉',
         ar: 'دقيق شعير منبت' } },

  { id: 'ptitim', he: 'פתיתים מבושלים ללא שמן',
    t: { en: 'Ptitim (Israeli couscous), cooked without oil',
         de: 'Ptitim (israelischer Couscous), ohne Öl gegart',
         es: 'Ptitim (cuscús israelí), cocido sin aceite',
         fr: 'Ptitim (couscous israélien), cuit sans huile',
         it: 'Ptitim (couscous israeliano), cotto senza olio',
         pt: 'Ptitim (cuscuz israelense), cozido sem óleo',
         ja: 'プティティム（イスラエル風クスクス・油なし）',
         'zh-Hans': '以色列珍珠面（无油煮）', 'zh-Hant': '以色列珍珠麵（無油煮）',
         ar: 'بتيتيم (كسكس إسرائيلي) مطبوخ بدون زيت' } },

  /* NOT `מצה קלה` - קלה is reduced-calorie, the same word the light-bread
     rows carry, and at 268 against this row's 354 that is 24% under for
     every reader who cannot read the Hebrew. This is also the multi-brand
     generic the file prefers. */
  { id: 'matzah', he: 'מצה, פת מצה, דננברג, מצות ראשון, מצות יהודה, כרמל',
    t: { en: 'Matzah', de: 'Matze', es: 'Matzá', fr: 'Matza', it: 'Matzah',
         pt: 'Matzá', ja: 'マツァ', 'zh-Hans': '无酵饼（马佐）',
         'zh-Hant': '無酵餅（馬佐）', ar: 'خبز المتزة' } },

  { id: 'white-bread-toasted', he: 'לחם לבן, קלוי',
    t: { en: 'White bread, toasted', de: 'Weißbrot, getoastet', es: 'Pan blanco tostado',
         fr: 'Pain blanc grillé', it: 'Pane bianco tostato', pt: 'Pão branco torrado',
         ja: '食パン（白・トースト）', 'zh-Hans': '白面包（烤）',
         'zh-Hant': '白麵包（烤）', ar: 'خبز أبيض محمص' } },

  { id: 'bread-light-white', he: 'לחם קל, לבן',
    t: { en: 'White bread, light', de: 'Weißbrot, leicht', es: 'Pan blanco ligero',
         fr: 'Pain blanc allégé', it: 'Pane bianco light', pt: 'Pão branco light',
         ja: '食パン（白・低カロリー）', 'zh-Hans': '白面包（低卡）',
         'zh-Hant': '白麵包（低卡）', ar: 'خبز أبيض خفيف' } },

  { id: 'baguette-toasted', he: 'לחם בגט, קלוי',
    t: { en: 'Baguette, toasted', de: 'Baguette, getoastet', es: 'Baguette tostada',
         fr: 'Baguette grillée', it: 'Baguette tostata', pt: 'Baguete torrada',
         ja: 'バゲット（トースト）', 'zh-Hans': '法棍（烤）',
         'zh-Hant': '法棍（烤）', ar: 'باغيت محمص' } },

  { id: 'multigrain-bread', he: 'לחם דגנים, ברמן',
    t: { en: 'Multigrain bread', de: 'Mehrkornbrot', es: 'Pan multicereales',
         fr: 'Pain multicéréales', it: 'Pane multicereali', pt: 'Pão multigrãos',
         ja: '雑穀パン', 'zh-Hans': '多谷物面包', 'zh-Hant': '多穀物麵包',
         ar: 'خبز متعدد الحبوب' } },

  /* Ghee, which I had recorded in TODO.md as absent. It is filed under its
     Arabic name, samneh, so no search for the English word could find it. */
  { id: 'ghee', he: 'חמאה מזוככת, סמנה',
    t: { en: 'Ghee (clarified butter)', de: 'Ghee (Butterschmalz)',
         es: 'Ghee (mantequilla clarificada)', fr: 'Ghee (beurre clarifié)',
         it: 'Ghee (burro chiarificato)', pt: 'Ghee (manteiga clarificada)',
         ja: 'ギー（澄ましバター）', 'zh-Hans': '酥油（澄清黄油）',
         'zh-Hant': '酥油（澄清奶油）', ar: 'سمنة' } },

  /* Cheddar, likewise recorded as absent. Filed as "yellow cheese 32%". */
  { id: 'cheddar', he: 'גבינה צהובה 32% שומן, צ\'דר, תנובה',
    t: { en: 'Cheddar, 32%', de: 'Cheddar, 32%', es: 'Cheddar, 32%',
         fr: 'Cheddar, 32%', it: 'Cheddar, 32%', pt: 'Cheddar, 32%',
         ja: 'チェダーチーズ 32%', 'zh-Hans': '切达奶酪 32%',
         'zh-Hant': '切達乳酪 32%', ar: 'جبنة شيدر 32%' } },

  { id: 'yellow-cheese-15', he: 'גבינה צהובה 15% שומן, עמק',
    t: { en: 'Semi-hard yellow cheese, 15%', de: 'Schnittkäse, 15%',
         es: 'Queso semiduro amarillo, 15%', fr: 'Fromage à pâte pressée, 15%',
         it: 'Formaggio semiduro, 15%', pt: 'Queijo semiduro amarelo, 15%',
         ja: 'セミハードチーズ 15%', 'zh-Hans': '半硬质奶酪 15%',
         'zh-Hant': '半硬質起司 15%', ar: 'جبنة صفراء نصف صلبة 15%' } },

  { id: 'goat-cheese-20', he: 'גבינת עזים 20% שומן, גד',
    t: { en: 'Goat cheese, 20%', de: 'Ziegenkäse, 20%', es: 'Queso de cabra, 20%',
         fr: 'Fromage de chèvre, 20%', it: 'Formaggio di capra, 20%',
         pt: 'Queijo de cabra, 20%', ja: 'シェーヴルチーズ（ヤギ）20%',
         'zh-Hans': '山羊奶酪 20%', 'zh-Hant': '山羊乳酪 20%',
         ar: 'جبنة ماعز 20%' } },

  /* Cooking cream, not soured. It sits two kcal from the 15% sour cream, so
     every name says which of the two it is. */
  { id: 'cooking-cream-15', he: 'שמנת לבישול 15% שומן, תנובה',
    t: { en: 'Cooking cream, 15%', de: 'Kochsahne, 15%', es: 'Nata para cocinar, 15%',
         fr: 'Crème à cuisiner, 15%', it: 'Panna da cucina, 15%',
         pt: 'Creme de leite culinário, 15%', ja: '料理用クリーム 15%',
         'zh-Hans': '烹饪奶油 15%', 'zh-Hant': '烹飪鮮奶油 15%',
         ar: 'كريمة طهي 15%' } },

  { id: 'sheep-milk-7', he: 'חלב כבשים 7% שומן',
    t: { en: 'Sheep milk, 7%', de: 'Schafsmilch, 7%', es: 'Leche de oveja, 7%',
         fr: 'Lait de brebis, 7%', it: 'Latte di pecora, 7%',
         pt: 'Leite de ovelha, 7%', ja: '羊乳 7%', 'zh-Hans': '绵羊奶 7%',
         'zh-Hant': '綿羊奶 7%', ar: 'حليب غنم 7%' } },

  /* The plain tub, not `מרגרינה מחמאה` - that row is margarine made WITH
     butter, and the person who picks margarine over butter is usually the
     person avoiding dairy. Byte-identical numbers, so nothing is lost. */
  { id: 'margarine', he: 'מרגרינה גולדבנד, בגביע, תלמה',
    t: { en: 'Margarine, tub', de: 'Margarine, Becher', es: 'Margarina en tarrina (pote)',
         fr: 'Margarine en barquette', it: 'Margarina in vaschetta',
         pt: 'Margarina em pote', ja: 'マーガリン（カップ）',
         'zh-Hans': '人造黄油（盒装）', 'zh-Hant': '人造奶油（盒裝）',
         ar: 'مارغرين في علبة' } },

  { id: 'beef-dried', he: 'בשר בקר, מיובש',
    t: { en: 'Beef, dried', de: 'Rindfleisch, getrocknet', es: 'Carne de vacuno seca',
         fr: 'Bœuf séché', it: 'Manzo essiccato', pt: 'Carne bovina seca',
         ja: '乾燥牛肉', 'zh-Hans': '干制牛肉',
         'zh-Hant': '乾製牛肉', ar: 'لحم بقري مجفف' } },

  { id: 'beef-brisket-raw', he: 'בשר בקר, חזה, לא מבושל',
    t: { en: 'Beef brisket, raw', de: 'Rinderbrust, roh', es: 'Pecho de vacuno, crudo',
         fr: 'Poitrine de bœuf, crue', it: 'Punta di petto di manzo, cruda',
         pt: 'Peito bovino, cru', ja: '牛ブリスケット（生）',
         'zh-Hans': '牛胸肉（生）', 'zh-Hant': '牛胸肉（生）',
         ar: 'صدر بقري نيء' } },

  { id: 'lamb-roasted', he: 'בשר כבש צלוי בשמן זית',
    t: { en: 'Lamb, roasted in olive oil', de: 'Lamm, in Olivenöl gebraten',
         es: 'Cordero asado en aceite de oliva', fr: 'Agneau rôti à l’huile d’olive',
         it: 'Agnello arrosto all’olio d’oliva', pt: 'Cordeiro assado em azeite',
         ja: 'ラム肉（オリーブオイルでロースト）', 'zh-Hans': '橄榄油烤羊肉',
         'zh-Hant': '橄欖油烤羊肉', ar: 'لحم ضأن مشوي بزيت الزيتون' } },

  { id: 'lamb-osso-buco', he: 'בשר כבש, אוסובוקו',
    /* Braised, and every name says so: no plain lamb row in this table
       carries carbohydrate, and this one has 7.2 g of it. */
    t: { en: 'Lamb shank, braised (osso buco)', de: 'Lammhaxe, geschmort (Ossobuco)',
         es: 'Jarrete de cordero estofado (osso buco)',
         fr: 'Jarret d’agneau braisé (osso buco)',
         it: 'Ossobuco di agnello, brasato', pt: 'Ossobuco de cordeiro, estufado',
         ja: 'ラムすね肉の煮込み（オッソブーコ）', 'zh-Hans': '炖羊腱（羊小腿）',
         'zh-Hant': '燉羊腱（羊小腿）', ar: 'موزة ضأن مطهوة ببطء (أوسو بوكو)' } },

  { id: 'turkey-liver', he: 'בשר הודו, כבד, מבושל',
    t: { en: 'Turkey liver, cooked', de: 'Putenleber, gegart',
         es: 'Hígado de pavo cocido', fr: 'Foie de dinde, cuit',
         it: 'Fegato di tacchino, cotto', pt: 'Fígado de peru, cozido',
         ja: '七面鳥のレバー（加熱）', 'zh-Hans': '火鸡肝（熟）',
         'zh-Hant': '火雞肝（熟）', ar: 'كبد ديك رومي مطبوخ' } },

  { id: 'turkey-breast-olive-oil', he: 'בשר הודו, חזה מטוגן בשמן זית',
    t: { en: 'Turkey breast, fried in olive oil',
         de: 'Putenbrust, in Olivenöl gebraten',
         es: 'Pechuga de pavo frita en aceite de oliva',
         fr: 'Blanc de dinde, poêlé à l’huile d’olive',
         it: 'Petto di tacchino, saltato in olio d’oliva',
         pt: 'Peito de peru, frito em azeite',
         ja: '七面鳥むね肉（オリーブオイル焼き）',
         'zh-Hans': '火鸡胸肉（橄榄油煎）', 'zh-Hant': '火雞胸肉（橄欖油煎）',
         ar: 'صدر ديك رومي مقلي بزيت الزيتون' } },

  { id: 'chicken-skin-roasted', he: 'בשר עוף, עור, צלוי',
    t: { en: 'Chicken skin, roasted', de: 'Hähnchenhaut, gebraten',
         es: 'Piel de pollo asada', fr: 'Peau de poulet rôtie',
         it: 'Pelle di pollo arrosto', pt: 'Pele de frango assada',
         ja: '鶏皮（ロースト）', 'zh-Hans': '烤鸡皮', 'zh-Hant': '烤雞皮',
         ar: 'جلد دجاج مشوي' } },

  { id: 'ground-chicken-roasted', he: 'בשר עוף, טחון, צלוי',
    t: { en: 'Ground chicken (minced), roasted',
         de: 'Hähnchenhackfleisch, gebraten', es: 'Pollo picado asado',
         fr: 'Poulet haché, rôti', it: 'Pollo macinato, arrosto',
         pt: 'Frango moído, assado', ja: '鶏ひき肉（ロースト）',
         'zh-Hans': '鸡肉糜（烤）', 'zh-Hant': '雞絞肉（烤）',
         ar: 'دجاج مفروم مشوي' } },

  { id: 'tuna-canned-water', he: 'דג טונה, משומר במים',
    t: { en: 'Tuna, canned in water', de: 'Thunfisch, Dose in Wasser',
         es: 'Atún en conserva al natural', fr: 'Thon en conserve au naturel',
         it: 'Tonno in scatola al naturale', pt: 'Atum em conserva na água',
         ja: 'ツナ水煮缶', 'zh-Hans': '水浸金枪鱼罐头',
         'zh-Hant': '水浸鮪魚罐頭', ar: 'تونة معلبة بالماء' } },

  { id: 'tilapia-raw', he: 'דג אמנון-מושט, לא מבושל',
    t: { en: 'Tilapia, raw', de: 'Tilapia, roh', es: 'Tilapia cruda',
         fr: 'Tilapia, cru', it: 'Tilapia, cruda', pt: 'Tilápia, crua',
         ja: 'ティラピア（生）', 'zh-Hans': '罗非鱼（生）',
         'zh-Hant': '吳郭魚（生）', ar: 'بلطي نيء' } },

  { id: 'grey-mullet-raw', he: 'דג בורי לא מבושל',
    t: { en: 'Grey mullet, raw', de: 'Meeräsche, roh', es: 'Mújol crudo',
         fr: 'Mulet, cru', it: 'Cefalo, crudo', pt: 'Tainha, crua',
         ja: 'ボラ（生）', 'zh-Hans': '鲻鱼（生）', 'zh-Hant': '烏魚（生）',
         ar: 'بوري نيء' } },

  { id: 'salmon-smoked', he: 'דג סלמון, מעושן',
    t: { en: 'Salmon, smoked', de: 'Lachs, geräuchert', es: 'Salmón ahumado',
         fr: 'Saumon fumé', it: 'Salmone affumicato', pt: 'Salmão defumado',
         ja: 'スモークサーモン', 'zh-Hans': '烟熏三文鱼',
         'zh-Hant': '煙燻鮭魚', ar: 'سلمون مدخن' } },

  { id: 'egg-whole-dried', he: 'ביצה שלמה מיובשת',
    t: { en: 'Whole egg, dried', de: 'Vollei, getrocknet', es: 'Huevo entero en polvo',
         fr: 'Œuf entier séché', it: 'Uovo intero essiccato',
         pt: 'Ovo inteiro em pó', ja: '全卵粉', 'zh-Hans': '全蛋粉',
         'zh-Hant': '全蛋粉', ar: 'بيض كامل مجفف' } },

  { id: 'egg-white-dried', he: 'ביצה חלבון מיובש',
    t: { en: 'Egg white, dried', de: 'Eiklar, getrocknet', es: 'Clara de huevo en polvo',
         fr: 'Blanc d’œuf séché', it: 'Albume d’uovo, essiccato',
         pt: 'Clara de ovo em pó', ja: '乾燥卵白', 'zh-Hans': '蛋清粉（干燥蛋清）',
         'zh-Hant': '乾燥蛋白', ar: 'بياض البيض، مجفف' } },

  /* The everyday cocoa - and the row I had wrongly condemned. I chose the
     24% breakfast cocoa instead because its energy matched 4/4/9 exactly,
     which turns out to mean only that its carbohydrate is stored as total
     rather than net. This row is USDA's unsweetened cocoa powder verbatim,
     and it is what someone means by cocoa. */
  { id: 'cocoa-powder', he: 'קקאו, אבקה, ללא חלב מיובש',
    t: { en: 'Cocoa powder, unsweetened', de: 'Kakaopulver, ungesüßt',
         es: 'Cacao en polvo, sin azúcar', fr: 'Cacao en poudre, non sucré',
         it: 'Cacao in polvere, non zuccherato', pt: 'Cacau em pó, sem açúcar',
         ja: 'ココアパウダー（無糖）', 'zh-Hans': '可可粉（无糖）',
         'zh-Hant': '可可粉（無糖）', ar: 'مسحوق كاكاو بدون سكر' } },

  /* The generic row with the cocoa share in its name, not a single brand.
     The percentage is what a person choosing dark chocolate is choosing. */
  { id: 'dark-chocolate-60', he: 'שוקולד מריר, 60-69% מוצקי קקאו',
    t: { en: 'Dark chocolate, 60-69% cocoa', de: 'Zartbitterschokolade, 60-69% Kakao',
         es: 'Chocolate negro, 60-69% de cacao', fr: 'Chocolat noir, 60-69% de cacao',
         it: 'Cioccolato fondente, 60-69% di cacao',
         pt: 'Chocolate amargo, 60-69% de cacau',
         ja: 'ダークチョコレート（カカオ60〜69%）', 'zh-Hans': '黑巧克力（可可60-69%）',
         'zh-Hant': '黑巧克力（可可60-69%）', ar: 'شوكولاتة داكنة، كاكاو 60-69%' } },

  { id: 'halva', he: 'חלבה פשוטה',
    t: { en: 'Halva, plain', de: 'Halva, natur', es: 'Halva natural',
         fr: 'Halva nature', it: 'Halva semplice', pt: 'Halva simples',
         ja: 'ハルヴァ（プレーン）', 'zh-Hans': '哈尔瓦酥糖（原味）',
         'zh-Hant': '哈爾瓦酥糖（原味）', ar: 'حلاوة طحينية سادة' } },

  { id: 'red-cabbage', he: 'כרוב אדום, טרי',
    t: { en: 'Red cabbage, fresh', de: 'Rotkohl, frisch', es: 'Repollo morado (lombarda), fresco',
         fr: 'Chou rouge frais', it: 'Cavolo rosso fresco',
         pt: 'Repolho roxo fresco', ja: '紫キャベツ', 'zh-Hans': '紫甘蓝',
         'zh-Hant': '紫甘藍', ar: 'ملفوف أحمر طازج' } },

  /* ── batch 4: recovered from the "absent" list, plus produce ──────────── */

  { id: 'tapioca-pearls', he: 'טפיוקה, גרגירים, יבש',
    t: { en: 'Tapioca pearls, dry', de: 'Tapiokaperlen, trocken',
         es: 'Perlas de tapioca secas', fr: 'Perles de tapioca sèches',
         it: 'Perle di tapioca secche', pt: 'Sagu de tapioca seco',
         ja: 'タピオカパール（乾燥）', 'zh-Hans': '西米（木薯珍珠，干）',
         'zh-Hant': '西米（木薯珍珠，乾）', ar: 'حبوب تابيوكا جافة' } },

  /* The table's only tempeh row, and a branded frozen one: 16 g of
     carbohydrate against USDA's 7.6 suggests added grain. Kept because
     there is no alternative, recorded because there is no alternative. */
  { id: 'tempeh', he: 'טמפה, מזון אינדונזי שורשי, קפוא, כפרי בריא',
    t: { en: 'Tempeh', de: 'Tempeh', es: 'Tempeh', fr: 'Tempeh', it: 'Tempeh',
         pt: 'Tempeh', ja: 'テンペ', 'zh-Hans': '天贝（印尼发酵豆饼）',
         'zh-Hant': '天貝（印尼發酵豆餅）', ar: 'تمبيه' } },

  { id: 'wheat-gluten', he: 'גלוטן חיטה, יבש, vital wheat gluten',
    t: { en: 'Vital wheat gluten (seitan flour), dry',
         de: 'Weizengluten (Seitan-Mehl), trocken',
         es: 'Gluten de trigo (harina para seitán), seco',
         fr: 'Gluten de blé (farine à seitan), sec',
         it: 'Glutine di frumento (farina per seitan), secco',
         pt: 'Glúten de trigo (farinha para seitan), seco',
         ja: '小麦グルテン（セイタンの粉・乾燥）',
         'zh-Hans': '小麦面筋粉（干）', 'zh-Hant': '小麥麵筋粉（乾）',
         ar: 'غلوتين القمح (دقيق السيتان) جاف' } },

  /* The generic row, 185 kcal - USDA's canned-in-tomato is 186. The branded
     tin this first named is 121, and it was wearing a name in eleven
     languages that promises the ordinary thing. */
  /* Cooked seitan, 112 kcal. The dry gluten powder above is 370, and calling
     that "seitan flour" left anyone logging seitan 3.3x high. */
  { id: 'seitan', he: 'סייטן, פרוסות בסגנון סלמי, טבע דלי',
    t: { en: 'Seitan slices', de: 'Seitan-Scheiben', es: 'Lonchas de seitán',
         fr: 'Tranches de seitan', it: 'Fette di seitan', pt: 'Fatias de seitan',
         ja: 'セイタン（グルテンミート）スライス', 'zh-Hans': '面筋素肉片',
         'zh-Hant': '麵筋素肉片', ar: 'شرائح سيتان' } },

  { id: 'sardines-tomato', he: 'דג סרדין, ברוטב עגבניות',
    t: { en: 'Sardines, canned in tomato sauce',
         de: 'Sardinen in Tomatensauce, Dose',
         es: 'Sardinas en conserva con salsa de tomate',
         fr: 'Sardines en conserve à la sauce tomate',
         it: 'Sardine in scatola al pomodoro',
         pt: 'Sardinhas em lata ao molho de tomate',
         ja: 'いわしのトマトソース缶', 'zh-Hans': '茄汁沙丁鱼罐头',
         'zh-Hant': '茄汁沙丁魚罐頭', ar: 'سردين معلب بصلصة الطماطم' } },

  { id: 'anchovies-canned', he: 'דג אנשובי, משומר',
    t: { en: 'Anchovies, canned', de: 'Sardellen, Dose', es: 'Anchoas en conserva',
         fr: 'Anchois en conserve', it: 'Acciughe in scatola',
         pt: 'Anchovas em lata', ja: 'アンチョビ（缶詰）',
         'zh-Hans': '鳀鱼罐头', 'zh-Hant': '鯷魚罐頭', ar: 'أنشوجة معلبة' } },

  /* 19 / 0.9 / 1.4 / 0.1, which is USDA canned sauerkraut on all four. The
     row first taken said מוחמץ - soured - at 14, and the eleven names were
     asserting fermentation the Hebrew did not. */
  { id: 'sauerkraut', he: 'כרוב, כבוש, משומר',
    t: { en: 'Sauerkraut (fermented cabbage)', de: 'Sauerkraut',
         es: 'Chucrut (col fermentada)', fr: 'Choucroute (chou fermenté)',
         it: 'Crauti (cavolo fermentato)', pt: 'Chucrute (repolho fermentado)',
         ja: 'ザワークラウト（発酵キャベツ）', 'zh-Hans': '德式酸菜（发酵卷心菜）',
         'zh-Hant': '德式酸菜（發酵高麗菜）', ar: 'مخلل الملفوف المخمّر' } },

  { id: 'fennel-fresh', he: 'שומר, טרי',
    t: { en: 'Fennel bulb, fresh', de: 'Fenchelknolle, frisch',
         es: 'Bulbo de hinojo fresco', fr: 'Bulbe de fenouil frais',
         it: 'Finocchio fresco', pt: 'Funcho fresco', ja: 'フェンネル（生）',
         'zh-Hans': '茴香头（鲜）', 'zh-Hant': '茴香頭（鮮）',
         ar: 'شمر طازج' } },

  /* The `ללא תוספת שומן` row, as spinach, chard and butternut in this batch
     all took. The other one carries 8.1 g of carbohydrate - more than raw
     fennel has in TOTAL - so it is not a plain drained fennel. */
  { id: 'fennel-cooked', he: 'שומר, מבושל, ללא תוספת שומן בבישול, עם מלח',
    t: { en: 'Fennel bulb, cooked', de: 'Fenchelknolle, gegart',
         es: 'Bulbo de hinojo cocido', fr: 'Bulbe de fenouil cuit',
         it: 'Finocchio cotto', pt: 'Funcho cozido', ja: 'フェンネル（加熱）',
         'zh-Hans': '茴香头（熟）', 'zh-Hant': '茴香頭（熟）',
         ar: 'شمر مطبوخ' } },

  { id: 'turnip-fresh', he: 'לפת, טריה',
    t: { en: 'Turnip, fresh', de: 'Speiserübe, frisch', es: 'Nabo fresco',
         fr: 'Navet frais', it: 'Rapa fresca', pt: 'Nabo fresco',
         ja: 'かぶ（生）', 'zh-Hans': '芜菁（鲜）', 'zh-Hant': '蕪菁（鮮）',
         ar: 'لفت طازج' } },

  { id: 'turnip-pickled', he: 'לפת, כבושה',
    t: { en: 'Turnip, pickled', de: 'Speiserübe, eingelegt', es: 'Nabo encurtido',
         fr: 'Navet mariné', it: 'Rapa sottaceto', pt: 'Nabo em conserva',
         ja: 'かぶの漬物', 'zh-Hans': '腌芜菁', 'zh-Hant': '醃蕪菁',
         ar: 'لفت مخلل' } },

  { id: 'beetroot-pickled', he: 'סלק, כבוש',
    t: { en: 'Beet, pickled', de: 'Rote Bete, eingelegt',
         es: 'Remolacha encurtida', fr: 'Betterave marinée',
         it: 'Barbabietola sottaceto', pt: 'Beterraba em conserva',
         ja: 'ビーツの酢漬け', 'zh-Hans': '腌甜菜根', 'zh-Hant': '醃甜菜根',
         ar: 'شمندر مخلل' } },

  { id: 'cucumber-pickled', he: 'מלפפון כבוש עם שמיר',
    t: { en: 'Pickled cucumber with dill', de: 'Salzgurke mit Dill',
         es: 'Pepinillo en vinagre con eneldo', fr: 'Cornichon à l’aneth',
         it: 'Cetriolo sottaceto all’aneto', pt: 'Pepino em conserva com endro',
         ja: 'きゅうりのピクルス（ディル）', 'zh-Hans': '莳萝腌黄瓜',
         'zh-Hant': '蒔蘿醃小黃瓜', ar: 'خيار مخلل بالشبت' } },

  { id: 'mushrooms-pickled', he: 'פטריות, כבושות',
    t: { en: 'Mushrooms, pickled', de: 'Champignons, eingelegt',
         es: 'Champiñones encurtidos', fr: 'Champignons marinés',
         it: 'Funghi sottaceto', pt: 'Cogumelos em conserva',
         ja: 'マッシュルームの酢漬け', 'zh-Hans': '腌蘑菇',
         'zh-Hant': '醃蘑菇', ar: 'فطر مخلل' } },

  { id: 'boston-lettuce', he: 'חסה בוסטון',
    t: { en: 'Butterhead lettuce (Boston)', de: 'Kopfsalat (Butterhead)',
         es: 'Lechuga mantecosa (Boston)', fr: 'Laitue beurre (Boston)',
         it: 'Lattuga a cappuccio (Boston)', pt: 'Alface manteiga (Boston)',
         ja: 'サラダ菜（バターヘッドレタス）', 'zh-Hans': '奶油生菜（波士顿生菜）',
         'zh-Hant': '奶油萵苣（波士頓萵苣）', ar: 'خس بوسطن' } },

  { id: 'spinach-cooked', he: 'תרד, טרי, מבושל, ללא תוספת שומן, עם מלח',
    t: { en: 'Spinach, cooked without fat', de: 'Spinat, ohne Fett gegart',
         es: 'Espinacas cocidas sin grasa', fr: 'Épinards cuits sans matière grasse',
         it: 'Spinaci cotti senza grassi', pt: 'Espinafre cozido sem gordura',
         ja: 'ほうれん草（油なしで加熱）', 'zh-Hans': '菠菜（无油烹煮）',
         'zh-Hant': '菠菜（無油烹煮）', ar: 'سبانخ مطبوخة بدون دهن' } },

  { id: 'chard-cooked', he: 'מנגולד, מבושל, עם מלח, ללא תוספת שומן בבישול',
    t: { en: 'Swiss chard, cooked without fat', de: 'Mangold, ohne Fett gegart',
         es: 'Acelga cocida sin grasa', fr: 'Blette cuite sans matière grasse',
         it: 'Bietola cotta senza grassi', pt: 'Acelga cozida sem gordura',
         ja: 'フダンソウ（油なしで加熱）', 'zh-Hans': '牛皮菜（无油烹煮）',
         'zh-Hant': '牛皮菜（無油烹煮）', ar: 'سلق مطبوخ بدون دهن' } },

  { id: 'brussels-sprouts', he: 'כרוב ניצנים, טרי',
    t: { en: 'Brussels sprouts, fresh', de: 'Rosenkohl, frisch',
         es: 'Coles de Bruselas frescas', fr: 'Choux de Bruxelles frais',
         it: 'Cavoletti di Bruxelles freschi', pt: 'Couve-de-bruxelas fresca',
         ja: '芽キャベツ', 'zh-Hans': '抱子甘蓝', 'zh-Hant': '抱子甘藍',
         ar: 'كرنب بروكسل طازج' } },

  { id: 'cauliflower-frozen', he: 'כרובית, קפואה, לא מבושלת',
    t: { en: 'Cauliflower, frozen, uncooked', de: 'Blumenkohl, tiefgekühlt, ungegart',
         es: 'Coliflor congelada, cruda', fr: 'Chou-fleur surgelé, cru',
         it: 'Cavolfiore surgelato, crudo', pt: 'Couve-flor congelada, crua',
         ja: 'カリフラワー（冷凍・未加熱）', 'zh-Hans': '花椰菜（冷冻，未烹煮）',
         'zh-Hant': '白花椰菜（冷凍，未烹煮）', ar: 'قرنبيط مجمد غير مطبوخ' } },

  { id: 'butternut-raw', he: 'דלורית, לא מבושלת',
    t: { en: 'Butternut squash, raw', de: 'Butternusskürbis, roh',
         es: 'Calabaza cacahuete cruda', fr: 'Courge butternut crue',
         it: 'Zucca butternut cruda', pt: 'Abóbora butternut crua',
         ja: 'バターナッツかぼちゃ（生）', 'zh-Hans': '奶油南瓜（生）',
         'zh-Hant': '奶油南瓜（生）', ar: 'قرع الجوز نيء' } },

  { id: 'butternut-cooked', he: 'דלורית, מבושלת/אפויה, ללא מלח',
    t: { en: 'Butternut squash, cooked without salt',
         de: 'Butternusskürbis, ohne Salz gegart',
         es: 'Calabaza cacahuete cocida sin sal',
         fr: 'Courge butternut cuite sans sel',
         it: 'Zucca butternut cotta senza sale',
         pt: 'Abóbora butternut cozida sem sal',
         ja: 'バターナッツかぼちゃ（無塩で加熱）', 'zh-Hans': '奶油南瓜（无盐烹煮）',
         'zh-Hant': '奶油南瓜（無鹽烹煮）', ar: 'قرع الجوز مطبوخ بدون ملح' } },

  { id: 'aubergine-roasted', he: 'חצילים קלויים ללא תוספות',
    t: { en: 'Eggplant, roasted, plain', de: 'Aubergine, geröstet, pur',
         es: 'Berenjena asada, sin más', fr: 'Aubergine grillée, nature',
         it: 'Melanzana arrostita, al naturale', pt: 'Berinjela assada, simples',
         ja: '焼きなす（味付けなし）', 'zh-Hans': '烤茄子（原味）',
         'zh-Hant': '烤茄子（原味）', ar: 'باذنجان مشوي بدون إضافات' } },

  { id: 'artichoke-whole', he: 'ארטישוק, חי, עם עלים וגבעול',
    t: { en: 'Artichoke, whole, weighed with leaves and stem',
         de: 'Artischocke, ganz, mit Blättern und Stiel gewogen',
         es: 'Alcachofa entera, pesada con hojas y tallo',
         fr: 'Artichaut entier, pesé avec feuilles et tige',
         it: 'Carciofo intero, pesato con foglie e gambo',
         pt: 'Alcachofra inteira, pesada com folhas e talo',
         ja: 'アーティチョーク（葉と茎込みの重さ）',
         'zh-Hans': '整颗洋蓟（连叶带茎称重）', 'zh-Hant': '整顆朝鮮薊（連葉帶莖秤重）',
         ar: 'خرشوف كامل موزون بأوراقه وساقه' } },

  { id: 'sundried-tomatoes-oil', he: 'עגבניות מיובשות בשמן, אוליביה',
    /* Undrained: 428 kcal against USDA's drained 213, because the oil is in
       the 100 g. Someone who drains them would otherwise log double. */
    t: { en: 'Sun-dried tomatoes in oil, undrained',
         de: 'Getrocknete Tomaten in Öl, nicht abgetropft',
         es: 'Tomates secos en aceite, sin escurrir',
         fr: 'Tomates séchées à l’huile, non égouttées',
         it: 'Pomodori secchi sott’olio, non sgocciolati',
         pt: 'Tomates secos em óleo, sem escorrer',
         ja: 'ドライトマトのオイル漬け（油ごと）', 'zh-Hans': '油浸晒干番茄（连油）',
         'zh-Hant': '油漬曬乾番茄（連油）', ar: 'طماطم مجففة بالزيت، غير مصفّاة' } },

  { id: 'green-olives-stuffed', he: 'זיתים ירוקים, ממולאים',
    t: { en: 'Green olives, stuffed', de: 'Grüne Oliven, gefüllt',
         es: 'Aceitunas verdes rellenas', fr: 'Olives vertes farcies',
         it: 'Olive verdi farcite', pt: 'Azeitonas verdes recheadas',
         ja: 'グリーンオリーブ（詰め物入り）', 'zh-Hans': '绿橄榄，酿馅',
         'zh-Hant': '綠橄欖（釀餡）', ar: 'زيتون أخضر محشي' } },

  { id: 'grapes', he: 'ענבים, לפנ לסוג, טרי',
    t: { en: 'Grapes, fresh', de: 'Weintrauben, frisch', es: 'Uvas frescas',
         fr: 'Raisin frais', it: 'Uva fresca', pt: 'Uvas frescas',
         ja: 'ぶどう', 'zh-Hans': '葡萄（鲜）', 'zh-Hant': '葡萄（鮮）',
         ar: 'عنب طازج' } },

  { id: 'nectarine', he: 'נקטרינה, טריה',
    t: { en: 'Nectarine, fresh', de: 'Nektarine, frisch', es: 'Nectarina fresca',
         fr: 'Nectarine fraîche', it: 'Pesca noce fresca', pt: 'Nectarina fresca',
         ja: 'ネクタリン', 'zh-Hans': '油桃', 'zh-Hant': '油桃',
         ar: 'نكتارين طازج' } },

  { id: 'persimmon', he: 'אפרסמון, טרי',
    t: { en: 'Persimmon, fresh', de: 'Kaki, frisch', es: 'Caqui fresco',
         fr: 'Kaki frais', it: 'Caco fresco', pt: 'Caqui fresco',
         ja: '柿', 'zh-Hans': '柿子', 'zh-Hant': '柿子',
         ar: 'كاكا طازجة' } },

  { id: 'guava', he: 'גויאבה, טריה',
    t: { en: 'Guava, fresh', de: 'Guave, frisch', es: 'Guayaba fresca',
         fr: 'Goyave fraîche', it: 'Guava fresca', pt: 'Goiaba fresca',
         ja: 'グアバ', 'zh-Hans': '番石榴', 'zh-Hant': '芭樂',
         ar: 'جوافة طازجة' } },

  { id: 'passion-fruit', he: 'פסיפלורה, פרי התאוה, טרי',
    t: { en: 'Passion fruit, fresh', de: 'Passionsfrucht, frisch',
         es: 'Maracuyá fresco', fr: 'Fruit de la passion frais',
         it: 'Frutto della passione fresco', pt: 'Maracujá fresco',
         ja: 'パッションフルーツ', 'zh-Hans': '百香果', 'zh-Hant': '百香果',
         ar: 'فاكهة الباشن فروت طازجة' } },

  { id: 'mandarin', he: 'קלמנטינה/מנדרינה, טריה',
    t: { en: 'Mandarin or clementine, fresh', de: 'Mandarine oder Clementine, frisch',
         es: 'Mandarina o clementina fresca', fr: 'Mandarine ou clémentine fraîche',
         it: 'Mandarino o clementina fresca', pt: 'Tangerina ou clementina fresca',
         ja: 'みかん（マンダリン）', 'zh-Hans': '橘子（柑橘）',
         'zh-Hant': '橘子（柑橘）', ar: 'يوسفي طازج' } },

  { id: 'mulberry', he: 'תות עץ, טרי',
    t: { en: 'Mulberry, fresh', de: 'Maulbeere, frisch', es: 'Mora de morera fresca',
         fr: 'Mûre de mûrier fraîche', it: 'Gelso fresco', pt: 'Amora-de-árvore fresca',
         ja: '桑の実', 'zh-Hans': '桑葚', 'zh-Hant': '桑葚',
         ar: 'توت شامي طازج' } },

  { id: 'quince', he: 'חבוש, טרי',
    t: { en: 'Quince, fresh', de: 'Quitte, frisch', es: 'Membrillo fresco',
         fr: 'Coing frais', it: 'Mela cotogna fresca', pt: 'Marmelo fresco',
         ja: 'マルメロ', 'zh-Hans': '榅桲', 'zh-Hant': '榲桲',
         ar: 'سفرجل طازج' } },

  { id: 'loquat', he: 'שסק, טרי',
    t: { en: 'Loquat, fresh', de: 'Loquat (Wollmispel), frisch',
         es: 'Níspero fresco', fr: 'Nèfle du Japon fraîche',
         it: 'Nespola del Giappone fresca', pt: 'Nêspera fresca',
         ja: 'びわ', 'zh-Hans': '枇杷', 'zh-Hant': '枇杷',
         ar: 'أكي دنيا طازج' } },

  { id: 'pear-baked', he: 'אגס, אפוי',
    t: { en: 'Pear, baked', de: 'Birne, gebacken', es: 'Pera al horno',
         fr: 'Poire cuite au four', it: 'Pera al forno', pt: 'Pera assada',
         ja: '洋なし（焼き）', 'zh-Hans': '烤梨', 'zh-Hant': '烤梨',
         ar: 'كمثرى مخبوزة' } },

  { id: 'mango-dried', he: 'מנגו, מיובש',
    t: { en: 'Mango, dried', de: 'Mango, getrocknet', es: 'Mango seco',
         fr: 'Mangue séchée', it: 'Mango essiccato', pt: 'Manga seca',
         ja: 'ドライマンゴー', 'zh-Hans': '芒果干', 'zh-Hant': '芒果乾',
         ar: 'مانجو مجففة' } },

  { id: 'cranberries-dried', he: 'חמוציות, מיובשות ממותקות',
    t: { en: 'Cranberries, dried and sweetened',
         de: 'Cranberries, getrocknet und gesüßt',
         es: 'Arándanos rojos secos y azucarados',
         fr: 'Canneberges séchées et sucrées',
         it: 'Mirtilli rossi secchi e zuccherati',
         pt: 'Cranberries secas e adoçadas',
         ja: 'ドライクランベリー（加糖）', 'zh-Hans': '蔓越莓干（加糖）',
         'zh-Hant': '蔓越莓乾（加糖）', ar: 'توت بري مجفف ومحلى' } },

  { id: 'flaxseed', he: 'זרעי פשתן',
    t: { en: 'Flaxseed (linseed)', de: 'Leinsamen', es: 'Semillas de lino',
         fr: 'Graines de lin', it: 'Semi di lino', pt: 'Sementes de linhaça',
         ja: '亜麻仁（フラックスシード）', 'zh-Hans': '亚麻籽',
         'zh-Hant': '亞麻籽', ar: 'بذور الكتان' } },

  /* ── batch 5: legumes, drinks, and what is drunk rather than eaten ────── */

  { id: 'fava-beans-dry', he: 'פול יבש, לא מבושל',
    t: { en: 'Fava beans (broad beans), dry', de: 'Ackerbohnen (Puffbohnen), getrocknet',
         es: 'Habas secas', fr: 'Fèves sèches', it: 'Fave secche',
         pt: 'Favas secas', ja: 'そら豆（乾燥）', 'zh-Hans': '蚕豆（干）',
         'zh-Hant': '蠶豆（乾）', ar: 'فول جاف' } },

  { id: 'fava-beans-cooked', he: 'פול יבש, מבושל',
    /* "Dried" is carried: the table also has a FRESH cooked fava row at 109,
       and that qualifier is the only thing separating them. */
    t: { en: 'Fava beans (broad beans), dried, cooked',
         de: 'Ackerbohnen, getrocknet, gekocht',
         es: 'Habas secas cocidas', fr: 'Fèves sèches cuites',
         it: 'Fave secche cotte', pt: 'Favas secas cozidas',
         ja: 'そら豆（乾燥・ゆで）', 'zh-Hans': '干蚕豆（煮熟）',
         'zh-Hant': '乾蠶豆（煮熟）', ar: 'فول جاف مطبوخ' } },

  { id: 'lupini-dry', he: 'תורמוס יבש',
    t: { en: 'Lupini beans, dry', de: 'Lupinen, getrocknet', es: 'Altramuces secos',
         fr: 'Lupins secs', it: 'Lupini secchi', pt: 'Tremoços secos',
         ja: 'ルピナス豆（乾燥）', 'zh-Hans': '羽扇豆（干）',
         'zh-Hant': '羽扇豆（乾）', ar: 'ترمس جاف' } },

  { id: 'lupini-cooked', he: 'תורמוס מבושל',
    t: { en: 'Lupini beans, cooked', de: 'Lupinen, gekocht', es: 'Altramuces cocidos',
         fr: 'Lupins cuits', it: 'Lupini cotti', pt: 'Tremoços cozidos',
         ja: 'ルピナス豆（ゆで）', 'zh-Hans': '羽扇豆（煮熟）',
         'zh-Hant': '羽扇豆（煮熟）', ar: 'ترمس مطبوخ' } },

  { id: 'split-peas-cooked', he: 'אפונה יבשה, מבושלת, ללא תוספת שומן בבישול, עם מלח',
    /* SPLIT in all eleven. Four said split and seven said merely dried -
       one entry contradicting itself - and split is the right word: 341 for
       the dry row and 117 for this one are USDA's split peas to the
       decimal. core:peas-dry is corrected to match. */
    t: { en: 'Split peas, cooked', de: 'Schälerbsen, gekocht',
         es: 'Guisantes partidos cocidos', fr: 'Pois cassés cuits',
         it: 'Piselli spezzati cotti', pt: 'Ervilha partida cozida',
         ja: '割りえんどう豆（ゆで）', 'zh-Hans': '干豌豆瓣（煮熟）',
         'zh-Hant': '乾豌豆瓣（煮熟）', ar: 'بازلاء مجروشة مطبوخة' } },

  { id: 'walnuts-in-shell', he: 'אגוזי מלך, עם קליפה, לא קלויים, ללא מלח',
    t: { en: 'Walnuts, weighed in the shell', de: 'Walnüsse, mit Schale gewogen',
         es: 'Nueces, pesadas con cáscara', fr: 'Noix, pesées en coque',
         it: 'Noci, pesate con guscio', pt: 'Nozes, pesadas com casca',
         ja: 'くるみ（殻込みの重さ）', 'zh-Hans': '核桃（连壳称重）',
         'zh-Hant': '核桃（連殼秤重）', ar: 'جوز موزون بقشره' } },

  { id: 'tofu-soft', he: 'טופו במרקם רך, כפרי בריא, משק ווילר',
    t: { en: 'Tofu, soft', de: 'Tofu, weich', es: 'Tofu blando', fr: 'Tofu mou',
         it: 'Tofu morbido', pt: 'Tofu macio', ja: '豆腐（やわらかめ）',
         'zh-Hans': '嫩豆腐', 'zh-Hant': '嫩豆腐', ar: 'توفو طري' } },

  { id: 'cottage-cheese-3', he: 'גבינת קוטג\' 3% שומן, תנובה',
    t: { en: 'Cottage cheese, 3%', de: 'Hüttenkäse, 3%', es: 'Queso cottage, 3%',
         fr: 'Fromage cottage, 3%', it: 'Fiocchi di latte, 3%',
         pt: 'Queijo cottage, 3%', ja: 'カッテージチーズ 3%',
         'zh-Hans': '茅屋奶酪 3%', 'zh-Hant': '茅屋起司 3%',
         ar: 'جبنة قريش 3%' } },

  { id: 'goat-milk-3', he: 'חלב עזים 3.7% שומן, צוריאל',
    t: { en: 'Goat milk, 3.7%', de: 'Ziegenmilch, 3,7%', es: 'Leche de cabra, 3,7%',
         fr: 'Lait de chèvre, 3,7%', it: 'Latte di capra, 3,7%',
         pt: 'Leite de cabra, 3,7%', ja: 'ヤギミルク 3.7%', 'zh-Hans': '山羊奶 3.7%',
         'zh-Hant': '山羊奶 3.7%', ar: 'حليب ماعز 3.7%' } },

  { id: 'peanut-oil', he: 'שמן בוטנים',
    t: { en: 'Peanut oil', de: 'Erdnussöl', es: 'Aceite de cacahuete',
         fr: 'Huile d’arachide', it: 'Olio di arachidi', pt: 'Óleo de amendoim',
         ja: 'ピーナッツオイル', 'zh-Hans': '花生油', 'zh-Hant': '花生油',
         ar: 'زيت فول سوداني' } },

  { id: 'coconut-milk', he: 'חלב קוקוס, (נוזל המופק מטחינת הבשר עם מי הקוקוס)',
    t: { en: 'Coconut milk', de: 'Kokosmilch', es: 'Leche de coco',
         fr: 'Lait de coco', it: 'Latte di cocco', pt: 'Leite de coco',
         ja: 'ココナッツミルク', 'zh-Hans': '椰浆', 'zh-Hant': '椰漿',
         ar: 'حليب جوز الهند' } },

  { id: 'rice-drink', he: 'משקה אורז, אלפרו',
    t: { en: 'Rice drink', de: 'Reisdrink', es: 'Bebida de arroz',
         fr: 'Boisson au riz', it: 'Bevanda di riso', pt: 'Bebida de arroz',
         ja: 'ライスミルク', 'zh-Hans': '大米饮品', 'zh-Hant': '大米飲品',
         ar: 'مشروب أرز' } },

  { id: 'carrot-juice', he: 'מיץ גזר',
    t: { en: 'Carrot juice', de: 'Karottensaft', es: 'Zumo de zanahoria',
         fr: 'Jus de carotte', it: 'Succo di carota', pt: 'Suco de cenoura',
         ja: 'にんじんジュース', 'zh-Hans': '胡萝卜汁', 'zh-Hant': '胡蘿蔔汁',
         ar: 'عصير جزر' } },

  { id: 'apple-juice', he: 'מיץ תפוחים',
    t: { en: 'Apple juice', de: 'Apfelsaft', es: 'Zumo de manzana',
         fr: 'Jus de pomme', it: 'Succo di mela', pt: 'Suco de maçã',
         ja: 'りんごジュース', 'zh-Hans': '苹果汁', 'zh-Hant': '蘋果汁',
         ar: 'عصير تفاح' } },

  /* Ethanol carries 7 kcal a gram and appears in no macro, which is why these
     four read as zero-calorie under 4/4/9 - the clearest possible statement
     that the arithmetic was never a validity test. */
  { id: 'beer', he: 'בירה, כל הסוגים',
    t: { en: 'Beer', de: 'Bier', es: 'Cerveza', fr: 'Bière', it: 'Birra',
         pt: 'Cerveja', ja: 'ビール', 'zh-Hans': '啤酒', 'zh-Hant': '啤酒',
         ar: 'بيرة' } },

  { id: 'beer-light', he: 'בירה, קלה',
    t: { en: 'Beer, light', de: 'Bier, leicht', es: 'Cerveza light',
         fr: 'Bière légère', it: 'Birra light', pt: 'Cerveja light',
         ja: 'ライトビール', 'zh-Hans': '淡啤酒', 'zh-Hant': '淡啤酒',
         ar: 'بيرة خفيفة' } },

  { id: 'whisky', he: 'ויסקי',
    t: { en: 'Whisky (whiskey)', de: 'Whisky', es: 'Whisky', fr: 'Whisky', it: 'Whisky',
         pt: 'Uísque', ja: 'ウイスキー', 'zh-Hans': '威士忌',
         'zh-Hant': '威士忌', ar: 'ويسكي' } },

  { id: 'vodka', he: 'וודקה, ערק 40% אלכוהול, proof 80',
    t: { en: 'Vodka or arak, 40% alcohol', de: 'Wodka oder Arak, 40% Alkohol',
         es: 'Vodka o arak, 40% de alcohol', fr: 'Vodka ou arak, 40% d’alcool',
         it: 'Vodka o arak, 40% di alcol', pt: 'Vodca ou arak, 40% de álcool',
         ja: 'ウォッカ／アラック（アルコール40%）', 'zh-Hans': '伏特加／亚力酒（40%酒精）',
         'zh-Hant': '伏特加／亞力酒（40%酒精）', ar: 'فودكا أو عرق 40% كحول' } },

  { id: 'apricot-canned-juice', he: 'משמש, מבושל או משומר, במיץ',
    t: { en: 'Apricots, canned in juice', de: 'Aprikosen, Dose in Saft',
         es: 'Albaricoques en conserva, en su jugo',
         fr: 'Abricots en conserve, au jus', it: 'Albicocche in scatola, al succo',
         pt: 'Damascos em conserva, no próprio suco',
         ja: 'あんず（果汁漬け缶詰）', 'zh-Hans': '杏罐头（原汁）',
         'zh-Hant': '杏罐頭（原汁）', ar: 'مشمش معلب في عصيره' } },

  { id: 'carob', he: 'חרובים, שלמים כולל קמח',
    /* The row is USDA carob FLOUR to the decimal, and nobody weighs "carob
       whole including flour" - that was the Hebrew descriptor rendered word
       for word, which is the one thing the English is not allowed to be. */
    t: { en: 'Carob powder (ground pods)', de: 'Johannisbrotmehl (Carobpulver)',
         es: 'Algarroba en polvo', fr: 'Poudre de caroube',
         it: 'Farina di carrube', pt: 'Alfarroba em pó',
         ja: 'キャロブパウダー', 'zh-Hans': '角豆粉',
         'zh-Hant': '角豆粉', ar: 'مسحوق الخروب' } },

  { id: 'raisins-cooked', he: 'צימוקים, מבושלים',
    t: { en: 'Raisins, stewed', de: 'Rosinen, gekocht', es: 'Pasas cocidas',
         fr: 'Raisins secs cuits', it: 'Uvetta cotta', pt: 'Passas cozidas',
         ja: 'レーズン（煮たもの）', 'zh-Hans': '葡萄干（煮过）',
         'zh-Hant': '葡萄乾（煮過）', ar: 'زبيب مطبوخ' } },

  { id: 'jam-reduced-sugar', he: 'ריבה, דלת סוכר, כל הטעמים',
    t: { en: 'Jam, reduced sugar, any flavour',
         de: 'Marmelade, zuckerreduziert, alle Sorten',
         es: 'Mermelada baja en azúcar, cualquier sabor',
         fr: 'Confiture allégée en sucre, tous parfums',
         it: 'Marmellata a ridotto contenuto di zucchero, tutti i gusti',
         pt: 'Geleia com menos açúcar, qualquer sabor',
         ja: 'ジャム（砂糖控えめ・全種類）', 'zh-Hans': '低糖果酱（各种口味）',
         'zh-Hant': '低糖果醬（各種口味）', ar: 'مربى قليل السكر، بجميع النكهات' } },

];

const LANGS = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'];

const raw = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const rows = raw.foods || raw;
const byName = new Map();
for (const r of rows) byName.set(r.n, r);

const out = [];
const missing = [];
const gaps = [];
const unsourced = [];
const seen = new Set();
for (const c of CORE) {
  /* An id used twice would silently keep only one of the two foods, and the
     count at the end would still look right. */
  if (seen.has(c.id)) unsourced.push(c.id + ' is declared twice');
  seen.add(c.id);

  const src = c.src || 'moh';
  if (!SOURCES[src]) { unsourced.push(c.id + ' claims an unknown source: ' + src); continue; }

  /* moh means the numbers ARE a row of foods.json, copied. Any other source
     has to carry its own four numbers, and they are checked for being
     numbers rather than trusted - a missing macro read as undefined would
     land in the file as null and show as a blank where a measurement
     should be. */
  let k, p, cc, f;
  if (src === 'moh') {
    const r = byName.get(c.he);
    if (!r) { missing.push(c.he); continue; }
    k = r.k; p = r.p; cc = r.c; f = r.f;
  } else {
    const n = c.n || {};
    const ok = ['k', 'p', 'c', 'f'].every((x) => typeof n[x] === 'number' && isFinite(n[x]) && n[x] >= 0);
    if (!ok) { unsourced.push(c.id + ' has source ' + src + ' but no complete k/p/c/f'); continue; }
    if (!c.ref) { unsourced.push(c.id + ' has source ' + src + ' but no ref naming the entry'); continue; }
    k = n.k; p = n.p; cc = n.c; f = n.f;
  }

  for (const l of LANGS) if (!c.t[l]) gaps.push(c.id + ' has no ' + l);
  const t = Object.assign({ he: c.he }, c.t);
  /* ref travels with src. Requiring it and then dropping it left the file
     unable to answer the one question src exists for. */
  const row = { id: 'core:' + c.id, k, p, c: cc, f, t, src };
  if (c.ref) row.ref = c.ref;
  /* Words this food answers to that appear in none of its eleven names - a
     spelling variant, or a singular where the row is a construct plural.
     Searched, never shown. Deliberately NOT translations: they carry no
     meaning of their own, and putting them in `t` would put them on screen
     and into the language files. */
  if (Array.isArray(c.aka) && c.aka.length) row.aka = c.aka.slice();
  out.push(row);
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
if (unsourced.length) {
  console.error('Entries whose numbers cannot be traced:');
  for (const u of unsourced) console.error('  ' + u);
  process.exit(1);
}

fs.writeFileSync(OUT, JSON.stringify({ foods: out }, null, 1) + '\n');
console.log(out.length + ' generic foods, ' + (LANGS.length + 1) + ' languages each -> ' + OUT);
const bySrc = {};
for (const o of out) bySrc[o.src] = (bySrc[o.src] || 0) + 1;
for (const [s, n] of Object.entries(bySrc)) console.log('  ' + n + ' from ' + SOURCES[s]);
console.log('every value traced to a named source; nothing invented');
