/* The new first run (21 Oct 2026), built from review/first-1c .. first-6,
 * home-tour and area-first, each step approved by Asaf.
 *
 *   node tools/patch-first-run.mjs
 *
 * Replaces the door's code (var _doorStep .. doorHTML) and its stylesheet
 * block, and adds three hooks: the home tour after the door, the sand-first
 * landing, and the first-time card on entering an area. The tour and the area
 * cards show ONLY to someone who came through this door (first_run_v2), so
 * nobody already living in the app is suddenly toured.
 * Every edit must find its anchor exactly once or nothing is written.
 */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const nl = (x) => x.replace(/\r?\n/g, EOL);
function between(a, b, repl) {
  const i = s.indexOf(nl(a)), j = s.indexOf(nl(b), i + 1);
  if (i < 0 || j < 0 || s.indexOf(nl(a), i + 1) >= 0) throw new Error('anchor: ' + a.slice(0, 50));
  s = s.slice(0, i) + nl(repl) + s.slice(j);
}
function once(a, b) {
  const n = s.split(nl(a)).length - 1;
  if (n !== 1) throw new Error(n + ' x anchor: ' + a.slice(0, 60));
  s = s.replace(nl(a), () => nl(b));
}

/* ───────────────────────── the stylesheet ───────────────────────── */
const CSS = String.raw`/* ── THE DOOR (first run, rebuilt 21 Oct 2026) ──
   One sand room for the whole door - golden hour, always, with a hint of low
   sun from the left. Beem is in it from the first frame, already smiling, and
   never leaves: on "נתחיל" he slides aside and each step's words arrive beside
   him; he moves with the conversation. Approved step by step on the review
   pages first-1c .. first-6. */
.door{position:fixed;inset:0;z-index:9998;overflow:hidden;background:#ece3d4;color:#4a453f;
  /* ITS OWN MATERIAL, ON ITSELF. The door opens over the home screen, whose hour
     rules set these same tokens on the body - declared here they are the nearest. */
  --nu-ground:#ece3d4;--nu-lit:rgba(255,251,243,.92);--nu-shade:rgba(186,160,124,.46);--nu-shade-soft:rgba(186,160,124,.3);
  --nu-ink:#4a453f;--nu-muted:#5f5850;--nu-amber:#f0a92e}
.door::before{content:"";position:absolute;inset:0 auto auto 0;width:72%;height:520px;pointer-events:none;
  background:radial-gradient(34% 14% at 3% 2%,rgba(255,255,250,.5),transparent 70%),
    linear-gradient(118deg,transparent 6%,rgba(255,255,252,.5) 12%,rgba(255,255,252,.18) 17%,rgba(255,255,252,0) 21%,
      rgba(150,118,80,.05) 24%,rgba(150,118,80,0) 27%,rgba(255,255,252,.28) 31%,rgba(255,255,252,0) 36%,transparent 40%);
  -webkit-mask-image:radial-gradient(120% 90% at 0% 0%,#000 0,#000 30%,transparent 72%);
          mask-image:radial-gradient(120% 90% at 0% 0%,#000 0,#000 30%,transparent 72%);filter:blur(6px)}
.dr2{position:absolute;inset:0;max-width:480px;margin:0 auto}
.dr-lang{position:absolute;top:calc(14px + env(safe-area-inset-top));inset-inline-start:20px;z-index:3;border:none;background:var(--nu-ground);
  border-radius:999px;padding:8px 14px;font-family:inherit;font-weight:700;font-size:13px;color:var(--nu-muted);
  box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 11px var(--nu-shade);transition:opacity .4s}
.dr2:not(.at-hi) .dr-lang{opacity:0;pointer-events:none}
/* Beem - one element for the whole door; each step puts him somewhere */
.dr-beem{position:absolute;z-index:2;width:230px;height:230px;left:calc(50% - 115px);top:15%;transform-origin:0 0;
  transition:left .85s cubic-bezier(.2,.9,.3,1),top .85s cubic-bezier(.2,.9,.3,1),transform .85s cubic-bezier(.2,.9,.3,1),opacity .6s}
.dr2.at-name .dr-beem,.dr2.at-gender .dr-beem{left:14px;top:46px;transform:scale(.5)}
.dr2.at-areas .dr-beem{left:calc(100% - 129px);top:46px;transform:scale(.5)}
.dr2.at-why .dr-beem{left:calc(50% - 69px);top:34px;transform:scale(.6)}
.dr2.at-time .dr-beem{left:calc(50% - 58px);top:30px;transform:scale(.5)}
.dr2.at-timeok .dr-beem{left:calc(50% - 115px);top:13%;transform:none}
.dr2.at-mood .dr-beem,.dr2.at-moment .dr-beem{left:14px;top:46px;transform:scale(.42)}
.dr2.at-day1 .dr-beem{left:calc(50% + 40px);top:40px;transform:scale(.48)}
.dr2.at-remind .dr-beem{left:calc(50% - 92px);top:12%;transform:scale(.8)}
[dir=rtl] .dr2.at-name .dr-beem,[dir=rtl] .dr2.at-gender .dr-beem,[dir=rtl] .dr2.at-mood .dr-beem,[dir=rtl] .dr2.at-moment .dr-beem{left:14px}
[dir=ltr] .dr2.at-name .dr-beem,[dir=ltr] .dr2.at-gender .dr-beem,[dir=ltr] .dr2.at-mood .dr-beem,[dir=ltr] .dr2.at-moment .dr-beem{left:calc(100% - 129px)}
[dir=ltr] .dr2.at-areas .dr-beem{left:14px}
/* the well of סיום יום, for the first reflection */
.dr-well{position:absolute;z-index:1;left:calc(50% - 56px);top:34px;width:112px;height:112px;border-radius:50%;overflow:hidden;opacity:0;
  transform:scale(.8);transition:opacity .6s,transform .8s cubic-bezier(.2,.9,.3,1),box-shadow .8s;
  box-shadow:inset 7px 9px 16px var(--nu-shade),inset -7px -7px 15px var(--nu-lit),0 0 0 1px rgba(255,255,255,.4)}
.dr-well i{position:absolute;inset:0;border-radius:50%;transition:background .9s ease;
  background:radial-gradient(85% calc(var(--fill,0) * 100% + 4%) at 50% 104%,rgba(77,127,190,.5) 0%,rgba(120,168,226,.34) 38%,rgba(178,205,237,.14) 62%,transparent 78%)}
.dr2.at-mood .dr-well,.dr2.at-moment .dr-well{opacity:1;transform:none}
.dr2.at-day1 .dr-well{opacity:1;transform:translateY(64px) scale(1.6);
  box-shadow:inset 4px 6px 10px var(--nu-shade),inset -4px -4px 9px var(--nu-lit),0 0 24px 6px rgba(140,184,232,.45)}
/* a step: its words, arriving from the side */
.dr-step{position:absolute;inset:0;box-sizing:border-box;padding:calc(22px + env(safe-area-inset-top)) 24px calc(30px + env(safe-area-inset-bottom));
  display:flex;flex-direction:column;animation:drIn .55s cubic-bezier(.2,.9,.3,1) .2s both}
@keyframes drIn{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:none}}
[dir=ltr] .dr-step{animation-name:drInL}
@keyframes drInL{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
.dr-body{flex:1;display:flex;flex-direction:column;padding-top:150px;min-height:0;overflow-y:auto}
.dr-q2{font-size:30px;font-weight:800;letter-spacing:-.4px;line-height:1.2;margin:0 0 8px;color:var(--nu-ink)}
.dr-w2{font-size:15px;line-height:1.55;color:var(--nu-muted);margin:0 0 24px;max-width:340px}
.dr-btn{width:100%;border:none;border-radius:18px;padding:17px;background:var(--nu-ground);font-family:inherit;font-weight:800;font-size:17px;
  color:var(--nu-ink);box-shadow:-6px -6px 15px var(--nu-lit),8px 10px 22px var(--nu-shade);flex:0 0 auto}
.dr-btn:disabled{opacity:.45}
.dr-later{border:none;background:none;font-family:inherit;font-weight:700;font-size:14px;color:var(--nu-muted);margin-top:10px;padding:8px;flex:0 0 auto}
/* 1 · welcome */
.dr-hi2{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;padding-bottom:8vh}
.dr-hi2 .w{font-size:15px;font-weight:700;color:var(--nu-muted);margin-bottom:6px}
.dr-hi2 .n{font-size:42px;font-weight:800;letter-spacing:-1px;line-height:1.05;margin:0 0 14px;direction:ltr;color:var(--nu-ink)}
.dr-hi2 p{font-size:16px;line-height:1.6;color:var(--nu-muted);margin:0;max-width:340px;text-wrap:balance}
.dr-hi2 .l{font-size:12.5px;color:var(--nu-muted);margin-top:14px}
/* the language list */
.dr-ls{position:absolute;inset:0;z-index:6;background:rgba(42,34,27,.35);opacity:0;pointer-events:none;transition:opacity .3s}
.dr-ls.on{opacity:1;pointer-events:auto}
.dr-lp{position:absolute;left:0;right:0;bottom:0;background:var(--nu-ground);border-radius:26px 26px 0 0;
  padding:10px 18px calc(24px + env(safe-area-inset-bottom));transform:translateY(100%);transition:transform .4s cubic-bezier(.2,.9,.3,1);
  box-shadow:0 -10px 30px rgba(20,14,8,.18);max-height:78%;overflow-y:auto}
.dr-ls.on .dr-lp{transform:none}
.dr-lp::before{content:"";display:block;width:40px;height:5px;border-radius:3px;background:#cdbfac;margin:0 auto 14px}
.dr-ll{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.dr-lr{border:none;border-radius:16px;padding:14px 16px;background:var(--nu-ground);font-family:inherit;font-weight:800;font-size:17px;color:var(--nu-ink);
  box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 11px var(--nu-shade-soft);text-align:center}
.dr-lr.on{box-shadow:inset 3px 4px 9px var(--nu-shade),inset -3px -3px 8px var(--nu-lit)}
/* 2 · name, address */
.dr-field{width:100%;box-sizing:border-box;border:none;border-radius:18px;padding:17px 18px;background:var(--nu-ground);font-family:inherit;
  font-size:20px;font-weight:700;color:var(--nu-ink);box-shadow:inset 4px 5px 10px var(--nu-shade),inset -4px -4px 9px var(--nu-lit);outline:none;unicode-bidi:plaintext}
.dr-field::placeholder{color:#8f877d;font-weight:600}
.dr-said{font-size:18px;font-weight:800;min-height:28px;margin:18px 2px 0}
.dr-rows{display:flex;flex-direction:column;gap:12px}
.dr-r2{border:none;border-radius:18px;padding:17px 18px;background:var(--nu-ground);font-family:inherit;font-weight:800;font-size:18px;color:var(--nu-ink);
  text-align:start;box-shadow:-5px -5px 12px var(--nu-lit),6px 8px 16px var(--nu-shade-soft)}
.dr-r2.on{box-shadow:inset 4px 5px 10px var(--nu-shade),inset -4px -4px 9px var(--nu-lit)}
/* 3 · what matters: a cloud of chips, each a rendered object */
.dr2.at-areas .dr-body{padding-top:168px}
.dr-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:12px 10px}
.dr-chip{display:inline-flex;align-items:center;gap:8px;border:none;border-radius:999px;padding:7px 16px 7px 10px;background:var(--nu-ground);
  font-family:inherit;font-weight:800;font-size:16.5px;color:var(--nu-ink);box-shadow:-4px -4px 10px var(--nu-lit),5px 7px 14px var(--nu-shade-soft);
  transition:box-shadow .25s,transform .2s;animation:drChip .45s cubic-bezier(.2,.9,.3,1) both}
[dir=rtl] .dr-chip{padding:7px 10px 7px 16px}
.dr-chip img{width:38px;height:38px;object-fit:contain;transition:transform .3s cubic-bezier(.2,.9,.3,1)}
.dr-chip.on{box-shadow:inset 3px 4px 9px var(--nu-shade),inset -3px -3px 8px var(--nu-lit),0 0 0 2px color-mix(in srgb,var(--a) 35%,transparent),
  0 0 18px 2px color-mix(in srgb,var(--a) 28%,transparent)}
.dr-chip.on img{transform:scale(1.12) rotate(-6deg)}
@keyframes drChip{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
/* 4 · why, then when */
.dr2.at-why .dr-body{padding-top:180px}
.dr-pts{display:flex;flex-direction:column;gap:14px;margin:20px 0 24px}
.dr-pt{display:flex;align-items:center;gap:14px;font-size:18px;font-weight:700}
.dr-pt small{display:block;font-size:14px;font-weight:600;color:var(--nu-muted);margin-top:2px;line-height:1.45}
.dr-pic{flex:0 0 46px;height:46px;border-radius:50%;background:var(--nu-ground);display:flex;align-items:center;justify-content:center;color:#b0782e;
  box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 11px var(--nu-shade-soft)}
.dr-pic svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.dr-how{font-size:16px;line-height:1.6;padding:16px 18px;border-radius:18px;box-shadow:inset 3px 4px 9px var(--nu-shade-soft),inset -3px -3px 8px var(--nu-lit)}
.dr-quick{display:flex;gap:10px;margin:0 0 18px}
.dr-qk{border:none;border-radius:999px;padding:9px 18px;background:var(--nu-ground);font-family:inherit;font-weight:800;font-size:15px;color:var(--nu-ink);
  box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 11px var(--nu-shade-soft)}
.dr-wheel{position:relative;display:flex;justify-content:center;align-items:center;gap:6px;height:220px;border-radius:24px;flex:0 0 auto;
  box-shadow:inset 4px 5px 12px var(--nu-shade),inset -4px -4px 10px var(--nu-lit);overflow:hidden;
  -webkit-mask-image:linear-gradient(transparent,#000 28%,#000 72%,transparent);mask-image:linear-gradient(transparent,#000 28%,#000 72%,transparent)}
.dr-wheel .win{position:absolute;left:14px;right:14px;top:calc(50% - 30px);height:60px;border-radius:16px;pointer-events:none;
  box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 11px var(--nu-shade-soft)}
.dr-col{position:relative;height:220px;width:92px;overflow-y:scroll;scroll-snap-type:y mandatory;scrollbar-width:none;padding:80px 0;box-sizing:border-box}
.dr-col::-webkit-scrollbar{display:none}
.dr-col div{height:60px;line-height:60px;text-align:center;font-size:30px;font-weight:800;color:#a1978b;scroll-snap-align:center;transition:color .2s}
.dr-col div.on{color:var(--nu-ink)}
.dr-colon{font-size:30px;font-weight:800;position:relative}
/* 5–7 · the first reflection, day one, the reminder */
.dr-end{flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;align-items:center}
.dr2.at-timeok .dr-end{padding-top:200px}
.dr2.at-day1 .dr-end{padding-top:250px}
.dr2.at-remind .dr-end{padding-top:260px}
.dr-sub2{font-size:15px;line-height:1.55;color:var(--nu-muted);margin:10px auto 0;max-width:330px}
.dr2.at-mood .dr-body,.dr2.at-moment .dr-body{padding-top:180px}
.dr-faces{display:flex;justify-content:space-between;gap:6px;margin-top:22px}
.dr-face{flex:1;border:none;background:var(--nu-ground);border-radius:18px;padding:12px 0 10px;font-family:inherit;font-size:12.5px;font-weight:800;color:var(--nu-muted);
  display:flex;flex-direction:column;align-items:center;gap:6px;box-shadow:-4px -4px 10px var(--nu-lit),5px 7px 14px var(--nu-shade-soft)}
.dr-face svg{width:36px;height:36px;fill:none;stroke-width:1.7;stroke-linecap:round}
.dr-face.on{box-shadow:inset 3px 4px 9px var(--nu-shade),inset -3px -3px 8px var(--nu-lit);color:var(--nu-ink)}
.dr-area{font-size:17px;font-weight:600;line-height:1.5;resize:none}
.dr-streak{display:inline-flex;align-items:baseline;gap:6px;padding:8px 18px;border-radius:999px;margin-bottom:14px;
  box-shadow:inset 3px 4px 9px var(--nu-shade-soft),inset -3px -3px 8px var(--nu-lit)}
.dr-streak b{font-size:26px;font-weight:800;color:#8a5a1e}.dr-streak span{font-size:15px;font-weight:800;color:var(--nu-muted)}
@media (prefers-reduced-motion:reduce){.dr-beem,.dr-well,.dr-step,.dr-chip{transition:none;animation:none}}

/* ── BEEM SHOWS HOME (once, after the door) ──
   Everything dims but one thing; his card sits on the free side. */
.tour{position:fixed;inset:0;z-index:9990;pointer-events:auto}
.tour svg{position:absolute;inset:0;width:100%;height:100%}
.tour path{fill:rgba(42,34,27,.58)}
.tour-c{position:absolute;left:16px;right:16px;max-width:448px;margin:0 auto;background:#ece3d4;border-radius:24px;padding:16px 18px 14px;color:#4a453f;
  box-shadow:0 18px 40px rgba(20,14,8,.35);transition:top .6s cubic-bezier(.2,.9,.3,1)}
.tour-r{display:flex;gap:12px;align-items:flex-start}
.tour-b{flex:0 0 64px;width:64px;height:64px;margin-top:-4px}
.tour-t{font-size:19px;font-weight:800;line-height:1.3;margin:2px 0 6px}
.tour-d{font-size:15.5px;line-height:1.55;color:#5f5850}
.tour-f{display:flex;align-items:center;justify-content:space-between;margin-top:14px}
.tour-dots{display:flex;gap:6px}.tour-dots i{width:7px;height:7px;border-radius:50%;background:#cdbfac}.tour-dots i.on{background:#b0782e}
.tour-x{border:none;background:none;font-family:inherit;font-weight:700;font-size:14px;color:#5f5850;padding:8px}
.tour-n{border:none;border-radius:999px;padding:10px 20px;background:#ece3d4;font-family:inherit;font-weight:800;font-size:15px;color:#4a453f;
  box-shadow:-3px -3px 8px rgba(255,251,243,.92),4px 5px 11px rgba(186,160,124,.46)}

/* ── THE FIRST TIME IN AN AREA ── one card for all seven: the dial's own icon,
   Beem, what the area is for, three things, one first action */
.aint{position:fixed;inset:0;z-index:9980;background:rgba(42,34,27,.42);opacity:0;transition:opacity .35s}
.aint.on{opacity:1}
.aint-c{position:absolute;left:0;right:0;bottom:0;max-width:480px;margin:0 auto;background:#f1ece4;border-radius:28px 28px 0 0;
  padding:14px 22px calc(26px + env(safe-area-inset-bottom));color:#4a453f;transform:translateY(105%);
  transition:transform .55s cubic-bezier(.2,.9,.3,1) .1s;box-shadow:0 -12px 34px rgba(20,14,8,.22)}
.aint.on .aint-c{transform:none}
.aint-c::before{content:"";display:block;width:40px;height:5px;border-radius:3px;background:#d4c9ba;margin:0 auto 12px}
.aint-top{display:flex;align-items:center;gap:12px;margin-bottom:8px}
.aint-disc{width:62px;height:62px;border-radius:50%;background:#f1ece4;display:flex;align-items:center;justify-content:center;color:var(--a);
  box-shadow:-4px -4px 10px rgba(255,255,255,.95),5px 7px 14px rgba(176,168,156,.44),0 0 18px 4px color-mix(in srgb,var(--a) 35%,transparent)}
.aint-disc svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.aint-b{width:58px;height:58px;margin-inline-start:auto}
.aint-t{font-size:27px;font-weight:800;letter-spacing:-.4px;line-height:1.15;margin:4px 0 6px}
.aint-l{font-size:16.5px;line-height:1.55;color:#5f5850;margin:0 0 14px}
.aint-pts{display:flex;flex-direction:column;gap:9px;margin:0 0 18px;padding:0;list-style:none}
.aint-pts li{display:flex;gap:10px;align-items:baseline;font-size:16px;font-weight:700;line-height:1.4}
.aint-pts li::before{content:"";flex:0 0 8px;height:8px;border-radius:50%;background:var(--a);transform:translateY(-1px)}
.aint-go{width:100%;border:none;border-radius:18px;padding:16px;background:#f1ece4;font-family:inherit;font-weight:800;font-size:17px;color:#4a453f;
  box-shadow:-5px -5px 13px rgba(255,255,255,.95),7px 9px 20px rgba(176,168,156,.44),inset 0 -3px 0 color-mix(in srgb,var(--a) 55%,transparent)}
.aint-later{display:block;width:100%;border:none;background:none;font-family:inherit;font-weight:700;font-size:14.5px;color:#5f5850;margin-top:8px;padding:8px}
@media (prefers-reduced-motion:reduce){.aint,.aint-c,.tour-c{transition:none}}
`;

