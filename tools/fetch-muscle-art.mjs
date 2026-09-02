/* Downloads the muscle diagrams for the exercise picker.
 *
 *   node tools/fetch-muscle-art.mjs
 *
 * wger (CC-BY-SA 3.0) draws the muscular system once for the front and once
 * for the back, and then one small overlay per muscle marking where it sits.
 * Stacking an overlay on the right body is a picture of that muscle
 * highlighted - the thing Hevy shows beside each group name.
 *
 * The two bodies are large (321KB and 404KB) and every overlay is about 3KB,
 * which is the right way round: the expensive part is fetched once and cached,
 * and choosing a muscle costs three kilobytes.
 *
 * ATTRIBUTION: CC-BY-SA 3.0. The picker credits wger under the grid.
 */
import fs from 'fs';

const BASE='https://wger.de';
const ART='assets/mu';
const UA='BetterMe/0.1';

/* Our muscle names against wger's ids, and which body each one is drawn on.
   Two of ours have no equivalent there - a lower back and a plain "back" that
   means the whole of it - so they borrow the closest diagram rather than
   showing nothing: lats for the back, and the trapezius sheet reaches far
   enough down to read as a lower back. Cardio has no muscle to point at. */
const MAP=[
  ['חזה',4,'front'], ['גב רחב',12,'back'], ['גב',12,'back'],
  ['טרפז',9,'back'], ['גב תחתון',9,'back'],
  ['כתפיים',2,'front'], ['יד קדמית',1,'front'], ['יד אחורית',5,'back'],
  ['אמה',13,'front'], ['ארבע ראשי',10,'front'], ['ירך אחורית',11,'back'],
  ['ישבן',8,'back'], ['תאומים',7,'back'], ['בטן',6,'front'],
  ['אלכסונים',14,'front']
];

fs.mkdirSync(ART,{recursive:true});

async function get(url){
  const r=await fetch(url,{headers:{'User-Agent':UA}});
  if(!r.ok)throw new Error(url+' -> '+r.status);
  return await r.text();
}

// the two bodies, shared by everything
for(const side of ['front','back']){
  const svg=await get(BASE+'/static/images/muscles/muscular_system_'+side+'.svg');
  fs.writeFileSync(ART+'/body-'+side+'.svg',svg);
  console.log('body-'+side+'.svg  '+Math.round(svg.length/1024)+'KB');
}

// and one overlay per muscle we actually offer
const api=await (await fetch(BASE+'/api/v2/muscle/?limit=30&format=json',{headers:{'User-Agent':UA}})).json();
const byId=new Map(api.results.map(m=>[m.id,m]));
const out={};
const done=new Set();
for(const [he,id,side] of MAP){
  /* The API hands back a cache-busted filename that 404s - muscle-4.e1e12
     05a3202.svg is gone, muscle-4.svg is there. So the id builds the path
     rather than trusting the URL it reports. */
  const m=byId.get(id);
  if(!m){console.log('no diagram for '+he);continue;}
  const file='m'+id+'.svg';
  if(!done.has(file)){
    try{
      const svg=await get(BASE+'/static/images/muscles/main/muscle-'+id+'.svg');
      fs.writeFileSync(ART+'/'+file,svg);
      done.add(file);
    }catch(e){console.log(he+': '+e.message);continue;}
  }
  out[he]={f:file,s:side};
}
fs.writeFileSync(ART+'/map.json',JSON.stringify(out));
const bytes=fs.readdirSync(ART).reduce((a,f)=>a+fs.statSync(ART+'/'+f).size,0);
console.log('');
console.log('muscles with a diagram: '+Object.keys(out).length+' of '+MAP.length);
console.log(ART+': '+fs.readdirSync(ART).length+' files, '+Math.round(bytes/1024)+'KB');
