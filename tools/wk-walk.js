// Walks the workout screen the way a thumb would, then prints what happened
// into a box on the page so the screenshot carries the verdict.
(async function(){
  var out=[],q=function(s){return document.querySelector(s);},wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var r=q('#fit-r');out.push('reps start '+r.value);
  q('.fx-pm button:last-child').click();q('.fx-pm button:last-child').click();
  out.push('after ++ '+q('#fit-r').value);
  var w=q('#fit-w');w.value='72.5';w.dispatchEvent(new Event('input',{bubbles:true}));
  // the rest wheel: tap the 2:00 row
  var rows=[].slice.call(document.querySelectorAll('.ew[data-for="rest"] .ew-n'));
  rows.filter(function(e){return e.getAttribute('data-v')==='120';})[0].click();
  await wait(900);
  out.push('rest stored '+localStorage.getItem('fit_rest'));
  var note=q('.fx-note');note.value='אחיזה רחבה';note.dispatchEvent(new Event('input',{bubbles:true}));
  [].slice.call(document.querySelectorAll('button')).filter(function(b){return /רשום סט/.test(b.textContent);})[0].click();
  await wait(600);
  var ex=_fitWorkout.exercises[1];
  out.push('sets '+ex.sets.length+' last '+JSON.stringify(ex.sets[ex.sets.length-1]));
  out.push('rest running '+!!q('#fw-rest')+' '+(q('#fw-rest-n')||{}).textContent);
  out.push('note kept '+(q('.fx-note')||{}).value+' / stored '+exNoteGet(ex.name));
  out.push('wheel opens on '+(q('.ew[data-for="rest"] .ew-n.on')||{}).textContent);
  out.push('button '+[].slice.call(document.querySelectorAll('button')).filter(function(b){return /רשום סט/.test(b.textContent);})[0].textContent);
  var d=document.createElement('pre');d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:13px;white-space:pre-wrap;margin:0;padding:8px';
  d.textContent=out.join('\n');document.body.appendChild(d);
})();
