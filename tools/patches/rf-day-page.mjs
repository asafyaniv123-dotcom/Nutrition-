// The day's page, redrawn as approved on the review page (Asaf, 24 Nov, version 1 of round 3 + a sneaker for steps).
// One line of reading, top to bottom: the photo as a print, the sentence of the day, three numbers, the day as a
// path, what was written, and then the small things as a quiet list - each question marked by its own thin grey
// icon, the same mark its card wears on the board, so three answers of "good" still read as three questions.
// Nutrition and the clock become one line each that opens on a tap.
// The replaced block of summaryBodyHTML is kept beside this file (rf-day-page.orig.txt) so --reverse is exact.
// usage: node tools/patches/rf-day-page.mjs [file] [--reverse]
import fs from 'node:fs';
import path from 'node:path';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
const ORIG = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1'), 'rf-day-page.orig.txt');
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [];
const P = (a, b) => pairs.push([a, b]);

const START = '  var i,rows=sumFactRows(sum,dateStr),head=rows.slice(0,SUM_HEAD_MAX),rest=rows.slice(SUM_HEAD_MAX);\n';
const END = '  h+=sumProseHTML(sum,_q?{quote:1}:null);\n';
const NEW = `  var i,rows=sumFactRowsIds(sum,dateStr);
  /* THE DAY'S PAGE (24 Nov). One line of reading, top to bottom. */
  h+='<div class="sm2-date">'+fmtDate(dateStr)+'</div>';
  if(hasPh){
    h+='<div class="sm3-pola">'+photoImg(sum.photo,'alt="" style="cursor:zoom-in" '+
       'onclick="event.stopPropagation();photoOpen(&quot;'+esc(sum.photo)+'&quot;)"')+'</div>'+
       (sum.photoCaption?'<div class="sm3-cap">'+esc(sum.photoCaption)+'</div>':'');
  }
  if(sum.moment&&sumSecOn('moment'))h+='<div class="sm3-lead">'+esc(sum.moment)+'</div>';
  /* three numbers in a row: how it felt, the score, the steps */
  var trio='',TRIO={mood:1,dayRating:1,steps:1},rest=[];
  for(i=0;i<rows.length;i++){
    var rw=rows[i];
    if(!TRIO[rw.id]){rest.push(rw);continue;}
    var tv=rw.id==='mood'?(RF_MOODS[sum.mood-1]||{}).l:rw.v;
    trio+='<div class="sm3-t">'+sumIconSVG(rw.id,'sm3-t-ic')+'<div class="sm3-t-n">'+tv+'</div><div class="sm3-t-l">'+rw.l+'</div></div>';
  }
  if(trio)h+='<div class="sm3-trio">'+trio+'</div>';

  if(flowStops.length>0&&sumSecOn('flow')){
    h+='<div class="sm3-sec"><div class="sm3-h">'+sumIconSVG('flow')+'<span>'+_t('מהלך היום')+'</span></div><div class="sm3-path">';
    for(i=0;i<flowStops.length;i++){
      h+='<div class="sm3-stop'+(i===0?' first':'')+(i===flowStops.length-1?' last':'')+'">';
      if(flowStops[i].p)
        h+=photoImg(flowStops[i].p,'class="sm3-stop-ph" '+
          'onclick="event.stopPropagation();photoOpen(&quot;'+esc(flowStops[i].p)+'&quot;)"');
      h+='<span>'+esc(flowStops[i].w)+'</span></div>';
    }
    h+='</div></div>';
  }
  if(Array.isArray(sum.dayTimeline)&&sum.dayTimeline.length&&sumSecOn('flow')){
    h+='<div class="sm3-sec"><div class="sm3-h">'+sumIconSVG('dayTimeline')+'<span>'+sumLabelFor('dayTimeline')+'</span></div><div class="sm2-tl">';
    for(i=0;i<sum.dayTimeline.length;i++)
      h+='<div class="sm2-tl-r"><span>'+esc(sum.dayTimeline[i].t||'')+'</span><b>'+esc(sum.dayTimeline[i].w||'')+'</b></div>';
    h+='</div></div>';
  }
  var _wos=workoutsOn(dateStr);
  if(_wos.length&&sumSecOn('fit')){
    h+='<div class="sm3-sec"><div class="sm3-h">'+sumIconSVG('workoutDone')+'<span>'+_t('אימון')+'</span></div><div class="sm2-wo">';
    for(i=0;i<_wos.length;i++){
      var _wo=_wos[i],_wb=fitBurn(_wo),_bits=[];
      _bits.push(_t('{n} תרגילים',{n:(_wo.exercises||[]).length}));
      if(_wo.duration>0)_bits.push(_t('{n} דקות',{n:_wo.duration}));
      if(_wb)_bits.push(_t('בערך {n} קק"ל',{n:_wb.kcal}));
      h+='<div class="sm2-wo-r"><b>'+esc(_wo.name||_t('אימון'))+'</b>'+
         '<span>'+_bits.join(' · ')+'</span></div>';
    }
    h+='</div></div>';
  }

  h+=sumProseHTML(sum,null);

  /* the small things, as a quiet list - and the two that open on a tap */
  var more='',drawer='';
  for(i=0;i<rest.length;i++)
    more+='<div class="sm3-k">'+sumIconSVG(rest[i].id)+'<span>'+rest[i].l+'</span></div><div class="sm3-v">'+rest[i].v+'</div>';
  if(sum.timeclock&&sumSecOn('time')&&sum.timeclock.some(function(hx){return hx!=='none';})){
    var TC={sleep:PAL.terra200,work:PAL.green500,social:'#c9b8f0',other:PAL.amber500};
    var TL={sleep:_t('שינה'),work:_t('עבודה'),social:_t('חברתי'),other:_t('אחר')};
    var clkD=sum.timeclock,cnts2={sleep:0,work:0,social:0,other:0},ck,tparts=[];
    for(var hi4=0;hi4<25;hi4++){if(cnts2[clkD[hi4]]!==undefined)cnts2[clkD[hi4]]++;}
    for(ck in cnts2)if(cnts2[ck])tparts.push('<span class="sm2-dot" style="background:'+TC[ck]+'"></span>'+TL[ck]+' '+nfmt(cnts2[ck]));
    more+='<div class="sm3-k">'+sumIconSVG('timeclock')+'<span>'+_t('לאן הלך הזמן')+'</span></div>'+
          '<button class="sm3-v sm3-open" onclick="event.stopPropagation();sumOpenPart(this,\\'sm3-clock\\')">'+tparts.join(' · ')+' <i>&#8249;</i></button>';
    drawer+='<div class="sm3-drawer sm3-clock" hidden><canvas id="sum-clock-canvas" width="160" height="166"></canvas></div>';
    window._sumClockData=clkD;
    window._sumClockNeedsDraw=true;
  }
  /* only a day something was eaten or drunk on: zeros are not a fact about it */
  if(sum.kcal!==undefined&&(sum.kcal>0||sum.water>0)&&sumSecOn('food')){
    var kp=Math.min(100,Math.round(sum.kcal/TARGETS.kcal*100)),pp2=Math.min(100,Math.round(sum.p/TARGETS.p*100)),cp3=Math.min(100,Math.round(sum.c/TARGETS.c*100)),fp2=Math.min(100,Math.round(sum.f/TARGETS.f*100));
    var nb='<div class="sm2-nut"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">';
    var smb=[{v:nfmt(sum.kcal),pct:kp,lbl:''+_t('קק"ל')+'',g:'linear-gradient(180deg,var(--violet-300),var(--violet-500))'},{v:fmtGrams(sum.p),pct:pp2,lbl:''+_t('חלבון')+'',g:'linear-gradient(180deg,#f3b9a8,#e08a72)'},{v:fmtGrams(sum.c),pct:cp3,lbl:''+_t('פחמימה')+'',g:'linear-gradient(180deg,#bfe0c7,#8fc79e)'},{v:fmtGrams(sum.f),pct:fp2,lbl:''+_t('שומן')+'',g:'linear-gradient(180deg,#f6dfa0,#e8c162)'}];
    for(var bi2=0;bi2<smb.length;bi2++){var sb=smb[bi2];nb+='<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><div style="width:24px;height:68px;background:var(--line);border-radius:12px;overflow:hidden;position:relative"><div style="position:absolute;bottom:0;width:100%;height:'+(+sb.pct||0)+'%;background:'+sb.g+'"></div></div><div style="font-size:10.5px;font-weight:700">'+sb.v+'</div><div style="font-size:9px;color:var(--muted)">'+sb.lbl+'</div></div>';}
    /* Against the READER'S target, not against 3000. */
    if(sum.water){var wp2=Math.min(100,Math.round(sum.water/(TARGETS.water||3000)*100));nb+='<div style="margin-top:10px;display:flex;align-items:center;gap:8px;grid-column:1/-1"><span style="font-size:11px;color:#5b8fa8">'+_t('מים')+'</span><div style="flex:1;height:6px;background:var(--line);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+wp2+'%;background:linear-gradient(90deg,#74b9e8,var(--water-500))"></div></div><span style="font-size:10px;color:#5b8fa8">'+fmtVolume(sum.water)+'</span></div>';}
    nb+='</div></div>';
    var fparts=[];
    if(sum.kcal>0)fparts.push(_t('{n} קק"ל',{n:sum.kcal}));
    if(sum.p>0)fparts.push(fmtGrams(sum.p)+' '+_t('חלבון'));
    more+='<div class="sm3-k">'+sumIconSVG('food')+'<span>'+_t('תזונה')+'</span></div>'+
          '<button class="sm3-v sm3-open" onclick="event.stopPropagation();sumOpenPart(this,\\'sm3-food\\')">'+fparts.join(' · ')+' <i>&#8249;</i></button>';
    drawer+='<div class="sm3-drawer sm3-food" hidden>'+nb+'</div>';
  }
  if(more)h+='<div class="sm3-rule"></div><div class="sm3-more">'+more+'</div>'+drawer;
`;

