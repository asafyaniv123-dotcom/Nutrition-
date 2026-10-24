/* Two from the phone (Asaf, 24 Oct):
 *  1. the confirm "shines too much" - every askConfirm in the app gets the
 *     quiet treatment the fitness sheets have: a light scrim, no blur, a plain
 *     shadow instead of the white halo.
 *  2. the "new workout" sheet also offers the three ways to plan ahead from
 *     "+ new program", under their own heading. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`.cf-ov{position:fixed;inset:0;z-index:950;display:flex;align-items:center;justify-content:center;
  padding:24px;background:rgba(74,67,64,.45);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}`,
`.cf-ov{position:fixed;inset:0;z-index:950;display:flex;align-items:center;justify-content:center;
  padding:24px;background:rgba(74,67,64,.22)}`);
rep(`  box-shadow:-6px -6px 16px var(--nu-lit),8px 10px 26px rgba(120,110,98,.35)}
.cf-q{`, `  box-shadow:0 14px 34px rgba(74,67,64,.18)}
.cf-q{`);
rep(`ואיזה ציוד'))+'</span></button>';
  h+='</div><button class="cf-no"`, `ואיזה ציוד'))+'</span></button>';
  /* and the ways to plan ahead, the same three as "+ new program" */
  h+='</div><div class="fss-g">'+esc(_t('לתכנן מראש'))+'</div><div class="fss-l">';
  h+='<button onclick="fitSheetClose();startFitEdit(-1)"><b>'+esc(_t('בנה אימון מראש'))+'</b></button>'+
     '<button onclick="fitSheetClose();genProgOpen()"><b>'+esc(_t('בנה לי תוכנית'))+'</b></button>'+
     '<button onclick="fitSheetClose();startProgramWizard()"><b>'+esc(_t('הוסף תוכנית מחדר כושר'))+'</b></button>';
  h+='</div><button class="cf-no"`);
rep(`.fss-l{display:flex;`, `.fss-g{font-size:12.5px;font-weight:800;color:var(--nu-muted);margin:14px 4px 8px;text-align:start}
.fss-l{display:flex;`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
const A = { en: 'Plan ahead', de: 'Vorausplanen', es: 'Planificar', fr: 'Planifier à l’avance', it: 'Pianificare in anticipo', pt: 'Planejar com antecedência',
  ja: '前もって計画する', 'zh-Hans': '提前计划', 'zh-Hant': '提前計畫', ar: 'خطّط مسبقًا' };
for (const [l, v] of Object.entries(A)) { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8')); d['לתכנן מראש'] = v; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); }
console.log('ok');
