/* The fitness way in, from Asaf's phone (22 Oct):
 *  - "how much time do you have": four exact chips read as an odd question -
 *    a wheel, like the hour in the first run;
 *  - the goal screen: seven two-line chips in a grid felt crowded - one per
 *    row, big, the way the equipment question already is;
 *  - the summary said "or start without a plan at all" with no button for it;
 *  - the area card's two buttons did nothing but close it;
 *  - "yes, remind me" asked nothing when the phone had already answered, and
 *    said nothing either. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* the goal: one per row */
rep(`    var on=o.out||[];
    h='<div class="fg-row">';
    for(i=0;i<FIT_OUT.length;i++)
      h+='<button class="fg-b'+((on.indexOf(FIT_OUT[i][0])>=0)?' on':'')+
         '" onclick="fitMeOut(&quot;'+FIT_OUT[i][0]+'&quot;)">'+esc(_t(FIT_OUT[i][1]))+
         '<span class="gn-n" style="display:block;margin-top:3px">'+esc(_t(FIT_OUT[i][2]))+'</span></button>';`,
`    var on=o.out||[];
    /* one per row, like where and how much: seven two-line choices in a
       two-column grid read as a crowd */
    h='<div class="fq-opts">';
    for(i=0;i<FIT_OUT.length;i++)
      h+='<button class="fg-b fq-o'+((on.indexOf(FIT_OUT[i][0])>=0)?' on':'')+
         '" onclick="fitMeOut(&quot;'+FIT_OUT[i][0]+'&quot;)">'+esc(_t(FIT_OUT[i][1]))+
         '<span class="fq-os">'+esc(_t(FIT_OUT[i][2]))+'</span></button>';`);

/* the minutes: a wheel */
rep(`  if(k==='minutes'){
    h='<div class="fg-row">';
    for(i=0;i<GENPROG_MINS.length;i++)
      h+='<button class="fg-b" onclick="fitMeSet(&quot;minutes&quot;,'+GENPROG_MINS[i]+')">'+_t('{n} דקות',{n:GENPROG_MINS[i]})+'</button>';
    return h+'</div>';
  }`, `  if(k==='minutes'){
    /* a wheel, like the hour in the first run - four exact numbers to pick
       from read as a strange question about an approximate thing */
    h='<div class="dr-wheel fq-wheel"><div class="win"></div><div class="dr-col fq-mins" id="fq-mins">';
    for(i=0;i<FIT_ME_MINS.length;i++)h+='<div>'+_t('{n} דקות',{n:FIT_ME_MINS[i]})+'</div>';
    h+='</div></div>';
    h+='<button class="gn-go" style="margin-top:16px" onclick="fitMeMinsDone()">'+_t('המשך')+'</button>';
    setTimeout(fitMeMinsInit,30);
    return h;
  }`);
rep(`function fitMeHas(k){`, `/* the wheel's stops: every five minutes up to an hour, then by the quarter */
var FIT_ME_MINS=[15,20,25,30,35,40,45,50,55,60,75,90,105,120];
function fitMeMinsInit(){
  var c=document.getElementById('fq-mins');if(!c)return;
  var cur=+fitMe().minutes||45,k=FIT_ME_MINS.indexOf(cur);if(k<0)k=FIT_ME_MINS.indexOf(45);
  c.addEventListener('scroll',function(){doorMark(c);});
  c.scrollTop=k*60;doorMark(c);
}
function fitMeMinsDone(){
  var c=document.getElementById('fq-mins');if(!c)return;
  var k=Math.max(0,Math.min(FIT_ME_MINS.length-1,Math.round(c.scrollTop/60)));
  fitMeSet('minutes',FIT_ME_MINS[k]);
}
function fitMeHas(k){`);
rep(`html body.mod-fitness .fq-welp{`, `html body.mod-fitness .fq-wheel{margin-top:4px}
html body.mod-fitness .fq-wheel .dr-col{width:180px}
html body.mod-fitness .fq-wheel .dr-col div{font-size:26px}
html body.mod-fitness .fq-welp{`);

/* the summary: the second way out it already promised */
rep(`    h+='<button class="gn-go" onclick="fitWBuild()">'+_t('בנה לי תוכנית')+'</button>';
    h+='<div class="gn-g">'+_t('אפשר לשנות כל אחד מהם מתי שתרצה — או להתחיל אימון בלי תוכנית בכלל.')+'</div>';`,
`    h+='<button class="gn-go" onclick="fitWBuild()">'+_t('בנה לי תוכנית')+'</button>';
    /* the line under it always said "or start without a plan" - now it can */
    h+='<button class="fq-later" onclick="fitWSkip()">'+_t('בלי תוכנית בינתיים')+'</button>';
    h+='<div class="gn-g">'+_t('אפשר לשנות כל אחד מהם מתי שתרצה — או להתחיל אימון בלי תוכנית בכלל.')+'</div>';`);
rep(`function fitWBuild(){if(_fitW){_fitW.built=true;renderFitness();}}`,
`function fitWBuild(){if(_fitW){_fitW.built=true;renderFitness();}}
/* everything she answered is kept - it still sets the rep range and the
   rest - and she goes straight to starting a workout */
function fitWSkip(){_fitW=null;_fitView='start';renderFitness();}`);

/* the area card: its buttons do what they say */
rep(`  w.querySelector('.aint-go').onclick=close;w.querySelector('.aint-later').onclick=close;`,
`  /* a button that only closes the card is a promise not kept: each does
     what it says, where the area has that action ready */
  w.querySelector('.aint-go').onclick=function(){close();if(I.go2)setTimeout(I.go2,250);};
  w.querySelector('.aint-later').onclick=function(){close();if(I.later2)setTimeout(I.later2,250);};`);
rep(`    go:_t('להתחיל אימון ראשון'),later:_t('לבנות לי תוכנית אישית')};`,
`    go:_t('להתחיל אימון ראשון'),later:_t('לבנות לי תוכנית אישית'),
    go2:function(){fqLater('fitness');_fitView='start';renderFitness();},
    later2:function(){_fitView='welcome';fitWNext();}};`);
rep(`    go:_t('להוסיף אדם ראשון'),later:_t('אחר כך')};`,
`    go:_t('להוסיף אדם ראשון'),later:_t('אחר כך'),
    go2:function(){_peopleView='edit-person';_personIdx=-1;renderPeople();}};`);

/* the reminder: when nothing can be asked, say why */
rep(`      if(('Notification' in window)&&Notification.permission==='default')sumRemAsk();
      else if(typeof sumRemPushSync==='function')sumRemPushSync();`,
`      if(!('Notification' in window))showToast(_t('כדי לקבל תזכורת בטלפון, צריך להוסיף את האפליקציה למסך הבית.'));
      else if(Notification.permission==='default')sumRemAsk();
      else{
        /* the phone already answered, so there is nothing to ask - say what it said */
        showToast(Notification.permission==='granted'?_t('✓ התראות מאושרות'):_t('ההתראות חסומות בהגדרות הטלפון. אפשר לאפשר אותן שם.'));
        if(typeof sumRemPushSync==='function')sumRemPushSync();
      }`);
fs.writeFileSync(F, s);
console.log('patched');
