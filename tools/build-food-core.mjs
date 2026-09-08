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
         fr: 'Cottage, 5%', it: 'Fiocchi di latte, 5%', pt: 'Queijo cottage, 5%',
         ja: 'カッテージチーズ 5%', 'zh-Hans': '白软干酪 5%', 'zh-Hant': '白軟乾酪 5%',
         ar: 'جبنة قريش 5%' } },

  { id: 'yellow-cheese-5', he: 'גבינה צהובה 5% שומן, עמק',
    t: { en: 'Yellow cheese, 5%', de: 'Schnittkäse, 5%', es: 'Queso curado, 5%',
         fr: 'Fromage à pâte pressée, 5%', it: 'Formaggio stagionato, 5%',
         pt: 'Queijo amarelo, 5%', ja: 'イエローチーズ 5%', 'zh-Hans': '黄奶酪 5%',
         'zh-Hant': '黃乳酪 5%', ar: 'جبنة صفراء 5%' } },

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
         'zh-Hant': '黃瓜（帶皮）', ar: 'خيار بالقشر' } },

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
         ja: '練りごま（希釈なし）', 'zh-Hans': '芝麻酱（未稀释）',
         'zh-Hant': '芝麻醬（未稀釋）', ar: 'طحينة خام غير مخففة' } },

  { id: 'oats',         he: 'שיבולת שועל, קוואקר, רגיל ואינסטנט, לא מבושל',
    t: { en: 'Oats, uncooked', de: 'Haferflocken, ungekocht', es: 'Avena, cruda',
         fr: 'Flocons d’avoine, crus', it: 'Fiocchi d’avena, crudi',
         pt: 'Aveia, crua', ja: 'オートミール（未調理）', 'zh-Hans': '燕麦片（未煮）',
         'zh-Hant': '燕麥片（未煮）', ar: 'شوفان غير مطبوخ' } },

  { id: 'pita',         he: 'פיתה, קלויה',
    t: { en: 'Pita bread', de: 'Pita-Brot', es: 'Pan de pita', fr: 'Pain pita',
         it: 'Pane pita', pt: 'Pão pita', ja: 'ピタパン', 'zh-Hans': '皮塔饼',
         'zh-Hant': '皮塔餅', ar: 'خبز بيتا' } },

  { id: 'lentils-dry',  he: 'עדשים יבשים',
    t: { en: 'Lentils, dry', de: 'Linsen, trocken', es: 'Lentejas, secas',
         fr: 'Lentilles, sèches', it: 'Lenticchie, secche', pt: 'Lentilhas, secas',
         ja: 'レンズ豆（乾燥）', 'zh-Hans': '扁豆（干）', 'zh-Hant': '扁豆（乾）',
         ar: 'عدس جاف' } },

  { id: 'chickpeas-dry', he: 'חומוס יבש',
    t: { en: 'Chickpeas, dry', de: 'Kichererbsen, trocken', es: 'Garbanzos, secos',
         fr: 'Pois chiches, secs', it: 'Ceci, secchi', pt: 'Grão-de-bico, seco',
         ja: 'ひよこ豆（乾燥）', 'zh-Hans': '鹰嘴豆（干）', 'zh-Hant': '鷹嘴豆（乾）',
         ar: 'حمص جاف' } },
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
