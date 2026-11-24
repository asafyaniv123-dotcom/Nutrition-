// Two bugs Asaf found on the phone, 24 Nov.
// 1. "לאן הלך הזמן" wiped what was painted: choosing another category re-rendered the step, and the step
//    re-reads the clock from STORAGE - which holds nothing until המשך. So painting sleep and then tapping
//    work erased the sleep. The category tap now keeps what is on the clock, and the totals follow the finger.
// 2. "מה כבר כתבת היום" printed the clock's raw slots (sleep · sleep · none · none ...) and a bare tick for
//    the day's anchors, because both are arrays the short-answer reader did not know.
// usage: node tools/patches/rf-did-fix.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [];
const P = (a, b) => pairs.push([a, b]);

P(`function rfClockCat(cat){window._clockSelCat=cat;renderReflectStep();}`,
`function rfClockCat(cat){
  /* keep what is painted: the step re-reads the clock from storage */
  var clk=interviewAnswers.timeclock;
  if(Array.isArray(clk)&&clk.length===25)rfSave({timeclock:clk.slice(),timeDistribution:rfClockTotals(clk)});
  window._clockSelCat=cat;renderReflectStep();
}`);
P(`    interviewAnswers.timeclock[h]=cat;clockDraw();
    var clk=interviewAnswers.timeclock;`,
`    interviewAnswers.timeclock[h]=cat;clockDraw();
    var clk=interviewAnswers.timeclock;
    var _rs=document.getElementById('rf-clock-sum');if(_rs)_rs.innerHTML=rfClockTotalsHTML();`);
P(`  if(q.kind==='mood'){var m=RF_MOODS[v-1];return m?m.l:'';}
  if(Array.isArray(v)){`,
`  if(q.kind==='mood'){var m=RF_MOODS[v-1];return m?m.l:'';}
  if(q.kind==='clock'&&Array.isArray(v)){
    var ct=rfClockTotals(v),CC={sleep:PAL.terra200,work:PAL.green500,social:'#c9b8f0',other:PAL.amber500},
        CL={sleep:_t('שינה'),work:_t('עבודה'),social:_t('חברתי'),other:_t('אחר')},k,o=[];
    for(k in ct)if(ct[k])o.push('<span class="sm2-dot" style="background:'+CC[k]+'"></span>'+CL[k]+' <b>'+nfmt(ct[k])+'</b>');
    return o.join(' &nbsp; ');
  }
  if(q.kind==='flow'){
    var fw=parseFlow(v).filter(function(x){return x.w;}).map(function(x){return esc(x.w);});
    return fw.join(' &#8250; ');
  }
  if(Array.isArray(v)){`);

if (rev) {
  for (const [a, b] of pairs.slice().reverse()) { if (s.split(b).length !== 2) throw new Error('reverse: not once: ' + b.slice(0, 80)); s = s.replace(b, () => a); }
} else {
  for (const [a, b] of pairs) { if (s.split(a).length !== 2) throw new Error('not once: ' + a.slice(0, 80)); s = s.replace(a, () => b); }
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied', pairs.length, F);
