/* The month gets the day's writing bar (Asaf, 27 Oct: "no reason for the +
 * here either"). The "+ / write with the plus" strip above the grid is gone;
 * the same bar sits at the foot of the screen, writes to the waiting tasks,
 * and they wait in a row above it to be dragged onto a day. ☆ shows the
 * saved recurring ones there instead. Dragging a task back onto the row
 * takes it off the month (which used to look for a #mo-pool that no longer
 * existed). */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* the strip above the grid goes (its selection bar stays) */
rep(`  } else {
    var pool=loadPool().tasks;
    h+=planAddBarHTML({k:'pl',pool:pool,pick:'moPick',`,
`  } else if(false){
    var pool=loadPool().tasks;
    h+=planAddBarHTML({k:'pl',pool:pool,pick:'moPick',`);

/* the bar knows which view it serves */
rep(`  if(typeof planView==='function'?planView()!=='day':!planSecsGet().day)return;
  var loose=[],all=dpAll(_dpDate),i,lib=loadTaskLib();
  for(i=0;i<all.length;i++)if(all[i].hour===null)loose.push(all[i]);`,
`  var _mo=typeof planView==='function'&&planView()==='month';
  if(!_mo&&(typeof planView==='function'?planView()!=='day':!planSecsGet().day))return;
  var loose=[],all=_mo?[]:dpAll(_dpDate),i,lib=loadTaskLib();
  if(_mo)loose=loadPool().tasks.slice();
  else for(i=0;i<all.length;i++)if(all[i].hour===null)loose.push(all[i]);`);
rep(`     '<input id="dp-rail-in" placeholder="'+esc(_t('מה להכניס ליום הזה?'))+'"`,
  `     '<input id="dp-rail-in" placeholder="'+esc(_mo?_t('מה להכניס לחודש?'):_t('מה להכניס ליום הזה?'))+'"`);
rep(`  var rail=document.getElementById('dp-rail');
  rail.removeEventListener('pointerdown',dpDown);
  rail.addEventListener('pointerdown',dpDown);
}`,
`  var rail=document.getElementById('dp-rail');
  rail.removeEventListener('pointerdown',dpDown);rail.removeEventListener('pointerdown',moDown);
  rail.addEventListener('pointerdown',_mo?moDown:dpDown);
  rail.classList.toggle('mo',_mo);
}`);
/* writing in the month's bar adds to the waiting tasks */
rep(`function dpRailAdd(){
  var el=document.getElementById('dp-rail-in');
  if(!el||!el.value.trim())return;`,
`function dpRailAdd(){
  var el=document.getElementById('dp-rail-in');
  if(!el||!el.value.trim())return;
  if(typeof planView==='function'&&planView()==='month'){
    var p=loadPool();
    p.tasks.push({id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),w:el.value.trim(),c:_wkNewColor||'lav'});
    savePool(p);el.value='';_dpRailText='';renderPlanning();
    setTimeout(function(){var e=document.getElementById('dp-rail-in');if(e)e.focus();},40);
    return;
  }`);
/* the month's drag starts from the bar too, and the row is its pool */
rep(`  if(e.target.closest&&!e.target.closest('#plan-sec-month'))return;   // not this panel's drag`,
  `  if(e.target.closest&&!e.target.closest('#plan-sec-month,#dp-rail'))return;   // not this panel's drag`);
rep(`function moOverPool(x,y){
  var p=document.getElementById('mo-pool');`, `function moOverPool(x,y){
  var p=document.getElementById('dp-rail')||document.getElementById('mo-pool');`);
/* the bar is drawn whichever view is open */
rep(`  if(o.day){planWeekStripInit();dpRail();dpNowLine();dpNowStart();dpLayout();}`,
  `  if(o.day){planWeekStripInit();dpRail();dpNowLine();dpNowStart();dpLayout();}
  else if(o.month)dpRail();`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
