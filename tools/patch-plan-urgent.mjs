/* The four planning bugs that lose or delete tasks (audit, 27 Oct), fixed
 * now while the planning rebuild is drafted:
 *  #2 a 12px wobble on a rail chip deleted it: the trash opens under the
 *     finger. It now arms only once the finger has travelled 36px.
 *  #3 a quick stretch also flipped to the next week or month: a swipe never
 *     starts on a stretch bead, and never ends while a stretch is running.
 *  #4 a TAP on a day item's bead turned it into a week task: it is promoted
 *     on the first move that actually makes it longer.
 *  #7 moving a timed week task to another day dropped its hour: the hour,
 *     minutes, end, note and reminder move with it. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* #2 */
rep(`  // over the strip is a delete no matter how the finger travelled there
  d.overT=overTrash(e);`,
`  /* not before the finger has really gone somewhere: the trash opens at the
     edge the day rail sits on, under a finger that has barely moved */
  var tx=e.clientX-d.sx,ty=e.clientY-d.sy;
  if(tx*tx+ty*ty<36*36){d.overT=false;return false;}
  // over the strip is a delete no matter how the finger travelled there
  d.overT=overTrash(e);`);

/* #3 */
rep(`  if(t.closest&&(t.closest('[data-task]')||t.closest('[data-lib]')||`,
  `  if(t.closest&&(t.closest('[data-task]')||t.closest('[data-lib]')||t.closest('[data-stretch]')||t.closest('[data-mostretch]')||`);
rep(`  if(!s||_dpDrag||!onDayScreen())return;
  var dx=e.clientX-s.x, dy=e.clientY-s.y;`,
`  if(!s||_dpDrag||!onDayScreen())return;
  if((typeof _wkDrag!=='undefined'&&_wkDrag)||(typeof _moStretch!=='undefined'&&_moStretch))return;
  var dx=e.clientX-s.x, dy=e.clientY-s.y;`);

/* #4 - week */
rep(`    if(gh.getAttribute('data-stday'))dpPromote(gh.getAttribute('data-stday'),gh.getAttribute('data-stretch'));
    var sid=gh.getAttribute('data-stretch'),wk=loadWeek(_wkSun),st=null,q;
    for(q=0;q<wk.tasks.length;q++)if(wk.tasks[q].id===sid)st=wk.tasks[q];
    if(!st||!st.d)return;
    var c0=wkColIndex(st.d);
    if(c0<0)return;
    _wkDrag={mode:'stretch',id:sid,c0:c0,len:wkLenOf(st)};`,
`    var sid=gh.getAttribute('data-stretch'),wk=loadWeek(_wkSun),st=null,q,pd=gh.getAttribute('data-stday')||'';
    for(q=0;q<wk.tasks.length;q++)if(wk.tasks[q].id===sid)st=wk.tasks[q];
    /* a day item becomes a week task only once it really grows (dpPromote) */
    if(!st&&pd)st={d:pd};
    if(!st||!st.d)return;
    var c0=wkColIndex(st.d);
    if(c0<0)return;
    _wkDrag={mode:'stretch',id:sid,c0:c0,len:st.id?wkLenOf(st):1,promote:st.id?'':pd};`);
rep(`    var L=Math.min(ci-_wkDrag.c0+1,7-_wkDrag.c0,WK_MAX_LEN);
    if(L!==_wkDrag.len&&wkStretchTo(_wkDrag.id,L))_wkDrag.len=L;`,
`    var L=Math.min(ci-_wkDrag.c0+1,7-_wkDrag.c0,WK_MAX_LEN);
    if(L>1&&_wkDrag.promote){dpPromote(_wkDrag.promote,_wkDrag.id);_wkDrag.promote='';}
    if(!_wkDrag.promote&&L!==_wkDrag.len&&wkStretchTo(_wkDrag.id,L))_wkDrag.len=L;`);
/* #4 - month */
rep(`    if(gh.getAttribute('data-moday'))dpPromote(sd,gh.getAttribute('data-mostretch'));
    _moStretch={id:gh.getAttribute('data-mostretch'),sun:sn,start:sd,`,
  `    _moStretch={id:gh.getAttribute('data-mostretch'),sun:sn,start:sd,promote:gh.getAttribute('data-moday')?sd:'',`);
rep(`    var max=WK_MAX_LEN-1;
    if(diff>max)diff=max;
    moStretchTo(_moStretch.sun,_moStretch.id,diff+1);`,
`    var max=WK_MAX_LEN-1;
    if(diff>max)diff=max;
    if(diff>0&&_moStretch.promote){dpPromote(_moStretch.promote,_moStretch.id);_moStretch.promote='';}
    if(!_moStretch.promote)moStretchTo(_moStretch.sun,_moStretch.id,diff+1);`);

/* #7 */
rep(`  var wk=loadWeek(_wkSun),i;
  for(i=0;i<wk.tasks.length;i++)if(wk.tasks[i].id===id){wk.tasks[i].d=date||'';wk.tasks[i].s=date?(slot||'m'):'';}
  saveWeek(_wkSun,wk);renderPlanWeek();
}`,
`  var wk=loadWeek(_wkSun),i,from='';
  for(i=0;i<wk.tasks.length;i++)if(wk.tasks[i].id===id){from=wk.tasks[i].d||'';wk.tasks[i].d=date||'';wk.tasks[i].s=date?(slot||'m'):'';}
  saveWeek(_wkSun,wk);
  if(from&&date&&from!==date)dpCarry(from,date,id);
  renderPlanWeek();
}
/* what a week task keeps on its day - hour, minutes, end, note, reminder -
   goes with it when it moves to another day */
function dpCarry(from,to,id){
  var a=loadDPlan(from),b=loadDPlan(to),ch=false;
  ['hours','mins','ends','notes','rem'].forEach(function(k){
    if(a[k]&&a[k][id]!==undefined){b[k]=b[k]||{};b[k][id]=a[k][id];delete a[k][id];ch=true;}
  });
  if(ch){saveDPlan(from,a);saveDPlan(to,b);}
}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
