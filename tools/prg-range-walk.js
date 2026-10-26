// In ?demo=history: for every tracker, every range it offers - how many marks
// the chart drew and how long the build took.
(function(){
  var out=[],ks=['weight','food','water','strength','volume','steps','hobbies','mood'];
  ks.forEach(function(k){
    prgOne(k);
    var rs=[].map.call(document.querySelectorAll('.prg-rng button'),function(b){return b.textContent;});
    var line=k+' ['+rs.join('/')+']:';
    [].forEach.call(document.querySelectorAll('.prg-rng button'),function(b,i){
      var t0=performance.now();document.querySelectorAll('.prg-rng button')[i].click();var ms=Math.round(performance.now()-t0);
      var c=document.querySelector('#prg .card'),marks=c?c.querySelectorAll('.an').length:0,empty=!c;
      line+=' '+b.textContent+'='+(empty?'EMPTY':marks)+'('+ms+'ms)';});
    out.push(line);
    prgClose();
  });
  return out.join('\n');
})()