/* ───────────────────────── the code ───────────────────────── */
const JS = String.raw`var _doorStep=0,_doorPick=[],_doorSteps=[];
/* THE DOOR, rebuilt 21 Oct 2026 from the review pages first-1c .. first-6,
   every step approved before it was built. In order:
     hi      ברוכים הבאים ל־Better Me, the language list in the corner
     name    Beem asks her name
     gender  how to address her - Hebrew only, where the feminine text exists
     areas   what matters, a cloud of chips, each a rendered object
     why     what the app is for, and how: a short questionnaire each evening
     time    at what hour to remind her - a wheel, and morning is a fine answer
     timeok  said back, and an invitation to the first summary
     mood    the first reflection, now - the well starts to fill
     moment  the best moment - the well is full
     day1    day one is saved
     remind  ONLY NOW the reminder, with one yes, then the phone's own prompt
   then home, a sand landing that eases to the hour, and Beem's tour.
   No account and no sign-in, on purpose - nothing leaves the phone. */
var _dr={beem:null,name:'',time:[21,30],picked:[]};
function doorSteps(){
  var a=['hi','name'];
  if(appLang()==='he')a.push('gender');
  return a.concat(['areas','why','time','timeok','mood','moment','day1','remind']);
}
function doorOpen(){
  if(document.getElementById('door'))return;
  _doorStep=0;_doorPick=[];_doorSteps=doorSteps();_dr.name=greetName()||'';
  var w=document.createElement('div');
  w.id='door';w.className='door';
  w.innerHTML='<div class="dr2 at-hi" id="dr2"><div class="dr-beem" id="dr-beem"></div><div class="dr-well"><i id="dr-fill"></i></div>'+
    '<div id="dr-host"></div><div class="dr-ls" id="dr-ls" onclick="if(event.target===this)doorLangClose()"><div class="dr-lp"><div class="dr-ll" id="dr-ll"></div></div></div></div>';
  document.body.appendChild(w);
  document.body.classList.add('mod-door');
  /* he is there from the first frame, already smiling */
  beemKit().then(function(K){var el=document.getElementById('dr-beem');
    if(el&&!el.firstChild)_dr.beem=K.mount(el,{play:DOOR_BEEM.smile});}).catch(function(){});
  doorPaint();
}
/* his small reactions, from the kit's own faces and motions - no new art */
var DOOR_BEEM={
  smile:{dur:12000,ev:[[0,'face','happy'],[0,'mode',{breathe:[.018,4],idle:0}],[2600,'nod',1,6],
    [4200,'fx',{t:'rings',v:{sc:[1.08,1.11,1.14]},d:3200,s:120}],[7600,'fx',{t:'rings',v:{sc:1},d:2600,s:120}],
    [9000,'face','wink'],[9450,'face','happy']]},
  listen:{dur:4000,ev:[[0,'face','curious'],[0,'mode',{breathe:[.016,4],idle:0}],[200,'look',0,-6]]},
  think:{dur:4000,ev:[[0,'face','thinking'],[0,'mode',{breathe:[.016,4],idle:0}]]},
  nod:{dur:2600,ev:[[0,'face','happy'],[0,'mode',{breathe:[.018,4],idle:0}],[100,'nod',1,7]]},
  calm:{dur:3000,ev:[[0,'face','calm'],[0,'mode',{breathe:[.016,4],idle:0}],[100,'nod',1,4]]},
  glad:{dur:6000,ev:[[0,'face','happy'],[0,'mode',{breathe:[.018,4],idle:0}],[150,'nod',1,10],[1100,'face','wink'],[1500,'face','happy'],
    [1700,'fx',{t:'rings',v:{sc:[1.1,1.13,1.16]},d:1600,s:100}],[3400,'fx',{t:'rings',v:{sc:1},d:1600,s:100}]]}
};
function doorBeem(k){if(_dr.beem)try{_dr.beem.play(DOOR_BEEM[k]);}catch(e){}}
function doorNext(){
  _doorStep++;
  if(_doorStep>=_doorSteps.length)doorFinish();else doorPaint();
}
function doorGo(step){var i=_doorSteps.indexOf(step);if(i<0)return doorNext();_doorStep=i;doorPaint();}
function doorPaint(){
  var w=document.getElementById('dr2'),host=document.getElementById('dr-host');
  if(!w||!host)return;
  var step=_doorSteps[_doorStep];
  w.className='dr2 at-'+step;
  host.innerHTML='<div class="dr-step">'+doorHTML()+'</div>';
  if(step==='name'){doorBeem('listen');setTimeout(function(){var e=document.getElementById('dr-nm');if(e)e.focus();},700);}
  if(step==='gender'||step==='why'||step==='hi')doorBeem('smile');
  if(step==='time'){doorBeem('listen');doorWheel();}
  if(step==='timeok'||step==='day1'||step==='remind')doorBeem('glad');
}
function doorHTML(){
  var step=_doorSteps[_doorStep],h='',i,a;
  if(step==='hi'){
    var L=doorLangs(),cur=appLang(),nm='';
    for(i=0;i<L.length;i++)if(L[i][0]===cur)nm=L[i][1];
    return '<button class="dr-lang" onclick="doorLangOpen()">'+esc(nm||cur)+' &#9662;</button>'+
      '<div class="dr-hi2"><div class="w">'+_t('ברוכים הבאים ל־')+'</div><div class="n">Better Me</div>'+
      '<p>'+_t('התכוננו להפוך לגרסה הטובה ביותר של עצמכם.')+'</p>'+
      '<div class="l">'+_t('בלי חשבון. הכול נשאר על הטלפון הזה.')+'</div></div>'+
      '<button class="dr-btn" onclick="doorNext()">'+_t('נתחיל')+'</button>';
  }
  if(step==='name'){
    return '<div class="dr-body"><div class="dr-q2">'+_t('היי, אני בים.')+'<br>'+_t('איך קוראים לך?')+'</div>'+
      '<div class="dr-w2">'+_t('רק כדי שאדע איך לקרוא לך. אפשר גם בלי.')+'</div>'+
      '<input id="dr-nm" class="dr-field" maxlength="24" autocomplete="given-name" value="'+esc(_dr.name)+'" placeholder="'+_t('השם שלך')+'" '+
      'oninput="doorTyping()" onkeydown="if(event.key===&#39;Enter&#39;)doorNamed()">'+
      '<div class="dr-said" id="dr-said"></div></div>'+
      '<button class="dr-btn" id="dr-g2" onclick="doorNamed()"'+(_dr.name?'':' disabled')+'>'+_t('אפשר להמשיך')+'</button>'+
      '<button class="dr-later" onclick="doorNext()">'+_t('אולי אחר כך')+'</button>';
  }
  if(step==='gender'){
    return '<div class="dr-body"><div class="dr-q2">'+_t('איך לפנות אלייך?')+'</div>'+
      '<div class="dr-w2">'+_t('בעברית כל משפט נושא מגדר, אז זה משנה איך כל מסך מדבר אלייך.')+'</div>'+
      '<div class="dr-rows"><button class="dr-r2" onclick="doorGender2(&#39;f&#39;,this)">'+_t('בלשון נקבה')+'</button>'+
      '<button class="dr-r2" onclick="doorGender2(&#39;m&#39;,this)">'+_t('בלשון זכר')+'</button></div></div>';
  }
  if(step==='areas'){
    h='<div class="dr-body"><div class="dr-q2">'+_t('מה חשוב לך?')+'</div>'+
      '<div class="dr-w2">'+_t('בחר כמה שתרצה. מה שתבחר יופיע סביב סיום היום, ואפשר לשנות בכל רגע.')+'</div><div class="dr-chips">';
    var k=0;
    for(i=0;i<HOME_AREAS.length;i++){a=HOME_AREAS[i];if(a.fixed)continue;
      h+='<button class="dr-chip'+(_doorPick.indexOf(a.id)>=0?' on':'')+'" style="--a:'+a.color+';animation-delay:'+(.35+k*.06).toFixed(2)+'s" '+
         'onclick="doorChip(&#39;'+a.id+'&#39;,this)"><img alt="" src="'+liveBase()+'assets/beem-props/'+DOOR_PROPS[a.id]+'.png">'+esc(a.title)+'</button>';k++;}
    return h+'</div></div><button class="dr-btn" id="dr-g4" onclick="doorAreas()"'+(_doorPick.length?'':' disabled')+'>'+_t('אפשר להמשיך')+'</button>';
  }
  if(step==='why'){
    return '<div class="dr-body"><div class="dr-q2">'+_t('כמה דקות בערב.')+'<br>'+_t('יום שלם שנשמר.')+'</div><div class="dr-pts">'+
      doorPt('pause',_t('עוצרים'),_t('רגע אחד בסוף היום, רק בשבילך.'))+
      doorPt('star',_t('שמים לב'),_t('מה היה טוב, מה הרגשת, מי היה שם.'))+
      doorPt('book',_t('זוכרים'),_t('כל ערב נשמר, ויחד הם מספרים את החיים שלך.'))+
      '</div><div class="dr-how">'+_t('את כל זה עושים בשאלון קצר בסוף היום. אני שואל, אתה עונה, וזה הכול.')+'</div></div>'+
      '<button class="dr-btn" onclick="doorNext()">'+_t('הבנתי')+'</button>';
  }
  if(step==='time'){
    return '<div class="dr-body"><div class="dr-q2">'+_t('באיזו שעה תרצה שאזכיר לך?')+'</div>'+
      '<div class="dr-w2">'+_t('כל יום, באותה שעה, אזכיר לך בעדינות. רוב האנשים בוחרים בערב, לפני השינה. ויש מי שמעדיפים בבוקר. הכול טוב.')+'</div>'+
      '<div class="dr-quick"><button class="dr-qk" onclick="doorSetT(21,30)">'+_t('בערב')+'</button><button class="dr-qk" onclick="doorSetT(8,0)">'+_t('בבוקר')+'</button></div>'+
      '<div class="dr-wheel" dir="ltr"><div class="win"></div><div class="dr-col" id="dr-hh"></div><div class="dr-colon">:</div><div class="dr-col" id="dr-mm"></div></div></div>'+
      '<button class="dr-btn" onclick="doorTimed()">'+_t('קבעתי')+'</button>';
  }
  if(step==='timeok'){
    return '<div class="dr-end"><div class="dr-q2">'+_t('כל יום ב־{t}. אזכיר לך.',{t:doorTime()})+'</div>'+
      '<div class="dr-sub2">'+_t('ועכשיו, בוא נסכם יחד את היום הראשון שלך. שתי שאלות קטנות.')+'</div></div>'+
      '<button class="dr-btn" onclick="doorNext()">'+_t('בוא')+'</button>';
  }
  if(step==='mood'){
    h='<div class="dr-body"><div class="dr-q2">'+_t('איך הרגשת היום?')+'</div><div class="dr-faces">';
    for(i=0;i<RF_MOODS.length;i++)h+='<button class="dr-face" onclick="doorMood('+i+',this)">'+rfFace(i,RF_MOODS[i].c,true)+esc(RF_MOODS[i].l)+'</button>';
    return h+'</div></div>';
  }
  if(step==='moment'){
    return '<div class="dr-body"><div class="dr-q2">'+_t('מה היה הרגע הכי טוב שלך היום?')+'</div><div class="dr-w2">'+_t('אפילו רגע קטן.')+'</div>'+
      '<textarea id="dr-mo" class="dr-field dr-area" rows="3" placeholder="'+_t('כתוב כאן…')+'"></textarea></div>'+
      '<button class="dr-btn" onclick="doorMoment()">'+_t('שמרתי')+'</button>'+
      '<button class="dr-later" onclick="doorMoment(1)">'+_t('אין לי משהו היום')+'</button>';
  }
  if(step==='day1'){
    return '<div class="dr-end"><div class="dr-streak"><b>'+nfmt(1)+'</b><span>'+_t('ימים ברצף',{n:1})+'</span></div>'+
      '<div class="dr-q2">'+(_dr.name?_t('היום הראשון שלך נשמר, {name}.',{name:esc(_dr.name)}):_t('היום הראשון שלך נשמר.'))+'</div>'+
      '<div class="dr-sub2">'+_t('רואה איך הבאר התמלאה? כך היא תיראה בכל ערב שתסכם.')+'</div></div>'+
      '<button class="dr-btn" onclick="doorNext()">'+_t('יופי')+'</button>';
  }
  /* remind */
  return '<div class="dr-end"><div class="dr-q2">'+_t('להזכיר לך מחר ב־{t}?',{t:doorTime()})+'</div>'+
    '<div class="dr-sub2">'+_t('רק פעם ביום, ורק בשעה שבחרת. בלי פרסומות ובלי הודעות אחרות.')+'</div></div>'+
    '<button class="dr-btn" onclick="doorRemind2(1)">'+_t('כן, תזכיר לי')+'</button>'+
    '<button class="dr-later" onclick="doorRemind2(0)">'+_t('לא עכשיו')+'</button>';
}
/* the rendered object of each area, for the chips (assets/beem-props) */
var DOOR_PROPS={nutrition:'plate',fitness:'dumbbell',hobbies:'palette',insights:'bulb',people:'heart',planning:'calendar',closet:'shirt'};
var DOOR_ICONS={pause:'<path d="M9 6.5v11"/><path d="M15 6.5v11"/>',
  star:'<path d="m12 3.6 2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L12 16l-5 2.8 1.2-5.6L4 9.4l5.6-.6Z"/>',
  book:'<path d="M5.5 4.2h10a3 3 0 0 1 3 3v12.6H8.5a3 3 0 0 1-3-3Z"/><path d="M5.5 16.8h13"/>'};
function doorPt(ic,t,sm){return '<div class="dr-pt"><span class="dr-pic"><svg viewBox="0 0 24 24">'+DOOR_ICONS[ic]+'</svg></span><span>'+t+'<small>'+sm+'</small></span></div>';}
/* the language list - every language in its own name; Hebrew and Arabic turn
   the screen right to left, the rest left to right, at once */
function doorLangs(){return [['he','עברית'],['en','English'],['de','Deutsch'],['es','Español'],['fr','Français'],['it','Italiano'],
  ['pt','Português'],['ja','日本語'],['zh-Hans','简体中文'],['zh-Hant','繁體中文'],['ar','العربية']];}   // i18n-exempt: each language in its own name
function doorLangOpen(){
  var L=doorLangs(),cur=appLang(),h='',i;
  for(i=0;i<L.length;i++)h+='<button class="dr-lr'+(L[i][0]===cur?' on':'')+'" lang="'+L[i][0]+'" onclick="doorLangPick(&#39;'+L[i][0]+'&#39;)">'+L[i][1]+'</button>';
  document.getElementById('dr-ll').innerHTML=h;
  document.getElementById('dr-ls').classList.add('on');
}
function doorLangClose(){var e=document.getElementById('dr-ls');if(e)e.classList.remove('on');}
function doorLangPick(code){
  try{localStorage.setItem(LANG_KEY,code);}catch(e){}
  langApply(code);
  langLoad(code,function(){
    try{langRepaint();}catch(e){}
    _doorSteps=doorSteps();_doorStep=0;doorPaint();doorBeem('glad');
  });
  setTimeout(doorLangClose,200);
}
function doorTyping(){
  var e=document.getElementById('dr-nm'),b=document.getElementById('dr-g2');
  if(b)b.disabled=!(e&&e.value.trim());
  doorBeem('think');clearTimeout(_dr.tq);_dr.tq=setTimeout(function(){doorBeem('listen');},900);
}
function doorNamed(){
  var e=document.getElementById('dr-nm'),v=e?String(e.value||'').trim().slice(0,24):'';
  if(!v)return;
  _dr.name=v;greetSetName(v);if(e)e.blur();
  var s=document.getElementById('dr-said');if(s)s.textContent=_t('נעים מאוד, {name}.',{name:v});
  doorBeem('glad');setTimeout(doorNext,1400);
}
function doorGender2(g,el){
  if(el)el.classList.add('on');doorBeem('glad');
  /* the very next sentence already speaks to her the way she chose */
  genderSet(g,function(){setTimeout(doorNext,500);});
}
function doorChip(id,el){
  var k=_doorPick.indexOf(id);
  if(k>=0){_doorPick.splice(k,1);el.classList.remove('on');doorBeem('listen');}
  else{_doorPick.push(id);el.classList.add('on');doorBeem('nod');}
  var b=document.getElementById('dr-g4');if(b)b.disabled=!_doorPick.length;
}
/* home_areas already means "what is around"; the first one picked is what
   brought her (CAME_KEY), as the old door asked separately */
function doorAreas(){
  var on=[],i,a;
  for(i=0;i<HOME_AREAS.length;i++){a=HOME_AREAS[i];if(a.fixed||_doorPick.indexOf(a.id)>=0)on.push(a.id);}
  try{localStorage.setItem(AREAS_KEY,JSON.stringify(on));if(_doorPick[0])localStorage.setItem(CAME_KEY,_doorPick[0]);}catch(e){}
  areasMarkSeen();doorBeem('glad');setTimeout(doorNext,500);
}
/* the wheel: hours 0-23, minutes in quarters */
function doorWheel(){
  var H=document.getElementById('dr-hh'),M=document.getElementById('dr-mm'),h='',i;
  if(!H||!M)return;
  for(i=0;i<24;i++)h+='<div>'+(i<10?'0':'')+i+'</div>';H.innerHTML=h;
  h='';[0,15,30,45].forEach(function(m){h+='<div>'+(m<10?'0':'')+m+'</div>';});M.innerHTML=h;
  [H,M].forEach(function(c){c.addEventListener('scroll',function(){doorMark(c);});});
  setTimeout(function(){doorSetT(_dr.time[0],_dr.time[1],true);},30);
}
function doorMark(c){var k=Math.round(c.scrollTop/60),r=c.children,i;for(i=0;i<r.length;i++)r[i].classList.toggle('on',i===k);}
function doorSetT(h,m,instant){
  var H=document.getElementById('dr-hh'),M=document.getElementById('dr-mm');if(!H||!M)return;
  H.scrollTo({top:h*60,behavior:instant?'auto':'smooth'});M.scrollTo({top:(m/15)*60,behavior:instant?'auto':'smooth'});
  setTimeout(function(){doorMark(H);doorMark(M);},instant?0:400);
}
function doorTime(){return dpHM(_dr.time[0],_dr.time[1]);}
function doorTimed(){
  var H=document.getElementById('dr-hh'),M=document.getElementById('dr-mm');
  if(H&&M)_dr.time=[Math.max(0,Math.min(23,Math.round(H.scrollTop/60))),Math.max(0,Math.min(3,Math.round(M.scrollTop/60)))*15];
  /* the hour is kept now; it is switched on only by her yes, after the first summary */
  var o=loadSumRem(),hm=(_dr.time[0]<10?'0':'')+_dr.time[0]+':'+(_dr.time[1]<10?'0':'')+_dr.time[1];
  o.time=hm;saveSumRem(o);
  doorBeem('glad');setTimeout(doorNext,500);
}
/* the first reflection, written through the reflection's own writer */
function doorFill(p){var f=document.getElementById('dr-fill');if(f)f.parentNode.style.setProperty('--fill',p);}
function doorMood(i,el){
  if(el)el.classList.add('on');
  try{_rfDate=todayStr();rfSave({mood:RF_MOODS[i].v});}catch(e){}
  doorFill(.5);doorBeem(i<2?'calm':'nod');setTimeout(doorNext,900);
}
function doorMoment(skip){
  var e=document.getElementById('dr-mo'),v=e?String(e.value||'').trim():'';
  try{_rfDate=todayStr();if(v&&!skip)rfSave({moment:v});}catch(er){}
  doorFill(1);doorBeem('glad');setTimeout(doorNext,700);
}
function doorRemind2(yes){
  var o=loadSumRem();
  o.on=!!yes;
  /* chosen after the hour has already passed means tomorrow, not now */
  o.last=(o.on&&nowHHMM()>=o.time)?todayStr():'';
  saveSumRem(o);
  if(yes){
    /* her tap is the gesture the browser needs, straight after the reason */
    try{
      if(('Notification' in window)&&Notification.permission==='default')sumRemAsk();
      else if(typeof sumRemPushSync==='function')sumRemPushSync();
    }catch(e){}
  }else{try{if(typeof sumRemPushSync==='function')sumRemPushSync();}catch(e){}}
  doorBeem('glad');setTimeout(doorNext,600);
}
`;

