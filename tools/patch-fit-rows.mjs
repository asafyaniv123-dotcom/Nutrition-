/* My programs (Asaf, 24 Oct): every row the same - name, count, ⋯, ▶ - and a
 * way to delete. ⋯ opens edit / delete, as a saved timer's ⋯ does. A program
 * from a gym had no ▶, so nothing said that a tap starts it. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`         '<button class="fs-ed" onclick="startFitEdit('+i+')">'+_t('ערוך')+'</button>'+
         '<button class="fs-play" onclick="startWorkout('+i+')" aria-label="'+esc(_t('התחל'))+'">'+`,
`         '<button class="fs-ed" onclick="fitRowMenu(\\'t\\','+i+')" aria-label="'+esc(_t('אפשרויות|שעון'))+'">&#8943;</button>'+
         '<button class="fs-play" onclick="startWorkout('+i+')" aria-label="'+esc(_t('התחל'))+'">'+`);
rep(`         '<button class="fs-ed" onclick="_fitView=\\'edit-program\\';_fitProgIdx='+pi+';renderFitness()">'+_t('ערוך')+'</button></div>';`,
`         '<button class="fs-ed" onclick="fitRowMenu(\\'p\\','+pi+')" aria-label="'+esc(_t('אפשרויות|שעון'))+'">&#8943;</button>'+
         '<button class="fs-play" onclick="fitProgStart('+pi+')" aria-label="'+esc(_t('התחל'))+'">'+
         '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5Z"/></svg></button></div>';`);
rep(`/* the one "+": which kind of new */`, `/* ⋯ on a row: edit, or delete after asking */
function fitRowMenu(kind,i){
  var nm=kind==='t'?(loadTemplates()[i]||{}).name:progLabel((loadPrograms()[i]||{}).name||'');
  fitSheetClose();
  var ov=document.createElement('div');ov.className='cf-ov fss-ov';ov.id='fss-ov';
  ov.innerHTML='<div class="cf-card fss"><div class="cf-q" style="margin-bottom:12px">'+esc(nm||'')+'</div><div class="tm-sv-col">'+
    '<button class="cf-yes" id="fr-ed">'+esc(_t('ערוך'))+'</button>'+
    '<button class="cf-no tm-sv-del" id="fr-del">'+esc(_t('מחק'))+'</button>'+
    '<button class="cf-no" onclick="fitSheetClose()">'+esc(_t('ביטול'))+'</button></div></div>';
  document.body.appendChild(ov);ov.onclick=function(e){if(e.target===ov)fitSheetClose();};
  document.getElementById('fr-ed').onclick=function(){
    fitSheetClose();
    if(kind==='t')startFitEdit(i);else{_fitView='edit-program';_fitProgIdx=i;renderFitness();}
  };
  document.getElementById('fr-del').onclick=function(){
    fitSheetClose();
    askConfirm(_t('למחוק את {name}? אי אפשר לבטל.',{name:nm||''}),_t('מחק'),function(){
      if(kind==='t'){var a=loadTemplates();a.splice(i,1);saveTemplates(a);}
      else{var b=loadPrograms();b.splice(i,1);savePrograms(b);}
      renderFitness();
    });
  };
}
/* the one "+": which kind of new */`);
rep(`.fs-ed{border:none;background:none;font-family:inherit;font-size:13px;font-weight:700;color:var(--nu-muted);padding:10px 6px;cursor:pointer}`,
    `.fs-ed{border:none;background:none;font-family:inherit;font-size:22px;font-weight:800;line-height:1;color:var(--nu-muted);padding:10px 6px;cursor:pointer}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
const K = 'למחוק את {name}? אי אפשר לבטל.';
const A = { en: 'Delete {name}? This cannot be undone.', de: '{name} löschen? Das lässt sich nicht rückgängig machen.', es: '¿Eliminar {name}? No se puede deshacer.',
  fr: 'Supprimer {name} ? C’est définitif.', it: 'Eliminare {name}? Non si può annullare.', pt: 'Excluir {name}? Não dá para desfazer.',
  ja: '{name}を削除しますか？元に戻せません。', 'zh-Hans': '删除{name}？此操作无法撤销。', 'zh-Hant': '刪除{name}？此操作無法復原。', ar: 'حذف {name}؟ لا يمكن التراجع.' };
for (const [l, v] of Object.entries(A)) { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8')); d[K] = v; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); }
console.log('ok');
