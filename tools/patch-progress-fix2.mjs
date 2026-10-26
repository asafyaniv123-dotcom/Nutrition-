/* two found by walking it: the mood sky was hidden by the app's own `.sky`
 * rule (the home screen hides an element of that name), so it is .prg-sky;
 * the water glasses' labels carried the unit and ran into each other - the
 * glasses say litres, the unit once in the sentence below. */
import fs from 'fs';
const R = [
  [`.prg .sky{`, `.prg .prg-sky{`], [`.prg .sky svg{`, `.prg .prg-sky svg{`],
  [`var h='<div class="sky">'+s+'</div>`, `var h='<div class="prg-sky">'+s+'</div>`],
  [`'<span class="tg'+(lit?' lit':'')+'">'+fmtVolume(v)+'</span><span class="lb">'+prgDay(j-6)+'</span></div>';});`,
   `'<span class="tg'+(lit?' lit':'')+'">'+nfmt(v/1000,{minimumFractionDigits:1,maximumFractionDigits:1})+'</span><span class="lb">'+prgDay(j-6)+'</span></div>';});`],
  [`sub:_t('כוס מלאה = {v}',{v:fmtVolume(tg)})});`, `sub:_t('בליטרים · כוס מלאה = {v}',{v:fmtVolume(tg)})});`],
];
for (const F of ['tools/prg.js', 'tools/prg.css', 'dev/index.html']) {
  let s = fs.readFileSync(F, 'utf8'), n = 0;
  for (const [a, b] of R) if (s.includes(a)) { s = s.split(a).join(b); n++; }
  fs.writeFileSync(F, s); console.log(F, n);
}
const L = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'];
const V = ['In litres · a full glass = {v}', 'In Litern · ein volles Glas = {v}', 'En litros · un vaso lleno = {v}', 'En litres · un verre plein = {v}', 'In litri · un bicchiere pieno = {v}', 'Em litros · um copo cheio = {v}', 'リットル表示・満杯 = {v}', '单位为升 · 满杯 = {v}', '單位為公升 · 滿杯 = {v}', 'باللتر · الكوب الممتلئ = {v}'];
L.forEach((l, i) => { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8')); delete d['כוס מלאה = {v}']; d['בליטרים · כוס מלאה = {v}'] = V[i]; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); });
