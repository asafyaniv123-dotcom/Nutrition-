/* ── PROGRESS ──
   The trackers approved on review/trackers-2 (26.10), on the app's own data:
   weigh-ins, the day's meals and water, the workout log, steps, hobbies, the
   evening's mood and score, and the book. Each has its own shape; all share
   one frame. Opened from nutrition's history, fitness's numbers, Me, and once
   when a book is finished. A tracker with too little to show says so. */
var PRG_C={violet:['#a690cf','#8d7ab0','#ddd2f2'],coral:['#f09a85','#e9775c','#ffd0c3'],terra:['#e9946f','#d9724f','#ffd2bd'],
  blue:['#8db3df','#6f97c8','#d6e5f5'],green:['#86bf84','#5f9f60','#cfe6c9'],amber:['#f1c470','#d9a441','#fbe6bd']};
var PRG_GROUPS={nutrition:['weight','food','water'],fitness:['strength','volume','steps'],
  me:['weight','food','water','strength','volume','steps','hobbies','mood','book']};
var PRG_W=330,_prg={list:[],cur:''};
function prgName(k){
  return {weight:_t('משקל גוף'),food:_t('קלוריות'),water:_t('מים'),strength:_t('כוח בתרגילים'),volume:_t('נפח אימונים'),
    steps:_t('צעדים'),hobbies:_t('תחביבים'),mood:_t('מצב רוח'),book:_t('הספר שלי'),bookdone:_t('הספר האחרון')}[k]||k;
}
function prgOpen(group,start){
  _prg.list=(PRG_GROUPS[group]||[group]).slice();_prg.cur=start||_prg.list[0];
  var o=document.getElementById('prg');
  if(!o){o=document.createElement('div');o.className='prg';o.id='prg';document.body.appendChild(o);}
  if(!exAll().length)exLoad(function(){if(document.getElementById('prg'))prgDraw();});
  prgDraw();
}
function prgClose(){var o=document.getElementById('prg');if(o)o.parentNode.removeChild(o);}
/* everything of the group, one after another; each enters as it is reached */
function prgDraw(){
  var o=document.getElementById('prg');if(!o)return;
  var h='<div class="prg-in"><div class="prg-top"><button class="fit-back" onclick="prgClose()">&#8249; '+_t('חזרה')+'</button>'+
    '<span class="prg-ttl">'+_t('ההתקדמות שלי')+'</span></div>',n=0;
  _prg.list.forEach(function(k){
    var b=PRG_B[k],body='';try{body=b?b():'';}catch(e){body='';}
    if(!body)return;n++;
    /* several trackers share the page now: every id carries its tracker */
    body=body.replace(/(id="|url\(#)((?:prg-|pl)[\w-]*)/g,'$1$2-'+k);
    h+='<section class="prg-sec" data-k="'+k+'">'+body+'</section>';});
  if(!n)h+='<div class="card"><div class="empty">'+_t('עוד אין כאן מספיק כדי להראות התקדמות. אחרי עוד כמה ימים של רישום, זה יופיע כאן.')+'</div></div>';
  o.innerHTML=h+'</div>';o.scrollTop=0;
  var secs=o.querySelectorAll('.prg-sec');
  [].forEach.call(secs,function(s){var c=s.querySelector('.card');if(c){c.style.opacity='0';c.style.transform='translateX(-60px)';}});
  if(!window.IntersectionObserver){[].forEach.call(secs,prgEnter);return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);prgEnter(e.target);}});},{root:o,threshold:.25});
  [].forEach.call(secs,function(s){io.observe(s);});
}
/* ── pieces ── */
function prgSmooth(P){var n=P.length,d=[],m=[],i;if(n<2)return 'M'+P[0][0]+' '+P[0][1];
  for(i=0;i<n-1;i++)d.push((P[i+1][1]-P[i][1])/(P[i+1][0]-P[i][0]));
  m[0]=d[0];m[n-1]=d[n-2];for(i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
  var p='M'+P[0][0].toFixed(1)+' '+P[0][1].toFixed(1);
  for(i=0;i<n-1;i++){var hh=(P[i+1][0]-P[i][0])/3;p+=' C'+(P[i][0]+hh).toFixed(1)+' '+(P[i][1]+m[i]*hh).toFixed(1)+' '+(P[i+1][0]-hh).toFixed(1)+' '+(P[i+1][1]-m[i+1]*hh).toFixed(1)+' '+P[i+1][0].toFixed(1)+' '+P[i+1][1].toFixed(1);}
  return p;}
function prgTag(x,y,t,lit){var w=String(t).length*6.8+16;
  return '<g class="an" data-x="'+x.toFixed(0)+'"><rect x="'+(x-w/2).toFixed(1)+'" y="'+(y-11).toFixed(1)+'" width="'+w.toFixed(1)+'" height="22" rx="11" fill="'+(lit?'#fff':'rgba(255,255,255,.72)')+'" style="filter:drop-shadow(0 2px 4px rgba(120,100,80,.14))"/>'+
    '<text x="'+x.toFixed(1)+'" y="'+(y+4.5).toFixed(1)+'" text-anchor="middle" class="'+(lit?'b':'n')+'">'+t+'</text></g>';}
function prgFrame(o){
  return '<h2>'+esc(o.t)+'</h2>'+(o.noMini?'':'<div class="mini"><div class="m then"><span>'+o.thenL+'</span><b>'+o.thenV+'</b></div>'+
    '<div class="m now"><span>'+o.nowL+'</span><b>'+o.nowV+'</b>'+(o.chip?'<em>'+o.chip+'</em>':'')+'</div></div>')+
    '<div class="card" id="prg-cc">'+o.chart+'</div>'+
    (o.say?'<div class="note"><span class="d"><i style="background:'+o.c+';box-shadow:0 0 8px '+o.c+'"></i></span><div>'+o.say+(o.sub?'<small>'+o.sub+'</small>':'')+'</div></div>':'');}
function prgSigned(x,dec){var a=Math.abs(x),s=dec?nfmt(a,{minimumFractionDigits:dec,maximumFractionDigits:dec}):nfmt(a);return '<bdi dir="ltr">'+(x<0?'−':'+')+s+'</bdi>';}
function prgDay(k){return dfmt(new Date(dayShift(k)+'T12:00:00'),{weekday:'narrow'});}
/* eight weeks, oldest first: [from, to] app-day offsets */
function prgWeeks(){var out=[],k;for(k=7;k>=0;k--)out.push([-(k*7+6),-(k*7)]);return out;}
/* the approved line, for eight weekly values (null = no data that week) */
function prgLine(v,col,o){
  o=o||{};var Hd=250,pt=46,pb=38,px=24,c=col[0],hi=col[2],id='pl'+(o.id||'');
  var idx=[],vals=[];v.forEach(function(x,k){if(x!=null){idx.push(k);vals.push(x);}});
  var lo=Math.min.apply(null,vals.concat(o.goal?[o.goal]:[])),up=Math.max.apply(null,vals.concat(o.goal?[o.goal]:[])),pad=(up-lo||1)*0.22;
  var X=function(k){return px+k*(PRG_W-2*px)/7;},Y=function(x){return pt+(1-(x-lo+pad)/(up-lo+2*pad))*(Hd-pt-pb);};
  var P=idx.map(function(k){return [X(k),Y(v[k])];}),d=prgSmooth(P),last=idx[idx.length-1];
  var s='<svg viewBox="0 0 '+PRG_W+' '+Hd+'"><defs><linearGradient id="'+id+'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c+'" stop-opacity=".28"/><stop offset=".7" stop-color="'+c+'" stop-opacity=".05"/><stop offset="1" stop-color="'+c+'" stop-opacity="0"/></linearGradient>'+
    '<linearGradient id="'+id+'s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="'+hi+'"/><stop offset="1" stop-color="'+c+'"/></linearGradient>'+
    '<filter id="'+id+'g" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>'+
    '<clipPath id="prg-rv"><rect id="prg-rvR" x="0" y="-40" width="'+PRG_W+'" height="'+(Hd+80)+'"/></clipPath></defs>';
  [0,.5,1].forEach(function(t){var y=pt+t*(Hd-pt-pb);s+='<line x1="'+px+'" x2="'+(PRG_W-px)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="rgba(168,160,148,.22)" stroke-dasharray="2 5"/>';});
  if(o.goal){var gy=Y(o.goal);
    s+='<defs><linearGradient id="'+id+'gl" x1="0" x2="1"><stop offset="0" stop-color="'+c+'" stop-opacity="0"/><stop offset=".55" stop-color="'+c+'" stop-opacity=".16"/><stop offset="1" stop-color="'+c+'" stop-opacity=".32"/></linearGradient>'+
      '<filter id="'+id+'gb" x="-5%" y="-100%" width="110%" height="300%"><feGaussianBlur stdDeviation="5"/></filter></defs>'+
      '<rect x="'+px+'" y="'+(gy-9).toFixed(1)+'" width="'+(PRG_W-2*px)+'" height="18" rx="9" fill="url(#'+id+'gl)" filter="url(#'+id+'gb)"/>'+
      '<circle cx="'+(PRG_W-px+4)+'" cy="'+gy.toFixed(1)+'" r="9" fill="none" stroke="'+c+'" stroke-width="1.5" opacity=".55"/><circle cx="'+(PRG_W-px+4)+'" cy="'+gy.toFixed(1)+'" r="3.5" fill="'+c+'"/>'+
      '<text x="'+(PRG_W-px-12)+'" y="'+(gy+22).toFixed(1)+'" text-anchor="end" class="n" style="fill:'+col[1]+'">'+_t('יעד {n}',{n:o.fmt(o.goal)})+'</text>';}
  if(P.length>1)s+='<g clip-path="url(#prg-rv)"><path d="'+d+' L'+P[P.length-1][0].toFixed(1)+' '+(Hd-pb)+' L'+P[0][0].toFixed(1)+' '+(Hd-pb)+'Z" fill="url(#'+id+'f)"/>'+
     '<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="8" stroke-linecap="round" opacity=".35" filter="url(#'+id+'g)"/>'+
     '<path d="'+d+'" fill="none" stroke="url(#'+id+'s)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>';
  idx.forEach(function(k,j){var p=P[j],lit=k===last;
    s+='<g class="an" data-x="'+p[0].toFixed(0)+'">'+(lit?'<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="14" fill="'+c+'" opacity=".18"/>':'')+
      '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+(lit?6.5:4.5)+'" fill="#fff" stroke="'+c+'" stroke-width="'+(lit?3.5:2.5)+'"/></g>'+prgTag(p[0],p[1]-25,o.fmt(v[k]),lit);});
  for(var k=0;k<8;k++)s+='<text x="'+X(k).toFixed(1)+'" y="'+(Hd-12)+'" text-anchor="middle"'+(k===7?' class="n" style="fill:#4a453f"':'')+'>'+(k===7?_t('השבוע'):nfmt(k+1))+'</text>';
  return s+'</svg>';}
/* ── the trackers ── */
var PRG_B={};
PRG_B.weight=function(){
  var W=loadWeights(),wk=prgWeeks().map(function(r){var a=[],k;for(k=r[0];k<=r[1];k++){var x=W[dayShift(k)];if(typeof x==='number')a.push(x);}
    return a.length?a.reduce(function(p,q){return p+q;},0)/a.length:null;});
  var have=wk.filter(function(x){return x!=null;});if(have.length<2)return '';
  var dw=function(kg){return Math.round(toDisplayWeight(kg)*10)/10;},f=function(kg){return nfmt(dw(kg),{minimumFractionDigits:1,maximumFractionDigits:1});};
  var first=have[0],last=have[have.length-1],g=weighCfg().goal,ch=dw(last)-dw(first);
  var left=g?Math.abs(dw(last)-dw(g)):0;
  return prgFrame({t:_t('המשקל שלי'),thenL:_t('לפני 8 שבועות'),thenV:f(first),nowL:_t('השבוע'),nowV:f(last),chip:prgSigned(ch,1)+' '+weightUnit(),c:PRG_C.violet[0],
    chart:prgLine(wk,PRG_C.violet,{goal:g||0,fmt:f,id:'w'}),
    say:g?_t('עוד {n} עד היעד',{n:nfmt(left,{minimumFractionDigits:1,maximumFractionDigits:1})+' '+weightUnit()}):_t('כל נקודה היא הממוצע של אותו שבוע'),sub:g?_t('כל נקודה היא הממוצע של אותו שבוע'):''});
};
PRG_B.food=function(){
  var K=[],P=[],any=0,tg=TARGETS.kcal||2000,i,inT=function(k){return k>=tg*0.9&&k<=tg*1.1;};
  for(i=-6;i<=0;i++){var d=loadDay(dayShift(i));K.push(Math.round(d.meals.reduce(function(a,m){return a+(m.kcal||0);},0)));P.push(Math.round(d.meals.reduce(function(a,m){return a+(m.p||0);},0)));if(d.meals.length)any++;}
  if(any<2)return '';
  var prev=0;for(i=-13;i<=-7;i++){var dd=loadDay(dayShift(i)),kk=dd.meals.reduce(function(a,m){return a+(m.kcal||0);},0);if(inT(kk))prev++;}
  var now=K.filter(inT).length,MX=Math.max(tg*1.2,Math.max.apply(null,K)),H=170,c=PRG_C.violet,h='<div class="cols" style="height:'+(H+66)+'px">';
  K.forEach(function(k,j){var lit=j===6,x=(j+.5)/7*PRG_W;
    h+='<div class="col an" data-x="'+x.toFixed(0)+'"><span class="tg'+(lit?' lit':'')+'">'+nfmt(k)+'</span>'+
      '<div class="ch" style="height:'+H+'px"><div class="fl grow" data-v="'+(k/MX*100).toFixed(1)+'" style="--c:'+c[0]+';--dp:'+c[1]+';--hi:'+c[2]+';height:0"></div><i class="gm" style="bottom:'+(tg/MX*100).toFixed(1)+'%"></i></div>'+
      '<span class="lb"'+(lit?' style="color:#4a453f"':'')+'>'+prgDay(j-6)+'</span><span class="lb" style="font-size:10.5px">'+_t('{n} ג׳',{n:P[j]})+'</span></div>';});
  h+='</div><div class="gleg"><i class="gm"></i>'+_t('הקו המאיר בכל עמודה: היעד, {n}',{n:nfmt(tg)})+'</div>';
  return prgFrame({t:_t('קלוריות'),thenL:_t('ימים ביעד, שבוע שעבר'),thenV:nfmt(prev),nowL:_t('ימים ביעד, השבוע'),nowV:nfmt(now),chip:prgSigned(now-prev),c:c[0],
    chart:h,say:_t('{n} ימים קרוב ליעד השבוע',{n:now}),sub:_t('מתחת לכל יום: גרם חלבון')});
};
PRG_B.water=function(){
  var V=[],i,any=0,tg=TARGETS.water||2500;for(i=-6;i<=0;i++){var w=loadDay(dayShift(i)).water||0;V.push(w);if(w)any++;}
  if(!any)return '';
  var pv=0,pn=0;for(i=-13;i<=-7;i++){var ww=loadDay(dayShift(i)).water||0;if(ww){pv+=ww;pn++;}}
  var avg=V.reduce(function(a,b){return a+b;},0)/7,pavg=pn?pv/7:0,full=V.filter(function(x){return x>=tg;}).length,c=PRG_C.blue,h='<div class="cols" style="padding:8px 4px 0">';
  V.forEach(function(v,j){var lit=j===6,x=(j+.5)/7*PRG_W;
    h+='<div class="col an" data-x="'+x.toFixed(0)+'"><div class="ch glass" style="height:84px"><div class="fl grow" data-v="'+Math.min(100,v/tg*100).toFixed(1)+'" style="--c:'+c[0]+';--dp:'+c[1]+';--hi:'+c[2]+';height:0;border-radius:0 0 12px 12px"></div></div>'+
      '<span class="tg'+(lit?' lit':'')+'">'+nfmt(v/1000,{minimumFractionDigits:1,maximumFractionDigits:1})+'</span><span class="lb">'+prgDay(j-6)+'</span></div>';});
  h+='</div>';
  return prgFrame({t:_t('מים'),thenL:_t('ממוצע שבוע שעבר'),thenV:fmtVolume(Math.round(pavg)),nowL:_t('ממוצע השבוע'),nowV:fmtVolume(Math.round(avg)),c:c[0],
    chart:h,say:_t('{n} ימים מלאים השבוע',{n:full}),sub:_t('בליטרים · כוס מלאה = {v}',{v:fmtVolume(tg)})});
};
/* strength: a loaded bar per exercise, start and today beneath its name */
function prgPlates(kg){var side=Math.max(0,(kg-20)/2),out=[],P=[20,10,5,2.5,1.25];P.forEach(function(p){while(side>=p-1e-9){out.push(p);side-=p;}});return out;}
var PRG_PL={20:[48,15],10:[40,13],5:[31,12],2.5:[24,11],1.25:[19,10]};
function prgBar(was,now,i){
  var a=prgPlates(was),b=prgPlates(now),W2=210,cx=W2/2,cy=28,c=PRG_C.terra,keep=0,k;
  for(k=0;k<b.length&&k<a.length&&b[k]===a[k];k++)keep++;
  var s2='<svg viewBox="0 0 '+W2+' 56" class="bb"><defs><linearGradient id="prg-pn'+i+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c[2]+'"/><stop offset=".5" stop-color="'+c[0]+'"/><stop offset="1" stop-color="'+c[1]+'"/></linearGradient>'+
    '<linearGradient id="prg-po'+i+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f4f1"/><stop offset=".5" stop-color="#e3dfd9"/><stop offset="1" stop-color="#cfc8bf"/></linearGradient></defs>';
  s2+='<rect x="6" y="'+(cy-2.5)+'" width="'+(W2-12)+'" height="5" rx="2.5" fill="#dcd6ce"/>';
  s2+='<rect x="'+(cx-40)+'" y="'+(cy-6)+'" width="6" height="12" rx="2" fill="#cdc6bc"/><rect x="'+(cx+34)+'" y="'+(cy-6)+'" width="6" height="12" rx="2" fill="#cdc6bc"/>';
  [-1,1].forEach(function(side){var x=side<0?cx-42:cx+42;
    b.forEach(function(p,j){var d=PRG_PL[p],nw=j>=keep,w=d[1];if(side<0)x-=w+2;
      s2+='<rect class="plate" style="--d:'+(j*90)+'ms;--from:'+(side*-26)+'px" x="'+x.toFixed(1)+'" y="'+(cy-d[0]/2)+'" width="'+w+'" height="'+d[0]+'" rx="2.5" fill="url(#prg-'+(nw?'pn':'po')+i+')"/>';
      if(side>0)x+=w+2;});});
  return s2+'</svg>';
}
PRG_B.strength=function(){
  var L=loadWorkoutLog(),since=dayShift(-55),M={},best={},i;
  for(i=0;i<L.length;i++){var e=L[i],dd=appDayOf(e.date);
    (e.exercises||[]).forEach(function(x){if(!x.name||isCardioEx(x.name))return;var top=0;(x.sets||[]).forEach(function(s){if(+s.weight>top)top=+s.weight;});if(!top)return;
      if(dd<since){best[x.name]=Math.max(best[x.name]||0,top);return;}
      (M[x.name]=M[x.name]||[]).push([dd,top]);});}
  var names=Object.keys(M).filter(function(n){return M[n].length>=2;}).sort(function(a,b){return M[b].length-M[a].length;}).slice(0,5);
  if(!names.length)return '';
  var rec=0,h='<div class="bk2">';
  names.forEach(function(n,j){var s=M[n].sort(function(a,b){return a[0]<b[0]?-1:1;}),was=s[0][1],now=s[s.length-1][1],prior=best[n]||0,k;
    for(k=0;k<s.length-1;k++)prior=Math.max(prior,s[k][1]);var pr=now>prior;if(pr)rec++;
    var dw=function(kg){return nfmt(Math.round(toDisplayWeight(kg)*10)/10);};
    h+='<div class="b2 an" data-x="'+(j*55)+'"><div class="b2n">'+esc(n)+(pr?'<span class="star">★</span>':'')+'</div>'+prgBar(was,now,j)+
      '<div class="b2p"><span class="was"><small>'+_t('התחלה')+'</small>'+dw(was)+'</span><span class="now"><small>'+_t('היום')+'</small>'+dw(now)+'</span></div></div>';});
  h+='</div><div class="lb" style="text-align:center;margin:8px 0 2px">'+_t('{u} · המשקולות הכתומות נוספו ב-8 שבועות',{u:weightUnit()})+'</div>';
  return prgFrame({noMini:1,t:_t('כוח בתרגילים'),c:PRG_C.terra[0],chart:h,
    say:rec?_t('{n} שיאים חדשים בשבוע האחרון',{n:rec}):_t('הסט הכבד של כל תרגיל, מההתחלה עד היום'),sub:_t('★ = שיא אישי באימון האחרון')});
};
PRG_B.volume=function(){
  var L=loadWorkoutLog(),G={},prev=0,tot=0,i;
  for(i=0;i<L.length;i++){var e=L[i],dd=appDayOf(e.date),now=dd>=dayShift(-6),last=!now&&dd>=dayShift(-13);if(!now&&!last)continue;
    (e.exercises||[]).forEach(function(x){if(isCardioEx(x.name))return;var n=(x.sets||[]).length;if(!n)return;
      if(last){prev+=n;return;}tot+=n;var g=muscleGroupOf(x.name);G[g]=(G[g]||0)+n;});}
  if(!tot)return '';
  var COL=['#e9946f','#e8b86d','#d99aa8','#9db8d6','#9cc49a','#c7a6d9','#e6c39a'],keys=Object.keys(G).sort(function(a,b){return G[b]-G[a];}).slice(0,7);
  var r=62,Cc=2*Math.PI*r,at=0,arcs='',li='';
  keys.forEach(function(g,j){var L2=G[g]/tot*Cc-(keys.length>1?4:0);
    arcs+='<circle cx="85" cy="85" r="'+r+'" fill="none" stroke="'+COL[j]+'" stroke-width="22" stroke-dasharray="'+Math.max(L2,1).toFixed(1)+' '+Cc.toFixed(1)+'" stroke-dashoffset="'+(-at).toFixed(1)+'" transform="rotate(-90 85 85)"/>';
    at+=L2+(keys.length>1?4:0);li+='<li class="an" data-x="'+(60+j*40)+'"><i style="background:'+COL[j]+'"></i>'+esc(_t(g))+'<span>'+nfmt(G[g])+' · '+pfmt(G[g]/tot*100)+'</span></li>';});
  var h='<div class="pie"><div class="well"><svg viewBox="0 0 170 170"><defs><mask id="prg-pm"><circle id="prg-pmc" cx="85" cy="85" r="'+r+'" fill="none" stroke="#fff" stroke-width="26" stroke-dasharray="0 '+Cc.toFixed(1)+'" transform="rotate(-90 85 85)"/></mask></defs>'+
    '<g mask="url(#prg-pm)">'+arcs+'</g></svg><div class="ctr"><b>'+nfmt(tot)+'</b><small>'+_t('סטים השבוע')+'</small></div></div><ul>'+li+'</ul></div>';
  var lo=keys[keys.length-1];
  return prgFrame({t:_t('נפח אימונים'),thenL:_t('סטים, שבוע שעבר'),thenV:nfmt(prev),nowL:_t('סטים, השבוע'),nowV:nfmt(tot),chip:prgSigned(tot-prev),c:COL[0],
    chart:h,say:keys.length>1?_t('{g} מקבל הכי מעט',{g:_t(lo)}):_t('כל הסטים השבוע'),sub:keys.length>1?_t('{p} מהסטים השבוע',{p:pfmt(G[lo]/tot*100)}):''});
};
PRG_B.steps=function(){
  var V=[],i,any=0;for(i=-6;i<=0;i++){var v=stepsOf(dayShift(i));V.push(v);if(v)any++;}
  if(any<2)return '';
  var prev=0;for(i=-13;i<=-7;i++)prev+=stepsOf(dayShift(i));
  var tot=V.reduce(function(a,b){return a+b;},0),mx=Math.max.apply(null,V),mn=Math.min.apply(null,V),Hd=210,c=PRG_C.coral;
  var P=V.map(function(v,j){return [28+j*(PRG_W-56)/6,170-(v-mn)/((mx-mn)||1)*110];}),d=prgSmooth(P),top=V.indexOf(mx);
  var s='<svg viewBox="0 0 '+PRG_W+' '+Hd+'"><defs><clipPath id="prg-rv"><rect id="prg-rvR" x="0" y="-40" width="'+PRG_W+'" height="'+(Hd+80)+'"/></clipPath><filter id="prg-rg" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="4"/></filter></defs>';
  s+='<path d="'+d+'" fill="none" stroke="rgba(168,160,148,.18)" stroke-width="20" stroke-linecap="round"/>';
  s+='<g clip-path="url(#prg-rv)"><path d="'+d+'" fill="none" stroke="'+c[0]+'" stroke-width="9" stroke-linecap="round" opacity=".35" filter="url(#prg-rg)"/><path d="'+d+'" fill="none" stroke="'+c[0]+'" stroke-width="4" stroke-linecap="round"/></g>';
  P.forEach(function(p,j){var lit=j===6;
    s+='<g class="an" data-x="'+p[0].toFixed(0)+'">'+(lit?'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="13" fill="'+c[0]+'" opacity=".2"/>':'')+'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(lit?6.5:4.5)+'" fill="#fff" stroke="'+c[0]+'" stroke-width="'+(lit?3.5:2.5)+'"/></g>'+prgTag(p[0],p[1]-28,nfmt(V[j]),lit);
    s+='<text x="'+p[0]+'" y="'+(Hd-8)+'" text-anchor="middle"'+(lit?' class="n" style="fill:#4a453f"':'')+'>'+prgDay(j-6)+'</text>';});
  s+='</svg>';
  var dist=_t('כ-{d} השבוע',{d:fmtDist(tot*0.75)});
  return prgFrame({t:_t('צעדים'),thenL:_t('שבוע שעבר'),thenV:nfmt(prev),nowL:_t('השבוע'),nowV:nfmt(tot),chip:prev?prgSigned(tot-prev):'',c:c[0],
    chart:s,say:dist,sub:_t('היום הכי ארוך: {d}, {n} צעדים',{d:prgDay(top-6),n:mx})});
};
PRG_B.hobbies=function(){
  var Lg=loadHabitLog(),list=loadHabits().filter(function(n){return hbKind(n)!=='done';}),rows=[],tot=0,prevT=0,i;
  list.forEach(function(n){var arcs=[],sum=0;for(i=-6;i<=0;i++){var v=hbMin(Lg[n+'__'+dayShift(i)]);if(v){arcs.push(v);sum+=v;}}
    for(i=-13;i<=-7;i++)if(hbKind(n)==='time')prevT+=hbMin(Lg[n+'__'+dayShift(i)]);
    if(hbKind(n)==='time')tot+=sum;if(sum)rows.push([n,arcs,sum,hbTarget(n).tg,hbKind(n)]);});
  if(!rows.length)return '';
  rows.sort(function(a,b){return b[2]/b[3]-a[2]/a[3];});rows=rows.slice(0,3);
  var c=PRG_C.green,h='<div class="rings">';
  rows.forEach(function(rw,j){var r=38,Cc=2*Math.PI*r,at=0,arcs='';
    rw[1].forEach(function(m){var L2=Math.min(m/rw[3]*Cc,Cc-at);if(L2<=0)return;
      arcs+='<circle cx="48" cy="48" r="'+r+'" fill="none" stroke="url(#prg-hg)" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+Math.max(L2-5,1).toFixed(1)+' '+Cc.toFixed(1)+'" stroke-dashoffset="'+(-at-2.5).toFixed(1)+'" transform="rotate(-90 48 48)"/>';at+=L2;});
    h+='<div class="rg an" data-x="'+(PRG_W-(j+.5)/3*PRG_W).toFixed(0)+'"><div class="well"><svg viewBox="0 0 96 96"><defs><linearGradient id="prg-hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+c[2]+'"/><stop offset="1" stop-color="'+c[1]+'"/></linearGradient></defs>'+arcs+'</svg>'+
      '<div class="ctr"><b>'+nfmt(rw[2])+'</b><small>'+_t('מתוך {n}',{n:rw[3]})+'</small></div></div><span class="nm">'+esc(rw[0])+'</span><span class="lb">'+(rw[4]==='time'?_t('{n} דק׳',{n:rw[2]}):'')+'</span></div>';});
  h+='</div>';
  return prgFrame({t:_t('תחביבים'),thenL:_t('שבוע שעבר'),thenV:_t('{n} דק׳',{n:prevT}),nowL:_t('השבוע'),nowV:_t('{n} דק׳',{n:tot}),chip:prevT?prgSigned(tot-prevT):'',c:c[0],
    chart:h,say:_t('{h} הכי קרוב ליעד',{h:rows[0][0]}),sub:_t('כל קשת בטבעת היא יום אחד')});
};
PRG_B.mood=function(){
  var M=[],R=[],D=[],i;for(i=-13;i<=0;i++){var r=loadSummary(dayShift(i))||{};if(r.mood||r.dayRating){M.push(Math.max(1,Math.min(5,+r.mood||3)));R.push(+r.dayRating||null);D.push(i);}}
  if(M.length<3)return '';
  var n=M.length,Wd=300,Hh=150,sw=Wd/n,COL=['#b9c6d3','#ccd2d6','#eadfca','#f3d2a6','#f2b98f'];
  var s='<svg viewBox="0 0 '+Wd+' '+Hh+'" preserveAspectRatio="none"><defs><filter id="prg-sky" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="10"/></filter>'+
    '<clipPath id="prg-rv"><rect id="prg-rvR" x="0" y="0" width="'+Wd+'" height="'+Hh+'"/></clipPath></defs><g filter="url(#prg-sky)">';
  M.forEach(function(m,j){s+='<rect x="'+(j*sw-8).toFixed(1)+'" y="-20" width="'+(sw+16).toFixed(1)+'" height="'+(Hh+40)+'" fill="'+COL[m-1]+'"/>';});
  s+='</g>';
  var P=[];R.forEach(function(r,j){if(r!=null)P.push([j*sw+sw/2,22+(1-(r-1)/9)*(Hh-44)]);});
  if(P.length>1)s+='<g clip-path="url(#prg-rv)"><path d="'+prgSmooth(P)+'" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".95"/></g>';
  P.forEach(function(p){s+='<circle class="an" data-x="'+(p[0]*PRG_W/Wd).toFixed(0)+'" cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3.4" fill="#fff"/>';});
  s+='</svg>';
  var h='<div class="prg-sky">'+s+'</div><div class="nums">'+R.map(function(r,j){return '<b class="an'+(j===n-1?' lit':'')+'" data-x="'+((j+.5)/n*PRG_W).toFixed(0)+'">'+(r!=null?nfmt(r):'')+'</b>';}).join('')+'</div>'+
    '<div class="dates">'+D.map(function(d,j){return '<i>'+((n-1-j)%2===0?(d===0?_t('היום'):dfmt(new Date(dayShift(d)+'T12:00:00'),{day:'numeric',month:'numeric'})):'')+'</i>';}).join('')+'</div>'+
    '<div class="mleg">'+[_t('כבד|מצב רוח'),_t('נמוך'),_t('בסדר'),_t('טוב'),_t('מצוין')].map(function(t,j){return '<span><i style="background:'+COL[j]+'"></i>'+t+'</span>';}).join('')+'</div>';
  var a=function(lo,hi){var x=[];D.forEach(function(d,j){if(d>=lo&&d<=hi&&R[j]!=null)x.push(R[j]);});return x.length?x.reduce(function(p,q){return p+q;},0)/x.length:0;},now=a(-6,0),pre=a(-13,-7);
  return prgFrame({noMini:1,t:_t('מצב רוח'),c:'#f2b98f',chart:h,
    say:pre&&now>pre?_t('השבוע בהיר יותר מהקודם'):_t('הגוון הוא מצב הרוח, הקו והמספרים - ציון היום'),sub:pre&&now>pre?_t('הגוון הוא מצב הרוח, הקו והמספרים - ציון היום'):''});
};
function prgCover(b,w,done){
  return '<div class="bcov'+(done?' done':'')+'" style="width:'+w+'px">'+(b.cover?photoImg(b.cover,'alt=""'):'')+'<i></i><b>'+esc(b.title||'')+'</b></div>';
}
PRG_B.book=function(){
  var b=loadBook(),q=loadBookQuotes();if(!b.title)return '';
  var tot=+b.total||0,pg=+b.page||0,p=tot?Math.min(100,pg/tot*100):0,c=PRG_C.amber;
  var h='<div class="bk">'+prgCover(b,92)+'<div class="bki an" data-x="200"><div class="bkp"><b>'+(tot?pfmt(p):nfmt(pg))+'</b><span>'+(tot?_t('עמוד {p} מתוך {t}',{p:pg,t:tot}):_t('עמוד {p}',{p:pg}))+'</span></div>'+
    (tot?'<div class="bch"><div class="fl h grow" data-dim="w" data-v="'+p.toFixed(1)+'" style="width:0;--c:'+c[0]+';--dp:'+c[1]+';--hi:'+c[2]+'"></div></div>':'')+'</div></div>';
  if(q.length)h+='<div class="qh">'+_t('משפטים ששמרת')+'</div>'+q.slice(0,8).map(function(x,j){return '<div class="qt an" data-x="'+(80+j*60)+'">'+esc(x.text)+(x.page?'<small>'+_t('עמ׳ {n}',{n:x.page})+'</small>':'')+'</div>';}).join('');
  return prgFrame({noMini:1,t:_t('הספר שלי'),c:c[0],chart:h,say:tot?_t('עוד {n} עמודים',{n:Math.max(0,tot-pg)}):'',sub:q.length?_t('{n} משפטים שמורים',{n:q.length}):''});
};
PRG_B.bookdone=function(){
  var L=loadBookLibrary(),b=L[0];if(!b)return '';
  var q=b.quotes||[],yr=String(b.finishedDate||'').slice(0,4),n=L.filter(function(x){return String(x.finishedDate||'').slice(0,4)===yr;}).length;
  var h='<div class="fin"><div class="glow"></div>'+prgCover(b,120,1)+'<div class="fint">'+_t('סיימת לקרוא')+'</div><div class="finb">'+esc(b.title)+'</div>'+
    '<div class="fins">'+(b.totalPages?'<span><b>'+nfmt(b.totalPages)+'</b>'+_t('עמודים')+'</span>':'')+'<span><b>'+nfmt(q.length)+'</b>'+_t('משפטים')+'</span></div></div>';
  if(q.length)h+='<div class="pages">'+q.map(function(x,j){return '<div class="pg an" data-x="'+(60+j*60)+'"><p>'+esc(x.text)+'</p>'+(x.page?'<small>'+_t('עמ׳ {n}',{n:x.page})+'</small>':'')+'</div>';}).join('')+'</div>';
  return prgFrame({noMini:1,t:_t('הספר האחרון'),c:PRG_C.amber[0],chart:h,say:_t('הספר ה-{n} השנה',{n:n}),sub:_t('הוא נשמר בספרייה שלך, עם המשפטים שלו')});
};
/* the card glides in from the left; a sweep runs left to right, lines draw
   behind it, each piece and each fill arrives as it passes; the pie draws round */
function prgEnter(sec){
  var c=sec&&sec.querySelector('.card');if(!c)return;
  var r=sec.querySelector('[id^="prg-rvR"]'),an=c.querySelectorAll('.an'),RW=r?+r.getAttribute('width'):0,pm=sec.querySelector('[id^="prg-pmc"]');
  c.style.transition='none';c.style.opacity='0';c.style.transform='translateX(-60px)';if(r)r.setAttribute('width','0');
  [].forEach.call(an,function(e){e.style.transition='none';e.style.opacity='0';e.style.transform='translateY(6px)';});
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    c.style.transition='opacity .5s ease,transform .7s cubic-bezier(.22,.61,.36,1)';c.style.opacity='1';c.style.transform='none';c.classList.add('entered');
    var t0=performance.now(),D=1400,at=function(x){var f=Math.min(1,Math.max(0,x/PRG_W));return 250+D*(1-Math.pow(1-f,1/3))*0.95;};
    if(r)(function step(t){var p=Math.max(0,Math.min(1,(t-t0-250)/D)),e=1-Math.pow(1-p,3);r.setAttribute('width',(e*RW).toFixed(1));if(p<1)requestAnimationFrame(step);})(t0);
    if(pm){var Cc=2*Math.PI*62;(function st(t){var p=Math.min(1,Math.max(0,(t-t0-300)/1300)),e=1-Math.pow(1-p,3);pm.setAttribute('stroke-dasharray',(e*Cc).toFixed(1)+' '+Cc.toFixed(1));if(p<1)requestAnimationFrame(st);})(t0);}
    [].forEach.call(an,function(e){var x=+e.getAttribute('data-x')||0;
      setTimeout(function(){e.style.transition='opacity .35s ease,transform .45s cubic-bezier(.22,.61,.36,1)';e.style.opacity='1';e.style.transform='none';
        [].forEach.call(e.querySelectorAll('.grow'),function(g){var wd=g.getAttribute('data-dim')==='w';g.style.transition=(wd?'width':'height')+' .9s cubic-bezier(.22,.61,.36,1)';g.style[wd?'width':'height']=g.getAttribute('data-v')+'%';});},at(x));});
    hydratePhotos(c);
  });});
}
/* the way in, from an area */
function prgEntryHTML(group){
  return '<button class="prg-entry" onclick="prgOpen(\''+group+'\')"><span><svg viewBox="0 0 24 24"><path d="M4 17l5-5 4 3 7-8"/><path d="M15 7h5v5"/></svg>'+_t('ההתקדמות שלי')+'</span><i>&rsaquo;</i></button>';
}
