/* "Most of the time normal eyes - the smiles are the meaningful moments of
 * the day" (Asaf, 21 Oct). Measured cause: the kit REPLAYS a script when its
 * dur runs out, and nearly every script here began with 'happy' - the corner
 * held a smile for good, glad restarted its smile every 6s, calm nodded every
 * 3s. Now every script plays once (dur 1e9), a smile is a moment, and every
 * one settles on 'calm' - his ordinary eyes. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };

rep(`/* his small reactions, from the kit's own faces and motions - no new art */
var DOOR_BEEM={
  smile:{dur:12000,ev:[[0,'face','happy'],[0,'mode',{breathe:[.018,4],idle:0}],[2600,'nod',1,6],
    [4200,'fx',{t:'rings',v:{sc:[1.08,1.11,1.14]},d:3200,s:120}],[7600,'fx',{t:'rings',v:{sc:1},d:2600,s:120}],
    [9000,'face','wink'],[9450,'face','happy']]},
  listen:{dur:4000,ev:[[0,'face','curious'],[0,'mode',{breathe:[.016,4],idle:0}],[200,'look',0,-6]]},
  think:{dur:4000,ev:[[0,'face','thinking'],[0,'mode',{breathe:[.016,4],idle:0}]]},
  nod:{dur:2600,ev:[[0,'face','happy'],[0,'mode',{breathe:[.018,4],idle:0}],[100,'nod',1,7]]},
  calm:{dur:3000,ev:[[0,'face','calm'],[0,'mode',{breathe:[.016,4],idle:0}],[100,'nod',1,4]]},
  beam:{dur:2400,ev:[[0,'face','happy'],[0,'mode',{breathe:[.02,4],idle:0}],[60,'nod',1,12],[420,'face','wink'],[760,'face','happy'],
    [300,'fx',{t:'rings',v:{sc:[1.12,1.16,1.2]},d:900,s:80}]]},
  glad:{dur:6000,ev:[[0,'face','happy'],[0,'mode',{breathe:[.018,4],idle:0}],[150,'nod',1,10],[1100,'face','wink'],[1500,'face','happy'],
    [1700,'fx',{t:'rings',v:{sc:[1.1,1.13,1.16]},d:1600,s:100}],[3400,'fx',{t:'rings',v:{sc:1},d:1600,s:100}]]}
};`, `/* his small reactions, from the kit's own faces and motions - no new art.
   EVERY ONE PLAYS ONCE AND SETTLES ON 'calm', his ordinary eyes. The kit
   replays a script when its dur runs out, and these used to begin with a
   smile on a 3-12s loop, so he smiled all day; Asaf asked for the smile to be
   kept for the moments that mean something. */
var DOOR_BEEM={
  /* meeting him for the first time: that is a moment */
  smile:{dur:1e9,ev:[[0,'face','happy'],[0,'mode',{breathe:[.018,4],idle:0}],[2600,'nod',1,6],
    [4200,'fx',{t:'rings',v:{sc:[1.08,1.11,1.14]},d:3200,s:120}],[7600,'fx',{t:'rings',v:{sc:1},d:2600,s:120}],
    [9000,'face','wink'],[9450,'face','happy'],[10600,'face','calm']]},
  listen:{dur:1e9,ev:[[0,'face','curious'],[0,'mode',{breathe:[.016,4],idle:0}],[200,'look',0,-6]]},
  think:{dur:1e9,ev:[[0,'face','thinking'],[0,'mode',{breathe:[.016,4],idle:0}]]},
  /* an acknowledgement, not a celebration: a nod with his ordinary eyes */
  nod:{dur:1e9,ev:[[0,'face','calm'],[0,'mode',{breathe:[.018,4],idle:0}],[100,'nod',1,7]]},
  calm:{dur:1e9,ev:[[0,'face','calm'],[0,'mode',{breathe:[.016,4],idle:0}],[100,'nod',1,4]]},
  beam:{dur:1e9,ev:[[0,'face','happy'],[0,'mode',{breathe:[.02,4],idle:0}],[60,'nod',1,12],[420,'face','wink'],[760,'face','happy'],
    [300,'fx',{t:'rings',v:{sc:[1.12,1.16,1.2]},d:900,s:80}],[2200,'face','calm']]},
  glad:{dur:1e9,ev:[[0,'face','happy'],[0,'mode',{breathe:[.018,4],idle:0}],[150,'nod',1,10],[1100,'face','wink'],[1500,'face','happy'],
    [1700,'fx',{t:'rings',v:{sc:[1.1,1.13,1.16]},d:1600,s:100}],[3400,'fx',{t:'rings',v:{sc:1},d:1600,s:100}],[2600,'face','calm']]}
};`);

/* the corner: ordinary eyes, all day */
rep(`var BEEM_SUN_IDLE={dur:9000,ev:[[0,'face','happy'],[0,'mode',{breathe:[.016,4],idle:0}]]};`,
    `var BEEM_SUN_IDLE={dur:1e9,ev:[[0,'face','calm'],[0,'mode',{breathe:[.016,4],idle:0}]]};`);

/* the summary's home on a finished past day: the kit's 'counted' hops with a
   smile every six seconds - here it is glad once, then calm */
rep(`  beemMount(document.getElementById('rf-beem'),_bNight?{play:'moon'}:{play:_bDone?'counted':'invite',glow:_bN});   // i18n-exempt: kit script names`,
    `  beemMount(document.getElementById('rf-beem'),_bNight?{play:'moon'}:_bDone?{play:BEEM_COUNTED_ONCE,glow:_bN}:{play:'invite',glow:_bN});   // i18n-exempt: kit script names`);
rep(`var BEEM_SUN_WAKE=`, `var BEEM_COUNTED_ONCE={dur:1e9,ev:[[0,'face','content'],[0,'mode',{breathe:[.014,3.6],idle:0}],
  [1400,'face','happy'],[1450,'hop',30],[1450,'burst',.7],[2600,'face','calm']]};
var BEEM_SUN_WAKE=`);
fs.writeFileSync(F, s);
console.log('patched');
