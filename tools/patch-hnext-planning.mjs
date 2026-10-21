/* The "next on the schedule" card under the dial belongs to תכנון זמן. Someone
 * who took planning off the dial was still shown "אין עדיין שעות ליום הזה"
 * every day - a reminder of an area they said they do not keep (Asaf, 21 Oct). */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const a = `  if(HOME_LAYOUT==='fan'){el.innerHTML=hnextHTML();return;}`;
if (s.split(a).length !== 2) { console.log('anchor'); process.exit(1); }
s = s.replace(a, `  /* only for someone who keeps a schedule: the card is planning's, and an
     area taken off the dial should not keep speaking from under it */
  if(HOME_LAYOUT==='fan'){el.innerHTML=areaShown('planning')?hnextHTML():'';return;}`.replace(/\n/g, EOL));
fs.writeFileSync(F, s); console.log('patched');
/* and turning planning on or off repaints it at once, not on the next visit */
{ let t = fs.readFileSync(F, 'utf8');
  const b = `  renderHomeGrid();renderAreasList();`;
  if (t.split(b).length !== 2) { console.log('anchor2'); process.exit(1); }
  t = t.replace(b, `  renderHomeGrid();renderAreasList();try{renderHomeToday();}catch(e){}`);
  fs.writeFileSync(F, t); console.log('patched toggle'); }
/* the schedule's dots on the ring are planning's too */
{ let t = fs.readFileSync(F, 'utf8');
  const c = `  var all=dpAll(todayStr());\n  for(i=0;i<all.length;i++){\n    t=all[i];if(t.hour===null)continue;\n    m=hDayMin(t.hour,t.min);c=wkColor(t.c);p=pt(dialHourAng(m));`;
  const C = t.includes(c) ? c : c.replace(/\n/g, '\r\n');
  if (t.split(C).length !== 2) { console.log('anchor3'); process.exit(1); }
  t = t.replace(C, C.replace('  var all=dpAll(todayStr());', "  /* the schedule's dots, for someone who keeps a schedule */\n  var all=areaShown('planning')?dpAll(todayStr()):[];".replace(/\n/g, C.includes('\r') ? '\r\n' : '\n')));
  fs.writeFileSync(F, t); console.log('patched dots'); }
