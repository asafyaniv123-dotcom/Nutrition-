const S = 'tools/audit-plan/shots/';
const tomorrow = '2026-10-28';
export default [
  { name: 'setup', js: `__setup({week:true,month:false,day:false}); __fakeSchedule([{action:'add',text:'מדיטציה',repeat:'weekly',days:[3],start:'09:00',end:'10:00'}]); 'ok'`, wait: 500 },
  { name: 'type weekly sentence + Enter', js: `__type('#psay-in','כל רביעי 9–10 מדיטציה',true); 'typed'`, wait: 700, shot: S + '02-say-card.png' },
  { name: 'press add', js: `__tap(__findText('#psay-out button','הוסף')); JSON.stringify({dp28:__dp('${tomorrow}'), series: psSeriesLoad().length, undo:_planUndo.length})`, wait: 500, shot: S + '02-say-done.png' },
  { name: 'week grid after', js: `(async()=>{await __into('.wk-table'); return JSON.stringify({blk:[...document.querySelectorAll('.wk-blk')].map(b=>b.closest('.wk-cell').dataset.date+' '+b.textContent)})})()`, wait: 300, shot: S + '02-say-week.png' },
  { name: 'one-off meeting tomorrow 14:00', js: `__fakeSchedule([{action:'add',text:'פגישה',repeat:'none',date:'${tomorrow}',start:'14:00'}]); window.scrollTo(0,0); __tap(__findText('#psay-out button','סגור')); __type('#psay-in','פגישה מחר ב-14:00',true); 'ok'`, wait: 700, shot: S + '02-say-meet-card.png' },
  { name: 'add meeting', js: `__tap(__findText('#psay-out button','הוסף')); JSON.stringify(__dp('${tomorrow}'))`, wait: 400 },
  /* a week task placed from the strip, then try to remove it by words */
  { name: 'open + strip composer', js: `window.scrollTo(0,0); __tap('.pl-add'); !!document.getElementById('pl-in')`, wait: 400 },
  { name: 'type in strip and +', js: `__type('#pl-in','לקנות מתנה'); __tap('.pl-go'); JSON.stringify(__state())`, wait: 400, shot: S + '02-strip-added.png' },
  { name: 'drag pill to Thursday evening on week', js: `(async()=>{ await __into('.wk-table'); const pill=__findText('.pl-pill','לקנות מתנה'); const cell=document.querySelector('.wk-cell[data-date="2026-10-29"][data-slot="e"]'); const r=await __drag(pill.querySelector('.pl-pill-w'),cell,{steps:14}); return JSON.stringify(__state())})()`, wait: 400, shot: S + '02-strip-to-week.png' },
  { name: 'say remove it', js: `__fakeSchedule([{action:'remove',text:'לקנות מתנה',repeat:'none',date:'2026-10-29'}]); window.scrollTo(0,0); __tap(__findText('#psay-out button','סגור')||document.body); __type('#psay-in','להוריד מהלוח את לקנות מתנה ביום חמישי',true); 'ok'`, wait: 700, shot: S + '02-say-remove-weektask.png' },
  { name: 'say remove meditation from wed', js: `__fakeSchedule([{action:'remove',text:'מדיטציה',repeat:'weekly',days:[3],date:'2026-11-04'}]); __tap(__findText('#psay-out button','סגור')||document.body); __type('#psay-in','להוריד מהלוח את המדיטציה מה-4.11',true); 'ok'`, wait: 700, shot: S + '02-say-remove-card.png' },
  { name: 'apply remove', js: `const b=__findText('#psay-out button','הסר'); if(b)__tap(b); JSON.stringify({n28:__dp('2026-10-28').items.length,n4:__dp('2026-11-04').items.length,n11:__dp('2026-11-11').items.length,undo:_planUndo.length})`, wait: 400, shot: S + '02-say-removed.png' },
  { name: 'undo button: where and what it does', js: `const u=document.getElementById('plan-undo'); JSON.stringify({u:u&&__c(u).r, tab:__c('.tabbar').r})`, wait: 100 },
];
