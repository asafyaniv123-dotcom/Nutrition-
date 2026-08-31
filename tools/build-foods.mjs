import fs from 'fs';
import {readFoods} from './csv.mjs';

/* Turns the ministry's 85-column table into the four numbers the app tracks.
   Every value in the source is already per 100 g, which is the whole reason
   this file was chosen - no unit conversion, nothing to get wrong. */
const {hdr,rows}=readFoods();
const ix=n=>{const i=hdr.indexOf(n);if(i<0)throw new Error('missing column: '+n);return i;};
const C={code:ix('Code'),name:ix('shmmitzrach'),p:ix('protein'),f:ix('total_fat'),
         c:ix('carbohydrates'),k:ix('food_energy')};

const num=v=>{const n=parseFloat(v);return isFinite(n)?n:null;};
const r1=n=>Math.round(n*10)/10;

const out=[];const dropped={shape:0,missing:0,noName:0,dupe:0};
const seen=Object.create(null);
for(const r of rows){
  if(r.length!==hdr.length){dropped.shape++;continue;}
  const name=String(r[C.name]||'').replace(/\s+/g,' ').trim();
  if(!name){dropped.noName++;continue;}
  const k=num(r[C.k]),p=num(r[C.p]),c=num(r[C.c]),f=num(r[C.f]);
  if(k===null||p===null||c===null||f===null){dropped.missing++;continue;}
  const id=String(r[C.code]).trim();
  if(seen[id]){dropped.dupe++;continue;}
  seen[id]=1;
  out.push({id:id,n:name,k:Math.round(k),p:r1(p),c:r1(c),f:r1(f)});
}
out.sort((a,b)=>a.n.localeCompare(b.n,'he'));

const doc={
  source:'מאגר התזונה הלאומי הישראלי, משרד הבריאות',
  url:'https://data.gov.il/he/datasets/ministry-health/nutrition-database',
  file:'moh_mitzrachim.csv',
  updated:'2022-10-26',
  basis:'100g',
  fields:{id:'Code',n:'shmmitzrach',k:'food_energy kcal',p:'protein g',c:'carbohydrates g',f:'total_fat g'},
  foods:out
};
fs.writeFileSync('data/foods.json',JSON.stringify(doc));
console.log('kept '+out.length+' foods');
console.log('dropped: '+JSON.stringify(dropped));
console.log('foods.json: '+fs.statSync('data/foods.json').size+' bytes');