P(`function sumFactRows(sum,dateStr){`,
`/* the same rows, each carrying the id it answers, so the page can mark it */
function sumFactRowsIds(sum,dateStr){
  var hid=sumHiddenIds(),out=[],i,id,val;
  for(i=0;i<SUM_FACT_IDS.length;i++){
    id=SUM_FACT_IDS[i];
    if(hid[id])continue;
    val=sumFactValue(sum,id,dateStr);
    if(!val)continue;
    out.push({id:id,l:sumLabelFor(id),v:val});
  }
  return out;
}
/* A question's own mark: the icon its card wears on the board, drawn thin and
   grey on the day's page. The four that are not cards borrow the nearest. */
function sumIconSVG(id,cls){
  var own={song:'note',quote:'quote',moment:'spark',photo:'face',food:'bowl',
    energyGiversNote:'sun',energyDrainersNote:'cloud',selfCareNote:'heart'},ic=own[id],i;
  if(!ic)for(i=0;i<RF_STAGE2.length;i++)if(RF_STAGE2[i].id===id){ic=RF_STAGE2[i].ic;break;}
  if(!ic||!RF_ICONS[ic])return '';
  return '<svg class="'+(cls||'sm3-ic')+'" viewBox="0 0 24 24" aria-hidden="true">'+RF_ICONS[ic]+'</svg>';
}
/* the clock and the food open in place, under the list */
function sumOpenPart(btn,cls){
  var root=btn.closest('.rfd-card,.summary-sheet')||document,d=root.querySelector('.'+cls);
  if(!d)return;
  d.hidden=!d.hidden;btn.classList.toggle('on',!d.hidden);
  if(!d.hidden&&cls==='sm3-clock')drawSumClock(window._sumClockData);
}
function sumFactRows(sum,dateStr){`);
// the prose: each written answer carries its question's mark
P(`      items+='<div class="sm2-pz">'+(lab&&lab!==sec?'<div class="sm2-pz-l">'+lab+'</div>':'')+`,
`      items+='<div class="sm2-pz">'+(lab?'<div class="sm2-pz-l">'+sumIconSVG(id)+'<span>'+lab+'</span></div>':'')+`);
P(`    h+='<section class="sm2-grp"><h4>'+sec+'</h4>'+items+'</section>';`,
`    h+='<section class="sm2-grp">'+items+'</section>';`);
// the steps: a sneaker, not footprints (Asaf, 24 Nov)
P(`  steps:'<path d="M8.4 14.8c-1.7-1-2.3-3.3-1.4-5.1l1.2-2.3c1-1.8 3.2-2.4 4.9-1.4 1.7 1 2.3 3.3 1.4 5.1l-1.2 2.3c-1 1.8-3.2 2.4-4.9 1.4Z"/><path d="M8.7 17.8c-1.2-.7-1.6-2.2-1-3.4"/><path d="M17 19.6c-1.2-.7-1.6-2.2-1-3.4"/><path d="M16.7 16.2c-1.7-1-2.3-3.3-1.4-5.1"/>',`,
`  steps:'<path d="M3.6 17.6v-5.2c0-.6.4-1 1-1.1l2.2-.4 1.6 1.6c.5.5 1.2.6 1.8.3l1.5-.8 4.6 2.3 3.1.8c1.2.3 1.9 1.2 1.9 2.3v.2Z"/><path d="M3.6 17.6v1.2c0 .5.4.9.9.9h15.1c.5 0 .9-.4.9-.9v-1.2"/><path d="m9.9 11.3.8 1.1"/><path d="m12 10.4.8 1.1"/>',`);
P(`.sm2-jr{margin-bottom:15px;border-inline-start:2px solid var(--amber-500);padding-inline-start:12px}`,
`.sm2-jr{margin-bottom:15px;border-inline-start:2px solid var(--amber-500);padding-inline-start:12px}
/* ── the day's page (24 Nov): one line of reading, each question its own thin grey mark ── */
.sm2-date{text-align:center;font-size:19px;margin:30px 0 16px}
.sm3-pola{width:68%;max-width:260px;margin:0 auto 6px;padding:8px 8px 10px;background:#f4f2ee;border-radius:6px;
  transform:rotate(-2deg);line-height:0;box-shadow:0 2px 3px rgba(120,110,95,.18),0 10px 22px rgba(120,110,95,.22)}
.sm3-pola img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:3px}
.sm3-pola img.ph-land{aspect-ratio:auto}
.sm3-cap{text-align:center;font-style:italic;font-size:12.5px;color:var(--muted);margin:12px 20px 0;line-height:1.5;unicode-bidi:plaintext}
.sm3-lead{font-size:18px;font-weight:700;line-height:1.5;text-align:center;color:var(--ink);margin:22px 6px 24px;text-wrap:balance;unicode-bidi:plaintext}
.sm3-lead:before{content:"";display:block;width:34px;height:3px;border-radius:2px;margin:0 auto 14px;
  background:rgba(240,169,46,.85);box-shadow:0 0 10px rgba(240,169,46,.55)}
.sm3-trio{display:flex;align-items:flex-start;margin:0 0 26px;text-align:center}
.sm3-t{flex:1;min-width:0;padding:0 4px}
.sm3-t+.sm3-t{box-shadow:inset -1px 0 0 rgba(176,168,156,.28)}
[dir=ltr] .sm3-t+.sm3-t,html:not([dir=rtl]) .sm3-t+.sm3-t{box-shadow:inset 1px 0 0 rgba(176,168,156,.28)}
.sm3-t-ic{display:block;width:19px;height:19px;margin:0 auto 6px}
.sm3-t-n{font-size:22px;font-weight:800;line-height:1.15;color:var(--ink);overflow-wrap:anywhere}
.sm3-t-n i{font-style:normal;font-size:13px;color:var(--muted)}
.sm3-t-l{font-size:11.5px;font-weight:700;color:var(--muted);margin-top:4px}
.sm3-t-ic,.sm3-ic{fill:none;stroke:#a39b90;stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round;flex:none}
.sm3-ic{width:16px;height:16px}
.sm3-sec{margin:0 2px 24px}
.sm3-h,.sm2-pz-l{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:800;color:var(--muted);margin-bottom:10px;letter-spacing:0}
.sm3-path{position:relative;padding-inline-start:22px}
.sm3-path:before{content:"";position:absolute;inset-inline-start:6px;top:9px;bottom:9px;width:2px;border-radius:1px;
  background:linear-gradient(180deg,rgba(143,136,126,.45),rgba(143,136,126,.12))}
.sm3-stop{position:relative;display:flex;align-items:center;gap:8px;font-size:14.5px;line-height:1.45;padding:5px 0;color:var(--ink);unicode-bidi:plaintext}
.sm3-stop:before{content:"";position:absolute;inset-inline-start:-21px;top:11px;width:10px;height:10px;border-radius:50%;
  background:var(--nu-ground,#e9e7e3);box-shadow:inset 1px 1px 2px rgba(176,168,156,.44),0 0 0 1.5px rgba(143,136,126,.45)}
.sm3-stop.first:before,.sm3-stop.last:before{background:rgba(240,169,46,.9);box-shadow:0 0 8px rgba(240,169,46,.55)}
.sm3-stop-ph{width:30px;height:30px;object-fit:cover;border-radius:8px;cursor:zoom-in;flex:none}
.sm2-grp{margin:0 2px 24px}
.sm2-pz{margin-bottom:20px}
.sm2-pz-b{font-size:15px;line-height:1.65}
.sm3-rule{height:1px;background:rgba(176,168,156,.28);margin:4px 2px 20px}
.sm3-more{display:grid;grid-template-columns:auto 1fr;gap:12px 14px;align-items:baseline;margin:0 2px 18px}
.sm3-k{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:var(--muted);white-space:nowrap}
.sm3-k .sm3-ic{width:15px;height:15px}
.sm3-v{font-size:14px;font-weight:700;color:var(--ink);min-width:0;line-height:1.45;overflow-wrap:anywhere}
.sm3-v i{font-style:normal;font-weight:400;color:var(--muted)}
button.sm3-v{border:0;background:none;padding:0;margin:0;font-family:inherit;text-align:start;cursor:pointer}
.sm3-open i{display:inline-block;margin-inline-start:4px;transition:transform .2s}
.sm3-open.on i{transform:rotate(-90deg)}
.sm3-drawer{margin:0 2px 18px}
.sm3-clock canvas{display:block;margin:0 auto}
@media (prefers-reduced-motion:reduce){.sm3-open i{transition:none}}`);

if (rev) {
  for (const [a, b] of pairs.slice().reverse()) { if (s.split(b).length !== 2) throw new Error('reverse: not once: ' + b.slice(0, 80)); s = s.replace(b, () => a); }
  const orig = fs.readFileSync(ORIG, 'utf8');
  if (s.split(NEW).length !== 2) throw new Error('reverse: new block not once');
  s = s.replace(NEW, () => orig);
} else {
  const a = s.indexOf(START), b = s.indexOf(END);
  if (a < 0 || b < 0 || s.indexOf(START, a + 1) >= 0 || s.indexOf(END, b + 1) >= 0 || b < a) throw new Error('block markers');
  const orig = s.slice(a, b + END.length);
  if (!fs.existsSync(ORIG)) fs.writeFileSync(ORIG, orig);
  else if (fs.readFileSync(ORIG, 'utf8') !== orig) throw new Error('orig differs from the saved one');
  s = s.slice(0, a) + NEW + s.slice(b + END.length);
  for (const [x, y] of pairs) { if (s.split(x).length !== 2) throw new Error('not once: ' + x.slice(0, 80)); s = s.replace(x, () => y); }
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied', pairs.length + 1, F);
