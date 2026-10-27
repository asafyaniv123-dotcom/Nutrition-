/* Asaf, 27 Oct:
 * 1. a task stretched at the end of the month could not cross into the next:
 *    the grid ended on the month's last day. The last week is now completed
 *    with the next month's first days (quieter), so a run can be pulled onto
 *    them, and what is already there shows.
 * 2. the writing bar chooses a colour: a dot of the current colour beside
 *    the star; a tap opens the twelve colours above the bar, a choice closes
 *    them. Day and month share it. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

rep(`  for(i=1;i<=days;i++){
    var st=year+'-'+(mi<9?'0':'')+(mi+1)+'-'+(i<10?'0':'')+i;
    h+='<div class="mo-cell'+(st===today?' today':'')+(st===_moOpen?' mo-open':'')+'" data-date="'+st+'" onclick="moCellTap(\\''+st+'\\')">';
    h+='<div class="mo-n">'+nfmt(i)+'</div>';`,
`  /* the last week runs on into the next month, so a run can cross into it */
  var _trail=(7-(lead+days)%7)%7;
  for(i=1;i<=days+_trail;i++){
    var st=wkStamp(new Date(year,mi,i,12));
    h+='<div class="mo-cell'+(i>days?' mo-next':'')+(st===today?' today':'')+(st===_moOpen?' mo-open':'')+'" data-date="'+st+'" onclick="moCellTap(\\''+st+'\\')">';
    h+='<div class="mo-n">'+nfmt(i>days?i-days:i)+'</div>';`);

/* 2 - the colour in the writing bar */
rep(`  var row=_dpLibShow?lib:loose;
  if(row.length){`, `  var row=_dpLibShow?lib:loose;
  if(_dpColShow){
    h+='<div class="dpk-cols">'+wkSwatches("dpkColor('%K%')",_mo?(_wkNewColor||'lav'):(_dpNewColor||'lav'))+'</div>';
  }else if(row.length){`);
rep(`     '<button class="dpk-lib'+(_dpLibShow?' on':'')+'" onclick="_dpLibShow=!_dpLibShow;dpRail()" aria-label="'+esc(_t('משימות חוזרות'))+'">&#9734;</button>'+`,
`     '<button class="dpk-lib'+(_dpLibShow?' on':'')+'" onclick="_dpColShow=false;_dpLibShow=!_dpLibShow;dpRail()" aria-label="'+esc(_t('משימות חוזרות'))+'">&#9734;</button>'+
     '<button class="dpk-col'+(_dpColShow?' on':'')+'" onclick="_dpLibShow=false;_dpColShow=!_dpColShow;dpRail()" aria-label="'+esc(_t('צבע'))+'"><i style="background:'+wkColor(_mo?(_wkNewColor||'lav'):(_dpNewColor||'lav')).dot+'"></i></button>'+`);
rep(`var _dpLibShow=false,_dpDeepOpen=false;`, `var _dpLibShow=false,_dpDeepOpen=false,_dpColShow=false;
function dpkColor(k){_dpNewColor=k;_wkNewColor=k;_dpColShow=false;dpRail();var e=document.getElementById('dp-rail-in');if(e)e.focus();}`);

rep(`body.dpk-on #content{padding-bottom:150px}`, `body.dpk-on #content{padding-bottom:150px}
.dpk-cols{padding:8px 10px 12px}
.dpk-cols .wk-sw{max-width:none;gap:10px;justify-content:center}
.dpk-cols .wk-swatch{width:28px;height:28px}
.dpk-col{flex:none;width:44px;height:44px;border:none;border-radius:16px;cursor:pointer;display:grid;place-items:center;background:#e9e7e3;
  box-shadow:-3px -3px 7px rgba(255,255,255,.95),4px 5px 10px rgba(168,160,148,.3)}
.dpk-col i{width:18px;height:18px;border-radius:50%;box-shadow:0 1px 3px rgba(90,74,60,.3)}
.dpk-col.on{box-shadow:inset 2px 3px 6px rgba(168,160,148,.45),inset -2px -2px 5px rgba(255,255,255,.95)}
html body.mod-planning .mo-cell.mo-next .mo-n{opacity:.4}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
