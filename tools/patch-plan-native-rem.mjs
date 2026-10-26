/* Planning reminders as real notifications in the phone shells (Asaf, 26 Oct).
 * A task with a reminder ("a quarter of an hour before") fired only while the
 * app was open - a setInterval in the page. In the iPhone and Android shells
 * every such reminder of the next seven app days is now scheduled with the
 * phone itself, beside the evening reminder and the birthdays, and re-synced
 * whenever a plan is saved and whenever the app comes back. The phone keeps at
 * most 64 pending (iOS's limit), so the soonest are kept; the rest are added
 * on a later sync. An hour before 04:00 belongs to the app day before, so it
 * rings on the next calendar morning. In the shells the in-page check only
 * shows its banner, so nothing rings twice. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`    var out=pplBdayNative();
    if(!o.on)return out.length?LN.schedule({notifications:out}):null;`,
`    var out=pplBdayNative().concat(dpRemNative());
    if(!o.on)return out.length?LN.schedule({notifications:remNativeCap(out)}):null;`);
rep(`      out.push({id:100+i,title:sumRemTitle(),body:sumRemMsg(),schedule:{at:d,allowWhileIdle:true}});
    }
    return out.length?LN.schedule({notifications:out}):null;`,
`      out.push({id:100+i,title:sumRemTitle(),body:sumRemMsg(),schedule:{at:d,allowWhileIdle:true}});
    }
    return out.length?LN.schedule({notifications:remNativeCap(out)}):null;`);
rep(`function remNativeAsk(){`, `/* the phone holds at most 64 pending: keep the soonest */
function remNativeCap(a){return a.sort(function(x,y){return x.schedule.at-y.schedule.at;}).slice(0,60);}
/* every planning reminder of the next seven app days, for the phone to ring */
function dpRemNative(){
  var out=[],k,i,now=Date.now();
  for(k=0;k<7;k++){
    var date=dayShift(k),dp=loadDPlan(date);if(!dp.rem)continue;
    var all=dpAll(date);
    for(i=0;i<all.length;i++){
      var t=all[i],off=dp.rem[t.id];
      if(t.hour===null||typeof off!=='number')continue;
      var at=new Date(date+'T00:00:00');at.setHours(t.hour,t.min||0,0,0);
      if(t.hour<DAY_ENDS_AT)at.setDate(at.getDate()+1);
      at=new Date(at.getTime()-off*60000);
      if(at.getTime()<=now+30000)continue;
      var when=dpHM(t.hour,t.min||0);
      out.push({id:1000+k*100+(i%100),title:t.w,
        body:off?_t('בעוד {n} דק׳ ({when})',{n:off,when:when}):_t('עכשיו ({when})',{when:when}),
        schedule:{at:at,allowWhileIdle:true}});
    }
  }
  return out;
}
/* a plan saved: tell the phone, once, a moment after the last change */
var _dpRemT=null;
function dpRemResync(){if(!remNative())return;clearTimeout(_dpRemT);_dpRemT=setTimeout(function(){try{remNativeSync();}catch(e){}},800);}
function remNativeAsk(){`);
rep(`function saveDPlan(date,o){planPush(dpKey(date));try{localStorage.setItem(dpKey(date),JSON.stringify(o));}catch(e){}}`,
  `function saveDPlan(date,o){planPush(dpKey(date));try{localStorage.setItem(dpKey(date),JSON.stringify(o));}catch(e){}if(typeof dpRemResync==='function')dpRemResync();}`);
rep(`  sumRemShowOS(''+_t('תכנון זמן')+'',plain);
  if(!document.hidden)showToast('⏰ '+t.w);`,
`  /* in the phone shells the phone itself rings it (dpRemNative) */
  if(!remNative())sumRemShowOS(''+_t('תכנון זמן')+'',plain);
  if(!document.hidden)showToast('⏰ '+t.w);`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
