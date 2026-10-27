/* a TAP on a day item's bead must leave it a day item; a pull must stretch it */
const S='tools/audit-plan/shots/';
export default [
  { name:'tap the bead of a day item on the month', js:`localStorage.setItem(dpKey('2026-10-27'),JSON.stringify({items:[{id:'dT',w:'מכולת',c:'tea',h:10}],hours:{},mins:{},ends:{},notes:{},rem:{}})); __setup({week:false,month:true,day:false}); (async()=>{ await __into('.mo-grid'); const g=document.querySelector('[data-mostretch="dT"]'); const a=__c(g); __pe('pointerdown',a.x,a.y,g); __pe('pointerup',a.x,a.y); await __sleep(300); return JSON.stringify({dayItems:loadDPlan('2026-10-27').items.map(x=>x.id), week:__state('2026-10-25').week})})()`, wait:300 },
  { name:'pull it two cells', js:`(async()=>{ const g=document.querySelector('[data-mostretch="dT"]'); const b=document.querySelector('.mo-cell[data-date="2026-10-29"]'); await __drag(g,b,{steps:14,stepMs:60}); return JSON.stringify({dayItems:loadDPlan('2026-10-27').items.map(x=>x.id), week:__state('2026-10-25').week, hour:loadDPlan('2026-10-27').hours})})()`, wait:300, shot:S+'09-pulled.png' },
];
