// Walks the new journal through real pointer events: write today, turn to
// yesterday past the middle, turn back, a short drag that falls back, a new
// notebook with dots, and the old pages still there.
(async function(){
  var q=function(s){return document.querySelector(s);},wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=window.__jbOut=window.__jbOut||[],st=window.__jbSt=(window.__jbSt||0)+1;
  function drag(x0,x1,steps,ms){var s=q('#jb-stack'),r=s.getBoundingClientRect();
    function ev(t,x){s.dispatchEvent(new PointerEvent(t,{clientX:r.left+x,clientY:r.top+300,pointerId:1,bubbles:true}));}
    return (async function(){ev('pointerdown',x0);for(var i=1;i<=steps;i++){ev('pointermove',x0+(x1-x0)*i/steps);await wait(ms);}ev('pointerup',x1);await wait(650);})();}
  if(st===1){
    localStorage.setItem('jrnl_'+jbDay(todayStr(),-1),'כתבתי אתמול');
    enterModule('journal');await wait(600);
    var t=q('#jrnl-text');t.value='היום היה טוב';t.dispatchEvent(new Event('input',{bubbles:true}));await wait(600);
    out.push('saved today: '+localStorage.getItem('jrnl_'+todayStr())+' | week: '+(q('.jb-wk span:last-child')||{}).textContent);
    var W=q('#jb0').offsetWidth,rtl=document.documentElement.dir==='rtl';
    await drag(rtl?30:W-30,rtl?W*0.62:W*0.38,10,30);
    out.push('after turn past middle: date '+_jrnlDate+' text '+(q('#jrnl-text')||{}).value);
  } else if(st===2){
    var W2=q('#jb0').offsetWidth;
    await drag(W2*0.8,W2*0.2,10,30);
    out.push('after turn back: today? '+(_jrnlDate===todayStr()));
    await drag(30,90,4,80);
    out.push('after short drag: today? '+(_jrnlDate===todayStr())+' clip '+(q('#jb0').style.clipPath||'none'));
  } else {
    jbNew();await wait(200);q('#jb-n').value='תודה';_jbEd.paper='dots';jbKeep();await wait(300);
    out.push('new notebook: '+jbCur().name+' paper '+jbCur().paper+' class '+q('#jrnl-text').className+' tabs '+[].map.call(document.querySelectorAll('.jb-nb'),function(b){return b.textContent;}).join(','));
    var t2=q('#jrnl-text');t2.value='שקט';t2.dispatchEvent(new Event('input',{bubbles:true}));await wait(600);
    out.push('key: '+Object.keys(localStorage).filter(function(k){return k.indexOf('jrnl_'+_jrnlNb+'_')===0;}).join(','));
    jbOpen('main');await wait(300);
    out.push('main still: '+q('#jrnl-text').value);
    var d=document.createElement('pre');d.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:12px;white-space:pre-wrap;margin:0;padding:8px';
    d.textContent=out.join('\n');document.body.appendChild(d);
  }
})();
