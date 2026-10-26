/* 4A (Asaf, 26 Oct): after the nutrition questions, before the area opens,
 * one screen that shows what came out of the answers - the day's calories in
 * a pressed well and four tubes (protein, carbs, fat, water) filling to their
 * goal - with a sentence saying why, "מתחילים", and a way to change them. In
 * the setup's own overlay, so Mip stays where he was. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

rep(`.as-go{margin-top:6px}`, `.as-go{margin-top:6px}
/* the goals, once the nutrition questions are answered (4A, 26.10) */
.asg-kc{width:180px;height:180px;margin:14px auto 22px;border-radius:50%;display:grid;place-items:center;flex:none;
  box-shadow:inset 6px 8px 16px var(--nu-shade),inset -6px -6px 14px var(--nu-lit)}
.asg-kc b{display:block;font-size:42px;font-weight:800;letter-spacing:-1px;line-height:1}
.asg-kc span{display:block;font-size:13px;color:var(--nu-muted);font-weight:700;margin-top:4px}
.asg-tubes{display:flex;justify-content:space-around;margin:0 0 20px}
.asg-tb{width:70px;text-align:center}
.asg-t{position:relative;height:140px;width:50px;margin:0 auto;border-radius:25px;overflow:hidden;
  box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit)}
.asg-t i{position:absolute;inset:5px;border-radius:21px;transform-origin:50% 100%;animation:asgFill 1.3s cubic-bezier(.22,.61,.36,1) both}
@keyframes asgFill{from{transform:scaleY(0)}}
.asg-tb b{display:block;font-size:15px;margin-top:9px}
.asg-tb span{display:block;font-size:12.5px;color:var(--nu-muted);font-weight:700}
@media (max-height:700px){.asg-kc{width:140px;height:140px;margin:6px auto 14px}.asg-kc b{font-size:34px}.asg-t{height:100px}}`);

rep(`    p.updatedAt=new Date().toISOString();saveProfile(p);targetsAutoApply();
  } else {`, `    p.updatedAt=new Date().toISOString();saveProfile(p);targetsAutoApply();
    if(t.health==='yes'&&t.ack==='yes'&&t.hl.length)hlSave({ack:todayStr(),on:t.hl.slice(),off:[],coach:t.coach==='yes'});
    if(_aset.steps.indexOf('health')>=0&&t.health)asetMark('health');
    asetGoals();return;
  } else {`);

rep(`function asetChoice(f,v,label,sub,multi){`, `/* WHAT CAME OUT OF THE ANSWERS: the goals, and why, before the area opens */
function asetGoalWhy(g){
  if(g==='lose')return _t('לפי מה שסיפרת: ירידה יציבה במשקל, בלי לוותר על חלבון.');
  if(g==='recomp')return _t('לפי מה שסיפרת: חיטוב. קרוב לתחזוקה, עם הרבה חלבון.');
  if(g==='gain')return _t('לפי מה שסיפרת: עלייה במסה, עם עודף קטן לבנייה.');
  return _t('לפי מה שסיפרת: לשמור על המשקל שלך.');
}
function asetGoals(){
  var ov=document.getElementById('as-ov');if(!ov||!_aset){asetClose();render();return;}
  loadTargets();
  var T0=TARGETS,p=loadProfile(),i,
      tubes=[[_t('חלבון'),fmtGrams(T0.p),'#c7b2e8','#a690cf'],[_t('פחמימה'),fmtGrams(T0.c),'#f3c98a','#e9a24f'],
             [_t('שומן'),fmtGrams(T0.f),'#f2b2a0','#e48a73'],[_t('מים'),fmtVolume(T0.water),'#bcd6ee','#8db8e0']];
  var h='<div class="as-in"><div class="as-top"><span></span><span></span><span></span></div>'+
    '<div class="as-beem" id="as-beem"></div>'+
    '<div class="as-mid"><div class="dr-q2">'+_t('המטרות שלך')+'</div><div class="dr-w2">'+esc(asetGoalWhy(p.goal))+'</div>'+
    '<div class="asg-kc"><div><b>'+nfmt(T0.kcal)+'</b><span>'+_t('קלוריות ביום')+'</span></div></div><div class="asg-tubes">';
  for(i=0;i<tubes.length;i++)
    h+='<div class="asg-tb"><div class="asg-t"><i style="background:linear-gradient('+tubes[i][2]+','+tubes[i][3]+');animation-delay:'+(.35+i*.15)+'s"></i></div><b>'+tubes[i][1]+'</b><span>'+tubes[i][0]+'</span></div>';
  h+='</div></div><button class="dr-btn as-go" onclick="asetClose();render()">'+_t('מתחילים')+'</button>'+
     '<button class="dr-later" onclick="asetClose();switchTab(\\'profile\\')">'+_t('לשנות את המטרות')+'</button></div>';
  var keep=_aset.beemEl;ov.innerHTML=h;ov.scrollTop=0;
  var slot=document.getElementById('as-beem');if(keep&&slot)slot.appendChild(keep);
  if(_aset.beem)try{_aset.beem.play(DOOR_BEEM.glad);}catch(e){}
}
function asetChoice(f,v,label,sub,multi){`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
