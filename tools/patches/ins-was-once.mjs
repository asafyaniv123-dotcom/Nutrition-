/* "Changed my mind?" only when she comes back to a topic (Asaf, 27 Nov 2026):
 * a first answer has no earlier view to have changed from, so there the box is
 * noise beside the question. It shows once the topic already holds an entry -
 * or when a draft is holding something in it, so nothing written is hidden.
 * The draft and save code already read the two fields null-safe.
 *   node tools/patches/ins-was-once.mjs [file]            apply
 *   node tools/patches/ins-was-once.mjs [file] --reverse  undo */
import fs from 'fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  [String.raw`  h+='<div class="ins-was">';
  h+='<div class="ins-was-h">'+_t('שיניתי דעה? (אופציונלי)')+'</div>';
  h+='<div class="ins-lbl">'+_t('פעם חשבתי:')+'</div>';
  h+='<input id="ins-changed-from" class="ins-in" value="'+esc(draft.from||'')+'" placeholder="'+_t("מה היתה הדעה הקודמת...")+'">';
  h+='<div class="ins-lbl">'+_t('מה שינה את דעתי:')+'</div>';
  h+='<input id="ins-changed-why" class="ins-in" value="'+esc(draft.why||'')+'" placeholder="'+_t("מה קרה, מה שכנע אותך...")+'">';
  h+='</div>';`,
   String.raw`  /* "changed my mind?" only on a topic she has written on before */
  if((loadInsights()[insKey(_insCat,_insQ)]||[]).length||draft.from||draft.why){
  h+='<div class="ins-was">';
  h+='<div class="ins-was-h">'+_t('שיניתי דעה? (אופציונלי)')+'</div>';
  h+='<div class="ins-lbl">'+_t('פעם חשבתי:')+'</div>';
  h+='<input id="ins-changed-from" class="ins-in" value="'+esc(draft.from||'')+'" placeholder="'+_t("מה היתה הדעה הקודמת...")+'">';
  h+='<div class="ins-lbl">'+_t('מה שינה את דעתי:')+'</div>';
  h+='<input id="ins-changed-why" class="ins-in" value="'+esc(draft.why||'')+'" placeholder="'+_t("מה קרה, מה שכנע אותך...")+'">';
  h+='</div>';
  }`],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 200)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
