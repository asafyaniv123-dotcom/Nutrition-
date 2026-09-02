/* Fills in the serving size for the Open Food Facts products already in
 * data/foods.off.json that came in without one.
 *
 *   node tools/backfill-servings.mjs
 *
 * Why this exists: the fast search endpoint hands over the whole country but
 * returns no serving size, and the legacy endpoint that does return one gives
 * up after about 500 products. So 96% of the tables had no idea what one of
 * anything weighs, and the app fell back to 100g - which is why a 350ml
 * protein shake reported 7.2g of protein instead of the 25 on the bottle.
 *
 * The per-product v2 endpoint does return it, and we already hold every
 * barcode, so this walks the list and asks one at a time. Politely: OFF allow
 * 100 product queries a minute and this stays under that. It writes after
 * every batch, so stopping it half way keeps what it has, and running it again
 * carries on from there.
 */
import fs from 'fs';

const OUT='data/foods.off.json';
const UA='BetterMe/0.1 (personal nutrition prototype)';
const GAP=800;                       // ms between requests: 75/min, under their 100
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const num=v=>{const n=parseFloat(v);return isFinite(n)?n:null;};

const file=JSON.parse(fs.readFileSync(OUT,'utf8'));
const foods=file.foods||[];
const todo=foods.filter(f=>!f.u&&/^off:/.test(f.id));
console.log(foods.length+' products, '+todo.length+' without a serving size');

/* The same reading as the importer: a declared serving first, and failing
   that the package itself when it is plainly one sitting. */
function servingOf(p){
  const m=String(p.serving_size||'').match(/([\d.]+)\s*(ml|מ"ל|מל|g|gr|גרם|ג)\b/i);
  if(m){const g=Math.round(parseFloat(m[1]));if(g>0&&g<2000)return g;}
  const q=num(p.product_quantity);
  if(q&&q>=20&&q<=1000)return Math.round(q);
  return 0;
}

let done=0,found=0,failed=0;
for(const f of todo){
  const code=f.id.slice(4);
  let p=null;
  try{
    const r=await fetch('https://world.openfoodfacts.org/api/v2/product/'+code+
      '.json?fields=code,serving_size,product_quantity',{headers:{'User-Agent':UA}});
    const t=await r.text();
    if(t[0]==='{'){const j=JSON.parse(t);p=j.product||null;}
  }catch(e){}
  if(p){
    const u=servingOf(p);
    if(u){f.u=u;found++;}
  } else failed++;
  done++;
  if(done%25===0){
    file.foods=foods;
    fs.writeFileSync(OUT,JSON.stringify(file));
    process.stdout.write('\r'+done+'/'+todo.length+'  found '+found+'  unreachable '+failed+'   ');
  }
  await sleep(GAP);
}
file.foods=foods;
file.fetched=new Date().toISOString().slice(0,10);
fs.writeFileSync(OUT,JSON.stringify(file));
const withU=foods.filter(f=>f.u).length;
console.log('\ndone. serving size known for '+withU+' of '+foods.length+
            ' ('+Math.round(withU/foods.length*100)+'%)');
