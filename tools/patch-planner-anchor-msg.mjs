/* The model still added travel to work in about half the runs; said in the
 * person's own message - "the anchors, as they are, travel included" - it
 * kept them as they are in 3 runs of 4 (from 2 of 4). */
import fs from 'fs';
const A = 'טווח: {h}. העוגנים הקבועים: {list}.', B = 'טווח: {h}. העוגנים הקבועים, כמו שהם וכולל הדרך: {list}.';
for (const F of ['dev/index.html', 'tools/patch-planner-flow.mjs', 'tools/patch-planner-light.mjs', 'tools/lang-planner-anchors.mjs']) {
  const s = fs.readFileSync(F, 'utf8'); if (!s.includes(A)) { console.log('miss ' + F); continue; } fs.writeFileSync(F, s.split(A).join(B));
}
const T = { en: 'Range: {h}. Fixed anchors, as they are and travel included: {list}.', de: 'Zeitraum: {h}. Feste Punkte, so wie sie sind, Weg inklusive: {list}.',
  es: 'Periodo: {h}. Lo fijo, tal cual y con el trayecto incluido: {list}.', fr: 'Période : {h}. Points fixes, tels quels, trajet compris : {list}.',
  it: 'Periodo: {h}. Punti fissi, così come sono, viaggio incluso: {list}.', pt: 'Período: {h}. Compromissos fixos, como estão e com o trajeto incluído: {list}.',
  ja: '期間：{h}。固定の予定（そのまま、移動込み）：{list}。', 'zh-Hans': '范围：{h}。固定安排（保持原样，已含路程）：{list}。',
  'zh-Hant': '範圍：{h}。固定安排（保持原樣，已含路程）：{list}。', ar: 'المدة: {h}. الثوابت كما هي، بما فيها الطريق: {list}.' };
for (const l of Object.keys(T)) { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8')); delete d[A]; d[B] = T[l]; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); }
console.log('ok');
