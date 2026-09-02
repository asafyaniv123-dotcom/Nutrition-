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
/* 800ms was too fast: they answered 429 after about seventy-five products.
   So it starts slower, and rather than counting a refusal as a missing product
   it waits and asks that same one again - a 429 says "not yet", not "no such
   thing", and treating the two alike is how the first run recorded dozens of
   products as unreachable that were nothing of the kind.

   The gap widens on every refusal and creeps back down after a clean run, so
   it settles at whatever pace they are willing to answer at today. */
let GAP=2500;
const GAP_MIN=1500, GAP_MAX=30000;
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

/* One product. Returns the product, 'wait' if they asked us to slow down, or
   null if there is genuinely nothing there. */
async function ask(code){
  try{
    const r=await fetch('https://world.openfoodfacts.org/api/v2/product/'+code+
      '.json?fields=code,serving_size,product_quantity',{headers:{'User-Agent':UA}});
    if(r.status===429||r.status===503)return 'wait';
    const t=await r.text();
    if(t[0]!=='{')return 'wait';       // an HTML error page is also them saying no
    const j=JSON.parse(t);
    return j.product||null;
  }catch(e){return 'wait';}
}

let done=0,found=0,missing=0,waits=0;
const started=Date.now();
for(const f of todo){
  const code=f.id.slice(4);
  let p='wait',tries=0;
  while(p==='wait'&&tries<6){
    if(tries){GAP=Math.min(GAP_MAX,Math.round(GAP*1.8));waits++;await sleep(GAP);}
    p=await ask(code);
    tries++;
  }
  if(p==='wait'){
    // six refusals in a row: they mean it. Leave the rest for another day.
    console.log('\nstill being refused after backing off to '+GAP+'ms - stopping here.');
    break;
  }
  if(p){const u=servingOf(p);if(u){f.u=u;found++;}else missing++;}
  else missing++;
  GAP=Math.max(GAP_MIN,Math.round(GAP*0.97));   // creep back down while it is going well
  done++;
  if(done%25===0){
    file.foods=foods;
    fs.writeFileSync(OUT,JSON.stringify(file));
    const per=(Date.now()-started)/done;
    const left=Math.round((todo.length-done)*per/60000);
    process.stdout.write('\r'+done+'/'+todo.length+'  found '+found+
      '  none declared '+missing+'  gap '+GAP+'ms  ~'+left+'min left    ');
  }
  await sleep(GAP);
}
file.foods=foods;
file.fetched=new Date().toISOString().slice(0,10);
fs.writeFileSync(OUT,JSON.stringify(file));
const withU=foods.filter(f=>f.u).length;
console.log('\ndone. serving size known for '+withU+' of '+foods.length+
            ' ('+Math.round(withU/foods.length*100)+'%)');
