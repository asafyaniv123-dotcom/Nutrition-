// "Dinner like yesterday" (13 Nov): what mrParse must recognise, and what it must leave to the coach.
//   node tools/shoot-page.mjs out.png dev/ 9000 --eval "fetch('/tools/mr-test.js').then(r=>r.text()).then(t=>(0,eval)(t))"
(function(){
  var dow=appNow().getDay(),thu=((dow-4+7)%7)||7;
  var C=[
    ['ארוחת ערב כמו אתמול','dinner',1],
    ['ארוחת צהריים כמו לפני יומיים','lunch',2],
    ['תכניס ארוחת בוקר כמו אתמול','breakfast',1],
    ['אכלתי את אותה ארוחת ערב כמו אתמול','dinner',1],
    ['ארוחת ערב כמו שלשום','dinner',2],
    ['צהריים כמו לפני 3 ימים','lunch',3],
    ['ארוחת ערב כמו ביום חמישי','dinner',thu],
    ['חטיף כמו אתמול','snack',1],
    ['same dinner as yesterday','dinner',1],
    ['lunch like two days ago','lunch',2],
    ['Abendessen wie gestern','dinner',1],
    ['la misma cena que ayer','dinner',1],
    ['même dîner que hier','dinner',1],
    ['pranzo come ieri','lunch',1],
    ['jantar igual ontem','dinner',1],
    ['昨日と同じ夕食','dinner',1],
    ['和昨天一样的晚餐','dinner',1],
    ['عشاء مثل أمس','dinner',1],
    /* these must go to the coach */
    ['ארוחת ערב כמו אתמול אבל בלי הרוטב',null],
    ['ארוחת ערב של אתמול',null],
    ['אכלתי פסטה בערב',null],
    ['כמו אתמול',null],
    ['ארוחת ערב כמו אתמול ועוד תפוח',null],
    ['dinner like yesterday plus a coffee',null],
    ['אתמול בערב אכלתי סלט',null],
    ['ארוחת ערב כמו לפני חודש',null]
  ];
  var out=[],bad=0;
  C.forEach(function(c){
    var r=mrParse(c[0]),ok=c[1]===null?r===null:(r&&r.slot===c[1]&&r.back===c[2]);
    if(!ok)bad++;
    out.push((ok?'ok   ':'FAIL ')+c[0]+' -> '+(r?r.slot+'/'+r.back:'coach'));
  });
  return bad+' failed of '+C.length+'\n'+out.join('\n');
})();
