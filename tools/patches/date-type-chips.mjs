// node tools/patches/date-type-chips.mjs <index.html> [--undo] - the 20 Nov crawl, the same shape as the relationship chips: on a
//   person's edit form the important-date type chips (birthday, anniversary...) never lit the one chosen, and birthday - what
//   is saved when nothing is tapped - was not lit either, so the form never said which type a date would be filed under.
//   The default is lit from the start and the light follows the tap. --undo restores the file byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const E = [
  [`    h+='<button class="pp-chip" onclick="epDateType(\\''+dtypes[dti][0]+'\\')">'+_t(dtypes[dti][1])+'</button>';`,
   `    h+='<button type="button" class="pp-chip'+(dtypes[dti][0]==='birthday'?' on':'')+'" onclick="epDateType(\\''+dtypes[dti][0]+'\\',this)">'+_t(dtypes[dti][1])+'</button>';`],
  [`function epDateType(id){
  var i,d=document.getElementById('ep-dtype'),t=document.getElementById('ep-date-title');
  if(d)d.value=id;`,
   `function epDateType(id,b){
  var i,d=document.getElementById('ep-dtype'),t=document.getElementById('ep-date-title');
  if(d)d.value=id;
  if(b)[].forEach.call(b.parentNode.querySelectorAll('.pp-chip'),function(x){x.classList.toggle('on',x===b);});`],
];
let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(a.slice(0, 60))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
