/* Your health: a protein target that fits the condition, OFFERED, never set
 * (Asaf, 25 Oct: "yes, add it"). Kidney disease: at most 0.8 g per kg;
 * sarcopenia: at least 1.2 g per kg. When the current target is outside that
 * line by more than 5 g, the health screen says so and offers one tap to
 * change it; the calories stay where they were, the carbohydrates take up the
 * difference (4 kcal a gram either way). Nothing changes without the tap. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`/* what the coach is told: nothing without the second yes */`, `/* the protein line a condition draws, if any: {to, why} */
function hlProtein(){
  var kg=fitBodyKg(),p=Math.round(TARGETS.p||0);
  if(!kg||!p)return null;
  if(hlHas('ckd')){var mx=Math.round(kg*0.8);if(p>mx+5)return {to:mx,why:_t('במחלת כליות מומלץ לא יותר מ־0.8 גרם חלבון לק״ג.')};}
  else if(hlHas('sarc')){var mn=Math.round(kg*1.2);if(p<mn-5)return {to:mn,why:_t('בסרקופניה מומלץ לפחות 1.2 גרם חלבון לק״ג, ובכל ארוחה.')};}
  return null;
}
function hlProteinHTML(){
  var r=hlProtein();if(!r)return '';
  return '<div class="hl-card hl-pro"><b>'+_t('יעד החלבון שלך')+'</b>'+
    '<p>'+esc(_t('היעד עכשיו: {a} גרם ביום.',{a:Math.round(TARGETS.p)}))+' '+esc(r.why)+'</p>'+
    '<button class="hl-pb" onclick="hlProteinApply('+r.to+')">'+esc(_t('לעדכן ל־{n} גרם',{n:r.to}))+'</button>'+
    '<div class="hl-src">'+_t('הקלוריות נשארות, והפחמימות משלימות את ההפרש. אפשר לשנות כל יעד ידנית.')+'</div></div>';
}
function hlProteinApply(to){
  var t={kcal:TARGETS.kcal,p:TARGETS.p,c:TARGETS.c,f:TARGETS.f,water:TARGETS.water},d=to-t.p;
  t.p=to;t.c=Math.max(0,Math.round(t.c-d));
  try{localStorage.setItem(TARGETS_KEY,JSON.stringify(t));}catch(e){}
  loadTargets();showToast(_t('היעדים עודכנו'));hlPaint();
}
/* what the coach is told: nothing without the second yes */`);
rep(`  h+='<div class="hl-doc">'+_t('מידע כללי ולא ייעוץ רפואי. האפליקציה לא מאבחנת ולא מחליפה רופא, והרופא שלך הוא זה שקובע.')+'</div></div>';`,
    `  h+=hlProteinHTML();
  h+='<div class="hl-doc">'+_t('מידע כללי ולא ייעוץ רפואי. האפליקציה לא מאבחנת ולא מחליפה רופא, והרופא שלך הוא זה שקובע.')+'</div></div>';`);
rep(`.hl-doc{`, `.hl-pro p{font-size:13.5px;line-height:1.6;margin:6px 0 10px}
.hl-pb{width:100%;border:none;border-radius:14px;padding:12px;font-family:inherit;font-size:14.5px;font-weight:800;color:var(--nu-ink);cursor:pointer;background:var(--nu-ground);
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
.hl-pb:active{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.hl-doc{`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
const K = ['במחלת כליות מומלץ לא יותר מ־0.8 גרם חלבון לק״ג.', 'בסרקופניה מומלץ לפחות 1.2 גרם חלבון לק״ג, ובכל ארוחה.', 'יעד החלבון שלך', 'היעד עכשיו: {a} גרם ביום.', 'לעדכן ל־{n} גרם', 'הקלוריות נשארות, והפחמימות משלימות את ההפרש. אפשר לשנות כל יעד ידנית.'];
const A = {
  en: ['With kidney disease, no more than 0.8 g of protein per kg is recommended.', 'With sarcopenia, at least 1.2 g of protein per kg is recommended, spread across meals.', 'Your protein target', 'Your target now: {a} g a day.', 'Update to {n} g', 'Calories stay the same and carbs make up the difference. You can change any target by hand.'],
  de: ['Bei Nierenerkrankung werden höchstens 0,8 g Protein pro kg empfohlen.', 'Bei Sarkopenie werden mindestens 1,2 g Protein pro kg empfohlen, verteilt auf die Mahlzeiten.', 'Dein Proteinziel', 'Dein Ziel jetzt: {a} g pro Tag.', 'Auf {n} g ändern', 'Die Kalorien bleiben gleich, die Kohlenhydrate gleichen den Unterschied aus. Jedes Ziel lässt sich von Hand ändern.'],
  es: ['Con enfermedad renal se recomienda no más de 0,8 g de proteína por kg.', 'Con sarcopenia se recomienda al menos 1,2 g de proteína por kg, repartida en las comidas.', 'Tu objetivo de proteína', 'Tu objetivo ahora: {a} g al día.', 'Cambiar a {n} g', 'Las calorías no cambian y los carbohidratos compensan la diferencia. Puedes cambiar cualquier objetivo a mano.'],
  fr: ['En cas de maladie rénale, il est recommandé de ne pas dépasser 0,8 g de protéines par kg.', 'En cas de sarcopénie, il est recommandé d’au moins 1,2 g de protéines par kg, réparties sur les repas.', 'Ton objectif de protéines', 'Ton objectif actuel : {a} g par jour.', 'Passer à {n} g', 'Les calories restent les mêmes, les glucides compensent la différence. Tu peux modifier chaque objectif à la main.'],
  it: ['Con malattia renale si consiglia non più di 0,8 g di proteine per kg.', 'Con sarcopenia si consiglia almeno 1,2 g di proteine per kg, distribuite nei pasti.', 'Il tuo obiettivo di proteine', 'Il tuo obiettivo ora: {a} g al giorno.', 'Aggiorna a {n} g', 'Le calorie restano uguali e i carboidrati compensano la differenza. Puoi cambiare ogni obiettivo a mano.'],
  pt: ['Com doença renal, recomenda-se no máximo 0,8 g de proteína por kg.', 'Com sarcopenia, recomenda-se pelo menos 1,2 g de proteína por kg, distribuída nas refeições.', 'Sua meta de proteína', 'Sua meta agora: {a} g por dia.', 'Atualizar para {n} g', 'As calorias continuam iguais e os carboidratos compensam a diferença. Você pode mudar qualquer meta manualmente.'],
  ja: ['腎臓病では、たんぱく質は体重1kgあたり0.8g以下が推奨されています。', 'サルコペニアでは、たんぱく質を体重1kgあたり1.2g以上、毎食に分けてとることが推奨されています。', 'たんぱく質の目標', '今の目標：1日{a}g。', '{n}gに変更', 'カロリーはそのままで、差は炭水化物で調整します。どの目標も手動で変えられます。'],
  'zh-Hans': ['肾病患者建议每公斤体重蛋白质不超过 0.8 克。', '肌少症建议每公斤体重至少 1.2 克蛋白质，并分配到各餐。', '你的蛋白质目标', '当前目标：每天 {a} 克。', '改为 {n} 克', '热量保持不变，差额由碳水补足。任何目标都可以手动修改。'],
  'zh-Hant': ['腎臟病患者建議每公斤體重蛋白質不超過 0.8 克。', '肌少症建議每公斤體重至少 1.2 克蛋白質，並分配到各餐。', '你的蛋白質目標', '目前目標：每天 {a} 克。', '改為 {n} 克', '熱量保持不變，差額由碳水補足。任何目標都可以手動修改。'],
  ar: ['مع مرض الكلى يُنصح بألا يزيد البروتين عن 0.8 غرام لكل كغ.', 'مع الساركوبينيا يُنصح بما لا يقل عن 1.2 غرام بروتين لكل كغ، موزعة على الوجبات.', 'هدف البروتين لديك', 'هدفك الآن: {a} غرام يوميًا.', 'تحديث إلى {n} غرام', 'تبقى السعرات كما هي، وتعوّض الكربوهيدرات الفرق. يمكنك تغيير أي هدف يدويًا.'],
};
for (const [l, v] of Object.entries(A)) { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8')); K.forEach((k, i) => { d[k] = v[i]; }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); }
const add = (f, m) => { const d = JSON.parse(fs.readFileSync(f, 'utf8')); Object.assign(d, m); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); };
add('data/he-x.json', { 'יעד החלבון שלך': 'יעד החלבון שלכם' });
console.log('ok');
