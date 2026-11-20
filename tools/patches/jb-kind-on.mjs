// node tools/patches/jb-kind-on.mjs <index.html> [--undo] - the 20 Nov crawl: in the new-notebook sheet the kind chips (gratitude,
//   dreams, ideas...) answered a tap only by changing the name box's grey placeholder - no chip ever looked chosen, so the
//   sheet never said which kind the notebook would be. The tapped chip is pressed, in the same inset the paper buttons
//   beside it already use for chosen. --undo restores the file byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const E = [
  [`  box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.jrnl-nav{`,
   `  box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.jb-kinds button.on{color:var(--nu-ink);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.jrnl-nav{`],
  [`  for(i=0;i<JB_KINDS.length;i++)h+='<button onclick="_jbEd.kind=\\''+JB_KINDS[i]+'\\';document.getElementById(`,
   `  for(i=0;i<JB_KINDS.length;i++)h+='<button type="button" onclick="_jbEd.kind=\\''+JB_KINDS[i]+'\\';[].forEach.call(this.parentNode.children,function(x){x.classList.toggle(\\'on\\',x===this)},this);document.getElementById(`],
];
let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(a.slice(0, 60))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
