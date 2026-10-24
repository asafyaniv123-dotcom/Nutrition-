/* "אימון חדש" did not match the app (Asaf, 24 Oct): two dark filled
 * buttons, violet "edit" chips, and its own title said twice. Now it speaks
 * the material: the start button raised with the area's terracotta seam,
 * each workout a raised row you press to start (the row IS the start), edit
 * a quiet word, the programs card the same. The inner "אימון חדש / חזרה"
 * row goes - the header already says it and has the way home. Classes, so
 * the inline styles that carried the old look are gone. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* the start card */
const c0 = s.indexOf('function fitStartCardHTML(templates){');
const c1 = s.indexOf(`  return h+'</div>';${EOL}}`, c0);
if (c0 < 0 || c1 < 0) { console.log('no start card'); process.exit(1); }
s = s.slice(0, c0) + `function fitStartCardHTML(templates){
  var h='<div class="fs-card">';
  h+='<button class="fs-new" onclick="startEmptyWorkout()"><span>+</span>'+_t('אימון חדש')+'</button>';
  if(templates.length){
    h+='<div class="fs-lab">'+_t('האימונים שלי')+'</div>';
    for(var i=0;i<templates.length;i++){
      var t=templates[i];
      /* the row is the start; edit is the quiet word beside it */
      h+='<div class="fs-row"><button class="fs-go" onclick="startWorkout('+i+')">'+
         '<b>'+esc(t.name)+'</b><span>'+_t('{n} תרגילים',{n:t.exercises.length})+'</span></button>'+
         '<button class="fs-ed" onclick="startFitEdit('+i+')">'+_t('ערוך')+'</button>'+
         '<button class="fs-play" onclick="startWorkout('+i+')" aria-label="'+esc(_t('התחל'))+'">'+
         '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5Z"/></svg></button></div>';
    }
  } else {
    h+='<div class="fs-empty">'+_t('אין עדיין אימונים שמורים.')+'<br>'+_t('סיים אימון חדש ושמור אותו, או בנה אחד מראש.')+'</div>';
  }
  h+='<button class="fs-plan" onclick="startFitEdit(-1)">'+_t('+ בנה אימון מראש')+'</button>';
` .replace(/\n/g, EOL) + s.slice(c1);

/* the duplicated title row */
rep(`  var h='<div style="padding-bottom:24px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">';
  h+='<div style="font-size:15px;font-weight:800;color:var(--ink)">'+_t('אימון חדש')+'</div>';
  h+='<button onclick="_fitView=\\'home\\';renderFitness()" style="background:var(--surface);border:none;border-radius:10px;padding:6px 12px;font-size:11px;color:var(--ink-soft);cursor:pointer;font-family:inherit">'+_t('חזרה')+'</button>';
  h+='</div>';
  /* 1. starting a workout */`, `  var h='<div style="padding-bottom:24px">';
  /* 1. starting a workout - the header already names the screen */`);

/* the programs card */
rep(`  h+='<button onclick="genProgOpen()" style="background:var(--violet-100);border:none;border-radius:10px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer;color:var(--violet-700);font-family:inherit">'+_t('בנה לי תוכנית')+'</button>';
  h+='<button onclick="startProgramWizard()" style="background:var(--cta-fill);border:none;border-radius:10px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer;color:var(--white);font-family:inherit">'+_t('+ תוכנית')+'</button>';`,
`  h+='<button class="fs-pill" onclick="genProgOpen()">'+_t('בנה לי תוכנית')+'</button>';
  h+='<button class="fs-pill" onclick="startProgramWizard()">'+_t('+ תוכנית')+'</button>';`);
rep(`    h+='<div style="background:var(--panel);border-radius:14px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px">';
    h+='<div style="flex:1"><div style="font-size:14px;font-weight:700;color:var(--ink)">'+esc(progLabel(prog.name))+'</div>';
    h+='<div style="font-size:10px;color:var(--muted);margin-top:2px">'+_t('{n} תרגילים',{n:prog.exercises.length})+'</div></div>';
    h+='<button onclick="_fitView=\\'view-program\\';_fitProgIdx='+pi+';renderFitness()" style="background:var(--cta-fill);border:none;border-radius:9px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;color:var(--white);font-family:inherit">'+_t('עקב')+'</button>';
    h+='<button onclick="_fitView=\\'edit-program\\';_fitProgIdx='+pi+';renderFitness()" style="background:var(--violet-100);border:none;border-radius:9px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer;color:var(--violet-700);font-family:inherit">'+_t('ערוך')+'</button>';
    h+='</div>';`,
`    h+='<div class="fs-row"><button class="fs-go" onclick="_fitView=\\'view-program\\';_fitProgIdx='+pi+';renderFitness()">'+
       '<b>'+esc(progLabel(prog.name))+'</b><span>'+_t('{n} תרגילים',{n:prog.exercises.length})+'</span></button>'+
       '<button class="fs-ed" onclick="_fitView=\\'edit-program\\';_fitProgIdx='+pi+';renderFitness()">'+_t('ערוך')+'</button></div>';`);

/* the material */
rep(`.tg-join{`, `/* ── אימון חדש, in the material (24 Oct) ── */
.fs-card{background:var(--nu-ground);border-radius:22px;padding:16px;margin-bottom:12px;box-shadow:-4px -4px 9px var(--nu-lit),5px 6px 13px var(--nu-shade-soft)}
.fs-new{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;border:none;border-radius:18px;padding:16px;background:var(--nu-ground);
  font-family:inherit;font-size:16px;font-weight:800;color:var(--nu-ink);cursor:pointer;
  box-shadow:-5px -5px 13px var(--nu-lit),7px 9px 20px var(--nu-shade),inset 0 -3px 0 color-mix(in srgb,var(--terra-500) 60%,transparent)}
.fs-new span{font-size:20px;line-height:1;color:var(--terra-700)}
.fs-new:active,.fs-go:active,.fs-play:active{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.fs-lab{font-size:11px;color:var(--nu-muted);letter-spacing:.06em;font-weight:800;margin:18px 4px 10px}
.fs-row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.fs-go{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:2px;border:none;border-radius:16px;padding:12px 14px;background:var(--nu-ground);
  font-family:inherit;text-align:start;cursor:pointer;box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
.fs-go b{font-size:15px;font-weight:800;color:var(--nu-ink)}
.fs-go span{font-size:12px;font-weight:600;color:var(--nu-muted)}
.fs-ed{border:none;background:none;font-family:inherit;font-size:13px;font-weight:700;color:var(--nu-muted);padding:10px 6px;cursor:pointer}
.fs-play{flex:0 0 46px;height:46px;border:none;border-radius:50%;background:var(--nu-ground);color:var(--terra-700);display:flex;align-items:center;justify-content:center;cursor:pointer;
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
.fs-play svg{width:18px;height:18px;fill:currentColor;margin-inline-start:2px}
.fs-empty{text-align:center;padding:16px 6px 6px;font-size:13px;color:var(--nu-muted);line-height:1.6}
.fs-plan{width:100%;border:none;border-radius:14px;padding:12px;margin-top:6px;background:none;font-family:inherit;font-size:13px;font-weight:700;color:var(--nu-muted);cursor:pointer;
  box-shadow:inset 2px 3px 6px var(--nu-shade-soft),inset -2px -2px 5px var(--nu-lit)}
.fs-pill{border:none;border-radius:999px;padding:7px 13px;background:var(--nu-ground);font-family:inherit;font-size:12px;font-weight:800;color:var(--nu-ink);cursor:pointer;
  box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.tg-join{`);
fs.writeFileSync(F, s);
console.log('patched');
