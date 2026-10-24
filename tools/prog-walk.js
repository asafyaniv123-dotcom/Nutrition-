// Walks "write it yourself": one day saves a workout; a second day makes a
// program that asks which day; editing it opens the same editor on its days.
(async function(){
  var q=function(s){return document.querySelector(s);},wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=window.__pwOut=window.__pwOut||[],st=window.__pwSt=(window.__pwSt||0)+1;
  var btn=function(t,sc){return [].slice.call(document.querySelectorAll((sc||'body')+' button')).filter(function(b){return b.textContent.trim()===t;})[0];};
  if(st===1){
    saveTemplates([]);savePrograms([]);
    fitStartSheet();await wait(300);
    out.push('sheet: '+[].map.call(document.querySelectorAll('#fss-ov .fss-l b'),function(b){return b.textContent;}).join(' / '));
    [].filter.call(document.querySelectorAll('#fss-ov .fss-l button'),function(b){return /כתוב תוכנית/.test(b.textContent);})[0].click();await wait(300);
    out.push('editor: '+q('.tpl-t').textContent+' days '+document.querySelectorAll('.tpl-day:not(.add)').length+' back '+!!q('#content .fit-back'));
    var n=q('.tpl-name');n.value='פלג עליון';n.dispatchEvent(new Event('input',{bubbles:true}));
    _tpl.exercises.push({name:'לחיצת חזה במוט',plan:[{w:60,r:8},{w:60,r:8}]});
    btn('+ יום').click();await wait(200);
    _tpl.exercises.push({name:'סקוואט',plan:[{w:80,r:6}]});renderFitness();await wait(200);
    out.push('after + day: days '+document.querySelectorAll('.tpl-day:not(.add)').length+' on '+q('.tpl-day.on').textContent+' rows '+document.querySelectorAll('.tb').length);
    btn('יום A').click();await wait(200);out.push('back to A rows '+document.querySelectorAll('.tb').length+' first '+(q('.tb-n')||{}).textContent);
    q('.tpl-save').click();await wait(400);
    out.push('saved: templates '+loadTemplates().length+' programs '+loadPrograms().length+' days '+JSON.stringify(loadPrograms()[0].exercises.map(function(e){return e.day+':'+e.name+' '+e.sets+'x'+e.targetReps;})));
  } else {
    fitRowMenu('p',0);await wait(200);q('#fr-ed').click();await wait(300);
    out.push('edit: '+q('.tpl-t').textContent+' name '+q('.tpl-name').value+' days '+document.querySelectorAll('.tpl-day:not(.add)').length+' A rows '+document.querySelectorAll('.tb').length);
    tplCancel();await wait(200);fitProgStart(0);await wait(300);
    out.push('start asks: '+[].map.call(document.querySelectorAll('#fss-ov .fss-l b'),function(b){return b.textContent;}).join(' / '));
    fitSheetClose();
    var d=document.createElement('pre');d.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:12px;white-space:pre-wrap;margin:0;padding:8px';
    d.textContent=out.join('\n');document.body.appendChild(d);
  }
})();
