/* review/notifications: Mip in the in-app banner was the old flat PNG face
 * (beem-f-happy over beem-body). The canon is the model sheet, drawn by the
 * engine - so the banner mounts him the way the app's beemCard does, through
 * vendor/beem-app.js. Every banner kind gets him, not a coloured dot. */
import fs from 'fs';
const F = 'review/notifications/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`.ban .ic{flex:none;width:42px;height:42px;border-radius:50%;background:url(../../dev/assets/beem-f-happy.png) center/125% no-repeat,url(../../dev/assets/beem-body.png) center/125% no-repeat}
.ban .ic.dot{background:none;display:grid;place-items:center;box-shadow:inset 2px 3px 6px rgba(168,160,148,.45),inset -2px -2px 5px rgba(255,255,255,.95)}
.ban .ic.dot i{width:12px;height:12px;border-radius:50%}`,
`.ban .ic{flex:none;width:58px;height:58px;margin:-8px -6px -8px -4px;position:relative}`);
rep(`'<div class="ban" key="'+_bi+'"><span class="ic'+(x.k==='evening'||x.k==='streak'?'':' dot')+'">'+(x.k==='evening'||x.k==='streak'?'':'<i style="background:'+x.dot+'"></i>')+'</span>'+`,
  `'<div class="ban"><span class="ic"></span>'+`);
rep(`<div class="t"><b>'+c.t+'</b><span>'+c.b+'</span></div><div class="bs"><button>'+x.acts[0]+'</button><button class="q">✕</button></div></div>';}`,
  `<div class="t"><b>'+c.t+'</b><span>'+c.b+'</span></div><div class="bs"><button>'+x.acts[0]+'</button><button class="q">✕</button></div></div>';
    if(window.BeemKit)BeemKit.ready.then(function(){var ic=document.querySelector('#bans .ic');if(ic)BeemKit.mount(ic,{play:'react'});});}`);
rep(`<script>
/* each kind`, `<script>window.BEEM_ASSET_BASE='../../dev/assets/';</script>
<script src="../../vendor/beem-app.js"></script>
<script>
/* each kind`);
fs.writeFileSync(F, s);
console.log('ok');
