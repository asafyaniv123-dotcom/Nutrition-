// the month: pull the bead of a task down into the next week's row
(async function(){try{
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  document.querySelector('.bar').style.display='none';document.querySelector('.wrap').style.padding='0';fit();
  function c(el){var r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};}
  function pe(t,x,y,el){(el||document.elementFromPoint(x,y)).dispatchEvent(new PointerEvent(t,{clientX:x,clientY:y,pointerId:1,isPrimary:true,bubbles:true,cancelable:true}));}
  go('month');S.at='2026-10-15';draw();await w(200);
  S.tasks.push({id:'x',w:'כנס',c:'teal',d:'2026-10-16',s:null,len:1});draw();await w(100);
  var a=c(document.querySelector('[data-bead="x"]')),b=c(document.querySelector('.mcell[data-drop-date="2026-10-20"]'));
  pe('pointerdown',a.x,a.y);for(var i=1;i<=16;i++){pe('pointermove',a.x+(b.x-a.x)*i/16,a.y+(b.y-a.y)*i/16);await w(30);}pe('pointerup',b.x,b.y);await w(200);
  return 'len '+find('x').len;
}catch(e){return 'ERR '+e.message;}})()