/* the finish: home, not the summary; sand first, then the hour; then the tour */
const FINISH_OLD_TAIL = `  /* not the fan. A fan is a menu, and the first minute here should be one
     small honest answer. */
  enterModule('endofday');
}`;
const FINISH_NEW_TAIL = `  /* HOME, not the summary - she has just written her first one. The screen
     opens in the door's sand and eases to the hour's colour, and Beem shows
     her the four things on it. Marked, so the tour and the area cards are for
     people who came through this door and never for anyone already here. */
  try{localStorage.setItem(FIRST_RUN_KEY,'1');}catch(e){}
  _todHoldUntil=Date.now()+4500;homeTodPaint();
  setTimeout(function(){homeTodPaint();},4600);
  try{goHome();}catch(e){}
  setTimeout(homeTour,900);
}
/* ── BEEM SHOWS HOME ── once, right after the door */
var FIRST_RUN_KEY='first_run_v2',TOUR_KEY='home_tour_done';
function homeTour(){
  try{if(localStorage.getItem(TOUR_KEY))return;}catch(e){}
  var steps=[
    {el:'.hdial',ring:false,t:_t('זו החוגה שלך.'),d:_t('כל האזורים שבחרת יושבים עליה. סובב אותה באגודל, ולחיצה על אזור פותחת אותו.')},
    {el:'.hdial .chub',t:_t('וזו הבאר.'),d:_t('כל ערב, כשתסכם את היום, היא מתמלאת באור. זה הלב של הכול.')},
    {el:'.hdial',ring:true,t:_t('השפה של החוגה היא היום שלך.'),d:_t('השעות מסביב, הדברים שבלו״ז כנקודות צבעוניות, והאור הכתום מראה איפה אתה עכשיו.')},
    {el:'.hcmd-row',t:_t('ופה פשוט כותבים.'),d:_t('מה אכלת, מה לזכור, מה לעשות. אפשר גם לדבר. אני כבר אדע לאן זה שייך.')}
  ],k=0;
  if(!document.querySelector('.hdial'))return;
  var w=document.createElement('div');w.className='tour';w.id='tour';
  w.innerHTML='<svg><path id="tour-hole" fill-rule="evenodd"/></svg><div class="tour-c" id="tour-c"><div class="tour-r"><div class="tour-b" id="tour-b"></div>'+
    '<div><div class="tour-t" id="tour-t"></div><div class="tour-d" id="tour-d"></div></div></div>'+
    '<div class="tour-f"><div class="tour-dots" id="tour-dots"></div><div><button class="tour-x" id="tour-x">'+_t('דלג')+'</button>'+
    '<button class="tour-n" id="tour-n"></button></div></div></div>';
  document.body.appendChild(w);
  var B=null;beemKit().then(function(K){B=K.mount(document.getElementById('tour-b'),{play:DOOR_BEEM.smile});}).catch(function(){});
  function circ(cx,cy,r){return 'M'+(cx-r)+' '+cy+'a'+r+' '+r+' 0 1 0 '+(2*r)+' 0a'+r+' '+r+' 0 1 0 '+(-2*r)+' 0Z';}
  function rr(x,y,ww,hh,r){return 'M'+(x+r)+' '+y+'h'+(ww-2*r)+'a'+r+' '+r+' 0 0 1 '+r+' '+r+'v'+(hh-2*r)+'a'+r+' '+r+' 0 0 1 '+(-r)+' '+r+
    'h'+(2*r-ww)+'a'+r+' '+r+' 0 0 1 '+(-r)+' '+(-r)+'v'+(2*r-hh)+'a'+r+' '+r+' 0 0 1 '+r+' '+(-r)+'Z';}
  function show(){
    var s=steps[k],e=document.querySelector(s.el);if(!e)return end();
    var b=e.getBoundingClientRect(),W=innerWidth,H=innerHeight,cx=b.left+b.width/2,cy=b.top+b.height/2,hole,top;
    if(s.el==='.hcmd-row'){hole=rr(b.left-6,b.top-6,b.width+12,b.height+12,30);top=Math.max(12,b.top-210);}
    else if(s.ring){hole=circ(cx,cy,b.width/2+6)+circ(cx,cy,b.width/2-22);top=b.bottom+16;}
    else{var r=s.el==='.hdial'?b.width/2+6:b.width/2+8;hole=circ(cx,cy,r);top=cy+r+16;}
    document.getElementById('tour-hole').setAttribute('d','M0 0H'+W+'V'+H+'H0Z'+hole);
    var c=document.getElementById('tour-c');c.style.top=Math.min(top,H-230)+'px';
    document.getElementById('tour-t').textContent=s.t;document.getElementById('tour-d').textContent=s.d;
    var h='',i;for(i=0;i<steps.length;i++)h+='<i'+(i===k?' class="on"':'')+'></i>';document.getElementById('tour-dots').innerHTML=h;
    document.getElementById('tour-n').textContent=k===steps.length-1?_t('הבנתי'):_t('הבא');
    if(B)try{B.play(k%2?DOOR_BEEM.nod:DOOR_BEEM.glad);}catch(er){}
  }
  function end(){try{localStorage.setItem(TOUR_KEY,'1');}catch(e){}var t=document.getElementById('tour');if(t)t.remove();}
  document.getElementById('tour-n').onclick=function(){k++;if(k>=steps.length)end();else show();};
  document.getElementById('tour-x').onclick=end;
  show();
}
/* ── THE FIRST TIME IN AN AREA ── once per area, for someone who came through
   the new door. The card carries the dial's own icon, so what she learns to
   look for is what is really there. */
var AREA_INTRO_KEY='area_intro_seen';
function areaIntroMaybe(id){
  try{if(localStorage.getItem(FIRST_RUN_KEY)!=='1')return;}catch(e){return;}
  var seen={};try{seen=JSON.parse(localStorage.getItem(AREA_INTRO_KEY)||'{}')||{};}catch(e){}
  if(seen[id])return;
  var I=areaIntroText(id),a=areaDef(id);if(!I||!a)return;
  seen[id]=1;try{localStorage.setItem(AREA_INTRO_KEY,JSON.stringify(seen));}catch(e){}
  var w=document.createElement('div');w.className='aint';w.style.setProperty('--a',a.color);
  w.innerHTML='<div class="aint-c"><div class="aint-top"><div class="aint-disc">'+a.svg+'</div><div class="aint-b" id="aint-b"></div></div>'+
    '<div class="aint-t">'+esc(a.title)+'</div><p class="aint-l">'+I.l+'</p><ul class="aint-pts"><li>'+I.p[0]+'</li><li>'+I.p[1]+'</li><li>'+I.p[2]+'</li></ul>'+
    '<button class="aint-go">'+I.go+'</button><button class="aint-later">'+I.later+'</button></div>';
  document.body.appendChild(w);
  function close(){w.classList.remove('on');setTimeout(function(){w.remove();},400);}
  w.querySelector('.aint-go').onclick=close;w.querySelector('.aint-later').onclick=close;
  w.addEventListener('click',function(e){if(e.target===w)close();});
  beemKit().then(function(K){var el=document.getElementById('aint-b');if(el&&!el.firstChild)K.mount(el,{play:DOOR_BEEM.nod});}).catch(function(){});
  requestAnimationFrame(function(){requestAnimationFrame(function(){w.classList.add('on');});});
}
function areaIntroText(id){
  if(id==='nutrition')return {l:_t('כאן רושמים מה אכלת, בלי לספור קלוריות בראש.'),
    p:[_t('כותבים, מצלמים או מדברים, ואני מחשב'),_t('חלבון, פחמימות ושומן לאורך היום'),_t('מים בלחיצה אחת')],
    go:_t('לרשום ארוחה ראשונה'),later:_t('רוצה יעדים אישיים? 4 שאלות קצרות')};
  if(id==='fitness')return {l:_t('כאן האימונים שלך: מה עשית, איך התקדמת, ומה עושים היום.'),
    p:[_t('רושמים אימון, עם משקלים וחזרות'),_t('שיאים אישיים, ואני חוגג איתך'),_t('אימון מוכן כשאין כוח לחשוב')],
    go:_t('להתחיל אימון ראשון'),later:_t('לבנות לי תוכנית, 3 שאלות')};
  if(id==='hobbies')return {l:_t('הדברים שעושים לך טוב, ולאן הזמן שלך באמת הולך.'),
    p:[_t('מוסיפים תחביב במילה אחת'),_t('מסמנים בכל פעם שעשית אותו'),_t('רואים לאורך שבועות מה מקבל מקום')],
    go:_t('להוסיף תחביב ראשון'),later:_t('אחר כך')};
  if(id==='insights')return {l:_t('שאלות עמוקות יותר על החיים, כשבא לך. אין פה חובה.'),
    p:[_t('נושאים: אני, אנשים, החיים, העולם'),_t('שאלה אחת בכל פעם, בקצב שלך'),_t('התשובות נשמרות ונהיות תמונה של מי שאתה')],
    go:_t('לבחור שאלה ראשונה'),later:_t('אחר כך')};
  if(id==='people')return {l:_t('מי שחשובים לך, כדי שאף אחד לא ייעלם בין הימים.'),
    p:[_t('מוסיפים אדם, עם תמונה אם בא לך'),_t('תזכורת עדינה כשמזמן לא דיברתם'),_t('מי היה איתך, בכל סיכום ערב')],
    go:_t('להוסיף אדם ראשון'),later:_t('אחר כך')};
  if(id==='planning')return {l:_t('מספרים לי מה צריך לקרות, ואני עוזר לסדר את היום והשבוע.'),
    p:[_t('כותבים או אומרים מה יש מחר'),_t('השבוע כולו במבט אחד'),_t('מה שתכננת מופיע על שעון החוגה')],
    go:_t('לתכנן את מחר'),later:_t('אחר כך')};
  if(id==='closet')return {l:_t('מצלמים בגדים פעם אחת, ואז מרכיבים לוקים ורואים מה לבשת.'),
    p:[_t('מצלמים, והרקע נעלם לבד'),_t('מרכיבים לוק מהבגדים שלך'),_t('רואים מה לובשים, ומה נשכח בארון')],
    go:_t('לצלם בגד ראשון'),later:_t('אחר כך')};
  return null;
}`;

