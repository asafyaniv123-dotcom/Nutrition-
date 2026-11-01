/* The coach's meal-total line, in every shipped language (1 Nov). {v} is the
   list of figures the app joins with ' · ' from keys every language already has. */
import fs from 'fs';
const K = 'סה״כ הארוחה: {v}';
const V = {
  en: 'Meal total: {v}', de: 'Mahlzeit gesamt: {v}', fr: 'Total du repas : {v}', it: 'Totale del pasto: {v}',
  es: 'Total de la comida: {v}', pt: 'Total da refeição: {v}', ar: 'مجموع الوجبة: {v}',
  ja: '食事の合計：{v}', 'zh-Hans': '本餐合计：{v}', 'zh-Hant': '本餐合計：{v}',
};
for (const [l, v] of Object.entries(V)) {
  const f = `data/lang/${l}.json`, d = JSON.parse(fs.readFileSync(f, 'utf8'));
  d[K] = v;
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('answered in ' + Object.keys(V).length + ' languages');
