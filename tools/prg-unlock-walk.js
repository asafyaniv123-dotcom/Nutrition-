// After seeding a week+: Me shows the lit button and Mip's intro; "show me"
// opens progress; reopening Me shows it unlit and no second intro.
(async function(){
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});},q=function(s){return document.querySelector(s);},out=[];
  localStorage.removeItem('prg_seen');localStorage.removeItem('prg_intro');
  showMain('me');await w(1800);
  out.push('first: entry='+!!q('#prg-entry')+' lit='+(q('#prg-entry')&&q('#prg-entry').classList.contains('lit'))+' intro='+!!q('#prg-hi'));
  if(q('.prg-hgo')){q('.prg-hgo').click();await w(800);}
  out.push('after show me: progress open='+!!q('#prg'));
  prgClose();showMain('home');await w(300);showMain('me');await w(1500);
  out.push('again: lit='+(q('#prg-entry')&&q('#prg-entry').classList.contains('lit'))+' intro='+!!q('#prg-hi'));
  window.__uw=out.join(' | ');
})();