/* the finish lives inside the replaced range, so it is written again here:
   its old body up to the redraws, and the new ending */
const FINISH_HEAD = `function doorFinish(){
  try{localStorage.setItem(DOOR_KEY,'1');}catch(e){}
  var w=document.getElementById('door');
  if(w)w.parentNode.removeChild(w);
  document.body.classList.remove('mod-door');
  /* THE SCREEN BEHIND WAS BUILT BEFORE SHE ANSWERED - rebuilt here with the
     home screen's own three painters, so she lands on her own areas and name. */
  try{renderGreeting();}catch(e){}
  try{renderHomeGrid();}catch(e){}
  try{renderHomeToday();}catch(e){}
`;
const tailBody = FINISH_NEW_TAIL;
/* 1. the door's code: from its var to the area helpers */
if (!s.includes(nl(FINISH_OLD_TAIL))) throw new Error('old finish not found - nothing written');
between('var _doorStep=0,_doorPick=[],_doorSteps=[];', 'function areaDef(id){', JS + FINISH_HEAD + tailBody + '\n\n');
/* 3. the stylesheet: the old door block up to the next section */
between('/* ── THE DOOR, IN THE SAME SOFT WHITE MATERIAL ──', '/* ── תובנות, IN THE SAME SOFT WHITE MATERIAL ──', CSS + '\n');
/* 4. the hour can be held - the sand landing */
once(`function homeTodPaint(){
  var t=homeTod(new Date().getHours())`, `var _todHoldUntil=0;
function homeTodPaint(){
  /* right after the door, home opens in the door's sand and only then eases
     into the hour's colour */
  var t=Date.now()<_todHoldUntil?'golden':homeTod(new Date().getHours())`);
/* 5. entering an area for the first time */
once(`function enterModule(mod){
  jrnlFlush();`, `function enterModule(mod){
  setTimeout(function(){areaIntroMaybe(mod);},450);
  jrnlFlush();`);

fs.writeFileSync(F, s);
console.log('first run patched');
