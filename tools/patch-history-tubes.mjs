/* 5B (Asaf, 26 Oct): the history's daily-intake chart drops the purple dashed
 * goal line. Each day is a tube filled toward the goal: full and amber on the
 * goal (within 6%), terracotta above it, a partial pale fill below it, empty
 * on a day with nothing logged. The goal itself is one chip in the corner.
 * Also: the name row leaves the nutrition profile - the name changes in
 * Settings only (Asaf, same day). */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

rep(`    chartCard='<div class="card"><div class="cttl">'+_t('צריכה קלורית מול יעד')+'</div>'+makeSVG([{pts:kp,col:PAL.terra500}],[{v:TARGETS.kcal,col:PAL.violet500,lbl:_t('יעד {n}',{n:TARGETS.kcal})}],minK,maxK,150)+'<div style="display:flex;gap:14px;margin-top:8px;font-size:10px"><span style="font-weight:700"><span style="color:var(--terra-700)">&#x25CF;</span> '+_t('קלוריות')+'</span><span><span style="color:var(--violet-700)">&#x2013;&#x2013;</span> '+_t('יעד {n}',{n:TARGETS.kcal})+'</span></div></div>';`,
`    /* a tube per day, full = the goal (5B, 26.10) - no line */
    var tb='',G=TARGETS.kcal||1;
    for(var tx=0;tx<days.length;tx++){
      var kv=days[tx].kcal,cls=kv>G*1.06?'over':kv>=G*.94?'on':'under',fr=Math.min(1,kv/G);
      tb+='<div class="hst-d'+(days[tx].isToday?' now':'')+'"><div class="hst-t">'+(kv>0?'<i class="'+cls+'" style="top:'+(4+(1-fr)*152).toFixed(1)+'px;animation-delay:'+(tx*.07).toFixed(2)+'s"></i>':'')+'</div>'+
        '<b>'+(kv>0?nfmt(kv):'')+'</b><span>'+days[tx].label+'</span></div>';
    }
    chartCard='<div class="card hst"><div class="hst-h"><div class="cttl" style="margin:0">'+_t('צריכה קלורית מול יעד')+'</div><span class="hst-chip">'+_t('יעד {n}',{n:TARGETS.kcal})+'</span></div>'+
      '<div class="hst-row">'+tb+'</div>'+
      '<div class="hst-leg"><span><i class="on"></i>'+_t('ביעד')+'</span><span><i class="over"></i>'+_t('מעל היעד')+'</span><span><i class="under"></i>'+_t('מתחת ליעד')+'</span></div></div>';`);

rep(`.as-go{margin-top:6px}`, `.as-go{margin-top:6px}
/* the history's intake as tubes (5B, 26.10) */
.hst-h{display:flex;justify-content:space-between;align-items:center;gap:10px}
.hst-chip{flex:none;padding:5px 12px;border-radius:999px;font-size:12.5px;font-weight:800;color:var(--nu-ink,#4a453f);
  box-shadow:-2px -2px 5px var(--nu-lit,rgba(255,255,255,.95)),3px 3px 7px var(--nu-shade-soft,rgba(168,160,148,.3))}
.hst-row{display:flex;justify-content:space-between;margin-top:16px;direction:ltr}
.hst-d{width:13%;text-align:center}
.hst-t{position:relative;height:160px;width:26px;margin:0 auto;border-radius:13px;overflow:hidden;
  box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(168,160,148,.45)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
.hst-t i{position:absolute;left:4px;right:4px;bottom:4px;border-radius:10px;transform-origin:50% 100%;animation:asgFill 1.1s cubic-bezier(.22,.61,.36,1) both}
.hst-t i.on,.hst-leg i.on{background:linear-gradient(#f6c46b,#f0a92e)}
.hst-t i.over,.hst-leg i.over{background:linear-gradient(#ee9f86,#d9735a)}
.hst-t i.under,.hst-leg i.under{background:linear-gradient(#f5dcae,#efc27c)}
.hst-d b{display:block;font-size:10.5px;font-weight:800;color:var(--nu-ink,#4a453f);margin-top:6px;min-height:13px}
.hst-d span{display:block;font-size:10.5px;color:var(--nu-muted,#6d675e);font-weight:600}
.hst-d.now span{font-weight:800;color:var(--nu-ink,#4a453f)}
.hst-leg{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;font-size:11.5px;font-weight:700;color:var(--nu-muted,#6d675e)}
.hst-leg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-inline-end:5px;vertical-align:-1px}`);

rep(`  h+='<div class="pf-row"><label class="pf-lbl">'+_t('שם')+'</label>'+
     '<input class="pf-in" type="text" maxlength="24" placeholder="'+_t("השם שלך")+'" value="'+esc(p.name||'')+'" onchange="profName(this.value)">'+
     '<span class="pf-note">'+_t('לברכה בבית')+'</span></div>';
`, `  /* the name lives in Settings only (26.10) */
`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
