(async function(){try{
  var w=function(m){return new Promise(function(r){setTimeout(r,m)})},out=[];
  document.querySelectorAll('.bms').forEach(function(e){e.remove()});
  await w(500);
  var tb=document.querySelector('.tabbar'),g=tb.querySelector('.sg-glide');out.push('tabbar glide '+!!g+' at '+(g&&g.style.transform));
  showMain('me');await w(60);out.push('mid '+getComputedStyle(tb.querySelector('.sg-glide')).transform);await w(500);out.push('after '+tb.querySelector('.sg-glide').style.transform);
  showMain('better');await w(600);
  var hm=document.getElementById('hch-mode');out.push('hch glide '+!!hm.querySelector('.sg-glide')+' '+(hm.querySelector('.sg-glide')||{style:{}}).style.transform);
  hchSetMode('chat');await w(50);out.push('hch mid '+getComputedStyle(hm.querySelector('.sg-glide')).transform);await w(500);out.push('hch after '+hm.querySelector('.sg-glide').style.transform);
  hchSetMode('dial');await w(600);
  enterModule('people');await w(800);var ps=document.querySelector('.ppl-sorts');out.push('people '+(ps?!!ps.querySelector('.sg-glide'):'no sorts'));
  return out.join(' | ');
}catch(e){return 'ERR '+e.message;}})()
