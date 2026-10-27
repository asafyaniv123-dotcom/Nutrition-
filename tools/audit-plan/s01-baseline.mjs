const S = 'tools/audit-plan/shots/';
export default [
  { name: 'setup week only', js: `__setup({week:true,month:false,day:false}); JSON.stringify({today:todayStr(), sync:SYNC_SERVER, wkSun:wkStamp(_wkSun||weekSunday(appNow())), state:__state()})`, wait: 600, shot: S + '01-week-top.png' },
  { name: 'scroll week grid', js: `window.scrollTo(0, document.getElementById('plan-sec-week').getBoundingClientRect().top + scrollY - 10); scrollY`, wait: 300, shot: S + '01-week-grid.png' },
  { name: 'open all three', js: `__setup({week:true,month:true,day:true}); document.querySelectorAll('#pl-in,#pl-pool').length`, wait: 800, shot: S + '01-all-top.png' },
  { name: 'month', js: `window.scrollTo(0, document.getElementById('plan-sec-month').getBoundingClientRect().top + scrollY - 10); scrollY`, wait: 300, shot: S + '01-month.png' },
  { name: 'day', js: `window.scrollTo(0, document.getElementById('plan-sec-day').getBoundingClientRect().top + scrollY - 10); JSON.stringify({rail:__c('#dp-rail').r, undo: !!document.getElementById('plan-undo'), bottombar: (document.querySelector('.tabbar,.bottom-bar,#tabbar,nav')||{}).className})`, wait: 300, shot: S + '01-day.png' },
  { name: 'page end', js: `window.scrollTo(0, 1e6); scrollY`, wait: 300, shot: S + '01-end.png' },
];
