// node tools/patches/guide-all.mjs <index.html> <rings.json> [--undo] - Asaf, 20 Nov: "the step-by-step 'how it's done' I liked is
//   missing on every exercise". The guided card (a step at a time, the loop stopped on that step's moment, a ring on what it is
//   about) existed for 16. Now it is the card for EVERY exercise that has steps: its rings come from rings.json (measured on the
//   frames by tools/sheets/guide-sheet.mjs, 4 per exercise), and an exercise still without a measurement gets the same card with
//   its loop running and no ring - never a ring guessed onto the wrong thing. The video is the one the exercise actually plays
//   (exDemoId), so a borrowed loop is guided too. --undo restores the file byte for byte.
import fs from 'node:fs';
const [F, RJ] = process.argv.slice(2), undo = process.argv.includes('--undo');
const R = JSON.parse(fs.readFileSync(RJ, 'utf8'));
const ids = Object.keys(R).sort((a, b) => +a.slice(1) - +b.slice(1));
const rows = ids.map((id) => `  ${id}:${JSON.stringify(R[id])}`).join(',\n');
const E = [
  [`  x229:[[.1,42,37,30],[1.5,66,68,34],[2.3,55,65,50],[3,67,80,26]]
};`,
   `  x229:[[.1,42,37,30],[1.5,66,68,34],[2.3,55,65,50],[3,67,80,26]],
  /* 20 Nov: the rest of the library, measured on the frames (tools/sheets/guide-sheet.mjs) */
${rows}
};`],
  [`  var g=EX_GUIDE[e.id],n=g.length,h,j,dots='';
  h='<div class="xg" data-i="0"><div class="xd-demo"><video src="'+liveBase()+'assets/exdemo/'+e.id+'.mp4'+(EX_DEMO[e.id]>1?'?v='+EX_DEMO[e.id]:'')+'"`,
   `  /* rings only where they were measured for exactly these steps; otherwise the same card, the loop running, no ring */
  var g0=EX_GUIDE[e.id],g=(g0&&g0.length===how.s.length)?g0:null,n=how.s.length,h,j,dots='',vid=exDemoId(e);
  h='<div class="xg" data-i="0"><div class="xd-demo"><video src="'+liveBase()+'assets/exdemo/'+vid+'.mp4'+(EX_DEMO[vid]>1?'?v='+EX_DEMO[vid]:'')+'"`],
  [`    h+='<div class="xg-p" data-g="'+g[j].join(',')+'"'+(j?' hidden':'')+'>`,
   `    h+='<div class="xg-p"'+(g?' data-g="'+g[j].join(',')+'"':'')+(j?' hidden':'')+'>`],
  [`  if(how&&how.s&&EX_GUIDE[e.id]&&how.s.length===EX_GUIDE[e.id].length)return exGuideHTML(e,how);`,
   `  if(how&&how.s&&how.s.length)return exGuideHTML(e,how);`],
];
let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(a.slice(0, 70))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : `applied: ${ids.length} measured exercises added to the 16`);
