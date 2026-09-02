/* Pairs our exercises with Everkinetic's drawings and vendors the files.
 *
 *   node tools/fetch-exercise-art.mjs         # show the matches, change nothing
 *   node tools/fetch-exercise-art.mjs --go    # download them
 *
 * Everkinetic (github.com/everkinetic/data, CC-BY-SA 4.0) draws every exercise
 * twice - the relaxed position and the tensed one. Alternating the two is an
 * animation of the movement, which is the thing a GIF in Hevy is doing. They
 * are SVG, so about 22KB each and sharp at any size.
 *
 * The matching is the whole difficulty. Their names are long and inconsistent
 * - "Biceps Curls with Barbell", "Wide Grip Lat Pull Down" - so an exact match
 * finds half of them. This scores by shared words with the equipment as a
 * tie-breaker, and refuses anything it is not sure of: a picture of the wrong
 * exercise is worse than no picture, because you would follow it.
 *
 * ATTRIBUTION: CC-BY-SA 4.0 requires crediting Everkinetic wherever these are
 * shown, and share-alike on anything derived from them. The app credits them
 * under each drawing. Worth settling properly before the App Store.
 */
import fs from 'fs';
import path from 'path';

const SRC='https://raw.githubusercontent.com/everkinetic/data/main';
const OURS='data/exercises.json';
const ART='assets/ex';
const GO=process.argv.includes('--go');

const STOP=new Set(['with','the','a','and','on','in','of','to','your','using']);
/* Words that make it a different exercise rather than the same one described
   at more length. Meeting one of these in their name and not in ours is
   nearly always the end of the match. */
const MOD=new Set(['decline','incline','rear','side','front','lying','seated','standing','kneeling','alternating','alternate','hammer','drag','reverse','close','wide','narrow','single','one','arm','calves','calf','smith','machine','cable','barbell','dumbbell','band','preacher','concentration','overhead','sumo','romanian','bulgarian','walking','jump','partial','assisted','negative','isometric','static']);
const words=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ')
  .filter(w=>w.length>2&&!STOP.has(w));

/* Their equipment words against ours, so a barbell row does not get matched to
   a cable one when both say "row". */
const EQ={'מוט':['barbell','smith'],'משקולות יד':['dumbbell'],'פולי':['cable'],
  'מכונה':['machine'],'משקל גוף':['bodyweight','body'],'מתח':['pull','chin'],
  'קטלבל':['kettlebell'],'ספסל':['bench'],'גומייה':['band'],'מזרן':['mat','floor'],
  'כדור פיזיו':['ball','stability'],'מכשיר אירובי':['treadmill','bike','rowing']};

const ours=JSON.parse(fs.readFileSync(OURS,'utf8'));
const ek=await (await fetch(SRC+'/exercises.json')).json();

function score(o,e){
  if(!o.en)return 0;
  const a=words(o.en), b=words(e.title||e.name);
  if(!a.length||!b.length)return 0;
  /* Every word of ours has to be there - sharing three words out of four is
     not a near match when the missing one names the movement. Except the kit:
     we call it Barbell Bench Press and they call it Bench Press, and the
     equipment field already says which bar it is. Requiring the word too
     threw away the plainest match in the set. */
  const KIT=new Set([].concat(...Object.values(EQ)));
  const need=a.filter(w=>!KIT.has(w));
  if(!need.length)return 0;
  let shared=0;
  for(const w of need)if(b.indexOf(w)>=0)shared++;
  if(shared<need.length)return 0;
  let s=100;
  /* And a word of theirs that we did not ask for is the thing that changes
     what the exercise IS. Decline is not flat, rear is not lateral, side is
     not front, hammer is not a curl, calves are not legs. Scoring on shared
     words alone matched a deadlift to a one-arm side deadlift and a leg press
     to a calf press - both perfectly reasonable by word overlap and both a
     picture of something you were not doing. */
  for(const w of b)if(a.indexOf(w)<0&&!KIT.has(w))s-=MOD.has(w)?60:9;
  // the equipment has to agree where we know it
  for(const q of o.q){
    const want=EQ[q];
    if(!want)continue;
    if(want.some(w=>b.indexOf(w)>=0))s+=18;
  }
  // a name of theirs mentioning kit we did not ask for is probably another move
  for(const q in EQ){
    if(o.q.indexOf(q)>=0)continue;
    if(EQ[q].some(w=>b.indexOf(w)>=0))s-=45;
  }
  return s;
}

