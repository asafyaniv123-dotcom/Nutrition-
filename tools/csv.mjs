import fs from 'fs';
const Q=String.fromCharCode(34);
export function parseCSV(text){
  const rows=[];let row=[],cur='',q=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(q){ if(ch===Q){ if(text[i+1]===Q){cur+=Q;i++;} else q=false; } else cur+=ch; }
    else if(ch===Q){ q=true; }
    else if(ch===','){ row.push(cur);cur=''; }
    else if(ch==='\n'){ row.push(cur);rows.push(row);row=[];cur=''; }
    else if(ch!=='\r'){ cur+=ch; }
  }
  if(cur!==''||row.length){row.push(cur);rows.push(row);}
  return rows;
}
export function readFoods(){
  const rows=parseCSV(fs.readFileSync('data/moh_mitzrachim.csv','utf8').replace(/^\uFEFF/,''));
  return {hdr:rows[0],rows:rows.slice(1)};
}
