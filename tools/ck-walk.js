// Walks the clock screen through its real buttons and measures whether the
// running digits move. Called twice by shoot-page --then (stage 1, stage 2).
(async function(){
  var q=function(s){return document.querySelector(s);},wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=window.__ckOut=window.__ckOut||[],st=window.__ckSt=(window.__ckSt||0)+1;
  var btn=function(txt){return [].slice.call(document.querySelectorAll('button')).filter(function(b){return b.textContent.trim()===txt;})[0];};
  if(st===1){
    enterModule('fitness');await wait(500);_fitView='timer';renderFitness();await wait(300);
    btn('שעון עצר').click();await wait(200);
    out.push('view '+_fitView+' tab '+_ckTab);
    btn('התחל').click();
    // the face's width and every digit's left edge, sampled while it runs
    var widths={},lefts={};
    for(var i=0;i<40;i++){await wait(37);
      var d=q('#ck-dig');widths[Math.round(d.getBoundingClientRect().width*10)/10]=1;
      [].forEach.call(d.children,function(c,j){lefts[j]=lefts[j]||{};lefts[j][Math.round(c.getBoundingClientRect().left*10)/10]=1;});
      if(i===10||i===20||i===30)btn('הקפה').click();}
    out.push('face widths seen: '+Object.keys(widths).join(','));
    out.push('digit positions per slot: '+Object.keys(lefts).map(function(k){return Object.keys(lefts[k]).length;}).join(''));
    out.push('laps '+_ckSw.laps.length+' rows '+document.querySelectorAll('.ck-lap').length+' best '+!!q('.ck-lap.best')+' worst '+!!q('.ck-lap.worst'));
    btn('עצור').click();await wait(100);
    out.push('stopped; left button: '+document.querySelectorAll('.ck-rb')[0].textContent);
  } else {
    btn('ספירה לאחור').click();await wait(300);
    var ws=q('#ck-ws'),wm=q('#ck-wm');wm.scrollTop=0;ws.scrollTop=3*36;await wait(200);
    btn('התחל').click();await wait(1300);
    out.push('cd running: '+q('#ck-dig').textContent+' arc '+(q('#ck-arc')||{style:{}}).style.strokeDashoffset+' sub '+q('#ck-sub').textContent);
    btn('השהה').click();await wait(400);var a=q('#ck-dig').textContent;await wait(1100);
    out.push('paused holds: '+a+' = '+q('#ck-dig').textContent);
    btn('המשך').click();await wait(2600);
    out.push('ended -> wheels back: '+!!q('#ck-ws')+' recent: '+JSON.stringify(ckRecent())+' rows '+document.querySelectorAll('.ck-rc').length);
    var d=document.createElement('pre');d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:12px;white-space:pre-wrap;margin:0;padding:8px';
    d.textContent=out.join('\n');document.body.appendChild(d);
  }
})();
