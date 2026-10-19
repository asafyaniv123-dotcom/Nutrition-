/* Three more home directions (round 2, 19 Oct 2026), drawn ON TOP of the
 * shipped direction ב by tools/shoot-home.mjs --ideas. Each is CSS plus a few
 * DOM moves injected into the running page; dev/index.html is never written.
 *
 *   light - סיום יום is a pressed well that fills with light as the evening's
 *           questions are answered (lit-when-done + dented-sensor-breathing)
 *   photo - the day's photograph under frosted glass; the fan sits on it
 *           (glass-login-over-landscape + Asaf's own meadow)
 *   clock - the fan IS the day: the today card dissolves into an hour arc
 *           around the hub, and only the next thing is said, large
 *           (neumorphic-fan-with-gauge)
 */
const P = 'html body.mod-home ';

export const IDEAS = {
  light: {
    css: String.raw`
${P}.chub{background:var(--nu-ground)!important;overflow:hidden;
  box-shadow:inset 7px 9px 16px var(--nu-shade),inset -7px -7px 15px var(--nu-lit),
    0 0 0 1px rgba(255,255,255,.35)!important}
${P}.chub::before{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none;
  background:radial-gradient(85% 62% at 50% 104%,rgba(77,127,190,.5) 0%,rgba(120,168,226,.34) 38%,rgba(178,205,237,.14) 62%,transparent 78%)}
${P}.chub::after{content:"";position:absolute;inset:4px;border-radius:50%;pointer-events:none;
  box-shadow:inset 0 -14px 26px -10px rgba(110,160,224,.55)}
${P}.chub-ic{position:relative;z-index:1;box-shadow:-4px -4px 10px var(--nu-lit),5px 6px 12px var(--nu-shade)!important}
${P}.chub-t{position:relative;z-index:1}
${P}.chub .hub-dot{display:none}
${P}.v-left{position:relative;z-index:1;font-size:11px;font-weight:700;color:#3d6597}
${P}.cray{opacity:.34}
`,
    js: `var h=document.querySelector('.chub');if(h&&!h.querySelector('.v-left')){
      var s=document.createElement('span');s.className='v-left';s.textContent='עוד 4 שאלות';h.appendChild(s);}`,
  },

  photo: {
    css: String.raw`
${P}#home-screen{isolation:isolate;background:none}
${P}#home-screen::before{content:"";position:absolute;inset:0 0 auto 0;height:520px;z-index:-1;
  background:url("/Taste%20library/own%20photos/alpine-meadow-morning.jpg") 50% 62%/cover no-repeat;
  -webkit-mask-image:linear-gradient(to bottom,#000 0,#000 62%,transparent 100%);
          mask-image:linear-gradient(to bottom,#000 0,#000 62%,transparent 100%)}
${P}.greet-w{color:#25302a!important}
${P}.greet-date{color:#33413a!important;font-weight:700}
${P}.cray{display:none}
${P}.cdisc{background:rgba(255,255,255,.8)!important;
  -webkit-backdrop-filter:blur(12px) saturate(1.5);backdrop-filter:blur(12px) saturate(1.5);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 6px 18px rgba(30,50,30,.22)!important}
${P}.cname{display:inline-block;margin-top:3px;padding:2px 7px;border-radius:999px;
  background:rgba(255,255,255,.62);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
${P}.chub{background:rgba(255,255,255,.58)!important;
  -webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 14px 34px rgba(30,50,30,.28)!important}
${P}.chub-ic{background:rgba(255,255,255,.7)!important}
${P}.home-stk .stk{background:rgba(255,255,255,.62)!important;padding:4px 12px!important;
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
${P}.home-menu{background:rgba(255,255,255,.55)!important;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
`,
    js: ``,
  },

  clock: {
    css: String.raw`
${P}.td-wrap{display:none!important}
${P}.cfan{margin-top:40px!important}
${P}.v-next{margin-top:18px!important}
${P}.cray{opacity:.28}
${P}.v-clock{position:absolute;left:0;top:0;pointer-events:none;overflow:visible}
${P}.v-next{width:100%;text-align:center;margin:4px 0 22px}
${P}.v-next .t{display:block;font-size:34px;font-weight:800;color:var(--nu-ink);letter-spacing:-.5px;line-height:1.05;direction:ltr}
${P}.v-next .w{display:block;font-size:18px;font-weight:800;color:var(--nu-ink);margin-top:2px}
${P}.v-next .r{display:inline-block;margin-top:8px;font-size:12.5px;font-weight:700;color:var(--nu-muted)}
${P}.v-next .k{display:block;font-size:11px;font-weight:700;color:var(--nu-muted);letter-spacing:.04em;margin-bottom:4px}
`,
    /* the arc is drawn from the app's own day plan and day window */
    js: `(function(){
      var f=document.querySelector('.cfan'),hub=document.querySelector('.chub');if(!f||!hub||f.querySelector('.v-clock'))return;
      var fr=f.getBoundingClientRect(),hr=hub.getBoundingClientRect();
      var cx=hr.left-fr.left+hr.width/2,cy=hr.top-fr.top+hr.height/2,R=hr.width/2+13;
      var from=DP_FROM*60,to=(DP_TO+1)*60,d=new Date(),mins=d.getHours()*60+d.getMinutes();
      /* RTL: the day starts at the right end of the arc, like the bar it replaces */
      var rtl=document.documentElement.dir==='rtl'||getComputedStyle(document.body).direction==='rtl';
      function ang(m){var p=Math.max(0,Math.min(1,(m-from)/(to-from)));return rtl?p*Math.PI:Math.PI-p*Math.PI;}
      function pt(a,r){return [cx+(r||R)*Math.cos(a),cy-(r||R)*Math.sin(a)];}
      function arc(a0,a1){var p0=pt(a0),p1=pt(a1),large=Math.abs(a1-a0)>Math.PI?1:0,sw=a1>a0?0:1;
        return 'M'+p0[0].toFixed(1)+' '+p0[1].toFixed(1)+' A'+R+' '+R+' 0 '+large+' '+sw+' '+p1[0].toFixed(1)+' '+p1[1].toFixed(1);}
      var a0=ang(from),a1=ang(to),an=ang(mins);
      var NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');
      svg.setAttribute('class','v-clock');svg.setAttribute('width',fr.width);svg.setAttribute('height',fr.height);
      var h='<defs><filter id="vglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2"/></filter></defs>';
      h+='<path d="'+arc(a0,a1)+'" fill="none" stroke="rgba(168,160,148,.42)" stroke-width="9" stroke-linecap="round" transform="translate(1.5,2)"/>';
      h+='<path d="'+arc(a0,a1)+'" fill="none" stroke="#e7e4df" stroke-width="8" stroke-linecap="round"/>';
      h+='<path d="'+arc(a0,a1)+'" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="2" stroke-linecap="round" transform="translate(-1,-1.5)"/>';
      h+='<path d="'+arc(a0,an)+'" fill="none" stroke="rgba(249,206,147,.9)" stroke-width="7" stroke-linecap="round" filter="url(#vglow)"/>';
      h+='<path d="'+arc(a0,an)+'" fill="none" stroke="rgba(240,169,46,.85)" stroke-width="4" stroke-linecap="round"/>';
      var all=dpAll(todayStr()),i,next=null;
      for(i=0;i<all.length;i++){var t=all[i];if(t.hour===null)continue;var m=t.hour*60+(t.min||0),c=wkColor(t.c),p=pt(ang(m));
        var past=m<mins;if(!past&&(!next||m<next.m))next={m:m,t:t};
        h+='<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="4.2" fill="'+c.dot+'" stroke="#fff" stroke-width="1.6" opacity="'+(past?.45:1)+'"/>';}
      var pn=pt(an);
      h+='<circle cx="'+pn[0].toFixed(1)+'" cy="'+pn[1].toFixed(1)+'" r="9" fill="rgba(249,206,147,.95)" filter="url(#vglow)"/>';
      h+='<circle cx="'+pn[0].toFixed(1)+'" cy="'+pn[1].toFixed(1)+'" r="6" fill="#f0a92e" stroke="#fff" stroke-width="2"/>';
      svg.innerHTML=h;f.insertBefore(svg,f.firstChild);
      var sk=document.getElementById('home-stk');if(sk&&next){var n=document.createElement('div');n.className='v-next';
        var notes=todayNotes(todayStr()).length;
        n.innerHTML='<span class="k">הבא</span><span class="t">'+dpHM(next.t.hour,next.t.min||0)+'</span><span class="w">'+esc(next.t.w)+'</span>'+
          '<span class="r">'+notes+' לזכור · כל הלו״ז ›</span>';sk.parentNode.insertBefore(n,sk.nextSibling);}
    })();`,
  },
};
