// Opens the nutrition setup fresh, for photographs of each step.
(function(){
  try{localStorage.removeItem('area_setup_seen');}catch(e){}
  var d=document.querySelector('.door');if(d)d.remove();
  enterModule('nutrition');
  return new Promise(function(r){setTimeout(function(){r(_aset?asetKey():'none');},1500);});
})()