const pairs=[],unmatched=[];
for(const o of ours.exercises){
  let best=null,bestS=0;
  for(const e of ek){
    if(!(e.img||[]).length)continue;
    const s=score(o,e);
    if(s>bestS){bestS=s;best=e;}
  }
  // 85 keeps only matches where essentially every word of ours was found and
  // the equipment agreed. Below that it is a guess, and a guess here is a
  // picture of a different exercise.
  if(best&&bestS>=85)pairs.push({o,e:best,s:Math.round(bestS)});
  else unmatched.push(o.n+(o.en?'  ['+o.en+']':''));
}

/* One drawing standing in for several of our exercises is the tell that the
   match is loose rather than right - Body Row came up as the best answer for
   the barbell row, the dumbbell row and the machine row at once, and it is
   none of them. The best claim keeps it and the rest go without. */
const claimed=new Map();
for(const p of pairs){
  const k=p.e.id_num||p.e.id;
  const had=claimed.get(k);
  if(!had||p.s>had.s)claimed.set(k,p);
}
const dropped=pairs.filter(p=>claimed.get(p.e.id_num||p.e.id)!==p);
const kept=pairs.filter(p=>claimed.get(p.e.id_num||p.e.id)===p);
pairs.length=0;pairs.push(...kept);
for(const d of dropped)unmatched.push(d.o.n+"  [drawing already used for something closer]");
console.log("matched "+pairs.length+" of "+ours.exercises.length+"   ("+dropped.length+" dropped as duplicates)");
console.log('');
pairs.slice(0,60).forEach(p=>console.log('  '+p.s+'  '+p.o.n+'  <-  '+(p.e.title||p.e.name)));
console.log('');
console.log('no drawing for '+unmatched.length+':');
console.log('  '+unmatched.join('\n  '));

if(!GO){console.log('\n(nothing downloaded - run with --go)');process.exit(0);}

fs.mkdirSync(ART,{recursive:true});
let got=0,failed=0;
for(const p of pairs){
  // src/exercises/0042/0042-relaxation.svg
  const id=String(p.e.id_num||p.e.id).padStart(4,'0');
  const out=[];
  for(const kind of ['relaxation','tension']){
    const url=SRC+'/src/exercises/'+id+'/'+id+'-'+kind+'.svg';
    try{
      const r=await fetch(url);
      if(!r.ok)throw new Error(r.status);
      const svg=await r.text();
      if(svg.indexOf('<svg')<0)throw new Error('not an svg');
      const file=p.o.id+'-'+(kind==='relaxation'?'a':'b')+'.svg';
      fs.writeFileSync(path.join(ART,file),svg);
      out.push(file);
    }catch(e){}
  }
  if(out.length===2){p.o.art=1;got++;} else failed++;
  process.stdout.write('\r'+(got+failed)+'/'+pairs.length+'  kept '+got+'   ');
}
ours.art={source:'Everkinetic',licence:'CC-BY-SA 4.0',url:'https://github.com/everkinetic/data'};
fs.writeFileSync(OURS,JSON.stringify(ours));
const bytes=fs.readdirSync(ART).reduce((a,f)=>a+fs.statSync(path.join(ART,f)).size,0);
console.log('\ndrawings for '+got+' exercises, '+failed+' could not be fetched');
console.log(ART+': '+fs.readdirSync(ART).length+' files, '+Math.round(bytes/1024)+'KB');
