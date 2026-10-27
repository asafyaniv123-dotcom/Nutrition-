const S = 'tools/audit-plan/shots/';
export default [
  { name: 'fixture', js: `localStorage.setItem(dpKey('2026-10-27'), JSON.stringify({items:[{id:'dG',w:'פגישת צוות ארוכה',c:'blu',h:13,e:16*60}],hours:{},mins:{},ends:{},notes:{},rem:{}})); __setup({week:false,month:false,day:true}); _dpDate='2026-10-27'; renderPlanning(); (async()=>{await __into('.dp-slot[data-hour="14"]'); return 1})()`, wait: 300 },
  { name: 'press the block, move a bit (no hold)', js: `(async()=>{ const chip=document.querySelector('.dp-chip'); const a=__c(chip); window.__a=a; __pe('pointerdown',a.x,a.y,chip); for(let i=1;i<=4;i++){__pe('pointermove',a.x,a.y-10*i); await __sleep(40);} const g=document.querySelector('.wk-ghost'); return JSON.stringify({ghost:__c(g).r, block:a.r})})()`, wait: 200, shot: S + '08-ghost-move.png' },
  { name: 'flick left (armed delete)', js: `(async()=>{ const a=__a; for(let i=1;i<=6;i++){__pe('pointermove',a.x-15*i,a.y-40); await __sleep(30);} const g=document.querySelector('.wk-ghost'); return JSON.stringify({ghost:__c(g).r, sw:g.getAttribute('data-swipe'), trash:document.querySelector('.swipe-trash').className})})()`, wait: 200, shot: S + '08-ghost-armed.png' },
  { name: 'release back home', js: `(async()=>{ __pe('pointerup',__a.x-90,__a.y-40); await __sleep(200); return JSON.stringify(__dp('2026-10-27').items)})()`, wait: 300 },
];
